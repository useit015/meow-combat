import type { Button, HorizontalIntent, VerticalIntent } from "../core";

export type TouchControlId =
  | "left"
  | "right"
  | "up"
  | "down"
  | "guard"
  | "light"
  | "kick"
  | "heavy"
  | "special"
  | "start"
  | "pause"
  | "reset";

export type TouchShellPhase = "ready" | "select" | "fighting" | "paused" | "round-over" | "match-over";

export interface TouchControlZone {
  id: TouchControlId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  group: "system" | "movement" | "action";
}

export interface TouchInputSnapshot {
  horizontal: HorizontalIntent;
  vertical: VerticalIntent;
  buttons: Partial<Record<Button, boolean>>;
  activeIds: readonly TouchControlId[];
}

export interface TouchViewport {
  width: number;
  height: number;
}

export const TOUCH_CONTROL_IDS = [
  "left",
  "right",
  "up",
  "down",
  "guard",
  "light",
  "kick",
  "heavy",
  "special",
  "start",
  "pause",
  "reset",
] as const satisfies readonly TouchControlId[];

const SHELL_ZONES: readonly TouchControlZone[] = [
  { id: "start", label: "GO", x: 402, y: 416, width: 220, height: 72, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 88, width: 86, height: 46, group: "system" },
];

const FIGHT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "L", x: 44, y: 438, width: 74, height: 74, group: "movement" },
  { id: "right", label: "R", x: 148, y: 438, width: 74, height: 74, group: "movement" },
  { id: "up", label: "UP", x: 96, y: 356, width: 74, height: 66, group: "movement" },
  { id: "down", label: "DN", x: 96, y: 520, width: 74, height: 46, group: "movement" },
  { id: "guard", label: "G", x: 766, y: 460, width: 66, height: 66, group: "action" },
  { id: "light", label: "LP", x: 844, y: 396, width: 66, height: 66, group: "action" },
  { id: "kick", label: "K", x: 922, y: 354, width: 66, height: 66, group: "action" },
  { id: "heavy", label: "HP", x: 844, y: 508, width: 66, height: 58, group: "action" },
  { id: "special", label: "SP", x: 934, y: 462, width: 66, height: 66, group: "action" },
  { id: "pause", label: "II", x: 910, y: 82, width: 74, height: 44, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 82, width: 86, height: 44, group: "system" },
];

const PAUSED_ZONES: readonly TouchControlZone[] = [
  { id: "start", label: "GO", x: 402, y: 286, width: 220, height: 64, group: "system" },
  { id: "pause", label: "II", x: 910, y: 82, width: 74, height: 44, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 82, width: 86, height: 44, group: "system" },
];

export function touchControlZonesForPhase(phase: TouchShellPhase): readonly TouchControlZone[] {
  if (phase === "fighting") return FIGHT_ZONES;
  if (phase === "paused") return PAUSED_ZONES;
  return SHELL_ZONES;
}

export function touchInputFromControls(controlIds: Iterable<TouchControlId>): TouchInputSnapshot {
  const active = new Set(controlIds);
  const horizontal = active.has("left") === active.has("right") ? 0 : active.has("left") ? -1 : 1;
  const vertical = active.has("up") === active.has("down") ? 0 : active.has("up") ? -1 : 1;

  return {
    horizontal: horizontal as HorizontalIntent,
    vertical: vertical as VerticalIntent,
    buttons: {
      jump: active.has("up"),
      crouch: active.has("down"),
      light: active.has("light"),
      kick: active.has("kick"),
      heavy: active.has("heavy"),
      special: active.has("special"),
      guard: active.has("guard") || active.has("left"),
    },
    activeIds: [...active].sort(),
  };
}

export function touchControlAtPoint(
  zones: readonly TouchControlZone[],
  point: { x: number; y: number },
): TouchControlId | null {
  const zone = [...zones].reverse().find((candidate) => pointInZone(point, candidate));
  return zone?.id ?? null;
}

export function touchControlJustPressed(
  current: ReadonlySet<TouchControlId>,
  previous: ReadonlySet<TouchControlId>,
  id: TouchControlId,
): boolean {
  return current.has(id) && !previous.has(id);
}

export function touchControlsVisibleForViewport(viewport: TouchViewport, coarsePointer: boolean): boolean {
  return coarsePointer || viewport.width <= 720 || viewport.height > viewport.width;
}

function pointInZone(point: { x: number; y: number }, zone: TouchControlZone): boolean {
  return point.x >= zone.x && point.x <= zone.x + zone.width && point.y >= zone.y && point.y <= zone.y + zone.height;
}
