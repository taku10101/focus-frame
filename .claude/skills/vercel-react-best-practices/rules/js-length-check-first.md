---
title: コストの高い操作の前に配列の長さを確認する
impact: LOW
impactDescription: 空の配列に対するコストの高い比較をショートサーキットする
tags: js, performance, arrays, optimization
---

## コストの高い操作の前に配列の長さを確認する

コストの高い比較を行う前に配列の長さを確認します。空配列のチェックはO(1)であり、コストの高い操作をショートサーキットできます。

**悪い例（常にコストの高い比較を実行する）：**

```typescript
if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
  // ...
}
```

**良い例（長さが異なる場合は比較をスキップする）：**

```typescript
if (arr1.length === arr2.length && JSON.stringify(arr1) === JSON.stringify(arr2)) {
  // ...
}
```
