import type { AssetReadinessSummary } from "../assets";
import type { CombatEvent, Facing, FighterState } from "../core";
import type { CombatFeedbackTier } from "./effects";

export type ImpactFeedbackCue = {
  kind: "hit" | "block";
  tier: CombatFeedbackTier;
  label: string;
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

export interface FighterMobilityMotionCue {
  kind: "run" | "backdash" | "hop";
  direction: Facing;
  progress: number;
  alpha: number;
  trailX: number;
  leadX: number;
  y: number;
  dustY: number;
  spriteScale: 1;
}

const VISUAL_SEPARATION_DISTANCE = 112;
const VISUAL_SEPARATION_MAX = 18;
const VISUAL_SEPARATION_SCALE = 0.25;
const ROLL_CUE_FRAMES = 25;
const MOBILITY_CUE_FRAMES = 24;

export function impactFeedbackCue(events: readonly CombatEvent[]): ImpactFeedbackCue | null {
  const strongestHit = strongestCombatEvent(events, "hit");
  if (strongestHit) {
    const tier = feedbackTierForMove(strongestHit.move);
    return {
      kind: "hit",
      tier,
      label: feedbackLabel("hit", tier),
      duration: tier === "super" ? 170 : tier === "special" ? 150 : tier === "heavy" ? 140 : 130,
      intensity: tier === "super" ? 0.0072 : tier === "special" ? 0.0064 : tier === "heavy" ? 0.006 : 0.0055,
      flash:
        tier === "super"
          ? { red: 255, green: 241, blue: 168, alpha: 0.3 }
          : tier === "special"
            ? { red: 143, green: 255, blue: 208, alpha: 0.24 }
            : { red: 255, green: 241, blue: 168, alpha: 0.22 },
    };
  }

  const strongestBlock = strongestCombatEvent(events, "block");
  if (strongestBlock) {
    const tier = feedbackTierForMove(strongestBlock.move);
    return {
      kind: "block",
      tier,
      label: feedbackLabel("block", tier),
      duration: tier === "heavy" ? 96 : 80,
      intensity: tier === "heavy" ? 0.0034 : 0.0028,
      flash: { red: 155, green: 223, blue: 242, alpha: tier === "heavy" ? 0.17 : 0.14 },
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

export function fighterMobilityMotionCue(fighter: FighterRollMotionState): FighterMobilityMotionCue | null {
  if (fighter.state !== "runForward" && fighter.state !== "backdash" && fighter.state !== "hop") return null;

  const progress = Math.min(1, Math.max(0, fighter.stateFrame / MOBILITY_CUE_FRAMES));
  const kind = fighter.state === "hop" ? "hop" : fighter.state === "backdash" ? "backdash" : "run";
  const direction = (fighter.state === "backdash" ? -fighter.facing : fighter.facing) as Facing;
  const centerPulse = Math.sin(progress * Math.PI);
  const alpha = Math.max(0, (kind === "hop" ? 0.72 : 0.82) * centerPulse);
  const travel = kind === "hop" ? 46 : kind === "backdash" ? 58 : 68;
  const lift = kind === "hop" ? 56 + centerPulse * 10 : 76;

  return {
    kind,
    direction,
    progress,
    alpha,
    trailX: fighter.x - direction * (travel + progress * 22),
    leadX: fighter.x + direction * (18 + progress * 18),
    y: fighter.y - lift,
    dustY: fighter.y + (kind === "hop" ? 30 : -8),
    spriteScale: 1,
  };
}

function isVisualPassThroughState(fighter: FighterVisualSeparationState): boolean {
  return !fighter.grounded || fighter.state === "rollForward" || fighter.state === "rollBack";
}

function strongestCombatEvent(events: readonly CombatEvent[], kind: "hit" | "block"): Extract<CombatEvent, { type: "hit" | "block" }> | null {
  return events
    .filter((event): event is Extract<CombatEvent, { type: "hit" | "block" }> => event.type === kind)
    .sort((a, b) => feedbackTierScore(feedbackTierForMove(b.move)) - feedbackTierScore(feedbackTierForMove(a.move)))[0] ?? null;
}

function feedbackTierForMove(move: Extract<CombatEvent, { move: string }>["move"]): CombatFeedbackTier {
  if (move === "super") return "super";
  if (move === "special") return "special";
  if (move === "heavy") return "heavy";
  return "light";
}

function feedbackTierScore(tier: CombatFeedbackTier): number {
  if (tier === "super") return 4;
  if (tier === "special") return 3;
  if (tier === "heavy") return 2;
  return 1;
}

function feedbackLabel(kind: "hit" | "block", tier: CombatFeedbackTier): string {
  if (kind === "block") return tier === "heavy" ? "HEAVY BLOCK" : "BLOCK";
  if (tier === "super") return "SUPER";
  if (tier === "special") return "SPECIAL";
  if (tier === "heavy") return "HEAVY";
  return "HIT";
}
