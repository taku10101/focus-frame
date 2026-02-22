---
name: biome-config
description: Biomeのlint/format設定ルール。対象ファイルの管理方針。
---

# Biome 設定ルール

## チェック対象（include）

`biome.json` の `files.includes` で明示的に指定（Biome v2 のキー名）：

- `src/**/*.ts`
- `src/**/*.tsx`
- `src/**/*.js`
- `src/**/*.jsx`

これ以外のファイルはbiomeの対象外になる。

## チェック対象外

`includes` を `src/**` に限定しているため、それ以外（設定ファイル・ドキュメント・ビルド成果物）は自動的に除外される。

Biome v2 では `ignore` キーは廃止。除外が必要な場合は `includes` 内に `!pattern` で記述する。

## ルール

- `biome.json` を編集するときは `files.includes` のスコープ（`src/**`）を維持すること
- Biome v2 では `include` / `ignore` は無効。必ず `includes` を使うこと
- `pnpm run check` でCI上のlint + formatチェックが走る
