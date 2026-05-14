import { describe, expect, it } from "vitest";
import { buildControlFallbackState } from "../src/game/controlFallback";

describe("control fallback", () => {
  it("points players to keyboard and phone touch when no gamepad is connected", () => {
    expect(
      buildControlFallbackState({
        connectedGamepads: 0,
        gamepadSupported: true,
        touchSupported: true,
      }),
    ).toEqual({
      keyboardSupported: true,
      touchSupported: true,
      gamepadSupported: true,
      connectedGamepads: 0,
      fallbackLine: "NO GAMEPAD?  KEYBOARD / PHONE TOUCH",
    });
  });

  it("reports connected gamepads while keeping keyboard as a supported fallback", () => {
    expect(
      buildControlFallbackState({
        connectedGamepads: 2,
        gamepadSupported: true,
        touchSupported: false,
      }),
    ).toEqual({
      keyboardSupported: true,
      touchSupported: false,
      gamepadSupported: true,
      connectedGamepads: 2,
      fallbackLine: "2 GAMEPAD DETECTED  |  KEYBOARD READY",
    });
  });

  it("gives a clear fallback when the Gamepad API is unavailable", () => {
    expect(
      buildControlFallbackState({
        connectedGamepads: 0,
        gamepadSupported: false,
        touchSupported: false,
      }),
    ).toEqual({
      keyboardSupported: true,
      touchSupported: false,
      gamepadSupported: false,
      connectedGamepads: 0,
      fallbackLine: "GAMEPAD UNAVAILABLE  |  KEYBOARD / PHONE TOUCH",
    });
  });
});
