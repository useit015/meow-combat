import { describe, expect, it } from "vitest";
import type { FighterState } from "../src/core";
import {
  animationIdForFighterState,
  fighterAssetManifests,
  renderAssetForAnimationId,
  renderAssetForState,
  validateFighterManifest,
} from "../src/assets";

const COMBAT_STATES: readonly FighterState[] = [
  "idle",
  "walkForward",
  "walkBack",
  "crouch",
  "jump",
  "hop",
  "runForward",
  "backdash",
  "rollForward",
  "rollBack",
  "lightAttack",
  "lightKick",
  "heavyAttack",
  "specialAttack",
  "superAttack",
  "hitstun",
  "blockstun",
  "knockdown",
];

describe("fighter animation map", () => {
  it("maps every combat state to an existing manifest animation row", () => {
    for (const manifest of fighterAssetManifests) {
      expect(validateFighterManifest(manifest)).toEqual({ ok: true, errors: [] });

      for (const state of COMBAT_STATES) {
        const animationId = animationIdForFighterState(state);
        expect(manifest.animations.some((animation) => animation.id === animationId)).toBe(true);
      }
    }
  });

  it("exposes approved idle rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "idle");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "idle",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/idle.png`,
        usesProceduralFallback: false,
      });
      expect(renderAsset.frameCount).toBeGreaterThan(0);
    }
  });

  it("exposes approved walk-forward rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "walkForward");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "walk-forward",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/walk-forward.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved walk-back rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "walkBack");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "walk-back",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/walk-back.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved crouch rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "crouch");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "crouch",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/crouch.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved jump rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "jump");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "jump",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/jump.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved light-punch rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "lightAttack");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "light-punch",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/light-punch.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved light-kick rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "lightKick");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "light-kick",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/light-kick.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved heavy-punch rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "heavyAttack");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "heavy-punch",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/heavy-punch.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved special rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "specialAttack");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "special",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/special.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved hitstun rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "hitstun");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "hitstun",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/hitstun.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved blockstun rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "blockstun");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "blockstun",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/blockstun.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved knockdown rows for runtime sprite rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForState(manifest, "knockdown");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "knockdown",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/knockdown.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved win rows for match-presentation rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForAnimationId(manifest, "win");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "win",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/win.png`,
        usesProceduralFallback: false,
      });
    }
  });

  it("exposes approved lose rows for match-presentation rendering", () => {
    for (const manifest of fighterAssetManifests) {
      const renderAsset = renderAssetForAnimationId(manifest, "lose");

      expect(renderAsset).toMatchObject({
        fighterId: manifest.id,
        animationId: "lose",
        sourceStatus: "approved",
        outputPath: `/assets/generated/fighters/${manifest.id}/lose.png`,
        usesProceduralFallback: false,
      });
    }
  });
});
