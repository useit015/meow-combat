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
      "ginger-tabby-cat:crouch",
      "ginger-tabby-cat:idle",
      "ginger-tabby-cat:jump",
      "ginger-tabby-cat:walk-back",
      "ginger-tabby-cat:walk-forward",
      "gray-rabbit:crouch",
      "gray-rabbit:idle",
      "gray-rabbit:jump",
      "gray-rabbit:walk-back",
      "gray-rabbit:walk-forward",
    ]);
    expect(runtimeEntries.every((entry) => entry.status === "approved")).toBe(true);
  });

  it("tracks approved locomotion/crouch/jump rows, generated light-punch candidates, and remaining blocked rows", () => {
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
    const remainingRows = animationRows.filter(
      (row) =>
        row.animationId !== "idle" &&
        row.animationId !== "walk-forward" &&
        row.animationId !== "walk-back" &&
        row.animationId !== "crouch" &&
        row.animationId !== "jump" &&
        row.animationId !== "light-punch",
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
    expect(lightPunchRows.every((row) => row.provenance.status === "generated")).toBe(true);
    expect(lightPunchRows.every((row) => row.provenance.runtimePath === null)).toBe(true);
    expect(remainingRows.every((row) => row.provenance.status === "blocked")).toBe(true);
    expect(remainingRows.every((row) => row.provenance.blocker?.includes("light-punch row QA"))).toBe(true);
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

  it("tracks generated light-punch source files without approving runtime use", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const lightPunchRow = fighter.animationRows.find((row) => row.animationId === "light-punch");

      expect(lightPunchRow?.provenance.status).toBe("generated");
      expect(lightPunchRow?.provenance.sourcePath).toBe(
        `assets/source/imagegen/fighters/${fighter.id}/light-punch.png`,
      );
      expect(lightPunchRow?.provenance.runtimePath).toBeNull();
      expect(lightPunchRow?.provenance.license.kind).toBe("owned-generated");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("Generated source light-punch row candidate");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("upright two-legged");
      expect(lightPunchRow?.provenance.approvalNotes).toContain("transparent alpha");
      expect(existsSync(join(process.cwd(), lightPunchRow?.provenance.sourcePath ?? ""))).toBe(true);
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
    }
  });

  it("keeps every planned animation row tied to the same two-legged rig", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      for (const row of fighter.animationRows) {
        expect(row.provenance.prompt).toContain("upright two-legged fighting-game rig");
      }
    }
  });

  it("validates provenance and manifest gates", () => {
    const result = validateMeowtalProductionManifest();

    expect(result).toEqual({ ok: true, errors: [] });
  });
});
