import { stageAssetManifests, type StageAssetManifest } from "../assets";
import { ATLAS_LION, SAHARA_VIPER, type CpuDifficulty, type FighterDefinition } from "../core";

export type PlayerContentSlot = "p1" | "p2";

export interface ConceptPreviewCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConceptSheetConfig {
  key: string;
  path: string;
  previewCrops: Readonly<Record<PlayerContentSlot, ConceptPreviewCrop>>;
}

export interface RuntimeSpritesheetConfig {
  key: string;
  path: string;
}

export interface GameContentConfig {
  title: string;
  subtitle: string;
  cpuDifficulties: readonly CpuDifficulty[];
  roster: readonly FighterDefinition[];
  defaultSelections: Readonly<Record<PlayerContentSlot, number>>;
  conceptSheet: ConceptSheetConfig;
  runtimeSpritesheets: readonly RuntimeSpritesheetConfig[];
  runtimeSpriteCellSize: number;
  assetVersion: string;
  stage: StageAssetManifest;
}

export const atlasArenaConfig: GameContentConfig = {
  title: "ATLAS ARENA",
  subtitle: "MARRAKESH ROOFTOP DUEL",
  cpuDifficulties: ["easy", "normal", "hard"],
  roster: [ATLAS_LION, SAHARA_VIPER],
  defaultSelections: { p1: 0, p2: 1 },
  conceptSheet: {
    key: "moroccan-fighters-concept-sheet",
    path: "/assets/generated/moroccan-fighters-concept-sheet.png",
    previewCrops: {
      p1: { x: 245, y: 20, width: 550, height: 900 },
      p2: { x: 760, y: 20, width: 580, height: 900 },
    },
  },
  runtimeSpritesheets: [
    { key: "atlas-lion:idle", path: "/assets/generated/fighters/atlas-lion/idle.png" },
    { key: "atlas-lion:walk-forward", path: "/assets/generated/fighters/atlas-lion/walk-forward.png" },
    { key: "atlas-lion:walk-back", path: "/assets/generated/fighters/atlas-lion/walk-back.png" },
    { key: "atlas-lion:crouch", path: "/assets/generated/fighters/atlas-lion/crouch.png" },
    { key: "atlas-lion:jump", path: "/assets/generated/fighters/atlas-lion/jump.png" },
    { key: "atlas-lion:light-punch", path: "/assets/generated/fighters/atlas-lion/light-punch.png" },
    { key: "atlas-lion:light-kick", path: "/assets/generated/fighters/atlas-lion/light-kick.png" },
    { key: "atlas-lion:heavy-punch", path: "/assets/generated/fighters/atlas-lion/heavy-punch.png" },
    { key: "atlas-lion:special", path: "/assets/generated/fighters/atlas-lion/special.png" },
    { key: "atlas-lion:hitstun", path: "/assets/generated/fighters/atlas-lion/hitstun.png" },
    { key: "atlas-lion:blockstun", path: "/assets/generated/fighters/atlas-lion/blockstun.png" },
    { key: "atlas-lion:knockdown", path: "/assets/generated/fighters/atlas-lion/knockdown.png" },
    { key: "atlas-lion:win", path: "/assets/generated/fighters/atlas-lion/win.png" },
    { key: "atlas-lion:lose", path: "/assets/generated/fighters/atlas-lion/lose.png" },
    { key: "sahara-viper:idle", path: "/assets/generated/fighters/sahara-viper/idle.png" },
    { key: "sahara-viper:walk-forward", path: "/assets/generated/fighters/sahara-viper/walk-forward.png" },
    { key: "sahara-viper:walk-back", path: "/assets/generated/fighters/sahara-viper/walk-back.png" },
    { key: "sahara-viper:crouch", path: "/assets/generated/fighters/sahara-viper/crouch.png" },
    { key: "sahara-viper:jump", path: "/assets/generated/fighters/sahara-viper/jump.png" },
    { key: "sahara-viper:light-punch", path: "/assets/generated/fighters/sahara-viper/light-punch.png" },
    { key: "sahara-viper:light-kick", path: "/assets/generated/fighters/sahara-viper/light-kick.png" },
    { key: "sahara-viper:heavy-punch", path: "/assets/generated/fighters/sahara-viper/heavy-punch.png" },
    { key: "sahara-viper:special", path: "/assets/generated/fighters/sahara-viper/special.png" },
    { key: "sahara-viper:hitstun", path: "/assets/generated/fighters/sahara-viper/hitstun.png" },
    { key: "sahara-viper:blockstun", path: "/assets/generated/fighters/sahara-viper/blockstun.png" },
    { key: "sahara-viper:knockdown", path: "/assets/generated/fighters/sahara-viper/knockdown.png" },
    { key: "sahara-viper:win", path: "/assets/generated/fighters/sahara-viper/win.png" },
    { key: "sahara-viper:lose", path: "/assets/generated/fighters/sahara-viper/lose.png" },
  ],
  runtimeSpriteCellSize: 256,
  assetVersion: "timeline-polish-1",
  stage: stageAssetManifests[0],
};

export function selectedFighterFromConfig(config: GameContentConfig, index: number): FighterDefinition {
  const rosterLength = config.roster.length;
  if (rosterLength === 0) {
    throw new Error("Game content config requires at least one fighter.");
  }
  const normalizedIndex = ((index % rosterLength) + rosterLength) % rosterLength;
  return config.roster[normalizedIndex];
}

export function nextCpuDifficultyFromConfig(config: GameContentConfig, current: CpuDifficulty): CpuDifficulty {
  const difficultyCount = config.cpuDifficulties.length;
  if (difficultyCount === 0) {
    throw new Error("Game content config requires at least one CPU difficulty.");
  }
  const currentIndex = config.cpuDifficulties.indexOf(current);
  return config.cpuDifficulties[(currentIndex + 1) % difficultyCount];
}

export function versionedAssetFromConfig(config: GameContentConfig, path: string): string {
  return `${path}?v=${config.assetVersion}`;
}
