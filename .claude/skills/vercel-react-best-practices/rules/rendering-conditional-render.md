---
title: 条件付きレンダリングには三項演算子を使用する
impact: LOW
impactDescription: countがfalsyな値のとき0がレンダリングされるのを防ぐ
tags: rendering, conditional, jsx, falsy
---

## 条件付きレンダリングには三項演算子を使用する

左辺が`0`のようなfalsyな非boolean値になりうる場合、条件付きレンダリングに`&&`ではなく三項演算子を使用します。Reactは`0`をDOMにレンダリングするため、予期しない表示結果になることがあります。

**悪い例（countが0のとき"0"がレンダリングされる）：**

```tsx
function MessageList({ count, messages }) {
  return (
    <div>
      {count && <p>{count} messages</p>}
    </div>
  )
}
```

**良い例（countが0のとき何もレンダリングされない）：**

```tsx
function MessageList({ count, messages }) {
  return (
    <div>
      {count ? <p>{count} messages</p> : null}
    </div>
  )
}
```
