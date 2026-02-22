"use client";

import type { TimerPhase } from "@/hooks/useTimer";

interface TimerControlsProps {
  phase: TimerPhase;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartBreak: () => void;
  onSkipBreak: () => void;
  hasChallenge: boolean;
}

export function TimerControls({
  phase,
  isRunning,
  onStart,
  onPause,
  onResume,
  onReset,
  onStartBreak,
  onSkipBreak,
  hasChallenge,
}: TimerControlsProps) {
  if (phase === "completed") {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStartBreak}
          className="flex-1 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
        >
          ☕ 休憩する
        </button>
        <button
          type="button"
          onClick={onSkipBreak}
          className="rounded-full border border-gray-600 px-4 py-3 text-gray-300 transition hover:bg-gray-800"
        >
          スキップ
        </button>
      </div>
    );
  }

  if (phase === "break") {
    return (
      <button
        type="button"
        onClick={onSkipBreak}
        className="w-full rounded-full border border-emerald-500 px-6 py-3 font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
      >
        休憩をスキップ
      </button>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={onStart}
        disabled={!hasChallenge}
        className="w-full rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ▶ スタート
      </button>
    );
  }

  // focus phase
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={isRunning ? onPause : onResume}
        className={`flex-1 rounded-full px-6 py-3 font-semibold text-white transition ${
          isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"
        }`}
      >
        {isRunning ? "⏸ 一時停止" : "▶ 再開"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-gray-600 px-4 py-3 text-gray-300 transition hover:bg-gray-800"
      >
        リセット
      </button>
    </div>
  );
}
