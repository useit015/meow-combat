import { describe, expect, it } from "vitest";
import { ATLAS_LION, FightingSimulation, InputBuffer, POWER_METER_STOCK, createInput } from "../src/core";

describe("InputBuffer", () => {
  it("recognizes a quarter-circle-forward special command", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1, { vertical: 1 }));
    buffer.push(createInput(2, { horizontal: 1, vertical: 1 }));
    buffer.push(createInput(3, { horizontal: 1 }));
    buffer.push(createInput(4, { horizontal: 1, buttons: { special: true } }));

    expect(buffer.consumeCommand(1)).toBe("special");
  });

  it("recognizes a meter-backed quarter-circle-forward super command", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1, { vertical: 1 }));
    buffer.push(createInput(2, { horizontal: 1, vertical: 1 }));
    buffer.push(createInput(3, { horizontal: 1 }));
    buffer.push(createInput(4, { horizontal: 1, buttons: { special: true } }));

    expect(buffer.consumeCommand(1, { canSuper: true })).toBe("super");
  });

  it("recognizes the special button without requiring a motion", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1));
    buffer.push(createInput(2, { buttons: { special: true } }));

    expect(buffer.consumeCommand(1)).toBe("special");
  });

  it("recognizes basic attack button presses", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1));
    buffer.push(createInput(2, { buttons: { heavy: true } }));

    expect(buffer.consumeCommand(1)).toBe("heavy");
  });

  it("recognizes light-kick button presses", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1));
    buffer.push(createInput(2, { buttons: { kick: true } }));

    expect(buffer.consumeCommand(1)).toBe("lightKick");
  });

  it("recognizes double-tap movement commands", () => {
    const buffer = new InputBuffer();
    buffer.push(createInput(1, { horizontal: 1 }));
    buffer.push(createInput(2));
    buffer.push(createInput(3, { horizontal: 1 }));

    expect(buffer.consumeMobilityCommand(1)).toBe("runForward");
  });
});

