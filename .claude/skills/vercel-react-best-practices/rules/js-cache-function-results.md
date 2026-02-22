---
title: 関数の結果をキャッシュする
impact: LOW
impactDescription: コストの高い純粋関数の再計算を避ける
tags: js, cache, memoization, performance
---

## 関数の結果をキャッシュする

モジュールレベルのMapにコストの高い純粋関数の結果をキャッシュします。同じ入力を持つ純粋関数は常に同じ出力を返すため、再計算する必要はありません。

**悪い例（呼び出しのたびに再計算する）：**

```typescript
function processData(input: string): Result {
  // コストの高い計算
  return heavyTransform(input)
}
```

**良い例（結果をキャッシュする）：**

```typescript
const cache = new Map<string, Result>()

function processData(input: string): Result {
  if (cache.has(input)) return cache.get(input)!
  const result = heavyTransform(input)
  cache.set(input, result)
  return result
}
```
