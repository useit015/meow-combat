import { describe, expect, it } from "vitest";
import {
  fighterAssetManifests,
  renderAssetForAnimationId,
  renderAssetForState,
  resolveFighterRuntimeAsset,
  resolveManifestRuntimeAsset,
  runtimeAssetKey,
} from "../src/assets";

describe("asset runtime resolver", () => {
  it("promotes approved manifest rows to runtime sprites", () => {
    const idleAsset = renderAssetForState(fighterAssetManifests[0], "idle");
    const walkAsset = renderAssetForState(fighterAssetManifests[0], "walkForward");
    const walkBackAsset = renderAssetForState(fighterAssetManifests[0], "walkBack");
    const crouchAsset = renderAssetForState(fighterAssetManifests[0], "crouch");
    const jumpAsset = renderAssetForState(fighterAssetManifests[0], "jump");
    const lightAsset = renderAssetForState(fighterAssetManifests[0], "lightAttack");
    const lightKickAsset = renderAssetForState(fighterAssetManifests[0], "lightKick");
    const heavyAsset = renderAssetForState(fighterAssetManifests[0], "heavyAttack");
    const specialAsset = renderAssetForState(fighterAssetManifests[0], "specialAttack");
    const hitstunAsset = renderAssetForState(fighterAssetManifests[0], "hitstun");
    const blockstunAsset = renderAssetForState(fighterAssetManifests[0], "blockstun");
    const knockdownAsset = renderAssetForState(fighterAssetManifests[0], "knockdown");

    expect(resolveFighterRuntimeAsset(idleAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:idle",
      fighterId: "atlas-lion",
      animationId: "idle",
      path: "/assets/generated/fighters/atlas-lion/idle.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(walkAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:walk-forward",
      fighterId: "atlas-lion",
      animationId: "walk-forward",
      path: "/assets/generated/fighters/atlas-lion/walk-forward.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(walkBackAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:walk-back",
      fighterId: "atlas-lion",
      animationId: "walk-back",
      path: "/assets/generated/fighters/atlas-lion/walk-back.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(crouchAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:crouch",
      fighterId: "atlas-lion",
      animationId: "crouch",
      path: "/assets/generated/fighters/atlas-lion/crouch.png",
      frameCount: 4,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(jumpAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:jump",
      fighterId: "atlas-lion",
      animationId: "jump",
      path: "/assets/generated/fighters/atlas-lion/jump.png",
      frameCount: 6,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(lightAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:light-punch",
      fighterId: "atlas-lion",
      animationId: "light-punch",
      path: "/assets/generated/fighters/atlas-lion/light-punch.png",
      frameCount: 6,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(lightKickAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:light-kick",
      fighterId: "atlas-lion",
      animationId: "light-kick",
      path: "/assets/generated/fighters/atlas-lion/light-kick.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(heavyAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:heavy-punch",
      fighterId: "atlas-lion",
      animationId: "heavy-punch",
      path: "/assets/generated/fighters/atlas-lion/heavy-punch.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(specialAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:special",
      fighterId: "atlas-lion",
      animationId: "special",
      path: "/assets/generated/fighters/atlas-lion/special.png",
      frameCount: 10,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(hitstunAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:hitstun",
      fighterId: "atlas-lion",
      animationId: "hitstun",
      path: "/assets/generated/fighters/atlas-lion/hitstun.png",
      frameCount: 5,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(blockstunAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:blockstun",
      fighterId: "atlas-lion",
      animationId: "blockstun",
      path: "/assets/generated/fighters/atlas-lion/blockstun.png",
      frameCount: 5,
      frameWidth: 256,
      frameHeight: 256,
    });
    expect(resolveFighterRuntimeAsset(knockdownAsset)).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:knockdown",
      fighterId: "atlas-lion",
      animationId: "knockdown",
      path: "/assets/generated/fighters/atlas-lion/knockdown.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
  });

  it("promotes only approved rows with output paths to sprites", () => {
    const renderAsset = renderAssetForState(fighterAssetManifests[0], "heavyAttack");
    const runtimeAsset = resolveFighterRuntimeAsset({
      ...renderAsset,
      sourceStatus: "approved",
      outputPath: "assets/source/imagegen/fighters/atlas-lion/heavy-punch.png",
      usesProceduralFallback: false,
    });

    expect(runtimeAsset).toEqual({
      kind: "sprite",
      assetKey: "atlas-lion:heavy-punch",
      fighterId: "atlas-lion",
      animationId: "heavy-punch",
      path: "assets/source/imagegen/fighters/atlas-lion/heavy-punch.png",
      frameCount: 8,
      frameWidth: 256,
      frameHeight: 256,
    });
  });

  it("does not treat generated-but-unapproved rows as runtime sprites", () => {
    const renderAsset = renderAssetForState(fighterAssetManifests[1], "lightAttack");

    expect(
      resolveFighterRuntimeAsset({
        ...renderAsset,
        sourceStatus: "generated",
        outputPath: "assets/source/imagegen/fighters/sahara-viper/light-punch.png",
      }),
    ).toMatchObject({
      kind: "procedural-fallback",
      sourceStatus: "generated",
      outputPath: "assets/source/imagegen/fighters/sahara-viper/light-punch.png",
      reason: "source-not-approved",
    });
  });

  it("resolves playable light-kick to approved runtime sprites after art approval", () => {
    expect(resolveManifestRuntimeAsset(fighterAssetManifests[0], "lightKick")).toMatchObject({
      kind: "sprite",
      assetKey: "atlas-lion:light-kick",
      path: "/assets/generated/fighters/atlas-lion/light-kick.png",
    });
  });

  it("resolves approved win rows for match-presentation sprites", () => {
    const renderAsset = renderAssetForAnimationId(fighterAssetManifests[0], "win");

    expect(resolveFighterRuntimeAsset(renderAsset)).toMatchObject({
      kind: "sprite",
      assetKey: "atlas-lion:win",
      path: "/assets/generated/fighters/atlas-lion/win.png",
      frameCount: 8,
    });
  });

  it("resolves approved lose rows for match-presentation sprites", () => {
    const renderAsset = renderAssetForAnimationId(fighterAssetManifests[1], "lose");

    expect(resolveFighterRuntimeAsset(renderAsset)).toMatchObject({
      kind: "sprite",
      assetKey: "sahara-viper:lose",
      path: "/assets/generated/fighters/sahara-viper/lose.png",
      frameCount: 6,
    });
  });

  it("fails closed when an approved row is missing an output path", () => {
    const renderAsset = renderAssetForState(fighterAssetManifests[0], "idle");

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
    expect(resolveManifestRuntimeAsset(fighterAssetManifests[0], "blockstun")).toMatchObject({
      kind: "sprite",
      assetKey: "atlas-lion:blockstun",
    });
  });

  it("uses stable runtime asset keys", () => {
    expect(runtimeAssetKey("atlas-lion", "knockdown")).toBe("atlas-lion:knockdown");
  });
});
