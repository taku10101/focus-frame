---
title: 遅延状態初期化を使用する
impact: MEDIUM
impactDescription: 毎レンダリングでの無駄な計算を防ぐ
tags: react, hooks, useState, performance, initialization
---

## 遅延状態初期化を使用する

コストのかかる初期値には`useState`に関数を渡してください。関数形式を使わないと、初期化処理は値が一度しか使われないにもかかわらず、毎レンダリングで実行されます。

**悪い例（毎レンダリングで実行される）：**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()は初期化後も毎レンダリングで実行される
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  // queryが変わるたびに、buildSearchIndexが不必要に実行される
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parseが毎レンダリングで実行される
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('settings') || '{}')
  )
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

**良い例（一度だけ実行される）：**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()は初回レンダリング時のみ実行される
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parseは初回レンダリング時のみ実行される
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

localStorage/sessionStorageからの初期値の計算、データ構造（インデックス、マップ）の構築、DOMからの読み取り、重い変換処理を行う場合に遅延初期化を使用してください。

単純なプリミティブ（`useState(0)`）、直接参照（`useState(props.value)`）、安価なリテラル（`useState({})`）の場合、関数形式は不要です。
