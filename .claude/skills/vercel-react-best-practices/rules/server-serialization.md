---
title: RSC境界でのシリアライズを最小化する
impact: HIGH
impactDescription: データ転送サイズを削減する
tags: server, rsc, serialization, props
---

## RSC境界でのシリアライズを最小化する

ReactのServer/Client境界は、すべてのオブジェクトプロパティを文字列にシリアライズし、HTMLレスポンスと後続のRSCリクエストに埋め込みます。このシリアライズされたデータはページの重量と読み込み時間に直接影響するため、**サイズは非常に重要です**。クライアントが実際に使用するフィールドのみを渡してください。

**悪い例（50フィールドすべてをシリアライズする）：**

```tsx
async function Page() {
  const user = await fetchUser()  // 50フィールド
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // 1フィールドのみ使用
}
```

**良い例（1フィールドのみシリアライズする）：**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```
