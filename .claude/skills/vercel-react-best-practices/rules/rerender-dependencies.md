---
title: エフェクトのプリミティブ依存関係を使用する
impact: MEDIUM
impactDescription: オブジェクトの参照が変わっても値が変わらない場合にエフェクトが再実行されることを防ぐ
tags: rerender, useEffect, dependencies, primitives
---

## エフェクトのプリミティブ依存関係を使用する

オブジェクトからプリミティブ値を取り出し、それをエフェクトの依存関係として使用してください。オブジェクトの参照は値が同じでも毎レンダリングで変わるため、エフェクトが不必要に再実行されます。

**悪い例（毎レンダリングでエフェクトが再実行される）：**

```tsx
function UserProfile({ user }: { user: User }) {
  useEffect(() => {
    analytics.identify(user.id, user.name)
  }, [user])  // userオブジェクトは毎レンダリングで参照が変わる
}
```

**良い例（値が実際に変わったときだけ再実行される）：**

```tsx
function UserProfile({ user }: { user: User }) {
  const { id, name } = user

  useEffect(() => {
    analytics.identify(id, name)
  }, [id, name])  // プリミティブ値で、参照が安定している
}
```
