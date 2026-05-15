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

  it("keeps special attacks on the quality-safe contact frames", () => {
    const selectedFrames = Array.from({ length: 48 }, (_, frame) => selectSpriteFrame("special", frame, 10));

    expect(selectedFrames.slice(0, 42)).not.toContain(2);
    expect(selectedFrames.slice(0, 42)).not.toContain(3);
    expect(selectedFrames.slice(0, 42)).not.toContain(4);
    expect(selectedFrames.slice(0, 42)).not.toContain(5);
    expect(selectedFrames.slice(0, 42)).not.toContain(7);
    expect([
      selectSpriteFrame("special", 0, 10),
      selectSpriteFrame("special", 12, 10),
      selectSpriteFrame("special", 18, 10),
      selectSpriteFrame("special", 30, 10),
      selectSpriteFrame("special", 90, 10),
    ]).toEqual([0, 1, 6, 8, 9]);
  });

  it("uses uniform pose scale so motion accents do not squash or stretch the character", () => {
    const animationIds = [
      "idle",
      "walk-forward",
      "walk-back",
      "jump",
      "light-punch",
      "heavy-punch",
      "light-kick",
      "special",
      "hitstun",
      "blockstun",
      "knockdown",
      "win",
      "lose",
    ] as const;

    for (const animationId of animationIds) {
      for (const stateFrame of [0, 6, 18, 36, 72]) {
        const pose = selectSpritePose(animationId, stateFrame, 10);
        expect(pose.scaleX).toBe(pose.scaleY);
      }
    }
  });

  it("compensates compact jump frames without changing the selected animation frames", () => {
    expect(selectSpriteFrame("jump", 0, 6)).toBe(0);
    expect(selectSpriteFrame("jump", 7, 6)).toBe(1);
    expect(selectSpriteFrame("jump", 21, 6)).toBe(3);
    expect(selectSpriteFrame("jump", 90, 6)).toBe(5);

    expect(selectSpritePose("jump", 0, 6).scaleX).toBeGreaterThan(selectSpritePose("jump", 7, 6).scaleX);
    expect(selectSpritePose("jump", 21, 6).scaleX).toBeGreaterThan(1.25);
    expect(selectSpritePose("jump", 90, 6).scaleX).toBe(selectSpritePose("jump", 0, 6).scaleX);
  });

  it("keeps active strikes at stable character scale while preserving attack motion", () => {
    const heavyPunch = selectSpritePose("heavy-punch", 15, 8);
    const lightKick = selectSpritePose("light-kick", 12, 8);

    expect(heavyPunch.offsetX).toBeGreaterThan(0);
    expect(heavyPunch.scaleX).toBe(1);
    expect(heavyPunch.scaleY).toBe(1);
    expect(lightKick.offsetX).toBeGreaterThan(0);
    expect(lightKick.scaleX).toBe(1);
    expect(lightKick.scaleY).toBe(1);
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
