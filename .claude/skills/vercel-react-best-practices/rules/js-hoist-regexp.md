---
title: 正規表現をループの外にホイストする
impact: LOW
impactDescription: イテレーションのたびに新しいRegExpオブジェクトが生成されるのを防ぐ
tags: js, regexp, performance, loops
---

## 正規表現をループの外にホイストする

正規表現はループの外で定義します。`new RegExp()`は呼び出しのたびに新しいオブジェクトを生成するため、ループの外に移動して一度だけ生成するようにします。

**悪い例（イテレーションのたびに新しいRegExpを生成する）：**

```typescript
for (const item of items) {
  if (new RegExp('^prefix_').test(item.name)) {
    process(item)
  }
}
```

**良い例（RegExpを一度だけ生成する）：**

```typescript
const prefixPattern = /^prefix_/
for (const item of items) {
  if (prefixPattern.test(item.name)) {
    process(item)
  }
}
```
