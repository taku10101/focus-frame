---
title: アプリレベルのシングルトンを1度だけ初期化する
impact: LOW
impactDescription: ホットリロード間での重複初期化を防ぐ
tags: advanced, initialization, singleton, module-level
---

## アプリレベルのシングルトンを1度だけ初期化する

ガード変数を使ってモジュールレベルでアプリレベルのシングルトンを初期化します。`useEffect`やコンポーネントレベルのコードを使うと、ホットリロードやStrict Modeの二重レンダリングによって初期化が複数回実行されるリスクがあります。

**悪い例（エフェクト内で実行され、重複する可能性がある）：**

```tsx
function App() {
  useEffect(() => {
    initAnalytics()
    initErrorReporting()
  }, [])
}
```

**良い例（モジュール読み込み時に1度だけ実行される）：**

```tsx
let initialized = false

if (typeof window !== 'undefined' && !initialized) {
  initialized = true
  initAnalytics()
  initErrorReporting()
}

function App() {
  // ここでの初期化は不要
}
```
