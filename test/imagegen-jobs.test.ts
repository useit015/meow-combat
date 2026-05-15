import { describe, expect, it } from "vitest";
import {
  REQUIRED_FIGHTER_ANIMATIONS,
  buildImagegenJobs,
  buildUiImagegenJobs,
  fighterAssetManifests,
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  stageAssetManifests,
} from "../src/assets";
import { meowtalProductionManifest } from "../src/assets/meowtalProductionManifest";

describe("imagegen jobs", () => {
  it("creates deterministic jobs for every fighter reference, animation row, and stage layer", () => {
    const jobs = buildImagegenJobs();
    const expectedFighterJobs = meowtalFighterAssetManifests.length * (1 + REQUIRED_FIGHTER_ANIMATIONS.length);
    const expectedStageJobs = meowtalStageAssetManifests.reduce((total, stage) => total + stage.layers.length, 0);

    expect(jobs).toHaveLength(expectedFighterJobs + expectedStageJobs);
    expect(new Set(jobs.map((job) => job.subjectId))).toEqual(
      new Set(["gray-rabbit", "ginger-tabby-cat", "meowtal-courtyard"]),
    );
    expect(new Set(jobs.map((job) => job.id)).size).toBe(jobs.length);
    expect(new Set(jobs.map((job) => job.promptSlug)).size).toBe(jobs.length);
  });

  it("keeps animation rows grounded in canonical fighter references", () => {
    const rowJobs = buildImagegenJobs().filter((job) => job.kind === "fighter-animation-row");

    expect(rowJobs.length).toBeGreaterThan(0);
    for (const job of rowJobs) {
      expect(job.requiredInputs).toHaveLength(1);
      expect(job.requiredInputs[0]).toBe(`assets/source/imagegen/fighters/${job.subjectId}/canonical-character-sheet.png`);
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
      "ginger-tabby-cat:canonical-reference",
      "gray-rabbit:canonical-reference",
    ]);
    const expectedApprovedIds = [
      ...meowtalFighterAssetManifests.flatMap((fighter) =>
        REQUIRED_FIGHTER_ANIMATIONS.map((animationId) => `${fighter.id}:${animationId}`),
      ),
      ...meowtalStageAssetManifests.flatMap((stage) => stage.layers.map((layer) => `${stage.id}:${layer.id}`)),
    ].sort();

    expect(approvedJobs.map((job) => job.id).sort()).toEqual(expectedApprovedIds);
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

  it("still supports legacy Atlas/Marrakesh jobs when manifests are passed explicitly", () => {
    const jobs = buildImagegenJobs(fighterAssetManifests, stageAssetManifests);

    expect(jobs.map((job) => job.id)).toContain("atlas-lion:canonical-reference");
    expect(jobs.map((job) => job.id)).toContain("sahara-viper:canonical-reference");
    expect(jobs.map((job) => job.id)).toContain("marrakesh-rooftop:sky");
    expect(jobs.some((job) => job.subjectId === "gray-rabbit")).toBe(false);
  });

  it("creates deterministic UI surface jobs from the Meowtal production manifest", () => {
    const jobs = buildUiImagegenJobs(meowtalProductionManifest);

    expect(jobs.map((job) => job.id).sort()).toEqual([
      "ui:cat-portrait",
      "ui:fight-ko-victory-overlays",
      "ui:health-bar-cat",
      "ui:health-bar-rabbit",
      "ui:hud-frame",
      "ui:logo-title-mark",
      "ui:rabbit-portrait",
      "ui:super-meter",
      "ui:timer-frame",
    ]);
    expect(new Set(jobs.map((job) => job.kind))).toEqual(new Set(["ui-surface"]));
    expect(new Set(jobs.map((job) => job.subjectId))).toEqual(new Set(["meowtal-ui"]));
    expect(new Set(jobs.map((job) => job.promptSlug)).size).toBe(jobs.length);

    for (const job of jobs) {
      expect(job.outputPath).toBe(`assets/source/imagegen/ui/meowtal/${job.id.replace("ui:", "")}.png`);
      expect(job.requiredInputs).toEqual([]);
      expect(job.status).toBe("approved");
      expect(job.blocker).toBeUndefined();
      expect(job.prompt).toContain("Meowtal Kombat");
      expect(job.prompt).toContain("free of copied fighting-game branding");
      expect(job.prompt).toContain("1024x576");
    }
  });
});
