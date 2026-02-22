---
title: 関数型setStateの更新を使用する
impact: MEDIUM
impactDescription: 古いクロージャと不要なコールバックの再生成を防ぐ
tags: react, hooks, useState, useCallback, callbacks, closures
---

## 関数型setStateの更新を使用する

現在の状態値に基づいて状態を更新する場合、状態変数を直接参照するのではなく、setStateの関数型更新フォームを使用してください。これにより古いクロージャを防ぎ、不要な依存関係をなくし、安定したコールバック参照を作成します。

**悪い例（依存関係として状態が必要）：**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // コールバックはitemsに依存し、itemsが変わるたびに再生成される
  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])  // ❌ itemsへの依存が再生成を引き起こす
  
  // 依存関係を忘れると古いクロージャのリスクがある
  const removeItem = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id))
  }, [])  // ❌ itemsの依存関係が不足 - 古いitemsを使用する！
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**良い例（安定したコールバック、古いクロージャなし）：**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // 安定したコールバック、再生成されない
  const addItems = useCallback((newItems: Item[]) => {
    setItems(curr => [...curr, ...newItems])
  }, [])  // ✅ 依存関係不要
  
  // 常に最新の状態を使用、古いクロージャのリスクなし
  const removeItem = useCallback((id: string) => {
    setItems(curr => curr.filter(item => item.id !== id))
  }, [])  // ✅ 安全で安定している
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**メリット：**

1. **安定したコールバック参照** - 状態が変わってもコールバックを再生成する必要がない
2. **古いクロージャなし** - 常に最新の状態値で動作する
3. **依存関係が少ない** - 依存配列をシンプルにし、メモリリークを減らす
4. **バグを防ぐ** - Reactのクロージャバグの最も一般的な原因を排除する

**関数型更新を使うべき場合：**

- 現在の状態値に依存するsetState
- 状態が必要なuseCallback/useMemo内
- 状態を参照するイベントハンドラー
- 状態を更新する非同期処理

**直接更新で問題ない場合：**

- 静的な値への状態設定：`setCount(0)`
- props/引数からのみ状態を設定する場合：`setName(newName)`
- 前の値に依存しない状態

**注記：** プロジェクトで[React Compiler](https://react.dev/learn/react-compiler)が有効な場合、コンパイラーが一部のケースを自動的に最適化できますが、正確性と古いクロージャバグを防ぐために関数型更新を引き続き推奨します。
