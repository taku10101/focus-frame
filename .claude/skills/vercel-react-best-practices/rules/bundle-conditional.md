---
title: モジュールを条件付きで読み込む
impact: CRITICAL
impactDescription: 機能が有効化されるまで重いモジュールが読み込まれるのを防ぐ
tags: bundle, dynamic-import, conditional, lazy-loading
---

## モジュールを条件付きで読み込む

機能が実際に有効化されたときにのみ重いモジュールをインポートします。ファイルの先頭でインポートすると、その機能が一度も使われなくても即座にモジュールが読み込まれます。

**悪い例（重いモジュールを即座に読み込んでいる）：**

```typescript
import confetti from 'canvas-confetti'

async function handlePaymentSuccess() {
  confetti({ particleCount: 100 })
  await sendConfirmationEmail()
}
```

**良い例（必要なときにだけ読み込んでいる）：**

```typescript
async function handlePaymentSuccess() {
  const [{ default: confetti }] = await Promise.all([
    import('canvas-confetti'),
    sendConfirmationEmail()
  ])
  confetti({ particleCount: 100 })
}
```
