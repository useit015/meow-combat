import { describe, expect, it } from "vitest";
import { initialShellState, reduceShellState } from "../src/game/shellFlow";

describe("shell flow", () => {
  it("waits in ready until start opens fighter select", () => {
    expect(reduceShellState(initialShellState, { matchStatus: "fighting" })).toEqual({
      phase: "ready",
    });
    expect(
      reduceShellState(initialShellState, {
        startPressed: true,
        matchStatus: "fighting",
      }),
    ).toEqual({ phase: "select" });
  });

  it("starts fighting from fighter select", () => {
    expect(
      reduceShellState(
        { phase: "select" },
        {
          startPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "fighting" });
  });

  it("moves to round-over when the match core ends", () => {
    expect(
      reduceShellState(
        { phase: "fighting" },
        {
          matchStatus: "round-over",
          matchSetStatus: "in-progress",
        },
      ),
    ).toEqual({ phase: "round-over" });
  });

  it("moves to match-over when the set is complete", () => {
    expect(
      reduceShellState(
        { phase: "fighting" },
        {
          matchStatus: "round-over",
          matchSetStatus: "complete",
        },
      ),
    ).toEqual({ phase: "match-over" });
  });

  it("pauses and resumes fighting without affecting round-over states", () => {
    expect(
      reduceShellState(
        { phase: "fighting" },
        {
          pausePressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "paused" });

    expect(
      reduceShellState(
        { phase: "paused" },
        {
          pausePressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "fighting" });

    expect(
      reduceShellState(
        { phase: "round-over" },
        {
          pausePressed: true,
          matchStatus: "round-over",
        },
      ),
    ).toEqual({ phase: "round-over" });
  });

  it("can restart from round-over and reset from any phase", () => {
    expect(
      reduceShellState(
        { phase: "round-over" },
        {
          startPressed: true,
          matchStatus: "round-over",
        },
      ),
    ).toEqual({ phase: "fighting" });

    expect(
      reduceShellState(
        { phase: "match-over" },
        {
          startPressed: true,
          matchStatus: "round-over",
        },
      ),
    ).toEqual({ phase: "fighting" });

    expect(
      reduceShellState(
        { phase: "fighting" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);

    expect(
      reduceShellState(
        { phase: "paused" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);

    expect(
      reduceShellState(
        { phase: "select" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);
  });
});
