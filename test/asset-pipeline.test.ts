import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  REQUIRED_FIGHTER_ANIMATIONS,
  fighterAssetManifests,
  meowtalFighterAssetManifests,
  pawbreakerPlannedFighterAssetManifests,
  stageAssetManifests,
  validateFighterManifest,
  validateStageManifest,
} from "../src/assets";

describe("fighter asset manifests", () => {
  it("define every required production animation for each fighter", () => {
    for (const manifest of fighterAssetManifests) {
      const animationIds = manifest.animations.map((animation) => animation.id);
      expect(animationIds).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    }
  });

  it("promotes Pickles rows as approved runtime sprites from the accepted source set", () => {
    const pickles = meowtalFighterAssetManifests.find((manifest) => manifest.id === "pugilist-pug");

    expect(pickles?.displayName).toBe("Pickles Pugilist");
    expect(pickles?.animations.map((animation) => animation.id)).toEqual(REQUIRED_FIGHTER_ANIMATIONS);
    for (const animation of pickles?.animations ?? []) {
      expect(animation.source.status).toBe("approved");
      expect(animation.source.outputPath).toBe(`/assets/generated/fighters/pugilist-pug/${animation.id}.png`);
      expect(existsSync(`public${animation.source.outputPath}`)).toBe(true);
      expect(existsSync(`assets/source/imagegen/fighters/pugilist-pug/${animation.id}.png`)).toBe(true);
    }
  });

  it("validates generated canonical references while animation rows remain unapproved until QA", () => {
    for (const manifest of fighterAssetManifests) {
      expect(validateFighterManifest(manifest)).toEqual({ ok: true, errors: [] });
      expect(manifest.canonicalReference.status).toBe("generated");
      expect(manifest.canonicalReference.outputPath).toContain("assets/source/imagegen/fighters/");
      expect(existsSync(manifest.canonicalReference.outputPath ?? "")).toBe(true);
    }
  });

  it("requires production-sized animation cells and anti-trademark constraints", () => {
    for (const manifest of fighterAssetManifests) {
      for (const animation of manifest.animations) {
        expect(animation.cellSize.width).toBeGreaterThanOrEqual(256);
        expect(animation.cellSize.height).toBeGreaterThanOrEqual(256);
        if (
          animation.id === "idle" ||
          animation.id === "walk-forward" ||
          animation.id === "walk-back" ||
          animation.id === "crouch" ||
          animation.id === "jump" ||
          animation.id === "light-punch" ||
          animation.id === "light-kick" ||
          animation.id === "heavy-punch" ||
          animation.id === "special" ||
          animation.id === "hitstun" ||
          animation.id === "blockstun" ||
          animation.id === "knockdown" ||
          animation.id === "win" ||
          animation.id === "lose"
        ) {
          expect(animation.source.status).toBe("approved");
          expect(animation.source.outputPath).toBe(`/assets/generated/fighters/${manifest.id}/${animation.id}.png`);
          expect(existsSync(`public${animation.source.outputPath}`)).toBe(true);
        } else {
          expect(animation.source.status).toBe("blocked");
          expect(animation.source.blocker).toContain("OPENAI_API_KEY");
        }
        expect(animation.constraints.join(" ")).toContain("No logos");
      }
    }
  });

  it("requires identity-lock and no-slop production rules before fighter runtime promotion", () => {
    for (const manifest of fighterAssetManifests) {
      expect(manifest.identityLock.canonicalReferenceRequired).toBe(true);
      expect(manifest.identityLock.scaleReferenceAnimation).toBe("idle");
      expect(manifest.identityLock.lockedTraits).toEqual(
        expect.arrayContaining(["proportions", "markings", "face shape", "silhouette"]),
      );
      expect(manifest.identityLock.forbiddenDrift).toEqual(
        expect.arrayContaining(["size drift", "identity drift", "warped anatomy", "baked text or logos"]),
      );
      expect(manifest.productionAcceptance.modelSheetRequiredBeforeAnimation).toBe(true);
      expect(manifest.productionAcceptance.runtimePromotionChecks).toEqual(
        expect.arrayContaining(["exact frame-cell dimensions", "alpha channel present", "stable alpha bounds"]),
      );
      expect(manifest.productionAcceptance.rejectionReasons).toContain("generic AI-looking output");
    }
  });

  it("keeps planned Pawbreaker roster additions source-only until full animation approval", () => {
    const expectedNames = {
      "ferret-noodle": "Noodle Nibbles",
      "tortoise-tofu": "Tofu Tortoise",
      "budgie-beanie": "Beanie Beak",
      "hamster-mochi": "Mochi Munch",
      "hedgehog-quillabelle": "Quillabelle Prickles",
    } as const;

    expect(pawbreakerPlannedFighterAssetManifests.map((manifest) => manifest.id)).toEqual(Object.keys(expectedNames));
    const generatedNoodleRows = new Map([
      ["idle", "assets/source/imagegen/fighters/ferret-noodle/idle.png"],
      ["walk-forward", "assets/source/imagegen/fighters/ferret-noodle/walk-forward.png"],
      ["walk-back", "assets/source/imagegen/fighters/ferret-noodle/walk-back.png"],
      ["crouch", "assets/source/imagegen/fighters/ferret-noodle/crouch.png"],
      ["jump", "assets/source/imagegen/fighters/ferret-noodle/jump.png"],
      ["light-punch", "assets/source/imagegen/fighters/ferret-noodle/light-punch.png"],
      ["heavy-punch", "assets/source/imagegen/fighters/ferret-noodle/heavy-punch.png"],
      ["light-kick", "assets/source/imagegen/fighters/ferret-noodle/light-kick.png"],
      ["special", "assets/source/imagegen/fighters/ferret-noodle/special.png"],
      ["hitstun", "assets/source/imagegen/fighters/ferret-noodle/hitstun.png"],
      ["blockstun", "assets/source/imagegen/fighters/ferret-noodle/blockstun.png"],
    ]);

    for (const manifest of pawbreakerPlannedFighterAssetManifests) {
      expect(manifest.displayName).toBe(expectedNames[manifest.id as keyof typeof expectedNames]);
      expect(manifest.canonicalReference).toMatchObject({
        status: "generated",
        outputPath: `assets/source/imagegen/fighters/${manifest.id}/canonical-character-sheet.png`,
      });
      expect(existsSync(manifest.canonicalReference.outputPath ?? "")).toBe(true);
      expect(validateFighterManifest(manifest)).toEqual({ ok: true, errors: [] });
      expect(manifest.animations).toHaveLength(REQUIRED_FIGHTER_ANIMATIONS.length);
      for (const animation of manifest.animations) {
        const generatedOutputPath = manifest.id === "ferret-noodle" ? generatedNoodleRows.get(animation.id) : undefined;
        if (generatedOutputPath) {
          expect(animation.source.status).toBe("generated");
          expect(animation.source.outputPath).toBe(generatedOutputPath);
          expect(existsSync(animation.source.outputPath ?? "")).toBe(true);
        } else {
          expect(animation.source.status).toBe("blocked");
          expect(animation.source.outputPath).toBeNull();
          expect(animation.source.blocker).toContain("source-only model sheet");
        }
      }
    }
  });
});

describe("stage asset manifests", () => {
  it("define approved generated Moroccan stage layers ready for runtime", () => {
    for (const manifest of stageAssetManifests) {
      expect(validateStageManifest(manifest)).toEqual({ ok: true, errors: [] });
      expect(manifest.layers.length).toBeGreaterThanOrEqual(3);
      expect(manifest.designNotes.join(" ")).toContain("zellige");
      for (const layer of manifest.layers) {
        expect(layer.source.status).toBe("approved");
        expect(layer.source.outputPath).toBe(`/assets/generated/stages/${manifest.id}/${layer.id}.png`);
        expect(existsSync(`public${layer.source.outputPath}`)).toBe(true);
      }
    }
  });
});
