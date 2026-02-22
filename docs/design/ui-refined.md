# FocusFrame UI Refined — 案Aベース洗練提案

> Author: 藤原 ゆい（UI/UXデザイナー）
> Date: 2026-02-23
> Base: 案A（ドット絵一体型×レトロ）

---

## 共通方針

- **主役はドット絵グリッド**。装飾は空気のように存在し、グリッドを引き立てる
- レトロ×プレミアム = "ネオレトロ"。CRTモニタの前に座った時のワクワク感を、現代の質感で
- ReactBitsは**最大5〜6個**に絞る。使わない勇気が洗練を生む
- 背景演出は `will-change: transform` + GPU合成レイヤーで60fps死守

---

## Pattern 1: 「Midnight Museum」

### コンセプト
> 深夜の美術館で、一枚の絵が静かに浮かび上がる体験

### 使用ReactBitsコンポーネント

| コンポーネント | 用途 | 設定 |
|---|---|---|
| **Noise** | 背景全体に微細ノイズテクスチャ | opacity: 0.03, blendMode: "overlay" |
| **Spotlight** | グリッド周辺をマウス/タッチ追従で照らす | radius: 200px, color: rgba(0,255,255,0.06) |
| **Counter** | タイマー数字の切り替えアニメーション | duration: 300ms, easing: ease-out |
| **PixelTransition** | マス開放時のリビール演出 | gridSize: 8, duration: 600ms |
| **ShinyText** | 進捗テキスト "15/64" にシャイン | speed: 3s, color: シアン |

### 画面構成

```
┌─────────────────────────┐
│  (status bar)           │
│                         │
│   ╭─ noise texture ───╮ │
│   │                   │ │
│   │   ┌─────────┐    │ │  ← Spotlight追従
│   │   │ 8×8 Grid│    │ │     グリッド周辺に淡い光
│   │   │ ■□■□■□■□│    │ │
│   │   │ □■□□□■□■│    │ │
│   │   │ ■■□□□□■□│    │ │
│   │   └─────────┘    │ │
│   │                   │ │
│   │    2 4 : 3 2      │ │  ← Counter（各桁独立アニメ）
│   │   ■■■■■□□□□□     │ │  ← プログレスバー（微グロウ）
│   │                   │ │
│   │  ゴッホ × 風景     │ │
│   │    ✧ 15/64 ✧      │ │  ← ShinyText
│   │                   │ │
│   │  ┌─────────────┐  │ │
│   │  │  集中する     │  │ │  ← ボタン（hover時Spotlight強調）
│   │  └─────────────┘  │ │
│   ╰───────────────────╯ │
└─────────────────────────┘
```

**詳細：**
- 背景: `#0a0a0a` + Noiseテクスチャ（フィルムグレイン的な粒子感）
- グリッドは`box-shadow: 0 0 40px rgba(0,255,255,0.08)` で浮遊感
- Spotlightはタッチ位置に追従し、グリッド付近に到達するとわずかに明るくなる（美術館の懐中電灯イメージ）
- タイマーは各桁が独立した`Counter`で、秒更新時にスムーズに数字がスライド
- マス開放時: `PixelTransition`でグレー→カラーにモザイク解除。0.6秒かけてじわっと現れる

### カラーパレット

```
Background:   #0a0a0a (漆黒)
Surface:      #111113 (カード背景)
Grid-locked:  #1a1a1e (未開放マス)
Grid-open:    作品の原色をそのまま
Accent:       #00e5ff (シアン)
Accent-sub:   #7c4dff (パープル)
Text-primary: #e0e0e0
Text-muted:   #666670
Glow:         rgba(0,229,255,0.12)
```

### アニメーション・インタラクション仕様

| トリガー | 演出 | 時間 | イージング |
|---|---|---|---|
| 画面表示 | Noise即時描画、Spotlightフェードイン | 500ms | ease-out |
| 毎秒 | Counter数字スライド | 300ms | cubic-bezier(0.25,0.46,0.45,0.94) |
| マス開放 | PixelTransition（8×8 → 明瞭化） | 600ms | ease-in-out |
| ボタンタップ | scale(0.97) → scale(1) + Spotlight輝度UP | 150ms | spring |
| タイマー完了 | 全マス同時に微パルス（opacity 0.8→1→0.8） | 2s loop | sine |

