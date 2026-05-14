import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  renderAssetForAnimationId,
  renderAssetForState,
  resolveFighterRuntimeAsset,
  resolveManifestRuntimeAsset,
  resolveStageRuntimeLayers,
  runtimeAssetKey,
  stageLayerAssetKey,
  type FighterAssetManifest,
} from "../src/assets";
import type { FighterState } from "../src/core";
import { meowtalKombatConfig } from "../src/game/gameConfig";
import { spriteStanceConventionForAnimation } from "../src/game/spriteFrame";

const rabbitManifest = manifestById("gray-rabbit");
const catManifest = manifestById("ginger-tabby-cat");
const uprightRuntimeStates = [
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
] as const satisfies readonly FighterState[];

function manifestById(id: string): FighterAssetManifest {
  const manifest = meowtalFighterAssetManifests.find((candidate) => candidate.id === id);
  if (!manifest) {
    throw new Error(`Missing test manifest for ${id}`);
  }
  return manifest;
}

describe("asset runtime resolver", () => {
  it("promotes approved Meowtal manifest rows to runtime sprites", () => {
    const expectations = [
      { state: "idle", animationId: "idle", path: "/assets/generated/fighters/gray-rabbit/idle.png", frameCount: 8 },
      {
        state: "walkForward",
        animationId: "walk-forward",
        path: "/assets/generated/fighters/gray-rabbit/walk-forward.png",
        frameCount: 8,
      },
      {
        state: "walkBack",
        animationId: "walk-back",
        path: "/assets/generated/fighters/gray-rabbit/walk-back.png",
        frameCount: 8,
      },
      { state: "crouch", animationId: "crouch", path: "/assets/generated/fighters/gray-rabbit/crouch.png", frameCount: 4 },
      { state: "jump", animationId: "jump", path: "/assets/generated/fighters/gray-rabbit/jump.png", frameCount: 6 },
      {
        state: "lightAttack",
        animationId: "light-punch",
        path: "/assets/generated/fighters/gray-rabbit/light-punch.png",
        frameCount: 6,
      },
      {
        state: "lightKick",
        animationId: "light-kick",
        path: "/assets/generated/fighters/gray-rabbit/light-kick.png",
        frameCount: 8,
      },
      {
        state: "heavyAttack",
        animationId: "heavy-punch",
        path: "/assets/generated/fighters/gray-rabbit/heavy-punch.png",
        frameCount: 8,
      },
      {
        state: "specialAttack",
        animationId: "special",
        path: "/assets/generated/fighters/gray-rabbit/special.png",
        frameCount: 10,
      },
      {
        state: "hitstun",
        animationId: "hitstun",
        path: "/assets/generated/fighters/gray-rabbit/hitstun.png",
        frameCount: 5,
      },
      {
        state: "blockstun",
        animationId: "blockstun",
        path: "/assets/generated/fighters/gray-rabbit/blockstun.png",
        frameCount: 5,
      },
      {
        state: "knockdown",
        animationId: "knockdown",
        path: "/assets/generated/fighters/gray-rabbit/knockdown.png",
        frameCount: 8,
      },
    ] as const;

    for (const expected of expectations) {
      expect(resolveFighterRuntimeAsset(renderAssetForState(rabbitManifest, expected.state))).toEqual({
        kind: "sprite",
        assetKey: `gray-rabbit:${expected.animationId}`,
        fighterId: "gray-rabbit",
        animationId: expected.animationId,
        path: expected.path,
        frameCount: expected.frameCount,
        frameWidth: 256,
        frameHeight: 256,
      });
    }
  });

  it("promotes only approved rows with output paths to sprites", () => {
    const renderAsset = renderAssetForState(rabbitManifest, "heavyAttack");
    const runtimeAsset = resolveFighterRuntimeAsset({
      ...renderAsset,
      sourceStatus: "approved",
      outputPath: "assets/source/imagegen/fighters/gray-rabbit/heavy-punch.png",
      usesProceduralFallback: false,
    });

    expect(runtimeAsset).toEqual({
      kind: "sprite",
      assetKey: "gray-rabbit:heavy-punch",
      fighterId: "gray-rabbit",
      animationId: "heavy-punch",
      path: "assets/source/imagegen/fighters/gray-rabbit/heavy-punch.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
  });

  it("does not treat generated-but-unapproved rows as runtime sprites", () => {
    const renderAsset = renderAssetForState(catManifest, "lightAttack");

    expect(
      resolveFighterRuntimeAsset({
        ...renderAsset,
        sourceStatus: "generated",
        outputPath: "assets/source/imagegen/fighters/ginger-tabby-cat/light-punch.png",
      }),
    ).toMatchObject({
      kind: "procedural-fallback",
      sourceStatus: "generated",
      outputPath: "assets/source/imagegen/fighters/ginger-tabby-cat/light-punch.png",
      reason: "source-not-approved",
    });
  });

  it("resolves playable light-kick to approved Meowtal runtime sprites", () => {
    expect(resolveManifestRuntimeAsset(rabbitManifest, "lightKick")).toMatchObject({
      kind: "sprite",
      assetKey: "gray-rabbit:light-kick",
      path: "/assets/generated/fighters/gray-rabbit/light-kick.png",
    });
  });

  it("resolves approved win rows for match-presentation sprites", () => {
    const renderAsset = renderAssetForAnimationId(rabbitManifest, "win");

    expect(resolveFighterRuntimeAsset(renderAsset)).toMatchObject({
      kind: "sprite",
      assetKey: "gray-rabbit:win",
      path: "/assets/generated/fighters/gray-rabbit/win.png",
      frameCount: 8,
    });
  });

  it("resolves approved lose rows for match-presentation sprites", () => {
    const renderAsset = renderAssetForAnimationId(catManifest, "lose");

    expect(resolveFighterRuntimeAsset(renderAsset)).toMatchObject({
      kind: "sprite",
      assetKey: "ginger-tabby-cat:lose",
      path: "/assets/generated/fighters/ginger-tabby-cat/lose.png",
      frameCount: 6,
    });
  });

  it("fails closed when an approved row is missing an output path", () => {
    const renderAsset = renderAssetForState(rabbitManifest, "idle");

    expect(
      resolveFighterRuntimeAsset({
        ...renderAsset,
        sourceStatus: "approved",
        outputPath: null,
      }),
    ).toMatchObject({
      kind: "procedural-fallback",
      reason: "missing-output-path",
      sourceStatus: "approved",
    });
  });

  it("resolves directly from a manifest and combat state", () => {
    expect(resolveManifestRuntimeAsset(catManifest, "blockstun")).toMatchObject({
      kind: "sprite",
      assetKey: "ginger-tabby-cat:blockstun",
    });
  });

  it("keeps rabbit and cat runtime presentation on one upright normal stance convention", () => {
    for (const state of uprightRuntimeStates) {
      const rabbitAsset = resolveManifestRuntimeAsset(rabbitManifest, state);
      const catAsset = resolveManifestRuntimeAsset(catManifest, state);

      expect(catAsset.animationId).toBe(rabbitAsset.animationId);
      expect(spriteStanceConventionForAnimation(rabbitAsset.animationId)).toBe("upright-two-legged");
      expect(spriteStanceConventionForAnimation(catAsset.animationId)).toBe("upright-two-legged");
    }
  });

  it("reserves grounded or prone sprite rows for knockdown and defeat presentation", () => {
    for (const manifest of [rabbitManifest, catManifest]) {
      expect(spriteStanceConventionForAnimation(resolveManifestRuntimeAsset(manifest, "knockdown").animationId)).toBe(
        "grounded-prone-reaction",
      );
      expect(spriteStanceConventionForAnimation(resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, "lose")).animationId)).toBe(
        "grounded-prone-reaction",
      );
      expect(spriteStanceConventionForAnimation(resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, "win")).animationId)).toBe(
        "upright-two-legged",
      );
    }
  });

  it("uses stable runtime asset keys", () => {
    expect(runtimeAssetKey("gray-rabbit", "knockdown")).toBe("gray-rabbit:knockdown");
  });

  it("promotes approved Meowtal courtyard layers to runtime stage images", () => {
    const stage = meowtalStageAssetManifests[0];
    const layers = resolveStageRuntimeLayers(stage);

    expect(stage.id).toBe("meowtal-courtyard");
    expect(layers.map((layer) => layer.layerId)).toEqual([
      "sky-lighting",
      "distant-hills-city",
      "background-walls-pillars",
      "midground-trees-bushes",
      "playfield-stone-courtyard",
      "foreground-dust-leaves",
    ]);
    for (const layer of layers) {
      expect(layer.kind).toBe("image-layer");
      expect(layer.assetKey).toBe(stageLayerAssetKey("meowtal-courtyard", layer.layerId));
      expect(layer.outputPath).toBe(`/assets/generated/stages/meowtal-courtyard/${layer.layerId}.png`);
      expect(layer.sourceStatus).toBe("approved");
    }
  });

  it("points every routed Meowtal UI asset at an existing runtime PNG", () => {
    for (const asset of meowtalKombatConfig.runtimeUiAssets) {
      expect(asset.path).toMatch(/^\/assets\/generated\/ui\/meowtal\/.+\.png$/);
      expect(existsSync(join(process.cwd(), "public", asset.path))).toBe(true);
    }
  });
});
