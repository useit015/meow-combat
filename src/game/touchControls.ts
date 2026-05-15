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
  | "reset"
  | "cpu"
  | "difficulty";

export type TouchShellPhase = "ready" | "mode-select" | "select" | "fighting" | "paused" | "round-over" | "match-over";
export type TouchControlLayout = "standard" | "phone-portrait" | "phone-landscape";

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
  "cpu",
  "difficulty",
] as const satisfies readonly TouchControlId[];

const SHELL_ZONES: readonly TouchControlZone[] = [
  { id: "start", label: "GO", x: 402, y: 416, width: 220, height: 72, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 88, width: 86, height: 46, group: "system" },
];

const MODE_SELECT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "<", x: 304, y: 286, width: 86, height: 72, group: "system" },
  { id: "right", label: ">", x: 634, y: 286, width: 86, height: 72, group: "system" },
  { id: "start", label: "GO", x: 402, y: 416, width: 220, height: 72, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 88, width: 86, height: 46, group: "system" },
];

const PORTRAIT_SHELL_ZONES: readonly TouchControlZone[] = [
  { id: "start", label: "GO", x: 350, y: 386, width: 324, height: 104, group: "system" },
  { id: "reset", label: "RST", x: 34, y: 82, width: 112, height: 52, group: "system" },
];

const PORTRAIT_MODE_SELECT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "<", x: 296, y: 278, width: 104, height: 88, group: "system" },
  { id: "right", label: ">", x: 624, y: 278, width: 104, height: 88, group: "system" },
  { id: "start", label: "GO", x: 350, y: 386, width: 324, height: 104, group: "system" },
  { id: "reset", label: "RST", x: 34, y: 82, width: 112, height: 52, group: "system" },
];

const FIGHT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "L", x: 44, y: 438, width: 74, height: 74, group: "movement" },
  { id: "right", label: "R", x: 148, y: 438, width: 74, height: 74, group: "movement" },
  { id: "up", label: "UP", x: 96, y: 356, width: 74, height: 66, group: "movement" },
  { id: "down", label: "DN", x: 96, y: 514, width: 74, height: 52, group: "movement" },
  { id: "guard", label: "G", x: 766, y: 460, width: 66, height: 66, group: "action" },
  { id: "light", label: "LP", x: 844, y: 396, width: 66, height: 66, group: "action" },
  { id: "kick", label: "K", x: 922, y: 354, width: 66, height: 66, group: "action" },
  { id: "heavy", label: "HP", x: 844, y: 508, width: 66, height: 58, group: "action" },
  { id: "special", label: "SP", x: 934, y: 462, width: 66, height: 66, group: "action" },
  { id: "pause", label: "II", x: 910, y: 82, width: 74, height: 44, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 82, width: 86, height: 44, group: "system" },
];

const PORTRAIT_FIGHT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "L", x: 36, y: 386, width: 112, height: 80, group: "movement" },
  { id: "right", label: "R", x: 174, y: 386, width: 112, height: 80, group: "movement" },
  { id: "up", label: "UP", x: 105, y: 296, width: 112, height: 80, group: "movement" },
  { id: "down", label: "DN", x: 105, y: 474, width: 112, height: 80, group: "movement" },
  { id: "guard", label: "G", x: 706, y: 420, width: 98, height: 84, group: "action" },
  { id: "light", label: "LP", x: 812, y: 342, width: 98, height: 84, group: "action" },
  { id: "kick", label: "K", x: 918, y: 304, width: 90, height: 84, group: "action" },
  { id: "heavy", label: "HP", x: 812, y: 474, width: 98, height: 80, group: "action" },
  { id: "special", label: "SP", x: 918, y: 408, width: 90, height: 84, group: "action" },
  { id: "pause", label: "II", x: 902, y: 82, width: 86, height: 46, group: "system" },
  { id: "reset", label: "RST", x: 34, y: 82, width: 112, height: 46, group: "system" },
];

const LANDSCAPE_FIGHT_ZONES: readonly TouchControlZone[] = [
  { id: "left", label: "L", x: 38, y: 414, width: 82, height: 66, group: "movement" },
  { id: "right", label: "R", x: 150, y: 414, width: 82, height: 66, group: "movement" },
  { id: "up", label: "UP", x: 94, y: 334, width: 82, height: 72, group: "movement" },
  { id: "down", label: "DN", x: 94, y: 488, width: 82, height: 64, group: "movement" },
  { id: "guard", label: "G", x: 746, y: 430, width: 72, height: 72, group: "action" },
  { id: "light", label: "LP", x: 832, y: 362, width: 72, height: 72, group: "action" },
  { id: "kick", label: "K", x: 920, y: 326, width: 72, height: 72, group: "action" },
  { id: "heavy", label: "HP", x: 832, y: 486, width: 72, height: 66, group: "action" },
  { id: "special", label: "SP", x: 922, y: 424, width: 72, height: 72, group: "action" },
  { id: "pause", label: "II", x: 910, y: 82, width: 74, height: 44, group: "system" },
  { id: "reset", label: "RST", x: 42, y: 82, width: 86, height: 44, group: "system" },
];

const PAUSED_ZONES: readonly TouchControlZone[] = [
  { id: "reset", label: "RST", x: 42, y: 82, width: 86, height: 44, group: "system" },
  { id: "cpu", label: "CPU", x: 154, y: 82, width: 92, height: 44, group: "system" },
  { id: "difficulty", label: "LVL", x: 778, y: 82, width: 92, height: 44, group: "system" },
  { id: "pause", label: "II", x: 910, y: 82, width: 74, height: 44, group: "system" },
];

const PORTRAIT_PAUSED_ZONES: readonly TouchControlZone[] = [
  { id: "reset", label: "RST", x: 34, y: 82, width: 112, height: 46, group: "system" },
  { id: "cpu", label: "CPU", x: 170, y: 82, width: 112, height: 46, group: "system" },
  { id: "difficulty", label: "LVL", x: 746, y: 82, width: 112, height: 46, group: "system" },
  { id: "pause", label: "II", x: 902, y: 82, width: 86, height: 46, group: "system" },
];

export function touchControlZonesForPhase(
  phase: TouchShellPhase,
  layout: TouchControlLayout = "standard",
): readonly TouchControlZone[] {
  if (phase === "fighting") {
    if (layout === "phone-portrait") return PORTRAIT_FIGHT_ZONES;
    if (layout === "phone-landscape") return LANDSCAPE_FIGHT_ZONES;
    return FIGHT_ZONES;
  }
  if (phase === "paused" && layout === "phone-portrait") return PORTRAIT_PAUSED_ZONES;
  if (phase === "paused") return PAUSED_ZONES;
  if (phase === "mode-select" && layout === "phone-portrait") return PORTRAIT_MODE_SELECT_ZONES;
  if (phase === "mode-select") return MODE_SELECT_ZONES;
  if (layout === "phone-portrait") return PORTRAIT_SHELL_ZONES;
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

export function touchControlLayoutForViewport(viewport: TouchViewport, coarsePointer: boolean): TouchControlLayout {
  if (viewport.height > viewport.width) return "phone-portrait";
  if (coarsePointer && viewport.height <= 520) return "phone-landscape";
  return "standard";
}

function pointInZone(point: { x: number; y: number }, zone: TouchControlZone): boolean {
  return point.x >= zone.x && point.x <= zone.x + zone.width && point.y >= zone.y && point.y <= zone.y + zone.height;
}
