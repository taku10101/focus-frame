---
title: 明示的なコンポーネントバリアントを作る
impact: MEDIUM
impactDescription: 自己文書化されたコード、隠れた条件分岐の排除
tags: composition, variants, architecture
---

## 明示的なコンポーネントバリアントを作る

多数のbooleanプロップを持つ単一コンポーネントの代わりに、
明示的なバリアントコンポーネントを作ってください。
各バリアントは必要なピースを自ら組み合わせます。コードが自己文書化されます。

**悪い例（1つのコンポーネント、多数のモード）：**

```tsx
// このコンポーネントは実際に何をレンダリングするのか？
<Composer
  isThread
  isEditing={false}
  channelId='abc'
  showAttachments
  showFormatting={false}
/>
```

**良い例（明示的なバリアント）：**

```tsx
// 何をレンダリングするか一目瞭然
<ThreadComposer channelId="abc" />

// または
<EditMessageComposer messageId="xyz" />

// または
<ForwardMessageComposer messageId="123" />
```

各実装はユニークで明示的、かつ自己完結しています。それでいて共有パーツを使い回せます。

**実装例：**

```tsx
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <ThreadProvider channelId={channelId}>
      <Composer.Frame>
        <Composer.Input />
        <AlsoSendToChannelField channelId={channelId} />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Submit />
        </Composer.Footer>
      </Composer.Frame>
    </ThreadProvider>
  )
}

function EditMessageComposer({ messageId }: { messageId: string }) {
  return (
    <EditMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.CancelEdit />
          <Composer.SaveEdit />
        </Composer.Footer>
      </Composer.Frame>
    </EditMessageProvider>
  )
}

function ForwardMessageComposer({ messageId }: { messageId: string }) {
  return (
    <ForwardMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input placeholder="メッセージを追加（任意）" />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Mentions />
        </Composer.Footer>
      </Composer.Frame>
    </ForwardMessageProvider>
  )
}
```

各バリアントは以下を明示しています：

- 使用するプロバイダー/状態
- 含まれるUI要素
- 利用可能なアクション

booleanプロップの組み合わせを考える必要がなく、不可能な状態も存在しません。