### Gemini画像生成プロンプト

```
A dark mobile app UI mockup for iPhone 15 Pro, portrait orientation. Background is near-black (#0a0a0a) with a subtle film grain noise texture overlay. Center of screen: an 8x8 pixel art grid, some cells revealed showing Van Gogh-style landscape colors (blues, yellows, greens), other cells are dark gray (#1a1a1e). A soft cyan spotlight glow surrounds the grid (radius ~200px, very subtle). Below the grid: a retro digital timer showing "24:32" in Press Start 2P pixel font, white text with slight cyan glow. Below that: a pixel-style progress bar, 5 filled cyan squares and 5 empty dark squares. Text reads "ゴッホ × 風景 — 15/64" in small muted text with a shimmer effect. At bottom: a rounded button "集中する" with cyan-to-purple gradient. Overall mood: midnight museum, quiet luxury, neo-retro. Minimal, premium dark UI. No bright elements except the grid colors and cyan accents.
```

---

## Pattern 2: 「Cosmic Pixel」

### コンセプト
> 宇宙空間に浮かぶピクセルアート。集中するたびに星が瞬き、絵が姿を現す

### 使用ReactBitsコンポーネント

| コンポーネント | 用途 | 設定 |
|---|---|---|
| **Particles** | 背景に微細な星屑パーティクル | count: 40, size: 1-2px, speed: 0.3, color: #ffffff15 |
| **Aurora** | 画面下部にうっすらオーロラ | colors: [シアン, パープル], opacity: 0.07, blur: 80px |
| **Counter** | タイマー | duration: 400ms |
| **ClickSpark** | マス開放タップ時にスパーク | particleCount: 8, color: シアン |
| **PixelTransition** | マス開放リビール | gridSize: 12, duration: 500ms |
| **Glow** | グリッド外枠の呼吸グロウ | color: シアン, intensity: pulse |

### 画面構成

```
┌─────────────────────────┐
│ ✦  ·    ✦        ·   ✦  │  ← Particles（星屑）
│    ·  ✦     ·           │
│         ✦    ·          │
│                         │
│      ┏━━━━━━━━━┓       │  ← Glow呼吸アニメ（外枠）
│      ┃ 8×8 Grid┃       │
│      ┃ ████░░░░┃       │
│      ┃ ██░░░░██┃       │
│      ┃ ░░░░░░░░┃       │
│      ┗━━━━━━━━━┛       │
│                         │
│       24 : 32           │  ← Counter + コロン点滅
│                         │
│    ■■■■■□□□□□          │
│    ゴッホ × 風景         │
│       15/64             │
│                         │
│    ╭───────────────╮    │
│    │   集中する      │    │  ← tap時 ClickSpark
│    ╰───────────────╯    │
│ ～～～～～～～～～～～～ │  ← Aurora（下部にうっすら）
└─────────────────────────┘
```

**詳細：**
- Particlesは画面全体に40個程度、ゆっくり漂う（speed: 0.3）。存在感を主張しない
- Auroraは画面下1/3にだけ配置。シアン〜パープルのグラデがゆっくりうねる（8秒周期）
- グリッド外枠にGlowを適用。4秒周期でopacity 0.05→0.15を呼吸するように繰り返す
- マス開放タップ → ClickSparkが放射状に8粒飛散 → PixelTransitionでリビール
- タイマーのコロン `:` は1秒ごとにopacity 1→0.3を切り替え（古典的だが効果的）

### カラーパレット

```
Background:   #050508 (宇宙の闇)
Surface:      #0c0c12
Grid-locked:  #16161e
Grid-open:    作品原色
Accent:       #00e5ff (シアン)
Accent-sub:   #a855f7 (パープル)
Aurora-1:     rgba(0,229,255,0.07)
Aurora-2:     rgba(168,85,247,0.05)
Particles:    rgba(255,255,255,0.08)
Text-primary: #d4d4d8
Text-muted:   #52525b
```

### アニメーション・インタラクション仕様

