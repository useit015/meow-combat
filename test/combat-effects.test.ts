import { describe, expect, it } from "vitest";
import { FightingSimulation } from "../src/core";
import {
  damageNumbersFromSnapshot,
  damageNumberStyleForMove,
  effectsFromSnapshot,
  tickCombatEffects,
  tickDamageNumbers,
} from "../src/game/effects";

describe("combat effects", () => {
  it("creates a hit effect at the defender contact point", () => {
    const base = new FightingSimulation().snapshot();
    const effects = effectsFromSnapshot({
      ...base,
      events: [
        {
          type: "hit",
          frame: 12,
          attacker: "p1",
          defender: "p2",
          move: "light",
          damage: 45,
        },
      ],
    });

    expect(effects).toEqual([
      {
        id: "12:hit:p1:p2:light",
        kind: "hit",
        x: base.p2.x + base.p2.facing * 34,
        y: base.p2.y - 156,
        age: 0,
        duration: 18,
      },
    ]);
  });

  it("creates block effects with a shorter lifecycle", () => {
    const base = new FightingSimulation().snapshot();
    const [effect] = effectsFromSnapshot({
      ...base,
      events: [
        {
          type: "block",
          frame: 18,
          attacker: "p2",
          defender: "p1",
          move: "heavy",
        },
      ],
    });

    expect(effect?.kind).toBe("block");
    expect(effect?.duration).toBe(14);
  });

  it("ages effects out deterministically", () => {
    const [effect] = effectsFromSnapshot({
      ...new FightingSimulation().snapshot(),
      events: [
        {
          type: "hit",
          frame: 12,
          attacker: "p1",
          defender: "p2",
          move: "light",
          damage: 45,
        },
      ],
    });

    let effects = [effect];
    for (let frame = 0; frame < effect.duration; frame += 1) {
      effects = [...tickCombatEffects(effects)];
    }

    expect(effects).toEqual([]);
  });

  it("creates floating damage numbers from hit events", () => {
    const base = new FightingSimulation().snapshot();
    const numbers = damageNumbersFromSnapshot({
      ...base,
      events: [
        {
          type: "hit",
          frame: 22,
          attacker: "p1",
          defender: "p2",
          move: "heavy",
          damage: 90,
        },
      ],
    });

    expect(numbers).toEqual([
      {
        id: "22:damage:p1:p2:heavy:90",
        kind: "heavy",
        value: 90,
        x: base.p2.x - base.p2.facing * 18,
        y: base.p2.y - 182,
        driftX: 0.42,
        age: 0,
        duration: 42,
      },
    ]);
    expect(damageNumberStyleForMove("heavy")).toMatchObject({ color: "#ff9f1c", fontSize: 23 });
  });

  it("ages damage numbers out deterministically", () => {
    const [number] = damageNumbersFromSnapshot({
      ...new FightingSimulation().snapshot(),
      events: [
        {
          type: "hit",
          frame: 22,
          attacker: "p1",
          defender: "p2",
          move: "special",
          damage: 120,
        },
      ],
    });

    let numbers = [number];
    for (let frame = 0; frame < number.duration; frame += 1) {
      numbers = [...tickDamageNumbers(numbers)];
    }

    expect(numbers).toEqual([]);
  });
});
