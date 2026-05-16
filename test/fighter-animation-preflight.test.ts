import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FIGHTER_CELL_SIZE,
  REQUIRED_FIGHTER_ANIMATIONS,
  buildPicklesAnimationPreflight,
  meowtalFighterAssetManifests,
  pawbreakerPlannedFighterAssetManifests,
  renderPicklesAnimationPreflightHtml,
  validateFighterAnimationPreflight,
} from "../src/assets";
import { meowtalKombatConfig } from "../src/game/gameConfig";

describe("Pickles Pugilist animation preflight", () => {
  it("keeps Pickles source-only and not playable", () => {
    const plan = buildPicklesAnimationPreflight();

    expect(plan).toMatchObject({
      fighterId: "pugilist-pug",
      displayName: "Pickles Pugilist",
      sourceOnly: true,
      playable: false,
      runtimeExposure: "not playable",
      status: "preflight-only",
      fullOutcome: "incomplete",
      blockedPublicRuntimePath: "/assets/generated/fighters/pugilist-pug",
    });
    expect(plan.canonicalReferencePath).toBe("assets/source/imagegen/fighters/pugilist-pug/canonical-character-sheet.png");
    expect(existsSync(join(process.cwd(), plan.canonicalReferencePath))).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/pugilist-pug"))).toBe(false);
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat"]);
    expect(meowtalFighterAssetManifests.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat"]);
  });

  it("covers every required animation row with row-generation briefs and no-drift acceptance", () => {
    const plan = buildPicklesAnimationPreflight();
    const plannedManifest = pawbreakerPlannedFighterAssetManifests.find((manifest) => manifest.id === "pugilist-pug");

    expect(plan.requiredRows.map((row) => row.animationId)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    expect(plan.requiredRows).toHaveLength(REQUIRED_FIGHTER_ANIMATIONS.length);
    for (const row of plan.requiredRows) {
      const plannedRow = plannedManifest?.animations.find((animation) => animation.id === row.animationId);

      expect(row.frameCount).toBe(plannedRow?.frameCount);
      expect(row.cellSize).toEqual(DEFAULT_FIGHTER_CELL_SIZE);
      expect(row.facing).toBe("right");
      expect(row.rowGenerationBrief).toContain("Pickles Pugilist");
      expect(row.rowGenerationBrief).toContain("row-generation");
      expect(row.acceptanceCriteria.join(" ")).toContain("no-drift");
      expect(row.acceptanceCriteria.join(" ")).toContain("transparent-background");
      expect(row.rejectionTriggers.join(" ")).toContain("size drift");
      expect(row.rejectionTriggers.join(" ")).toContain("identity drift");
    }

    expect(plannedManifest?.animations.find((animation) => animation.id === "idle")?.source).toMatchObject({
      status: "generated",
      outputPath: "assets/source/imagegen/fighters/pugilist-pug/idle.png",
    });
    expect(plannedManifest?.animations.filter((animation) => animation.source.status === "generated").map((animation) => animation.id)).toEqual([
      "idle",
    ]);
  });

  it("defines concrete no-drift gates, runtime promotion tests, and smoke requirements", () => {
    const plan = buildPicklesAnimationPreflight();
    const errors = validateFighterAnimationPreflight(plan);
    const gateText = plan.noDriftQaGates.map((gate) => `${gate.id} ${gate.label} ${gate.requiredEvidence.join(" ")}`).join(" ");
    const promotionCommands = plan.runtimePromotionTests.map((test) => test.command).join(" ");
    const smokeText = plan.browserSmokeRequirements.map((requirement) => requirement.expectedEvidence).join(" ");

    expect(errors).toEqual([]);
    expect(gateText).toContain("scale-bounds");
    expect(gateText).toContain("alpha-bounds");
    expect(gateText).toContain("identity-traits");
    expect(gateText).toContain("frame-dimensions");
    expect(gateText).toContain("provenance");
    expect(gateText).toContain("256x256");
    expect(promotionCommands).toContain("test ! -e public/assets/generated/fighters/pugilist-pug");
    expect(promotionCommands).toContain("smoke:meowtal");
    expect(smokeText).toContain("Gray Rabbit and Ginger Tabby Cat");
    expect(smokeText).toContain("Pickles Pugilist is not playable");
  });

  it("renders review artifacts without claiming runtime readiness", () => {
    const plan = buildPicklesAnimationPreflight();
    const html = renderPicklesAnimationPreflightHtml(plan);
    const outputJson = JSON.parse(
      readFileSync(join(process.cwd(), "output/animation-preflight/pickles-pugilist-animation-plan.json"), "utf8"),
    ) as typeof plan;
    const outputHtml = readFileSync(
      join(process.cwd(), "output/animation-preflight/pickles-pugilist-animation-plan.html"),
      "utf8",
    );

    expect(outputJson.fighterId).toBe("pugilist-pug");
    expect(outputJson.playable).toBe(false);
    expect(outputJson.requiredRows.map((row) => row.animationId)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    expect(html).toContain("Pickles Pugilist");
    expect(html).toContain("row-generation");
    expect(html).toContain("not playable");
    expect(html).toContain("no-drift");
    expect(html).not.toContain("<script");
    expect(outputHtml).toContain("Pickles Pugilist");
    expect(outputHtml).toContain("not playable");
    expect(outputHtml).not.toContain("/assets/generated/fighters/pugilist-pug");
  });
});
