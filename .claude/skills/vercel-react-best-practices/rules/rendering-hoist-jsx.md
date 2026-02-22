---
title: 静的JSXをコンポーネント外にホイストする
impact: MEDIUM
impactDescription: レンダリングのたびに不要なオブジェクトが生成されるのを防ぐ
tags: rendering, optimization, jsx, hoisting
---

## 静的JSXをコンポーネント外にホイストする

propsや状態に依存しないJSXをコンポーネント関数の外に移動します。JSXはレンダリングのたびに新しいオブジェクトを生成しますが、外部で定義された静的JSXは一度だけ生成されます。

**悪い例（レンダリングのたびに新しいオブジェクトを生成する）：**

```tsx
function Layout({ children }) {
  const header = (
    <header>
      <Logo />
      <Nav />
    </header>
  )

  return (
    <div>
      {header}
      {children}
    </div>
  )
}
```

**良い例（一度だけ生成され、レンダリングのたびに再利用される）：**

```tsx
const header = (
  <header>
    <Logo />
    <Nav />
  </header>
)

function Layout({ children }) {
  return (
    <div>
      {header}
      {children}
    </div>
  )
}
```
