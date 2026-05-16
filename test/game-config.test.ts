import { describe, expect, it } from "vitest";
import { REQUIRED_FIGHTER_ANIMATIONS } from "../src/assets";
import {
  meowtalKombatConfig,
  nextCpuDifficultyFromConfig,
  runtimeUiAssetKey,
  selectedFighterFromConfig,
  versionedAssetFromConfig,
} from "../src/game/gameConfig";

describe("game content config", () => {
  it("captures the active Pawbreaker presentation content", () => {
    expect(meowtalKombatConfig.title).toBe("PAWBREAKER LEAGUE");
    expect(meowtalKombatConfig.subtitle).toBe("SNACKBELT SHOWDOWN");
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.displayName)).toEqual([
      "Gray Rabbit",
      "Ginger Tabby Cat",
      "Pickles Pugilist",
    ]);
    expect(meowtalKombatConfig.defaultSelections).toEqual({ p1: 0, p2: 1 });
    expect(meowtalKombatConfig.stage.id).toBe("meowtal-courtyard");
    expect(meowtalKombatConfig.stage.layers.map((layer) => layer.id)).toEqual([
      "sky-lighting",
      "distant-hills-city",
      "background-walls-pillars",
      "midground-trees-bushes",
      "playfield-stone-courtyard",
      "foreground-dust-leaves",
    ]);
  });

  it("links the expansion bible with the promoted Pickles runtime roster", () => {
    expect(meowtalKombatConfig.contentSpine.workingTitle).toBe("Pawbreaker League");
    expect(meowtalKombatConfig.contentSpine.fighters).toHaveLength(8);
    expect(meowtalKombatConfig.contentSpine.runtimeFighterIds).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
  });

  it("keeps Meowtal runtime sprite metadata centralized", () => {
    expect(meowtalKombatConfig.conceptSheet).toBeNull();
    expect(meowtalKombatConfig.fighterAssetManifests.map((manifest) => manifest.id)).toEqual([
      "gray-rabbit",
      "ginger-tabby-cat",
      "pugilist-pug",
    ]);
    expect(meowtalKombatConfig.runtimeSpriteCellSize).toBe(256);
    expect(meowtalKombatConfig.runtimeSpritesheets).toHaveLength(3 * REQUIRED_FIGHTER_ANIMATIONS.length);
    expect(versionedAssetFromConfig(meowtalKombatConfig, "/assets/generated/fighters/gray-rabbit/idle.png")).toBe(
      "/assets/generated/fighters/gray-rabbit/idle.png?v=meowtal-courtyard-1",
    );
  });

  it("routes the approved Meowtal runtime UI asset set through config", () => {
    expect(meowtalKombatConfig.runtimeUiAssets.map((asset) => asset.id)).toEqual([
      "title-crest",
      "hud-frame",
      "rabbit-portrait",
      "cat-portrait",
      "health-bar-rabbit",
      "health-bar-cat",
      "super-meter",
      "timer-frame",
      "fight-ko-victory-overlays",
    ]);
    for (const asset of meowtalKombatConfig.runtimeUiAssets) {
      expect(asset.key).toBe(runtimeUiAssetKey(asset.id));
      expect(asset.path).toBe(
        asset.id === "title-crest"
          ? "/assets/generated/ui/pawbreaker/title-crest.png"
          : `/assets/generated/ui/meowtal/${asset.id}.png`,
      );
      expect(asset.path).not.toContain("atlas");
      expect(asset.path).not.toContain("viper");
    }
  });

  it("includes a runtime spritesheet for each approved animation row", () => {
    const runtimeKeys = new Set(meowtalKombatConfig.runtimeSpritesheets.map((spritesheet) => spritesheet.key));

    for (const fighterId of ["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]) {
      for (const animationId of REQUIRED_FIGHTER_ANIMATIONS) {
        expect(runtimeKeys).toContain(`${fighterId}:${animationId}`);
      }
    }
  });

  it("looks up fighters and CPU difficulty order from the config", () => {
    expect(selectedFighterFromConfig(meowtalKombatConfig, 0).displayName).toBe("Gray Rabbit");
    expect(selectedFighterFromConfig(meowtalKombatConfig, 1).displayName).toBe("Ginger Tabby Cat");
    expect(selectedFighterFromConfig(meowtalKombatConfig, 2).displayName).toBe("Pickles Pugilist");
    expect(selectedFighterFromConfig(meowtalKombatConfig, -1).displayName).toBe("Pickles Pugilist");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "easy")).toBe("normal");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "normal")).toBe("hard");
    expect(nextCpuDifficultyFromConfig(meowtalKombatConfig, "hard")).toBe("easy");
  });
});
