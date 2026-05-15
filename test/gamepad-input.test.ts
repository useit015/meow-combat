import { describe, expect, it } from "vitest";
import {
  EMPTY_GAMEPAD_INPUT,
  gamepadControlJustPressed,
  gamepadInputFromGamepads,
  type GamepadButtonLike,
  type GamepadLike,
} from "../src/game/gamepadInput";

describe("gamepad input", () => {
  it("returns a neutral state when no connected gamepad exists", () => {
    expect(gamepadInputFromGamepads([null, gamepad({ connected: false })])).toEqual(EMPTY_GAMEPAD_INPUT);
  });

  it("maps standard face buttons and left stick to P1 combat input", () => {
    const input = gamepadInputFromGamepads([
      gamepad({
        axes: [0.8, -0.9],
        buttons: {
          0: true,
          3: true,
          4: true,
        },
      }),
    ]);

    expect(input.connectedGamepads).toBe(1);
    expect(input.horizontal).toBe(1);
    expect(input.vertical).toBe(-1);
    expect(input.buttons).toMatchObject({
      jump: true,
      crouch: false,
      light: true,
      kick: false,
      heavy: false,
      special: true,
      guard: true,
    });
    expect(input.confirm).toBe(true);
    expect(input.start).toBe(false);
    expect(input.pause).toBe(false);
  });

  it("uses d-pad input over analog axes for clean arcade direction reads", () => {
    const input = gamepadInputFromGamepads([
      gamepad({
        axes: [-0.9, 0.9],
        buttons: {
          12: true,
          15: true,
        },
      }),
    ]);

    expect(input.horizontal).toBe(1);
    expect(input.vertical).toBe(-1);
    expect(input.buttons.jump).toBe(true);
    expect(input.buttons.crouch).toBe(false);
  });

  it("keeps south face confirm separate from start and pause controls", () => {
    const previous = gamepadInputFromGamepads([gamepad()]);
    const current = gamepadInputFromGamepads([
      gamepad({
        buttons: {
          0: true,
        },
      }),
    ]);

    expect(current.buttons.light).toBe(true);
    expect(gamepadControlJustPressed(current, previous, "confirm")).toBe(true);
    expect(gamepadControlJustPressed(current, previous, "start")).toBe(false);
    expect(gamepadControlJustPressed(current, previous, "pause")).toBe(false);
    expect(gamepadControlJustPressed(current, current, "confirm")).toBe(false);
  });

  it("maps start, pause, and reset shell controls with just-pressed edges", () => {
    const previous = gamepadInputFromGamepads([gamepad()]);
    const current = gamepadInputFromGamepads([
      gamepad({
        buttons: {
          8: true,
          9: true,
        },
      }),
    ]);

    expect(gamepadControlJustPressed(current, previous, "confirm")).toBe(true);
    expect(gamepadControlJustPressed(current, previous, "start")).toBe(true);
    expect(gamepadControlJustPressed(current, previous, "pause")).toBe(true);
    expect(gamepadControlJustPressed(current, previous, "reset")).toBe(true);
    expect(gamepadControlJustPressed(current, current, "pause")).toBe(false);
  });
});

function gamepad(options: { connected?: boolean; axes?: readonly number[]; buttons?: Record<number, boolean> } = {}): GamepadLike {
  return {
    connected: options.connected ?? true,
    axes: options.axes ?? [0, 0],
    buttons: buttons(options.buttons ?? {}),
  };
}

function buttons(pressedByIndex: Record<number, boolean>): readonly GamepadButtonLike[] {
  return Array.from({ length: 16 }, (_, index) => ({
    pressed: Boolean(pressedByIndex[index]),
    value: pressedByIndex[index] ? 1 : 0,
  }));
}
