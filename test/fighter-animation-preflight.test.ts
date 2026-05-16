import { execFileSync } from "node:child_process";
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
    expect(plannedManifest?.animations.filter((animation) => animation.source.status === "generated").map((animation) => animation.id)).toEqual(
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
