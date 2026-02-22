---
title: メモ化されたコンポーネントへの切り出し
impact: MEDIUM
impactDescription: 早期リターンを可能にする
tags: rerender, memo, useMemo, optimization
---

## メモ化されたコンポーネントへの切り出し

コストのかかる処理をメモ化されたコンポーネントに切り出すことで、計算前に早期リターンできるようにします。

**悪い例（ローディング中もアバターを計算してしまう）：**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**良い例（ローディング中は計算をスキップする）：**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

**注記：** プロジェクトで[React Compiler](https://react.dev/learn/react-compiler)が有効な場合、`memo()`と`useMemo()`による手動のメモ化は不要です。コンパイラーが自動的に再レンダリングを最適化します。
