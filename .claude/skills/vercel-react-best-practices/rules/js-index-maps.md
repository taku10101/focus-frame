---
title: 繰り返しルックアップ用にインデックスマップを構築する
impact: LOW
impactDescription: 繰り返しアクセスのO(n)ルックアップをO(1)に削減する
tags: js, performance, map, lookup, optimization
---

## 繰り返しルックアップ用にインデックスマップを構築する

キーでアイテムを繰り返し検索する必要がある場合、O(1)ルックアップのために`Map`を構築します。配列の`.find()`はO(n)であり、大きなデータセットで繰り返し呼び出すと低速になります。

**悪い例（O(n)ルックアップを繰り返す）：**

```typescript
function getOrderItems(orders: Order[], productIds: string[]) {
  return productIds.map(id =>
    orders.find(order => order.productId === id)  // 毎回O(n)
  )
}
```

**良い例（MapでO(1)ルックアップ）：**

```typescript
function getOrderItems(orders: Order[], productIds: string[]) {
  const orderMap = new Map(orders.map(order => [order.productId, order]))
  return productIds.map(id => orderMap.get(id))  // 毎回O(1)
}
```
