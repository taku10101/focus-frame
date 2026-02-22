---
title: イベントハンドラーをRefに格納する
impact: LOW
impactDescription: 依存配列を追加せずにステールなクロージャを防ぐ
tags: advanced, refs, event-handlers, closures
---

## イベントハンドラーをRefに格納する

イベントハンドラーをrefに格納することで、常に最新バージョンを呼び出す安定した関数参照を取得します。これにより、依存配列を必要とせずにステールなクロージャを防ぐことができます。

**悪い例（ステールなクロージャまたは不安定な参照）：**

```tsx
function Component({ onEvent }: { onEvent: () => void }) {
  useEffect(() => {
    // onEventの参照はレンダリングごとに変わる
    window.addEventListener('keydown', onEvent)
    return () => window.removeEventListener('keydown', onEvent)
  }, [onEvent])  // エフェクトはレンダリングごとに再実行される
}
```

**良い例（安定したref、常に最新を呼び出す）：**

```tsx
function Component({ onEvent }: { onEvent: () => void }) {
  const onEventRef = useRef(onEvent)
  useLayoutEffect(() => { onEventRef.current = onEvent })

  useEffect(() => {
    const handler = () => onEventRef.current()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])  // 依存配列が不要
}
```
