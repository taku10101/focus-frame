---
title: 依存関係に基づく並列化
impact: CRITICAL
impactDescription: 実際の依存関係に基づいて並列性を最大化する
tags: async, parallel, dependencies, waterfall, promises
---

## 依存関係に基づく並列化

実際の依存関係に基づいて処理を並列実行します。処理を進めるために本当に必要なものだけをawaitし、独立した処理はできるだけ早く開始します。完全に独立した処理には `Promise.all()` を使用し、部分的に依存するチェーンには手動でPromiseを開始します。

**悪い例（処理が独立しているにもかかわらず完全に逐次実行している）：**

```typescript
async function getDashboardData(userId: string) {
  const user = await getUser(userId)
  const orders = await getOrders(userId)  // userを必要としない
  const recommendations = await getRecommendations(userId)  // userもordersも必要としない
  return { user, orders, recommendations }
}
```

**良い例（独立した処理を並列化している）：**

```typescript
async function getDashboardData(userId: string) {
  const [user, orders, recommendations] = await Promise.all([
    getUser(userId),
    getOrders(userId),
    getRecommendations(userId)
  ])
  return { user, orders, recommendations }
}
```

**良い例（部分的な依存関係 - 早めに開始して後でawaitする）：**

```typescript
async function getPageData(userId: string) {
  // 即座に開始できるものをすべて開始する
  const userPromise = getUser(userId)
  const analyticsPromise = getAnalytics(userId)

  // 次のステップをアンブロックするために必要なものをawaitする
  const user = await userPromise

  // userに依存する処理を開始し、その後analyticsをawaitする
  const postsPromise = getPosts(user.id)
  const analytics = await analyticsPromise

  // 残りをawaitする
  const posts = await postsPromise
  return { user, analytics, posts }
}
```
