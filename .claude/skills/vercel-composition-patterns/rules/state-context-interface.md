---
title: 依存性注入のための汎用コンテキストインターフェースを定義する
impact: HIGH
impactDescription: ユースケースをまたいだ依存性注入可能な状態を実現する
tags: composition, context, state, typescript, dependency-injection
---

## 依存性注入のための汎用コンテキストインターフェースを定義する

コンポーネントコンテキストに `state`・`actions`・`meta` の3つを持つ
**汎用インターフェース**を定義してください。
このインターフェースはあらゆるプロバイダーが実装できる契約であり、
同じUIコンポーネントが全く異なる状態実装と連携できるようになります。

**コアの考え方：** 状態を引き上げ、内部コンポーネントを合成し、
状態を依存性注入可能にする。

**悪い例（UIが特定の状態実装に結合している）：**

```tsx
function ComposerInput() {
  // 特定のフックに密結合
  const { input, setInput } = useChannelComposerState()
  return <TextInput value={input} onChangeText={setInput} />
}
```

**良い例（汎用インターフェースで依存性注入を可能にする）：**

```tsx
// あらゆるプロバイダーが実装できる汎用インターフェースを定義
interface ComposerState {
  input: string
  attachments: Attachment[]
  isSubmitting: boolean
}

interface ComposerActions {
  update: (updater: (state: ComposerState) => ComposerState) => void
  submit: () => void
}

interface ComposerMeta {
  inputRef: React.RefObject<TextInput>
}

interface ComposerContextValue {
  state: ComposerState
  actions: ComposerActions
  meta: ComposerMeta
}

const ComposerContext = createContext<ComposerContextValue | null>(null)
```

**UIコンポーネントは実装ではなくインターフェースを消費する：**

```tsx
function ComposerInput() {
  const {
    state,
    actions: { update },
    meta,
  } = use(ComposerContext)

  // このコンポーネントはインターフェースを実装するあらゆるプロバイダーと動作する
  return (
    <TextInput
      ref={meta.inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}
```

**異なるプロバイダーが同じインターフェースを実装する：**

```tsx
// プロバイダーA：一時的なフォーム用のローカル状態
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const inputRef = useRef(null)
  const submit = useForwardMessage()

  return (
    <ComposerContext
      value={{
        state,
        actions: { update: setState, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}

// プロバイダーB：チャンネル用のグローバル同期状態
function ChannelProvider({ channelId, children }: Props) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <ComposerContext
      value={{
        state,
        actions: { update, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}
```

**同じUIがどちらでも動作する：**

```tsx
// ForwardMessageProvider（ローカル状態）で動作
<ForwardMessageProvider>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ForwardMessageProvider>

// ChannelProvider（グローバル同期状態）でも動作
<ChannelProvider channelId="abc">
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ChannelProvider>
```

**コンポーネント外部のカスタムUIからも状態とアクションにアクセスできる：**

重要なのはプロバイダーの境界であり、視覚的な入れ子構造ではありません。
共有状態が必要なコンポーネントは `Composer.Frame` の内部に配置する必要はなく、
プロバイダーの中に収まっていれば十分です。

```tsx
function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        {/* コンポーザーUI */}
        <Composer.Frame>
          <Composer.Input placeholder="メッセージを追加（任意）" />
          <Composer.Footer>
            <Composer.Formatting />
            <Composer.Emojis />
          </Composer.Footer>
        </Composer.Frame>

        {/* コンポーザー外・プロバイダー内のカスタムUI */}
        <MessagePreview />

        {/* ダイアログ下部のアクション */}
        <DialogActions>
          <CancelButton />
          <ForwardButton />
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

// このボタンはComposer.Frameの外にあるが、コンテキストから送信を呼び出せる！
function ForwardButton() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>転送</Button>
}

// このプレビューはComposer.Frameの外にあるが、コンポーザーの状態を読み取れる！
function MessagePreview() {
  const { state } = use(ComposerContext)
  return <Preview message={state.input} attachments={state.attachments} />
}
```

`ForwardButton` と `MessagePreview` はコンポーザーボックスの外に視覚的には
配置されていますが、それでも状態とアクションにアクセスできます。
これが状態をプロバイダーへ引き上げることの力です。

UIは組み合わせる再利用可能なパーツです。状態はプロバイダーが依存性注入します。
プロバイダーを替えても、UIはそのままです。
