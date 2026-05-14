import { describe, expect, it } from "vitest";
import {
  REQUIRED_FIGHTER_ANIMATIONS,
  buildImagegenJobs,
  fighterAssetManifests,
  stageAssetManifests,
} from "../src/assets";

describe("imagegen jobs", () => {
  it("creates deterministic jobs for every fighter reference, animation row, and stage layer", () => {
    const jobs = buildImagegenJobs();
    const expectedFighterJobs = fighterAssetManifests.length * (1 + REQUIRED_FIGHTER_ANIMATIONS.length);
    const expectedStageJobs = stageAssetManifests.reduce((total, stage) => total + stage.layers.length, 0);

    expect(jobs).toHaveLength(expectedFighterJobs + expectedStageJobs);
    expect(new Set(jobs.map((job) => job.id)).size).toBe(jobs.length);
    expect(new Set(jobs.map((job) => job.promptSlug)).size).toBe(jobs.length);
  });

  it("keeps animation rows grounded in canonical fighter references", () => {
    const rowJobs = buildImagegenJobs().filter((job) => job.kind === "fighter-animation-row");

    expect(rowJobs.length).toBeGreaterThan(0);
    for (const job of rowJobs) {
      expect(job.requiredInputs).toHaveLength(1);
      expect(job.requiredInputs[0]).toContain("/canonical-reference.png");
      expect(job.outputPath).toMatch(/^assets\/source\/imagegen\/fighters\/.+\/.+\.png$/);
      expect(job.prompt).toContain("horizontal spritesheet row");
      expect(job.prompt).toContain("preserve face, outfit, proportions, palette, and silhouette");
    }
  });

  it("marks Codex-generated references and approved runtime rows distinctly", () => {
    const jobs = buildImagegenJobs();
    const generatedJobs = jobs.filter((job) => job.status === "generated");
    const approvedJobs = jobs.filter((job) => job.status === "approved");
    const blockedJobs = jobs.filter((job) => job.status === "blocked");

    expect(generatedJobs.map((job) => job.id).sort()).toEqual([
      "atlas-lion:canonical-reference",
      "sahara-viper:canonical-reference",
    ]);
    expect(approvedJobs.map((job) => job.id).sort()).toEqual([
      "atlas-lion:blockstun",
      "atlas-lion:crouch",
      "atlas-lion:heavy-punch",
      "atlas-lion:hitstun",
      "atlas-lion:idle",
      "atlas-lion:jump",
      "atlas-lion:knockdown",
      "atlas-lion:light-kick",
      "atlas-lion:light-punch",
      "atlas-lion:lose",
      "atlas-lion:special",
      "atlas-lion:walk-back",
      "atlas-lion:walk-forward",
      "atlas-lion:win",
      "marrakesh-rooftop:far-architecture",
      "marrakesh-rooftop:foreground-props",
      "marrakesh-rooftop:playfield",
      "marrakesh-rooftop:sky",
      "sahara-viper:blockstun",
      "sahara-viper:crouch",
      "sahara-viper:heavy-punch",
      "sahara-viper:hitstun",
      "sahara-viper:idle",
      "sahara-viper:jump",
      "sahara-viper:knockdown",
      "sahara-viper:light-kick",
      "sahara-viper:light-punch",
      "sahara-viper:lose",
      "sahara-viper:special",
      "sahara-viper:walk-back",
      "sahara-viper:walk-forward",
      "sahara-viper:win",
    ]);
    for (const job of generatedJobs) {
      expect(job.blocker).toBeUndefined();
      if (job.kind === "stage-layer") {
        expect(job.outputPath).toMatch(/^assets\/source\/imagegen\/stages\/.+\/.+\.png$/);
      } else {
        expect(job.outputPath).toMatch(/^assets\/source\/imagegen\/fighters\/.+\/.+\.png$/);
      }
    }
    for (const job of approvedJobs) {
      expect(job.blocker).toBeUndefined();
      if (job.kind === "stage-layer") {
        expect(job.outputPath).toMatch(/^assets\/source\/imagegen\/stages\/.+\/.+\.png$/);
      } else {
        expect(job.outputPath).toMatch(/^assets\/source\/imagegen\/fighters\/.+\/.+\.png$/);
      }
    }
    expect(blockedJobs).toHaveLength(jobs.length - generatedJobs.length - approvedJobs.length);
    for (const job of blockedJobs) {
      expect(job.status).toBe("blocked");
      expect(job.blocker).toContain("OPENAI_API_KEY");
      expect(job.outputPath).toContain("assets/source/imagegen/");
    }
  });
});
