import { REQUIRED_FIGHTER_ANIMATIONS, type FighterAssetManifest, type StageAssetManifest } from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: readonly string[];
}

export function validateFighterManifest(manifest: FighterAssetManifest): ValidationResult {
  const errors: string[] = [];
  if (!manifest.id.trim()) errors.push("fighter id is required");
  if (!manifest.engineCharacterId.trim()) errors.push(`${manifest.id}: engineCharacterId is required`);
  if (manifest.canonicalReference.status === "generated" && !manifest.canonicalReference.outputPath) {
    errors.push(`${manifest.id}: generated canonical reference needs an outputPath`);
  }

  const animationIds = new Set(manifest.animations.map((animation) => animation.id));
  for (const required of REQUIRED_FIGHTER_ANIMATIONS) {
    if (!animationIds.has(required)) errors.push(`${manifest.id}: missing animation ${required}`);
  }

  for (const animation of manifest.animations) {
    if (animation.frameCount <= 0) errors.push(`${manifest.id}/${animation.id}: frameCount must be positive`);
    if (animation.cellSize.width < 128 || animation.cellSize.height < 128) {
      errors.push(`${manifest.id}/${animation.id}: cell size is too small for production fighter sprites`);
    }
    if (animation.source.status === "generated" && !animation.source.outputPath) {
      errors.push(`${manifest.id}/${animation.id}: generated animation row needs an outputPath`);
    }
    if (animation.canMirrorFrom && manifest.asymmetryNotes.length > 0) {
      errors.push(`${manifest.id}/${animation.id}: mirroring is not allowed before asymmetry review`);
    }
    if (!animation.constraints.some((constraint) => constraint.includes("No logos"))) {
      errors.push(`${manifest.id}/${animation.id}: missing logo/text/watermark constraint`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validateStageManifest(manifest: StageAssetManifest): ValidationResult {
  const errors: string[] = [];
  if (!manifest.id.trim()) errors.push("stage id is required");
  if (manifest.layers.length < 3) errors.push(`${manifest.id}: stage should define at least 3 parallax layers`);
  for (const layer of manifest.layers) {
    if (!layer.promptIntent.trim()) errors.push(`${manifest.id}/${layer.id}: promptIntent is required`);
    if (layer.parallax <= 0) errors.push(`${manifest.id}/${layer.id}: parallax must be positive`);
    if (layer.source.status === "generated" && !layer.source.outputPath) {
      errors.push(`${manifest.id}/${layer.id}: generated layer needs an outputPath`);
    }
  }
  return { ok: errors.length === 0, errors };
}