describe("FightingSimulation", () => {
  it("advances deterministically from the same input sequence", () => {
    const first = runScriptedExchange();
    const second = runScriptedExchange();

    expect(second).toEqual(first);
  });

  it("applies damage when an active hitbox overlaps a hurtbox", () => {
    const simulation = new FightingSimulation();

    let sawHit = false;
    for (let frame = 1; frame <= 150; frame += 1) {
      const snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 108 ? 1 : 0,
          buttons: { light: frame === 114 },
        }),
      });
      sawHit ||= snapshot.events.some((event) => event.type === "hit");
    }

    const snapshot = simulation.snapshot();
    expect(snapshot.p2.health).toBeLessThan(1000);
    expect(sawHit).toBe(true);
  });

  it("lands one hit per attack activation even while hitstop holds active frames", () => {
    const simulation = new FightingSimulation();
    let hitCount = 0;

    for (let frame = 1; frame <= 180; frame += 1) {
      const snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 108 ? 1 : 0,
          buttons: { light: frame === 114 },
        }),
      });
      hitCount += snapshot.events.filter((event) => event.type === "hit" && event.move === "light").length;
    }

    const snapshot = simulation.snapshot();
    expect(hitCount).toBe(1);
    expect(snapshot.p2.health).toBe(955);
  });

  it("blocks with the dedicated guard button without requiring backward movement", () => {
    const simulation = new FightingSimulation();
    let sawBlock = false;
    let sawHit = false;

    for (let frame = 1; frame <= 150; frame += 1) {
      const snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 108 ? 1 : 0,
          buttons: { light: frame === 114 },
        }),
        p2: createInput(frame, {
          buttons: { guard: frame >= 100 },
        }),
      });
      sawBlock ||= snapshot.events.some((event) => event.type === "block");
      sawHit ||= snapshot.events.some((event) => event.type === "hit");
    }

    const snapshot = simulation.snapshot();
    expect(sawBlock).toBe(true);
    expect(sawHit).toBe(false);
    expect(snapshot.p2.health).toBe(1000);
    expect(snapshot.p2.guarding).toBe(true);
  });

  it("applies light-kick as a distinct playable attack state", () => {
    const simulation = new FightingSimulation();

    let sawKickHit = false;
    for (let frame = 1; frame <= 150; frame += 1) {
      const snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 108 ? 1 : 0,
          buttons: { kick: frame === 114 },
        }),
      });
      sawKickHit ||= snapshot.events.some((event) => event.type === "hit" && event.move === "lightKick");
    }

    const snapshot = simulation.snapshot();
    expect(snapshot.p2.health).toBeLessThan(1000);
    expect(sawKickHit).toBe(true);
  });

  it("enters special attack from the special button alone", () => {
    const simulation = new FightingSimulation();

    const snapshot = simulation.step({
      p1: createInput(1, { buttons: { special: true } }),
    });

    expect(snapshot.p1.state).toBe("specialAttack");
  });

  it("supports KOF-style run, backdash, and forward hop states", () => {
    const runSimulation = new FightingSimulation();
    runSimulation.step({ p1: createInput(1, { horizontal: 1 }) });
    runSimulation.step({ p1: createInput(2) });
    const run = runSimulation.step({ p1: createInput(3, { horizontal: 1 }) });

    const backdashSimulation = new FightingSimulation();
    backdashSimulation.step({ p1: createInput(1, { horizontal: -1 }) });
    backdashSimulation.step({ p1: createInput(2) });
    const backdash = backdashSimulation.step({ p1: createInput(3, { horizontal: -1 }) });

    const hop = new FightingSimulation().step({
      p1: createInput(1, { horizontal: 1, vertical: -1, buttons: { jump: true } }),
    });

    expect(run.p1.state).toBe("runForward");
    expect(backdash.p1.state).toBe("backdash");
    expect(hop.p1.state).toBe("hop");
    expect(hop.p1.grounded).toBe(false);
  });

  it("prioritizes the light plus kick chord as a forward roll instead of a light-kick attack", () => {
    const simulation = new FightingSimulation();

    const roll = simulation.step({
      p1: createInput(1, {
        buttons: { light: true, kick: true },
      }),
    });

    expect(roll.p1.state).toBe("rollForward");
  });

  it("lets forward rolls pass through, recover, and face back toward the opponent", () => {
    const simulation = new FightingSimulation();
    let snapshot = simulation.snapshot();

    for (let frame = 1; frame <= 86; frame += 1) {
      snapshot = simulation.step({ p1: createInput(frame, { horizontal: 1 }) });
    }

    expect(snapshot.p1.x).toBeLessThan(snapshot.p2.x);
    expect(snapshot.p2.x - snapshot.p1.x).toBeLessThanOrEqual(90);

    snapshot = simulation.step({
      p1: createInput(87, {
        buttons: { light: true, kick: true },
      }),
    });
    expect(snapshot.p1.state).toBe("rollForward");

    for (let frame = 88; frame <= 124; frame += 1) {
      snapshot = simulation.step({ p1: createInput(frame) });
    }

    expect(snapshot.p1.x).toBeGreaterThan(snapshot.p2.x);
    expect(snapshot.p1.state).toBe("idle");
    expect(snapshot.p1.facing).toBe(-1);
    expect(snapshot.p2.facing).toBe(1);
  });

  it("keeps rolls strike-invulnerable during the pass-through window", () => {
    const simulation = new FightingSimulation();
    let snapshot = simulation.snapshot();
    let sawP1Hit = false;

    for (let frame = 1; frame <= 86; frame += 1) {
      snapshot = simulation.step({ p1: createInput(frame, { horizontal: 1 }) });
    }

    expect(snapshot.p2.x - snapshot.p1.x).toBeLessThanOrEqual(90);

    for (let frame = 87; frame <= 112; frame += 1) {
      snapshot = simulation.step({
        p1: createInput(frame, {
          buttons: { light: frame === 87, kick: frame === 87 },
        }),
        p2: createInput(frame, {
          buttons: { light: frame === 87 },
        }),
      });
      sawP1Hit ||= snapshot.events.some((event) => event.type === "hit" && event.defender === "p1");
    }

    expect(sawP1Hit).toBe(false);
    expect(snapshot.p1.health).toBe(1000);
  });

  it("does not keep retriggering run from a stale double tap after returning neutral", () => {
    const simulation = new FightingSimulation();
    simulation.step({ p1: createInput(1, { horizontal: 1 }) });
    simulation.step({ p1: createInput(2) });

    const run = simulation.step({ p1: createInput(3, { horizontal: 1 }) });
    expect(run.p1.state).toBe("runForward");

    const stop = simulation.step({ p1: createInput(4) });
    expect(stop.p1.state).toBe("idle");
    const stoppedX = stop.p1.x;

    for (let frame = 5; frame <= 18; frame += 1) {
      const snapshot = simulation.step({ p1: createInput(frame) });
      const staleRunEvents = snapshot.events.filter(
        (event) => event.type === "state" && event.to === "runForward",
      );
      expect(staleRunEvents).toHaveLength(0);
      expect(snapshot.p1.x).toBe(stoppedX);
    }
  });

  it("clears dedicated guard when committing to forward run mobility", () => {
    const simulation = new FightingSimulation();
    simulation.step({ p1: createInput(1, { horizontal: 1 }) });
    simulation.step({ p1: createInput(2, { buttons: { guard: true } }) });

    const run = simulation.step({
      p1: createInput(3, {
        horizontal: 1,
        buttons: { guard: true },
      }),
    });

    expect(run.p1.state).toBe("runForward");
    expect(run.p1.guarding).toBe(false);
  });

  it("allows airborne cross-ups to switch sides instead of being pushed back forever", () => {
    const simulation = new FightingSimulation();
    let snapshot = simulation.snapshot();

    for (let frame = 1; frame <= 108; frame += 1) {
      snapshot = simulation.step({
        p1: createInput(frame, { horizontal: 1 }),
      });
    }
    expect(snapshot.p1.x).toBeLessThan(snapshot.p2.x);

    for (let frame = 109; frame <= 170; frame += 1) {
      snapshot = simulation.step({
        p1: createInput(frame, {
          horizontal: 1,
          vertical: frame === 109 ? -1 : 0,
          buttons: { jump: frame === 109 },
        }),
      });
    }

    expect(snapshot.p1.x).toBeGreaterThan(snapshot.p2.x);
    expect(snapshot.p1.facing).toBe(-1);
    expect(snapshot.p2.facing).toBe(1);
  });

  it("builds power meter when attacks connect", () => {
    const simulation = new FightingSimulation();

    for (let frame = 1; frame <= 150; frame += 1) {
      simulation.step({
        p1: createInput(frame, {
          horizontal: frame < 108 ? 1 : 0,
          buttons: { light: frame === 114 },
        }),
      });
    }

    const snapshot = simulation.snapshot();
    expect(snapshot.p1.meter).toBeGreaterThan(0);
    expect(snapshot.p2.meter).toBeGreaterThan(0);
  });

  it("spends one power stock on a quarter-circle-forward super", () => {
    const poweredAtlas = {
      ...ATLAS_LION,
      moves: {
        ...ATLAS_LION.moves,
        light: {
          ...ATLAS_LION.moves.light,
          meterGainOnUse: POWER_METER_STOCK,
        },
      },
    };
    const simulation = new FightingSimulation({ p1Definition: poweredAtlas });
    simulation.step({ p1: createInput(1, { buttons: { light: true } }) });
    for (let frame = 2; frame <= 30; frame += 1) {
      simulation.step({ p1: createInput(frame) });
    }

    simulation.step({ p1: createInput(31, { vertical: 1 }) });
    simulation.step({ p1: createInput(32, { horizontal: 1, vertical: 1 }) });
    simulation.step({ p1: createInput(33, { horizontal: 1 }) });
    const superStart = simulation.step({
      p1: createInput(34, { horizontal: 1, buttons: { special: true } }),
    });

    expect(superStart.p1.state).toBe("superAttack");
    expect(superStart.p1.meter).toBe(0);
  });

  it("can cancel a normal into a special inside the active window", () => {
    const simulation = new FightingSimulation();
    simulation.step({ p1: createInput(1, { buttons: { light: true } }) });
    for (let frame = 2; frame <= 5; frame += 1) {
      simulation.step({ p1: createInput(frame) });
    }

    const snapshot = simulation.step({ p1: createInput(6, { buttons: { special: true } }) });

    expect(snapshot.p1.state).toBe("specialAttack");
  });

  it("keeps state snapshots serializable for future rollback/replay work", () => {
    const simulation = new FightingSimulation();
    simulation.step({ p1: createInput(1, { buttons: { heavy: true } }) });

    expect(() => JSON.stringify(simulation.snapshot())).not.toThrow();
  });
});

function runScriptedExchange() {
  const simulation = new FightingSimulation();
  for (let frame = 1; frame <= 120; frame += 1) {
    simulation.step({
      p1: createInput(frame, {
        horizontal: frame < 44 ? 1 : 0,
        buttons: {
          light: frame === 50,
        },
      }),
      p2: createInput(frame, {
        horizontal: frame < 20 ? -1 : 0,
      }),
    });
  }
  return simulation.snapshot();
}
