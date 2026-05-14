import { describe, expect, it } from "vitest";
import { resolveStageRuntimeLayers, stageAssetManifests, stageLayerAssetKey } from "../src/assets";

describe("stage runtime resolver", () => {
  it("promotes approved stage layers to runtime image layers", () => {
    const layers = resolveStageRuntimeLayers(stageAssetManifests[0]);

    expect(layers).toHaveLength(stageAssetManifests[0].layers.length);
    for (const [index, layer] of layers.entries()) {
      expect(layer).toMatchObject({
        kind: "image-layer",
        stageId: "marrakesh-rooftop",
        sourceStatus: "approved",
        outputPath: stageAssetManifests[0].layers[index].source.outputPath,
      });
      expect(layer.reason).toBeUndefined();
      expect(layer.promptIntent.length).toBeGreaterThan(0);
    }
  });

  it("promotes only approved layers with output paths to image layers", () => {
    const manifest = {
      ...stageAssetManifests[0],
      layers: [
        {
          ...stageAssetManifests[0].layers[0],
          source: {
            status: "approved" as const,
            promptSlug: "approved-sky",
            outputPath: "assets/source/imagegen/stages/marrakesh-rooftop/sky.png",
          },
        },
      ],
    };

    expect(resolveStageRuntimeLayers(manifest)).toEqual([
      {
        kind: "image-layer",
        stageId: "marrakesh-rooftop",
        layerId: "sky",
        assetKey: "marrakesh-rooftop:sky",
        parallax: 0.1,
        sourceStatus: "approved",
        outputPath: "assets/source/imagegen/stages/marrakesh-rooftop/sky.png",
        promptIntent: stageAssetManifests[0].layers[0].promptIntent,
      },
    ]);
  });

  it("fails closed for approved layers without output paths", () => {
    const manifest = {
      ...stageAssetManifests[0],
      layers: [
        {
          ...stageAssetManifests[0].layers[0],
          source: {
            status: "approved" as const,
            promptSlug: "approved-missing-path",
            outputPath: null,
          },
        },
      ],
    };

    expect(resolveStageRuntimeLayers(manifest)[0]).toMatchObject({
      kind: "procedural-fallback",
      sourceStatus: "approved",
      reason: "missing-output-path",
    });
  });

  it("uses stable stage layer keys", () => {
    expect(stageLayerAssetKey("marrakesh-rooftop", "foreground-props")).toBe(
      "marrakesh-rooftop:foreground-props",
    );
  });
});
