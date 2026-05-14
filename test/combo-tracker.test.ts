import { describe, expect, it } from "vitest";
import { FightingSimulation, createInput } from "../src/core";

describe("combo tracker", () => {
  it("starts empty in the initial snapshot", () => {
    expect(new FightingSimulation().snapshot().combo).toEqual({
      attacker: null,
      defender: null,
      count: 0,
      damage: 0,
      lastHitFrame: null,
    });
  });

  it("records a single hit with attacker, defender, and damage", () => {
    const snapshot = runUntilFirstHit();

    expect(snapshot.combo).toMatchObject({
      attacker: "p1",
      defender: "p2",
      count: 1,
      damage: 45,
    });
    expect(snapshot.combo.lastHitFrame).toEqual(expect.any(Number));
  });

  it("chains repeated hits from the same attacker within the combo window", () => {
    const simulation = new FightingSimulation();
    let snapshot = simulation.snapshot();

    for (let frame = 1; frame <= 210; frame += 1) {
      snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 170 ? 1 : 0,
          buttons: {
            light: frame === 114 || frame === 162,
          },
        }),
      });
    }

    expect(snapshot.combo.attacker).toBe("p1");
    expect(snapshot.combo.defender).toBe("p2");
    expect(snapshot.combo.count).toBeGreaterThanOrEqual(2);
    expect(snapshot.combo.damage).toBeGreaterThanOrEqual(90);
  });

  it("expires stale combo state after the timeout", () => {
    const simulation = new FightingSimulation();
    let snapshot = runUntilFirstHit(simulation);

    for (let frame = (snapshot.combo.lastHitFrame ?? 0) + 1; frame <= 260; frame += 1) {
      snapshot = simulation.step();
    }

    expect(snapshot.combo.count).toBe(0);
    expect(snapshot.combo.attacker).toBeNull();
  });
});

function runUntilFirstHit(simulation = new FightingSimulation()) {
  let snapshot = simulation.snapshot();
  for (let frame = 1; frame <= 150 && snapshot.combo.count === 0; frame += 1) {
    snapshot = simulation.step({
      p1: createInput(frame, {
        horizontal: frame < 108 ? 1 : 0,
        buttons: { light: frame === 114 },
      }),
    });
  }
  return snapshot;
}
