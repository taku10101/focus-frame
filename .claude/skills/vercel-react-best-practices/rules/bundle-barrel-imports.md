---
title: バレルファイルからのインポートを避ける
impact: CRITICAL
impactDescription: 1つの関数だけが必要な場合にライブラリ全体が読み込まれるのを防ぐ
tags: bundle, imports, barrel-files, tree-shaking
---

## バレルファイルからのインポートを避ける

バレルファイル（すべてを再エクスポートするindex.js）経由ではなく、ソースファイルから直接インポートします。バレルファイルは、1つの関数しか必要としない場合でもバンドラーにライブラリ全体を含めさせます。

**悪い例（lodash全体をインポートしている）：**

```typescript
import { debounce } from 'lodash'
import { groupBy } from 'lodash'
```

**良い例（必要なものだけをインポートしている）：**

```typescript
import debounce from 'lodash/debounce'
import groupBy from 'lodash/groupBy'
```

**自分のコードでも、すべてを再エクスポートするバレルファイルは避けること：**

```typescript
// 悪い例: components/index.ts がすべてのコンポーネントを再エクスポートしている
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
// ... さらに50個のコンポーネント

// 使用例
import { Button } from '@/components'  // 50個のコンポーネントすべてが読み込まれる
```

```typescript
// 良い例: ソースファイルから直接インポートする
import { Button } from '@/components/Button'
```
