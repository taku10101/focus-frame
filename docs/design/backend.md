# データ・ストレージ詳細設計書

> 作成者: 安藤 拓海（バックエンドエンジニア）
> 最終更新: 2026-02-22

---

## 1. IndexedDB スキーマ設計（Dexie.js）

### 1.1 データベース定義

```typescript
// src/lib/db.ts
import Dexie, { type Table } from 'dexie';

export class FocusFrameDB extends Dexie {
  artworks!: Table<Artwork>;
  challenges!: Table<Challenge>;
  sessions!: Table<Session>;
  settings!: Table<UserSettings>;

  constructor() {
    super('FocusFrameDB');

    this.version(1).stores({
      artworks: 'id, artist, era, *genre',
      challenges: 'id, artworkId, status, startedAt',
      sessions: 'id, challengeId, completedAt',
      settings: 'key',
    });
  }
}

export const db = new FocusFrameDB();
```

### 1.2 テーブル定義

#### `artworks` — 作品マスターデータ

```typescript
interface Artwork {
  id: string;               // "artwork_starry-night"
  artist: string;            // "フィンセント・ファン・ゴッホ"
  artistEn: string;          // "Vincent van Gogh"
  genre: string[];           // ["風景", "印象派"]
  era: string;               // "印象派"
  title: string;             // "星月夜" — 完成まで非表示
  titleEn: string;           // "The Starry Night"
  imagePath: string;         // "/artworks/starry-night.webp"
  sourceUrl: string;         // Wikimedia Commons URL（出典）
  minGrid: number;           // 推奨最小マス数 (e.g. 5)
  year: number;              // 制作年 (e.g. 1889)
}
```

**インデックス:**
- `id` — Primary Key
- `artist` — 作者フィルタ用
- `era` — 時代フィルタ用
- `*genre` — MultiEntry インデックス（配列の各要素で検索可能）

#### `challenges` — チャレンジ進捗

```typescript
interface Challenge {
  id: string;                // crypto.randomUUID()
  artworkId: string;         // FK → artworks.id
  gridSize: number;          // 8 (= 8×8)
  revealedCells: number[];   // 開放済みセルのインデックス [0, 5, 23, ...]
  totalCells: number;        // gridSize * gridSize
  status: 'active' | 'completed' | 'abandoned';
  startedAt: number;         // Date.now()
  completedAt?: number;
  sessionCount: number;
}
```

> **設計判断:** `pixelGrid: PixelData[][]` をそのまま保存せず、`revealedCells: number[]`（1次元インデックス配列）に正規化。理由:
> - ピクセルの色データは画像から毎回再計算可能（Canvas API）
> - 保存データ量を大幅削減（N×N個の `{r,g,b,revealed}` → 開放済みインデックスのみ）
> - N+1になってませんか？ → この設計ならチャレンジ1件のfetchで完結

**インデックス:**
- `id` — Primary Key
- `artworkId` — 作品との紐付け
- `status` — アクティブなチャレンジの取得
- `startedAt` — ソート用

#### `sessions` — ポモドーロセッション履歴

```typescript
interface Session {
  id: string;                // crypto.randomUUID()
  challengeId: string;       // FK → challenges.id
  startedAt: number;         // Date.now()
  completedAt: number;
  duration: number;          // 秒 (通常1500 = 25分)
  cellIndex: number;         // 開放したセルの1次元インデックス
}
```

**インデックス:**
- `id` — Primary Key
- `challengeId` — チャレンジごとのセッション一覧
- `completedAt` — 時系列ソート・統計用

#### `settings` — ユーザー設定

```typescript
interface UserSettings {
  key: string;               // "user_settings" (シングルトン)
  timerDuration: number;     // 秒 (デフォルト: 1500)
  breakDuration: number;     // 秒 (デフォルト: 300)
  defaultGridSize: number;   // デフォルト: 8
  notificationEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

### 1.3 バージョニング戦略

Dexie.js の `version()` チェーンで管理:

```typescript
// 初期リリース
this.version(1).stores({
  artworks: 'id, artist, era, *genre',
  challenges: 'id, artworkId, status, startedAt',
  sessions: 'id, challengeId, completedAt',
  settings: 'key',
});

