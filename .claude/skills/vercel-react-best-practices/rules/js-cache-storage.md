---
title: localStorageの読み取りをキャッシュする
impact: LOW
impactDescription: 繰り返しのシリアライズオーバーヘッドを避ける
tags: js, localStorage, cache, performance
---

## localStorageの読み取りをキャッシュする

`localStorage`と`sessionStorage`の読み取りをメモリ内にキャッシュします。ストレージアクセスはシリアライズ/デシリアライズを伴うため、一度読み取ってキャッシュすることで繰り返しのオーバーヘッドを避けられます。

**悪い例（アクセスのたびにストレージを読み取る）：**

```typescript
function getTheme() {
  return localStorage.getItem('theme') || 'light'
}
```

**良い例（一度読み取ってキャッシュから返す）：**

```typescript
let cachedTheme: string | null = null

function getTheme() {
  if (!cachedTheme) {
    cachedTheme = localStorage.getItem('theme') || 'light'
  }
  return cachedTheme
}
```
