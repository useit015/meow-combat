export interface SpriteFrameVisualBounds {
  width: number;
  height: number;
}

const MIN_VISUAL_SCALE = 0.82;
const MAX_VISUAL_SCALE = 1.62;

export function spriteReferenceArea(bounds: readonly SpriteFrameVisualBounds[]): number {
  const areas = bounds
    .map((bound) => spriteVisualArea(bound))
    .filter((area) => area > 0)
    .sort((a, b) => a - b);

  return areas[Math.floor(areas.length / 2)] ?? 0;
}

export function spriteVisualScaleForBounds(bounds: SpriteFrameVisualBounds, referenceArea: number): number {
  const area = spriteVisualArea(bounds);
  if (area <= 0 || referenceArea <= 0) return 1;

  return clamp(Math.sqrt(referenceArea / area), MIN_VISUAL_SCALE, MAX_VISUAL_SCALE);
}

function spriteVisualArea(bounds: SpriteFrameVisualBounds): number {
  return Math.max(0, bounds.width) * Math.max(0, bounds.height);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
