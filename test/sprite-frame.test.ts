import { describe, expect, it } from "vitest";
import { selectSpriteFrame, selectSpritePose, spriteStanceConventionForAnimation } from "../src/game/spriteFrame";

describe("runtime sprite frame selection", () => {
  it("uses slow intentional loops for idle and walk rows", () => {
    expect(selectSpriteFrame("idle", 0, 8)).toBe(0);
    expect(selectSpriteFrame("idle", 12, 8)).toBe(1);
    expect(selectSpriteFrame("idle", 96, 8)).toBe(6);
    expect(selectSpriteFrame("walk-forward", 20, 8)).toBe(4);
  });

  it("plays attack rows once through startup, contact, and recovery without wrapping", () => {
    expect(selectSpriteFrame("light-punch", 0, 6)).toBe(0);
    expect(selectSpriteFrame("light-punch", 6, 6)).toBe(2);
    expect(selectSpriteFrame("light-punch", 17, 6)).toBe(5);
    expect(selectSpriteFrame("light-punch", 90, 6)).toBe(5);
    expect(selectSpriteFrame("heavy-punch", 14, 8)).toBe(3);
    expect(selectSpritePose("heavy-punch", 15, 8).offsetX).toBeGreaterThan(0);
  });

  it("animates presentation rows intentionally instead of modulo-wrapping recoveries", () => {
    expect(selectSpriteFrame("win", 0, 8)).toBe(1);
    expect(selectSpriteFrame("win", 56, 8)).toBe(5);
    expect(selectSpriteFrame("lose", 999, 6)).toBe(5);
  });

  it("classifies normal rows as upright and reserves grounded rows for defeat reactions", () => {
    expect(spriteStanceConventionForAnimation("idle")).toBe("upright-two-legged");
    expect(spriteStanceConventionForAnimation("light-kick")).toBe("upright-two-legged");
    expect(spriteStanceConventionForAnimation("special")).toBe("upright-two-legged");
    expect(spriteStanceConventionForAnimation("win")).toBe("upright-two-legged");
    expect(spriteStanceConventionForAnimation("knockdown")).toBe("grounded-prone-reaction");
    expect(spriteStanceConventionForAnimation("lose")).toBe("grounded-prone-reaction");
  });
});
