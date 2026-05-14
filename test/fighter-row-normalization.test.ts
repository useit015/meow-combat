import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface NormalizeResult {
  animationId: string;
  normalized: Array<{
    fighterId: string;
    animationId: string;
    input: string;
    output: string;
    sourceDimensions: { width: number; height: number };
    normalizedDimensions: { width: number; height: number };
  }>;
}

describe("fighter row normalization", () => {
  it("normalizes the requested animation into runtime-cell QA rows", () => {
    const output = execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "idle"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const result = JSON.parse(output) as NormalizeResult;

    expect(result.animationId).toBe("idle");
    expect(result.normalized.map((row) => `${row.fighterId}:${row.animationId}`).sort()).toEqual([
      "atlas-lion:idle",
      "sahara-viper:idle",
    ]);

    for (const row of result.normalized) {
      expect(row.output).toBe(`output/imagegen/${row.fighterId}-idle-normalized.png`);
      expect(row.sourceDimensions.width).toBeGreaterThan(0);
      expect(row.sourceDimensions.height).toBeGreaterThan(0);
      expect(row.normalizedDimensions).toEqual({ width: 2048, height: 256 });
      expect(readPngColorType(row.output)).toBe(6);

      const stats = readFrameAlphaStats(row.output, row.normalizedDimensions, 8);
      expect(Math.min(...stats.heights)).toBeGreaterThan(180);
      expect(Math.max(...stats.bottomMargins)).toBeLessThan(36);
    }
  });

  it("preserves transparent source padding instead of turning it into opaque black cells", () => {
    const output = execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "crouch"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const result = JSON.parse(output) as NormalizeResult;

    expect(result.animationId).toBe("crouch");
    for (const row of result.normalized) {
      expect(row.normalizedDimensions).toEqual({ width: 1024, height: 256 });
      expect(readPngColorType(row.output)).toBe(6);

      const stats = readRgbaStats(row.output, row.normalizedDimensions);
      expect(stats.transparent).toBeGreaterThan(150_000);
      expect(stats.opaqueBlack).toBeLessThan(30_000);
    }
  });
});

function readPngColorType(path: string): number {
  return readFileSync(path).readUInt8(25);
}

function readFrameAlphaStats(path: string, dimensions: { width: number; height: number }, frameCount: number) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], {
    maxBuffer: dimensions.width * dimensions.height * 4 + 1024,
  });
  const frameWidth = dimensions.width / frameCount;
  const heights: number[] = [];
  const bottomMargins: number[] = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    let minY = dimensions.height;
    let maxY = -1;
    for (let y = 0; y < dimensions.height; y += 1) {
      for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x += 1) {
        const alpha = raw[(y * dimensions.width + x) * 4 + 3];
        if (alpha > 20) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    heights.push(maxY >= 0 ? maxY - minY + 1 : 0);
    bottomMargins.push(maxY >= 0 ? dimensions.height - 1 - maxY : dimensions.height);
  }

  return { heights, bottomMargins };
}

function readRgbaStats(path: string, dimensions: { width: number; height: number }) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], {
    maxBuffer: dimensions.width * dimensions.height * 4 + 1024,
  });
  let transparent = 0;
  let opaqueBlack = 0;

  for (let index = 0; index < raw.length; index += 4) {
    const red = raw[index];
    const green = raw[index + 1];
    const blue = raw[index + 2];
    const alpha = raw[index + 3];

    if (alpha === 0) transparent += 1;
    if (alpha === 255 && red < 4 && green < 4 && blue < 4) opaqueBlack += 1;
  }

  return { transparent, opaqueBlack };
}
