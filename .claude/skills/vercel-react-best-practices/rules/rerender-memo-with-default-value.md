---
title: メモ化されたコンポーネントのデフォルト非プリミティブパラメーター値を定数に切り出す
impact: MEDIUM
impactDescription: デフォルト値に定数を使うことでメモ化を回復させる
tags: rerender, memo, optimization
---

## メモ化されたコンポーネントのデフォルト非プリミティブパラメーター値を定数に切り出す

メモ化されたコンポーネントが配列・関数・オブジェクトなどの非プリミティブなオプションパラメーターにデフォルト値を持つ場合、そのパラメーターなしでコンポーネントを呼び出すとメモ化が機能しなくなります。これは毎再レンダリングで新しい値のインスタンスが生成され、`memo()`の厳密な等値比較を通過できないためです。

この問題を解決するには、デフォルト値を定数に切り出してください。

**悪い例（`onClick`が毎再レンダリングで異なる値を持つ）：**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) {
  // ...
})

// オプションのonClickなしで使用
<UserAvatar />
```

**良い例（安定したデフォルト値）：**

```tsx
const NOOP = () => {};

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) {
  // ...
})

// オプションのonClickなしで使用
<UserAvatar />
```
