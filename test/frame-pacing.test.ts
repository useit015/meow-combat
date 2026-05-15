import { describe, expect, it } from "vitest";
import { createFramePacingState, stepFramePacing } from "../src/game/framePacing";

describe("frame pacing", () => {
  it("advances fixed simulation steps from accumulated frame deltas", () => {
    let state = createFramePacingState({ maxDeltaMs: 100, maxStepsPerFrame: 5 });

    let update = stepFramePacing(state, 8, 16);
    expect(update.steps).toBe(0);
    expect(update.state.accumulatorMs).toBe(8);

    update = stepFramePacing(update.state, 10, 16);
    expect(update.steps).toBe(1);
    expect(update.state.accumulatorMs).toBe(2);
    expect(update.state.lastDroppedMs).toBe(0);
  });

  it("caps catch-up work and drops excess time after stalls", () => {
    const state = createFramePacingState({ maxDeltaMs: 80, maxStepsPerFrame: 5 });
    const update = stepFramePacing(state, 2500, 16);

    expect(update.steps).toBe(5);
    expect(update.state.lastClampedDeltaMs).toBe(80);
    expect(update.state.lastDroppedMs).toBe(2420);
    expect(update.state.totalDroppedMs).toBe(2420);
    expect(update.state.cappedFrameCount).toBe(1);
  });

  it("guards against non-finite or negative deltas", () => {
    let update = stepFramePacing(createFramePacingState(), Number.NaN, 16);
    expect(update.steps).toBe(0);
    expect(update.state.lastRawDeltaMs).toBe(0);

    update = stepFramePacing(update.state, -40, 16);
    expect(update.steps).toBe(0);
    expect(update.state.lastRawDeltaMs).toBe(0);
  });
});
