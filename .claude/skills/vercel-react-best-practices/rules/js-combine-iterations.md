---
title: 複数のイテレーションを1つのループにまとめる
impact: LOW
impactDescription: イテレーション数をO(n*m)からO(n)に削減する
tags: js, performance, loops, optimization
---

## 複数のイテレーションを1つのループにまとめる

同じ配列を処理する場合、複数の`filter`/`map`操作を単一のループにまとめます。チェーンされた各操作は中間配列を生成し、データセット全体を走査します。

**悪い例（複数回のパス）：**

```typescript
const result = items
  .filter(item => item.active)
  .map(item => item.name)
  .filter(name => name.length > 3)
```

**良い例（単一パス）：**

```typescript
const result: string[] = []
for (const item of items) {
  if (item.active && item.name.length > 3) {
    result.push(item.name)
  }
}
```
