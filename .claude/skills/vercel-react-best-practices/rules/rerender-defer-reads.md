---
title: コールバックでのみ使用する状態の購読を避ける
impact: MEDIUM
impactDescription: 再レンダリングの頻度を削減する
tags: rerender, derived-state, media-query, optimization
---

## コールバックでのみ使用する状態は購読しない

状態の値がイベントハンドラーやコールバック内でのみ読み取られ、レンダリングに直接使用されない場合、それをコンポーネントの状態として購読することを避けてください。refを使用するか、コールバックが発火したときだけ外部ストアから読み取るようにしてください。

**悪い例（オブジェクト全体を購読し、変更のたびに再レンダリングが発生する）：**

```tsx
function Map() {
  const viewport = useViewport()  // パン/ズームのたびに再レンダリングされる

  const handleClick = (e) => {
    // viewportをここでのみ使用し、レンダリングでは使用しない
    const coords = screenToWorld(e.x, e.y, viewport)
    placeMarker(coords)
  }

  return <canvas onClick={handleClick} />
}
```

**良い例（コールバック時にrefを読み取り、再レンダリングなし）：**

```tsx
function Map() {
  const viewportRef = useViewportRef()  // 再レンダリングなし

  const handleClick = (e) => {
    const coords = screenToWorld(e.x, e.y, viewportRef.current)
    placeMarker(coords)
  }

  return <canvas onClick={handleClick} />
}
```
