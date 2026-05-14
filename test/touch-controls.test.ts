import { describe, expect, it } from "vitest";
import {
  touchControlAtPoint,
  touchControlJustPressed,
  touchControlZonesForPhase,
  touchControlsVisibleForViewport,
  touchInputFromControls,
} from "../src/game/touchControls";

describe("touch controls", () => {
  it("uses shell zones for start/reset and fight zones for full combat input", () => {
    expect(touchControlZonesForPhase("ready").map((zone) => zone.id)).toEqual(["start", "reset"]);
    expect(touchControlZonesForPhase("paused").map((zone) => zone.id)).toEqual(["start", "pause", "reset"]);
    expect(touchControlZonesForPhase("fighting").map((zone) => zone.id)).toEqual([
      "left",
      "right",
      "up",
      "down",
      "guard",
      "light",
      "kick",
      "heavy",
      "special",
      "pause",
      "reset",
    ]);
  });

  it("maps touch zones to the same input shape as keyboard controls", () => {
    expect(touchInputFromControls(["right", "up", "light", "special"])).toMatchObject({
      horizontal: 1,
      vertical: -1,
      buttons: {
        jump: true,
        crouch: false,
        light: true,
        kick: false,
        heavy: false,
        special: true,
        guard: false,
      },
    });

    expect(touchInputFromControls(["left"]).buttons.guard).toBe(true);
    expect(touchInputFromControls(["left", "right"]).horizontal).toBe(0);
    expect(touchInputFromControls(["up", "down"]).vertical).toBe(0);
  });

  it("hit-tests control zones and detects just-pressed system controls", () => {
    const zones = touchControlZonesForPhase("fighting");

    expect(touchControlAtPoint(zones, { x: 70, y: 460 })).toBe("left");
    expect(touchControlAtPoint(zones, { x: 952, y: 492 })).toBe("special");
    expect(touchControlAtPoint(zones, { x: 500, y: 200 })).toBeNull();
    expect(touchControlJustPressed(new Set(["start"]), new Set(), "start")).toBe(true);
    expect(touchControlJustPressed(new Set(["start"]), new Set(["start"]), "start")).toBe(false);
  });

  it("shows touch controls on narrow, portrait, or coarse-pointer viewports", () => {
    expect(touchControlsVisibleForViewport({ width: 390, height: 844 }, false)).toBe(true);
    expect(touchControlsVisibleForViewport({ width: 844, height: 390 }, false)).toBe(false);
    expect(touchControlsVisibleForViewport({ width: 1024, height: 576 }, true)).toBe(true);
  });
});
