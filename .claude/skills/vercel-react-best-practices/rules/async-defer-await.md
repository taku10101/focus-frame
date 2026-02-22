---
title: 必要になるまでawaitを遅らせる
impact: CRITICAL
impactDescription: 値が一方の分岐でしか必要とされない場合の不要なブロッキングを防ぐ
tags: async, await, waterfall, performance
---

## 必要になるまでawaitを遅らせる

`await` はPromiseを作成する箇所ではなく、値を実際に使用する箇所に移動させます。Promiseを開始した直後にawaitすると、値が特定の分岐でしか必要とされない場合でも不必要に実行をブロックします。

**悪い例（値が必要になる前にawaitしている）：**

```typescript
async function getUser(id: string) {
  const user = await db.user.findFirst({ where: { id } })

  if (!user) {
    // ログを開始しているが、userが存在しない場合はそもそも開始すべきでない
    const log = await buildLogEntry(user)
    await saveLog(log)
    return null
  }

  return user
}
```

**良い例（値を使用する箇所までawaitを遅らせている）：**

```typescript
async function getUser(id: string) {
  const user = await db.user.findFirst({ where: { id } })
  if (!user) return null

  const log = await buildLogEntry(user)
  await saveLog(log)
  return user
}
```
