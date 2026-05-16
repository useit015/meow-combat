import { describe, expect, it } from "vitest";
import { FightingSimulation, GINGER_TABBY_CAT, GRAY_RABBIT, NOODLE_NIBBLES, PICKLES_PUGILIST } from "../src/core";
import { meowtalKombatConfig, selectedFighterFromConfig } from "../src/game/gameConfig";

describe("character selection support", () => {
  it("uses the configured default character order for player slots", () => {
    expect(selectedFighterFromConfig(meowtalKombatConfig, meowtalKombatConfig.defaultSelections.p1).displayName).toBe(
      "Gray Rabbit",
    );
    expect(selectedFighterFromConfig(meowtalKombatConfig, meowtalKombatConfig.defaultSelections.p2).displayName).toBe(
      "Ginger Tabby Cat",
    );
  });

  it("exposes Pickles as a selectable runtime fighter", () => {
    expect(selectedFighterFromConfig(meowtalKombatConfig, 2).displayName).toBe("Pickles Pugilist");
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toContain("pugilist-pug");
  });

  it("exposes Noodle as a selectable runtime fighter", () => {
    expect(selectedFighterFromConfig(meowtalKombatConfig, 3).displayName).toBe("Noodle Nibbles");
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toContain("ferret-noodle");
  });

  it("keeps every runtime-selectable fighter backed by shell story and move copy", () => {
    for (const fighterId of meowtalKombatConfig.contentSpine.runtimeFighterIds) {
      const content = meowtalKombatConfig.contentSpine.fighters.find((fighter) => fighter.id === fighterId);

      expect(content?.runtime.status).toBe("active");
      expect(content?.name).toBeTruthy();
      expect(content?.storyHook).toBeTruthy();
      expect(content?.signatureMove).toBeTruthy();
      expect(content?.superMove).toBeTruthy();
      expect(content?.trainingTip).toBeTruthy();
    }

    expect(meowtalKombatConfig.contentSpine.fighters.filter((fighter) => fighter.runtime.status === "planned")).toHaveLength(4);
  });

  it("lets the simulation start with selected fighter definitions", () => {
    const simulation = new FightingSimulation({
      p1Definition: GINGER_TABBY_CAT,
      p2Definition: GRAY_RABBIT,
    });

    const snapshot = simulation.snapshot();

    expect(snapshot.p1.character).toBe("Ginger Tabby Cat");
    expect(snapshot.p2.character).toBe("Gray Rabbit");
  });

  it("lets the simulation start with Pickles selected", () => {
    const simulation = new FightingSimulation({
      p1Definition: PICKLES_PUGILIST,
      p2Definition: GINGER_TABBY_CAT,
    });

    const snapshot = simulation.snapshot();

    expect(snapshot.p1.character).toBe("Pickles Pugilist");
    expect(snapshot.p2.character).toBe("Ginger Tabby Cat");
  });

  it("lets the simulation start with Noodle selected", () => {
    const simulation = new FightingSimulation({
      p1Definition: NOODLE_NIBBLES,
      p2Definition: PICKLES_PUGILIST,
    });

    const snapshot = simulation.snapshot();

    expect(snapshot.p1.character).toBe("Noodle Nibbles");
    expect(snapshot.p2.character).toBe("Pickles Pugilist");
  });

  it("preserves selected fighter definitions across reset", () => {
    const simulation = new FightingSimulation({
      p1Definition: GINGER_TABBY_CAT,
      p2Definition: GRAY_RABBIT,
    });

    simulation.step();
    simulation.reset();

    expect(simulation.snapshot().p1.character).toBe("Ginger Tabby Cat");
    expect(simulation.snapshot().p2.character).toBe("Gray Rabbit");
  });
});
