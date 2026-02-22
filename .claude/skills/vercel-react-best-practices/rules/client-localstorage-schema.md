---
title: localStorageデータのバージョン管理と最小化
impact: MEDIUM
impactDescription: スキーマの競合を防ぎ、パース時間を短縮する
tags: client, localStorage, schema, versioning
---

## localStorageデータのバージョン管理と最小化

スキーマバージョンを使用し、必要なデータのみを保存する。バージョン管理がなければ、互換性のない構造を持つ古いキャッシュデータが実行時エラーを引き起こす。オブジェクト全体を保存するとストレージとパース時間が肥大化する。

**悪い例（バージョン管理なし、オブジェクト全体を保存）：**

```typescript
localStorage.setItem("user", JSON.stringify(user))
const user = JSON.parse(localStorage.getItem("user"))
```

**良い例（バージョン管理あり、最小限のフィールドのみ）：**

```typescript
const SCHEMA_VERSION = 2

function saveUser(user: User) {
  localStorage.setItem("user", JSON.stringify({
    v: SCHEMA_VERSION,
    id: user.id,
    name: user.name,
    // アプリがオフラインで実際に必要なものだけを保存する
  }))
}

function loadUser() {
  const raw = localStorage.getItem("user")
  if (!raw) return null
  const data = JSON.parse(raw)
  if (data.v !== SCHEMA_VERSION) {
    localStorage.removeItem("user")  // 古いデータを削除する
    return null
  }
  return data
}
```
