---
title: DOMのCSS変更をまとめる
impact: LOW
impactDescription: 複数のスタイル更新によるレイアウトスラッシングを削減する
tags: js, dom, css, performance, layout
---

## DOMのCSS변更をまとめる

個別プロパティを設定する代わりに、CSSクラスや`cssText`を使用して複数のCSSプロパティ変更をまとめます。個別のプロパティ代入はそれぞれレイアウトの再計算を引き起こす可能性があります。

**悪い例（複数のスタイル代入）：**

```typescript
element.style.width = '100px'
element.style.height = '100px'
element.style.transform = 'translateX(10px)'
```

**良い例（単一の代入）：**

```typescript
element.style.cssText = 'width: 100px; height: 100px; transform: translateX(10px)'
// またはCSSクラスを使用する
element.classList.add('active-state')
```
