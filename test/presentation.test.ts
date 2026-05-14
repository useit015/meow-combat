import { describe, expect, it } from "vitest";
import { audioCueForCombatEvents, audioCueForMatchTransition } from "../src/game/audio";
import { impactFeedbackCue, selectReadinessLines } from "../src/game/presentation";

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

  it("maps combat and match transitions to audio cues", () => {
    expect(
      audioCueForCombatEvents([{ type: "block", frame: 4, attacker: "p1", defender: "p2", move: "light" }]),
    ).toBe("block");

    expect(
      audioCueForMatchTransition("fighting", "round-over", {
        round: 2,
        targetWins: 2,
        wins: { p1: 2, p2: 0 },
        status: "complete",
        lastRoundWinner: "p1",
        matchWinner: "p1",
      }),
    ).toBe("match-over");
  });
});
