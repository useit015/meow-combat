import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

interface AssetQaSummary {
  checked: number;
  runtimeReady: number;
  needsNormalization: number;
  rows: Array<{
    kind: string;
    path: string;
    fighterId: string;
    animationId: string;
    frameCount: number;
    dimensions: { width: number; height: number };
    expected: { width: number; height: number };
    runtimeReady: boolean;
    status: string;
  }>;
}

describe("imagegen asset QA command", () => {
  it("distinguishes source rows from normalized runtime-cell candidates", () => {
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "idle"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "walk-forward"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "walk-back"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "crouch"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "jump"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "light-punch"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "light-kick"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "hitstun"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "blockstun"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "heavy-punch"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "special"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "knockdown"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "win"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "lose"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const output = execFileSync("node", ["scripts/asset-qa.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as AssetQaSummary;

    expect(summary.checked).toBe(56);
    expect(summary.runtimeReady).toBe(28);
    expect(summary.needsNormalization).toBe(28);
    expect(summary.rows.map((row) => `${row.kind}:${row.fighterId}:${row.animationId}`).sort()).toEqual([
      "normalized-candidate:atlas-lion:blockstun",
      "normalized-candidate:atlas-lion:crouch",
      "normalized-candidate:atlas-lion:heavy-punch",
      "normalized-candidate:atlas-lion:hitstun",
      "normalized-candidate:atlas-lion:idle",
      "normalized-candidate:atlas-lion:jump",
      "normalized-candidate:atlas-lion:knockdown",
      "normalized-candidate:atlas-lion:light-kick",
      "normalized-candidate:atlas-lion:light-punch",
      "normalized-candidate:atlas-lion:lose",
      "normalized-candidate:atlas-lion:special",
      "normalized-candidate:atlas-lion:walk-back",
      "normalized-candidate:atlas-lion:walk-forward",
      "normalized-candidate:atlas-lion:win",
      "normalized-candidate:sahara-viper:blockstun",
      "normalized-candidate:sahara-viper:crouch",
      "normalized-candidate:sahara-viper:heavy-punch",
      "normalized-candidate:sahara-viper:hitstun",
      "normalized-candidate:sahara-viper:idle",
      "normalized-candidate:sahara-viper:jump",
      "normalized-candidate:sahara-viper:knockdown",
      "normalized-candidate:sahara-viper:light-kick",
      "normalized-candidate:sahara-viper:light-punch",
      "normalized-candidate:sahara-viper:lose",
      "normalized-candidate:sahara-viper:special",
      "normalized-candidate:sahara-viper:walk-back",
      "normalized-candidate:sahara-viper:walk-forward",
      "normalized-candidate:sahara-viper:win",
      "source:atlas-lion:blockstun",
      "source:atlas-lion:crouch",
      "source:atlas-lion:heavy-punch",
      "source:atlas-lion:hitstun",
      "source:atlas-lion:idle",
      "source:atlas-lion:jump",
      "source:atlas-lion:knockdown",
      "source:atlas-lion:light-kick",
      "source:atlas-lion:light-punch",
      "source:atlas-lion:lose",
      "source:atlas-lion:special",
      "source:atlas-lion:walk-back",
      "source:atlas-lion:walk-forward",
      "source:atlas-lion:win",
      "source:sahara-viper:blockstun",
      "source:sahara-viper:crouch",
      "source:sahara-viper:heavy-punch",
      "source:sahara-viper:hitstun",
      "source:sahara-viper:idle",
      "source:sahara-viper:jump",
      "source:sahara-viper:knockdown",
      "source:sahara-viper:light-kick",
      "source:sahara-viper:light-punch",
      "source:sahara-viper:lose",
      "source:sahara-viper:special",
      "source:sahara-viper:walk-back",
      "source:sahara-viper:walk-forward",
      "source:sahara-viper:win",
    ]);

    const sourceRows = summary.rows.filter((row) => row.kind === "source");
    expect(sourceRows.map((row) => `${row.fighterId}:${row.animationId}`).sort()).toEqual([
      "atlas-lion:blockstun",
      "atlas-lion:crouch",
      "atlas-lion:heavy-punch",
      "atlas-lion:hitstun",
      "atlas-lion:idle",
      "atlas-lion:jump",
      "atlas-lion:knockdown",
      "atlas-lion:light-kick",
      "atlas-lion:light-punch",
      "atlas-lion:lose",
      "atlas-lion:special",
      "atlas-lion:walk-back",
      "atlas-lion:walk-forward",
      "atlas-lion:win",
      "sahara-viper:blockstun",
      "sahara-viper:crouch",
      "sahara-viper:heavy-punch",
      "sahara-viper:hitstun",
      "sahara-viper:idle",
      "sahara-viper:jump",
      "sahara-viper:knockdown",
      "sahara-viper:light-kick",
      "sahara-viper:light-punch",
      "sahara-viper:lose",
      "sahara-viper:special",
      "sahara-viper:walk-back",
      "sahara-viper:walk-forward",
      "sahara-viper:win",
    ]);
    for (const row of sourceRows) {
      expect(row.frameCount).toBe(
        row.animationId === "hitstun" || row.animationId === "blockstun"
          ? 5
          : row.animationId === "crouch"
            ? 4
            : row.animationId === "light-punch" || row.animationId === "jump" || row.animationId === "lose"
              ? 6
              : row.animationId === "special"
                ? 10
                : 8,
      );
      expect(row.expected).toEqual({ width: row.frameCount * 256, height: 256 });
      expect(row.runtimeReady).toBe(false);
      expect(row.status).toBe("needs-normalization");
      expect(row.dimensions.width).toBeGreaterThan(0);
      expect(row.dimensions.height).toBeGreaterThan(0);
    }

    const normalizedRows = summary.rows.filter((row) => row.kind === "normalized-candidate");
    expect(normalizedRows).toHaveLength(28);
    for (const row of normalizedRows) {
      expect(row.expected).toEqual({ width: row.frameCount * 256, height: 256 });
      expect(row.dimensions).toEqual(row.expected);
      expect(row.runtimeReady).toBe(true);
      expect(row.status).toBe("runtime-ready");
    }
  }, 20_000);
});
