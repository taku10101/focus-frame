---
title: 重いコンポーネントを動的インポートする
impact: CRITICAL
impactDescription: 初期バンドルから重いコンポーネントを除外する
tags: bundle, dynamic-import, next-dynamic, code-splitting
---

## 重いコンポーネントを動的インポートする

`next/dynamic` を使用して、必要なときにのみ重いコンポーネントを読み込みます。これにより初期バンドルを小さく保てます。

**悪い例（初期バンドルに重いエディターが含まれている）：**

```typescript
import RichTextEditor from './RichTextEditor'

function Page() {
  return <RichTextEditor />
}
```

**良い例（レンダリングされたときにのみエディターを読み込んでいる）：**

```typescript
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <Skeleton />,
})

function Page() {
  return <RichTextEditor />
}
```
