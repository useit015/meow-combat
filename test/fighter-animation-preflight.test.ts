import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FIGHTER_CELL_SIZE,
  REQUIRED_FIGHTER_ANIMATIONS,
  buildNoodleAnimationPreflight,
  buildPicklesAnimationPreflight,
  pawbreakerPlannedFighterAssetManifests,
  renderNoodleAnimationPreflightHtml,
  meowtalFighterAssetManifests,
  renderPicklesAnimationPreflightHtml,
  validateFighterAnimationPreflight,
} from "../src/assets";
import { meowtalKombatConfig } from "../src/game/gameConfig";

describe("Pickles Pugilist animation preflight", () => {
  it("records Pickles as playable after runtime promotion", () => {
    const plan = buildPicklesAnimationPreflight();

    expect(plan).toMatchObject({
      fighterId: "pugilist-pug",
      displayName: "Pickles Pugilist",
      sourceOnly: false,
      playable: true,
      runtimeExposure: "playable",
      status: "runtime-promoted",
      fullOutcome: "incomplete",
      publicRuntimePath: "/assets/generated/fighters/pugilist-pug",
    });
    expect(plan.canonicalReferencePath).toBe("assets/source/imagegen/fighters/pugilist-pug/canonical-character-sheet.png");
    expect(existsSync(join(process.cwd(), plan.canonicalReferencePath))).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/pugilist-pug"))).toBe(true);
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(meowtalFighterAssetManifests.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
  });

  it("covers every required animation row with row-generation briefs and no-drift acceptance", () => {
    const plan = buildPicklesAnimationPreflight();
    const plannedManifest = meowtalFighterAssetManifests.find((manifest) => manifest.id === "pugilist-pug");

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
      status: "approved",
      outputPath: "/assets/generated/fighters/pugilist-pug/idle.png",
    });
    expect(plannedManifest?.animations.filter((animation) => animation.source.status === "approved").map((animation) => animation.id)).toEqual(
      [
        "idle",
        "walk-forward",
        "walk-back",
        "crouch",
        "jump",
        "light-punch",
        "heavy-punch",
        "light-kick",
        "special",
        "hitstun",
        "blockstun",
        "knockdown",
        "win",
        "lose",
      ],
    );
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
    expect(promotionCommands).toContain("test -d public/assets/generated/fighters/pugilist-pug");
    expect(promotionCommands).toContain("smoke:meowtal");
    expect(smokeText).toContain("Pickles Pugilist");
    expect(smokeText).toContain("no procedural or missing-output fallback");
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
    expect(outputJson.requiredRows.map((row) => row.animationId)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    expect(html).toContain("Pickles Pugilist");
    expect(html).toContain("runtime promotion");
    expect(html).toContain("playable");
    expect(html).toContain("no-drift");
    expect(html).not.toContain("<script");
    expect(outputHtml).toContain("Pickles Pugilist");
    expect(outputHtml).toContain("Pickles Pugilist");
  });

  it("keeps generated Pickles jump frames at the same character scale as idle", () => {
    const idleBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/idle.png", 8);
    const jumpBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/jump.png", 6);
    const idleWidth = Math.round(average(idleBounds.map((bounds) => bounds.width)));
    const idleHeight = Math.round(average(idleBounds.map((bounds) => bounds.height)));
    const jumpWidths = jumpBounds.map((bounds) => bounds.width);
    const jumpHeights = jumpBounds.map((bounds) => bounds.height);

    expect(Math.min(...jumpWidths)).toBeGreaterThanOrEqual(Math.round(idleWidth * 0.9));
    expect(Math.min(...jumpHeights)).toBeGreaterThanOrEqual(Math.round(idleHeight * 0.8));
    expect(Math.max(...jumpHeights)).toBeGreaterThanOrEqual(Math.round(idleHeight * 0.92));
  });

  it("keeps generated Pickles power attacks locked to the approved character size", () => {
    const idleBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/idle.png", 8);
    const idleHeight = Math.round(average(idleBounds.map((bounds) => bounds.height)));
    const rows = [
      {
        path: "assets/source/imagegen/fighters/pugilist-pug/heavy-punch.png",
        frameCount: 8,
        maxWidth: 245,
      },
      {
        path: "assets/source/imagegen/fighters/pugilist-pug/special.png",
        frameCount: 10,
        maxWidth: 210,
      },
    ];

    for (const row of rows) {
      const bounds = alphaBoundsByFrame(row.path, row.frameCount);
      const widths = bounds.map((frame) => frame.width);
      const heights = bounds.map((frame) => frame.height);

      expect(Math.min(...widths)).toBeGreaterThanOrEqual(150);
      expect(Math.max(...widths)).toBeLessThanOrEqual(row.maxWidth);
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(195);
      expect(average(heights)).toBeGreaterThanOrEqual(205);
      expect(average(heights)).toBeGreaterThanOrEqual(idleHeight * 0.9);
    }
  });

  it("keeps generated Pickles defensive reactions at full character scale", () => {
    const rows = [
      "assets/source/imagegen/fighters/pugilist-pug/hitstun.png",
      "assets/source/imagegen/fighters/pugilist-pug/blockstun.png",
    ];

    for (const path of rows) {
      const bounds = alphaBoundsByFrame(path, 5);
      const widths = bounds.map((frame) => frame.width);
      const heights = bounds.map((frame) => frame.height);

      expect(Math.min(...widths)).toBeGreaterThanOrEqual(150);
      expect(Math.max(...widths)).toBeLessThanOrEqual(230);
      expect(Math.min(...heights)).toBeGreaterThanOrEqual(195);
      expect(average(heights)).toBeGreaterThanOrEqual(220);
    }
  });

  it("keeps generated Pickles win row at the approved character size", () => {
    const bounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/win.png", 8);
    const widths = bounds.map((frame) => frame.width);
    const heights = bounds.map((frame) => frame.height);

    expect(Math.min(...widths)).toBeGreaterThanOrEqual(150);
    expect(Math.max(...widths)).toBeLessThanOrEqual(210);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(195);
    expect(average(heights)).toBeGreaterThanOrEqual(205);
  });

  it("keeps generated Pickles lose row full-size under the collapsed-row rubric", () => {
    const bounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/lose.png", 6);
    const widths = bounds.map((frame) => frame.width);
    const heights = bounds.map((frame) => frame.height);
    const opaquePixels = bounds.map((frame) => frame.opaquePixels);

    expect(Math.min(...widths)).toBeGreaterThanOrEqual(150);
    expect(Math.max(...widths)).toBeLessThanOrEqual(210);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(195);
    expect(average(heights)).toBeGreaterThanOrEqual(205);
    expect(Math.min(...opaquePixels)).toBeGreaterThanOrEqual(20_000);
    expect(average(opaquePixels)).toBeGreaterThanOrEqual(22_500);
  });

  it("keeps generated Pickles knockdown row full-size under the true-prone rubric", () => {
    const bounds = alphaBoundsByFrame("assets/source/imagegen/fighters/pugilist-pug/knockdown.png", 8);
    const opaquePixels = bounds.map((frame) => frame.opaquePixels);
    const earlyAnchors = bounds.filter(
      (frame) => frame.frame <= 4 && frame.height >= 205 && frame.width >= 150 && frame.width <= 230 && frame.opaquePixels >= 22_000,
    );
    const finalProneFrames = bounds.filter(
      (frame) => frame.frame >= 5 && frame.width >= 210 && frame.width <= 245 && frame.opaquePixels >= 20_000,
    );
    const below195Frames = bounds.filter((frame) => frame.height < 195);
    const tinyFrames = bounds.filter((frame) => frame.width < 195 && frame.height < 195);

    expect(earlyAnchors).toHaveLength(2);
    expect(finalProneFrames.length).toBeGreaterThanOrEqual(2);
    expect(below195Frames.every((frame) => frame.width >= 205)).toBe(true);
    expect(tinyFrames).toEqual([]);
    expect(average(opaquePixels)).toBeGreaterThanOrEqual(22_500);
  });
});

