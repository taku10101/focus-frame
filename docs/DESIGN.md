# FocusFrame 設計書

## 概要

25分間の集中セッション（ポモドーロ）を達成するたびにドット絵のマスが1つ開放され、著作権切れの名画が徐々にリビールされるPWA。

**コンセプト:** 集中するほど、名画が見えてくる。

---

## コア機能

### 1. ポモドーロタイマー
- 25分集中 → 5分休憩（デフォルト）
- タイマー時間はカスタム可能
- バックグラウンド動作（Service Worker / Notification API）
- 開始・一時停止・リセット

### 2. ドット絵リビール
- 集中セッション完了ごとにマスが1つランダムに開放
- 未開放マスはグレー or ぼかし表示
- 全マス開放で作品名がリビール🎉

### 3. 絵の選択
- **作品名は非公開**（完成まで何の絵かわからない）
- 選択軸:
  - **作者**: ゴッホ、北斎、モネ、フェルメール、クリムト…
  - **ジャンル**: 風景、人物、静物、浮世絵、抽象
  - **時代**: ルネサンス、印象派、近代日本
- 組み合わせフィルタ対応
- 条件に合う作品からランダムで1枚割り当て

### 4. マス数設定
- プリセット: 5×5 (25) / 8×8 (64) / 10×10 (100)
- カスタム N×N 対応
- マス数が少ない → シルエット系の絵が映える
- マス数が多い → 細密な絵も表現可能

### 5. コレクション
- 完成した絵の一覧表示
- 作品名・作者・完成日・かかったセッション数
- SNSシェア機能（途中経過 / 完成時）

---

## 画面構成

```
┌─────────────────────────────┐
│  [設定]           [コレクション]  │
│                               │
│      ┌───────────────┐       │
│      │               │       │
│      │   ドット絵     │       │
│      │   リビール     │       │
│      │   エリア       │       │
│      │               │       │
│      └───────────────┘       │
│                               │
│         25:00                 │
│      [ スタート ]             │
│                               │
│   進捗: 15/64マス開放         │
│   作者: ゴッホ │ ジャンル: 風景  │
└─────────────────────────────┘
```

### 画面一覧
1. **ホーム** — タイマー + リビールエリア（メイン画面）
2. **絵の選択** — 作者/ジャンル/時代フィルタ + マス数設定
3. **コレクション** — 完成作品一覧
4. **作品詳細** — 完成した絵の拡大表示 + 情報
5. **設定** — タイマー時間、通知、テーマ

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS |
| ドット絵変換 | Canvas API |
| データ保存 | IndexedDB (Dexie.js) |
| タイマー | Web Worker |
| 通知 | Notification API |
| PWA | next-pwa / Service Worker |
| デプロイ | Vercel |
| 画像ソース | Wikimedia Commons (パブリックドメイン) |

### 月額コスト: ¥0
- Vercel無料枠
- 画像はビルド時にバンドル or CDN
- サーバーサイド処理なし

---

## ドット絵変換ロジック

```typescript
function pixelateImage(
  image: HTMLImageElement,
  gridSize: number
): PixelData[][] {
  const canvas = document.createElement('canvas')
  canvas.width = gridSize
  canvas.height = gridSize
  const ctx = canvas.getContext('2d')!

  // 元画像をN×Nにリサイズ描画（ブラウザが補間）
  ctx.drawImage(image, 0, 0, gridSize, gridSize)

  // 各マスの色を取得
  const grid: PixelData[][] = []
  for (let y = 0; y < gridSize; y++) {
    const row: PixelData[] = []
    for (let x = 0; x < gridSize; x++) {
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
      row.push({ r, g, b, revealed: false })
    }
    grid.push(row)
  }
  return grid
}
```

### パレット制限（オプション）
- 16色/32色パレットに最近傍色で丸めるとドット絵感UP
- ファミコン風、ゲームボーイ風などテーマパレットも面白い

---

## データモデル

