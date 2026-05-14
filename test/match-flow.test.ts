import { describe, expect, it } from "vitest";
import { FightingSimulation, createInput } from "../src/core";

describe("match flow", () => {
  it("resolves a round by timer and health lead", () => {
    const simulation = new FightingSimulation({ roundSeconds: 3 });
    let snapshot = simulation.snapshot();

    for (let frame = 1; frame <= 220 && snapshot.status === "fighting"; frame += 1) {
      snapshot = simulation.step({
        p1: createInput(frame, { horizontal: frame < 108 ? 1 : 0, buttons: { light: frame === 114 } }),
      });
    }

    expect(snapshot.status).toBe("round-over");
    expect(snapshot.winner).toBe("p1");
  });

  it("freezes the snapshot once the round is over", () => {
    const simulation = new FightingSimulation({ roundSeconds: 1 });
    for (let frame = 1; frame <= 80; frame += 1) {
      simulation.step();
    }

    const ended = simulation.snapshot();
    const afterExtraStep = simulation.step({
      p1: createInput(999, { buttons: { heavy: true } }),
    });

    expect(afterExtraStep).toEqual(ended);
  });
});
