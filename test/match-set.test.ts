import { describe, expect, it } from "vitest";
import { createMatchSet, recordRoundOutcome } from "../src/core";

describe("match set", () => {
  it("starts a best-of-three match at round one", () => {
    expect(createMatchSet()).toEqual({
      round: 1,
      targetWins: 2,
      wins: {
        p1: 0,
        p2: 0,
      },
      lastRoundWinner: null,
      matchWinner: null,
      status: "in-progress",
    });
  });

  it("tracks round wins and advances rounds until match point resolves", () => {
    const afterFirst = recordRoundOutcome(createMatchSet(), "p1");
    expect(afterFirst).toMatchObject({
      round: 2,
      wins: {
        p1: 1,
        p2: 0,
      },
      matchWinner: null,
      status: "in-progress",
    });

    const afterSecond = recordRoundOutcome(afterFirst, "p1");
    expect(afterSecond).toMatchObject({
      round: 2,
      wins: {
        p1: 2,
        p2: 0,
      },
      matchWinner: "p1",
      status: "complete",
    });
  });

  it("does not award score for a draw round", () => {
    expect(recordRoundOutcome(createMatchSet(), "draw")).toMatchObject({
      round: 2,
      wins: {
        p1: 0,
        p2: 0,
      },
      lastRoundWinner: "draw",
      matchWinner: null,
      status: "in-progress",
    });
  });

  it("keeps completed matches immutable when stale round results arrive", () => {
    const complete = recordRoundOutcome(recordRoundOutcome(createMatchSet(), "p2"), "p2");

    expect(recordRoundOutcome(complete, "p1")).toBe(complete);
  });
});
