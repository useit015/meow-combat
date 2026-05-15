import type { Button, CommandId, Facing, InputSnapshot, MobilityCommandId } from "./types";

const BUTTONS: readonly Button[] = ["light", "kick", "heavy", "special", "guard", "jump", "crouch"];

const EMPTY_BUTTONS = Object.freeze({
  light: false,
  kick: false,
  heavy: false,
  special: false,
  guard: false,
  jump: false,
  crouch: false,
});

export function createInput(
  frame: number,
  partial: Partial<Omit<InputSnapshot, "frame" | "buttons">> & {
    buttons?: Partial<Record<Button, boolean>>;
  } = {},
): InputSnapshot {
  const buttons = { ...EMPTY_BUTTONS, ...partial.buttons };
  return {
    frame,
    horizontal: partial.horizontal ?? 0,
    vertical: partial.vertical ?? 0,
    buttons,
  };
}

export class InputBuffer {
  private readonly frames: InputSnapshot[] = [];

  constructor(private readonly maxFrames = 40) {}

  push(input: InputSnapshot): void {
    this.frames.push(input);
    while (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  latest(): InputSnapshot {
    return this.frames.at(-1) ?? createInput(0);
  }

  wasPressed(button: Button, withinFrames = 8): boolean {
    const recent = this.frames.slice(-withinFrames);
    for (let index = recent.length - 1; index >= 0; index -= 1) {
      const current = recent[index];
      const previous = recent[index - 1];
      if (current.buttons[button] && !previous?.buttons[button]) {
        return true;
      }
    }
    return recent.length === 1 && recent[0]?.buttons[button] === true;
  }

  consumeCommand(
    facing: Facing,
    options: { allowNormals?: boolean; canSuper?: boolean } = {},
  ): CommandId | null {
    const allowNormals = options.allowNormals ?? true;
    if (this.wasPressed("special", 8) && this.hasQuarterCircleForward(facing, 24)) {
      return options.canSuper ? "super" : "special";
    }
    if (this.wasPressed("special", 8)) {
      return "special";
    }
    if (!allowNormals) return null;
    if (this.wasPressed("heavy", 8)) {
      return "heavy";
    }
    if (this.wasPressed("kick", 8)) {
      return "lightKick";
    }
    if (this.wasPressed("light", 8)) {
      return "light";
    }
    return null;
  }

  consumeMobilityCommand(facing: Facing): MobilityCommandId | null {
    const latest = this.latest();
    const lightKickChord =
      (latest.buttons.light && this.wasPressed("kick", 5)) || (latest.buttons.kick && this.wasPressed("light", 5));

    if (lightKickChord) {
      return latest.horizontal === -facing ? "rollBack" : "rollForward";
    }

    if (latest.horizontal === facing && this.doubleTapped(facing, 18)) {
      return "runForward";
    }
    if (latest.horizontal === -facing && this.doubleTapped(-facing as Facing, 18)) {
      return "backdash";
    }
    return null;
  }

  directionForLatest(facing: Facing): "forward" | "back" | "neutral" {
    const horizontal = this.latest().horizontal;
    if (horizontal === facing) return "forward";
    if (horizontal === -facing) return "back";
    return "neutral";
  }

  hasQuarterCircleForward(facing: Facing, windowFrames = 24): boolean {
    return this.hasMotion(["down", "downForward", "forward"], facing, windowFrames);
  }

  private hasMotion(
    expected: readonly ("down" | "downForward" | "forward")[],
    facing: Facing,
    windowFrames: number,
  ): boolean {
    let cursor = expected.length - 1;
    const recent = collapseDirections(this.frames.slice(-windowFrames), facing);

    for (let index = recent.length - 1; index >= 0; index -= 1) {
      if (recent[index] === expected[cursor]) {
        cursor -= 1;
        if (cursor < 0) return true;
      }
    }
    return false;
  }

  private doubleTapped(horizontal: Facing, withinFrames: number): boolean {
    const recent = this.frames.slice(-withinFrames);
    const pressFrames: number[] = [];

    for (let index = 0; index < recent.length; index += 1) {
      const current = recent[index];
      const previous = recent[index - 1];
      if (current.horizontal === horizontal && previous?.horizontal !== horizontal) {
        pressFrames.push(current.frame);
      }
    }

    if (pressFrames.length < 2) return false;
    const last = pressFrames.at(-1) ?? 0;
    const previous = pressFrames.at(-2) ?? 0;
    return last - previous <= withinFrames;
  }
}

function collapseDirections(
  frames: readonly InputSnapshot[],
  facing: Facing,
): ("down" | "downForward" | "forward" | "back" | "neutral")[] {
  const tokens: ("down" | "downForward" | "forward" | "back" | "neutral")[] = [];
  for (const frame of frames) {
    const token = directionToken(frame, facing);
    if (tokens.at(-1) !== token) tokens.push(token);
  }
  return tokens;
}

function directionToken(
  frame: InputSnapshot,
  facing: Facing,
): "down" | "downForward" | "forward" | "back" | "neutral" {
  const forward = frame.horizontal === facing;
  const back = frame.horizontal === -facing;
  if (frame.vertical === 1 && forward) return "downForward";
  if (frame.vertical === 1) return "down";
  if (forward) return "forward";
  if (back) return "back";
  return "neutral";
}

export function neutralInput(frame: number): InputSnapshot {
  return createInput(frame);
}

export function buttonsFromKeys(keys: Partial<Record<Button, boolean>>): Record<Button, boolean> {
  return BUTTONS.reduce<Record<Button, boolean>>(
    (acc, button) => ({ ...acc, [button]: Boolean(keys[button]) }),
    { ...EMPTY_BUTTONS },
  );
}
