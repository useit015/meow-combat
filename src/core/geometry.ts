import type { Facing, Rect } from "./types";

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function worldRect(local: Rect, x: number, y: number, facing: Facing): Rect {
  const localX = facing === 1 ? local.x : -local.x - local.width;
  return {
    x: x + localX,
    y: y + local.y,
    width: local.width,
    height: local.height,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
