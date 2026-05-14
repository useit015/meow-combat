import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REQUIRED_FIGHTER_ANIMATIONS } from "../src/assets";
import {
  blockedAnimationRowsUntilCanonicalApproved,
  canonicalSheetsApproved,
  collectMeowtalProvenanceEntries,
  meowtalProductionManifest,
  validateMeowtalProductionManifest,
} from "../src/assets/meowtalProductionManifest";

describe("Meowtal production manifest", () => {
  it("defines the production asset families without switching broad runtime content", () => {
    expect(meowtalProductionManifest.title).toBe("Meowtal Kombat");
    expect(meowtalProductionManifest.fighters.map((fighter) => fighter.id)).toEqual([
      "gray-rabbit",
      "ginger-tabby-cat",
    ]);
    expect(meowtalProductionManifest.stage.layers.map((layer) => layer.id)).toEqual([
      "sky-lighting",
      "distant-hills-city",
      "background-walls-pillars",
      "midground-trees-bushes",
      "playfield-stone-courtyard",
      "foreground-dust-leaves",
    ]);
    expect(meowtalProductionManifest.visualSurfaces.map((surface) => surface.id)).toContain("logo-title-mark");
    expect(meowtalProductionManifest.visualSurfaces.map((surface) => surface.id)).toContain("hud-frame");
    expect(meowtalProductionManifest.audioCues.map((cue) => cue.id)).toContain("rabbit-tornado");
    expect(meowtalProductionManifest.audioCues.map((cue) => cue.id)).toContain("cat-aura-blast");

    const entries = collectMeowtalProvenanceEntries();
    const runtimeEntries = entries.filter((entry) => entry.runtimePath !== null);
    expect(entries).toHaveLength(2 + 2 * REQUIRED_FIGHTER_ANIMATIONS.length + 6 + 15 + 11);
    expect(runtimeEntries.map((entry) => entry.assetId).sort()).toEqual([
      "ginger-tabby-cat:blockstun",
      "ginger-tabby-cat:crouch",
      "ginger-tabby-cat:heavy-punch",
      "ginger-tabby-cat:hitstun",
      "ginger-tabby-cat:idle",
      "ginger-tabby-cat:jump",
      "ginger-tabby-cat:knockdown",
      "ginger-tabby-cat:light-kick",
      "ginger-tabby-cat:light-punch",
      "ginger-tabby-cat:lose",
      "ginger-tabby-cat:special",
      "ginger-tabby-cat:walk-back",
      "ginger-tabby-cat:walk-forward",
      "ginger-tabby-cat:win",
      "gray-rabbit:blockstun",
      "gray-rabbit:crouch",
      "gray-rabbit:heavy-punch",
      "gray-rabbit:hitstun",
      "gray-rabbit:idle",
      "gray-rabbit:jump",
      "gray-rabbit:knockdown",
      "gray-rabbit:light-kick",
      "gray-rabbit:light-punch",
      "gray-rabbit:lose",
      "gray-rabbit:special",
      "gray-rabbit:walk-back",
      "gray-rabbit:walk-forward",
      "gray-rabbit:win",
      "meowtal-courtyard:background-walls-pillars",
      "meowtal-courtyard:distant-hills-city",
      "meowtal-courtyard:foreground-dust-leaves",
      "meowtal-courtyard:midground-trees-bushes",
      "meowtal-courtyard:playfield-stone-courtyard",
      "meowtal-courtyard:sky-lighting",
      "ui:fight-ko-victory-overlays",
      "ui:health-bar-cat",
      "ui:health-bar-rabbit",
      "ui:hud-frame",
      "ui:logo-title-mark",
      "ui:timer-frame",
    ]);
    expect(runtimeEntries.every((entry) => entry.status === "approved")).toBe(true);
  });

  it("tracks approved runtime parallax courtyard layers", () => {
    for (const layer of meowtalProductionManifest.stage.layers) {
      const provenance = layer.provenance;

      expect(provenance.status).toBe("approved");
      expect(provenance.sourceKind).toBe("codex-imagegen");
      expect(provenance.sourcePath).toBe(`assets/source/imagegen/stages/meowtal-courtyard/${layer.id}.png`);
      expect(provenance.runtimePath).toBe(`/assets/generated/stages/meowtal-courtyard/${layer.id}.png`);
      expect(provenance.license.kind).toBe("owned-generated");
      expect(provenance.createdOrDownloadedOn).toBe("2026-05-14");
      expect(provenance.approvalNotes).toContain("Approved runtime parallax layer");
      expect(provenance.approvalNotes).toContain(`output/imagegen/meowtal-courtyard-${layer.id}.png`);
      expect(provenance.approvalNotes).toContain("Approved for runtime promotion by T093");
      expect(provenance.blocker).toBeNull();
      expect(existsSync(join(process.cwd(), provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved runtime HUD and logo assets without routing the remaining UI surfaces", () => {
    const generatedSurfaceIds = [
      "logo-title-mark",
      "hud-frame",
      "health-bar-rabbit",
      "health-bar-cat",
      "timer-frame",
      "fight-ko-victory-overlays",
    ] as const;

    for (const surfaceId of generatedSurfaceIds) {
      const surface = meowtalProductionManifest.visualSurfaces.find((candidate) => candidate.id === surfaceId);
      const provenance = surface?.provenance;

      expect(provenance?.status).toBe("approved");
      expect(provenance?.sourceKind).toBe("codex-imagegen");
      expect(provenance?.sourcePath).toBe(`assets/source/imagegen/ui/meowtal/${surfaceId}.png`);
      expect(provenance?.runtimePath).toBe(`/assets/generated/ui/meowtal/${surfaceId}.png`);
      expect(provenance?.license.kind).toBe("owned-generated");
      expect(provenance?.createdOrDownloadedOn).toBe("2026-05-14");
      expect(provenance?.approvalNotes).toContain("Approved runtime UI asset");
      expect(provenance?.approvalNotes).toContain(`output/imagegen/meowtal-ui-${surfaceId}.png`);
      expect(provenance?.approvalNotes).toContain("Approved by T095 visual QA and promoted by T096");
      expect(provenance?.approvalNotes).toContain("not yet routed into scene rendering");
      expect(provenance?.blocker).toBeNull();
      expect(existsSync(join(process.cwd(), provenance?.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", provenance?.runtimePath ?? ""))).toBe(true);
    }

    const outOfScopeSurfaces = meowtalProductionManifest.visualSurfaces.filter(
      (surface) => !generatedSurfaceIds.includes(surface.id as (typeof generatedSurfaceIds)[number]),
    );
    expect(outOfScopeSurfaces.every((surface) => surface.provenance.status === "planned")).toBe(true);
  });

  it("tracks approved knockdown rows and remaining blocked rows", () => {
    expect(canonicalSheetsApproved()).toBe(true);

    const blockedRows = blockedAnimationRowsUntilCanonicalApproved();
    expect(blockedRows).toHaveLength(0);
    const animationRows = meowtalProductionManifest.fighters.flatMap((fighter) => fighter.animationRows);
    const idleRows = animationRows.filter((row) => row.animationId === "idle");
    const walkForwardRows = animationRows.filter((row) => row.animationId === "walk-forward");
    const walkBackRows = animationRows.filter((row) => row.animationId === "walk-back");
    const crouchRows = animationRows.filter((row) => row.animationId === "crouch");
    const jumpRows = animationRows.filter((row) => row.animationId === "jump");
    const lightPunchRows = animationRows.filter((row) => row.animationId === "light-punch");
    const hitstunRows = animationRows.filter((row) => row.animationId === "hitstun");
    const blockstunRows = animationRows.filter((row) => row.animationId === "blockstun");
    const heavyPunchRows = animationRows.filter((row) => row.animationId === "heavy-punch");
    const lightKickRows = animationRows.filter((row) => row.animationId === "light-kick");
    const specialRows = animationRows.filter((row) => row.animationId === "special");
    const knockdownRows = animationRows.filter((row) => row.animationId === "knockdown");
    const winRows = animationRows.filter((row) => row.animationId === "win");
    const loseRows = animationRows.filter((row) => row.animationId === "lose");
    const remainingRows = animationRows.filter(
      (row) =>
        row.animationId !== "idle" &&
        row.animationId !== "walk-forward" &&
        row.animationId !== "walk-back" &&
        row.animationId !== "crouch" &&
        row.animationId !== "jump" &&
        row.animationId !== "light-punch" &&
        row.animationId !== "hitstun" &&
        row.animationId !== "blockstun" &&
        row.animationId !== "heavy-punch" &&
        row.animationId !== "light-kick" &&
        row.animationId !== "special" &&
        row.animationId !== "knockdown" &&
        row.animationId !== "win" &&
        row.animationId !== "lose",
    );

    expect(animationRows).toHaveLength(2 * REQUIRED_FIGHTER_ANIMATIONS.length);
    expect(idleRows).toHaveLength(2);
    expect(idleRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(idleRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(walkForwardRows).toHaveLength(2);
    expect(walkForwardRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(walkForwardRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(walkBackRows).toHaveLength(2);
    expect(walkBackRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(walkBackRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(crouchRows).toHaveLength(2);
    expect(crouchRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(crouchRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(jumpRows).toHaveLength(2);
    expect(jumpRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(jumpRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(lightPunchRows).toHaveLength(2);
    expect(lightPunchRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(lightPunchRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(hitstunRows).toHaveLength(2);
    expect(hitstunRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(hitstunRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(blockstunRows).toHaveLength(2);
    expect(blockstunRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(blockstunRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(heavyPunchRows).toHaveLength(2);
    expect(heavyPunchRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(heavyPunchRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(lightKickRows).toHaveLength(2);
    expect(lightKickRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(lightKickRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(specialRows).toHaveLength(2);
    expect(specialRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(specialRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(knockdownRows).toHaveLength(2);
    expect(knockdownRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(knockdownRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(winRows).toHaveLength(2);
    expect(winRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(winRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(loseRows).toHaveLength(2);
    expect(loseRows.every((row) => row.provenance.status === "approved")).toBe(true);
    expect(loseRows.every((row) => row.provenance.runtimePath?.includes("/assets/generated/fighters/"))).toBe(true);
    expect(remainingRows).toHaveLength(0);
  });

  it("tracks approved idle source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const idleRow = fighter.animationRows.find((row) => row.animationId === "idle");

      expect(idleRow?.provenance.status).toBe("approved");
      expect(idleRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/idle.png`);
      expect(idleRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/idle.png`);
      expect(idleRow?.provenance.license.kind).toBe("owned-generated");
      expect(idleRow?.provenance.approvalNotes).toContain("Approved runtime idle row");
      expect(idleRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(idleRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), idleRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", idleRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved walk-forward source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const walkForwardRow = fighter.animationRows.find((row) => row.animationId === "walk-forward");

      expect(walkForwardRow?.provenance.status).toBe("approved");
      expect(walkForwardRow?.provenance.sourcePath).toBe(
        `assets/source/imagegen/fighters/${fighter.id}/walk-forward.png`,
      );
      expect(walkForwardRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/walk-forward.png`);
      expect(walkForwardRow?.provenance.license.kind).toBe("owned-generated");
      expect(walkForwardRow?.provenance.approvalNotes).toContain("Approved runtime walk-forward row");
      expect(walkForwardRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(walkForwardRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), walkForwardRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", walkForwardRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved walk-back source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const walkBackRow = fighter.animationRows.find((row) => row.animationId === "walk-back");

      expect(walkBackRow?.provenance.status).toBe("approved");
      expect(walkBackRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/walk-back.png`);
      expect(walkBackRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/walk-back.png`);
      expect(walkBackRow?.provenance.license.kind).toBe("owned-generated");
      expect(walkBackRow?.provenance.approvalNotes).toContain("Approved runtime walk-back row");
      expect(walkBackRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(walkBackRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), walkBackRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", walkBackRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved crouch source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const crouchRow = fighter.animationRows.find((row) => row.animationId === "crouch");

      expect(crouchRow?.provenance.status).toBe("approved");
      expect(crouchRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/crouch.png`);
      expect(crouchRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/crouch.png`);
      expect(crouchRow?.provenance.license.kind).toBe("owned-generated");
      expect(crouchRow?.provenance.approvalNotes).toContain("Approved runtime crouch row");
      expect(crouchRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(crouchRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), crouchRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", crouchRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved jump source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const jumpRow = fighter.animationRows.find((row) => row.animationId === "jump");

      expect(jumpRow?.provenance.status).toBe("approved");
      expect(jumpRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/jump.png`);
      expect(jumpRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/jump.png`);
      expect(jumpRow?.provenance.license.kind).toBe("owned-generated");
      expect(jumpRow?.provenance.approvalNotes).toContain("Approved runtime jump row");
      expect(jumpRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(jumpRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), jumpRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", jumpRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved light-punch source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const lightPunchRow = fighter.animationRows.find((row) => row.animationId === "light-punch");

      expect(lightPunchRow?.provenance.status).toBe("approved");
      expect(lightPunchRow?.provenance.sourcePath).toBe(
        `assets/source/imagegen/fighters/${fighter.id}/light-punch.png`,
      );
      expect(lightPunchRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/light-punch.png`);
      expect(lightPunchRow?.provenance.license.kind).toBe("owned-generated");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("Approved runtime light-punch row");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), lightPunchRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", lightPunchRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved hitstun source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const hitstunRow = fighter.animationRows.find((row) => row.animationId === "hitstun");

      expect(hitstunRow?.provenance.status).toBe("approved");
      expect(hitstunRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/hitstun.png`);
      expect(hitstunRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/hitstun.png`);
      expect(hitstunRow?.provenance.license.kind).toBe("owned-generated");
      expect(hitstunRow?.provenance.approvalNotes).toContain("Approved runtime hitstun row");
      expect(hitstunRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(hitstunRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), hitstunRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", hitstunRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved blockstun source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const blockstunRow = fighter.animationRows.find((row) => row.animationId === "blockstun");

      expect(blockstunRow?.provenance.status).toBe("approved");
      expect(blockstunRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/blockstun.png`);
      expect(blockstunRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/blockstun.png`);
      expect(blockstunRow?.provenance.license.kind).toBe("owned-generated");
      expect(blockstunRow?.provenance.approvalNotes).toContain("Approved runtime blockstun row");
      expect(blockstunRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(blockstunRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), blockstunRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", blockstunRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved heavy-punch source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const heavyPunchRow = fighter.animationRows.find((row) => row.animationId === "heavy-punch");

      expect(heavyPunchRow?.provenance.status).toBe("approved");
      expect(heavyPunchRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/heavy-punch.png`);
      expect(heavyPunchRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/heavy-punch.png`);
      expect(heavyPunchRow?.provenance.license.kind).toBe("owned-generated");
      expect(heavyPunchRow?.provenance.approvalNotes).toContain("Approved runtime heavy-punch row");
      expect(heavyPunchRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(heavyPunchRow?.provenance.approvalNotes).toContain("deterministic transparent source construction");
      expect(existsSync(join(process.cwd(), heavyPunchRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", heavyPunchRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved light-kick source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const lightKickRow = fighter.animationRows.find((row) => row.animationId === "light-kick");

      expect(lightKickRow?.provenance.status).toBe("approved");
      expect(lightKickRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/light-kick.png`);
      expect(lightKickRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/light-kick.png`);
      expect(lightKickRow?.provenance.license.kind).toBe("owned-generated");
      expect(lightKickRow?.provenance.approvalNotes).toContain("Approved runtime light-kick row");
      expect(lightKickRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(lightKickRow?.provenance.approvalNotes).toContain("chroma-key removed to transparent alpha");
      expect(existsSync(join(process.cwd(), lightKickRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", lightKickRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved special source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const specialRow = fighter.animationRows.find((row) => row.animationId === "special");

      expect(specialRow?.provenance.status).toBe("approved");
      expect(specialRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/special.png`);
      expect(specialRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/special.png`);
      expect(specialRow?.provenance.license.kind).toBe("owned-generated");
      expect(specialRow?.provenance.approvalNotes).toContain("Approved runtime special row");
      expect(specialRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(specialRow?.provenance.approvalNotes).toContain("magenta chroma-key removed to transparent alpha");
      expect(existsSync(join(process.cwd(), specialRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", specialRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved knockdown source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const knockdownRow = fighter.animationRows.find((row) => row.animationId === "knockdown");

      expect(knockdownRow?.provenance.status).toBe("approved");
      expect(knockdownRow?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/knockdown.png`);
      expect(knockdownRow?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/knockdown.png`);
      expect(knockdownRow?.provenance.license.kind).toBe("owned-generated");
      expect(knockdownRow?.provenance.approvalNotes).toContain("Approved runtime knockdown row");
      expect(knockdownRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(knockdownRow?.provenance.approvalNotes).toContain("no crawl/rest/sleeping");
      expect(existsSync(join(process.cwd(), knockdownRow?.provenance.sourcePath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), "public", knockdownRow?.provenance.runtimePath ?? ""))).toBe(true);
    }
  });

  it("tracks approved win and lose source and runtime files", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      for (const animationId of ["win", "lose"] as const) {
        const row = fighter.animationRows.find((candidate) => candidate.animationId === animationId);

        expect(row?.provenance.status).toBe("approved");
        expect(row?.provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/${animationId}.png`);
        expect(row?.provenance.runtimePath).toBe(`/assets/generated/fighters/${fighter.id}/${animationId}.png`);
        expect(row?.provenance.license.kind).toBe("owned-generated");
        expect(row?.provenance.approvalNotes).toContain(`Approved runtime ${animationId} row`);
        expect(row?.provenance.approvalNotes).toContain("upright two-legged");
        expect(existsSync(join(process.cwd(), row?.provenance.sourcePath ?? ""))).toBe(true);
        expect(existsSync(join(process.cwd(), "public", row?.provenance.runtimePath ?? ""))).toBe(true);
      }
    }
  });

  it("tracks approved style-lock canonical sheet source files without approving runtime use", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const provenance = fighter.canonicalSheet.provenance;

      expect(fighter.canonicalSheet.styleLockApproved).toBe(true);
      expect(provenance.status).toBe("generated");
      expect(provenance.sourceKind).toBe("codex-imagegen");
      expect(provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/canonical-character-sheet.png`);
      expect(provenance.runtimePath).toBeNull();
      expect(provenance.license.kind).toBe("owned-generated");
      expect(provenance.createdOrDownloadedOn).toBe("2026-05-14");
      expect(provenance.approvalNotes).toContain("Approved as animation style-lock reference only");
      expect(provenance.approvalNotes).toContain("upright two-legged");
      expect(existsSync(join(process.cwd(), provenance.sourcePath ?? ""))).toBe(true);
    }
  });

  it("includes canonical sheet prompts with the required production-sheet structure", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const prompt = fighter.canonicalSheet.provenance.prompt;

      expect(fighter.canonicalSheet.requiredBeforeAnimationRows).toBe(true);
      expect(prompt).toContain(fighter.displayName);
      expect(prompt).toContain("front view, side view, back view, 3/4 heroic pose");
      expect(prompt).toContain("action-ready fighting pose");
      expect(prompt).toContain("relaxed idle pose");
      expect(prompt).toContain("large head close-up");
      expect(prompt).toContain("expression sheet");
      expect(prompt).toContain("size reference");
      expect(prompt).toContain("color swatches");
      expect(prompt).toContain("upright two-legged fighting-game rig");
      expect(prompt).toContain("normal stance conventions");
    }
  });

  it("keeps every planned animation row tied to the same two-legged rig", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      for (const row of fighter.animationRows) {
        expect(row.provenance.prompt).toContain("upright two-legged fighting-game rig");
        expect(row.provenance.prompt).toContain("normal stance conventions");
      }
    }
  });

  it("validates provenance and manifest gates", () => {
    const result = validateMeowtalProductionManifest();

    expect(result).toEqual({ ok: true, errors: [] });
  });
});
