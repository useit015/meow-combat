import { describe, expect, it } from "vitest";
import { meterFillPlan, touchControlChrome } from "../src/game/uiChrome";

describe("ui chrome helpers", () => {
  it("uses compact glyphs instead of long touch-control labels", () => {
    expect(touchControlChrome({ id: "left", group: "movement", active: false, width: 64, height: 64 })).toMatchObject({
      glyph: "",
      shape: "diamond",
    });
    expect(touchControlChrome({ id: "left", group: "system", active: false, width: 74, height: 72 })).toMatchObject({
      glyph: "",
      shape: "diamond",
    });
    expect(touchControlChrome({ id: "special", group: "action", active: false, width: 76, height: 76 })).toMatchObject({
      glyph: "SP",
      shape: "octagon",
    });
    expect(touchControlChrome({ id: "difficulty", group: "system", active: false, width: 92, height: 48 }).glyph.length).toBeLessThanOrEqual(
      4,
    );
  });

  it("makes active controls brighter without changing touch geometry", () => {
    const idle = touchControlChrome({ id: "kick", group: "action", active: false, width: 72, height: 72 });
    const active = touchControlChrome({ id: "kick", group: "action", active: true, width: 72, height: 72 });

    expect(active.fillAlpha).toBeGreaterThan(idle.fillAlpha);
    expect(active.strokeWidth).toBeGreaterThan(idle.strokeWidth);
    expect(active.width).toBe(idle.width);
    expect(active.height).toBe(idle.height);
  });

  it("clamps mirrored meter fill geometry", () => {
    expect(meterFillPlan({ x: 100, y: 40, width: 300, height: 14, ratio: 1.4, direction: 1 })).toMatchObject({
      x: 100,
      width: 300,
    });
    expect(meterFillPlan({ x: 100, y: 40, width: 300, height: 14, ratio: 0.25, direction: -1 })).toMatchObject({
      x: 325,
      width: 75,
    });
    expect(meterFillPlan({ x: 100, y: 40, width: 300, height: 14, ratio: -1, direction: 1 }).width).toBe(0);
  });
});
