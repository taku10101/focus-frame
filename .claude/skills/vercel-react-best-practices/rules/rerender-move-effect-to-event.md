---
title: インタラクションロジックはイベントハンドラーに置く
impact: MEDIUM
impactDescription: エフェクトの再実行と副作用の重複を防ぐ
tags: rerender, useEffect, events, side-effects, dependencies
---

## インタラクションロジックはイベントハンドラーに置く

副作用が特定のユーザーアクション（送信、クリック、ドラッグ）によって引き起こされる場合、そのイベントハンドラー内で実行してください。アクションを状態＋エフェクトとしてモデル化しないでください。それによりエフェクトが無関係な変更で再実行され、アクションが重複する可能性があります。

**悪い例（イベントを状態＋エフェクトとしてモデル化している）：**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (submitted) {
      post('/api/register')
      showToast('Registered', theme)
    }
  }, [submitted, theme])

  return <button onClick={() => setSubmitted(true)}>Submit</button>
}
```

**良い例（ハンドラー内で実行する）：**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('Registered', theme)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

参考：[Should this code move to an event handler?](https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler)
