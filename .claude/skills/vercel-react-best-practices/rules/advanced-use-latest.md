---
title: 安定したコールバックRefのためのuseLatest
impact: LOW
impactDescription: 依存配列なしで最新のコールバックへの安定したrefを提供する
tags: advanced, refs, callbacks, hooks
---

## 安定したコールバックRefのためのuseLatest

`useLatest`フックを使って、常にコールバックの最新バージョンを指す安定したrefを取得します。これにより、コールバックを依存配列に含める必要がなくなります。

**実装例：**

```tsx
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => { ref.current = value })
  return ref
}
```

**使い方：**

```tsx
function Component({ onScroll }: { onScroll: () => void }) {
  const onScrollRef = useLatest(onScroll)

  useEffect(() => {
    const handler = () => onScrollRef.current()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])  // onScrollへの依存が不要
}
```
