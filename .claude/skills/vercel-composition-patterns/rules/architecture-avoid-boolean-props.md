---
title: booleanプロップの乱用を避ける
impact: CRITICAL
impactDescription: 保守不能なコンポーネントバリアントを防ぐ
tags: composition, props, architecture
---

## booleanプロップの乱用を避ける

`isThread`、`isEditing`、`isDMThread` のようなbooleanプロップを追加して
コンポーネントの振る舞いをカスタマイズしないでください。
booleanが1つ増えるたびに状態の組み合わせが2倍になり、
保守不能な条件分岐ロジックが生まれます。代わりにコンポジションを使ってください。

**悪い例（booleanプロップが指数関数的な複雑さを生む）：**

```tsx
function Composer({
  onSubmit,
  isThread,
  channelId,
  isDMThread,
  dmId,
  isEditing,
  isForwarding,
}: Props) {
  return (
    <form>
      <Header />
      <Input />
      {isDMThread ? (
        <AlsoSendToDMField id={dmId} />
      ) : isThread ? (
        <AlsoSendToChannelField id={channelId} />
      ) : null}
      {isEditing ? (
        <EditActions />
      ) : isForwarding ? (
        <ForwardActions />
      ) : (
        <DefaultActions />
      )}
      <Footer onSubmit={onSubmit} />
    </form>
  )
}
```

**良い例（コンポジションで条件分岐を排除する）：**

```tsx
// チャンネルコンポーザー
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Attachments />
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// スレッドコンポーザー - 「チャンネルにも送信」フィールドを追加
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <AlsoSendToChannelField id={channelId} />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// 編集コンポーザー - フッターのアクションが異なる
function EditComposer() {
  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.CancelEdit />
        <Composer.SaveEdit />
      </Composer.Footer>
    </Composer.Frame>
  )
}
```

各バリアントが何をレンダリングするかを明示しています。
単一の巨大な親コンポーネントを共有せずに内部コンポーネントを共有できます。
