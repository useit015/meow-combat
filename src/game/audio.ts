import type { CombatEvent, MatchSetState, MatchSnapshot, PlayerId } from "../core";

export type ArenaAudioCue =
  | "ui-confirm"
  | "fight-announcer"
  | "hit-light"
  | "hit-heavy"
  | "block-impact"
  | "dash-whoosh"
  | "rabbit-tornado"
  | "cat-aura-blast"
  | "ko-burst"
  | "victory-sting";
export type ArenaAudioAssetId = "music-loop" | ArenaAudioCue;
export type ArenaAudioStatus = "locked" | "ready" | "unavailable";

export type ArenaAudioCharacters = Readonly<Record<PlayerId, string>>;

export interface ArenaAudioPrimaryAssetSpec {
  kind: "authored-sample";
  status: "planned";
  allowedSourceKinds: readonly string[];
  sourceRecordRequired: true;
  runtimePath: string;
  licenseNotes: string;
}

export interface ArenaAudioProceduralFallbackSpec {
  status: "dev-only";
  implementationPath: "src/game/audio.ts";
  notes: string;
}

export interface ArenaAudioAssetSpec {
  id: ArenaAudioAssetId;
  role: string;
  primary: ArenaAudioPrimaryAssetSpec;
  proceduralFallback: ArenaAudioProceduralFallbackSpec;
}

const audioSourceRecordNotes =
  "Requires provider/source URL or generation prompt, creator/model when applicable, terms snapshot date, attribution notes, and Content ID/platform-claim risk notes before runtime promotion.";

const proceduralFallback: ArenaAudioProceduralFallbackSpec = {
  status: "dev-only",
  implementationPath: "src/game/audio.ts",
  notes:
    "Current WebAudio synthesis may remain as a development fallback while authored/sample-based assets are missing, but it is not the primary shipped audio direction.",
};

export const AUDIO_CUE_ASSET_SPECS: readonly ArenaAudioAssetSpec[] = [
  audioAssetSpec("music-loop", "Looping fight bed for the arena.", ["pixabay", "manual"]),
  audioAssetSpec("ui-confirm", "Short menu confirm/select tick.", ["pixabay", "manual", "elevenlabs-sound-generation"]),
  audioAssetSpec("fight-announcer", "Short original fight-start bark or stinger.", [
    "pixabay",
    "manual",
    "elevenlabs-sound-generation",
  ]),
  audioAssetSpec("hit-light", "Light hit impact variant pool.", ["pixabay", "manual", "elevenlabs-sound-generation"]),
  audioAssetSpec("hit-heavy", "Heavy hit impact variant pool.", ["pixabay", "manual", "elevenlabs-sound-generation"]),
  audioAssetSpec("block-impact", "Guard impact clack variant pool.", ["pixabay", "manual", "elevenlabs-sound-generation"]),
  audioAssetSpec("dash-whoosh", "Dash, hop, and roll movement whoosh variants.", [
    "pixabay",
    "manual",
    "elevenlabs-sound-generation",
  ]),
  audioAssetSpec("rabbit-tornado", "Bunjamin Thump special-impact spin cue.", [
    "pixabay",
    "manual",
    "elevenlabs-sound-generation",
  ]),
  audioAssetSpec("cat-aura-blast", "Marmalade Mayhem special-impact burst cue.", [
    "pixabay",
    "manual",
    "elevenlabs-sound-generation",
  ]),
  audioAssetSpec("ko-burst", "K.O. burst and comic impact punctuation.", [
    "pixabay",
    "manual",
    "elevenlabs-sound-generation",
  ]),
  audioAssetSpec("victory-sting", "Short round or match victory sting.", ["pixabay", "manual"]),
] as const;

export function audioAssetSpecForCue(id: ArenaAudioAssetId): ArenaAudioAssetSpec | null {
  return AUDIO_CUE_ASSET_SPECS.find((spec) => spec.id === id) ?? null;
}

function audioAssetSpec(
  id: ArenaAudioAssetId,
  role: string,
  allowedSourceKinds: readonly string[],
): ArenaAudioAssetSpec {
  return {
    id,
    role,
    primary: {
      kind: "authored-sample",
      status: "planned",
      allowedSourceKinds,
      sourceRecordRequired: true,
      runtimePath: `/assets/generated/audio/${id}.ogg`,
      licenseNotes: audioSourceRecordNotes,
    },
    proceduralFallback,
  };
}

type AudioGlobal = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function audioCuesForCombatEvents(
  events: readonly CombatEvent[],
  characters: ArenaAudioCharacters | null = null,
): readonly ArenaAudioCue[] {
  const cues: ArenaAudioCue[] = [];

  for (const event of events) {
    if (event.type === "hit") {
      cues.push(audioCueForHit(event, characters));
      continue;
    }

    if (event.type === "block") {
      cues.push("block-impact");
      continue;
    }

    if (
      event.type === "state" &&
      (event.to === "runForward" ||
        event.to === "backdash" ||
        event.to === "rollForward" ||
        event.to === "rollBack" ||
        event.to === "hop")
    ) {
      cues.push("dash-whoosh");
    }
  }

  return [...new Set(cues)];
}

export function audioCueForCombatEvents(
  events: readonly CombatEvent[],
  characters: ArenaAudioCharacters | null = null,
): ArenaAudioCue | null {
  return audioCuesForCombatEvents(events, characters)[0] ?? null;
}

export function audioCueForMatchTransition(
  previousStatus: MatchSnapshot["status"],
  nextStatus: MatchSnapshot["status"],
  matchSet: MatchSetState,
): ArenaAudioCue | null {
  if (previousStatus !== "fighting" || nextStatus !== "round-over") return null;
  return matchSet.status === "complete" ? "victory-sting" : "ko-burst";
}

