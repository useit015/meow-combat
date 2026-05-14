import { describe, expect, it } from "vitest";
import { REQUIRED_FIGHTER_ANIMATIONS } from "../src/assets";
import {
  meowtalKombatConfig,
  nextCpuDifficultyFromConfig,
  selectedFighterFromConfig,
  versionedAssetFromConfig,
} from "../src/game/gameConfig";

describe("game content config", () => {
  it("captures the active Meowtal presentation content", () => {
    expect(meowtalKombatConfig.title).toBe("MEOWTAL KOMBAT");
    expect(meowtalKombatConfig.subtitle).toBe("RABBIT VS TABBY");
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.displayName)).toEqual([
      "Gray Rabbit",
      "Ginger Tabby Cat",
    ]);
    expect(meowtalKombatConfig.defaultSelections).toEqual({ p1: 0, p2: 1 });
    expect(meowtalKombatConfig.stage.id).toBe("marrakesh-rooftop");
  });

  it("keeps Meowtal runtime sprite metadata centralized", () => {
    expect(meowtalKombatConfig.conceptSheet).toBeNull();
    expect(meowtalKombatConfig.fighterAssetManifests.map((manifest) => manifest.id)).toEqual([
      "gray-rabbit",
      "ginger-tabby-cat",
    ]);
    expect(meowtalKombatConfig.runtimeSpriteCellSize).toBe(256);
    expect(meowtalKombatConfig.runtimeSpritesheets).toHaveLength(2 * REQUIRED_FIGHTER_ANIMATIONS.length);
    expect(versionedAssetFromConfig(meowtalKombatConfig, "/assets/generated/fighters/gray-rabbit/idle.png")).toBe(
      "/assets/generated/fighters/gray-rabbit/idle.png?v=meowtal-routing-1",
    );
  });

  it("includes a runtime spritesheet for each approved animation row", () => {
    const runtimeKeys = new Set(meowtalKombatConfig.runtimeSpritesheets.map((spritesheet) => spritesheet.key));

    for (const fighterId of ["gray-rabbit", "ginger-tabby-cat"]) {
      for (const animationId of REQUIRED_FIGHTER_ANIMATIONS) {
        expect(runtimeKeys).toContain(`${fighterId}:${animationId}`);
      }
    }
  });

  it("looks up fighters and CPU difficulty order from the config", () => {
    expect(selectedFighterFromConfig(meowtalKombatConfig, 0).displayName).toBe("Gray Rabbit");
    expect(selectedFighterFromConfig(meowtalKombatConfig, 1).displayName).toBe("Ginger Tabby Cat");
    expect(selectedFighterFromConfig(meowtalKombatConfig, -1).displayName).toBe("Ginger Tabby Cat");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "easy")).toBe("normal");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "normal")).toBe("hard");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "hard")).toBe("easy");
  });
});
