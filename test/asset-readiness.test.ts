import { describe, expect, it } from "vitest";
import {
  REQUIRED_FIGHTER_ANIMATIONS,
  buildAssetReadinessSummary,
  fighterAssetManifests,
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  stageAssetManifests,
} from "../src/assets";

describe("asset readiness summary", () => {
  it("summarizes blocked imagegen jobs and runtime fallbacks", () => {
    const summary = buildAssetReadinessSummary();
    const expectedFighterJobs = meowtalFighterAssetManifests.length * (1 + REQUIRED_FIGHTER_ANIMATIONS.length);
    const expectedStageJobs = meowtalStageAssetManifests.reduce((total, stage) => total + stage.layers.length, 0);
    const expectedGeneratedFighterJobs = meowtalFighterAssetManifests.length;
    const expectedApprovedFighterRows = meowtalFighterAssetManifests.length * REQUIRED_FIGHTER_ANIMATIONS.length;

    expect(summary.imagegenJobs).toEqual({
      total: expectedFighterJobs + expectedStageJobs,
      blocked:
        expectedFighterJobs + expectedStageJobs - expectedGeneratedFighterJobs - expectedApprovedFighterRows - expectedStageJobs,
      generated: expectedGeneratedFighterJobs,
      approved: expectedApprovedFighterRows + expectedStageJobs,
    });
    expect(summary.runtimeFallbacks).toEqual({
      fighterAnimations:
        meowtalFighterAssetManifests.length * REQUIRED_FIGHTER_ANIMATIONS.length - expectedApprovedFighterRows,
      stageLayers: 0,
    });
    expect(summary.credentialBlocked).toBe(false);
  });

  it("lists the first assets needed to unblock production art", () => {
    expect(buildAssetReadinessSummary().nextRequiredAssets).toEqual([]);
  });

  it("can still summarize legacy Atlas/Marrakesh manifests explicitly", () => {
    const summary = buildAssetReadinessSummary(fighterAssetManifests, stageAssetManifests);

    expect(summary.imagegenJobs.generated).toBe(fighterAssetManifests.length);
    expect(summary.runtimeFallbacks).toEqual({ fighterAnimations: 0, stageLayers: 0 });
    expect(summary.nextRequiredAssets).toEqual([]);
  });
});