function audioCueForHit(event: Extract<CombatEvent, { type: "hit" }>, characters: ArenaAudioCharacters | null): ArenaAudioCue {
  if (event.move === "special" || event.move === "super") {
    const character = characters?.[event.attacker] ?? "";
    if (character === "gray-rabbit") return "rabbit-tornado";
    if (character === "ginger-tabby-cat") return "cat-aura-blast";
    return "hit-heavy";
  }

  return event.move === "heavy" ? "hit-heavy" : "hit-light";
}

export class ArenaAudio {
  private context: AudioContext | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private unavailable = false;

  status(): ArenaAudioStatus {
    if (this.unavailable) return "unavailable";
    if (!this.context) return "locked";
    return "ready";
  }

  musicActive(): boolean {
    return this.musicTimer !== null;
  }

  unlock(): void {
    if (this.context) {
      void this.context.resume().catch(() => undefined);
      return;
    }

    const Ctor = globalThis.AudioContext ?? (globalThis as AudioGlobal).webkitAudioContext;
    if (!Ctor) {
      this.unavailable = true;
      return;
    }

    try {
      this.context = new Ctor();
      void this.context.resume().catch(() => undefined);
      this.startMusicLoop();
    } catch {
      this.context = null;
      this.unavailable = true;
    }
  }

  play(cue: ArenaAudioCue | null): void {
    if (!cue) return;
    if (!this.context) this.unlock();
    const context = this.context;
    if (!context) return;

    const now = context.currentTime;
    if (cue === "ui-confirm") {
      this.tone(context, now, 320, 0.06, "triangle", 0.04);
      this.tone(context, now + 0.055, 520, 0.08, "triangle", 0.035);
      return;
    }

    if (cue === "fight-announcer") {
      this.tone(context, now, 146, 0.12, "sawtooth", 0.045);
      this.tone(context, now + 0.08, 392, 0.16, "square", 0.032);
      this.noiseBurst(context, now + 0.02, 0.05, 0.045);
      return;
    }

    if (cue === "hit-light") {
      this.noiseBurst(context, now, 0.045, 0.08);
      this.tone(context, now, 172, 0.055, "square", 0.032);
      this.tone(context, now + 0.018, 310, 0.045, "triangle", 0.025);
      return;
    }

    if (cue === "hit-heavy") {
      this.noiseBurst(context, now, 0.09, 0.14);
      this.tone(context, now, 82, 0.11, "sawtooth", 0.06);
      this.tone(context, now + 0.026, 164, 0.08, "square", 0.042);
      return;
    }

    if (cue === "block-impact") {
      this.noiseBurst(context, now, 0.045, 0.055);
      this.tone(context, now, 210, 0.075, "triangle", 0.032);
      return;
    }

    if (cue === "dash-whoosh") {
      this.noiseBurst(context, now, 0.07, 0.038);
      this.tone(context, now, 260, 0.08, "sine", 0.018);
      this.tone(context, now + 0.045, 430, 0.08, "sine", 0.014);
      return;
    }

    if (cue === "rabbit-tornado") {
      this.noiseBurst(context, now, 0.12, 0.065);
      this.tone(context, now, 180, 0.16, "sawtooth", 0.042);
      this.tone(context, now + 0.055, 260, 0.14, "sawtooth", 0.034);
      this.tone(context, now + 0.11, 340, 0.12, "triangle", 0.026);
      return;
    }

    if (cue === "cat-aura-blast") {
      this.tone(context, now, 420, 0.09, "triangle", 0.032);
      this.tone(context, now + 0.045, 620, 0.12, "square", 0.032);
      this.noiseBurst(context, now + 0.075, 0.075, 0.07);
      return;
    }

    if (cue === "ko-burst") {
      this.noiseBurst(context, now, 0.16, 0.16);
      this.tone(context, now, 104, 0.16, "sawtooth", 0.062);
      this.tone(context, now + 0.11, 52, 0.22, "sawtooth", 0.05);
      return;
    }

    this.tone(context, now, 240, 0.12, "triangle", 0.04);
    this.tone(context, now + 0.1, 360, 0.13, "triangle", 0.045);
    this.tone(context, now + 0.22, 540, 0.2, "triangle", 0.05);
  }

  private tone(
    context: AudioContext,
    start: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(32, frequency * 0.82), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private noiseBurst(context: AudioContext, start: number, duration: number, volume: number): void {
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    source.start(start);
    source.stop(start + duration);
  }

  private startMusicLoop(): void {
    if (!this.context || this.musicTimer) return;
    this.playMusicPhrase(this.context, this.context.currentTime + 0.08);
    this.musicTimer = setInterval(() => {
      if (!this.context) return;
      this.playMusicPhrase(this.context, this.context.currentTime + 0.08);
    }, 5600);
  }

  private playMusicPhrase(context: AudioContext, start: number): void {
    const phrase = [
      { frequency: 196, offset: 0 },
      { frequency: 233, offset: 0.42 },
      { frequency: 261, offset: 0.84 },
      { frequency: 330, offset: 1.26 },
      { frequency: 293, offset: 1.78 },
      { frequency: 261, offset: 2.2 },
      { frequency: 220, offset: 2.86 },
      { frequency: 196, offset: 3.34 },
    ];

    for (const note of phrase) {
      this.tone(context, start + note.offset, note.frequency, 0.34, "triangle", 0.014);
      this.tone(context, start + note.offset, note.frequency / 2, 0.42, "sine", 0.009);
    }
  }
}
