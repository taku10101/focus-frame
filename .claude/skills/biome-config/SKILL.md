---
name: biome-config
description: Biomeのlint/format設定ルール。対象ファイルの管理方針。
---

# Biome 設定ルール

## チェック対象（include）

`biome.json` の `files.include` で明示的に指定：

- `src/**/*.ts`
- `src/**/*.tsx`
- `src/**/*.js`
- `src/**/*.jsx`

これ以外のファイルはbiomeの対象外になる。

## チェック対象外（ignore）

さらに `files.ignore` でも明示的に除外：

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
