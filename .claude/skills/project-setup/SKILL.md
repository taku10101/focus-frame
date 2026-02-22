---
name: project-setup
description: FocusFrameプロジェクトのセットアップルール・依存パッケージ・技術選定方針。新規コンポーネント作成時や依存追加時に参照。
---

# Project Setup ルール

## アイコン

- **react-icons** を使用する（`react-icons` パッケージ）
- SVGアイコンを直接埋め込まない
- 使い方: `import { FiPlay, FiPause } from "react-icons/fi";`
- アイコンセットは統一感を保つため、基本的に同じセットから選ぶ（Feather Icons `fi` 推奨、必要に応じて他セットも可）

## CSS / スタイリング

- **Tailwind CSS v4** を使用
- `globals.css` に Tailwind ディレクティブを記述
- カスタムカラーはCSS変数 or Tailwind の設定で管理

## パッケージマネージャー

- **pnpm** を使用（`pnpm install`, `pnpm run build` 等）

## 主要パッケージ

| パッケージ | 用途 |
|---|---|
| `next` | フレームワーク（App Router） |
| `react` / `react-dom` | UI |
| `react-icons` | アイコン |
| `tailwindcss` | スタイリング |
| `dexie` | IndexedDB ラッパー |
| `@biomejs/biome` | Lint / Format |

## ディレクトリ構成

```
src/
  app/          — ページ（App Router）
  components/   — UIコンポーネント
  features/     — 機能別モジュール
  hooks/        — カスタムフック
  lib/          — ユーティリティ、DB、型定義
  data/         — 静的データ（作品一覧等）
  types/        — 型定義
  workers/      — Web Worker
public/         — 静的ファイル
docs/           — 設計書
```