// v0.2: 統計機能追加時の例
this.version(2).stores({
  artworks: 'id, artist, era, *genre',
  challenges: 'id, artworkId, status, startedAt, completedAt',
  sessions: 'id, challengeId, completedAt, [completedAt+challengeId]',
  settings: 'key',
}).upgrade(tx => {
  // 既存データのマイグレーション（必要な場合）
  return tx.table('challenges').toCollection().modify(challenge => {
    if (challenge.status === undefined) {
      challenge.status = challenge.completedAt ? 'completed' : 'active';
    }
  });
});
```

**ルール:**
- バージョン番号は単調増加（飛ばさない）
- 破壊的変更は `upgrade()` コールバックでデータ移行
- テーブル削除は `stores` から除外するだけ（Dexieが処理）

---

## 2. データフロー

### 2.1 タイマー完了 → マス開放 → 保存

```
┌─────────────────────────────────────────────────────────────┐
│                    ユーザー操作                               │
│  [スタート] → Web Worker でカウントダウン開始                   │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Web Worker: タイマー完了                                     │
│  postMessage({ type: 'TIMER_COMPLETE' })                     │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  メインスレッド: onTimerComplete()                            │
│                                                              │
│  1. challenge = await db.challenges.get(activeChallengeId)   │
│  2. unrevealed = 全セル - challenge.revealedCells            │
│  3. cellIndex = unrevealed[random]                           │
│  4. challenge.revealedCells.push(cellIndex)                  │
│  5. challenge.sessionCount++                                 │
│                                                              │
│  if (revealedCells.length === totalCells) {                  │
│    challenge.status = 'completed'                            │
│    challenge.completedAt = Date.now()                        │
│  }                                                           │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  IndexedDB トランザクション（Dexie.js transaction）           │
│                                                              │
│  await db.transaction('rw', [db.challenges, db.sessions],    │
│    async () => {                                             │
│      await db.challenges.put(challenge);                     │
│      await db.sessions.add({                                 │
│        id: crypto.randomUUID(),                              │
│        challengeId: challenge.id,                            │
│        startedAt, completedAt: Date.now(),                   │
│        duration: 1500,                                       │
│        cellIndex                                             │
│      });                                                     │
│    }                                                         │
│  );                                                          │
└───────┬─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  UI更新                                                      │
│                                                              │
│  1. Canvas再描画 → 新セルの色をアニメーション表示               │
│  2. 進捗バー更新                                              │
│  3. if (completed) → リビール演出 + タイトル表示               │
│  4. Notification API で通知                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 作品選択 → チャレンジ開始

```
ユーザー: フィルタ選択（作者/ジャンル/時代）
  │
  ▼
db.artworks
  .where('artist').equals(selectedArtist)  // or
  .filter(a => a.genre.includes(selectedGenre))
  │
  ▼
候補作品からランダム1件を選択（タイトルは非表示）
  │
  ▼
Canvas API で画像を gridSize×gridSize にピクセル化
  │
  ▼
db.challenges.add({
  id: crypto.randomUUID(),
  artworkId: artwork.id,
  gridSize: 8,
  revealedCells: [],
  totalCells: 64,
  status: 'active',
  startedAt: Date.now(),
  sessionCount: 0,
})
```

### 2.3 アプリ起動時のデータ復元

```
アプリ起動
  │
  ▼
db.challenges.where('status').equals('active').first()
  │
  ├── 存在する → チャレンジ復元、Canvas再描画
  │
  └── 存在しない → 作品選択画面へ
```

---

## 3. 作品データ管理

### 3.1 画像バンドル方式

MVP では画像をビルド時に静的アセットとしてバンドル:

```
public/
  artworks/
    starry-night.webp      # 元画像（WebP, 最大500×500px）
    great-wave.webp
    girl-with-pearl.webp
    ...
```

**画像仕様:**
- 形式: WebP（高圧縮・広サポート）
- 最大サイズ: 500×500px（ドット絵変換には十分）
- 1枚あたり目安: 30-80KB
- MVP初期: 3〜5点 → 合計 150-400KB

**Service Worker によるプリキャッシュ:**
```typescript
// next.config.js (next-pwa)
// artworks/ ディレクトリは自動的にプリキャッシュ対象
```

### 3.2 メタデータ管理

作品メタデータは TypeScript の定数ファイルとして管理し、アプリ初回起動時に IndexedDB に投入:

```typescript
// src/data/artworks.ts
import type { Artwork } from '@/lib/db';

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'artwork_starry-night',
    artist: 'フィンセント・ファン・ゴッホ',
    artistEn: 'Vincent van Gogh',
    genre: ['風景', '印象派'],
    era: '印象派',
    title: '星月夜',
    titleEn: 'The Starry Night',
    imagePath: '/artworks/starry-night.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    minGrid: 5,
    year: 1889,
  },
  {
    id: 'artwork_great-wave',
    artist: '葛飾北斎',
    artistEn: 'Katsushika Hokusai',
    genre: ['浮世絵', '風景'],
    era: '江戸時代',
    title: '神奈川沖浪裏',
    titleEn: 'The Great Wave off Kanagawa',
    imagePath: '/artworks/great-wave.webp',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg',
    minGrid: 5,
    year: 1831,
  },
  // ... 他の作品
];
```

