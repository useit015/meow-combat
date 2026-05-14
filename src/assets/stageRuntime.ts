import type { AssetGenerationStatus, StageAssetManifest, StageLayerId, StageLayerSpec } from "./types";

export type StageRuntimeLayerKind = "image-layer" | "procedural-fallback";
export type StageFallbackReason = "source-not-approved" | "missing-output-path";

export interface StageRuntimeLayer {
  kind: StageRuntimeLayerKind;
  stageId: string;
  layerId: StageLayerId;
  assetKey: string;
  parallax: number;
  sourceStatus: AssetGenerationStatus;
  outputPath: string | null;
  reason?: StageFallbackReason;
  promptIntent: string;
}

export function resolveStageRuntimeLayers(manifest: StageAssetManifest): readonly StageRuntimeLayer[] {
  return manifest.layers.map((layer) => resolveStageLayer(manifest.id, layer));
}

export function stageLayerAssetKey(stageId: string, layerId: StageLayerId): string {
  return `${stageId}:${layerId}`;
}

function resolveStageLayer(stageId: string, layer: StageLayerSpec): StageRuntimeLayer {
  const base = {
    stageId,
    layerId: layer.id,
    assetKey: stageLayerAssetKey(stageId, layer.id),
    parallax: layer.parallax,
    sourceStatus: layer.source.status,
    outputPath: layer.source.outputPath,
    promptIntent: layer.promptIntent,
  };

  if (layer.source.status === "approved" && layer.source.outputPath) {
    return {
      ...base,
      kind: "image-layer",
    };
  }

  return {
    ...base,
    kind: "procedural-fallback",
    reason: layer.source.status === "approved" ? "missing-output-path" : "source-not-approved",
  };
}
