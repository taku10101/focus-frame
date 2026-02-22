---
title: リクエスト間のLRUキャッシュ
impact: HIGH
impactDescription: リクエスト間でキャッシュを共有する
tags: server, cache, lru, cross-request
---

## リクエスト間のLRUキャッシュ

`React.cache()`は1つのリクエスト内でのみ機能します。連続するリクエスト間で共有されるデータ（ユーザーがボタンAを押した後にボタンBを押すなど）には、LRUキャッシュを使用してください。

**実装例：**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5分
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// リクエスト1: DBクエリを実行し、結果をキャッシュ
// リクエスト2: キャッシュヒット、DBクエリなし
```

連続するユーザー操作が数秒以内に同じデータを必要とする複数のエンドポイントにアクセスする場合に使用します。

**Vercelの[Fluid Compute](https://vercel.com/docs/fluid-compute)との組み合わせ：** 複数の並行リクエストが同じ関数インスタンスとキャッシュを共有できるため、LRUキャッシュは特に効果的です。これにより、Redisのような外部ストレージを必要とせず、リクエスト間でキャッシュが永続します。

**従来のサーバーレス環境：** 各呼び出しは独立して実行されるため、プロセス間のキャッシュにはRedisの使用を検討してください。

参考: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
