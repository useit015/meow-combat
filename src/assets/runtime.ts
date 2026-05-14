import type { FighterState } from "../core";
import { renderAssetForState, type FighterRenderAsset } from "./animationMap";
import type { AssetGenerationStatus, CellSize, FighterAnimationId, FighterAssetManifest } from "./types";

export type RuntimeAssetKind = "sprite" | "procedural-fallback";
export type RuntimeFallbackReason = "source-not-approved" | "missing-output-path";

export interface RuntimeSpriteAsset {
  kind: "sprite";
  assetKey: string;
  fighterId: string;
  animationId: FighterAnimationId;
  path: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

export interface RuntimeProceduralFallback {
  kind: "procedural-fallback";
  assetKey: string;
  fighterId: string;
  animationId: FighterAnimationId;
  sourceStatus: AssetGenerationStatus;
  outputPath: string | null;
  reason: RuntimeFallbackReason;
  frameCount: number;
  cellSize: CellSize;
}

export type FighterRuntimeAsset = RuntimeSpriteAsset | RuntimeProceduralFallback;

export function resolveFighterRuntimeAsset(asset: FighterRenderAsset): FighterRuntimeAsset {
  const assetKey = runtimeAssetKey(asset.fighterId, asset.animationId);

  if (asset.sourceStatus === "approved" && asset.outputPath) {
    return {
      kind: "sprite",
      assetKey,
      fighterId: asset.fighterId,
      animationId: asset.animationId,
      path: asset.outputPath,
      frameCount: asset.frameCount,
      frameWidth: asset.cellSize.width,
      frameHeight: asset.cellSize.height,
    };
  }

  return {
    kind: "procedural-fallback",
    assetKey,
    fighterId: asset.fighterId,
    animationId: asset.animationId,
    sourceStatus: asset.sourceStatus,
    outputPath: asset.outputPath,
    reason: asset.sourceStatus === "approved" ? "missing-output-path" : "source-not-approved",
    frameCount: asset.frameCount,
    cellSize: asset.cellSize,
  };
}

export function resolveManifestRuntimeAsset(
  manifest: FighterAssetManifest,
  state: FighterState,
): FighterRuntimeAsset {
  return resolveFighterRuntimeAsset(renderAssetForState(manifest, state));
}

export function runtimeAssetKey(fighterId: string, animationId: FighterAnimationId): string {
  return `${fighterId}:${animationId}`;
}
