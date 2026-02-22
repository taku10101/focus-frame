---
title: ローディング状態にはuseTransitionを優先する
impact: MEDIUM
impactDescription: boolean型のローディング状態によるレイアウトのガタつきを防ぐ
tags: rendering, useTransition, loading, performance
---

## ローディング状態にはuseTransitionを優先する

独立したboolean状態の代わりに`useTransition`を使用してトランジションのローディング状態を管理します。これによりUIの応答性を保ち、不要な中間レンダリングを避けられます。

**悪い例（独立したローディング状態が余分なレンダリングを引き起こす）：**

```tsx
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleSearch(q: string) {
    setIsLoading(true)
    setQuery(q)
    const data = await search(q)
    setResults(data)
    setIsLoading(false)
  }

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {isLoading ? <Spinner /> : <ResultsList results={results} />}
    </div>
  )
}
```

**良い例（useTransitionがローディングを自動管理する）：**

```tsx
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleSearch(q: string) {
    startTransition(async () => {
      setQuery(q)
      const data = await search(q)
      setResults(data)
    })
  }

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </div>
  )
}
```
