import {
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  stageAssetManifests,
  type FighterAssetManifest,
  type StageAssetManifest,
} from "../assets";
import { GINGER_TABBY_CAT, GRAY_RABBIT, type CpuDifficulty, type FighterDefinition } from "../core";

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

export type RuntimeUiAssetId =
  | "logo-title-mark"
  | "hud-frame"
  | "rabbit-portrait"
  | "cat-portrait"
  | "health-bar-rabbit"
  | "health-bar-cat"
  | "super-meter"
  | "timer-frame"
  | "fight-ko-victory-overlays";

export interface RuntimeUiAssetConfig {
  id: RuntimeUiAssetId;
  key: string;
  path: string;
}

export interface GameContentConfig {
  title: string;
  subtitle: string;
  cpuDifficulties: readonly CpuDifficulty[];
  roster: readonly FighterDefinition[];
  defaultSelections: Readonly<Record<PlayerContentSlot, number>>;
  fighterAssetManifests: readonly FighterAssetManifest[];
  conceptSheet: ConceptSheetConfig | null;
  runtimeSpritesheets: readonly RuntimeSpritesheetConfig[];
  runtimeSpriteCellSize: number;
  runtimeUiAssets: readonly RuntimeUiAssetConfig[];
  assetVersion: string;
  stage: StageAssetManifest;
}

export const meowtalKombatConfig: GameContentConfig = {
  title: "MEOWTAL KOMBAT",
  subtitle: "RABBIT VS TABBY",
  cpuDifficulties: ["easy", "normal", "hard"],
  roster: [GRAY_RABBIT, GINGER_TABBY_CAT],
  defaultSelections: { p1: 0, p2: 1 },
  fighterAssetManifests: meowtalFighterAssetManifests,
  conceptSheet: null,
  runtimeSpritesheets: runtimeSpritesheetsFor(meowtalFighterAssetManifests),
  runtimeSpriteCellSize: 256,
  runtimeUiAssets: runtimeUiAssetsFor([
    "logo-title-mark",
    "hud-frame",
    "rabbit-portrait",
    "cat-portrait",
    "health-bar-rabbit",
    "health-bar-cat",
    "super-meter",
    "timer-frame",
    "fight-ko-victory-overlays",
  ]),
  assetVersion: "meowtal-courtyard-1",
  stage: meowtalStageAssetManifests[0] ?? stageAssetManifests[0],
};

function runtimeSpritesheetsFor(manifests: readonly FighterAssetManifest[]): readonly RuntimeSpritesheetConfig[] {
  return manifests.flatMap((manifest) =>
    manifest.animations.map((animation) => {
      const path = animation.source.outputPath;
      if (animation.source.status !== "approved" || !path) {
        throw new Error(`${manifest.id}:${animation.id} must be an approved runtime sprite before routing.`);
      }

      return { key: `${manifest.id}:${animation.id}`, path };
    }),
  );
}

function runtimeUiAssetsFor(ids: readonly RuntimeUiAssetId[]): readonly RuntimeUiAssetConfig[] {
  return ids.map((id) => ({
    id,
    key: runtimeUiAssetKey(id),
    path: `/assets/generated/ui/meowtal/${id}.png`,
  }));
}

export function runtimeUiAssetKey(id: RuntimeUiAssetId): string {
  return `meowtal-ui:${id}`;
}

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
