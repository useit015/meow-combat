import { describe, expect, it } from "vitest";
import { audioCueForCombatEvents, audioCuesForCombatEvents, audioCueForMatchTransition } from "../src/game/audio";
import { fighterVisualSeparationOffset, impactFeedbackCue, selectReadinessLines } from "../src/game/presentation";

describe("presentation helpers", () => {
  it("prioritizes hit feedback over block feedback", () => {
    const cue = impactFeedbackCue([
      { type: "block", frame: 4, attacker: "p1", defender: "p2", move: "light" },
      { type: "hit", frame: 4, attacker: "p2", defender: "p1", move: "heavy", damage: 90 },
    ]);

    expect(cue?.kind).toBe("hit");
    expect(cue?.duration).toBeGreaterThan(100);
  });

  it("reports a production-ready asset set without undefined next assets", () => {
    const lines = selectReadinessLines({
      imagegenJobs: { total: 34, blocked: 0, generated: 2, approved: 32 },
      runtimeFallbacks: { fighterAnimations: 0, stageLayers: 0 },
      credentialBlocked: false,
      nextRequiredAssets: [],
    });

    expect(lines.join("\n")).toContain("32 approved runtime art assets");
    expect(lines.join("\n")).toContain("No blocked runtime assets");
    expect(lines.join("\n")).not.toContain("undefined");
  });

  it("keeps close-range fighter visual separation subtle and symmetric", () => {
    const p1 = { x: 500, facing: 1, grounded: true, state: "idle" } as const;
    const p2 = { x: 556, facing: -1, grounded: true, state: "idle" } as const;

    expect(fighterVisualSeparationOffset(p1, p2)).toBe(-14);
    expect(fighterVisualSeparationOffset(p2, p1)).toBe(14);
  });

  it("does not add render-only separation during airborne cross-ups or rolls", () => {
    const grounded = { x: 556, facing: -1, grounded: true, state: "idle" } as const;

    expect(fighterVisualSeparationOffset({ x: 500, facing: 1, grounded: false, state: "hop" }, grounded)).toBe(0);
    expect(fighterVisualSeparationOffset({ x: 500, facing: 1, grounded: true, state: "rollForward" }, grounded)).toBe(0);
  });

  it("stops separating fighters once silhouettes have readable space", () => {
    const p1 = { x: 500, facing: 1, grounded: true, state: "idle" } as const;
    const p2 = { x: 624, facing: -1, grounded: true, state: "idle" } as const;

    expect(fighterVisualSeparationOffset(p1, p2)).toBe(0);
    expect(fighterVisualSeparationOffset(p2, p1)).toBe(0);
  });

  it("maps combat and match transitions to audio cues", () => {
    expect(
      audioCueForCombatEvents([{ type: "block", frame: 4, attacker: "p1", defender: "p2", move: "light" }]),
    ).toBe("block-impact");

    expect(
      audioCueForCombatEvents([{ type: "hit", frame: 4, attacker: "p1", defender: "p2", move: "light", damage: 45 }]),
    ).toBe("hit-light");

    expect(
      audioCueForCombatEvents([{ type: "hit", frame: 4, attacker: "p1", defender: "p2", move: "heavy", damage: 90 }]),
    ).toBe("hit-heavy");

    expect(
      audioCueForCombatEvents(
        [{ type: "hit", frame: 4, attacker: "p1", defender: "p2", move: "special", damage: 120 }],
        { p1: "gray-rabbit", p2: "ginger-tabby-cat" },
      ),
    ).toBe("rabbit-tornado");

    expect(
      audioCuesForCombatEvents([
        { type: "state", frame: 9, fighter: "p1", from: "idle", to: "backdash" },
        { type: "state", frame: 9, fighter: "p2", from: "idle", to: "hop" },
      ]),
    ).toEqual(["dash-whoosh"]);

    expect(
      audioCueForMatchTransition("fighting", "round-over", {
        round: 2,
        targetWins: 2,
        wins: { p1: 2, p2: 0 },
        status: "complete",
        lastRoundWinner: "p1",
        matchWinner: "p1",
      }),
    ).toBe("victory-sting");

    expect(
      audioCueForMatchTransition("fighting", "round-over", {
        round: 1,
        targetWins: 2,
        wins: { p1: 1, p2: 0 },
        status: "in-progress",
        lastRoundWinner: "p1",
        matchWinner: null,
      }),
    ).toBe("ko-burst");
  });
});