```typescript
// 作品マスター
interface Artwork {
  id: string
  artist: string          // "ゴッホ"
  genre: string[]         // ["風景", "印象派"]
  era: string             // "印象派"
  title: string           // "星月夜"（完成まで非表示）
  imagePath: string       // 元画像パス
  minGrid: number         // 推奨最小マス数
}

// 進行中のチャレンジ
interface Challenge {
  id: string
  artworkId: string
  gridSize: number        // ユーザー設定のマス数
  pixelGrid: PixelData[][]
  revealedCount: number
  totalCells: number
  startedAt: Date
  completedAt?: Date
  sessionCount: number    // 実施したポモドーロ数
}

// セッション履歴
interface Session {
  id: string
  challengeId: string
  startedAt: Date
  completedAt: Date
  duration: number        // 秒
  cellRevealed: { x: number; y: number }
}

// コレクション（完成済み）
interface Collection {
  challengeId: string
  artwork: Artwork
  gridSize: number
  completedAt: Date
  totalSessions: number
  totalMinutes: number
}
```

---

## 作品データ（初期収録案）

### マス数別おすすめ

#### 5×5向き（シルエット・高コントラスト）
| 作者 | ジャンル | 特徴 |
|------|---------|------|
| ムンク | 人物 | 強烈なシルエット |
| 北斎 | 浮世絵 | 波の形が認識しやすい |
| マレーヴィチ | 抽象 | 幾何学形状 |

#### 8×8向き（特徴的な構図）
| 作者 | ジャンル | 特徴 |
|------|---------|------|
| ゴッホ | 風景 | 渦巻き・色彩が特徴的 |
| フェルメール | 人物 | 青ターバンのコントラスト |
| 歌川広重 | 浮世絵 | 構図が明快 |

#### 10×10向き（細密・グラデーション）
| 作者 | ジャンル | 特徴 |
|------|---------|------|
| ダ・ヴィンチ | 人物 | 表情の繊細さ |
| モネ | 風景 | 色彩グラデーション |
| クリムト | 人物 | 金色パターン |

---

## マス開放ロジック

```typescript
function revealNextCell(challenge: Challenge): { x: number; y: number } {
  // 未開放マスからランダムに1つ選択
  const unrevealed: { x: number; y: number }[] = []
  for (let y = 0; y < challenge.gridSize; y++) {
    for (let x = 0; x < challenge.gridSize; x++) {
      if (!challenge.pixelGrid[y][x].revealed) {
        unrevealed.push({ x, y })
      }
    }
  }
  const idx = Math.floor(Math.random() * unrevealed.length)
  const cell = unrevealed[idx]
  challenge.pixelGrid[cell.y][cell.x].revealed = true
  challenge.revealedCount++
  return cell
}
```

### 開放順の工夫（将来）
- 完全ランダム（デフォルト）
- 端から中心へ（ドラマチック）
- 特徴的な部分を後半に（サプライズ感UP）

---

## MVP スコープ（v0.1）

### 含む
- [x] ポモドーロタイマー（25分固定）
- [x] ドット絵リビール（8×8固定）
- [x] 作品3〜5点（ハードコード）
- [x] 作者/ジャンルで選択
- [x] IndexedDBで進捗保存
- [x] PWA対応

### 含まない（v0.2以降）
- [ ] マス数カスタム
- [ ] タイマー時間カスタム
- [ ] パレット制限テーマ
- [ ] SNSシェア
- [ ] 開放順のバリエーション
- [ ] 作品追加（50点→100点）
- [ ] 統計ダッシュボード

---

## 開発スケジュール（目安）

| フェーズ | 期間 | 内容 |
|---------|------|------|
| Week 1 | 基盤 | Next.js + PWA + タイマー実装 |
| Week 2 | コア | ドット絵変換 + リビール機能 |
| Week 3 | データ | 作品データ整備 + IndexedDB |
| Week 4 | UI | デザイン仕上げ + コレクション画面 |
| Week 5 | 公開 | Vercelデプロイ + OGP + ストア申請 |
