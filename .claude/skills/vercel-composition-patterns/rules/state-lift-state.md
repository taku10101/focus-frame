---
title: プロバイダーコンポーネントへ状態を引き上げる
impact: HIGH
impactDescription: コンポーネント境界を超えた状態共有を実現する
tags: composition, state, context, providers
---

## プロバイダーコンポーネントへ状態を引き上げる

状態管理を専用のプロバイダーコンポーネントへ移してください。
これにより、メインUIの外にある兄弟コンポーネントが
プロップドリルや煩雑なrefを使わずに状態にアクセス・変更できるようになります。

**悪い例（コンポーネント内に閉じ込められた状態）：**

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

**悪い例（useEffectで状態を上流へ同期する）：**

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

**悪い例（送信時にrefから状態を読み取る）：**

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

**良い例（プロバイダーへ状態を引き上げる）：**

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
プロバイダーの中に収まっているため、submitアクションにアクセスできます。
一度限りのコンポーネントであっても、UI外のコンポーザーの状態とアクションにアクセスできます。

**重要なポイント：** 共有状態が必要なコンポーネントは
互いに視覚的に入れ子になっている必要はありません。
同じプロバイダーの中に収まっていれば十分です。
