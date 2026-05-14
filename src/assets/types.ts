export type AssetGenerationStatus = "planned" | "blocked" | "generated" | "approved";

export type FighterAnimationId =
  | "idle"
  | "walk-forward"
  | "walk-back"
  | "crouch"
  | "jump"
  | "light-punch"
  | "heavy-punch"
  | "light-kick"
  | "special"
  | "hitstun"
  | "blockstun"
  | "knockdown"
  | "win"
  | "lose";

export type StageLayerId =
  | "sky"
  | "far-architecture"
  | "playfield"
  | "foreground-props"
  | "sky-lighting"
  | "distant-hills-city"
  | "background-walls-pillars"
  | "midground-trees-bushes"
  | "playfield-stone-courtyard"
  | "foreground-dust-leaves";

export interface CellSize {
  width: number;
  height: number;
}

export interface ImagegenSource {
  status: AssetGenerationStatus;
  promptSlug: string;
  outputPath: string | null;
  blocker?: string;
}

export interface FighterAnimationSpec {
  id: FighterAnimationId;
  frameCount: number;
  cellSize: CellSize;
  facing: "right" | "left" | "bidirectional";
  canMirrorFrom: FighterAnimationId | null;
  source: ImagegenSource;
  promptIntent: string;
  constraints: readonly string[];
}

export interface FighterAssetManifest {
  id: string;
  displayName: string;
  engineCharacterId: string;
  archetype: string;
  moroccanDesignNotes: readonly string[];
  asymmetryNotes: readonly string[];
  canonicalReference: ImagegenSource;
  animations: readonly FighterAnimationSpec[];
}

export interface StageLayerSpec {
  id: StageLayerId;
  parallax: number;
  promptIntent: string;
  source: ImagegenSource;
}

export interface StageAssetManifest {
  id: string;
  displayName: string;
  moroccanDesignNotes: readonly string[];
  layers: readonly StageLayerSpec[];
}

export const REQUIRED_FIGHTER_ANIMATIONS: readonly FighterAnimationId[] = [
  "idle",
  "walk-forward",
  "walk-back",
  "crouch",
  "jump",
  "light-punch",
  "heavy-punch",
  "light-kick",
  "special",
  "hitstun",
  "blockstun",
  "knockdown",
  "win",
  "lose",
];

export const DEFAULT_FIGHTER_CELL_SIZE: CellSize = {
  width: 256,
  height: 256,
};
