---
title: 戦略的なSuspenseバウンダリ
impact: CRITICAL
impactDescription: ストリーミングを有効にして高速なコンテンツのブロッキングを解消する
tags: async, suspense, streaming, next.js
---

## 戦略的なSuspenseバウンダリ

Suspenseバウンダリを使用してコンテンツをストリーミングします。読み込みが遅いセクションがページ全体をブロックするのではなく、高速なセクションは即座にレンダリングされ、遅いセクションは準備ができ次第ストリーミングされます。

**悪い例（ページ全体が最も遅いクエリを待っている）：**

```tsx
async function Page() {
  const [user, posts, analytics] = await Promise.all([
    getUser(),    // 10ms
    getPosts(),   // 100ms
    getAnalytics() // 1000ms ← ページ全体がここまでブロックされる
  ])

  return (
    <div>
      <Profile user={user} />
      <Feed posts={posts} />
      <Analytics data={analytics} />
    </div>
  )
}
```

**良い例（高速なコンテンツを先にレンダリングし、遅いコンテンツをストリーミングする）：**

```tsx
async function Analytics() {
  const data = await getAnalytics()  // このセクションだけが待機する
  return <Chart data={data} />
}

async function Page() {
  const [user, posts] = await Promise.all([
    getUser(),   // 10ms
    getPosts(),  // 100ms
  ])

  return (
    <div>
      <Profile user={user} />
      <Feed posts={posts} />
      <Suspense fallback={<Skeleton />}>
        <Analytics />  {/* 準備ができたらストリーミングされる */}
      </Suspense>
    </div>
  )
}
```
