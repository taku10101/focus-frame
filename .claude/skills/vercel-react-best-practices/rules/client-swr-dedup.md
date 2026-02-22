---
title: SWRによる自動リクエスト重複排除の使用
impact: MEDIUM
impactDescription: コンポーネントインスタンス間での冗長なAPIコールを防止する
tags: client, swr, deduplication, data-fetching, hooks
---

## SWRによるリクエスト重複排除の使用

同じデータをフェッチする複数のコンポーネントインスタンスは、それぞれ独自のネットワークリクエストを行う。SWRはこれらを単一のリクエストに重複排除する。

**悪い例（各インスタンスが独立してフェッチする）：**

```typescript
function UserProfile() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(setUser)
  }, [])
  return <div>{user?.name}</div>
}

// UserProfileが3回マウントされると、3回フェッチが行われる
```

**良い例（1回のフェッチをインスタンス間で共有する）：**

```typescript
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function UserProfile() {
  const { data: user } = useSWR("/api/user", fetcher)
  return <div>{user?.name}</div>
}

// UserProfileが3回マウントされても、フェッチは1回だけ行われる
```
