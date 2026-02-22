---
title: クライアント専用データのフリッカーをなくす
impact: MEDIUM
impactDescription: ハイドレーション時に誤ったコンテンツが一瞬表示されるのを防ぐ
tags: rendering, hydration, ssr, flicker, inline-script
---

## クライアント専用データのフリッカーをなくす

Reactがハイドレーションを行う前にインラインスクリプトでクライアント専用の値を設定します。これがないと、サーバーとクライアントで異なる値がレンダリングされ、見た目に分かるフラッシュが発生します。

**悪い例（ハイドレーション時にフリッカーが起きる）：**

```tsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // ハイドレーション後に実行されるため、フリッカーが発生する
    const stored = localStorage.getItem('theme')
    if (stored) setTheme(stored)
  }, [])

  return <div data-theme={theme}>{children}</div>
}
```

**良い例（フリッカーなし）：**

```tsx
// ルートレイアウトまたは _document.tsx 内
<script dangerouslySetInnerHTML={{
  __html: `
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
  `
}} />

function ThemeProvider({ children }) {
  // サーバーとクライアントで一致する：属性から読み取る
  const [theme] = useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') || 'light'
      : 'light'
  )
  return <div data-theme={theme}>{children}</div>
}
```