describe("Noodle Nibbles animation preflight", () => {
  it("records Noodle as the next source-only roster-production candidate", () => {
    const plan = buildNoodleAnimationPreflight();

    expect(plan).toMatchObject({
      fighterId: "ferret-noodle",
      displayName: "Noodle Nibbles",
      sourceOnly: true,
      playable: false,
      runtimeExposure: "not playable",
      status: "source-only-preflight",
      fullOutcome: "incomplete",
      publicRuntimePath: null,
    });
    expect(plan.canonicalReferencePath).toBe("assets/source/imagegen/fighters/ferret-noodle/canonical-character-sheet.png");
    expect(existsSync(join(process.cwd(), plan.canonicalReferencePath))).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
    expect(meowtalKombatConfig.roster.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(meowtalFighterAssetManifests.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(pawbreakerPlannedFighterAssetManifests.map((fighter) => fighter.id)).toContain("ferret-noodle");
  });

  it("covers every required Noodle row with no-size-drift source-only gates", () => {
    const plan = buildNoodleAnimationPreflight();
    const errors = validateFighterAnimationPreflight(plan);

    expect(errors).toEqual([]);
    expect(plan.requiredRows.map((row) => row.animationId)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    for (const row of plan.requiredRows) {
      expect(row.cellSize).toEqual(DEFAULT_FIGHTER_CELL_SIZE);
      expect(row.facing).toBe("right");
      expect(row.rowGenerationBrief).toContain("Noodle Nibbles");
      expect(row.rowGenerationBrief).toContain("row-generation");
      expect(row.acceptanceCriteria.join(" ")).toContain("no-size-drift");
      expect(row.acceptanceCriteria.join(" ")).toContain("no-drift");
      expect(row.acceptanceCriteria.join(" ")).toContain("transparent-background");
      expect(row.rejectionTriggers.join(" ")).toContain("size drift");
      expect(row.rejectionTriggers.join(" ")).toContain("identity drift");
    }

    const gateText = plan.noDriftQaGates.map((gate) => `${gate.id} ${gate.label} ${gate.requiredEvidence.join(" ")} ${gate.failIf.join(" ")}`).join(" ");
    const promotionCommands = plan.runtimePromotionTests.map((test) => test.command).join(" ");
    const smokeText = plan.browserSmokeRequirements.map((requirement) => requirement.expectedEvidence).join(" ");

    expect(gateText).toContain("no-size-drift");
    expect(gateText).toContain("alpha-bounds");
    expect(gateText).toContain("identity-traits");
    expect(gateText).toContain("256x256");
    expect(gateText).toContain("provenance");
    expect(promotionCommands).toContain("test ! -e public/assets/generated/fighters/ferret-noodle");
    expect(promotionCommands).toContain("smoke:meowtal");
    expect(smokeText).toContain("absent from the selectable runtime roster");
    expect(smokeText).toContain("no procedural or missing-output fallback");
  });

  it("renders source-only review artifacts without claiming Noodle is playable", () => {
    const plan = buildNoodleAnimationPreflight();
    const html = renderNoodleAnimationPreflightHtml(plan);
    const outputJson = JSON.parse(
      readFileSync(join(process.cwd(), "output/animation-preflight/noodle-nibbles-animation-plan.json"), "utf8"),
    ) as typeof plan;
    const outputHtml = readFileSync(
      join(process.cwd(), "output/animation-preflight/noodle-nibbles-animation-plan.html"),
      "utf8",
    );

    expect(outputJson.fighterId).toBe("ferret-noodle");
    expect(outputJson.sourceOnly).toBe(true);
    expect(outputJson.playable).toBe(false);
    expect(outputJson.requiredRows.map((row) => row.animationId)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    expect(outputJson.requiredRows).toEqual(plan.requiredRows);
    expect(outputJson.noDriftQaGates).toEqual(plan.noDriftQaGates);
    expect(outputJson.runtimePromotionTests).toEqual(plan.runtimePromotionTests);
    expect(outputJson.browserSmokeRequirements).toEqual(plan.browserSmokeRequirements);

    const idleRow = plan.requiredRows.find((row) => row.animationId === "idle");
    expect(idleRow).toBeDefined();
    expect(idleRow?.rowGenerationBrief).toContain("Noodle Nibbles idle row-generation pass");
    expect(idleRow?.motionLanguage).toContain("long-body guard sway");
    expect(idleRow?.acceptanceCriteria.join(" ")).toContain("no-size-drift/no-drift");
    expect(idleRow?.rejectionTriggers.join(" ")).toContain("size drift");
    expect(outputJson.requiredRows.every((row) => row.rowGenerationBrief && row.motionLanguage)).toBe(true);
    expect(outputJson.requiredRows.every((row) => row.acceptanceCriteria.length > 0 && row.rejectionTriggers.length > 0)).toBe(true);

    expect(html).toContain("Noodle Nibbles");
    expect(html).toContain("source-only production preflight");
    expect(html).toContain("not playable");
    expect(html).toContain("no-size-drift");
    expect(html).toContain("Noodle Nibbles idle row-generation pass");
    expect(html).toContain("long-body guard sway");
    expect(html).toContain("Reject if");
    expect(html).not.toContain("playable runtime assets");
    expect(outputHtml).toContain("Noodle Nibbles");
    expect(outputHtml).toContain("source-only production preflight");
    expect(outputHtml).toContain("Noodle Nibbles idle row-generation pass");
    expect(outputHtml).toContain("long-body guard sway");
    expect(outputHtml).toContain("Reject if");
    expect(outputHtml).toContain("size drift, identity drift");
    expect(outputHtml).not.toContain("playable runtime assets");
  });

  it("keeps generated Noodle idle row as the source-only scale baseline", () => {
    const bounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/idle.png", 8);
    const widths = bounds.map((frame) => frame.width);
    const heights = bounds.map((frame) => frame.height);
    const opaquePixels = bounds.map((frame) => frame.opaquePixels);

    expect(widths.every((width) => width >= 110 && width <= 140)).toBe(true);
    expect(heights.every((height) => height >= 225 && height <= 235)).toBe(true);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
    expect(average(opaquePixels)).toBeGreaterThanOrEqual(16_000);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle locomotion rows source-only and scale-stable against idle", () => {
    const idleBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/idle.png", 8);
    const idleWidth = average(idleBounds.map((frame) => frame.width));
    const idleHeight = average(idleBounds.map((frame) => frame.height));

    for (const row of ["walk-forward", "walk-back"]) {
      const bounds = alphaBoundsByFrame(`assets/source/imagegen/fighters/ferret-noodle/${row}.png`, 8);
      const widths = bounds.map((frame) => frame.width);
      const heights = bounds.map((frame) => frame.height);
      const opaquePixels = bounds.map((frame) => frame.opaquePixels);

      expect(Math.min(...widths)).toBeGreaterThanOrEqual(Math.round(idleWidth * 1.1));
      expect(Math.max(...widths)).toBeLessThanOrEqual(Math.round(idleWidth * 1.75));
      expect(average(heights)).toBeGreaterThanOrEqual(idleHeight * 0.94);
      expect(average(heights)).toBeLessThanOrEqual(idleHeight * 1.05);
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(12);
      expect(average(opaquePixels)).toBeGreaterThanOrEqual(15_000);
    }

    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle mobility rows source-only without repeating jump shrink", () => {
    const idleBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/idle.png", 8);
    const idleWidth = average(idleBounds.map((frame) => frame.width));
    const crouchBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/crouch.png", 4);
    const jumpBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/jump.png", 6);

    expect(crouchBounds.every((frame) => frame.width >= 225 && frame.width <= 240)).toBe(true);
    expect(crouchBounds.every((frame) => frame.height >= 160 && frame.height <= 185)).toBe(true);
    expect(crouchBounds.every((frame) => frame.opaquePixels >= 19_000)).toBe(true);

    expect(jumpBounds.every((frame) => frame.width >= Math.round(idleWidth * 1.05))).toBe(true);
    expect(jumpBounds.every((frame) => frame.height >= 135 && frame.height <= 205)).toBe(true);
    expect(jumpBounds.every((frame) => frame.opaquePixels >= 11_000)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle starter attacks source-only with compact contact poses", () => {
    const lightPunchBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/light-punch.png", 6);
    const lightKickBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/light-kick.png", 8);

    expect(lightPunchBounds.every((frame) => frame.width >= 120 && frame.width <= 230)).toBe(true);
    expect(Math.max(...lightPunchBounds.map((frame) => frame.width))).toBeGreaterThanOrEqual(210);
    expect(lightPunchBounds.every((frame) => frame.height >= 205 && frame.height <= 225)).toBe(true);
    expect(lightPunchBounds.every((frame) => frame.opaquePixels >= 14_500)).toBe(true);

    expect(lightKickBounds.every((frame) => frame.width >= 120 && frame.width <= 160)).toBe(true);
    expect(lightKickBounds.every((frame) => frame.height >= 215 && frame.height <= 225)).toBe(true);
    expect(lightKickBounds.every((frame) => frame.opaquePixels >= 13_500)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle heavy-punch source-only with no-size-drift body twist", () => {
    const heavyPunchBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/heavy-punch.png", 8);

    expect(heavyPunchBounds.every((frame) => frame.width >= 150 && frame.width <= 210)).toBe(true);
    expect(Math.max(...heavyPunchBounds.map((frame) => frame.width))).toBeGreaterThanOrEqual(205);
    expect(heavyPunchBounds.every((frame) => frame.height >= 210 && frame.height <= 230)).toBe(true);
    expect(heavyPunchBounds.every((frame) => frame.opaquePixels >= 17_800)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle special source-only without loose effect drift", () => {
    const specialBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/special.png", 10);

    expect(specialBounds.every((frame) => frame.width >= 138 && frame.width <= 210)).toBe(true);
    expect(Math.max(...specialBounds.map((frame) => frame.width))).toBeGreaterThanOrEqual(200);
    expect(specialBounds.every((frame) => frame.height >= 178 && frame.height <= 225)).toBe(true);
    expect(specialBounds.every((frame) => frame.opaquePixels >= 15_700)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle knockdown source-only with readable grounded recovery", () => {
    const knockdownBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/knockdown.png", 8);

    expect(knockdownBounds.every((frame) => frame.width >= 160 && frame.width <= 180)).toBe(true);
    expect(Math.max(...knockdownBounds.map((frame) => frame.height))).toBeGreaterThanOrEqual(216);
    expect(Math.min(...knockdownBounds.map((frame) => frame.height))).toBeLessThanOrEqual(105);
    expect(knockdownBounds.every((frame) => frame.height >= 103 && frame.height <= 216)).toBe(true);
    expect(knockdownBounds.every((frame) => frame.opaquePixels >= 10_000)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle outcome rows source-only with controlled acting poses", () => {
    const winBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/win.png", 8);
    const loseBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/lose.png", 6);

    expect(winBounds.every((frame) => frame.width >= 131 && frame.width <= 168)).toBe(true);
    expect(winBounds.every((frame) => frame.height >= 160 && frame.height <= 230)).toBe(true);
    expect(Math.max(...winBounds.map((frame) => frame.height))).toBeGreaterThanOrEqual(230);
    expect(winBounds.every((frame) => frame.opaquePixels >= 13_700)).toBe(true);

    expect(loseBounds.every((frame) => frame.width >= 163 && frame.width <= 207)).toBe(true);
    expect(loseBounds.every((frame) => frame.height >= 174 && frame.height <= 219)).toBe(true);
    expect(Math.max(...loseBounds.map((frame) => frame.width))).toBeGreaterThanOrEqual(207);
    expect(loseBounds.every((frame) => frame.opaquePixels >= 16_700)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });

  it("keeps generated Noodle defense reactions source-only with compact recoil poses", () => {
    const hitstunBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/hitstun.png", 5);
    const blockstunBounds = alphaBoundsByFrame("assets/source/imagegen/fighters/ferret-noodle/blockstun.png", 5);

    expect(hitstunBounds.every((frame) => frame.width >= 135 && frame.width <= 200)).toBe(true);
    expect(hitstunBounds.every((frame) => frame.height >= 200 && frame.height <= 240)).toBe(true);
    expect(hitstunBounds.every((frame) => frame.opaquePixels >= 17_000)).toBe(true);
    expect(Math.max(...hitstunBounds.map((frame) => frame.width))).toBeGreaterThanOrEqual(185);

    expect(blockstunBounds.every((frame) => frame.width >= 140 && frame.width <= 165)).toBe(true);
    expect(blockstunBounds.every((frame) => frame.height >= 200 && frame.height <= 240)).toBe(true);
    expect(blockstunBounds.every((frame) => frame.opaquePixels >= 18_000)).toBe(true);
    expect(existsSync(join(process.cwd(), "public/assets/generated/fighters/ferret-noodle"))).toBe(false);
  });
});

function alphaBoundsByFrame(relativePath: string, frameCount: number) {
  const path = join(process.cwd(), relativePath);
  const dimensions = readPngDimensions(path);
  const pixels = execFileSync("ffmpeg", ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], {
    maxBuffer: dimensions.width * dimensions.height * 4 + 1024,
  });
  const frameWidth = dimensions.width / frameCount;

  return Array.from({ length: frameCount }, (_, frameIndex) => {
    const minCellX = Math.floor(frameIndex * frameWidth);
    const maxCellX = Math.floor((frameIndex + 1) * frameWidth) - 1;
    let minX = frameWidth - 1;
    let maxX = 0;
    let minY = dimensions.height - 1;
    let maxY = 0;
    let opaquePixels = 0;
    let found = false;

    for (let y = 0; y < dimensions.height; y += 1) {
      for (let x = minCellX; x <= maxCellX; x += 1) {
        const pixelIndex = (y * dimensions.width + x) * 4;
        if (pixels[pixelIndex + 3] <= 16) continue;

        const localX = x - minCellX;
        opaquePixels += 1;
        minX = Math.min(minX, localX);
        maxX = Math.max(maxX, localX);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        found = true;
      }
    }

    if (!found) throw new Error(`${relativePath} frame ${frameIndex + 1} has no opaque pixels`);

    return {
      frame: frameIndex + 1,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      opaquePixels,
    };
  });
}

function readPngDimensions(path: string) {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });

  return {
    width: Number(output.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight: (\d+)/)?.[1]),
  };
}

function average(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
