"use client";

interface TimerDisplayProps {
  remainingMs: number;
  phase: "idle" | "focus" | "break" | "completed";
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerDisplay({ remainingMs, phase }: TimerDisplayProps) {
  const colorClass =
    phase === "break"
      ? "text-emerald-400"
      : phase === "focus"
        ? "text-violet-400"
        : "text-gray-300";

  return (
    <div className="text-center">
      <p
        className={`font-mono text-5xl font-bold tabular-nums ${colorClass}`}
        role="timer"
        aria-live="polite"
        aria-label={`残り${formatTime(remainingMs)}`}
      >
        {formatTime(remainingMs)}
      </p>
      {phase === "break" && <p className="mt-1 text-sm text-emerald-400">休憩中</p>}
    </div>
  );
}
