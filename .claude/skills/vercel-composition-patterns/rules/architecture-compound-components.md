---
title: コンパウンドコンポーネントを使う
impact: HIGH
impactDescription: プロップドリルなしで柔軟なコンポジションを実現する
tags: composition, compound-components, architecture
---

## コンパウンドコンポーネントを使う

複雑なコンポーネントは共有コンテキストを持つコンパウンドコンポーネントとして構成してください。
各サブコンポーネントはpropsではなくコンテキスト経由で共有状態にアクセスします。
利用側は必要なピースを自由に組み合わせられます。

**悪い例（レンダープロップを使ったモノリシックなコンポーネント）：**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
  showAttachments,
  showFormatting,
  showEmojis,
}: Props) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {showAttachments && <Attachments />}
      {renderFooter ? (
        renderFooter()
      ) : (
        <Footer>
          {showFormatting && <Formatting />}
          {showEmojis && <Emojis />}
          {renderActions?.()}
        </Footer>
      )}
    </form>
  )
}
```

**良い例（共有コンテキストを持つコンパウンドコンポーネント）：**

```tsx
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerProvider({ children, state, actions, meta }: ProviderProps) {
  return (
    <ComposerContext value={{ state, actions, meta }}>
      {children}
    </ComposerContext>
  )
}

function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerInput() {
  const {
    state,
    actions: { update },
    meta: { inputRef },
  } = use(ComposerContext)
  return (
    <TextInput
      ref={inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}

function ComposerSubmit() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>送信</Button>
}

// コンパウンドコンポーネントとしてエクスポート
const Composer = {
  Provider: ComposerProvider,
  Frame: ComposerFrame,
  Input: ComposerInput,
  Submit: ComposerSubmit,
  Header: ComposerHeader,
  Footer: ComposerFooter,
  Attachments: ComposerAttachments,
  Formatting: ComposerFormatting,
  Emojis: ComposerEmojis,
}
```

**使い方：**

```tsx
<Composer.Provider state={state} actions={actions} meta={meta}>
  <Composer.Frame>
    <Composer.Header />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

利用側は必要なものだけを明示的に組み合わせられます。隠れた条件分岐はありません。
また、state・actions・metaは親プロバイダーから依存性注入されるため、
同じコンポーネント構造を複数の場面で使い回せます。
