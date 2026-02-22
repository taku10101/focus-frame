---
title: 長いリストにはcontent-visibilityを使用する
impact: MEDIUM
impactDescription: 画面外のコンテンツのレンダリングをスキップする
tags: rendering, css, content-visibility, performance, lists
---

## 長いリストにはcontent-visibilityを使用する

リストアイテムに`content-visibility: auto`を適用して、画面外のコンテンツのレンダリングをスキップします。ブラウザはスクロールして表示されるまで、非表示セクションのレイアウトとペイントをスキップします。

**悪い例（全アイテムをレンダリングする）：**

```tsx
function ArticleList({ articles }) {
  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

**良い例（画面外のレンダリングをスキップする）：**

```tsx
function ArticleList({ articles }) {
  return (
    <div>
      {articles.map(article => (
        <div key={article.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}>
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  )
}
```
