import { fighterAssetManifests, stageAssetManifests } from "./catalog";
import { buildImagegenJobs } from "./imagegenJobs";
import { resolveStageRuntimeLayers } from "./stageRuntime";
import type { FighterAssetManifest, StageAssetManifest } from "./types";

export interface AssetReadinessSummary {
  imagegenJobs: {
    total: number;
    blocked: number;
    generated: number;
    approved: number;
  };
  runtimeFallbacks: {
    fighterAnimations: number;
    stageLayers: number;
  };
  credentialBlocked: boolean;
  nextRequiredAssets: readonly string[];
}

export function buildAssetReadinessSummary(
  fighters: readonly FighterAssetManifest[] = fighterAssetManifests,
  stages: readonly StageAssetManifest[] = stageAssetManifests,
): AssetReadinessSummary {
  const jobs = buildImagegenJobs(fighters, stages);
  const stageRuntimeLayers = stages.flatMap((stage) => resolveStageRuntimeLayers(stage));

  return {
    imagegenJobs: {
      total: jobs.length,
      blocked: jobs.filter((job) => job.status === "blocked").length,
      generated: jobs.filter((job) => job.status === "generated").length,
      approved: jobs.filter((job) => job.status === "approved").length,
    },
    runtimeFallbacks: {
      fighterAnimations: fighters.reduce(
        (total, fighter) =>
          total +
          fighter.animations.filter((animation) => animation.source.status !== "approved" || !animation.source.outputPath)
            .length,
        0,
      ),
      stageLayers: stageRuntimeLayers.filter((layer) => layer.kind === "procedural-fallback").length,
    },
    credentialBlocked: jobs.some((job) => job.blocker?.includes("OPENAI_API_KEY")),
    nextRequiredAssets: jobs
      .filter((job) => job.status === "blocked")
      .slice(0, 6)
      .map((job) => job.id),
  };
}
