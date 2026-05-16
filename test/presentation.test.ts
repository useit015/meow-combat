import { describe, expect, it, vi } from "vitest";
import {
  AUDIO_CUE_ASSET_SPECS,
  ArenaAudio,
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
    expect(cue?.tier).toBe("heavy");
    expect(cue?.label).toBe("HEAVY");
    expect(cue?.duration).toBeGreaterThan(100);
  });

  it("scales impact flash and shake cues by move readability tier without changing sprites", () => {
    const light = impactFeedbackCue([
      { type: "hit", frame: 4, attacker: "p1", defender: "p2", move: "light", damage: 45 },
    ]);
    const superCue = impactFeedbackCue([
      { type: "hit", frame: 4, attacker: "p1", defender: "p2", move: "super", damage: 180 },
    ]);
    const heavyBlock = impactFeedbackCue([{ type: "block", frame: 4, attacker: "p1", defender: "p2", move: "heavy" }]);

    expect(light).toMatchObject({ kind: "hit", tier: "light", label: "HIT" });
    expect(superCue).toMatchObject({ kind: "hit", tier: "super", label: "SUPER" });
    expect(heavyBlock).toMatchObject({ kind: "block", tier: "heavy", label: "HEAVY BLOCK" });
    expect(superCue?.duration).toBeGreaterThan(light?.duration ?? 0);
    expect(superCue?.intensity).toBeGreaterThan(light?.intensity ?? 0);
    expect(heavyBlock?.flash.alpha).toBeGreaterThan(0.14);
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

  it("plays authored samples before procedural fallback once a sample decodes", async () => {
    const context = fakeAudioContext();
    const fetchAudio = vi.fn(async () => new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }));
    const audio = new ArenaAudio({
      contextFactory: () => context,
      fetchAudio,
      startMusicOnUnlock: false,
    });

    audio.unlock();
    await audio.preloadPrimarySamples(["ui-confirm"]);
    audio.play("ui-confirm");

    expect(fetchAudio).toHaveBeenCalledWith("/assets/generated/audio/ui-confirm.ogg");
    expect(context.decodeAudioData).toHaveBeenCalledOnce();
    expect(audio.sampleRuntimeState("ui-confirm")).toMatchObject({
      id: "ui-confirm",
      runtimePath: "/assets/generated/audio/ui-confirm.ogg",
      status: "ready",
      fallbackStatus: "dev-only",
    });
    expect(context.createBufferSource).toHaveBeenCalledOnce();
    expect(context.createdSources[0]?.buffer).toBe(context.decodedBuffer);
    expect(context.createdSources[0]?.start).toHaveBeenCalledWith(0);
    expect(context.createOscillator).not.toHaveBeenCalled();
  });

  it("keeps the dev-only procedural fallback when a primary sample is missing", async () => {
    const context = fakeAudioContext();
    const fetchAudio = vi.fn(async () => new Response(null, { status: 404 }));
    const audio = new ArenaAudio({
      contextFactory: () => context,
      fetchAudio,
      startMusicOnUnlock: false,
    });

    audio.unlock();
    await audio.preloadPrimarySamples(["hit-light"]);
    audio.play("hit-light");

    expect(audio.sampleRuntimeState("hit-light")).toMatchObject({
      status: "missing",
      fallbackStatus: "dev-only",
    });
    expect(context.createdSources.some((source) => source.buffer === context.decodedBuffer)).toBe(false);
    expect(context.createOscillator).toHaveBeenCalled();
    expect(context.createBuffer).toHaveBeenCalled();
  });
});

interface FakeAudioSource {
  buffer: AudioBuffer | null;
  loop: boolean;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface FakeAudioContext extends AudioContext {
  createdSources: FakeAudioSource[];
  decodedBuffer: AudioBuffer;
}

function fakeAudioContext(): FakeAudioContext {
  const createdSources: FakeAudioSource[] = [];
  const decodedBuffer = { duration: 0.42 } as AudioBuffer;
  const context = {
    currentTime: 0,
    sampleRate: 48000,
    destination: {},
    createdSources,
    decodedBuffer,
    resume: vi.fn(async () => undefined),
    decodeAudioData: vi.fn(async () => decodedBuffer),
    createBufferSource: vi.fn(() => {
      const source: FakeAudioSource = {
        buffer: null,
        loop: false,
        connect: vi.fn(() => source),
        start: vi.fn(),
        stop: vi.fn(),
      };
      createdSources.push(source);
      return source as unknown as AudioBufferSourceNode;
    }),
    createOscillator: vi.fn(() => {
      const oscillator = {
        type: "sine" as OscillatorType,
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(() => ({
          connect: vi.fn(),
        })),
        start: vi.fn(),
        stop: vi.fn(),
      };
      return oscillator as unknown as OscillatorNode;
    }),
    createGain: vi.fn(() => {
      const gain = {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(() => gain),
      };
      return gain as unknown as GainNode;
    }),
    createBuffer: vi.fn(() => {
      const channels = [new Float32Array(8)];
      return {
        getChannelData: vi.fn((channel: number) => channels[channel] ?? channels[0]),
      } as unknown as AudioBuffer;
    }),
  };

  return context as unknown as FakeAudioContext;
}
