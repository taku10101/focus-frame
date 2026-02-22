---
name: vercel-composition-patterns
description:
  スケールするReactコンポジションパターン集。booleanプロップの乱用を解消するリファクタリング、
  柔軟なコンポーネントライブラリの構築、再利用可能なAPIの設計に使用します。
  コンパウンドコンポーネント、レンダープロップ、コンテキストプロバイダー、
  コンポーネントアーキテクチャに関するタスクで参照してください。React 19のAPI変更も含みます。
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# Reactコンポジションパターン

柔軟で保守しやすいReactコンポーネントを構築するためのコンポジションパターン集。
コンパウンドコンポーネント、状態の引き上げ、内部コンポーネントの合成を活用して
booleanプロップの乱用を回避します。これらのパターンを使うことで、
コードベースがスケールしても人間とAIエージェントの双方が扱いやすい状態を維持できます。

## 適用タイミング

以下の場面でこのガイドラインを参照してください：

- booleanプロップが多数あるコンポーネントのリファクタリング
- 再利用可能なコンポーネントライブラリの構築
- 柔軟なコンポーネントAPIの設計
- コンポーネントアーキテクチャのレビュー
- コンパウンドコンポーネントやコンテキストプロバイダーの実装

## ルールカテゴリ（優先度順）

| 優先度 | カテゴリ           | 影響度 | プレフィックス  |
| ------ | ------------------ | ------ | --------------- |
| 1      | コンポーネント設計 | HIGH   | `architecture-` |
| 2      | 状態管理           | MEDIUM | `state-`        |
| 3      | 実装パターン       | MEDIUM | `patterns-`     |
| 4      | React 19 API       | MEDIUM | `react19-`      |

## クイックリファレンス

### 1. コンポーネント設計 (HIGH)

- `architecture-avoid-boolean-props` - 振る舞いのカスタマイズにbooleanプロップを使わない。コンポジションを使う
- `architecture-compound-components` - 共有コンテキストを使ってコンパウンドコンポーネントを構成する

### 2. 状態管理 (MEDIUM)

- `state-decouple-implementation` - 状態管理の方法を知っているのはプロバイダーだけにする
- `state-context-interface` - 依存性注入のためにstate・actions・metaを持つ汎用インターフェースを定義する
- `state-lift-state` - 兄弟コンポーネントからもアクセスできるようにプロバイダーコンポーネントへ状態を引き上げる

### 3. 実装パターン (MEDIUM)

- `patterns-explicit-variants` - booleanモードの代わりに明示的なバリアントコンポーネントを作る
- `patterns-children-over-render-props` - renderX プロップではなく children でコンポジションする

### 4. React 19 API (MEDIUM)

> **⚠️ React 19以降のみ。** React 18以前を使用している場合はスキップしてください。

- `react19-no-forwardref` - `forwardRef` を使わない。`useContext()` の代わりに `use()` を使う

## 使い方

各ルールファイルで詳細な説明とコード例を確認してください：

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

各ルールファイルには以下が含まれます：

- そのルールが重要な理由の簡単な説明
- 悪い例（説明付き）
- 良い例（説明付き）
- 補足情報と参考リンク

## 全ルールをまとめたドキュメント

すべてのルールを展開した完全版ガイド: `AGENTS.md`
