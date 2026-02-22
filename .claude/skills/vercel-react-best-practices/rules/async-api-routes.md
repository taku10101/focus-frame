---
title: APIルートでPromiseを早めに開始する
impact: CRITICAL
impactDescription: APIルートにおけるウォーターフォール連鎖を解消する
tags: async, api-routes, promises, waterfall
---

## APIルートでPromiseを早めに開始する

APIルートハンドラーでは、独立したPromiseをすべて即座に開始し、値が必要になるまでawaitしないようにします。これにより、本来逐次的に行われる処理を並列化できます。

**悪い例（逐次ウォーターフォール）：**

```typescript
export async function GET() {
  const user = await getUser()
  const analytics = await getAnalytics()
  const ads = await getAds()
  
  return Response.json({ user, analytics, ads })
}
```

**良い例（並列実行）：**

```typescript
export async function GET() {
  const userPromise = getUser()
  const analyticsPromise = getAnalytics()
  const adsPromise = getAds()
  
  const user = await userPromise
  const analytics = await analyticsPromise
  const ads = await adsPromise
  
  return Response.json({ user, analytics, ads })
}
```
