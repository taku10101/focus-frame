---
title: グローバルイベントリスナーの重複排除
impact: MEDIUM
impactDescription: 複数のコンポーネントインスタンスによる重複イベントハンドラを防止する
tags: client, event-listeners, deduplication, global
---

## グローバルイベントリスナーの重複排除

グローバルイベントには共有シングルトンを使用する。同じグローバルイベントに対して複数のコンポーネントインスタンスが `addEventListener` を呼び出すと、重複したハンドラが作成される。

**悪い例（複数インスタンスで重複が発生する）：**

```typescript
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    // 各インスタンスが独自のリスナーを追加する
    window.addEventListener("resize", () => setWidth(window.innerWidth))
    return () => window.removeEventListener("resize", handler)
  }, [])
  return width
}
```

**良い例（共有シングルトン、リスナーは1つ）：**

```typescript
const listeners = new Set<(width: number) => void>()
let currentWidth = window.innerWidth

window.addEventListener("resize", () => {
  currentWidth = window.innerWidth
  listeners.forEach(fn => fn(currentWidth))
})

function useWindowWidth() {
  const [width, setWidth] = useState(currentWidth)
  useEffect(() => {
    listeners.add(setWidth)
    return () => listeners.delete(setWidth)
  }, [])
  return width
}
```
