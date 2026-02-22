"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerWorkerResponse } from "@/workers/timer.worker";

export type TimerPhase = "idle" | "focus" | "break" | "completed";

interface TimerState {
  phase: TimerPhase;
  remainingMs: number;
  isRunning: boolean;
}

export function useTimer(focusDurationMs = 25 * 60 * 1000, breakDurationMs = 5 * 60 * 1000) {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<TimerState>({
    phase: "idle",
    remainingMs: focusDurationMs,
    isRunning: false,
  });
  const onCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../workers/timer.worker.ts", import.meta.url));

    workerRef.current.onmessage = (e: MessageEvent<TimerWorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "TICK") {
        setState((prev) => ({ ...prev, remainingMs: msg.remainingMs }));
      } else if (msg.type === "COMPLETE") {
        setState((prev) => {
          if (prev.phase === "focus") {
            onCompleteRef.current?.();
            return { phase: "completed", remainingMs: 0, isRunning: false };
          }
          return { phase: "idle", remainingMs: focusDurationMs, isRunning: false };
        });
      } else if (msg.type === "PAUSED") {
        setState((prev) => ({ ...prev, remainingMs: msg.remainingMs, isRunning: false }));
      }
    };

    return () => workerRef.current?.terminate();
  }, [focusDurationMs]);

  const start = useCallback(() => {
    workerRef.current?.postMessage({ type: "START", durationMs: focusDurationMs });
    setState({ phase: "focus", remainingMs: focusDurationMs, isRunning: true });
  }, [focusDurationMs]);

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: "PAUSE" });
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: "RESUME" });
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.postMessage({ type: "RESET" });
    setState({ phase: "idle", remainingMs: focusDurationMs, isRunning: false });
  }, [focusDurationMs]);

  const startBreak = useCallback(() => {
    workerRef.current?.postMessage({ type: "START", durationMs: breakDurationMs });
    setState({ phase: "break", remainingMs: breakDurationMs, isRunning: true });
  }, [breakDurationMs]);

  const skipBreak = useCallback(() => {
    workerRef.current?.postMessage({ type: "RESET" });
    setState({ phase: "idle", remainingMs: focusDurationMs, isRunning: false });
  }, [focusDurationMs]);

  const onComplete = useCallback((cb: () => void) => {
    onCompleteRef.current = cb;
  }, []);

  return { ...state, start, pause, resume, reset, startBreak, skipBreak, onComplete };
}
