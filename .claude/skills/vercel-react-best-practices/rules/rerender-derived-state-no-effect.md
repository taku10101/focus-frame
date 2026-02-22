---
title: レンダリング中に派生状態を計算する
impact: MEDIUM
impactDescription: 冗長なレンダリングと状態のズレを防ぐ
tags: rerender, derived-state, useEffect, state
---

## レンダリング中に派生状態を計算する

値が現在のprops/stateから計算できる場合、それを状態に格納したりエフェクトで更新したりしないでください。レンダリング中に派生させることで、余分なレンダリングと状態のズレを防ぎます。propsの変更に応じるためだけにエフェクトで状態をセットすることは避けてください。派生値またはkeyを使ったリセットを優先してください。

**悪い例（冗長な状態とエフェクト）：**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**良い例（レンダリング中に派生させる）：**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

参考：[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
