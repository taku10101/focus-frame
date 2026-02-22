# フロントエンド詳細設計書

> FocusFrame — ドット絵リビール × ポモドーロタイマー PWA
> 作成: 西田 悠斗（フロントエンドエンジニア）
> 更新日: 2026-02-22

---

## 1. ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # Root Layout (Server Component)
│   ├── page.tsx                # ホーム画面 (Server Component)
│   ├── manifest.ts             # Web App Manifest (Route Handler)
│   ├── sw.ts                   # Service Worker registration helper
│   ├── globals.css             # Tailwind directives + CSS variables
│   ├── select/
│   │   └── page.tsx            # 絵の選択画面 (Server Component)
│   ├── collection/
│   │   ├── page.tsx            # コレクション一覧 (Server Component)
│   │   └── [id]/
│   │       └── page.tsx        # 作品詳細 (Server Component)
│   └── settings/
│       └── page.tsx            # 設定画面 (Server Component)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # ヘッダー (Client Component — ナビ状態)
│   │   ├── Navigation.tsx      # ボトムナビ (Client Component)
│   │   └── PageShell.tsx       # 共通ページラッパー (Server Component)
│   │
│   ├── timer/
│   │   ├── TimerDisplay.tsx    # タイマー表示 (Client Component)
│   │   ├── TimerControls.tsx   # 開始/一時停止/リセット (Client Component)
│   │   └── TimerProvider.tsx   # タイマー状態管理 (Client Component)
│   │
│   ├── canvas/
│   │   ├── PixelGrid.tsx       # ドット絵グリッド描画 (Client Component)
│   │   ├── RevealAnimation.tsx # マス開放アニメーション (Client Component)
│   │   └── CompletionCelebration.tsx # 完成演出 (Client Component)
│   │
│   ├── select/
│   │   ├── ArtworkFilter.tsx   # フィルタUI (Client Component)
│   │   └── ArtworkCard.tsx     # 作品プレビューカード (Server Component)
│   │
│   ├── collection/
│   │   ├── CollectionGrid.tsx  # コレクション一覧 (Server Component)
│   │   └── ArtworkDetail.tsx   # 作品詳細ビュー (Client Component — Canvas使用)
│   │
│   └── ui/
│       ├── Button.tsx          # 汎用ボタン (Server Component)
│       ├── ProgressBar.tsx     # プログレスバー (Client Component)
│       └── Modal.tsx           # モーダル (Client Component)
│
├── hooks/
│   ├── useTimer.ts             # タイマーWorker連携hook
│   ├── useChallenge.ts         # チャレンジ進捗管理hook
│   ├── usePixelGrid.ts         # Canvas描画hook
│   └── useNotification.ts     # Notification API hook
│
├── lib/
│   ├── db.ts                   # Dexie.jsスキーマ定義
│   ├── pixelate.ts             # ドット絵変換ロジック
│   ├── reveal.ts               # マス開放ロジック
│   └── artworks.ts             # 作品マスターデータ
│
├── workers/
│   └── timer.worker.ts         # ポモドーロタイマー Web Worker
│
├── types/
│   └── index.ts                # 型定義（Artwork, Challenge, Session等）
│
└── public/
    ├── artworks/               # 名画画像ファイル（ビルド時バンドル）
    │   ├── starry-night.webp
    │   ├── great-wave.webp
    │   └── ...
    ├── icons/                  # PWAアイコン
    │   ├── icon-192.png
    │   └── icon-512.png
    └── sw.js                   # コンパイル済みService Worker
```

---

## 2. コンポーネントツリー

### ホーム画面 (`/`)

```
RootLayout (Server)
└── PageShell (Server)
    ├── Header (Client) — ナビリンク
    ├── page.tsx (Server) — 静的シェル
    │   ├── TimerProvider (Client) — タイマー状態のContext Provider
    │   │   ├── PixelGrid (Client) — Canvas描画
    │   │   │   ├── RevealAnimation (Client) — マス開放時
    │   │   │   └── CompletionCelebration (Client) — 全マス開放時
    │   │   ├── TimerDisplay (Client) — 残り時間表示
    │   │   ├── TimerControls (Client) — 開始/停止/リセット
    │   │   └── ProgressBar (Client) — マス開放進捗
    └── Navigation (Client) — ボトムナビ
