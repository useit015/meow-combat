import { describe, expect, it } from "vitest";
import {
  spriteReferenceArea,
  spriteVisualScaleForBounds,
  type SpriteFrameVisualBounds,
} from "../src/game/spriteVisualSizing";

describe("runtime sprite visual sizing", () => {
  it("uses the median idle frame area as the stable character-size reference", () => {
    const idleBounds: readonly SpriteFrameVisualBounds[] = [
      { width: 112, height: 236 },
      { width: 128, height: 235 },
      { width: 120, height: 236 },
    ];

    expect(spriteReferenceArea(idleBounds)).toBe(28_320);
  });

  it("compensates compact and oversized frames toward the same perceived character size", () => {
    const referenceArea = 28_320;
    const compactJump = { width: 90, height: 160 };
    const oversizedCrouch = { width: 160, height: 236 };

    const jumpScale = spriteVisualScaleForBounds(compactJump, referenceArea);
    const crouchScale = spriteVisualScaleForBounds(oversizedCrouch, referenceArea);

    expect(jumpScale).toBeGreaterThan(1.3);
    expect(crouchScale).toBeLessThan(0.9);
    expect(Math.round(compactJump.width * compactJump.height * jumpScale * jumpScale)).toBeCloseTo(
      referenceArea,
      -2,
    );
    expect(Math.round(oversizedCrouch.width * oversizedCrouch.height * crouchScale * crouchScale)).toBeCloseTo(
      referenceArea,
      -2,
    );
  });

  it("falls back to neutral scale for empty or invalid alpha bounds", () => {
    expect(spriteVisualScaleForBounds({ width: 0, height: 160 }, 28_320)).toBe(1);
    expect(spriteVisualScaleForBounds({ width: 90, height: 160 }, 0)).toBe(1);
  });
});
