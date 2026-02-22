---
title: 表示/非表示にActivityコンポーネントを使用する
impact: MEDIUM
impactDescription: 非表示/表示サイクル中にコンポーネントの状態を保持する
tags: rendering, activity, show-hide, state-preservation
---

## 表示/非表示にActivityコンポーネントを使用する

状態を破棄・再生成する条件付きレンダリングの代わりに、Reactの`<Activity>`コンポーネント（旧`<Offscreen>`）を使用してコンポーネントを表示/非表示にしながら状態を保持します。

**悪い例（非表示時に状態を破棄する）：**

```tsx
function TabPanel({ activeTab }) {
  return (
    <div>
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}
```

**良い例（状態を保持する）：**

```tsx
import { unstable_Activity as Activity } from 'react'

function TabPanel({ activeTab }) {
  return (
    <div>
      <Activity mode={activeTab === 'profile' ? 'visible' : 'hidden'}>
        <ProfileTab />
      </Activity>
      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsTab />
      </Activity>
    </div>
  )
}
```