```

### 絵の選択画面 (`/select`)

```
RootLayout (Server)
└── PageShell (Server)
    ├── Header (Client)
    ├── page.tsx (Server)
    │   ├── ArtworkFilter (Client) — 作者/ジャンル/時代フィルタ
    │   └── ArtworkCard × N (Server) — 候補カード
    └── Navigation (Client)
```

### コレクション画面 (`/collection`)

```
RootLayout (Server)
└── PageShell (Server)
    ├── Header (Client)
    ├── page.tsx (Server)
    │   └── CollectionGrid (Server) — 完成作品グリッド
    └── Navigation (Client)
```

### 作品詳細 (`/collection/[id]`)

```
RootLayout (Server)
└── PageShell (Server)
    ├── Header (Client)
    ├── page.tsx (Server)
    │   └── ArtworkDetail (Client) — Canvas拡大表示
    └── Navigation (Client)
```

**設計方針:** Server Componentをデフォルトとし、`"use client"` は以下の場合のみ付与:
- `useState` / `useEffect` / `useRef` を使用する
- ブラウザAPIに依存する（Canvas, Worker, Notification）
- ユーザーインタラクションのイベントハンドラを持つ

---

## 3. 状態管理方針

### Zustand は不採用

理由: このアプリの状態は「タイマー」と「チャレンジ進捗」の2つに集約され、それぞれが独立している。Zustandを入れるほどの複雑さがない。**バンドルサイズを1バイトでも削る。** Core Web Vitals通りますか？

### 採用: React Context + useReducer + IndexedDB

| 状態 | 管理方法 | スコープ | 永続化 |
|------|---------|---------|--------|
| タイマー（残り時間, 状態, フェーズ） | `TimerContext` + Web Worker | `/` ページ内 | なし（揮発） |
| チャレンジ進捗（グリッド, 開放済マス） | `ChallengeContext` + IndexedDB | アプリ全体 | IndexedDB |
| コレクション（完成作品一覧） | IndexedDB直接読み出し | `/collection` | IndexedDB |
| 設定（タイマー時間等） | IndexedDB | `/settings` | IndexedDB |
| UIステート（モーダル, フィルタ） | ローカル `useState` | 各コンポーネント | なし |

### Context設計

```typescript
// TimerContext — タイマー状態
interface TimerState {
  phase: 'focus' | 'break' | 'idle'
  remainingMs: number
  isRunning: boolean
}

