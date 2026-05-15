import type { AssetReadinessSummary } from "../assets";
import type { CombatEvent, Facing, FighterState } from "../core";

export type ImpactFeedbackCue = {
  kind: "hit" | "block";
  duration: number;
  intensity: number;
  flash: { red: number; green: number; blue: number; alpha: number };
};

export interface FighterVisualSeparationState {
  x: number;
  facing: Facing;
  grounded: boolean;
  state: FighterState;
}

export interface FighterRollMotionState {
  x: number;
  y: number;
  facing: Facing;
  state: FighterState;
  stateFrame: number;
}

export interface FighterRollMotionCue {
  direction: Facing;
  progress: number;
  alpha: number;
  trailX: number;
  leadX: number;
  y: number;
  spriteScale: 1;
}

const VISUAL_SEPARATION_DISTANCE = 112;
const VISUAL_SEPARATION_MAX = 18;
const VISUAL_SEPARATION_SCALE = 0.25;
const ROLL_CUE_FRAMES = 25;

export function impactFeedbackCue(events: readonly CombatEvent[]): ImpactFeedbackCue | null {
  if (events.some((event) => event.type === "hit")) {
    return {
      kind: "hit",
      duration: 130,
      intensity: 0.0055,
      flash: { red: 255, green: 241, blue: 168, alpha: 0.22 },
    };
  }

  if (events.some((event) => event.type === "block")) {
    return {
      kind: "block",
      duration: 80,
      intensity: 0.0028,
      flash: { red: 155, green: 223, blue: 242, alpha: 0.14 },
    };
  }

  return null;
}

export function selectReadinessLines(summary: AssetReadinessSummary): readonly string[] {
  const fallbackCount = summary.runtimeFallbacks.fighterAnimations + summary.runtimeFallbacks.stageLayers;
  const assetLine =
    fallbackCount === 0
      ? `${summary.imagegenJobs.approved} approved runtime art assets`
      : `${summary.runtimeFallbacks.fighterAnimations} fighter fallbacks, ${summary.runtimeFallbacks.stageLayers} stage fallbacks`;
  const pipelineLine =
    summary.imagegenJobs.blocked === 0
      ? "Production art pipeline ready"
      : `${summary.imagegenJobs.blocked} imagegen jobs need OPENAI_API_KEY`;
  const nextLine =
    summary.nextRequiredAssets.length > 0
      ? `Next asset: ${summary.nextRequiredAssets.slice(0, 2).join(", ")}`
      : "No blocked runtime assets";

  return [assetLine, pipelineLine, nextLine];
}

export function fighterVisualSeparationOffset(
  fighter: FighterVisualSeparationState,
  opponent: FighterVisualSeparationState,
): number {
  if (isVisualPassThroughState(fighter) || isVisualPassThroughState(opponent)) return 0;

  const distance = Math.abs(opponent.x - fighter.x);
  const closeOverlap = Math.max(0, VISUAL_SEPARATION_DISTANCE - distance);
  if (closeOverlap === 0) return 0;

  return Math.round(-fighter.facing * Math.min(VISUAL_SEPARATION_MAX, closeOverlap * VISUAL_SEPARATION_SCALE));
}

export function fighterRollMotionCue(fighter: FighterRollMotionState): FighterRollMotionCue | null {
  if (fighter.state !== "rollForward" && fighter.state !== "rollBack") return null;

  const progress = Math.min(1, Math.max(0, fighter.stateFrame / ROLL_CUE_FRAMES));
  const direction = (fighter.state === "rollForward" ? fighter.facing : -fighter.facing) as Facing;
  const alpha = Math.max(0, 0.68 - Math.abs(progress - 0.5) * 0.74);

  return {
    direction,
    progress,
    alpha,
    trailX: fighter.x - direction * (32 + progress * 24),
    leadX: fighter.x + direction * (22 + progress * 18),
    y: fighter.y - 38 + Math.sin(progress * Math.PI) * 4,
    spriteScale: 1,
  };
}

function isVisualPassThroughState(fighter: FighterVisualSeparationState): boolean {
  return !fighter.grounded || fighter.state === "rollForward" || fighter.state === "rollBack";
}
