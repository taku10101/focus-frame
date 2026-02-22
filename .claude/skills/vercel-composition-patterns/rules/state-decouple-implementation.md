---
title: 状態管理をUIから切り離す
impact: MEDIUM
impactDescription: UIを変更せずに状態の実装を差し替えられる
tags: composition, state, architecture
---

## 状態管理をUIから切り離す

状態がどのように管理されているかを知っているのはプロバイダーコンポーネントだけにしてください。
UIコンポーネントはコンテキストインターフェースを消費するだけで、
状態が `useState`・Zustand・サーバー同期のどれから来るかを知りません。

**悪い例（UIが状態実装に結合している）：**

```tsx
function ChannelComposer({ channelId }: { channelId: string }) {
  // UIコンポーネントがグローバル状態の実装を知っている
  const state = useGlobalChannelState(channelId)
  const { submit, updateInput } = useChannelSync(channelId)

  return (
    <Composer.Frame>
      <Composer.Input
        value={state.input}
        onChange={(text) => sync.updateInput(text)}
      />
      <Composer.Submit onPress={() => sync.submit()} />
    </Composer.Frame>
  )
}
```

**良い例（状態管理をプロバイダーに閉じ込める）：**

```tsx
// プロバイダーがすべての状態管理の詳細を担当する
function ChannelProvider({
  channelId,
  children,
}: {
  channelId: string
  children: React.ReactNode
}) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update, submit }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

// UIコンポーネントはコンテキストインターフェースしか知らない
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// 使い方
function Channel({ channelId }: { channelId: string }) {
  return (
    <ChannelProvider channelId={channelId}>
      <ChannelComposer />
    </ChannelProvider>
  )
}
```

**異なるプロバイダー、同じUI：**

```tsx
// 一時的なフォーム用のローカル状態
function ForwardMessageProvider({ children }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
    >
      {children}
    </Composer.Provider>
  )
}

// チャンネル用のグローバル同期状態
function ChannelProvider({ channelId, children }) {
  const { state, update, submit } = useGlobalChannel(channelId)

  return (
    <Composer.Provider state={state} actions={{ update, submit }}>
      {children}
    </Composer.Provider>
  )
}
```

`Composer.Input` コンポーネントはどちらのプロバイダーとも動作します。
それはコンテキストインターフェースにのみ依存し、実装には依存しないからです。
