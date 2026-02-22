---
title: SVGではなくdivラッパーをアニメーションさせる
impact: MEDIUM
impactDescription: SVGアニメーションのガタつきを防ぐ
tags: rendering, svg, animation, performance
---

## SVGではなくdivラッパーをアニメーションさせる

SVG要素自体ではなく、SVGを囲む`div`ラッパーにアニメーションを適用します。SVG要素はHTML要素と同じようにCSSのハードウェアアクセラレーションの恩恵を受けられません。

**悪い例（SVGを直接アニメーションさせる）：**

```tsx
<svg
  style={{ transform: `rotate(${angle}deg)` }}
  viewBox="0 0 100 100"
>
  <circle cx="50" cy="50" r="40" />
</svg>
```

**良い例（ラッパーdivをアニメーションさせる）：**

```tsx
<div style={{ transform: `rotate(${angle}deg)` }}>
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" />
  </svg>
</div>
```
