---
title: レンダープロップよりchildrenによるコンポジションを優先する
impact: MEDIUM
impactDescription: よりクリーンなコンポジション・読みやすさの向上
tags: composition, children, render-props
---

## レンダープロップよりchildrenを優先する

`renderX` プロップの代わりに `children` でコンポジションしてください。
childrenはより読みやすく、自然に組み合わせられ、
コールバックのシグネチャを理解する必要もありません。

**悪い例（レンダープロップ）：**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
}: {
  renderHeader?: () => React.ReactNode
  renderFooter?: () => React.ReactNode
  renderActions?: () => React.ReactNode
}) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {renderFooter ? renderFooter() : <DefaultFooter />}
      {renderActions?.()}
    </form>
  )
}

// 使い方が不便で柔軟性に欠ける
return (
  <Composer
    renderHeader={() => <CustomHeader />}
    renderFooter={() => (
      <>
        <Formatting />
        <Emojis />
      </>
    )}
    renderActions={() => <SubmitButton />}
  />
)
```

**良い例（コンパウンドコンポーネントとchildren）：**

```tsx
function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerFooter({ children }: { children: React.ReactNode }) {
  return <footer className='flex'>{children}</footer>
}

// 使い方が柔軟
return (
  <Composer.Frame>
    <CustomHeader />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Emojis />
      <SubmitButton />
    </Composer.Footer>
  </Composer.Frame>
)
```

**レンダープロップが適切な場面：**

```tsx
// 親から子へデータを渡す必要がある場合はレンダープロップが有効
<List
  data={items}
  renderItem={({ item, index }) => <Item item={item} index={index} />}
/>
```

親が子にデータや状態を提供する必要がある場合はレンダープロップを使ってください。
静的な構造を組み合わせる場合はchildrenを使ってください。
