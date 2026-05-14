import { describe, expect, it } from "vitest";
import { ATLAS_LION, FightingSimulation, SAHARA_VIPER } from "../src/core";
import { atlasArenaConfig, selectedFighterFromConfig } from "../src/game/gameConfig";

describe("character selection support", () => {
  it("uses the configured default character order for player slots", () => {
    expect(selectedFighterFromConfig(atlasArenaConfig, atlasArenaConfig.defaultSelections.p1).displayName).toBe(
      "Atlas Lion",
    );
    expect(selectedFighterFromConfig(atlasArenaConfig, atlasArenaConfig.defaultSelections.p2).displayName).toBe(
      "Sahara Viper",
    );
  });

  it("lets the simulation start with selected fighter definitions", () => {
    const simulation = new FightingSimulation({
      p1Definition: SAHARA_VIPER,
      p2Definition: ATLAS_LION,
    });

    const snapshot = simulation.snapshot();

    expect(snapshot.p1.character).toBe("Sahara Viper");
    expect(snapshot.p2.character).toBe("Atlas Lion");
  });

  it("preserves selected fighter definitions across reset", () => {
    const simulation = new FightingSimulation({
      p1Definition: SAHARA_VIPER,
      p2Definition: ATLAS_LION,
    });

    simulation.step();
    simulation.reset();

    expect(simulation.snapshot().p1.character).toBe("Sahara Viper");
    expect(simulation.snapshot().p2.character).toBe("Atlas Lion");
  });
});
