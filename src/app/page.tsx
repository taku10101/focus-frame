"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CompletionCelebration } from "@/components/canvas/CompletionCelebration";
import { PixelGrid } from "@/components/canvas/PixelGrid";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { useChallenge } from "@/hooks/useChallenge";
import { usePixelGrid } from "@/hooks/usePixelGrid";
import { useTimer } from "@/hooks/useTimer";

export default function Home() {
  const timer = useTimer();
  const { challenge, artwork, isLoading, revealCell, reload } = useChallenge();
  const { grid } = usePixelGrid(artwork?.imagePath ?? null, challenge?.gridSize ?? 8);
  const [newlyRevealed, setNewlyRevealed] = useState<number | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleTimerComplete = useCallback(async () => {
    const cellIndex = await revealCell();
    if (cellIndex !== null) {
      setNewlyRevealed(cellIndex);
      setTimeout(() => setNewlyRevealed(null), 2000);
    }
    // Check if challenge is now completed
    if (challenge && challenge.revealedCells.length + 1 >= challenge.totalCells) {
      setTimeout(() => setShowCompletion(true), 1000);
    }
  }, [revealCell, challenge]);

  useEffect(() => {
    timer.onComplete(handleTimerComplete);
  }, [timer.onComplete, handleTimerComplete]);

  const handleDismissCompletion = useCallback(() => {
    setShowCompletion(false);
    reload();
  }, [reload]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0F13]">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0F0F13] px-4 pb-20">
        <h1 className="text-2xl font-bold text-white">FocusFrame</h1>
        <p className="text-center text-gray-400">集中するほど、名画が見えてくる。</p>
        <Link
          href="/select"
          className="rounded-full bg-violet-600 px-8 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          🎨 絵を選ぶ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0F0F13] px-4 pb-20 pt-4">
      <div className="w-full max-w-sm">
        <PixelGrid
          grid={grid}
          gridSize={challenge.gridSize}
          revealedCells={challenge.revealedCells}
          newlyRevealed={newlyRevealed}
        />

        <div className="mt-6">
          <TimerDisplay remainingMs={timer.remainingMs} phase={timer.phase} />
        </div>

        <div className="mt-4">
          <TimerControls
            phase={timer.phase}
            isRunning={timer.isRunning}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onStartBreak={timer.startBreak}
            onSkipBreak={timer.skipBreak}
            hasChallenge={true}
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            {challenge.revealedCells.length}/{challenge.totalCells} マス開放
          </p>
          {artwork && (
            <p className="mt-1 text-xs text-gray-600">
              🎨 {artwork.artist} │ {artwork.genre.join("・")}
            </p>
          )}
        </div>
      </div>

      {showCompletion && artwork && (
        <CompletionCelebration
          title={artwork.title}
          titleEn={artwork.titleEn}
          artist={artwork.artist}
          onDismiss={handleDismissCompletion}
        />
      )}
    </div>
  );
}
