import type { CombatEvent, MatchSnapshot } from "../core";

export type CombatEffectKind = "hit" | "block";

export interface CombatEffect {
  id: string;
  kind: CombatEffectKind;
  x: number;
  y: number;
  age: number;
  duration: number;
}

export function effectsFromSnapshot(snapshot: MatchSnapshot): readonly CombatEffect[] {
  return snapshot.events.flatMap((event) => effectFromEvent(snapshot, event));
}

export function tickCombatEffects(effects: readonly CombatEffect[]): readonly CombatEffect[] {
  return effects
    .map((effect) => ({ ...effect, age: effect.age + 1 }))
    .filter((effect) => effect.age < effect.duration);
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

function contactYOffset(move: Extract<CombatEvent, { move: string }>["move"]): number {
  if (move === "lightKick") return -118;
  if (move === "super") return -164;
  if (move === "special") return -150;
  return -156;
}
