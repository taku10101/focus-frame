---
title: O(1)ルックアップにSet/Mapを使用する
impact: LOW
impactDescription: 繰り返しのarray includes()をO(n)からO(1)に削減する
tags: js, performance, Set, Map, lookup
---

## O(1)ルックアップにSet/Mapを使用する

繰り返しのメンバーシップチェックには`Array.includes()`の代わりに`Set.has()`を使用します。配列のルックアップはO(n)ですが、Setのルックアップはo(1)です。

**悪い例（チェックごとにO(n)）：**

```typescript
const allowedRoles = ['admin', 'editor', 'moderator']
if (allowedRoles.includes(user.role)) { ... }
```

**良い例（チェックごとにO(1)）：**

```typescript
const allowedRoles = new Set(['admin', 'editor', 'moderator'])
if (allowedRoles.has(user.role)) { ... }
```
