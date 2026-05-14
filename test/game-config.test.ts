import { describe, expect, it } from "vitest";
import { REQUIRED_FIGHTER_ANIMATIONS } from "../src/assets";
import {
  atlasArenaConfig,
  nextCpuDifficultyFromConfig,
  selectedFighterFromConfig,
  versionedAssetFromConfig,
} from "../src/game/gameConfig";

describe("game content config", () => {
  it("captures the current Atlas-facing presentation content", () => {
    expect(atlasArenaConfig.title).toBe("ATLAS ARENA");
    expect(atlasArenaConfig.subtitle).toBe("MARRAKESH ROOFTOP DUEL");
    expect(atlasArenaConfig.roster.map((fighter) => fighter.displayName)).toEqual(["Atlas Lion", "Sahara Viper"]);
    expect(atlasArenaConfig.defaultSelections).toEqual({ p1: 0, p2: 1 });
    expect(atlasArenaConfig.stage.id).toBe("marrakesh-rooftop");
  });

  it("keeps concept sheet and runtime sprite metadata centralized", () => {
    expect(atlasArenaConfig.conceptSheet).toEqual({
      key: "moroccan-fighters-concept-sheet",
      path: "/assets/generated/moroccan-fighters-concept-sheet.png",
      previewCrops: {
        p1: { x: 245, y: 20, width: 550, height: 900 },
        p2: { x: 760, y: 20, width: 580, height: 900 },
      },
    });
    expect(atlasArenaConfig.runtimeSpriteCellSize).toBe(256);
    expect(atlasArenaConfig.runtimeSpritesheets).toHaveLength(2 * REQUIRED_FIGHTER_ANIMATIONS.length);
    expect(versionedAssetFromConfig(atlasArenaConfig, "/assets/generated/fighters/atlas-lion/idle.png")).toBe(
      "/assets/generated/fighters/atlas-lion/idle.png?v=timeline-polish-1",
    );
  });

  it("includes a runtime spritesheet for each approved animation row", () => {
    const runtimeKeys = new Set(atlasArenaConfig.runtimeSpritesheets.map((spritesheet) => spritesheet.key));

    for (const fighterId of ["atlas-lion", "sahara-viper"]) {
      for (const animationId of REQUIRED_FIGHTER_ANIMATIONS) {
        expect(runtimeKeys).toContain(`${fighterId}:${animationId}`);
      }
    }
  });

  it("looks up fighters and CPU difficulty order from the config", () => {
    expect(selectedFighterFromConfig(atlasArenaConfig, 0).displayName).toBe("Atlas Lion");
    expect(selectedFighterFromConfig(atlasArenaConfig, 1).displayName).toBe("Sahara Viper");
    expect(selectedFighterFromConfig(atlasArenaConfig, -1).displayName).toBe("Sahara Viper");
    expect(nextCpuDifficultyFromConfig(atlasArenaConfig, "easy")).toBe("normal");
    expect(nextCpuDifficultyFromConfig(atlasArenaConfig, "normal")).toBe("hard");
    expect(nextCpuDifficultyFromConfig(atlasArenaConfig, "hard")).toBe("easy");
  });
});
