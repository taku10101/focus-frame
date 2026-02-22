---
title: 派生状態を購読する
impact: MEDIUM
impactDescription: 再レンダリングの頻度を削減する
tags: rerender, derived-state, media-query, optimization
---

## 派生状態を購読する

再レンダリングの頻度を減らすために、連続する値ではなく派生したboolean状態を購読してください。

**悪い例（ピクセル変化ごとに再レンダリングされる）：**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // 連続的に更新される
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

**良い例（booleanが変わったときだけ再レンダリングされる）：**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```
