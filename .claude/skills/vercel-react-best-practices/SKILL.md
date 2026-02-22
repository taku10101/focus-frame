---
name: vercel-react-best-practices
description: VercelエンジニアリングによるReactおよびNext.jsのパフォーマンス最適化ガイドライン。ReactコンポーネントやNext.jsページの作成・レビュー・リファクタリング、データフェッチの実装、バンドル最適化、パフォーマンス改善に関するタスクで参照してください。
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel Reactベストプラクティス

VercelがメンテナンスするReact・Next.jsアプリケーション向けの包括的なパフォーマンス最適化ガイド。
8カテゴリにわたる57のルールを影響度順に整理し、自動リファクタリングとコード生成を効率的にガイドします。

## 適用タイミング

以下の場面でこのガイドラインを参照してください：
- 新しいReactコンポーネントやNext.jsページの作成
- データフェッチの実装（クライアントサイド・サーバーサイド）
- パフォーマンス問題のコードレビュー
- 既存のReact/Next.jsコードのリファクタリング
- バンドルサイズや読み込み時間の最適化

## ルールカテゴリ（優先度順）

| 優先度 | カテゴリ                     | 影響度      | プレフィックス |
|--------|------------------------------|-------------|----------------|
| 1      | ウォーターフォールの排除     | CRITICAL    | `async-`       |
| 2      | バンドルサイズの最適化       | CRITICAL    | `bundle-`      |
| 3      | サーバーサイドパフォーマンス | HIGH        | `server-`      |
| 4      | クライアントサイドデータ取得 | MEDIUM-HIGH | `client-`      |
| 5      | 再レンダリングの最適化       | MEDIUM      | `rerender-`    |
| 6      | レンダリングパフォーマンス   | MEDIUM      | `rendering-`   |
| 7      | JavaScriptパフォーマンス     | LOW-MEDIUM  | `js-`          |
| 8      | 高度なパターン               | LOW         | `advanced-`    |

## クイックリファレンス

### 1. ウォーターフォールの排除 (CRITICAL)

- `async-defer-await` - awaitは実際に使う分岐の中へ移動する
- `async-parallel` - 独立した処理にはPromise.all()を使う
- `async-dependencies` - 部分的な依存関係にはbetter-allを使う
- `async-api-routes` - APIルートではPromiseを早めに開始し、awaitは遅らせる
- `async-suspense-boundaries` - コンテンツのストリーミングにSuspenseを使う

### 2. バンドルサイズの最適化 (CRITICAL)

- `bundle-barrel-imports` - 直接インポートする。バレルファイルを避ける
- `bundle-dynamic-imports` - 重いコンポーネントにはnext/dynamicを使う
- `bundle-defer-third-party` - アナリティクス/ロギングはハイドレーション後に読み込む
- `bundle-conditional` - 機能が有効化されたときだけモジュールを読み込む
- `bundle-preload` - ホバー/フォーカス時にプリロードして体感速度を上げる

### 3. サーバーサイドパフォーマンス (HIGH)

- `server-auth-actions` - サーバーアクションをAPIルートと同様に認証する
- `server-cache-react` - リクエスト単位の重複排除にReact.cache()を使う
- `server-cache-lru` - リクエスト横断のキャッシュにLRUキャッシュを使う
- `server-dedup-props` - RSCプロップスの重複シリアライズを避ける
- `server-serialization` - クライアントコンポーネントへ渡すデータを最小化する
- `server-parallel-fetching` - コンポーネントを再構成してフェッチを並列化する
- `server-after-nonblocking` - ノンブロッキング処理にafter()を使う

### 4. クライアントサイドデータ取得 (MEDIUM-HIGH)

- `client-swr-dedup` - リクエストの自動重複排除にSWRを使う
- `client-event-listeners` - グローバルイベントリスナーを重複させない
- `client-passive-event-listeners` - スクロールにはpassiveリスナーを使う
- `client-localstorage-schema` - localStorageデータをバージョン管理して最小化する

### 5. 再レンダリングの最適化 (MEDIUM)

- `rerender-defer-reads` - コールバックでしか使わない状態をsubscribeしない
- `rerender-memo` - 重い処理はメモ化コンポーネントに切り出す
- `rerender-memo-with-default-value` - デフォルトの非プリミティブプロップをホイストする
- `rerender-dependencies` - エフェクトの依存配列にはプリミティブ値を使う
- `rerender-derived-state` - 生の値ではなく派生booleanをsubscribeする
- `rerender-derived-state-no-effect` - 状態の派生はエフェクトではなくレンダリング中に行う
- `rerender-functional-setstate` - 安定したコールバックのために関数形式のsetStateを使う
- `rerender-lazy-state-init` - コストの高い初期値はuseStateへ関数として渡す
- `rerender-simple-expression-in-memo` - 単純なプリミティブにmemoを使わない
- `rerender-move-effect-to-event` - インタラクションのロジックはイベントハンドラーへ移す
- `rerender-transitions` - 優先度の低い更新にはstartTransitionを使う
- `rerender-use-ref-transient-values` - 頻繁に変わる一時的な値にはrefを使う

### 6. レンダリングパフォーマンス (MEDIUM)

- `rendering-animate-svg-wrapper` - SVG要素ではなくdivラッパーをアニメーションする
- `rendering-content-visibility` - 長いリストにcontent-visibilityを使う
- `rendering-hoist-jsx` - 静的なJSXをコンポーネント外に切り出す
- `rendering-svg-precision` - SVG座標の精度を下げる
- `rendering-hydration-no-flicker` - クライアント専用データにはインラインスクリプトを使う
- `rendering-hydration-suppress-warning` - 想定内のミスマッチには警告を抑制する
- `rendering-activity` - 表示/非表示にはActivityコンポーネントを使う
- `rendering-conditional-render` - 条件レンダリングには&&ではなく三項演算子を使う
- `rendering-usetransition-loading` - ローディング状態にはuseTransitionを優先する

### 7. JavaScriptパフォーマンス (LOW-MEDIUM)

- `js-batch-dom-css` - クラスやcssTextでCSS変更をまとめる
- `js-index-maps` - 繰り返しのルックアップにはMapを構築する
- `js-cache-property-access` - ループ内でオブジェクトのプロパティをキャッシュする
- `js-cache-function-results` - 関数の結果をモジュールレベルのMapでキャッシュする
- `js-cache-storage` - localStorage/sessionStorageの読み取りをキャッシュする
- `js-combine-iterations` - 複数のfilter/mapを1つのループにまとめる
- `js-length-check-first` - 高コストな比較の前に配列の長さをチェックする
- `js-early-exit` - 関数から早期リターンする
- `js-hoist-regexp` - RegExpの生成をループの外に移す
- `js-min-max-loop` - min/maxにはsortではなくループを使う
- `js-set-map-lookups` - O(1)ルックアップにはSet/Mapを使う
- `js-tosorted-immutable` - イミュータビリティのためにtoSorted()を使う

### 8. 高度なパターン (LOW)

- `advanced-event-handler-refs` - イベントハンドラーをrefに保存する
- `advanced-init-once` - アプリ起動時に1回だけ初期化する
- `advanced-use-latest` - 安定したコールバックrefにuseLatestを使う

## 使い方

各ルールファイルで詳細な説明とコード例を確認してください：

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

各ルールファイルには以下が含まれます：
- そのルールが重要な理由の簡単な説明
- 悪い例（説明付き）
- 良い例（説明付き）
- 補足情報と参考リンク

## 全ルールをまとめたドキュメント

すべてのルールを展開した完全版ガイド: `AGENTS.md`
