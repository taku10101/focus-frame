"use client";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0F0F13] px-4 pb-20 pt-4">
      <h1 className="mb-6 text-xl font-bold text-white">⚙️ 設定</h1>

      <section className="mb-4 rounded-lg bg-[#1A1A24] p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-400">タイマー</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>集中時間</span>
            <span className="text-gray-500">25分（固定）</span>
          </div>
          <div className="flex items-center justify-between">
            <span>休憩時間</span>
            <span className="text-gray-500">5分（固定）</span>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-lg bg-[#1A1A24] p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-400">アプリについて</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>FocusFrame v0.1.0</p>
          <p>集中するほど、名画が見えてくる。</p>
        </div>
      </section>
    </div>
  );
}
