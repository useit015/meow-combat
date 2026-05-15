import { describe, expect, it } from "vitest";
import {
  touchControlAtPoint,
  touchControlLayoutForViewport,
  touchControlJustPressed,
  touchControlZonesForPhase,
  touchControlsVisibleForViewport,
  touchInputFromControls,
} from "../src/game/touchControls";

describe("touch controls", () => {
  it("uses shell zones for start/reset and fight zones for full combat input", () => {
    expect(touchControlZonesForPhase("ready").map((zone) => zone.id)).toEqual(["start", "reset"]);
    expect(touchControlZonesForPhase("paused").map((zone) => zone.id)).toEqual(["reset", "cpu", "difficulty", "pause"]);
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

    expect(touchInputFromControls(["guard"])).toMatchObject({
      horizontal: 0,
      vertical: 0,
      buttons: { guard: true },
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

  it("selects larger phone layouts for portrait and coarse landscape devices", () => {
    expect(touchControlLayoutForViewport({ width: 390, height: 844 }, false)).toBe("phone-portrait");
    expect(touchControlLayoutForViewport({ width: 844, height: 390 }, true)).toBe("phone-landscape");
    expect(touchControlLayoutForViewport({ width: 1024, height: 576 }, false)).toBe("standard");

    const portraitZones = touchControlZonesForPhase("fighting", "phone-portrait");
    const portraitActionTargets = portraitZones.filter((zone) => zone.group !== "system");
    expect(Math.min(...portraitActionTargets.map((zone) => Math.min(zone.width, zone.height)))).toBeGreaterThanOrEqual(50);
    expect(Math.max(...portraitActionTargets.map((zone) => zone.y + zone.height))).toBeLessThanOrEqual(554);

    const landscapeZones = touchControlZonesForPhase("fighting", "phone-landscape");
    expect(Math.max(...landscapeZones.map((zone) => zone.y + zone.height))).toBeLessThanOrEqual(552);
    expect(touchControlZonesForPhase("ready", "phone-portrait").find((zone) => zone.id === "start")?.width).toBeGreaterThan(
      touchControlZonesForPhase("ready").find((zone) => zone.id === "start")?.width ?? 0,
    );
  });

  it("keeps fighting touch controls inside the game canvas without same-group overlap", () => {
    for (const layout of ["standard", "phone-portrait", "phone-landscape"] as const) {
      const zones = touchControlZonesForPhase("fighting", layout);

      for (const zone of zones) {
        expect(zone.x).toBeGreaterThanOrEqual(0);
        expect(zone.y).toBeGreaterThanOrEqual(0);
        expect(zone.x + zone.width).toBeLessThanOrEqual(1024);
        expect(zone.y + zone.height).toBeLessThanOrEqual(576);
        if (zone.group !== "system") {
          expect(Math.min(zone.width, zone.height), `${layout} ${zone.id} target size`).toBeGreaterThanOrEqual(52);
        }
      }

      for (let a = 0; a < zones.length; a += 1) {
        for (let b = a + 1; b < zones.length; b += 1) {
          const first = zones[a];
          const second = zones[b];
          if (first.group === "system" || first.group !== second.group) continue;
          expect(zonesOverlap(first, second), `${layout} ${first.id} overlaps ${second.id}`).toBe(false);
        }
      }
    }
  });

  it("keeps paused controls out of the pause menu panel", () => {
    const pausePanel = { x: 326, y: 132, width: 372, height: 314 };
    for (const layout of ["standard", "phone-portrait", "phone-landscape"] as const) {
      const zones = touchControlZonesForPhase("paused", layout);
      expect(zones.map((zone) => zone.id)).toEqual(["reset", "cpu", "difficulty", "pause"]);
      expect(zones.some((zone) => zonesOverlap(zone, pausePanel))).toBe(false);
      for (const zone of zones) {
        expect(zone.x).toBeGreaterThanOrEqual(0);
        expect(zone.y).toBeGreaterThanOrEqual(0);
        expect(zone.x + zone.width).toBeLessThanOrEqual(1024);
        expect(zone.y + zone.height).toBeLessThanOrEqual(576);
        expect(Math.min(zone.width, zone.height), `${layout} ${zone.id} target size`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

function zonesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
