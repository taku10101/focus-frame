# FocusFrame タイマーUI イメージ生成プロンプト

Geminiに以下のプロンプトをそのまま貼って画像生成してください。

---

## 案A: ドット絵一体型 × レトロピクセル

```
Generate a mobile app UI mockup for a Pomodoro timer app called "FocusFrame".

Design specifications:
- Dark mode UI with background color #0a0a0a
- Center of screen: an 8x8 pixel art grid (like a partially revealed mosaic). Some cells show colors (blues, yellows - suggesting a famous painting), other cells are dark gray (#1a1a1a) unrevealed
- Below the grid: a large timer display "24:32" in Press Start 2P pixel font, color #f5f5f0
- Below timer: a pixel-style progress bar made of small squares (■■■■■□□□□□), filled squares in cyan #00d4ff
- Below progress bar: small text "ゴッホ × 風景 — 15/64" in gray
- Bottom: a large rounded "集中する" (Start Focus) button with gradient from #00d4ff to #a855f7
- Top right: small collection icon, top left: settings gear icon
- Overall aesthetic: retro pixel art meets modern dark UI, like a premium indie game
- Mobile screen ratio (iPhone 15 Pro), realistic device mockup
- Clean, minimal, premium feel with retro pixel charm
```

---

## 案B: ミニマルリング型

```
Generate a mobile app UI mockup for a Pomodoro timer app called "FocusFrame".

Design specifications:
- Dark mode UI, pure black background #000000
- Center: a large circular ring timer (stroke width 4px, color gradient from #00d4ff to #a855f7), 70% filled
- Inside the ring: "24:32" in JetBrains Mono font, white, large
- Below the ring: a small 8x8 pixel art preview (partially revealed painting, some cells gray, some colorful)
- Below pixel art: text "ゴッホ × 風景" in Inter font, gray #666
- Below: "15/64 マス開放" with a thin progress bar
- Bottom: rounded start button "集中する" in white text on dark gray #1a1a1a card
- Ultra minimal, like a Notion or Linear style app
- No decoration, lots of whitespace, typography-driven design
- Mobile screen ratio (iPhone 15 Pro), realistic device mockup
```

---

## 案C: 額縁ギャラリー型

```
Generate a mobile app UI mockup for a Pomodoro timer app called "FocusFrame".

Design specifications:
- Dark mode, background #0f0f0f with subtle noise texture
- Center: an 8x8 pixel art grid displayed inside an ornate golden pixel-art picture frame (like a museum frame but made of pixels)
- Some grid cells revealed showing warm colors (suggesting Klimt's "The Kiss"), others are dark/hidden
- Below the frame: timer "24:32" in elegant serif-meets-pixel font, color warm gold #d4a574
- A thin golden progress line beneath the timer
- Bottom area: "作者: クリムト | ジャンル: 人物" in small warm gray text
- Large rounded button "集中を始める" with golden gradient border
- Overall feel: digital art museum, premium gallery experience
- Warm color palette: golds, deep browns, cream accents on dark background
- Mobile screen ratio (iPhone 15 Pro), realistic device mockup
```

---

## 案D: ネオン×サイバーパンク型

```
Generate a mobile app UI mockup for a Pomodoro timer app called "FocusFrame".

Design specifications:
- Dark mode, deep navy background #0a0a1a
- Center: 8x8 pixel art grid with neon glow effect around revealed cells. Revealed cells have vibrant colors with subtle glow, unrevealed cells are dark with faint grid lines
- The grid has a subtle scanline overlay effect
- Below grid: timer "24:32" in monospace font with neon cyan glow (#00ffff), like a retro LED display
- Thin neon progress bar (cyan to purple gradient, glowing)
- Small text "北斎 × 浮世絵 — 20/64" in dim cyan
- Bottom: pill-shaped button "FOCUS" with neon border glow animation feel
- Top: "FocusFrame" logo in small glitch-style text
- Aesthetic: cyberpunk meets pixel art, Akihabara arcade vibes
- Neon colors: cyan #00ffff, magenta #ff00ff, purple #a855f7 on dark navy
- Mobile screen ratio (iPhone 15 Pro), realistic device mockup
```

---

## 使い方
1. Gemini (gemini.google.com) を開く
2. 上のプロンプトをコピペ
3. 画像生成されたら比較検討
4. 気に入った方向性をベースにFigmaで詳細化
