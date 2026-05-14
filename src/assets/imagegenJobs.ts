import { fighterAssetManifests, stageAssetManifests } from "./catalog";
import type {
  AssetGenerationStatus,
  FighterAnimationSpec,
  FighterAssetManifest,
  ImagegenSource,
  StageAssetManifest,
} from "./types";

export type ImagegenJobKind = "fighter-canonical" | "fighter-animation-row" | "stage-layer";

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
  fighters: readonly FighterAssetManifest[] = fighterAssetManifests,
  stages: readonly StageAssetManifest[] = stageAssetManifests,
): readonly ImagegenJob[] {
  return [...fighters.flatMap(fighterJobs), ...stages.flatMap(stageJobs)];
}

function fighterJobs(manifest: FighterAssetManifest): readonly ImagegenJob[] {
  const canonicalPath = `assets/source/imagegen/fighters/${manifest.id}/canonical-reference.png`;
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
        `Moroccan design notes: ${manifest.moroccanDesignNotes.join(" ")}`,
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
        `Moroccan design notes: ${manifest.moroccanDesignNotes.join(" ")}`,
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
