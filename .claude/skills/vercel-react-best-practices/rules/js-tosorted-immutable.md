---
title: イミュータブルなソートにはtoSorted()を使用する
impact: LOW
impactDescription: 元の配列の意図しない変更を防ぐ
tags: js, immutability, toSorted, arrays
---

## イミュータブルなソートにはtoSorted()を使用する

元の配列を変更しないように、`.sort()`の代わりに`Array.prototype.toSorted()`を使用します。`.sort()`はインプレースで変更しますが、`.toSorted()`は新しい配列を返します。

**悪い例（元の配列を変更する）：**

```typescript
const sorted = items.sort((a, b) => a.name.localeCompare(b.name))
// itemsが変更されてしまう！
```

**良い例（新しい配列を返す）：**

```typescript
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name))
// itemsは変更されない
```
