---
name: biome-config
description: Biomeのlint/format設定ルール。対象ファイルの管理方針。
---

# Biome 設定ルール

## チェック対象

- `src/` 配下の `.ts`, `.tsx`, `.js`, `.jsx` ファイルのみ

## チェック対象外（ignore）

以下は `biome.json` の `files.ignore` で除外する：

- `*.md` — ドキュメント・READMEなど
- `*.json` — 設定ファイル（package.json, tsconfig.json, biome.json自身など）
- `*.yaml` / `*.yml` — CI設定、その他
- `*.toml` — 設定ファイル
- `.claude/**` — Claude Code設定・スキル
- `.ai-guide/**` — AI開発ガイドライン
- `node_modules/**` — 依存パッケージ
- `.next/**` — Next.jsビルド成果物

## ルール

- `biome.json` を編集するときは、上記のignoreルールを維持すること
- 新しい設定ファイル形式が増えた場合はignoreに追加する
- `bun run check` でCI上のlint + formatチェックが走る
