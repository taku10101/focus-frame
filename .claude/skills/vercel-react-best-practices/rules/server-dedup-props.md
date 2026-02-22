---
title: RSC Propsにおける重複シリアライズを避ける
impact: LOW
impactDescription: 重複シリアライズを避けることでネットワークペイロードを削減する
tags: server, rsc, serialization, props, client-components
---

## RSC Propsにおける重複シリアライズを避ける

RSCからクライアントへのシリアライズは、値ではなくオブジェクトの参照によって重複排除されます。同じ参照 = 1回のシリアライズ；新しい参照 = 再度シリアライズ。変換処理（`.toSorted()`・`.filter()`・`.map()`）はサーバーではなくクライアントで行ってください。

**悪い例（配列が重複する）：**

```tsx
// RSC: 6文字列を送信（2配列 × 3アイテム）
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />
```

**良い例（3文字列のみ送信）：**

```tsx
// RSC: 1回だけ送信
<ClientList usernames={usernames} />

// クライアント: そこで変換する
'use client'
const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

**ネストされた重複排除の動作：**

重複排除は再帰的に機能します。影響はデータ型によって異なります：

- `string[]`・`number[]`・`boolean[]`: **影響大** - 配列とすべてのプリミティブが完全に重複する
- `object[]`: **影響小** - 配列は重複するが、ネストされたオブジェクトは参照により重複排除される

```tsx
// string[] - すべてが重複する
usernames={['a','b']} sorted={usernames.toSorted()} // 4文字列を送信

// object[] - 配列構造のみ重複する
users={[{id:1},{id:2}]} sorted={users.toSorted()} // 2配列 + 2ユニークオブジェクト（4つではない）
```

**重複排除を破る操作（新しい参照を生成する）：**

- 配列: `.toSorted()`・`.filter()`・`.map()`・`.slice()`・`[...arr]`
- オブジェクト: `{...obj}`・`Object.assign()`・`structuredClone()`・`JSON.parse(JSON.stringify())`

**その他の例：**

```tsx
// ❌ 悪い例
<C users={users} active={users.filter(u => u.active)} />
<C product={product} productName={product.name} />

// ✅ 良い例
<C users={users} />
<C product={product} />
// フィルタリング・分割代入はクライアントで行う
```

**例外：** 変換コストが高い場合や、クライアントが元のデータを必要としない場合は、派生データを渡すことができます。
