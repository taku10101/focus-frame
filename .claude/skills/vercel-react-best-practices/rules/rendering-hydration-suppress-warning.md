---
title: 想定済みのハイドレーションミスマッチを抑制する
impact: LOW
impactDescription: 既知の意図的なミスマッチによるノイズをなくす
tags: rendering, hydration, suppressHydrationWarning
---

## 想定済みのハイドレーションミスマッチを抑制する

タイムスタンプやユーザー固有のデータなど、サーバーとクライアントで意図的に異なる値には`suppressHydrationWarning`を使用します。

**悪い例（コンソール警告が出力される）：**

```tsx
<time>{new Date().toLocaleString()}</time>
```

**良い例（既知のミスマッチを抑制する）：**

```tsx
<time suppressHydrationWarning>{new Date().toLocaleString()}</time>
```

バグを隠すためではなく、既知の意図的なミスマッチにのみ使用してください。
