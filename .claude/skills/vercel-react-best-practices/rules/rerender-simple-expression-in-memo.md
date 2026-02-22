---
title: プリミティブ型の結果を返す単純な式をuseMemoでラップしない
impact: LOW-MEDIUM
impactDescription: 毎レンダリングでの無駄な計算を防ぐ
tags: rerender, useMemo, optimization
---

## プリミティブ型の結果を返す単純な式をuseMemoでラップしない

式が単純（少数の論理演算子または算術演算子）でプリミティブ型の結果（boolean、number、string）を返す場合、`useMemo`でラップしないでください。
`useMemo`の呼び出しとフックの依存関係の比較は、式自体よりも多くのリソースを消費する可能性があります。

**悪い例：**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
  // マークアップを返す
}
```

**良い例：**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // マークアップを返す
}
```
