---
title: 重要でないサードパーティライブラリを遅延読み込みする
impact: CRITICAL
impactDescription: サードパーティのコードをクリティカルパスから除外する
tags: bundle, third-party, defer, hydration, analytics
---

## 重要でないサードパーティライブラリを遅延読み込みする

アプリがハイドレーションされた後に、アナリティクスやロギングなどの重要でないライブラリを読み込みます。これらのツールは初期ページ読み込み時に実行する必要はありません。

**悪い例（初期レンダリング時にアナリティクスを読み込んでいる）：**

```typescript
import Analytics from 'analytics-library'
import Logger from 'logging-library'

Analytics.init()
Logger.init()
```

**良い例（ハイドレーション後まで遅延させている）：**

```typescript
useEffect(() => {
  // ブラウザ上でのみ、ハイドレーション後に実行される
  import('analytics-library').then(({ default: Analytics }) => {
    Analytics.init()
  })
  import('logging-library').then(({ default: Logger }) => {
    Logger.init()
  })
}, [])
```
