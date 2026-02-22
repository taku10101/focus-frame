"use client";

import { useEffect, useState } from "react";

interface CompletionCelebrationProps {
  title: string;
  titleEn: string;
  artist: string;
  onDismiss: () => void;
}

export function CompletionCelebration({
  title,
  titleEn,
  artist,
  onDismiss,
}: CompletionCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className={`text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="mb-2 text-4xl">🎉</p>
        <h2 className="mb-1 text-3xl font-bold text-white">{title}</h2>
        <p className="mb-1 text-lg text-gray-400">{titleEn}</p>
        <p className="mb-6 text-gray-500">{artist}</p>
        <p className="mb-8 text-emerald-400">完成おめでとう！</p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full bg-violet-600 px-8 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            次の絵を選ぶ
          </button>
        </div>
      </div>
    </div>
  );
}
