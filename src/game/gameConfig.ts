import {
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  stageAssetManifests,
  type FighterAssetManifest,
  type StageAssetManifest,
} from "../assets";
import { petFighterGameBible, type PetFighterGameBible } from "../content";
import {
  GINGER_TABBY_CAT,
  GRAY_RABBIT,
  NOODLE_NIBBLES,
  PICKLES_PUGILIST,
  type CpuDifficulty,
  type FighterDefinition,
} from "../core";

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
  | "title-crest"
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

export type RuntimeUiImageSlot =
  | "title-logo"
  | "hud-frame"
  | "rabbit-portrait"
  | "cat-portrait"
  | "health-bar-rabbit"
  | "health-bar-cat"
  | "super-meter"
  | "timer-frame"
  | "fight-overlay"
  | "ko-overlay"
  | "rabbit-win-overlay"
  | "cat-win-overlay";

export interface UiCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RuntimeUiImageSpec {
  slot: RuntimeUiImageSlot;
  assetId: RuntimeUiAssetId;
  crop: UiCrop;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
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
  contentSpine: PetFighterGameBible;
}

export const RUNTIME_UI_IMAGE_SPECS = [
  {
    slot: "title-logo",
    assetId: "title-crest",
    crop: { x: 0, y: 0, width: 1672, height: 941 },
    x: 512,
    y: 194,
    width: 690,
    height: 388,
    depth: 96,
  },
  {
    slot: "hud-frame",
    assetId: "hud-frame",
    crop: { x: 6, y: 24, width: 1010, height: 154 },
    x: 512,
    y: 80,
    width: 1010,
    height: 154,
    depth: 82,
  },
  {
    slot: "rabbit-portrait",
    assetId: "rabbit-portrait",
    crop: { x: 156, y: 0, width: 713, height: 576 },
    x: 72,
    y: 72,
    width: 138,
    height: 112,
    depth: 85,
  },
  {
    slot: "cat-portrait",
    assetId: "cat-portrait",
    crop: { x: 156, y: 0, width: 713, height: 576 },
    x: 952,
    y: 72,
    width: 138,
    height: 112,
    depth: 85,
  },
  {
    slot: "health-bar-rabbit",
    assetId: "health-bar-rabbit",
    crop: { x: 52, y: 189, width: 932, height: 156 },
    x: 270,
    y: 62,
    width: 430,
    height: 72,
    depth: 84,
  },
  {
    slot: "health-bar-cat",
    assetId: "health-bar-cat",
    crop: { x: 34, y: 219, width: 953, height: 131 },
    x: 754,
    y: 62,
    width: 430,
    height: 59,
    depth: 84,
  },
  {
    slot: "super-meter",
    assetId: "super-meter",
    crop: { x: 16, y: 222, width: 992, height: 137 },
    x: 512,
    y: 528,
    width: 700,
    height: 96,
    depth: 82,
  },
  {
    slot: "timer-frame",
    assetId: "timer-frame",
    crop: { x: 203, y: 23, width: 617, height: 531 },
    x: 512,
    y: 58,
    width: 104,
    height: 90,
    depth: 86,
  },
  {
    slot: "fight-overlay",
    assetId: "fight-ko-victory-overlays",
    crop: { x: 30, y: 17, width: 477, height: 271 },
    x: 512,
    y: 184,
    width: 430,
    height: 244,
    depth: 96,
  },
  {
    slot: "ko-overlay",
    assetId: "fight-ko-victory-overlays",
    crop: { x: 514, y: 24, width: 487, height: 264 },
    x: 512,
    y: 236,
    width: 520,
    height: 282,
    depth: 96,
  },
  {
    slot: "rabbit-win-overlay",
    assetId: "fight-ko-victory-overlays",
    crop: { x: 25, y: 288, width: 473, height: 231 },
    x: 512,
    y: 312,
    width: 560,
    height: 274,
    depth: 96,
  },
  {
    slot: "cat-win-overlay",
    assetId: "fight-ko-victory-overlays",
    crop: { x: 513, y: 288, width: 483, height: 230 },
    x: 512,
    y: 312,
    width: 560,
    height: 267,
    depth: 96,
  },
] as const satisfies readonly RuntimeUiImageSpec[];

export const meowtalKombatConfig: GameContentConfig = {
  title: "PAWBREAKER LEAGUE",
  subtitle: "SNACKBELT SHOWDOWN",
  cpuDifficulties: ["easy", "normal", "hard"],
  roster: [GRAY_RABBIT, GINGER_TABBY_CAT, PICKLES_PUGILIST, NOODLE_NIBBLES],
  defaultSelections: { p1: 0, p2: 1 },
  fighterAssetManifests: meowtalFighterAssetManifests,
  conceptSheet: null,
  runtimeSpritesheets: runtimeSpritesheetsFor(meowtalFighterAssetManifests),
  runtimeSpriteCellSize: 256,
  runtimeUiAssets: runtimeUiAssetsFor([
    "title-crest",
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
  contentSpine: petFighterGameBible,
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
    path: id === "title-crest" ? "/assets/generated/ui/pawbreaker/title-crest.png" : `/assets/generated/ui/meowtal/${id}.png`,
  }));
}

export function runtimeUiAssetKey(id: RuntimeUiAssetId): string {
  if (id === "title-crest") return "pawbreaker-ui:title-crest";
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