// ChallengeContext — チャレンジ進捗
interface ChallengeState {
  challenge: Challenge | null
  isLoading: boolean
}
```

**IndexedDBとの同期:** `useChallenge` hookがマウント時にDexieからロード → Contextに注入。マス開放時にContextとIndexedDBを同時更新（optimistic update）。

---

## 4. ルーティング設計

| パス | ページ | 説明 | プリロード |
|------|--------|------|-----------|
| `/` | `app/page.tsx` | ホーム（タイマー + リビール） | — |
| `/select` | `app/select/page.tsx` | 絵の選択 | 作品マスターデータ |
| `/collection` | `app/collection/page.tsx` | コレクション一覧 | IndexedDBから完成作品 |
| `/collection/[id]` | `app/collection/[id]/page.tsx` | 作品詳細 | 該当作品データ |
| `/settings` | `app/settings/page.tsx` | 設定 | IndexedDBから設定値 |
| `/manifest.ts` | Route Handler | manifest.json生成 | — |

### ナビゲーション戦略

- **ボトムナビゲーション**: モバイルファーストで下部に固定配置（ホーム / 選択 / コレクション / 設定）
- **prefetch**: Next.js App Routerのデフォルトprefetchを活用。`<Link>` のviewport内自動prefetch
- **Loading UI**: 各route segmentに `loading.tsx` を配置し、Suspense boundaryで即座にシェルを表示

---

## 5. PWA設計

### manifest.json

```json
{
  "name": "FocusFrame",
  "short_name": "FocusFrame",
  "description": "集中するほど、名画が見えてくる",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["productivity", "education"]
}
```

### Service Worker戦略

**next-pwa** (または `@ducanh2912/next-pwa`) を使用。

| リソース | キャッシュ戦略 | 理由 |
|---------|--------------|------|
| App Shell（HTML/JS/CSS） | **Stale-While-Revalidate** | 即座に表示、バックグラウンドで更新 |
| 名画画像 (`/artworks/*`) | **Cache First** | 変更されない静的アセット。プリキャッシュ対象 |
| フォント | **Cache First** | 同上 |
| ナビゲーション | **Network First** | 最新のページを優先、オフライン時はキャッシュ |

### プリキャッシュ対象

```
- /                         # ホーム
- /select                   # 選択画面
- /collection               # コレクション
- /artworks/*.webp          # 名画画像（全点）
- /icons/*                  # PWAアイコン
```

### オフライン対応

タイマーはWeb Workerで動作するため完全オフライン可。進行中のチャレンジデータはIndexedDBにあるため、オフラインでもリビール操作可能。新しい絵の選択もプリキャッシュ済み画像で対応。

---

## 6. Canvas描画設計

### ドット絵変換パイプライン

```
元画像(webp) → Image → OffscreenCanvas(N×N) → getImageData → PixelData[][]
```

1. **画像ロード**: `<img>` or `new Image()` で元画像を読み込み
2. **リサイズ**: `OffscreenCanvas` に `drawImage()` でN×Nに縮小描画。ブラウザのバイリニア補間を利用
3. **色データ抽出**: `getImageData()` で各ピクセルのRGBを取得
4. **PixelData生成**: `{ r, g, b, revealed: false }` の2D配列として返却

### グリッド描画 (PixelGrid.tsx)

Canvas要素を1つ使用し、`requestAnimationFrame` ループは使わず **状態変更時のみ再描画** する（パフォーマンス重視）。

```typescript
function drawGrid(ctx: CanvasRenderingContext2D, grid: PixelData[][], cellSize: number) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x]
      if (cell.revealed) {
        ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`
      } else {
        ctx.fillStyle = '#2a2a2a'  // 未開放: ダークグレー
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1)
      // 1px gap でグリッド線を表現
    }
  }
}
```

### マス開放アニメーション (RevealAnimation.tsx)

セッション完了時に1マスが開放されるアニメーション:

1. **ターゲット選択**: 未開放マスからランダムに1つ選択
2. **ハイライト**: 選択マスが白く点滅（`opacity` アニメーション 3回、300ms each）
3. **色変化**: 白 → 実際の色にイージング遷移（`ease-out`, 500ms）
4. **波紋エフェクト**: 開放マスを中心に隣接マスが微かに光る（CSS `box-shadow` or Canvas gradient）

**実装**: `requestAnimationFrame` でアニメーションフレームを制御。アニメーション完了後にstateを更新してCanvas再描画。

### リビール演出 (CompletionCelebration.tsx)

全マス開放時の演出:

1. **グリッド消失**: グリッド線（1px gap）が0にアニメーション → 完全な1枚絵に
2. **ズームアウト**: Canvas全体が少し縮小しながら枠が表示
3. **タイトルリビール**: 作品名が下からフェードイン（CSS `transform: translateY` + `opacity`）
4. **紙吹雪**: CSS-onlyの紙吹雪アニメーション（canvas-confettiは使わない。バンドルサイズ削減）

---

## 7. Web Worker設計

### timer.worker.ts

```typescript
// メッセージプロトコル
type WorkerMessage =
  | { type: 'START'; durationMs: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }

type WorkerResponse =
  | { type: 'TICK'; remainingMs: number }
  | { type: 'COMPLETE' }
  | { type: 'PAUSED'; remainingMs: number }

// 実装
let intervalId: number | null = null
let remainingMs = 0
let lastTickTime = 0

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  switch (e.data.type) {
    case 'START':
      remainingMs = e.data.durationMs
      lastTickTime = Date.now()
      intervalId = self.setInterval(() => {
        const now = Date.now()
        const elapsed = now - lastTickTime
        lastTickTime = now
        remainingMs = Math.max(0, remainingMs - elapsed)
        self.postMessage({ type: 'TICK', remainingMs })
        if (remainingMs <= 0) {
          self.clearInterval(intervalId!)
          intervalId = null
          self.postMessage({ type: 'COMPLETE' })
        }
      }, 1000)
      break
    case 'PAUSE':
      if (intervalId) self.clearInterval(intervalId)
      intervalId = null
      self.postMessage({ type: 'PAUSED', remainingMs })
      break
    case 'RESUME':
      lastTickTime = Date.now()
      // START同様のinterval再開
      break
    case 'RESET':
      if (intervalId) self.clearInterval(intervalId)
      intervalId = null
      remainingMs = 0
      break
  }
}
```

### なぜWeb Workerか

- メインスレッドがタブ非アクティブ時に `setInterval` がスロットルされる（Chrome: 1分間隔に制限）
- Web Worker内の `setInterval` はスロットル対象外
- `Date.now()` ベースの経過時間計算で、interval精度に依存しない設計

### useTimer hook

```typescript
function useTimer() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url)
    )
    return () => workerRef.current?.terminate()
  }, [])

  // start, pause, resume, reset をWorkerにpostMessage
}
```

---

## 8. パフォーマンス戦略

### Core Web Vitals 目標

| 指標 | 目標 | 戦略 |
|------|------|------|
| **LCP** | < 2.5s | Server Componentで静的シェルを即時配信。画像は `next/image` + WebP + priority |
| **FID/INP** | < 200ms | Canvas描画を `requestAnimationFrame` に限定。重い処理はWorkerに逃がす |
| **CLS** | < 0.1 | Canvas要素に固定 `aspect-ratio`。フォントは `next/font` でFOUTを排除 |

### 具体策

#### バンドルサイズ削減
- **Zustand不採用** → Context + useReducerで十分（0KB追加）
- **canvas-confetti不採用** → CSS-only紙吹雪（0KB追加）
- **Dexie.js** は ~16KB gzip。IndexedDBの直接操作の複雑さを考慮すると許容
- **next/dynamic** でCanvas系コンポーネントを遅延ロード（SSR不要なため `ssr: false`）
- Tree shaking: 全モジュールをnamed exportに統一

#### 画像最適化
- 名画画像は **WebP** で保存（JPEG比 25-34% 軽量）
- `next/image` の `sizes` 属性で適切なレスポンシブサイズを指定
- ビルド時に全画像を最適化済みで `/artworks/` に配置

#### レンダリング最適化
- **Server Component first**: ページシェル、ナビ構造、静的テキストはServer Component
- **Client Componentの境界を最小化**: `"use client"` は必要なコンポーネントのみ。親がServerでいられるよう設計
- **React.memo**: `PixelGrid` は `grid` データが変わらない限り再描画しない
- **useMemo**: ドット絵変換結果をメモ化

#### フォント
- `next/font/google` で **Inter**（またはNoto Sans JP）をセルフホスト
- サブセット化でCJKフォントのサイズを最小化

#### Service Worker
- App Shellをプリキャッシュし、リピートビジットはネットワーク不要で表示
- `navigation preload` を有効化し、SW起動待ちとネットワークリクエストを並列化

#### Lighthouse 90+ 達成チェックリスト
- [ ] 未使用JSの除去（`@next/bundle-analyzer` で確認）
- [ ] 画像のlazy loading（ファーストビュー外）
- [ ] `<meta name="viewport">` 設定
- [ ] `<html lang="ja">` 設定
- [ ] Critical CSSのインライン化（Next.js App Routerがデフォルトで対応）
- [ ] `font-display: swap` （`next/font` がデフォルトで対応）

---

## 技術的意思決定まとめ

| 決定 | 採用 | 不採用 | 理由 |
|------|------|--------|------|
| 状態管理 | Context + useReducer | Zustand, Redux, Jotai | 状態が2箇所に集約。外部ライブラリ不要 |
| 紙吹雪 | CSS-only | canvas-confetti | バンドルサイズ0。演出は短時間なのでCSS十分 |
| ドット絵描画 | Canvas 2D API | SVG, CSS Grid | ピクセル操作が必要。Canvas一択 |
| タイマー | Web Worker | setInterval (main thread) | バックグラウンドタブ対応必須 |
| DB | Dexie.js | raw IndexedDB, localStorage | DX重視。型安全。16KB gzipは許容 |
| PWA | next-pwa系 | Workbox直接 | Next.js統合が楽。設定最小 |
| CSS | Tailwind CSS | CSS Modules, styled-components | ユーティリティファーストでバンドル小。DESIGNに準拠 |
