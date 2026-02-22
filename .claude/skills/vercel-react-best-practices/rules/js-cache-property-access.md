---
title: ループ内のオブジェクトプロパティアクセスをキャッシュする
impact: LOW
impactDescription: タイトなループでの繰り返しプロパティルックアップを削減する
tags: js, performance, loops, property-access
---

## ループ内のオブジェクトプロパティアクセスをキャッシュする

ループの前に頻繁にアクセスするオブジェクトのプロパティをローカル変数に格納します。プロパティアクセスのたびにルックアップが発生するため、一度キャッシュするとタイトなループでのオーバーヘッドが削減されます。

**悪い例（繰り返しのプロパティアクセス）：**

```typescript
for (let i = 0; i < items.length; i++) {
  process(items[i], config.threshold, config.multiplier)
}
```

**良い例（プロパティアクセスをキャッシュする）：**

```typescript
const { threshold, multiplier } = config
const len = items.length
for (let i = 0; i < len; i++) {
  process(items[i], threshold, multiplier)
}
```