### 3.3 初期データ投入

```typescript
// src/lib/db.ts
db.on('populate', async () => {
  // 初回DB作成時に自動実行
  await db.artworks.bulkAdd(INITIAL_ARTWORKS);
  await db.settings.add({
    key: 'user_settings',
    timerDuration: 1500,
    breakDuration: 300,
    defaultGridSize: 8,
    notificationEnabled: true,
    theme: 'system',
  });
});
```

### 3.4 作品追加時のフロー

新しい作品を追加する場合:

1. `public/artworks/` に WebP 画像を追加
2. `src/data/artworks.ts` にメタデータを追記
3. Dexie の `version` を上げ、`upgrade()` で新作品を `bulkAdd`

```typescript
this.version(2).stores({ /* 同じスキーマ */ }).upgrade(async tx => {
  const newArtworks = INITIAL_ARTWORKS.filter(
    a => !await tx.table('artworks').get(a.id)
  );
  await tx.table('artworks').bulkAdd(newArtworks);
});
```

---

## 4. マイグレーション戦略

### 4.1 Dexie.js のマイグレーション機構

Dexie は `version(N).stores().upgrade()` チェーンでスキーマ変更を管理:

| 変更の種類 | 対応方法 |
|-----------|---------|
| インデックス追加 | `stores()` に追加するだけ |
| インデックス削除 | `stores()` から削除するだけ |
| テーブル追加 | `stores()` に追加 |
| テーブル削除 | `stores()` から除外 |
| カラム追加 | `upgrade()` でデフォルト値設定 |
| カラム型変更 | `upgrade()` でデータ変換 |
| データ移行 | `upgrade()` 内で全件更新 |

### 4.2 バージョン管理ルール

```typescript
// ❌ NG: 既存バージョンの変更
this.version(1).stores({ /* 変更してはいけない */ });

// ✅ OK: 新バージョンを追加
this.version(1).stores({ /* 元のまま */ });
this.version(2).stores({ /* 新しいスキーマ */ }).upgrade(tx => { /* 移行 */ });
```

### 4.3 マイグレーション失敗時のリカバリ

```typescript
db.open().catch(err => {
  if (err.name === 'UpgradeError') {
    // バージョン不整合: DBを削除して再作成
    console.error('DB upgrade failed, resetting...', err);
    return db.delete().then(() => db.open());
  }
  throw err;
});
```

### 4.4 テスト戦略

- マイグレーションは `fake-indexeddb` を使ったユニットテストで検証
- 各バージョンの `upgrade()` に対してテストケースを作成

---

## 5. 将来のクラウド同期設計（P1想定）

> RLSポリシー書きました？ — ここで書いておきます。

### 5.1 Supabase スキーマ

```sql
-- ユーザー（Supabase Auth）
-- auth.users テーブルを使用

-- 作品マスター（管理者のみ更新）
CREATE TABLE artworks (
  id TEXT PRIMARY KEY,
  artist TEXT NOT NULL,
  artist_en TEXT NOT NULL,
  genre TEXT[] NOT NULL,
  era TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  image_path TEXT NOT NULL,
  source_url TEXT NOT NULL,
  min_grid INTEGER NOT NULL DEFAULT 5,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- チャレンジ進捗
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL REFERENCES artworks(id),
  grid_size INTEGER NOT NULL,
  revealed_cells INTEGER[] NOT NULL DEFAULT '{}',
  total_cells INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  session_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- セッション履歴
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  cell_index INTEGER NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_challenges_user_status ON challenges(user_id, status);
CREATE INDEX idx_sessions_challenge ON sessions(challenge_id);
CREATE INDEX idx_sessions_user_completed ON sessions(user_id, completed_at);
```

### 5.2 RLS ポリシー

```sql
-- challenges: 自分のデータのみアクセス可
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own challenges"
  ON challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- sessions: 自分のデータのみアクセス可
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- artworks: 全ユーザー読み取り可、書き込みは管理者のみ
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read artworks"
  ON artworks FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify artworks"
  ON artworks FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 5.3 同期戦略

**方式: Last-Write-Wins (LWW) + 変更追跡**

IndexedDB 側に `syncMeta` テーブルを追加:

```typescript
// version N (P1導入時)
this.version(N).stores({
  // 既存テーブル + syncStatus カラム
  challenges: 'id, artworkId, status, startedAt, _syncStatus',
  sessions: 'id, challengeId, completedAt, _syncStatus',
  syncMeta: 'key',  // lastSyncAt, userId 等
});
```

各レコードに同期ステータスを付与:

```typescript
type SyncStatus = 'synced' | 'pending' | 'conflict';

