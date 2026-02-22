---
title: ホバー/フォーカス時のプリロードによる体感速度の向上
impact: HIGH
impactDescription: 実際のロード時間を変えずに体感パフォーマンスを向上させる
tags: bundle, preload, hover, performance
---

## ホバー/フォーカス時のプリロード

ユーザーがトリガー要素にホバーまたはフォーカスしたときにモジュールのプリロードを開始する。クリックするころには、モジュールはすでにロード済みになっている。

**悪い例（クリック時にロード、ユーザーが待たされる）：**

```typescript
function AdminButton() {
  const [AdminPanel, setAdminPanel] = useState(null)

  async function handleClick() {
    const { default: Panel } = await import("./AdminPanel")
    setAdminPanel(Panel)
  }

  return <button onClick={handleClick}>Open Admin</button>
}
```

**良い例（ホバー時にプリロード、クリック時に即座に表示）：**

```typescript
function AdminButton() {
  const adminPanelPromise = useRef(null)

  function handleHover() {
    // ユーザーの意図が示されたらすぐにロードを開始する
    adminPanelPromise.current ??= import("./AdminPanel")
  }

  async function handleClick() {
    // ユーザーがクリックするときにはモジュールはすでにロード済み
    const { default: Panel } = await adminPanelPromise.current
    openPanel(Panel)
  }

  return (
    <button onMouseEnter={handleHover} onFocus={handleHover} onClick={handleClick}>
      Open Admin
    </button>
  )
}
```
