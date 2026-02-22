---
title: React.cache()によるリクエスト内の重複排除
impact: MEDIUM
impactDescription: リクエスト内で重複を排除する
tags: server, cache, react-cache, deduplication
---

## React.cache()によるリクエスト内の重複排除

サーバーサイドのリクエスト重複排除には`React.cache()`を使用します。認証とデータベースクエリで最も効果を発揮します。

**使い方：**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})
```

1つのリクエスト内では、`getCurrentUser()`を複数回呼び出してもクエリは1度しか実行されません。

**インラインオブジェクトを引数として渡さない：**

`React.cache()`はキャッシュヒットの判定に浅い等価性（`Object.is`）を使用します。インラインオブジェクトは呼び出しごとに新しい参照を生成するため、キャッシュヒットが発生しません。

**悪い例（常にキャッシュミス）：**

```typescript
const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// 呼び出しごとに新しいオブジェクトが生成され、キャッシュヒットしない
getUser({ uid: 1 })
getUser({ uid: 1 })  // キャッシュミス、クエリを再実行
```

**良い例（キャッシュヒット）：**

```typescript
const getUser = cache(async (uid: number) => {
  return await db.user.findUnique({ where: { id: uid } })
})

// プリミティブ型の引数は値の等価性を使用
getUser(1)
getUser(1)  // キャッシュヒット、キャッシュされた結果を返す
```

オブジェクトを渡す必要がある場合は、同じ参照を渡してください：

```typescript
const params = { uid: 1 }
getUser(params)  // クエリを実行
getUser(params)  // キャッシュヒット（同じ参照）
```

**Next.js固有の注意事項：**

Next.jsでは、`fetch` APIはリクエストメモ化によって自動的に拡張されています。同じURLとオプションを持つリクエストは1つのリクエスト内で自動的に重複排除されるため、`fetch`呼び出しに`React.cache()`は不要です。ただし、`React.cache()`はその他の非同期タスクにとって引き続き重要です：

- データベースクエリ（Prisma、Drizzleなど）
- 重い計算処理
- 認証チェック
- ファイルシステム操作
- fetch以外のすべての非同期処理

コンポーネントツリー全体でこれらの処理を重複排除するために`React.cache()`を使用してください。

参考: [React.cacheのドキュメント](https://react.dev/reference/react/cache)
