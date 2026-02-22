---
title: ノンブロッキング処理にafter()を使用する
impact: MEDIUM
impactDescription: レスポンス時間の高速化
tags: server, async, logging, analytics, side-effects
---

## ノンブロッキング処理にafter()を使用する

Next.jsの`after()`を使用して、レスポンス送信後に実行すべき処理をスケジュールします。これにより、ロギング・アナリティクス・その他の副作用がレスポンスをブロックするのを防ぎます。

**悪い例（レスポンスをブロックする）：**

```tsx
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // ミューテーションを実行
  await updateDatabase(request)
  
  // ロギングがレスポンスをブロックする
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**良い例（ノンブロッキング）：**

```tsx
import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // ミューテーションを実行
  await updateDatabase(request)
  
  // レスポンス送信後にログを記録
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'
    
    logUserAction({ sessionCookie, userAgent })
  })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

レスポンスは即座に送信され、ロギングはバックグラウンドで行われます。

**主なユースケース：**

- アナリティクストラッキング
- 監査ログ
- 通知の送信
- キャッシュの無効化
- クリーンアップタスク

**重要な注意事項：**

- `after()`はレスポンスが失敗またはリダイレクトされた場合でも実行される
- Server Actions・Route Handlers・Server Componentsで動作する

参考: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)
