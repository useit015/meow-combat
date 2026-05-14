import { describe, expect, it } from "vitest";
import { FightingSimulation } from "../src/core";
import { effectsFromSnapshot, tickCombatEffects } from "../src/game/effects";

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
});
