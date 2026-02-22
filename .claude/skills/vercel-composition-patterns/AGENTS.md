# Reactコンポジションパターン

**バージョン 1.0.0**
エンジニアリング
2026年1月

> **注記：**
> このドキュメントは主にエージェントとLLMが、コンポジションを用いてReactコードベースを
> 保守・生成・リファクタリングする際に参照するためのものです。
> 人間が読んでも役立つ内容ですが、ここに記載されたガイダンスは
> AIによるワークフローの自動化と一貫性のために最適化されています。

---

## 概要

柔軟で保守しやすいReactコンポーネントを構築するためのコンポジションパターン集。
コンパウンドコンポーネント、状態の引き上げ、内部コンポーネントの合成を活用して
booleanプロップの乱用を回避します。これらのパターンを使うことで、
コードベースがスケールしても人間とAIエージェントの双方が扱いやすい状態を維持できます。

---

## 目次

1. [コンポーネント設計](#1-コンポーネント設計) — **HIGH**
   - 1.1 [booleanプロップの乱用を避ける](#11-booleanプロップの乱用を避ける)
   - 1.2 [コンパウンドコンポーネントを使う](#12-コンパウンドコンポーネントを使う)
2. [状態管理](#2-状態管理) — **MEDIUM**
   - 2.1 [状態管理をUIから切り離す](#21-状態管理をuiから切り離す)
   - 2.2 [依存性注入のための汎用コンテキストインターフェースを定義する](#22-依存性注入のための汎用コンテキストインターフェースを定義する)
   - 2.3 [プロバイダーコンポーネントへ状態を引き上げる](#23-プロバイダーコンポーネントへ状態を引き上げる)
3. [実装パターン](#3-実装パターン) — **MEDIUM**
   - 3.1 [明示的なコンポーネントバリアントを作る](#31-明示的なコンポーネントバリアントを作る)
   - 3.2 [レンダープロップよりchildrenによるコンポジションを優先する](#32-レンダープロップよりchildrenによるコンポジションを優先する)
4. [React 19 API](#4-react-19-api) — **MEDIUM**
   - 4.1 [React 19のAPI変更](#41-react-19のapi変更)

---

## 1. コンポーネント設計

**影響度: HIGH**

プロップの乱用を回避し、柔軟なコンポジションを実現するための
コンポーネント構造化の基本パターンです。

### 1.1 booleanプロップの乱用を避ける

**影響度: CRITICAL（保守不能なコンポーネントバリアントを防ぐ）**

`isThread`、`isEditing`、`isDMThread` のようなbooleanプロップを追加して

コンポーネントの振る舞いをカスタマイズしないでください。booleanが1つ増えるたびに

状態の組み合わせが2倍になり、保守不能な条件分岐ロジックが生まれます。代わりにコンポジションを使ってください。

**悪い例（booleanプロップが指数関数的な複雑さを生む）**

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

**良い例（コンポジションで条件分岐を排除する）**

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

### 1.2 コンパウンドコンポーネントを使う

**影響度: HIGH（プロップドリルなしで柔軟なコンポジションを実現する）**

複雑なコンポーネントは共有コンテキストを持つコンパウンドコンポーネントとして構成してください。各

サブコンポーネントはpropsではなくコンテキスト経由で共有状態にアクセスします。利用側は

必要なピースを自由に組み合わせられます。

**悪い例（レンダープロップを使ったモノリシックなコンポーネント）**

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

**良い例（共有コンテキストを持つコンパウンドコンポーネント）**

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

利用側は必要なものだけを明示的に組み合わせられます。隠れた条件分岐はありません。また、state・actions・metaは親プロバイダーから依存性注入されるため、同じコンポーネント構造を複数の場面で使い回せます。

---

## 2. 状態管理

**影響度: MEDIUM**

コンポジションされたコンポーネント間で

状態を引き上げ・共有コンテキストを管理するためのパターンです。

### 2.1 状態管理をUIから切り離す

**影響度: MEDIUM（UIを変更せずに状態の実装を差し替えられる）**

状態がどのように管理されているかを知っているのはプロバイダーコンポーネントだけにしてください。

UIコンポーネントはコンテキストインターフェースを消費するだけで、

状態が `useState`・Zustand・サーバー同期のどれから来るかを知りません。

**悪い例（UIが状態実装に結合している）**

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

**良い例（状態管理をプロバイダーに閉じ込める）**

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

`Composer.Input` コンポーネントはどちらのプロバイダーとも動作します。それは

コンテキストインターフェースにのみ依存し、実装には依存しないからです。

### 2.2 依存性注入のための汎用コンテキストインターフェースを定義する

**影響度: HIGH（ユースケースをまたいだ依存性注入可能な状態を実現する）**

コンポーネントコンテキストに `state`・`actions`・`meta` の3つを持つ

**汎用インターフェース**を定義してください。このインターフェースはあらゆるプロバイダーが実装できる契約であり、

同じUIコンポーネントが全く異なる状態実装と連携できるようになります。

**コアの考え方：** 状態を引き上げ、内部コンポーネントを合成し、状態を

依存性注入可能にする。

**悪い例（UIが特定の状態実装に結合している）**

```tsx
function ComposerInput() {
  // 特定のフックに密結合
  const { input, setInput } = useChannelComposerState()
  return <TextInput value={input} onChangeText={setInput} />
}
```

**良い例（汎用インターフェースで依存性注入を可能にする）**

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

重要なのはプロバイダーの境界であり、視覚的な入れ子構造ではありません。共有状態が

必要なコンポーネントは `Composer.Frame` の内部に配置する必要はなく、

プロバイダーの中に収まっていれば十分です。

`ForwardButton` と `MessagePreview` はコンポーザーボックスの外に視覚的には

配置されていますが、それでも状態とアクションにアクセスできます。これが

状態をプロバイダーへ引き上げることの力です。

UIは組み合わせる再利用可能なパーツです。状態はプロバイダーが依存性注入します。

プロバイダーを替えても、UIはそのままです。

### 2.3 プロバイダーコンポーネントへ状態を引き上げる

**影響度: HIGH（コンポーネント境界を超えた状態共有を実現する）**

状態管理を専用のプロバイダーコンポーネントへ移してください。これにより、

メインUIの外にある兄弟コンポーネントが

プロップドリルや煩雑なrefを使わずに状態にアクセス・変更できるようになります。

**悪い例（コンポーネント内に閉じ込められた状態）**

```tsx
function ForwardMessageComposer() {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer />
    </Composer.Frame>
  )
}

// 問題：このボタンはコンポーザーの状態にどうやってアクセスする？
function ForwardMessageDialog() {
  return (
    <Dialog>
      <ForwardMessageComposer />
      <MessagePreview /> {/* コンポーザーの状態が必要 */}
      <DialogActions>
        <CancelButton />
        <ForwardButton /> {/* submitを呼び出す必要がある */}
      </DialogActions>
    </Dialog>
  )
}
```

**悪い例（useEffectで状態を上流へ同期する）**

```tsx
function ForwardMessageDialog() {
  const [input, setInput] = useState('')
  return (
    <Dialog>
      <ForwardMessageComposer onInputChange={setInput} />
      <MessagePreview input={input} />
    </Dialog>
  )
}

function ForwardMessageComposer({ onInputChange }) {
  const [state, setState] = useState(initialState)
  useEffect(() => {
    onInputChange(state.input) // 変更のたびに同期 😬
  }, [state.input])
}
```

**悪い例（送信時にrefから状態を読み取る）**

```tsx
function ForwardMessageDialog() {
  const stateRef = useRef(null)
  return (
    <Dialog>
      <ForwardMessageComposer stateRef={stateRef} />
      <ForwardButton onPress={() => submit(stateRef.current)} />
    </Dialog>
  )
}
```

**良い例（プロバイダーへ状態を引き上げる）**

```tsx
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        <ForwardMessageComposer />
        <MessagePreview /> {/* カスタムコンポーネントが状態とアクションにアクセスできる */}
        <DialogActions>
          <CancelButton />
          <ForwardButton /> {/* カスタムコンポーネントが状態とアクションにアクセスできる */}
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

function ForwardButton() {
  const { actions } = use(Composer.Context)
  return <Button onPress={actions.submit}>転送</Button>
}
```

ForwardButtonはComposer.Frameの外に配置されていますが、

プロバイダーの中に収まっているため、submitアクションにアクセスできます。一度限りのコンポーネントであっても、

UI外のコンポーザーの状態とアクションにアクセスできます。

**重要なポイント：** 共有状態が必要なコンポーネントは

互いに視覚的に入れ子になっている必要はありません。

同じプロバイダーの中に収まっていれば十分です。

---

## 3. 実装パターン

**影響度: MEDIUM**

コンパウンドコンポーネントと

コンテキストプロバイダーを実装するための具体的なテクニックです。

### 3.1 明示的なコンポーネントバリアントを作る

**影響度: MEDIUM（自己文書化されたコード、隠れた条件分岐の排除）**

多数のbooleanプロップを持つ単一コンポーネントの代わりに、明示的なバリアント

コンポーネントを作ってください。各バリアントは必要なピースを自ら組み合わせます。コードが自己文書化されます。

**悪い例（1つのコンポーネント、多数のモード）**

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

**良い例（明示的なバリアント）**

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

### 3.2 レンダープロップよりchildrenによるコンポジションを優先する

**影響度: MEDIUM（よりクリーンなコンポジション・読みやすさの向上）**

`renderX` プロップの代わりに `children` でコンポジションしてください。childrenはより

読みやすく、自然に組み合わせられ、

コールバックのシグネチャを理解する必要もありません。

**悪い例（レンダープロップ）**

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

**良い例（コンパウンドコンポーネントとchildren）**

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

---

## 4. React 19 API

**影響度: MEDIUM**

React 19以降のみ。`forwardRef` を使わない。`useContext()` の代わりに `use()` を使う。

### 4.1 React 19のAPI変更

**影響度: MEDIUM（よりクリーンなコンポーネント定義とコンテキスト利用）**

> **⚠️ React 19以降のみ。** React 18以前を使用している場合はスキップしてください。

React 19では `ref` が通常のプロップになりました（`forwardRef` のラッパー不要）。また `use()` が `useContext()` を置き換えます。

**悪い例（React 19でforwardRefを使う）**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**良い例（refを通常のプロップとして受け取る）**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**悪い例（React 19でuseContextを使う）**

```tsx
const value = useContext(MyContext)
```

**良い例（useContextの代わりにuseを使う）**

```tsx
const value = use(MyContext)
```

`use()` は `useContext()` と異なり、条件分岐の中でも呼び出せます。

---

## 参考リンク

1. [https://react.dev](https://react.dev)
2. [https://react.dev/learn/passing-data-deeply-with-context](https://react.dev/learn/passing-data-deeply-with-context)
3. [https://react.dev/reference/react/use](https://react.dev/reference/react/use)
