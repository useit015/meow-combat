import { buttonsFromKeys, type Button, type HorizontalIntent, type VerticalIntent } from "../core";

export type GamepadControlId = "start" | "pause" | "reset";

export type GamepadButtonLike = {
  readonly pressed?: boolean;
  readonly value?: number;
};

export interface GamepadLike {
  readonly connected?: boolean;
  readonly axes?: ArrayLike<number>;
  readonly buttons?: ArrayLike<GamepadButtonLike>;
}

export interface GamepadInputState {
  readonly connectedGamepads: number;
  readonly horizontal: HorizontalIntent;
  readonly vertical: VerticalIntent;
  readonly buttons: Readonly<Record<Button, boolean>>;
  readonly start: boolean;
  readonly pause: boolean;
  readonly reset: boolean;
}

const AXIS_DEADZONE = 0.35;
const BUTTON_PRESSED_VALUE = 0.5;

const enum StandardButton {
  South = 0,
  East = 1,
  West = 2,
  North = 3,
  LeftShoulder = 4,
  RightShoulder = 5,
  LeftTrigger = 6,
  RightTrigger = 7,
  Back = 8,
  Start = 9,
  DpadUp = 12,
  DpadDown = 13,
  DpadLeft = 14,
  DpadRight = 15,
}

export const EMPTY_GAMEPAD_INPUT: GamepadInputState = {
  connectedGamepads: 0,
  horizontal: 0,
  vertical: 0,
  buttons: buttonsFromKeys({}),
  start: false,
  pause: false,
  reset: false,
};

export function gamepadInputFromGamepads(gamepads: readonly (GamepadLike | null | undefined)[]): GamepadInputState {
  const connected = gamepads.filter((gamepad): gamepad is GamepadLike => gamepad?.connected === true);
  const gamepad = connected[0];
  if (!gamepad) return EMPTY_GAMEPAD_INPUT;

  const horizontal = dpadHorizontal(gamepad) || axisDirection(gamepad.axes?.[0] ?? 0);
  const vertical = dpadVertical(gamepad) || axisDirection(gamepad.axes?.[1] ?? 0);

  return {
    connectedGamepads: connected.length,
    horizontal,
    vertical,
    buttons: buttonsFromKeys({
      jump: vertical === -1,
      crouch: vertical === 1,
      light: buttonPressed(gamepad, StandardButton.South),
      kick: buttonPressed(gamepad, StandardButton.East),
      heavy: buttonPressed(gamepad, StandardButton.West),
      special: buttonPressed(gamepad, StandardButton.North),
      guard:
        horizontal === -1 ||
        buttonPressed(gamepad, StandardButton.LeftShoulder) ||
        buttonPressed(gamepad, StandardButton.RightShoulder) ||
        buttonPressed(gamepad, StandardButton.LeftTrigger) ||
        buttonPressed(gamepad, StandardButton.RightTrigger),
    }),
    start: buttonPressed(gamepad, StandardButton.South) || buttonPressed(gamepad, StandardButton.Start),
    pause: buttonPressed(gamepad, StandardButton.Start),
    reset: buttonPressed(gamepad, StandardButton.Back),
  };
}

export function gamepadControlJustPressed(
  current: GamepadInputState,
  previous: GamepadInputState,
  control: GamepadControlId,
): boolean {
  return current[control] && !previous[control];
}

function dpadHorizontal(gamepad: GamepadLike): HorizontalIntent {
  if (buttonPressed(gamepad, StandardButton.DpadRight)) return 1;
  if (buttonPressed(gamepad, StandardButton.DpadLeft)) return -1;
  return 0;
}

function dpadVertical(gamepad: GamepadLike): VerticalIntent {
  if (buttonPressed(gamepad, StandardButton.DpadDown)) return 1;
  if (buttonPressed(gamepad, StandardButton.DpadUp)) return -1;
  return 0;
}

function axisDirection(value: number): -1 | 0 | 1 {
  if (value <= -AXIS_DEADZONE) return -1;
  if (value >= AXIS_DEADZONE) return 1;
  return 0;
}

function buttonPressed(gamepad: GamepadLike, index: number): boolean {
  const button = gamepad.buttons?.[index];
  return Boolean(button?.pressed || (button?.value ?? 0) >= BUTTON_PRESSED_VALUE);
}
