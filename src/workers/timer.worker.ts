export type TimerWorkerMessage =
  | { type: "START"; durationMs: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

export type TimerWorkerResponse =
  | { type: "TICK"; remainingMs: number }
  | { type: "COMPLETE" }
  | { type: "PAUSED"; remainingMs: number };

let intervalId: ReturnType<typeof setInterval> | null = null;
let remainingMs = 0;
let lastTickTime = 0;

function startInterval() {
  lastTickTime = Date.now();
  intervalId = setInterval(() => {
    const now = Date.now();
    const elapsed = now - lastTickTime;
    lastTickTime = now;
    remainingMs = Math.max(0, remainingMs - elapsed);
    self.postMessage({ type: "TICK", remainingMs } satisfies TimerWorkerResponse);
    if (remainingMs <= 0) {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      self.postMessage({ type: "COMPLETE" } satisfies TimerWorkerResponse);
    }
  }, 1000);
}

self.onmessage = (e: MessageEvent<TimerWorkerMessage>) => {
  switch (e.data.type) {
    case "START":
      if (intervalId) clearInterval(intervalId);
      remainingMs = e.data.durationMs;
      startInterval();
      break;
    case "PAUSE":
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      self.postMessage({ type: "PAUSED", remainingMs } satisfies TimerWorkerResponse);
      break;
    case "RESUME":
      startInterval();
      break;
    case "RESET":
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      remainingMs = 0;
      break;
  }
};
