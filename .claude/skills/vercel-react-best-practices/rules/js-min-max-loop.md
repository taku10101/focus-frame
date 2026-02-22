---
title: ソートではなくループで最小値/最大値を求める
impact: LOW
impactDescription: O(n log n)のソートをO(n)のスキャンに削減する
tags: js, performance, sort, min-max, optimization
---

## ソートではなくループで最小値/最大値を求める

配列をソートする代わりに単一のループで最小値/最大値を求めます。ソートはO(n log n)ですが、ループはO(n)です。

**悪い例（1つの値のために配列全体をソートする）：**

```typescript
const max = [...items].sort((a, b) => b.value - a.value)[0].value
const min = [...items].sort((a, b) => a.value - b.value)[0].value
```

**良い例（単一のO(n)パス）：**

```typescript
let max = -Infinity
let min = Infinity
for (const item of items) {
  if (item.value > max) max = item.value
  if (item.value < min) min = item.value
}
```
