import { describe, expect, it } from "vitest";
import {
  REQUIRED_FIGHTER_ANIMATIONS,
  buildAssetReadinessSummary,
  fighterAssetManifests,
  stageAssetManifests,
} from "../src/assets";

describe("asset readiness summary", () => {
  it("summarizes blocked imagegen jobs and runtime fallbacks", () => {
    const summary = buildAssetReadinessSummary();
    const expectedFighterJobs = fighterAssetManifests.length * (1 + REQUIRED_FIGHTER_ANIMATIONS.length);
    const expectedStageJobs = stageAssetManifests.reduce((total, stage) => total + stage.layers.length, 0);
    const expectedGeneratedFighterJobs = fighterAssetManifests.length;
    const expectedApprovedFighterRows = fighterAssetManifests.length * REQUIRED_FIGHTER_ANIMATIONS.length;

    expect(summary.imagegenJobs).toEqual({
      total: expectedFighterJobs + expectedStageJobs,
      blocked:
        expectedFighterJobs + expectedStageJobs - expectedGeneratedFighterJobs - expectedApprovedFighterRows - expectedStageJobs,
      generated: expectedGeneratedFighterJobs,
      approved: expectedApprovedFighterRows + expectedStageJobs,
    });
    expect(summary.runtimeFallbacks).toEqual({
      fighterAnimations:
        fighterAssetManifests.length * REQUIRED_FIGHTER_ANIMATIONS.length - expectedApprovedFighterRows,
      stageLayers: 0,
    });
    expect(summary.credentialBlocked).toBe(false);
  });

  it("lists the first assets needed to unblock production art", () => {
    expect(buildAssetReadinessSummary().nextRequiredAssets).toEqual([]);
  });
});
