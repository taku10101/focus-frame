---
title: スクロール用パッシブイベントリスナーの使用
impact: MEDIUM
impactDescription: ブロッキングイベントリスナーによるスクロールのカクつきを解消する
tags: client, event-listeners, passive, scroll, performance
---

## パッシブイベントリスナーの使用

スクロールおよびタッチリスナーをパッシブとしてマークし、メインスレッドのブロックを防ぐ。パッシブリスナーは `preventDefault()` を呼び出せないため、ブラウザはハンドラの完了を待たずに即座にスクロールできる。

**悪い例（スクロールをブロックする）：**

```typescript
window.addEventListener("scroll", handler)
window.addEventListener("touchmove", handler)
```

**良い例（ノンブロッキング）：**

```typescript
window.addEventListener("scroll", handler, { passive: true })
window.addEventListener("touchmove", handler, { passive: true })
```
