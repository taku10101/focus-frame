# React Best Practices

**バージョン 1.0.0**  
Vercel Engineering  
2026年1月

> **注意:**  
> このドキュメントは主に、React および Next.js コードベースの保守、生成、リファクタリングを行う
> エージェントおよび LLM 向けです。人間の開発者にも有用ですが、ここで示すガイダンスは
> AI を活用したワークフローにおける自動化と一貫性のために最適化されています。

---

## 概要

React および Next.js アプリケーション向けの包括的なパフォーマンス最適化ガイドです。AI エージェントおよび LLM を対象に設計されており、8つのカテゴリにわたる40以上のルールを含み、CRITICAL（最重要）（waterfall の排除、bundle サイズの削減）から段階的な改善（高度なパターン）まで影響度順に優先されています。各ルールには詳細な説明、誤った例と正しい例を比較した実例、および自動リファクタリングやコード生成を支援するための具体的な影響指標が含まれています。

---

## 目次

1. [Waterfall の排除](#1-eliminating-waterfalls) — **CRITICAL（最重要）**
   - 1.1 [必要になるまで Await を遅延させる](#11-defer-await-until-needed)
   - 1.2 [依存関係に基づく並列化](#12-dependency-based-parallelization)
   - 1.3 [API Routes での Waterfall チェーンを防ぐ](#13-prevent-waterfall-chains-in-api-routes)
   - 1.4 [独立した処理への Promise.all() の使用](#14-promiseall-for-independent-operations)
   - 1.5 [戦略的な Suspense 境界の配置](#15-strategic-suspense-boundaries)
2. [Bundle サイズの最適化](#2-bundle-size-optimization) — **CRITICAL（最重要）**
   - 2.1 [バレルファイルからのインポートを避ける](#21-avoid-barrel-file-imports)
   - 2.2 [条件付きモジュールロード](#22-conditional-module-loading)
   - 2.3 [重要でないサードパーティライブラリの読み込みを遅延させる](#23-defer-non-critical-third-party-libraries)
   - 2.4 [重いコンポーネントへの動的インポート](#24-dynamic-imports-for-heavy-components)
   - 2.5 [ユーザーの意図に基づくプリロード](#25-preload-based-on-user-intent)
3. [Server サイドパフォーマンス](#3-server-side-performance) — **HIGH（高）**
   - 3.1 [Server Actions を API Routes と同様に認証する](#31-authenticate-server-actions-like-api-routes)
   - 3.2 [RSC Props での重複シリアライゼーションを避ける](#32-avoid-duplicate-serialization-in-rsc-props)
   - 3.3 [クロスリクエスト LRU キャッシング](#33-cross-request-lru-caching)
   - 3.4 [RSC 境界でのシリアライゼーションを最小化する](#34-minimize-serialization-at-rsc-boundaries)
   - 3.5 [コンポーネント合成による並列データフェッチ](#35-parallel-data-fetching-with-component-composition)
   - 3.6 [React.cache() によるリクエストごとの重複排除](#36-per-request-deduplication-with-reactcache)
   - 3.7 [ノンブロッキング処理への after() の使用](#37-use-after-for-non-blocking-operations)
4. [Client サイドデータフェッチ](#4-client-side-data-fetching) — **MEDIUM-HIGH（中〜高）**
   - 4.1 [グローバルイベントリスナーの重複排除](#41-deduplicate-global-event-listeners)
   - 4.2 [スクロールパフォーマンスのためのパッシブイベントリスナー](#42-use-passive-event-listeners-for-scrolling-performance)
   - 4.3 [自動重複排除のための SWR の使用](#43-use-swr-for-automatic-deduplication)
   - 4.4 [localStorage データのバージョン管理と最小化](#44-version-and-minimize-localstorage-data)
5. [再レンダリングの最適化](#5-re-render-optimization) — **MEDIUM（中）**
   - 5.1 [レンダリング中に派生 State を計算する](#51-calculate-derived-state-during-rendering)
   - 5.2 [使用する時点まで State の読み取りを遅延させる](#52-defer-state-reads-to-usage-point)
   - 5.3 [プリミティブ型の結果を返す単純な式を useMemo でラップしない](#53-do-not-wrap-a-simple-expression-with-a-primitive-result-type-in-usememo)
   - 5.4 [メモ化されたコンポーネントのデフォルト非プリミティブパラメーター値を定数に切り出す](#54-extract-default-non-primitive-parameter-value-from-memoized-component-to-constant)
   - 5.5 [メモ化されたコンポーネントに切り出す](#55-extract-to-memoized-components)
   - 5.6 [Effect の依存関係を絞り込む](#56-narrow-effect-dependencies)
   - 5.7 [インタラクションのロジックをイベントハンドラーに置く](#57-put-interaction-logic-in-event-handlers)
   - 5.8 [派生 State を購読する](#58-subscribe-to-derived-state)
   - 5.9 [関数型の setState 更新を使用する](#59-use-functional-setstate-updates)
   - 5.10 [遅延 State 初期化を使用する](#510-use-lazy-state-initialization)
   - 5.11 [緊急でない更新には Transitions を使用する](#511-use-transitions-for-non-urgent-updates)
   - 5.12 [一時的な値には useRef を使用する](#512-use-useref-for-transient-values)
6. [レンダリングパフォーマンス](#6-rendering-performance) — **MEDIUM（中）**
   - 6.1 [SVG 要素ではなく SVG ラッパーをアニメートする](#61-animate-svg-wrapper-instead-of-svg-element)
   - 6.2 [長いリストへの CSS content-visibility の適用](#62-css-content-visibility-for-long-lists)
   - 6.3 [静的な JSX 要素を巻き上げる](#63-hoist-static-jsx-elements)
   - 6.4 [SVG の精度を最適化する](#64-optimize-svg-precision)
   - 6.5 [ちらつきなしでハイドレーションの不一致を防ぐ](#65-prevent-hydration-mismatch-without-flickering)
   - 6.6 [想定されるハイドレーション不一致を抑制する](#66-suppress-expected-hydration-mismatches)
   - 6.7 [表示/非表示に Activity コンポーネントを使用する](#67-use-activity-component-for-showhide)
   - 6.8 [明示的な条件付きレンダリングを使用する](#68-use-explicit-conditional-rendering)
   - 6.9 [手動のローディング State の代わりに useTransition を使用する](#69-use-usetransition-over-manual-loading-states)
7. [JavaScript パフォーマンス](#7-javascript-performance) — **LOW-MEDIUM（低〜中）**
   - 7.1 [レイアウトスラッシングを避ける](#71-avoid-layout-thrashing)
   - 7.2 [繰り返し検索のためのインデックスマップを構築する](#72-build-index-maps-for-repeated-lookups)
   - 7.3 [ループ内でのプロパティアクセスをキャッシュする](#73-cache-property-access-in-loops)
   - 7.4 [繰り返し行われる関数呼び出しをキャッシュする](#74-cache-repeated-function-calls)
   - 7.5 [Storage API 呼び出しをキャッシュする](#75-cache-storage-api-calls)
   - 7.6 [複数の配列イテレーションをまとめる](#76-combine-multiple-array-iterations)
   - 7.7 [配列比較での早期長さチェック](#77-early-length-check-for-array-comparisons)
   - 7.8 [関数からの早期リターン](#78-early-return-from-functions)
   - 7.9 [RegExp 生成を巻き上げる](#79-hoist-regexp-creation)
   - 7.10 [ソートの代わりにループで最小値/最大値を求める](#710-use-loop-for-minmax-instead-of-sort)
   - 7.11 [O(1) 検索に Set/Map を使用する](#711-use-setmap-for-o1-lookups)
   - 7.12 [不変性のために sort() の代わりに toSorted() を使用する](#712-use-tosorted-instead-of-sort-for-immutability)
8. [高度なパターン](#8-advanced-patterns) — **LOW（低）**
   - 8.1 [マウントごとではなくアプリを一度だけ初期化する](#81-initialize-app-once-not-per-mount)
   - 8.2 [イベントハンドラーを Ref に保存する](#82-store-event-handlers-in-refs)
   - 8.3 [安定したコールバック Ref のための useEffectEvent](#83-useeffectevent-for-stable-callback-refs)

---

## 1. Waterfall の排除

**影響: CRITICAL（最重要）**

Waterfall はパフォーマンス上の最大の問題です。連続した await が増えるたびに、ネットワークレイテンシが丸ごと加算されます。Waterfall を排除することで最大の改善効果が得られます。

### 1.1 必要になるまで Await を遅延させる

**影響: HIGH（高）（不要なコードパスのブロッキングを避ける）**

実際に使用される分岐の中に `await` 操作を移動させ、それを必要としないコードパスのブロッキングを避けます。

**誤った例: 両方の分岐をブロックしている**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  
  if (skipProcessing) {
    // Returns immediately but still waited for userData
    return { skipped: true }
  }
  
  // Only this branch uses userData
  return processUserData(userData)
}
```

**正しい例: 必要な時だけブロックする**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Returns immediately without waiting
    return { skipped: true }
  }
  
  // Fetch only when needed
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**別の例: 早期リターンの最適化**

```typescript
// Incorrect: always fetches permissions
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId)
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}

// Correct: fetches only when needed
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId)
  
  if (!resource) {
    return { error: 'Not found' }
  }
  
  const permissions = await fetchPermissions(userId)
  
  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }
  
  return await updateResourceData(resource, permissions)
}
```

この最適化は、スキップされる分岐が頻繁に選択される場合や、遅延される操作のコストが高い場合に特に効果的です。

### 1.2 依存関係に基づく並列化

**影響: CRITICAL（最重要）（2〜10倍の改善）**

部分的な依存関係がある処理には、`better-all` を使用して並列性を最大化します。これにより各タスクが可能な限り早い段階で開始されます。

**誤った例: profile が不必要に config を待っている**

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

**正しい例: config と profile が並列で実行される**

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})
```

**追加の依存関係を使わない代替手段:**

```typescript
const userPromise = fetchUser()
const profilePromise = userPromise.then(user => fetchProfile(user.id))

const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise
])
```

すべての Promise を先に作成し、最後に `Promise.all()` を呼び出すこともできます。

参考: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

### 1.3 API Routes での Waterfall チェーンを防ぐ

**影響: CRITICAL（最重要）（2〜10倍の改善）**

API Routes や Server Actions では、独立した処理をすぐに開始します（await はまだしなくてよい）。

**誤った例: config が auth を待ち、data が両方を待っている**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**正しい例: auth と config が即座に開始される**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

より複雑な依存チェーンを持つ処理には、`better-all` を使用して並列性を自動的に最大化します（「依存関係に基づく並列化」を参照）。

### 1.4 独立した処理への Promise.all() の使用

**影響: CRITICAL（最重要）（2〜10倍の改善）**

非同期処理間に相互依存関係がない場合は、`Promise.all()` を使って同時に実行します。

**誤った例: 逐次実行、3回のラウンドトリップ**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**正しい例: 並列実行、1回のラウンドトリップ**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

### 1.5 戦略的な Suspense 境界の配置

**影響: HIGH（高）（初期描画の高速化）**

非同期コンポーネントでデータを await してから JSX を返す代わりに、Suspense 境界を使用してデータ読み込み中でもラッパーの UI をより早く表示します。

**誤った例: ラッパー全体がデータフェッチによってブロックされている**

```tsx
async function Page() {
  const data = await fetchData() // Blocks entire page
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

中間部分だけがデータを必要としているにもかかわらず、レイアウト全体がデータを待っています。

**正しい例: ラッパーは即座に表示され、データはストリームで流れ込む**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Only blocks this component
  return <div>{data.content}</div>
}
```

Sidebar、Header、Footer は即座にレンダリングされます。DataDisplay だけがデータを待ちます。

**代替手段: コンポーネント間で Promise を共有する**

```tsx
function Page() {
  // Start fetch immediately, but don't await
  const dataPromise = fetchData()
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay dataPromise={dataPromise} />
        <DataSummary dataPromise={dataPromise} />
      </Suspense>
      <div>Footer</div>
    </div>
  )
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Unwraps the promise
  return <div>{data.content}</div>
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Reuses the same promise
  return <div>{data.summary}</div>
}
```

両方のコンポーネントが同じ Promise を共有するため、フェッチは1回だけ発生します。両コンポーネントが一緒に待機している間も、レイアウトは即座にレンダリングされます。

**このパターンを使わない方がよい場合:**

- レイアウトの決定に必要な重要なデータ（配置に影響する場合）

- スクロールせずに見える範囲の SEO 重要コンテンツ

- Suspense のオーバーヘッドが見合わない小さく高速なクエリ

- レイアウトシフト（ローディング → コンテンツへのジャンプ）を避けたい場合

**トレードオフ:** 初期描画の高速化 vs. 潜在的なレイアウトシフト。UX の優先度に基づいて選択してください。

---

## 2. Bundle サイズの最適化

**影響: CRITICAL（最重要）**

初期 bundle サイズを削減することで、Time to Interactive および Largest Contentful Paint が向上します。

### 2.1 バレルファイルからのインポートを避ける

**影響: CRITICAL（最重要）（200〜800ms のインポートコスト、ビルドの遅延）**

未使用のモジュールを大量に読み込まないよう、バレルファイルではなくソースファイルから直接インポートします。**バレルファイル**とは、複数のモジュールを再エクスポートするエントリーポイントです（例: `export * from './module'` を行う `index.js`）。

人気のあるアイコンやコンポーネントライブラリでは、エントリーファイルに**最大10,000の再エクスポート**が含まれる場合があります。多くの React パッケージでは、**インポートだけで200〜800msかかり**、開発速度と本番のコールドスタートの両方に影響します。

**ツリーシェイキングが効かない理由:** ライブラリが外部（バンドルされない）としてマークされている場合、バンドラーはそれを最適化できません。ツリーシェイキングを有効にするためにバンドルすると、モジュールグラフ全体を解析するためビルドが大幅に遅くなります。

**誤った例: ライブラリ全体をインポートしている**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Loads 1,583 modules, takes ~2.8s extra in dev
// Runtime cost: 200-800ms on every cold start

import { Button, TextField } from '@mui/material'
// Loads 2,225 modules, takes ~4.2s extra in dev
```

**正しい例: 必要なものだけをインポートする**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Loads only 3 modules (~2KB vs ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Loads only what you use
```

**代替手段: Next.js 13.5以降**

```js
// next.config.js - use optimizePackageImports
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material']
  }
}

// Then you can keep the ergonomic barrel imports:
import { Check, X, Menu } from 'lucide-react'
// Automatically transformed to direct imports at build time
```

直接インポートにより、開発時の起動が15〜70%高速化され、ビルドが28%高速化され、コールドスタートが40%高速化され、HMR も大幅に高速化されます。

影響を受けるライブラリの例: `lucide-react`、`@mui/material`、`@mui/icons-material`、`@tabler/icons-react`、`react-icons`、`@headlessui/react`、`@radix-ui/react-*`、`lodash`、`ramda`、`date-fns`、`rxjs`、`react-use`。

参考: [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

### 2.2 条件付きモジュールロード

**影響: HIGH（高）（必要な時だけ大きなデータを読み込む）**

機能が有効化された時だけ大きなデータやモジュールを読み込みます。

**例: アニメーションフレームの遅延ロード**

```tsx
function AnimationPlayer({ enabled, setEnabled }: { enabled: boolean; setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

`typeof window !== 'undefined'` チェックにより、SSR でのこのモジュールのバンドルを防ぎ、Server の bundle サイズとビルド速度を最適化します。

### 2.3 重要でないサードパーティライブラリの読み込みを遅延させる

**影響: MEDIUM（中）（ハイドレーション後に読み込む）**

Analytics、ロギング、エラートラッキングはユーザーのインタラクションをブロックしません。ハイドレーション後に読み込みます。

**誤った例: 初期 bundle をブロックしている**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**正しい例: ハイドレーション後に読み込む**

```tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2.4 重いコンポーネントへの動的インポート

**影響: CRITICAL（最重要）（TTI および LCP に直接影響する）**

初期レンダリングで不要な大きなコンポーネントは `next/dynamic` を使って遅延ロードします。

**誤った例: Monaco がメインチャンクにバンドルされる（約300KB）**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**正しい例: Monaco はオンデマンドで読み込まれる**

```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

### 2.5 ユーザーの意図に基づくプリロード

**影響: MEDIUM（中）（体感レイテンシの削減）**

体感レイテンシを下げるために、必要になる前に重い bundle をプリロードします。

**例: ホバー/フォーカス時にプリロード**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

**例: フィーチャーフラグが有効な時にプリロード**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== 'undefined') {
      void import('./monaco-editor').then(mod => mod.init())
    }
  }, [flags.editorEnabled])

  return <FlagsContext.Provider value={flags}>
    {children}
  </FlagsContext.Provider>
}
```

`typeof window !== 'undefined'` チェックにより、SSR でプリロードされたモジュールのバンドルを防ぎ、Server の bundle サイズとビルド速度を最適化します。

---

## 3. Server サイドパフォーマンス
**影響: HIGH（高）**

サーバーサイドレンダリングとデータフェッチを最適化することで、サーバーサイドのwaterfallを排除し、レスポンスタイムを短縮できます。

### 3.1 Server ActionsをAPI Routesと同様に認証する

**影響: CRITICAL（最重要）（サーバーミューテーションへの不正アクセスを防止する）**

Server Actions（`"use server"`を持つ関数）は、API routesと同様にパブリックなエンドポイントとして公開されます。各Server Actionの**内部**で認証と認可を必ず検証してください。ミドルウェア、レイアウトガード、ページレベルのチェックのみに頼らないでください。Server Actionsは直接呼び出せるためです。

Next.jsのドキュメントには明示的に記載されています：「Server Actionsは、公開APIエンドポイントと同じセキュリティ上の考慮事項で扱い、ユーザーがミューテーションを実行できるかどうかを検証してください。」

**誤った例: 認証チェックなし**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // 誰でも呼び出せる！認証チェックなし
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**正しい例: アクション内での認証**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // アクション内で常に認証をチェック
  const session = await verifySession()
  
  if (!session) {
    throw unauthorized('Must be logged in')
  }
  
  // 認可もチェック
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('Cannot delete other users')
  }
  
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**入力バリデーションを追加した例:**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function updateProfile(data: unknown) {
  // 最初に入力をバリデート
  const validated = updateProfileSchema.parse(data)
  
  // 次に認証
  const session = await verifySession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  // 次に認可
  if (session.user.id !== validated.userId) {
    throw new Error('Can only update own profile')
  }
  
  // 最後にミューテーションを実行
  await db.user.update({
    where: { id: validated.userId },
    data: {
      name: validated.name,
      email: validated.email
    }
  })
  
  return { success: true }
}
```

参考: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)

### 3.2 RSC Propsでの重複シリアライズを避ける

**影響: LOW（低）（重複シリアライズを避けることでネットワークペイロードを削減する）**

RSC→クライアントのシリアライズは、値ではなくオブジェクトの参照によって重複排除されます。同じ参照 = 一度だけシリアライズ、新しい参照 = 再度シリアライズ。変換処理（`.toSorted()`、`.filter()`、`.map()`）はサーバーではなくクライアントで行ってください。

**誤った例: 配列を重複させる**

```tsx
// RSC: 6つの文字列を送信（2つの配列 × 3アイテム）
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />
```

**正しい例: 3つの文字列を送信**

```tsx
// RSC: 一度だけ送信
<ClientList usernames={usernames} />

// クライアント: そこで変換
'use client'
const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

**ネストされた重複排除の動作:**

```tsx
// string[] - すべてを重複させる
usernames={['a','b']} sorted={usernames.toSorted()} // 4つの文字列を送信

// object[] - 配列構造のみを重複させる
users={[{id:1},{id:2}]} sorted={users.toSorted()} // 2つの配列 + 2つのユニークなオブジェクト（4つではない）
```

重複排除は再帰的に機能します。影響はデータ型によって異なります：

- `string[]`、`number[]`、`boolean[]`: **HIGH（高）の影響** - 配列とすべてのプリミティブが完全に重複する

- `object[]`: **LOW（低）の影響** - 配列は重複するが、ネストされたオブジェクトは参照によって重複排除される

**重複排除を破る操作: 新しい参照を作成する**

- 配列: `.toSorted()`、`.filter()`、`.map()`、`.slice()`、`[...arr]`

- オブジェクト: `{...obj}`、`Object.assign()`、`structuredClone()`、`JSON.parse(JSON.stringify())`

**その他の例:**

```tsx
// ❌ 悪い例
<C users={users} active={users.filter(u => u.active)} />
<C product={product} productName={product.name} />

// ✅ 良い例
<C users={users} />
<C product={product} />
// クライアントでフィルタリング/分割代入を行う
```

**例外:** 変換処理が高コストな場合、またはクライアントが元のデータを必要としない場合は、派生データを渡してください。

### 3.3 クロスリクエストLRUキャッシング

**影響: HIGH（高）（リクエストをまたいでキャッシュする）**

`React.cache()`は1つのリクエスト内でのみ機能します。連続するリクエスト間で共有されるデータ（ユーザーがボタンAをクリックしてからボタンBをクリックする場合）には、LRUキャッシュを使用してください。

**実装例:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5分
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// リクエスト1: DBクエリ、結果をキャッシュ
// リクエスト2: キャッシュヒット、DBクエリなし
```

複数のエンドポイントが同じデータを必要とする連続したユーザーアクションが数秒以内に発生する場合に使用してください。

**Vercelの[Fluid Compute](https://vercel.com/docs/fluid-compute)を使用する場合:** 複数の同時リクエストが同じ関数インスタンスとキャッシュを共有できるため、LRUキャッシングは特に効果的です。これにより、Redisなどの外部ストレージを必要とせずに、リクエストをまたいでキャッシュが持続します。

**従来のサーバーレス環境:** 各呼び出しは独立して実行されるため、クロスプロセスキャッシングにはRedisを検討してください。

参考: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

### 3.4 RSC境界でのシリアライズを最小化する

**影響: HIGH（高）（データ転送サイズを削減する）**

React Server/Client境界は、すべてのオブジェクトプロパティを文字列にシリアライズし、HTMLレスポンスと後続のRSCリクエストに埋め込みます。このシリアライズされたデータはページの重さとロード時間に直接影響するため、**サイズは非常に重要です**。クライアントが実際に使用するフィールドのみを渡してください。

**誤った例: 50フィールドすべてをシリアライズする**

```tsx
async function Page() {
  const user = await fetchUser()  // 50フィールド
  return <Profile user={user} />
}

'use client'
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div>  // 1フィールドのみ使用
}
```

**正しい例: 1フィールドのみシリアライズする**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

'use client'
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

### 3.5 コンポジションを使ったParallel Data Fetching

**影響: CRITICAL（最重要）（サーバーサイドのwaterfallを排除する）**

React Server Componentsはツリー内で順次実行されます。コンポジションを使って再構成し、データフェッチを並列化してください。

**誤った例: SidebarはPageのフェッチ完了を待つ**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**正しい例: 両方が同時にフェッチする**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

**childrenプロップを使った代替案:**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  )
}
```

### 3.6 React.cache()を使ったリクエストごとの重複排除

**影響: MEDIUM（中）（リクエスト内での重複排除）**

サーバーサイドのリクエスト重複排除には`React.cache()`を使用してください。認証とデータベースクエリが最も恩恵を受けます。

**使用例:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id }
  })
})
```

単一のリクエスト内で`getCurrentUser()`への複数の呼び出しは、クエリを一度だけ実行します。

**引数としてインラインオブジェクトを避ける:**

`React.cache()`はキャッシュヒットを判定するために浅い等価性（`Object.is`）を使用します。インラインオブジェクトは呼び出しごとに新しい参照を作成するため、キャッシュヒットを防ぎます。

**誤った例: 常にキャッシュミス**

```typescript
const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// 呼び出しごとに新しいオブジェクトを作成するため、キャッシュにヒットしない
getUser({ uid: 1 })
getUser({ uid: 1 })  // キャッシュミス、クエリを再実行
```

**正しい例: キャッシュヒット**

```typescript
const params = { uid: 1 }
getUser(params)  // クエリを実行
getUser(params)  // キャッシュヒット（同じ参照）
```

オブジェクトを渡す必要がある場合は、同じ参照を渡してください：

**Next.js固有の注意事項:**

Next.jsでは、`fetch` APIはリクエストメモ化で自動的に拡張されています。同じURLとオプションを持つリクエストは、単一のリクエスト内で自動的に重複排除されるため、`fetch`呼び出しには`React.cache()`は必要ありません。ただし、`React.cache()`は他の非同期タスクにとって依然として不可欠です：

- データベースクエリ（Prisma、Drizzleなど）

- 重い計算処理

- 認証チェック

- ファイルシステム操作

- fetch以外の非同期処理すべて

コンポーネントツリー全体でこれらの操作を重複排除するために`React.cache()`を使用してください。

参考: [https://react.dev/reference/react/cache](https://react.dev/reference/react/cache)

### 3.7 ノンブロッキング処理にafter()を使用する

**影響: MEDIUM（中）（レスポンスタイムの高速化）**

Next.jsの`after()`を使用して、レスポンス送信後に実行する処理をスケジュールしてください。これにより、ログ記録、アナリティクス、その他の副作用がレスポンスをブロックするのを防ぎます。

**誤った例: レスポンスをブロックする**

```tsx
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // ミューテーションを実行
  await updateDatabase(request)
  
  // ログ記録がレスポンスをブロックする
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**正しい例: ノンブロッキング**

```tsx
import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // ミューテーションを実行
  await updateDatabase(request)
  
  // レスポンス送信後にログ記録
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'
    
    logUserAction({ sessionCookie, userAgent })
  })
  
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

ログ記録がバックグラウンドで実行される間、レスポンスはすぐに送信されます。

**一般的なユースケース:**

- アナリティクストラッキング

- 監査ログ

- 通知の送信

- キャッシュの無効化

- クリーンアップタスク

**重要な注意事項:**

- `after()`はレスポンスが失敗またはリダイレクトされても実行される

- Server Actions、Route Handlers、Server Componentsで動作する

参考: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)

---

## 4. クライアントサイドデータフェッチ
**影響: MEDIUM-HIGH（中〜高）**

自動重複排除と効率的なデータフェッチパターンにより、冗長なネットワークリクエストを削減します。

### 4.1 グローバルイベントリスナーの重複を排除する

**影響: LOW（低）（N個のコンポーネントに対してリスナーは1つ）**

`useSWRSubscription()` を使用して、コンポーネントインスタンス間でグローバルイベントリスナーを共有します。

**誤った例: Nインスタンス = Nリスナー**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}
```

`useKeyboardShortcut` フックを複数回使用すると、各インスタンスが新しいリスナーを登録します。

**正しい例: Nインスタンス = 1リスナー**

```tsx
import useSWRSubscription from 'swr/subscription'

// Module-level Map to track callbacks per key
const keyCallbacks = new Map<string, Set<() => void>>()

function useKeyboardShortcut(key: string, callback: () => void) {
  // Register this callback in the Map
  useEffect(() => {
    if (!keyCallbacks.has(key)) {
      keyCallbacks.set(key, new Set())
    }
    keyCallbacks.get(key)!.add(callback)

    return () => {
      const set = keyCallbacks.get(key)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          keyCallbacks.delete(key)
        }
      }
    }
  }, [key, callback])

  useSWRSubscription('global-keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) {
        keyCallbacks.get(e.key)!.forEach(cb => cb())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}

function Profile() {
  // Multiple shortcuts will share the same listener
  useKeyboardShortcut('p', () => { /* ... */ }) 
  useKeyboardShortcut('k', () => { /* ... */ })
  // ...
}
```

### 4.2 スクロールパフォーマンスのためにPassiveイベントリスナーを使用する

**影響: MEDIUM（中）（イベントリスナーによるスクロール遅延を解消）**

タッチおよびホイールイベントリスナーに `{ passive: true }` を追加して、即時スクロールを有効にします。ブラウザは通常、`preventDefault()` が呼ばれているかどうかを確認するためにリスナーの完了を待つため、スクロール遅延が発生します。

**誤った例:**

```typescript
useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)
  
  document.addEventListener('touchstart', handleTouch)
  document.addEventListener('wheel', handleWheel)
  
  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])
```

**正しい例:**

```typescript
useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)
  
  document.addEventListener('touchstart', handleTouch, { passive: true })
  document.addEventListener('wheel', handleWheel, { passive: true })
  
  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])
```

**passiveを使用する場合:** トラッキング・アナリティクス、ログ記録、`preventDefault()` を呼ばないリスナー全般。

**passiveを使用しない場合:** カスタムスワイプジェスチャーの実装、カスタムズームコントロール、`preventDefault()` が必要なリスナー。

### 4.3 自動重複排除のためにSWRを使用する

**影響: MEDIUM-HIGH（中〜高）（自動重複排除）**

SWRはコンポーネントインスタンス間でリクエストの重複排除、キャッシュ、再検証を実現します。

**誤った例: 重複排除なし、各インスタンスがフェッチ**

```tsx
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
  }, [])
}
```

**正しい例: 複数のインスタンスが1つのリクエストを共有**

```tsx
import useSWR from 'swr'

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

**不変データの場合:**

```tsx
import { useImmutableSWR } from '@/lib/swr'

function StaticContent() {
  const { data } = useImmutableSWR('/api/config', fetcher)
}
```

**ミューテーションの場合:**

```tsx
import { useSWRMutation } from 'swr/mutation'

function UpdateButton() {
  const { trigger } = useSWRMutation('/api/user', updateUser)
  return <button onClick={() => trigger()}>Update</button>
}
```

参照: [https://swr.vercel.app](https://swr.vercel.app)

### 4.4 localStorageデータのバージョン管理と最小化

**影響: MEDIUM（中）（スキーマの競合を防止し、ストレージサイズを削減）**

キーにバージョンプレフィックスを追加し、必要なフィールドのみを保存します。スキーマの競合と機密データの誤った保存を防ぎます。

**誤った例:**

```typescript
// No version, stores everything, no error handling
localStorage.setItem('userConfig', JSON.stringify(fullUserObject))
const data = localStorage.getItem('userConfig')
```

**正しい例:**

```typescript
const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
  } catch {
    // Throws in incognito/private browsing, quota exceeded, or disabled
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// Migration from v1 to v2
function migrate() {
  try {
    const v1 = localStorage.getItem('userConfig:v1')
    if (v1) {
      const old = JSON.parse(v1)
      saveConfig({ theme: old.darkMode ? 'dark' : 'light', language: old.lang })
      localStorage.removeItem('userConfig:v1')
    }
  } catch {}
}
```

**サーバーレスポンスから必要最小限のフィールドのみを保存:**

```typescript
// User object has 20+ fields, only store what UI needs
function cachePrefs(user: FullUser) {
  try {
    localStorage.setItem('prefs:v1', JSON.stringify({
      theme: user.preferences.theme,
      notifications: user.preferences.notifications
    }))
  } catch {}
}
```

**常にtry-catchで囲む:** `getItem()` と `setItem()` は、プライベートブラウジング（Safari、Firefox）、クォータ超過、または無効化されている場合にスローされます。

**メリット:** バージョン管理によるスキーマの進化、ストレージサイズの削減、トークン・PII・内部フラグの保存防止。

---

## 5. 再レンダリングの最適化
**影響: MEDIUM（中）**

不要な再レンダリングを削減することで、無駄な計算を最小化し、UIの応答性を向上させます。

### 5.1 レンダリング中に派生ステートを計算する

**影響: MEDIUM（中）（冗長なレンダリングとステートのずれを防ぐ）**

値が現在の props/state から計算できる場合、それをステートに格納したり、effect で更新したりしないでください。レンダリング中に派生させることで、余分なレンダリングとステートのずれを回避できます。props の変更のみに応じてステートを effect 内でセットしないでください。代わりに派生値やキー付きリセットを使用してください。

**誤った例: 冗長なステートと effect**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**正しい例: レンダリング中に派生させる**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

参照: [https://react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)

### 5.2 ステートの読み取りを使用箇所まで遅らせる

**影響: MEDIUM（中）（不要なサブスクリプションを回避する）**

コールバック内でのみ読み取る場合は、動的なステート（searchParams、localStorage）をサブスクライブしないでください。

**誤った例: すべての searchParams の変更をサブスクライブする**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

**正しい例: オンデマンドで読み取り、サブスクリプションなし**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

### 5.3 プリミティブな結果型を持つ単純な式を useMemo でラップしない

**影響: LOW（低）-MEDIUM（中）（すべてのレンダリングで無駄な計算が発生する）**

式が単純（論理演算子または算術演算子が少ない）で、プリミティブな結果型（boolean、number、string）を持つ場合、`useMemo` でラップしないでください。

`useMemo` の呼び出しとフックの依存関係の比較は、式自体よりも多くのリソースを消費する可能性があります。

**誤った例:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
  // return some markup
}
```

**正しい例:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // return some markup
}
```

### 5.4 メモ化されたコンポーネントのデフォルト非プリミティブパラメータ値を定数に抽出する

**影響: MEDIUM（中）（デフォルト値に定数を使用してメモ化を復元する）**

メモ化されたコンポーネントに、配列、関数、オブジェクトなどの非プリミティブなオプションパラメータのデフォルト値がある場合、そのパラメータなしでコンポーネントを呼び出すと、メモ化が機能しなくなります。これは、再レンダリングのたびに新しい値インスタンスが作成され、`memo()` の厳密な等価比較を通過しないためです。

この問題を解決するには、デフォルト値を定数に抽出してください。

**誤った例: `onClick` の値が再レンダリングのたびに異なる**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) {
  // ...
})

// Used without optional onClick
<UserAvatar />
```

**正しい例: 安定したデフォルト値**

```tsx
const NOOP = () => {};

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) {
  // ...
})

// Used without optional onClick
<UserAvatar />
```

### 5.5 メモ化されたコンポーネントに抽出する

**影響: MEDIUM（中）（早期リターンを可能にする）**

高コストな処理をメモ化されたコンポーネントに抽出して、計算前に早期リターンできるようにします。

**誤った例: ローディング中でもアバターを計算する**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**正しい例: ローディング中は計算をスキップする**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

**注意:** プロジェクトで [React Compiler](https://react.dev/learn/react-compiler) が有効になっている場合、`memo()` や `useMemo()` による手動のメモ化は不要です。コンパイラが自動的に再レンダリングを最適化します。

### 5.6 Effect の依存関係を絞り込む

**影響: LOW（低）（effect の再実行を最小化する）**

effect の再実行を最小化するために、オブジェクトの代わりにプリミティブな依存関係を指定してください。

**誤った例: user の任意のフィールド変更で再実行される**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**正しい例: id が変更された場合のみ再実行される**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

**派生ステートの場合は、effect の外で計算する:**

```tsx
// 誤った例: width=767, 766, 765... で実行される
useEffect(() => {
  if (width < 768) {
    enableMobileMode()
  }
}, [width])

// 正しい例: boolean の遷移時のみ実行される
const isMobile = width < 768
useEffect(() => {
  if (isMobile) {
    enableMobileMode()
  }
}, [isMobile])
```

### 5.7 インタラクションロジックをイベントハンドラに置く

**影響: MEDIUM（中）（effect の再実行と重複する副作用を回避する）**

副作用が特定のユーザーアクション（送信、クリック、ドラッグ）によってトリガーされる場合は、そのイベントハンドラで実行してください。アクションをステート + effect としてモデル化しないでください。これにより、無関係な変更で effect が再実行され、アクションが重複する可能性があります。

**誤った例: イベントをステート + effect としてモデル化する**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (submitted) {
      post('/api/register')
      showToast('Registered', theme)
    }
  }, [submitted, theme])

  return <button onClick={() => setSubmitted(true)}>Submit</button>
}
```

**正しい例: ハンドラ内で処理する**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('Registered', theme)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

参照: [https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler](https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler)

### 5.8 派生ステートをサブスクライブする

**影響: MEDIUM（中）（再レンダリングの頻度を削減する）**

再レンダリングの頻度を減らすために、継続的な値の代わりに派生した boolean ステートをサブスクライブします。

**誤った例: ピクセル変化のたびに再レンダリングされる**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // updates continuously
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

**正しい例: boolean が変化した場合のみ再レンダリングされる**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

### 5.9 関数型 setState 更新を使用する

**影響: MEDIUM（中）（古いクロージャと不要なコールバックの再作成を防ぐ）**

現在のステート値に基づいてステートを更新する場合、ステート変数を直接参照する代わりに、setState の関数型更新フォームを使用してください。これにより、古いクロージャを防ぎ、不要な依存関係を排除し、安定したコールバック参照を作成できます。

**誤った例: ステートを依存関係として必要とする**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // Callback must depend on items, recreated on every items change
  const addItems = useCallback((newItems: Item[]) => {
    setItems([...items, ...newItems])
  }, [items])  // ❌ items dependency causes recreations
  
  // Risk of stale closure if dependency is forgotten
  const removeItem = useCallback((id: string) => {
    setItems(items.filter(item => item.id !== id))
  }, [])  // ❌ Missing items dependency - will use stale items!
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

最初のコールバックは `items` が変化するたびに再作成され、子コンポーネントが不要に再レンダリングされる可能性があります。2番目のコールバックには古いクロージャのバグがあり、常に初期の `items` の値を参照します。

**正しい例: 安定したコールバック、古いクロージャなし**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)
  
  // Stable callback, never recreated
  const addItems = useCallback((newItems: Item[]) => {
    setItems(curr => [...curr, ...newItems])
  }, [])  // ✅ No dependencies needed
  
  // Always uses latest state, no stale closure risk
  const removeItem = useCallback((id: string) => {
    setItems(curr => curr.filter(item => item.id !== id))
  }, [])  // ✅ Safe and stable
  
  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**メリット:**

1. **安定したコールバック参照** - ステートが変化してもコールバックを再作成する必要がない

2. **古いクロージャなし** - 常に最新のステート値で操作する

3. **依存関係が少ない** - 依存関係の配列を簡略化し、メモリリークを削減する

4. **バグを防止** - React のクロージャバグの最も一般的な原因を排除する

**関数型更新を使用するタイミング:**

- 現在のステート値に依存する任意の setState

- ステートが必要な useCallback/useMemo の内部

- ステートを参照するイベントハンドラ

- ステートを更新する非同期操作

**直接更新で問題ない場合:**

- ステートを静的な値にセットする: `setCount(0)`

- props/引数のみからステートをセットする: `setName(newName)`

- ステートが以前の値に依存しない場合

**注意:** プロジェクトで [React Compiler](https://react.dev/learn/react-compiler) が有効になっている場合、コンパイラが一部のケースを自動的に最適化できますが、正確性と古いクロージャのバグを防ぐために関数型更新が引き続き推奨されます。

### 5.10 遅延ステート初期化を使用する

**影響: MEDIUM（中）（すべてのレンダリングで無駄な計算が発生する）**

高コストな初期値には `useState` に関数を渡してください。関数形式なしでは、初期化処理は初回のみ使用されるにもかかわらず、すべてのレンダリングで実行されます。

**誤った例: すべてのレンダリングで実行される**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs on EVERY render, even after initialization
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  // When query changes, buildSearchIndex runs again unnecessarily
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse runs on every render
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('settings') || '{}')
  )
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

**正しい例: 一度だけ実行される**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() runs ONLY on initial render
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')
  
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse runs only on initial render
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })
  
  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

localStorage/sessionStorage からの初期値の計算、データ構造（インデックス、マップ）の構築、DOM からの読み取り、または重い変換の実行時には遅延初期化を使用してください。

単純なプリミティブ（`useState(0)`）、直接参照（`useState(props.value)`）、または安価なリテラル（`useState({})`）の場合、関数形式は不要です。

### 5.11 非緊急の更新に Transitions を使用する

**影響: MEDIUM（中）（UIの応答性を維持する）**

UIの応答性を維持するために、頻繁で緊急でないステート更新を transition としてマークします。

**誤った例: スクロールのたびに UI をブロックする**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**正しい例: ノンブロッキングな更新**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

### 5.12 一時的な値には useRef を使用する

**影響: MEDIUM（中）（頻繁な更新での不要な再レンダリングを回避する）**

値が頻繁に変化し、更新のたびに再レンダリングを望まない場合（マウストラッカー、インターバル、一時的なフラグなど）、`useState` の代わりに `useRef` に格納してください。UIには コンポーネントのステートを使用し、DOM に隣接する一時的な値には ref を使用してください。ref の更新は再レンダリングをトリガーしません。

**誤った例: 更新のたびにレンダリングされる**

```tsx
function Tracker() {
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setLastX(e.clientX)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: lastX,
        width: 8,
        height: 8,
        background: 'black',
      }}
    />
  )
}
```

**正しい例: トラッキングで再レンダリングなし**

```tsx
function Tracker() {
  const lastXRef = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX
      const node = dotRef.current
      if (node) {
        node.style.transform = `translateX(${e.clientX}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        background: 'black',
        transform: 'translateX(0px)',
      }}
    />
  )
}
```

---

## 6. レンダリングパフォーマンス
**影響: MEDIUM（中）**

レンダリングプロセスを最適化することで、ブラウザが行う作業を削減できます。

### 6.1 SVG 要素ではなくラッパーをアニメーションさせる

**影響: LOW（低）（ハードウェアアクセラレーションを有効化）**

多くのブラウザでは、SVG 要素への CSS3 アニメーションにハードウェアアクセラレーションが適用されません。SVG を `<div>` でラップし、ラッパーをアニメーションさせてください。

**誤った例: SVG を直接アニメーション - ハードウェアアクセラレーションなし**

```tsx
function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin"
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
    </svg>
  )
}
```

**正しい例: ラッパー div をアニメーション - ハードウェアアクセラレーション適用**

```tsx
function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
      </svg>
    </div>
  )
}
```

これはすべての CSS トランスフォームとトランジション（`transform`、`opacity`、`translate`、`scale`、`rotate`）に適用されます。ラッパー div を使用することで、ブラウザがスムーズなアニメーションのために GPU アクセラレーションを使用できるようになります。

### 6.2 長いリストへの CSS content-visibility の適用

**影響: HIGH（高）（初期レンダリングの高速化）**

`content-visibility: auto` を適用して、画面外のレンダリングを遅延させます。

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**例:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="overflow-y-auto h-screen">
      {messages.map(msg => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

1000 件のメッセージがある場合、ブラウザは画面外の約 990 件のアイテムのレイアウト/ペイントをスキップします（初期レンダリングが約 10 倍高速化）。

### 6.3 静的な JSX 要素のホイスト

**影響: LOW（低）（再生成を回避）**

静的な JSX をコンポーネントの外に抽出して、再生成を回避します。

**誤った例: レンダリングのたびに要素を再生成する**

```tsx
function LoadingSkeleton() {
  return <div className="animate-pulse h-20 bg-gray-200" />
}

function Container() {
  return (
    <div>
      {loading && <LoadingSkeleton />}
    </div>
  )
}
```

**正しい例: 同じ要素を再利用する**

```tsx
const loadingSkeleton = (
  <div className="animate-pulse h-20 bg-gray-200" />
)

function Container() {
  return (
    <div>
      {loading && loadingSkeleton}
    </div>
  )
}
```

これは特に、レンダリングのたびに再生成するコストが高い大きな静的 SVG ノードに対して有効です。

**注意:** プロジェクトで [React Compiler](https://react.dev/learn/react-compiler) が有効になっている場合、コンパイラが自動的に静的な JSX 要素をホイストしてコンポーネントの再レンダリングを最適化するため、手動でのホイストは不要です。

### 6.4 SVG の精度を最適化する

**影響: LOW（低）（ファイルサイズの削減）**

SVG の座標精度を下げてファイルサイズを削減します。最適な精度は viewBox のサイズによって異なりますが、一般的に精度の削減を検討すべきです。

**誤った例: 過剰な精度**

```svg
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />
```

**正しい例: 小数点以下 1 桁**

```svg
<path d="M 10.3 20.8 L 30.9 40.2" />
```

**SVGO による自動化:**

```bash
npx svgo --precision=1 --multipass icon.svg
```

### 6.5 フリッカーなしでハイドレーションの不一致を防ぐ

**影響: MEDIUM（中）（視覚的なフリッカーとハイドレーションエラーを回避）**

クライアントサイドのストレージ（localStorage、Cookie）に依存するコンテンツをレンダリングする場合、React がハイドレーションする前に DOM を更新する同期スクリプトを挿入することで、SSR の破損とハイドレーション後のフリッカーの両方を回避できます。

**誤った例: SSR が壊れる**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage はサーバーでは利用不可 - エラーが発生する
  const theme = localStorage.getItem('theme') || 'light'
  
  return (
    <div className={theme}>
      {children}
    </div>
  )
}
```

`localStorage` が undefined のため、サーバーサイドレンダリングが失敗します。

**誤った例: 視覚的なフリッカーが発生する**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    // ハイドレーション後に実行 - 視覚的なフラッシュが発生する
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    }
  }, [])
  
  return (
    <div className={theme}>
      {children}
    </div>
  )
}
```

コンポーネントはまずデフォルト値（`light`）でレンダリングされ、ハイドレーション後に更新されるため、誤ったコンテンツの視覚的なフラッシュが発生します。

**正しい例: フリッカーなし、ハイドレーションの不一致なし**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">
        {children}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  )
}
```

インラインスクリプトは要素を表示する前に同期的に実行されるため、DOM にはすでに正しい値が設定されています。フリッカーもハイドレーションの不一致も発生しません。

このパターンは、デフォルト値をフラッシュすることなく即座にレンダリングすべきテーマトグル、ユーザー設定、認証状態、およびクライアント専用データに特に有効です。

### 6.6 既知のハイドレーションの不一致を抑制する

**影響: LOW（低）〜 MEDIUM（中）（既知の差異に対するノイジーなハイドレーション警告を回避）**

SSR フレームワーク（例: Next.js）では、一部の値はサーバーとクライアントで意図的に異なる場合があります（ランダム ID、日付、ロケール/タイムゾーンのフォーマット）。このような *想定された* 不一致に対しては、動的なテキストを `suppressHydrationWarning` を持つ要素でラップして、ノイジーな警告を防ぎます。実際のバグを隠すためにこれを使用しないでください。乱用しないでください。

**誤った例: 既知の不一致による警告**

```tsx
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>
}
```

**正しい例: 想定された不一致のみを抑制する**

```tsx
function Timestamp() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleString()}
    </span>
  )
}
```

### 6.7 表示/非表示に Activity コンポーネントを使用する

**影響: MEDIUM（中）（状態/DOM を保持）**

React の `<Activity>` を使用して、頻繁に表示を切り替える高コストなコンポーネントの状態/DOM を保持します。

**使用方法:**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

高コストな再レンダリングと状態の損失を回避できます。

### 6.8 明示的な条件付きレンダリングを使用する

**影響: LOW（低）（0 や NaN のレンダリングを防ぐ）**

条件が `0`、`NaN`、またはレンダリングされる他の falsy 値になる可能性がある場合は、条件付きレンダリングに `&&` ではなく明示的な三項演算子（`? :`）を使用します。

**誤った例: count が 0 のとき "0" がレンダリングされる**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count && <span className="badge">{count}</span>}
    </div>
  )
}

// count = 0 のとき: <div>0</div> がレンダリングされる
// count = 5 のとき: <div><span class="badge">5</span></div> がレンダリングされる
```

**正しい例: count が 0 のとき何もレンダリングされない**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </div>
  )
}

// count = 0 のとき: <div></div> がレンダリングされる
// count = 5 のとき: <div><span class="badge">5</span></div> がレンダリングされる
```

### 6.9 手動のローディング状態の代わりに useTransition を使用する

**影響: LOW（低）（再レンダリングの削減とコードの明確化）**

ローディング状態に手動の `useState` ではなく `useTransition` を使用します。これにより組み込みの `isPending` 状態が提供され、トランジションが自動的に管理されます。

**誤った例: 手動のローディング状態**

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setIsLoading(true)
    setQuery(value)
    const data = await fetchResults(value)
    setResults(data)
    setIsLoading(false)
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isLoading && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**正しい例: 組み込みの pending 状態を持つ useTransition**

```tsx
import { useTransition, useState } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // 入力を即座に更新
    
    startTransition(async () => {
      // 結果をフェッチして更新
      const data = await fetchResults(value)
      setResults(data)
    })
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**メリット:**

- **自動 pending 状態**: `setIsLoading(true/false)` を手動で管理する必要がない

- **エラー耐性**: トランジションがスローした場合でも pending 状態が正しくリセットされる

- **レスポンシブ性の向上**: 更新中も UI のレスポンシブ性を維持する

- **割り込み処理**: 新しいトランジションが自動的に保留中のものをキャンセルする

参考: [https://react.dev/reference/react/useTransition](https://react.dev/reference/react/useTransition)

---

## 7. JavaScript パフォーマンス
**影響: LOW（低）-MEDIUM（中）**

ホットパスのマイクロ最適化を積み重ねることで、意味のある改善につながります。

### 7.1 レイアウトスラッシングを避ける

**影響: MEDIUM（中）（強制同期レイアウトを防ぎ、パフォーマンスのボトルネックを削減）**

スタイルの書き込みとレイアウトの読み取りを交互に行わないようにしましょう。スタイル変更の間にレイアウトプロパティ（`offsetWidth`、`getBoundingClientRect()`、`getComputedStyle()` など）を読み取ると、ブラウザは同期リフローを強制されます。

**これはOK: ブラウザがスタイル変更をバッチ処理する**

```typescript
function updateElementStyles(element: HTMLElement) {
  // Each line invalidates style, but browser batches the recalculation
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'
  element.style.border = '1px solid black'
}
```

**誤った例: 読み取りと書き込みが交互になるとリフローが強制される**

```typescript
function layoutThrashing(element: HTMLElement) {
  element.style.width = '100px'
  const width = element.offsetWidth  // Forces reflow
  element.style.height = '200px'
  const height = element.offsetHeight  // Forces another reflow
}
```

**正しい例: 書き込みをまとめて行い、その後一度だけ読み取る**

```typescript
function updateElementStyles(element: HTMLElement) {
  // Batch all writes together
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'
  element.style.border = '1px solid black'
  
  // Read after all writes are done (single reflow)
  const { width, height } = element.getBoundingClientRect()
}
```

**正しい例: 読み取りをまとめてから書き込む**

```typescript
function updateElementStyles(element: HTMLElement) {
  element.classList.add('highlighted-box')
  
  const { width, height } = element.getBoundingClientRect()
}
```

**より良い方法: CSSクラスを使用する**

**React の例:**

```tsx
// Incorrect: interleaving style changes with layout queries
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = '100px'
      const width = ref.current.offsetWidth // Forces layout
      ref.current.style.height = '200px'
    }
  }, [isHighlighted])
  
  return <div ref={ref}>Content</div>
}

// Correct: toggle class
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  return (
    <div className={isHighlighted ? 'highlighted-box' : ''}>
      Content
    </div>
  )
}
```

可能な限りインラインスタイルよりも CSS クラスを優先しましょう。CSS ファイルはブラウザにキャッシュされ、クラスは関心の分離が適切に行われており、保守もしやすくなります。

レイアウトを強制する操作の詳細については、[このgist](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) と [CSS Triggers](https://csstriggers.com/) を参照してください。

### 7.2 繰り返しルックアップにはインデックスマップを構築する

**影響: LOW（低）-MEDIUM（中）（100万回の操作 → 2000回の操作）**

同じキーで複数の `.find()` を呼び出す場合は Map を使用しましょう。

**誤った例（ルックアップごとに O(n)）:**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.userId)
  }))
}
```

**正しい例（ルックアップごとに O(1)）:**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map(u => [u.id, u]))

  return orders.map(order => ({
    ...order,
    user: userById.get(order.userId)
  }))
}
```

Map を一度構築すれば O(n) で済み、その後のルックアップはすべて O(1) になります。

1000件の注文 × 1000人のユーザーの場合: 100万回の操作 → 2000回の操作になります。

### 7.3 ループ内でプロパティアクセスをキャッシュする

**影響: LOW（低）-MEDIUM（中）（ルックアップ回数を削減）**

ホットパスではオブジェクトのプロパティルックアップをキャッシュしましょう。

**誤った例: N回のイテレーションで3回のルックアップ**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**正しい例: ルックアップ合計1回**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```

### 7.4 繰り返し呼び出される関数の結果をキャッシュする

**影響: MEDIUM（中）（冗長な計算を避ける）**

同じ入力で同じ関数がレンダリング中に繰り返し呼ばれる場合は、モジュールレベルの Map を使って関数の結果をキャッシュしましょう。

**誤った例: 冗長な計算**

```typescript
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify() called 100+ times for same project names
        const slug = slugify(project.name)
        
        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**正しい例: キャッシュされた結果**

```typescript
// Module-level cache
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // Computed only once per unique project name
        const slug = cachedSlugify(project.name)
        
        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**単一値関数のシンプルなパターン:**

```typescript
let isLoggedInCache: boolean | null = null

function isLoggedIn(): boolean {
  if (isLoggedInCache !== null) {
    return isLoggedInCache
  }
  
  isLoggedInCache = document.cookie.includes('auth=')
  return isLoggedInCache
}

// Clear cache when auth changes
function onAuthChange() {
  isLoggedInCache = null
}
```

フック（hook）ではなく Map を使うことで、ユーティリティ、イベントハンドラなど React コンポーネント以外の場所でも動作します。

参考: [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

### 7.5 Storage API の呼び出しをキャッシュする

**影響: LOW（低）-MEDIUM（中）（高コストな I/O を削減）**

`localStorage`、`sessionStorage`、`document.cookie` は同期的かつコストが高いです。読み取り結果をメモリにキャッシュしましょう。

**誤った例: 呼び出すたびにストレージを読み取る**

```typescript
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}
// Called 10 times = 10 storage reads
```

**正しい例: Map キャッシュ**

```typescript
const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value)  // keep cache in sync
}
```

フック（hook）ではなく Map を使うことで、ユーティリティ、イベントハンドラなど React コンポーネント以外の場所でも動作します。

**Cookie のキャッシュ:**

```typescript
let cookieCache: Record<string, string> | null = null

function getCookie(name: string) {
  if (!cookieCache) {
    cookieCache = Object.fromEntries(
      document.cookie.split('; ').map(c => c.split('='))
    )
  }
  return cookieCache[name]
}
```

**重要: 外部からの変更時にキャッシュを無効化する**

```typescript
window.addEventListener('storage', (e) => {
  if (e.key) storageCache.delete(e.key)
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    storageCache.clear()
  }
})
```

別タブやサーバーからの Cookie 設定など、外部からストレージが変更される可能性がある場合は、キャッシュを無効化してください。

### 7.6 複数の配列イテレーションを1つにまとめる

**影響: LOW（低）-MEDIUM（中）（イテレーション回数を削減）**

複数の `.filter()` や `.map()` の呼び出しは配列を複数回イテレートします。1つのループにまとめましょう。

**誤った例: 3回のイテレーション**

```typescript
const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)
const inactive = users.filter(u => !u.isActive)
```

**正しい例: 1回のイテレーション**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```

### 7.7 配列比較に対する早期の長さチェック

**影響: MEDIUM（中）-HIGH（高）（長さが異なる場合に高コストな操作を回避）**

ソート、深い等値比較、シリアライズなどのコストが高い操作で配列を比較する際は、まず長さを確認しましょう。長さが異なれば、配列は等しいはずがありません。

実際のアプリケーションでは、この最適化はイベントハンドラやレンダリングループのようなホットパスで比較が行われる場合に特に効果的です。

**誤った例: 常に高コストな比較を実行する**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Always sorts and joins, even when lengths differ
  return current.sort().join() !== original.sort().join()
}
```

`current.length` が 5 で `original.length` が 100 の場合でも、O(n log n) のソートが2回実行されます。また、配列を結合して文字列比較を行うオーバーヘッドも発生します。

**正しい例（O(1) の長さチェックを先に行う）:**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Early return if lengths differ
  if (current.length !== original.length) {
    return true
  }
  // Only sort when lengths match
  const currentSorted = current.toSorted()
  const originalSorted = original.toSorted()
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) {
      return true
    }
  }
  return false
}
```

この新しいアプローチがより効率的な理由:

- 長さが異なる場合に配列のソートと結合のオーバーヘッドを回避できる

- 結合した文字列のメモリ消費を回避できる（大きな配列では特に重要）

- 元の配列を変更しない

- 差異が見つかり次第早期にリターンする

### 7.8 関数からの早期リターン

**影響: LOW（低）-MEDIUM（中）（不要な計算を回避）**

結果が確定した時点で早期リターンして、不要な処理をスキップしましょう。

**誤った例: 答えが見つかった後も全アイテムを処理し続ける**

```typescript
function validateUsers(users: User[]) {
  let hasError = false
  let errorMessage = ''
  
  for (const user of users) {
    if (!user.email) {
      hasError = true
      errorMessage = 'Email required'
    }
    if (!user.name) {
      hasError = true
      errorMessage = 'Name required'
    }
    // Continues checking all users even after error found
  }
  
  return hasError ? { valid: false, error: errorMessage } : { valid: true }
}
```

**正しい例: 最初のエラーが見つかった時点で即座にリターンする**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: 'Email required' }
    }
    if (!user.name) {
      return { valid: false, error: 'Name required' }
    }
  }

  return { valid: true }
}
```

### 7.9 RegExp の生成をホイスト（巻き上げ）する

**影響: LOW（低）-MEDIUM（中）（再生成を回避）**

レンダリング内で RegExp を生成しないようにしましょう。モジュールスコープにホイストするか、`useMemo()` でメモ化しましょう。

**誤った例: レンダリングごとに新しい RegExp が生成される**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**正しい例: メモ化またはホイスト**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**注意: グローバル正規表現はミュータブルな状態を持つ**

```typescript
const regex = /foo/g
regex.test('foo')  // true, lastIndex = 3
regex.test('foo')  // false, lastIndex = 0
```

グローバル正規表現（`/g`）はミュータブルな `lastIndex` 状態を持ちます。

### 7.10 最小値・最大値の検索にはソートではなくループを使う

**影響: LOW（低）（O(n log n) の代わりに O(n)）**

最小値や最大値を見つけるには、配列を1回通過するだけで十分です。ソートは無駄であり、処理も遅くなります。

**誤った例（O(n log n) - 最新のものを見つけるためにソート）:**

```typescript
interface Project {
  id: string
  name: string
  updatedAt: number
}

function getLatestProject(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
  return sorted[0]
}
```

最大値を見つけるためだけに配列全体をソートしています。

**誤った例（O(n log n) - 最古と最新のものを求めてソート）:**

```typescript
function getOldestAndNewest(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => a.updatedAt - b.updatedAt)
  return { oldest: sorted[0], newest: sorted[sorted.length - 1] }
}
```

最小値・最大値だけが必要な場合でも不必要にソートしています。

**正しい例（O(n) - シングルループ）:**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null
  
  let latest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }
  
  return latest
}

function getOldestAndNewest(projects: Project[]) {
  if (projects.length === 0) return { oldest: null, newest: null }
  
  let oldest = projects[0]
  let newest = projects[0]
  
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt < oldest.updatedAt) oldest = projects[i]
    if (projects[i].updatedAt > newest.updatedAt) newest = projects[i]
  }
  
  return { oldest, newest }
}
```

配列を1回通過するだけで、コピーもソートも不要です。

**代替案: 小さな配列には Math.min/Math.max を使う**

```typescript
const numbers = [5, 2, 8, 1, 9]
const min = Math.min(...numbers)
const max = Math.max(...numbers)
```

これは小さな配列には有効ですが、スプレッド演算子の制限により、非常に大きな配列ではエラーが発生したり、遅くなる可能性があります。Chrome 143 では最大配列長は約124,000、Safari 18 では約638,000 です（正確な数値は異なる場合があります - [fiddle](https://jsfiddle.net/qw1jabsx/4/) を参照）。信頼性のためにはループによるアプローチを使用してください。

### 7.11 O(1) のルックアップには Set/Map を使う

**影響: LOW（低）-MEDIUM（中）（O(n) から O(1) へ）**

繰り返しのメンバーシップチェックには、配列を Set/Map に変換しましょう。

**誤った例（チェックごとに O(n)）:**

```typescript
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))
```

**正しい例（チェックごとに O(1)）:**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

### 7.12 イミュータビリティのために sort() の代わりに toSorted() を使う

**影響: MEDIUM（中）-HIGH（高）（React の state における変更バグを防ぐ）**

`.sort()` は配列をインプレースで変更するため、React の state と props でバグが発生する可能性があります。変更なしに新しいソート済み配列を作成するには `.toSorted()` を使いましょう。

**誤った例: 元の配列を変更してしまう**

```typescript
function UserList({ users }: { users: User[] }) {
  // Mutates the users prop array!
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**正しい例: 新しい配列を作成する**

```typescript
function UserList({ users }: { users: User[] }) {
  // Creates new sorted array, original unchanged
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**React でこれが重要な理由:**

1. props/state の変更は React のイミュータビリティモデルを壊す - React は props と state を読み取り専用として扱うことを期待している

2. ステールクロージャのバグを引き起こす - クロージャ（コールバック、エフェクト）内で配列を変更すると、予期しない動作につながる可能性がある

**ブラウザサポート: 古いブラウザ向けのフォールバック**

```typescript
// Fallback for older browsers
const sorted = [...items].sort((a, b) => a.value - b.value)
```

`.toSorted()` はすべてのモダンブラウザ（Chrome 110+、Safari 16+、Firefox 115+、Node.js 20+）で利用可能です。古い環境ではスプレッド演算子を使用してください。

**その他のイミュータブルな配列メソッド:**

- `.toSorted()` - イミュータブルなソート

- `.toReversed()` - イミュータブルな逆順

- `.toSpliced()` - イミュータブルなスプライス

- `.with()` - イミュータブルな要素置換

---

## 8. 高度なパターン
**影響: LOW（低）**

特定のケースに対する高度なパターンで、慎重な実装が必要です。

### 8.1 アプリをマウントごとではなく一度だけ初期化する

**影響: LOW-MEDIUM（開発環境での二重初期化を回避）**

アプリの読み込み時に一度だけ実行すべきアプリ全体の初期化処理を、コンポーネントの `useEffect([])` 内に記述してはいけません。コンポーネントは再マウントされる可能性があり、エフェクトが再実行されます。代わりに、モジュールレベルのガードを使用するか、エントリモジュールのトップレベルで初期化してください。

**誤った例: 開発環境で2回実行され、再マウント時にも再実行される**

```tsx
function Comp() {
  useEffect(() => {
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

**正しい例: アプリの読み込みごとに一度だけ実行**

```tsx
let didInit = false

function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

Reference: [https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application](https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application)

### 8.2 イベントハンドラを Ref に保存する

**影響: LOW（安定したサブスクリプション）**

コールバックの変更によってエフェクトが再サブスクライブされないようにするため、エフェクト内で使用するコールバックを ref に保存してください。

**誤った例: レンダリングのたびに再サブスクライブされる**

```tsx
function useWindowEvent(event: string, handler: (e) => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
```

**正しい例: 安定したサブスクリプション**

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: (e) => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

**代替案: 最新の React を使用している場合は `useEffectEvent` を使用してください:**

`useEffectEvent` は同じパターンに対してよりクリーンな API を提供します。常にハンドラの最新バージョンを呼び出す安定した関数参照を作成します。

### 8.3 安定したコールバック Ref のための useEffectEvent

**影響: LOW（エフェクトの再実行を防止）**

依存配列に追加せずにコールバック内で最新の値にアクセスします。古いクロージャを避けながらエフェクトの再実行を防ぎます。

**誤った例: コールバックが変更されるたびにエフェクトが再実行される**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])
}
```

**正しい例: React の useEffectEvent を使用する**

```tsx
import { useEffectEvent } from 'react';

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```

---

## 参考文献

1. [https://react.dev](https://react.dev)
2. [https://nextjs.org](https://nextjs.org)
3. [https://swr.vercel.app](https://swr.vercel.app)
4. [https://github.com/shuding/better-all](https://github.com/shuding/better-all)
5. [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
6. [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
7. [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
