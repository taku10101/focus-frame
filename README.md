# 🎨 FocusFrame

**集中するほど、名画が見えてくる。**

ドット絵リビール × ポモドーロタイマー PWA

25分間の集中セッション（ポモドーロ）を達成するたびに、ドット絵のマスが1つ開放。著作権切れの名画が徐々にリビールされていきます。全マス開放で作品名がリビール🎉

## ✨ 特徴

- 🕐 **ポモドーロタイマー** — 25分集中 → 5分休憩
- 🖼️ **ドット絵リビール** — セッション完了でマスが1つ開放
- 🎭 **作品名は秘密** — 作者・ジャンル・時代で選ぶ。完成まで何の絵かわからない
- 📐 **マス数カスタム** — 5×5（手軽）〜 N×N（じっくり）
- 📱 **PWA対応** — オフラインでも動作。ホーム画面に追加可能
- 💰 **完全無料** — サーバー不要。データはすべてローカル保存

## 🚀 セットアップ

```bash
# 依存関係インストール
bun install

# 開発サーバー起動
bun dev
```

http://localhost:3000 でアクセス

## 📦 スクリプト

| コマンド | 説明 |
|---------|------|
| `bun dev` | 開発サーバー |
| `bun run build` | プロダクションビルド |
| `bun run start` | プロダクションサーバー |
| `bun run lint` | Biome lint |
| `bun run check` | Biome check (lint + format) |
| `bun run format` | Biome format |

## 🛠️ 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Canvas API（ドット絵変換・描画）
- IndexedDB (Dexie.js)
- Web Worker（タイマー）
- PWA (Service Worker)

## 📖 ドキュメント

- [設計書](docs/DESIGN.md) — アーキテクチャ、データモデル、技術仕様

## 📄 ライセンス

MIT
