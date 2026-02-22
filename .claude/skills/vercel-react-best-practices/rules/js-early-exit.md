---
title: 関数から早期リターンする
impact: LOW
impactDescription: 早期終了により不要な計算を削減する
tags: js, performance, early-return, optimization
---

## 関数から早期リターンする

条件が満たされない場合は早期にリターンして、不要なコードの実行を避けます。これによりネストが減り、無駄な計算を防げます。

**悪い例（不要な場合も実行される）：**

```typescript
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      return expensiveOperation(user)
    }
  }
  return null
}
```

**良い例（早期にリターンする）：**

```typescript
function processUser(user: User | null) {
  if (!user) return null
  if (!user.isActive) return null
  return expensiveOperation(user)
}
```