| トリガー | 演出 | 時間 | イージング |
|---|---|---|---|
| 画面表示 | Particles開始、Aurora開始 | 即時 | — |
| 常時 | Glow呼吸（グリッド外枠） | 4s loop | sine |
| 常時 | コロン点滅 | 1s toggle | step |
| 毎秒 | Counter数字フリップ | 400ms | ease-out |
| マス開放タップ | ClickSpark(8粒) → PixelTransition | spark: 300ms, pixel: 500ms | ease-in-out |
| ポモドーロ完了 | Particles一瞬加速＋Aurora輝度UP | 2s | ease-out |
| ボタンタップ | scale(0.96→1.02→1) | 200ms | spring(1,80,10) |

### Gemini画像生成プロンプト

```
A dark mobile app UI mockup for iPhone 15 Pro. Deep space black background (#050508). Tiny white star particles scattered across the screen (40 dots, 1-2px, very low opacity). At the bottom third, a subtle aurora borealis effect in cyan and purple (very low opacity, ~7%, heavily blurred). Center: an 8x8 pixel art grid with a soft pulsing cyan glow outline. Some grid cells show Van Gogh landscape colors, others are dark. One cell has a small spark/burst effect (cyan particles radiating outward) as if just revealed. Below grid: retro timer "24:32" in Press Start 2P font with blinking colon. Pixel progress bar below. Text "ゴッホ × 風景 — 15/64". Rounded gradient button "集中する" (cyan to purple). Overall: cosmic, serene, pixel art floating in space. Premium dark UI, minimal and breathable.
```

---

## Pattern 3: 「Neon Glass」

### コンセプト
> ガラスモーフィズム×ネオンサイン。レトロゲームセンターのショーケースに飾られた一枚

### 使用ReactBitsコンポーネント

| コンポーネント | 用途 | 設定 |
|---|---|---|
| **Noise** | 背景ノイズ（CRTスキャンライン風） | opacity: 0.025, pattern: "scanline" |
| **Blur** | グリッドカードのガラスモーフィズム | blur: 12px, bg: rgba(255,255,255,0.04) |
| **Gradient** | ボタンの動的グラデーション | colors: [シアン,パープル,シアン], speed: 4s |
| **Counter** | タイマー | duration: 350ms |
| **PixelTransition** | マス開放 | gridSize: 10, duration: 450ms |
| **LetterGlitch** | タイマー完了時のグリッチ演出 | duration: 800ms, intensity: 0.3 |

### 画面構成

```
┌─────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░  │  ← Noise (CRT scanline風)
│                         │
│   ╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮   │  ← Blur ガラスカード
│   ┊  ┌─────────┐    ┊   │     backdrop-filter: blur(12px)
│   ┊  │ 8×8 Grid│    ┊   │     border: 1px solid rgba(255,255,255,0.06)
│   ┊  │ ████░░░░│    ┊   │
│   ┊  │ ██░░░░██│    ┊   │
│   ┊  │ ░░░░░░░░│    ┊   │
│   ┊  └─────────┘    ┊   │
│   ┊                  ┊   │
│   ┊   2 4 : 3 2     ┊   │  ← Counter + ネオングロウ
│   ┊  ■■■■■□□□□□     ┊   │     text-shadow: 0 0 10px cyan
│   ┊                  ┊   │
│   ┊ ゴッホ × 風景     ┊   │
│   ┊    15/64         ┊   │
│   ╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯   │
│                         │
│    ╭───────────────╮    │
│    │   集中する      │    │  ← Gradient動的グラデボタン
│    ╰───────────────╯    │
│                         │
└─────────────────────────┘
```

**詳細：**
- 背景: `#0a0a0a` + 横方向の微細スキャンライン（Noiseで実現、CRTテレビのテクスチャ感）
- グリッド〜プログレスまでをガラスカード（Blur）で包む。カード自体が主役のフレーム
- カードのborder: `1px solid rgba(255,255,255,0.06)` で繊細なエッジ
- タイマー数字にネオングロウ: `text-shadow: 0 0 8px rgba(0,229,255,0.6), 0 0 20px rgba(0,229,255,0.2)`
- ボタンはGradientで色が流れるアニメーション（シアン→パープル→シアン、4秒ループ）
- ポモドーロ完了時: LetterGlitchでタイマー表示が一瞬グリッチ → "COMPLETE!" にスプリット変化

