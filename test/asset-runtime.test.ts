import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  meowtalFighterAssetManifests,
  meowtalStageAssetManifests,
  renderAssetForAnimationId,
  renderAssetForState,
  resolveFighterRuntimeAsset,
  resolveManifestRuntimeAsset,
  resolveManifestRuntimeAssetForSnapshot,
  resolveStageRuntimeLayers,
  runtimeAssetKey,
  stageLayerAssetKey,
  visualStateForSnapshot,
  type FighterAssetManifest,
} from "../src/assets";
import type { FighterState } from "../src/core";
import { RUNTIME_UI_IMAGE_SPECS, meowtalKombatConfig } from "../src/game/gameConfig";
import { spriteStanceConventionForAnimation } from "../src/game/spriteFrame";

const PUBLIC_ROOT = join(process.cwd(), "public");
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;
const UI_CANDIDATE_ROOT = join(process.cwd(), "assets/source/imagegen/ui/meowtal/candidates");
const codexUiCandidatePaths = [
  "logo-title-mark-codex-01.png",
  "fight-ko-victory-overlays-codex-01.png",
  "hud-frame-codex-01.png",
  "health-bar-rabbit-codex-01.png",
  "health-bar-cat-codex-01.png",
  "super-meter-codex-01.png",
  "timer-frame-codex-01.png",
] as const;
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

  it("routes held neutral guard to the approved defensive walk-back row", () => {
    const guardedIdle = { state: "idle" as const, guarding: true };

    expect(visualStateForSnapshot(guardedIdle)).toBe("walkBack");
    expect(resolveManifestRuntimeAssetForSnapshot(rabbitManifest, guardedIdle)).toMatchObject({
      kind: "sprite",
      assetKey: "gray-rabbit:walk-back",
      animationId: "walk-back",
      path: "/assets/generated/fighters/gray-rabbit/walk-back.png",
    });
    expect(visualStateForSnapshot({ state: "lightAttack", guarding: true })).toBe("lightAttack");
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

  it("points every routed runtime UI asset at an existing runtime PNG", () => {
    for (const asset of meowtalKombatConfig.runtimeUiAssets) {
      expect(asset.path).toMatch(
        asset.id === "title-crest"
          ? /^\/assets\/generated\/ui\/pawbreaker\/title-crest\.png$/
          : /^\/assets\/generated\/ui\/meowtal\/.+\.png$/,
      );
      expect(existsSync(join(process.cwd(), "public", asset.path))).toBe(true);
    }
  });

  it("keeps approved public fighter spritesheets on the manifest frame-cell contract", () => {
    for (const manifest of meowtalFighterAssetManifests) {
      expect(manifest.identityLock.scaleReferenceAnimation).toBe("idle");
      expect(manifest.productionAcceptance.runtimePromotionChecks).toContain("source and runtime provenance recorded");

      for (const animation of manifest.animations) {
        const runtimeAsset = resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, animation.id));

        expect(runtimeAsset.kind).toBe("sprite");
        if (runtimeAsset.kind !== "sprite") continue;

        expect(pngDimensions(runtimeAsset.path)).toEqual({
          width: runtimeAsset.frameCount * runtimeAsset.frameWidth,
          height: runtimeAsset.frameHeight,
        });
        expect(runtimeAsset.frameWidth).toBe(256);
        expect(runtimeAsset.frameHeight).toBe(256);
      }
    }
  });

  it("keeps approved public stage and sheet-style UI images on the 1024x576 runtime contract", () => {
    for (const layer of resolveStageRuntimeLayers(meowtalKombatConfig.stage)) {
      expect(layer.kind).toBe("image-layer");
      expect(layer.outputPath).toBeTruthy();
      expect(pngDimensions(layer.outputPath ?? "")).toEqual({ width: GAME_WIDTH, height: GAME_HEIGHT });
    }

    for (const asset of meowtalKombatConfig.runtimeUiAssets) {
      if (asset.id === "title-crest") {
        expect(pngDimensions(asset.path)).toEqual({ width: 1672, height: 941 });
        expect(pngHasAlpha(asset.path)).toBe(true);
        continue;
      }
      expect(pngDimensions(asset.path)).toEqual({ width: GAME_WIDTH, height: GAME_HEIGHT });
    }
  });

  it("keeps runtime UI crop specs inside their source sheets and canvas placements", () => {
    const uiPathById = new Map(meowtalKombatConfig.runtimeUiAssets.map((asset) => [asset.id, asset.path]));

    for (const spec of RUNTIME_UI_IMAGE_SPECS) {
      const path = uiPathById.get(spec.assetId);
      expect(path, `${spec.slot} should point at a configured runtime UI asset`).toBeTruthy();
      const dimensions = pngDimensions(path ?? "");

      expect(spec.crop.x).toBeGreaterThanOrEqual(0);
      expect(spec.crop.y).toBeGreaterThanOrEqual(0);
      expect(spec.crop.x + spec.crop.width).toBeLessThanOrEqual(dimensions.width);
      expect(spec.crop.y + spec.crop.height).toBeLessThanOrEqual(dimensions.height);
      expect(spec.x - spec.width / 2).toBeGreaterThanOrEqual(0);
      expect(spec.y - spec.height / 2).toBeGreaterThanOrEqual(0);
      expect(spec.x + spec.width / 2).toBeLessThanOrEqual(GAME_WIDTH);
      expect(spec.y + spec.height / 2).toBeLessThanOrEqual(GAME_HEIGHT);
    }
  });

  it("keeps Codex-regenerated presentation UI candidates on the source-sheet alpha contract", () => {
    for (const candidatePath of codexUiCandidatePaths) {
      const fullPath = join(UI_CANDIDATE_ROOT, candidatePath);
      expect(existsSync(fullPath), `${candidatePath} should exist`).toBe(true);
      expect(pngDimensions(fullPath, { publicPath: false })).toEqual({ width: GAME_WIDTH, height: GAME_HEIGHT });
      expect(pngHasAlpha(fullPath, { publicPath: false })).toBe(true);
    }
  });
});

function pngDimensions(path: string, options: { publicPath?: boolean } = {}): { width: number; height: number } {
  const buffer = readPng(path, options);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function pngHasAlpha(path: string, options: { publicPath?: boolean } = {}): boolean {
  const buffer = readPng(path, options);
  const colorType = buffer.readUInt8(25);
  return colorType === 4 || colorType === 6;
}

function readPng(path: string, options: { publicPath?: boolean } = {}): Buffer {
  const buffer = readFileSync(options.publicPath === false ? path : join(PUBLIC_ROOT, path));
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return buffer;
}
