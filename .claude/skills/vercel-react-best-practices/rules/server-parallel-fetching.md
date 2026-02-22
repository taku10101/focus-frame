---
title: コンポーネント合成による並列データフェッチング
impact: CRITICAL
impactDescription: サーバーサイドのウォーターフォールを排除する
tags: server, rsc, parallel-fetching, composition
---

## コンポーネント合成による並列データフェッチング

React Server Componentsはツリー内で順次実行されます。データフェッチングを並列化するために、コンポーネント合成を使って構造を変更してください。

**悪い例（SidebarはPageのfetchが完了するまで待機する）：**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**良い例（両方が同時にfetchする）：**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

**childrenプロップを使った代替案：**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  )
}
```