### カラーパレット

```
Background:   #0a0a0a
Glass-bg:     rgba(255,255,255,0.04)
Glass-border: rgba(255,255,255,0.06)
Grid-locked:  #1e1e24
Grid-open:    作品原色
Neon-cyan:    #00e5ff
Neon-purple:  #b44dff
Neon-glow:    rgba(0,229,255,0.5) (text-shadow用)
Text-primary: #f0f0f0
Text-muted:   #5a5a66
Scanline:     rgba(255,255,255,0.015)
```

### アニメーション・インタラクション仕様

| トリガー | 演出 | 時間 | イージング |
|---|---|---|---|
| 画面表示 | ガラスカードfadeIn + slideUp(8px) | 600ms | ease-out |
| 常時 | ボタンGradient流れ | 4s loop | linear |
| 常時 | タイマーネオングロウ微パルス | 3s loop | sine |
| 毎秒 | Counter数字切り替え | 350ms | ease-out |
| マス開放タップ | PixelTransition | 450ms | ease-in-out |
| ポモドーロ完了 | LetterGlitch → テキスト変化 | 800ms → 400ms | — |
| カードタッチ開始 | ガラスborder輝度微UP | 200ms | ease |

### Gemini画像生成プロンプト

```
A dark mobile app UI mockup for iPhone 15 Pro. Background: near-black (#0a0a0a) with very subtle horizontal CRT scanline texture (barely visible). Center: a glassmorphism card with backdrop-filter blur, very subtle white border (1px, 6% opacity), containing an 8x8 pixel art grid (some cells show Van Gogh landscape colors, others dark). Below the grid inside the card: timer "24:32" in Press Start 2P pixel font with neon cyan glow effect (text-shadow, like a neon sign). Pixel progress bar. Text "ゴッホ × 風景 — 15/64". Below the card: a button "集中する" with animated flowing gradient from cyan to purple. The glass card floats on the dark background with depth. Style: retro arcade meets modern glassmorphism, neon signs in a dark room. Clean, minimal, premium. iPhone status bar visible at top.
```

---

## 推奨パターン

**私のおすすめは Pattern 1「Midnight Museum」** です。

理由：
1. **引き算が効いている** — Noise + Spotlight の2つだけで背景に奥行きが出る。やりすぎない
2. **Spotlightが体験を作る** — 美術館で絵を懐中電灯で見る感覚。ユーザーが「自分で発見している」実感
3. **パフォーマンスが最も軽い** — Particlesなし、Auroraなし。Noiseは静的CSSで済む
4. **モバイルで最も自然** — Spotlightはタッチ追従で直感的。Particlesは小画面だと雑音になりがち

ただし **マス開放の快感を最大化したいなら Pattern 2「Cosmic Pixel」** のClickSparkは捨てがたい。Pattern 1 に ClickSpark だけ足すハイブリッドもアリです。

---

## 実装上の注意

### パフォーマンス
- Particles: `requestAnimationFrame` ベース、Canvas 2D で描画。DOM要素にしない
- Aurora: CSS `background` + `animation` のみ。JS不要
- Noise: SVG filter `<feTurbulence>` を CSS `background-image: url("data:image/svg+xml,...")` で。静的なので負荷ゼロ
- PixelTransition: CSS Grid + `opacity` トランジション。transform でGPU合成

### ReactBitsインポート戦略
```tsx
// 必要なものだけ個別インポート（tree-shaking対応）
import { Counter } from 'reactbits/Counter'
import { PixelTransition } from 'reactbits/PixelTransition'
// ❌ import * as ReactBits from 'reactbits'
```

### モバイル対応
- Spotlight: `touchmove` イベントでタッチ座標取得。`pointer-events: none` でグリッドタップを邪魔しない
- Particles: モバイルでは30個に減らす（`matchMedia('(max-width: 768px)')` で判定）
- すべてのアニメーションに `prefers-reduced-motion: reduce` 対応を入れる
