import { TICK_MS } from "../core";

export interface FramePacingState {
  readonly accumulatorMs: number;
  readonly maxDeltaMs: number;
  readonly maxStepsPerFrame: number;
  readonly lastRawDeltaMs: number;
  readonly lastClampedDeltaMs: number;
  readonly lastSteps: number;
  readonly lastDroppedMs: number;
  readonly totalDroppedMs: number;
  readonly cappedFrameCount: number;
}

export interface FramePacingUpdate {
  readonly state: FramePacingState;
  readonly steps: number;
}

export function createFramePacingState(options: { maxDeltaMs?: number; maxStepsPerFrame?: number } = {}): FramePacingState {
  return {
    accumulatorMs: 0,
    maxDeltaMs: options.maxDeltaMs ?? TICK_MS * 5,
    maxStepsPerFrame: options.maxStepsPerFrame ?? 5,
    lastRawDeltaMs: 0,
    lastClampedDeltaMs: 0,
    lastSteps: 0,
    lastDroppedMs: 0,
    totalDroppedMs: 0,
    cappedFrameCount: 0,
  };
}

export function stepFramePacing(
  state: FramePacingState,
  rawDeltaMs: number,
  tickMs = TICK_MS,
): FramePacingUpdate {
  const safeDeltaMs = Number.isFinite(rawDeltaMs) ? Math.max(0, rawDeltaMs) : 0;
  const clampedDeltaMs = Math.min(safeDeltaMs, state.maxDeltaMs);
  let accumulatorMs = state.accumulatorMs + clampedDeltaMs;
  let steps = Math.min(Math.floor(accumulatorMs / tickMs), state.maxStepsPerFrame);
  accumulatorMs -= steps * tickMs;

  let droppedMs = safeDeltaMs - clampedDeltaMs;
  if (accumulatorMs >= tickMs) {
    droppedMs += accumulatorMs;
    accumulatorMs = 0;
    steps = state.maxStepsPerFrame;
  }

  return {
    steps,
    state: {
      ...state,
      accumulatorMs,
      lastRawDeltaMs: safeDeltaMs,
      lastClampedDeltaMs: clampedDeltaMs,
      lastSteps: steps,
      lastDroppedMs: droppedMs,
      totalDroppedMs: state.totalDroppedMs + droppedMs,
      cappedFrameCount: state.cappedFrameCount + (droppedMs > 0 ? 1 : 0),
    },
  };
}
