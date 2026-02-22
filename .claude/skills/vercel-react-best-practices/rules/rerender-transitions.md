---
title: 緊急でない更新にTransitionを使用する
impact: MEDIUM
impactDescription: UIのレスポンシブ性を維持する
tags: rerender, transitions, startTransition, performance
---

## 緊急でない更新にTransitionを使用する

頻繁で緊急でない状態の更新をtransitionとしてマークし、UIのレスポンシブ性を維持します。

**悪い例（スクロールのたびにUIをブロックする）：**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**良い例（ノンブロッキングな更新）：**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```
