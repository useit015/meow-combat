import { describe, expect, it } from "vitest";
import {
  AUDIO_CUE_ASSET_SPECS,
  audioAssetSpecForCue,
  audioCueForCombatEvents,
  audioCuesForCombatEvents,
  audioCueForMatchTransition,
} from "../src/game/audio";
import {
  fighterMobilityMotionCue,
  fighterRollMotionCue,
  fighterVisualSeparationOffset,
  impactFeedbackCue,
  selectReadinessLines,
} from "../src/game/presentation";

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

  it("describes roll motion as a low directional cue without scaling the fighter sprite", () => {
    const cue = fighterRollMotionCue({
      x: 500,
      y: 462,
      facing: 1,
      state: "rollForward",
      stateFrame: 10,
    });

    expect(cue).toMatchObject({
      direction: 1,
      spriteScale: 1,
    });
    expect(cue?.leadX).toBeGreaterThan(500);
    expect(cue?.trailX).toBeLessThan(500);
    expect(cue?.y).toBeLessThan(462);
    expect(cue?.alpha).toBeGreaterThan(0.3);
    expect(
      fighterRollMotionCue({
        x: 500,
        y: 462,
        facing: -1,
        state: "rollBack",
        stateFrame: 10,
      })?.direction,
    ).toBe(1);
  });

  it("adds directional mobility cues without scaling approved fighter sprites", () => {
    const run = fighterMobilityMotionCue({
      x: 500,
      y: 462,
      facing: 1,
      state: "runForward",
      stateFrame: 12,
    });
    const backdash = fighterMobilityMotionCue({
      x: 500,
      y: 462,
      facing: 1,
      state: "backdash",
      stateFrame: 12,
    });
    const hop = fighterMobilityMotionCue({
      x: 500,
      y: 388,
      facing: -1,
      state: "hop",
      stateFrame: 12,
    });

    expect(run).toMatchObject({ kind: "run", direction: 1, spriteScale: 1 });
    expect(run?.leadX).toBeGreaterThan(500);
    expect(run?.trailX).toBeLessThan(500);
    expect(backdash).toMatchObject({ kind: "backdash", direction: -1, spriteScale: 1 });
    expect(backdash?.leadX).toBeLessThan(500);
    expect(backdash?.trailX).toBeGreaterThan(500);
    expect(hop).toMatchObject({ kind: "hop", direction: -1, spriteScale: 1 });
    expect(hop?.y).toBeLessThan(388);
    expect(hop?.alpha).toBeGreaterThan(0.3);
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

  it("keeps procedural audio as dev fallback behind planned authored sample specs", () => {
    expect(AUDIO_CUE_ASSET_SPECS.map((spec) => spec.id)).toEqual([
      "music-loop",
      "ui-confirm",
      "fight-announcer",
      "hit-light",
      "hit-heavy",
      "block-impact",
      "dash-whoosh",
      "rabbit-tornado",
      "cat-aura-blast",
      "ko-burst",
      "victory-sting",
    ]);

    for (const spec of AUDIO_CUE_ASSET_SPECS) {
      expect(spec.primary.kind).toBe("authored-sample");
      expect(spec.primary.status).toBe("planned");
      expect(spec.primary.sourceRecordRequired).toBe(true);
      expect(spec.primary.runtimePath).toBe(`/assets/generated/audio/${spec.id}.ogg`);
      expect(spec.proceduralFallback).toMatchObject({
        status: "dev-only",
        implementationPath: "src/game/audio.ts",
      });
    }

    expect(audioAssetSpecForCue("rabbit-tornado")?.primary.allowedSourceKinds).toContain("elevenlabs-sound-generation");
    expect(audioAssetSpecForCue("music-loop")?.primary.allowedSourceKinds).not.toContain("elevenlabs-music");
  });
});
