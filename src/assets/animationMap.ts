import type { FighterState } from "../core";
import type { FighterAnimationId, FighterAssetManifest, FighterAnimationSpec } from "./types";

export const fighterStateAnimationMap: Readonly<Record<FighterState, FighterAnimationId>> = {
  idle: "idle",
  walkForward: "walk-forward",
  walkBack: "walk-back",
  crouch: "crouch",
  jump: "jump",
  hop: "jump",
  runForward: "walk-forward",
  backdash: "walk-back",
  rollForward: "crouch",
  rollBack: "crouch",
  lightAttack: "light-punch",
  lightKick: "light-kick",
  heavyAttack: "heavy-punch",
  specialAttack: "special",
  superAttack: "special",
  hitstun: "hitstun",
  blockstun: "blockstun",
  knockdown: "knockdown",
};

export interface FighterRenderAsset {
  fighterId: string;
  animationId: FighterAnimationId;
  sourceStatus: FighterAnimationSpec["source"]["status"];
  outputPath: string | null;
  frameCount: number;
  cellSize: FighterAnimationSpec["cellSize"];
  usesProceduralFallback: boolean;
}

export function animationIdForFighterState(state: FighterState): FighterAnimationId {
  return fighterStateAnimationMap[state];
}

export function renderAssetForState(manifest: FighterAssetManifest, state: FighterState): FighterRenderAsset {
  const animationId = animationIdForFighterState(state);
  return renderAssetForAnimationId(manifest, animationId);
}

export function renderAssetForAnimationId(
  manifest: FighterAssetManifest,
  animationId: FighterAnimationId,
): FighterRenderAsset {
  const animation = manifest.animations.find((candidate) => candidate.id === animationId);
  if (!animation) {
    throw new Error(`${manifest.id}: missing animation row for ${animationId}`);
  }

  return {
    fighterId: manifest.id,
    animationId,
    sourceStatus: animation.source.status,
    outputPath: animation.source.outputPath,
    frameCount: animation.frameCount,
    cellSize: animation.cellSize,
    usesProceduralFallback: animation.source.status !== "approved",
  };
}
