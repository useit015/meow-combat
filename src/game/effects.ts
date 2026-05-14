import type { CombatEvent, CommandId, MatchSnapshot } from "../core";

export type CombatEffectKind = "hit" | "block";
export type DamageNumberKind = "light" | "heavy" | "special" | "super";

export interface CombatEffect {
  id: string;
  kind: CombatEffectKind;
  x: number;
  y: number;
  age: number;
  duration: number;
}

export interface DamageNumberPopup {
  id: string;
  kind: DamageNumberKind;
  value: number;
  x: number;
  y: number;
  driftX: number;
  age: number;
  duration: number;
}

export interface DamageNumberStyle {
  color: string;
  stroke: string;
  fontSize: number;
  scale: number;
}

export function effectsFromSnapshot(snapshot: MatchSnapshot): readonly CombatEffect[] {
  return snapshot.events.flatMap((event) => effectFromEvent(snapshot, event));
}

export function damageNumbersFromSnapshot(snapshot: MatchSnapshot): readonly DamageNumberPopup[] {
  return snapshot.events.flatMap((event) => damageNumberFromEvent(snapshot, event));
}

export function tickCombatEffects(effects: readonly CombatEffect[]): readonly CombatEffect[] {
  return effects
    .map((effect) => ({ ...effect, age: effect.age + 1 }))
    .filter((effect) => effect.age < effect.duration);
}

export function tickDamageNumbers(numbers: readonly DamageNumberPopup[]): readonly DamageNumberPopup[] {
  return numbers
    .map((number) => ({ ...number, age: number.age + 1 }))
    .filter((number) => number.age < number.duration);
}

export function damageNumberStyleForMove(move: CommandId): DamageNumberStyle {
  if (move === "super") {
    return { color: "#fff1a8", stroke: "#7c3d00", fontSize: 26, scale: 1.16 };
  }
  if (move === "special") {
    return { color: "#8fffd0", stroke: "#084436", fontSize: 24, scale: 1.1 };
  }
  if (move === "heavy") {
    return { color: "#ff9f1c", stroke: "#5a1300", fontSize: 23, scale: 1.06 };
  }
  return { color: "#fff7df", stroke: "#12332d", fontSize: 20, scale: 1 };
}

function effectFromEvent(snapshot: MatchSnapshot, event: CombatEvent): readonly CombatEffect[] {
  if (event.type !== "hit" && event.type !== "block") return [];

  const defender = snapshot[event.defender];
  return [
    {
      id: `${event.frame}:${event.type}:${event.attacker}:${event.defender}:${event.move}`,
      kind: event.type,
      x: defender.x + defender.facing * 34,
      y: defender.y + contactYOffset(event.move),
      age: 0,
      duration: event.move === "super" ? 26 : event.type === "hit" ? 18 : 14,
    },
  ];
}

function damageNumberFromEvent(snapshot: MatchSnapshot, event: CombatEvent): readonly DamageNumberPopup[] {
  if (event.type !== "hit") return [];

  const defender = snapshot[event.defender];
  return [
    {
      id: `${event.frame}:damage:${event.attacker}:${event.defender}:${event.move}:${event.damage}`,
      kind: damageNumberKindForMove(event.move),
      value: event.damage,
      x: defender.x - defender.facing * 18,
      y: defender.y + contactYOffset(event.move) - 26,
      driftX: event.attacker === "p1" ? 0.42 : -0.42,
      age: 0,
      duration: event.move === "super" ? 56 : event.move === "special" ? 48 : 42,
    },
  ];
}

function damageNumberKindForMove(move: CommandId): DamageNumberKind {
  if (move === "super") return "super";
  if (move === "special") return "special";
  if (move === "heavy") return "heavy";
  return "light";
}

function contactYOffset(move: Extract<CombatEvent, { move: string }>["move"]): number {
  if (move === "lightKick") return -118;
  if (move === "super") return -164;
  if (move === "special") return -150;
  return -156;
}
