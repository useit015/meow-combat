import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface NormalizeResult {
  normalized: Array<{
    fighterId: string;
    input: string;
    output: string;
    sourceDimensions: { width: number; height: number };
    normalizedDimensions: { width: number; height: number };
  }>;
}

describe("idle row normalization", () => {
  it("creates exact 8x256x256 QA artifacts from generated source rows", () => {
    const output = execFileSync("node", ["scripts/normalize-idle-rows.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const result = JSON.parse(output) as NormalizeResult;

    expect(result.normalized.map((row) => row.fighterId).sort()).toEqual(["atlas-lion", "sahara-viper"]);
    for (const row of result.normalized) {
      expect(row.output).toBe(`output/imagegen/${row.fighterId}-idle-normalized.png`);
      expect(row.sourceDimensions.width).toBeGreaterThan(0);
      expect(row.sourceDimensions.height).toBeGreaterThan(0);
      expect(row.normalizedDimensions).toEqual({ width: 2048, height: 256 });
      expect(readPngColorType(row.output)).toBe(6);
    }
  });
});

function readPngColorType(path: string): number {
  return readFileSync(path).readUInt8(25);
}
