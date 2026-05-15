import { meowtalFighterAssetManifests, meowtalStageAssetManifests } from "./catalog";
import type { MeowtalProductionManifest } from "./meowtalProductionManifest";
import type {
  AssetGenerationStatus,
  FighterAnimationSpec,
  FighterAssetManifest,
  ImagegenSource,
  StageAssetManifest,
} from "./types";

export type ImagegenJobKind = "fighter-canonical" | "fighter-animation-row" | "stage-layer" | "ui-surface";

export interface ImagegenJob {
  id: string;
  kind: ImagegenJobKind;
  subjectId: string;
  promptSlug: string;
  outputPath: string;
  status: AssetGenerationStatus;
  blocker?: string;
  requiredInputs: readonly string[];
  prompt: string;
}

export function buildImagegenJobs(
  fighters: readonly FighterAssetManifest[] = meowtalFighterAssetManifests,
  stages: readonly StageAssetManifest[] = meowtalStageAssetManifests,
): readonly ImagegenJob[] {
  return [...fighters.flatMap(fighterJobs), ...stages.flatMap(stageJobs)];
}

export function buildUiImagegenJobs(
  manifest: Pick<MeowtalProductionManifest, "visualSurfaces">,
): readonly ImagegenJob[] {
  return manifest.visualSurfaces
    .filter((surface) => surface.provenance.medium === "image" && surface.provenance.sourceKind === "codex-imagegen")
    .map((surface) => {
      const provenance = surface.provenance;
      return {
        id: provenance.assetId,
        kind: "ui-surface",
        subjectId: "meowtal-ui",
        promptSlug: provenance.promptSlug,
        outputPath: provenance.sourcePath ?? `assets/source/imagegen/ui/meowtal/${surface.id}.png`,
        status: provenance.status,
        blocker: provenance.blocker ?? undefined,
        requiredInputs: [],
        prompt: [
          provenance.prompt,
          `Runtime contract: produce a 1024x576 PNG source sheet for ${surface.id}.`,
          "Original-view lock: preserve the original view, visual hierarchy, focal scale, and crop-compatible layout used by the current runtime UI.",
          "do not change source sheet dimensions, safe margins, element scale, or primary placement unless the runtime crop specs are updated in the same review.",
          "Constraints: preserve the current Meowtal Kombat arcade UI direction, keep gameplay center readable, no copied fighting-game branding, no watermark, no real brand marks.",
        ].join("\n"),
      } satisfies ImagegenJob;
    });
}

function fighterJobs(manifest: FighterAssetManifest): readonly ImagegenJob[] {
  const canonicalPath =
    manifest.canonicalReference.outputPath ?? `assets/source/imagegen/fighters/${manifest.id}/canonical-reference.png`;
  return [
    sourceJob({
      id: `${manifest.id}:canonical-reference`,
      kind: "fighter-canonical",
      subjectId: manifest.id,
      source: manifest.canonicalReference,
      outputPath: canonicalPath,
      requiredInputs: [],
      prompt: [
        `Create a canonical full-body reference for ${manifest.displayName}, ${manifest.archetype}.`,
        `Design notes: ${manifest.designNotes.join(" ")}`,
        `Asymmetry notes: ${manifest.asymmetryNotes.join(" ")}`,
        "Style target: clean game-production fighter concept, readable silhouette, no text, no logos, no watermark.",
        "Use an original character design and avoid resemblance to existing fighting-game characters.",
      ].join("\n"),
    }),
    ...manifest.animations.map((animation) => animationJob(manifest, animation, canonicalPath)),
  ];
}

function animationJob(
  manifest: FighterAssetManifest,
  animation: FighterAnimationSpec,
  canonicalPath: string,
): ImagegenJob {
  return sourceJob({
    id: `${manifest.id}:${animation.id}`,
    kind: "fighter-animation-row",
    subjectId: manifest.id,
    source: animation.source,
    outputPath: `assets/source/imagegen/fighters/${manifest.id}/${animation.id}.png`,
    requiredInputs: [canonicalPath],
    prompt: [
      `Using the approved canonical reference for ${manifest.displayName}, create a horizontal spritesheet row for ${animation.id}.`,
      `Frame count: ${animation.frameCount}. Cell size: ${animation.cellSize.width}x${animation.cellSize.height}. Facing: ${animation.facing}.`,
      `Motion intent: ${animation.promptIntent}`,
      `Identity requirements: preserve face, outfit, proportions, palette, and silhouette across all frames.`,
      `Constraints: ${animation.constraints.join(" ")}`,
    ].join("\n"),
  });
}

function stageJobs(manifest: StageAssetManifest): readonly ImagegenJob[] {
  return manifest.layers.map((layer) =>
    sourceJob({
      id: `${manifest.id}:${layer.id}`,
      kind: "stage-layer",
      subjectId: manifest.id,
      source: layer.source,
      outputPath: `assets/source/imagegen/stages/${manifest.id}/${layer.id}.png`,
      requiredInputs: [],
      prompt: [
        `Create the ${layer.id} layer for ${manifest.displayName}.`,
        `Design notes: ${manifest.designNotes.join(" ")}`,
        `Layer intent: ${layer.promptIntent}`,
        `Parallax: ${layer.parallax}. Keep the fighting lane readable and avoid text, logos, and real brand marks.`,
      ].join("\n"),
    }),
  );
}

function sourceJob(input: {
  id: string;
  kind: ImagegenJobKind;
  subjectId: string;
  source: ImagegenSource;
  outputPath: string;
  requiredInputs: readonly string[];
  prompt: string;
}): ImagegenJob {
  return {
    id: input.id,
    kind: input.kind,
    subjectId: input.subjectId,
    promptSlug: input.source.promptSlug,
    outputPath: input.outputPath,
    status: input.source.status,
    blocker: input.source.blocker,
    requiredInputs: input.requiredInputs,
    prompt: input.prompt,
  };
}
