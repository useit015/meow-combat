import { describe, expect, it } from "vitest";
import {
  initialShellState,
  playModeUsesCpu,
  reduceShellState,
  selectedPlayMode,
  shellModeDescription,
  shellModeLabel,
} from "../src/game/shellFlow";

describe("shell flow", () => {
  it("waits in ready until start opens play mode select", () => {
    expect(reduceShellState(initialShellState, { matchStatus: "fighting" })).toEqual({
      phase: "ready",
      selectedMode: "versus-cpu",
    });
    expect(
      reduceShellState(initialShellState, {
        startPressed: true,
        matchStatus: "fighting",
      }),
    ).toEqual({ phase: "mode-select", selectedMode: "versus-cpu" });
  });

  it("selects training, championship, or 1 vs CPU before fighter select", () => {
    const modeSelect = reduceShellState(initialShellState, {
      startPressed: true,
      matchStatus: "fighting",
    });

    const training = reduceShellState(modeSelect, {
      modeNextPressed: true,
      matchStatus: "fighting",
    });
    expect(training).toEqual({ phase: "mode-select", selectedMode: "training" });
    expect(shellModeLabel(training)).toBe("TRAINING");

    const championship = reduceShellState(training, {
      modeNextPressed: true,
      matchStatus: "fighting",
    });
    expect(championship).toEqual({ phase: "mode-select", selectedMode: "championship" });
    expect(shellModeLabel(championship)).toBe("CHAMPIONSHIP");
    expect(shellModeDescription(championship)).toContain("2026");

    expect(
      reduceShellState(championship, {
        modeNextPressed: true,
        matchStatus: "fighting",
      }),
    ).toEqual({ phase: "mode-select", selectedMode: "versus-cpu" });

    expect(
      reduceShellState(training, {
        modePreviousPressed: true,
        matchStatus: "fighting",
      }),
    ).toEqual({ phase: "mode-select", selectedMode: "versus-cpu" });
    expect(shellModeLabel(modeSelect)).toBe("1 VS CPU");
    expect(selectedPlayMode(training)).toBe("training");
  });

  it("treats championship as a CPU-backed story ladder mode", () => {
    expect(playModeUsesCpu({ selectedMode: "championship" })).toBe(true);
    expect(playModeUsesCpu({ selectedMode: "versus-cpu" })).toBe(true);
    expect(playModeUsesCpu({ selectedMode: "training" })).toBe(false);

    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "championship" },
        {
          matchStatus: "round-over",
          matchSetStatus: "in-progress",
        },
      ),
    ).toEqual({ phase: "round-over", selectedMode: "championship" });
  });

  it("starts fighting through fighter select with the selected mode", () => {
    expect(
      reduceShellState(
        { phase: "mode-select", selectedMode: "training" },
        {
          startPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "select", selectedMode: "training" });

    expect(
      reduceShellState(
        { phase: "select", selectedMode: "training" },
        {
          startPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "fighting", selectedMode: "training" });
  });

  it("moves to round-over when the 1 vs CPU match core ends", () => {
    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "versus-cpu" },
        {
          matchStatus: "round-over",
          matchSetStatus: "in-progress",
        },
      ),
    ).toEqual({ phase: "round-over", selectedMode: "versus-cpu" });
  });

  it("moves to match-over when the 1 vs CPU set is complete", () => {
    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "versus-cpu" },
        {
          matchStatus: "round-over",
          matchSetStatus: "complete",
        },
      ),
    ).toEqual({ phase: "match-over", selectedMode: "versus-cpu" });
  });

  it("keeps training mode fighting even if the sparring core reaches round-over", () => {
    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "training" },
        {
          matchStatus: "round-over",
          matchSetStatus: "complete",
        },
      ),
    ).toEqual({ phase: "fighting", selectedMode: "training" });
  });

  it("pauses and resumes fighting without affecting round-over states", () => {
    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "versus-cpu" },
        {
          pausePressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "paused", selectedMode: "versus-cpu" });

    expect(
      reduceShellState(
        { phase: "paused", selectedMode: "versus-cpu" },
        {
          pausePressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "fighting", selectedMode: "versus-cpu" });

    expect(
      reduceShellState(
        { phase: "round-over", selectedMode: "versus-cpu" },
        {
          pausePressed: true,
          matchStatus: "round-over",
        },
      ),
    ).toEqual({ phase: "round-over", selectedMode: "versus-cpu" });
  });

  it("can restart from round-over and reset from any phase", () => {
    expect(
      reduceShellState(
        { phase: "round-over", selectedMode: "versus-cpu" },
        {
          startPressed: true,
          matchStatus: "round-over",
        },
      ),
    ).toEqual({ phase: "fighting", selectedMode: "versus-cpu" });

    expect(
      reduceShellState(
        { phase: "match-over", selectedMode: "versus-cpu" },
        {
          startPressed: true,
          matchStatus: "round-over",
          matchSetStatus: "complete",
        },
      ),
    ).toEqual({ phase: "fighting", selectedMode: "versus-cpu" });

    expect(
      reduceShellState(
        { phase: "fighting", selectedMode: "training" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);

    expect(
      reduceShellState(
        { phase: "paused", selectedMode: "versus-cpu" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);

    expect(
      reduceShellState(
        { phase: "select", selectedMode: "versus-cpu" },
        {
          resetPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual(initialShellState);

    expect(
      reduceShellState(
        { phase: "match-over", selectedMode: "versus-cpu" },
        {
          resetPressed: true,
          matchStatus: "round-over",
          matchSetStatus: "complete",
        },
      ),
    ).toEqual(initialShellState);
  });

  it("does not start or rematch accidentally while paused", () => {
    expect(
      reduceShellState(
        { phase: "paused", selectedMode: "versus-cpu" },
        {
          startPressed: true,
          matchStatus: "fighting",
        },
      ),
    ).toEqual({ phase: "paused", selectedMode: "versus-cpu" });
  });
});
