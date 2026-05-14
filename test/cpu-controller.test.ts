import { describe, expect, it } from "vitest";
import { CPU_PROFILES, FightingSimulation, createCpuInput } from "../src/core";

describe("cpu controller", () => {
  it("walks toward the opponent when outside pressure range", () => {
    const snapshot = new FightingSimulation().snapshot();

    expect(createCpuInput(snapshot, "p2", 1).horizontal).toBe(-1);
    expect(createCpuInput(snapshot, "p1", 1).horizontal).toBe(1);
  });

  it("guards by backing away when the opponent is attacking nearby", () => {
    const snapshot = new FightingSimulation().snapshot();
    const closeThreat = {
      ...snapshot,
      p1: {
        ...snapshot.p1,
        x: 620,
        state: "heavyAttack" as const,
      },
      p2: {
        ...snapshot.p2,
        x: 700,
        facing: -1 as const,
      },
    };

    const input = createCpuInput(closeThreat, "p2", 12);

    expect(input.horizontal).toBe(1);
    expect(input.buttons.guard).toBe(true);
  });

  it("presses deterministic attacks when it is already in range", () => {
    const snapshot = new FightingSimulation().snapshot();
    const inRange = {
      ...snapshot,
      p1: {
        ...snapshot.p1,
        x: 640,
      },
      p2: {
        ...snapshot.p2,
        x: 724,
      },
    };

    expect(createCpuInput(inRange, "p2", 54).buttons.light).toBe(true);
    expect(createCpuInput(inRange, "p2", 96).buttons.heavy).toBe(true);
  });

  it("uses named profiles to tune attack timing without randomness", () => {
    const snapshot = new FightingSimulation().snapshot();
    const inRange = {
      ...snapshot,
      p1: {
        ...snapshot.p1,
        x: 640,
      },
      p2: {
        ...snapshot.p2,
        x: 724,
      },
    };

    expect(createCpuInput(inRange, "p2", 54, { difficulty: "normal" }).buttons.light).toBe(true);
    expect(createCpuInput(inRange, "p2", 54, { difficulty: "easy" }).buttons.light).toBe(false);
    expect(createCpuInput(inRange, "p2", 42, { difficulty: "hard" }).buttons.light).toBe(true);
  });

  it("lets hard profile react to attacks from farther away", () => {
    const snapshot = new FightingSimulation().snapshot();
    const threat = {
      ...snapshot,
      p1: {
        ...snapshot.p1,
        x: 530,
        state: "heavyAttack" as const,
      },
      p2: {
        ...snapshot.p2,
        x: 700,
        facing: -1 as const,
      },
    };

    expect(createCpuInput(threat, "p2", 12, { difficulty: "normal" }).buttons.guard).toBe(false);
    expect(createCpuInput(threat, "p2", 12, { difficulty: "hard" }).buttons.guard).toBe(true);
  });

  it("keeps profiles explicit and ordered by pressure", () => {
    expect(CPU_PROFILES.easy.pressureRange).toBeLessThan(CPU_PROFILES.normal.pressureRange);
    expect(CPU_PROFILES.normal.pressureRange).toBeLessThan(CPU_PROFILES.hard.pressureRange);
  });

  it("returns the same input for the same frame and snapshot", () => {
    const snapshot = new FightingSimulation().snapshot();

    expect(createCpuInput(snapshot, "p2", 120)).toEqual(createCpuInput(snapshot, "p2", 120));
  });
});
