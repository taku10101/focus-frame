---
title: Server ActionsをAPIルートと同様に認証する
impact: CRITICAL
impactDescription: サーバーミューテーションへの不正アクセスを防止する
tags: server, server-actions, authentication, security, authorization
---

## Server ActionsをAPIルートと同様に認証する

**影響度: CRITICAL（サーバーミューテーションへの不正アクセスを防止する）**

Server Actions（`"use server"`を持つ関数）は、APIルートと同様に公開エンドポイントとして公開されます。Server Actionsは直接呼び出せるため、ミドルウェア・レイアウトガード・ページレベルのチェックだけに頼らず、各Server Actionの**内部**で必ず認証と認可を検証してください。

Next.jsのドキュメントには明示的に記載されています：「Server Actionsは公開向けAPIエンドポイントと同じセキュリティ上の考慮事項を持って扱い、ユーザーがミューテーションを実行する権限があるかを検証してください。」

**悪い例（認証チェックなし）：**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // 誰でも呼び出せる！認証チェックなし
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**良い例（アクション内での認証）：**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // アクション内で必ず認証をチェック
  const session = await verifySession()
  
  if (!session) {
    throw unauthorized('ログインが必要です')
  }
  
  // 認可もチェック
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('他のユーザーを削除できません')
  }
  
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**入力バリデーション付きの例：**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function updateProfile(data: unknown) {
  // まず入力をバリデート
  const validated = updateProfileSchema.parse(data)
  
  // 次に認証
  const session = await verifySession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  // 次に認可
  if (session.user.id !== validated.userId) {
    throw new Error('自分のプロフィールのみ更新できます')
  }
  
  // 最後にミューテーションを実行
  await db.user.update({
    where: { id: validated.userId },
    data: {
      name: validated.name,
      email: validated.email
    }
  })
  
  return { success: true }
}
```

参考: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)
