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
  it("defines the production asset families without approving runtime files", () => {
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
    expect(entries).toHaveLength(2 + 2 * REQUIRED_FIGHTER_ANIMATIONS.length + 6 + 15 + 11);
    expect(entries.every((entry) => entry.runtimePath === null)).toBe(true);
    expect(entries.every((entry) => entry.status !== "approved")).toBe(true);
  });

  it("keeps animation rows blocked until canonical character sheets are approved", () => {
    expect(canonicalSheetsApproved()).toBe(false);

    const blockedRows = blockedAnimationRowsUntilCanonicalApproved();
    expect(blockedRows).toHaveLength(2 * REQUIRED_FIGHTER_ANIMATIONS.length);
    expect(blockedRows.every((row) => row.provenance.status === "blocked")).toBe(true);
    expect(blockedRows.every((row) => row.provenance.blocker?.includes("canonical character sheet"))).toBe(true);
  });

  it("tracks generated canonical sheet source files without approving them for runtime", () => {
    for (const fighter of meowtalProductionManifest.fighters) {
      const provenance = fighter.canonicalSheet.provenance;

      expect(provenance.status).toBe("generated");
      expect(provenance.sourceKind).toBe("codex-imagegen");
      expect(provenance.sourcePath).toBe(`assets/source/imagegen/fighters/${fighter.id}/canonical-character-sheet.png`);
      expect(provenance.runtimePath).toBeNull();
      expect(provenance.license.kind).toBe("owned-generated");
      expect(provenance.createdOrDownloadedOn).toBe("2026-05-14");
      expect(provenance.approvalNotes).toContain("Generated canonical sheet candidate");
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
