import type { CombatEvent, MatchSetState, MatchSnapshot } from "../core";

export type ArenaAudioCue = "ui-confirm" | "hit" | "block" | "round-over" | "match-over";
export type ArenaAudioStatus = "locked" | "ready" | "unavailable";

type AudioGlobal = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function audioCueForCombatEvents(events: readonly CombatEvent[]): ArenaAudioCue | null {
  if (events.some((event) => event.type === "hit")) return "hit";
  if (events.some((event) => event.type === "block")) return "block";
  return null;
}

export function audioCueForMatchTransition(
  previousStatus: MatchSnapshot["status"],
  nextStatus: MatchSnapshot["status"],
  matchSet: MatchSetState,
): ArenaAudioCue | null {
  if (previousStatus !== "fighting" || nextStatus !== "round-over") return null;
  return matchSet.status === "complete" ? "match-over" : "round-over";
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

    if (cue === "hit") {
      this.noiseBurst(context, now, 0.08, 0.12);
      this.tone(context, now, 96, 0.08, "sawtooth", 0.055);
      this.tone(context, now + 0.02, 172, 0.06, "square", 0.035);
      return;
    }

    if (cue === "block") {
      this.noiseBurst(context, now, 0.045, 0.055);
      this.tone(context, now, 210, 0.075, "triangle", 0.032);
      return;
    }

    if (cue === "round-over") {
      this.tone(context, now, 220, 0.12, "triangle", 0.04);
      this.tone(context, now + 0.11, 330, 0.14, "triangle", 0.04);
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
