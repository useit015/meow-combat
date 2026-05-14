import type { AssetReadinessSummary } from "../assets";
import type { CombatEvent } from "../core";

export type ImpactFeedbackCue = {
  kind: "hit" | "block";
  duration: number;
  intensity: number;
  flash: { red: number; green: number; blue: number; alpha: number };
};

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
