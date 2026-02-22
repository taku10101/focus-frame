# CLAUDE.md
FocusFrame - ドット絵リビール × ポモドーロタイマー PWA

## 技術スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Canvas API（ドット絵変換・描画）
- IndexedDB (Dexie.js)
- Web Worker（タイマー）
- PWA (Service Worker)

## コマンド
- `bun dev` — 開発サーバー
- `bun run build` — ビルド
- `bun run lint` — Biome lint
- `bun run check` — Biome check (lint + format)
- `bun run format` — Biome format

## ディレクトリ構成
src/
  app/          — Next.js App Router pages
  components/   — UIコンポーネント
  features/     — 機能別モジュール (timer, pixel-art, gallery, collection)
  lib/          — ユーティリティ、DB、型定義
  assets/       — 作品画像データ
public/         — 静的ファイル
docs/           — 設計書

## コーディング規約
- Biome でlint/format（.editorconfigに準拠）
- コンポーネントは機能単位でfeaturesに配置
- 日本語コメント可、変数名は英語
