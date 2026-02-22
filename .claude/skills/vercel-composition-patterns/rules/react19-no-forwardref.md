---
title: React 19のAPI変更
impact: MEDIUM
impactDescription: よりクリーンなコンポーネント定義とコンテキスト利用
tags: react19, refs, context, hooks
---

## React 19のAPI変更

> **⚠️ React 19以降のみ。** React 18以前を使用している場合はスキップしてください。

React 19では `ref` が通常のプロップになりました（`forwardRef` のラッパー不要）。
また `useContext()` の代わりに `use()` を使います。

**悪い例（React 19でforwardRefを使う）：**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**良い例（refを通常のプロップとして受け取る）：**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**悪い例（React 19でuseContextを使う）：**

```tsx
const value = useContext(MyContext)
```

**良い例（useContextの代わりにuseを使う）：**

```tsx
const value = use(MyContext)
```

`use()` は `useContext()` と異なり、条件分岐の中でも呼び出せます。
