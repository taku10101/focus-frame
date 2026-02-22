---
title: 一時的な値にはuseRefを使用する
impact: MEDIUM
impactDescription: 頻繁な更新による不要な再レンダリングを防ぐ
tags: rerender, useref, state, performance
---

## 一時的な値にはuseRefを使用する

値が頻繁に変わり、更新のたびに再レンダリングしたくない場合（マウストラッカー、インターバル、一時的なフラグなど）、`useState`の代わりに`useRef`に格納してください。UIには状態を使い、DOM隣接の一時的な値にはrefを使用してください。refの更新は再レンダリングを引き起こしません。

**悪い例（毎更新でレンダリングされる）：**

```tsx
function Tracker() {
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setLastX(e.clientX)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: lastX,
        width: 8,
        height: 8,
        background: 'black',
      }}
    />
  )
}
```

**良い例（トラッキングで再レンダリングなし）：**

```tsx
function Tracker() {
  const lastXRef = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX
      const node = dotRef.current
      if (node) {
        node.style.transform = `translateX(${e.clientX}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        background: 'black',
        transform: 'translateX(0px)',
      }}
    />
  )
}
```
