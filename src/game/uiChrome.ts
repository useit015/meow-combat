import type { TouchControlId, TouchControlZone } from "./touchControls";

export type TouchChromeShape = "diamond" | "octagon" | "plate";

export interface TouchControlChromeInput {
  id: TouchControlId;
  group: TouchControlZone["group"];
  active: boolean;
  width: number;
  height: number;
}

export interface TouchControlChrome {
  glyph: string;
  shape: TouchChromeShape;
  fill: number;
  stroke: number;
  glow: number;
  fillAlpha: number;
  strokeAlpha: number;
  strokeWidth: number;
  width: number;
  height: number;
}

export interface MeterFillInput {
  x: number;
  y: number;
  width: number;
  height: number;
  ratio: number;
  direction: 1 | -1;
}

export interface MeterFillPlan {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GLYPHS: Readonly<Record<TouchControlId, string>> = {
  left: "<",
  right: ">",
  up: "UP",
  down: "DOWN",
  guard: "GD",
  light: "LP",
  kick: "K",
  heavy: "HP",
  special: "SP",
  start: "GO",
  pause: "II",
  reset: "RST",
  cpu: "CPU",
  difficulty: "LVL",
};

export function touchControlChrome(input: TouchControlChromeInput): TouchControlChrome {
  const activeBoost = input.active ? 1 : 0;
  const directional = isDirectionalControl(input.id);
  const shape = directional ? "diamond" : input.group === "action" ? "octagon" : "plate";
  const fill = input.group === "movement" ? 0x123b36 : input.group === "action" ? 0x14263a : 0x342814;
  const stroke = input.active
    ? 0xfff1a8
    : input.group === "movement"
      ? 0x2ec4b6
      : input.group === "action"
        ? 0x8bd9ff
        : 0xf2cf7d;

  return {
    glyph: directional ? "" : GLYPHS[input.id],
    shape,
    fill,
    stroke,
    glow: input.group === "action" ? 0xff9f1c : input.group === "movement" ? 0x2ec4b6 : 0xfff1a8,
    fillAlpha: input.group === "system" ? 0.48 + activeBoost * 0.24 : 0.46 + activeBoost * 0.28,
    strokeAlpha: 0.62 + activeBoost * 0.3,
    strokeWidth: input.active ? 4 : 2,
    width: input.width,
    height: input.height,
  };
}

export function meterFillPlan(input: MeterFillInput): MeterFillPlan {
  const width = Math.round(input.width * clamp(input.ratio, 0, 1));
  return {
    x: input.direction === 1 ? input.x : input.x + input.width - width,
    y: input.y,
    width,
    height: input.height,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isDirectionalControl(id: TouchControlId): boolean {
  return id === "left" || id === "right" || id === "up" || id === "down";
}