interface Syncable {
  _syncStatus: SyncStatus;
  _updatedAt: number;       // クライアント側のタイムスタンプ
  _serverUpdatedAt?: string; // サーバー側のタイムスタンプ
}
```

**同期フロー:**

```
オンライン復帰 / 定期同期 (5分間隔)
  │
  ▼
1. db.challenges.where('_syncStatus').equals('pending').toArray()
  │
  ▼
2. Supabase にバッチ upsert
   supabase.from('challenges').upsert(pendingRecords, {
     onConflict: 'id',
     ignoreDuplicates: false,
   })
  │
  ▼
3. サーバーからの差分取得
   supabase.from('challenges')
     .select('*')
     .gt('updated_at', lastSyncAt)
  │
  ▼
4. ローカル更新 + _syncStatus = 'synced'
  │
  ▼
5. syncMeta.lastSyncAt を更新
```

### 5.4 オフライン → オンライン切り替え

```typescript
// src/lib/sync.ts
class SyncManager {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());
  }

  private async onOnline() {
    this.isOnline = true;
    await this.syncAll(); // 溜まったpendingを一括同期
  }

  private onOffline() {
    this.isOnline = false;
    // オフラインでも通常通り動作（IndexedDBに書き込み）
  }

  async syncAll() {
    if (!this.isOnline) return;
    await this.pushPending();
    await this.pullRemote();
  }
}
```

### 5.5 認証フロー（P1想定）

- Supabase Auth（Google / GitHub OAuth）
- 匿名→認証ユーザーへの移行: ローカルデータに `user_id` を付与して一括 upsert
- 認証なしでも引き続きローカルのみで利用可能（オプトイン同期）

---

## 6. エクスポート / インポート

### 6.1 バックアップ形式

JSON 形式でユーザーデータを一括エクスポート:

```typescript
interface FocusFrameBackup {
  version: 1;
  exportedAt: string;           // ISO 8601
  appVersion: string;           // "0.1.0"
  data: {
    challenges: Challenge[];
    sessions: Session[];
    settings: UserSettings;
  };
  // artworksは含まない（マスターデータはアプリにバンドル）
}
```

### 6.2 エクスポート実装

```typescript
async function exportData(): Promise<string> {
  const [challenges, sessions, settings] = await Promise.all([
    db.challenges.toArray(),
    db.sessions.toArray(),
    db.settings.get('user_settings'),
  ]);

  const backup: FocusFrameBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
    data: { challenges, sessions, settings: settings! },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  // ダウンロード
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focusframe-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return json;
}
```

### 6.3 インポート実装

```typescript
async function importData(file: File): Promise<void> {
  const text = await file.text();
  const backup: FocusFrameBackup = JSON.parse(text);

  // バージョンチェック
  if (backup.version !== 1) {
    throw new Error(`Unsupported backup version: ${backup.version}`);
  }

  // 既存データをクリアしてインポート（ユーザー確認後）
  await db.transaction('rw', [db.challenges, db.sessions, db.settings], async () => {
    await db.challenges.clear();
    await db.sessions.clear();
    await db.settings.clear();

    await db.challenges.bulkAdd(backup.data.challenges);
    await db.sessions.bulkAdd(backup.data.sessions);
    await db.settings.add(backup.data.settings);
  });
}
```

### 6.4 インポート時のバリデーション

```typescript
import { z } from 'zod';

const BackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  appVersion: z.string(),
  data: z.object({
    challenges: z.array(ChallengeSchema),
    sessions: z.array(SessionSchema),
    settings: UserSettingsSchema,
  }),
});
```

---

## 付録: 設計判断ログ

| 判断 | 理由 | 代替案 |
|------|------|--------|
| `revealedCells: number[]` で保存 | 色データは画像から再計算可能。保存データ量を最小化 | `PixelData[][]` 全体保存（数十KB/チャレンジ） |
| `artworks` テーブルにマスターデータ投入 | フィルタクエリをIndexedDBのインデックスで高速化 | TSの定数配列を毎回 `.filter()`（少数なら問題ないが拡張性に欠ける） |
| LWW 同期戦略 | ポモドーロデータは基本的に追記のみで競合が少ない | CRDT（オーバーエンジニアリング） |
| JSON エクスポート | ユーザーが中身を確認でき、他ツールでも解析可能 | バイナリ形式（サイズは小さいが可読性ゼロ） |
| `genre` に MultiEntry インデックス | 1作品が複数ジャンルに属する。`*genre` で配列要素ごとに検索可能 | ジャンルテーブルを分離（MVPではオーバー） |
