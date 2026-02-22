---
title: 独立した非同期処理を並列化する
impact: CRITICAL
impactDescription: 逐次ウォーターフォールを解消し、合計待機時間を短縮する
tags: async, parallel, promise-all, waterfall
---

## 独立した非同期処理を並列化する

複数の独立したデータを取得する際は `Promise.all()` を使用します。逐次awaitはウォーターフォールを生み出し、互いに依存していないにもかかわらず各処理が次の処理をブロックします。

**悪い例（逐次実行で低速）：**

```typescript
async function getPageData() {
  const user = await getUser()
  const posts = await getPosts()
  const analytics = await getAnalytics()
  return { user, posts, analytics }
}
```

**良い例（並列実行で高速）：**

```typescript
async function getPageData() {
  const [user, posts, analytics] = await Promise.all([
    getUser(),
    getPosts(),
    getAnalytics()
  ])
  return { user, posts, analytics }
}
```
