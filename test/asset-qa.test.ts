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
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "heavy-punch", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "light-kick"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync(
      "node",
      ["scripts/normalize-fighter-rows.mjs", "--animation", "light-kick", "--fighters", "gray-rabbit,ginger-tabby-cat"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "hitstun", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "hitstun"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "blockstun", "--fighters", "pugilist-pug"], {
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
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "special", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "special"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "knockdown", "--fighters", "ferret-noodle"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "win", "--fighters", "ferret-noodle"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "lose", "--fighters", "ferret-noodle"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync(
      "node",
      ["scripts/normalize-fighter-rows.mjs", "--animation", "special", "--fighters", "gray-rabbit,ginger-tabby-cat"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "knockdown"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "knockdown", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync(
      "node",
      ["scripts/normalize-fighter-rows.mjs", "--animation", "knockdown", "--fighters", "gray-rabbit,ginger-tabby-cat"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "win"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "win", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync(
      "node",
      ["scripts/normalize-fighter-rows.mjs", "--animation", "win", "--fighters", "gray-rabbit,ginger-tabby-cat"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "lose"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync("node", ["scripts/normalize-fighter-rows.mjs", "--animation", "lose", "--fighters", "pugilist-pug"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    execFileSync(
      "node",
      ["scripts/normalize-fighter-rows.mjs", "--animation", "lose", "--fighters", "gray-rabbit,ginger-tabby-cat"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      },
    );
    const output = execFileSync("node", ["scripts/asset-qa.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const summary = JSON.parse(output) as AssetQaSummary;

    expect(summary.checked).toBe(168);
    expect(summary.runtimeReady).toBe(112);
    expect(summary.needsNormalization).toBe(56);
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
      "normalized-candidate:ferret-noodle:blockstun",
      "normalized-candidate:ferret-noodle:crouch",
      "normalized-candidate:ferret-noodle:heavy-punch",
      "normalized-candidate:ferret-noodle:hitstun",
      "normalized-candidate:ferret-noodle:idle",
      "normalized-candidate:ferret-noodle:jump",
      "normalized-candidate:ferret-noodle:knockdown",
      "normalized-candidate:ferret-noodle:light-kick",
      "normalized-candidate:ferret-noodle:light-punch",
      "normalized-candidate:ferret-noodle:lose",
      "normalized-candidate:ferret-noodle:special",
      "normalized-candidate:ferret-noodle:walk-back",
      "normalized-candidate:ferret-noodle:walk-forward",
      "normalized-candidate:ferret-noodle:win",
      "normalized-candidate:ginger-tabby-cat:blockstun",
      "normalized-candidate:ginger-tabby-cat:crouch",
      "normalized-candidate:ginger-tabby-cat:heavy-punch",
      "normalized-candidate:ginger-tabby-cat:hitstun",
      "normalized-candidate:ginger-tabby-cat:idle",
      "normalized-candidate:ginger-tabby-cat:jump",
      "normalized-candidate:ginger-tabby-cat:knockdown",
      "normalized-candidate:ginger-tabby-cat:light-kick",
      "normalized-candidate:ginger-tabby-cat:light-punch",
      "normalized-candidate:ginger-tabby-cat:lose",
      "normalized-candidate:ginger-tabby-cat:special",
      "normalized-candidate:ginger-tabby-cat:walk-back",
      "normalized-candidate:ginger-tabby-cat:walk-forward",
      "normalized-candidate:ginger-tabby-cat:win",
      "normalized-candidate:gray-rabbit:blockstun",
      "normalized-candidate:gray-rabbit:crouch",
      "normalized-candidate:gray-rabbit:heavy-punch",
      "normalized-candidate:gray-rabbit:hitstun",
      "normalized-candidate:gray-rabbit:idle",
      "normalized-candidate:gray-rabbit:jump",
      "normalized-candidate:gray-rabbit:knockdown",
      "normalized-candidate:gray-rabbit:light-kick",
      "normalized-candidate:gray-rabbit:light-punch",
      "normalized-candidate:gray-rabbit:lose",
      "normalized-candidate:gray-rabbit:special",
      "normalized-candidate:gray-rabbit:walk-back",
      "normalized-candidate:gray-rabbit:walk-forward",
      "normalized-candidate:gray-rabbit:win",
      "normalized-candidate:pugilist-pug:blockstun",
      "normalized-candidate:pugilist-pug:crouch",
      "normalized-candidate:pugilist-pug:heavy-punch",
      "normalized-candidate:pugilist-pug:hitstun",
      "normalized-candidate:pugilist-pug:idle",
      "normalized-candidate:pugilist-pug:jump",
      "normalized-candidate:pugilist-pug:knockdown",
      "normalized-candidate:pugilist-pug:light-kick",
      "normalized-candidate:pugilist-pug:light-punch",
      "normalized-candidate:pugilist-pug:lose",
      "normalized-candidate:pugilist-pug:special",
      "normalized-candidate:pugilist-pug:walk-back",
      "normalized-candidate:pugilist-pug:walk-forward",
      "normalized-candidate:pugilist-pug:win",
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
      "source:ferret-noodle:blockstun",
      "source:ferret-noodle:crouch",
      "source:ferret-noodle:heavy-punch",
      "source:ferret-noodle:hitstun",
      "source:ferret-noodle:idle",
      "source:ferret-noodle:jump",
      "source:ferret-noodle:knockdown",
      "source:ferret-noodle:light-kick",
      "source:ferret-noodle:light-punch",
      "source:ferret-noodle:lose",
      "source:ferret-noodle:special",
      "source:ferret-noodle:walk-back",
      "source:ferret-noodle:walk-forward",
      "source:ferret-noodle:win",
      "source:ginger-tabby-cat:blockstun",
      "source:ginger-tabby-cat:crouch",
      "source:ginger-tabby-cat:heavy-punch",
      "source:ginger-tabby-cat:hitstun",
      "source:ginger-tabby-cat:idle",
      "source:ginger-tabby-cat:jump",
      "source:ginger-tabby-cat:knockdown",
      "source:ginger-tabby-cat:light-kick",
      "source:ginger-tabby-cat:light-punch",
      "source:ginger-tabby-cat:lose",
      "source:ginger-tabby-cat:special",
      "source:ginger-tabby-cat:walk-back",
      "source:ginger-tabby-cat:walk-forward",
      "source:ginger-tabby-cat:win",
      "source:gray-rabbit:blockstun",
      "source:gray-rabbit:crouch",
      "source:gray-rabbit:heavy-punch",
      "source:gray-rabbit:hitstun",
      "source:gray-rabbit:idle",
      "source:gray-rabbit:jump",
      "source:gray-rabbit:knockdown",
      "source:gray-rabbit:light-kick",
      "source:gray-rabbit:light-punch",
      "source:gray-rabbit:lose",
      "source:gray-rabbit:special",
      "source:gray-rabbit:walk-back",
      "source:gray-rabbit:walk-forward",
      "source:gray-rabbit:win",
      "source:pugilist-pug:blockstun",
      "source:pugilist-pug:crouch",
      "source:pugilist-pug:heavy-punch",
      "source:pugilist-pug:hitstun",
      "source:pugilist-pug:idle",
      "source:pugilist-pug:jump",
      "source:pugilist-pug:knockdown",
      "source:pugilist-pug:light-kick",
      "source:pugilist-pug:light-punch",
      "source:pugilist-pug:lose",
      "source:pugilist-pug:special",
      "source:pugilist-pug:walk-back",
      "source:pugilist-pug:walk-forward",
      "source:pugilist-pug:win",
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
      "ferret-noodle:blockstun",
      "ferret-noodle:crouch",
      "ferret-noodle:heavy-punch",
      "ferret-noodle:hitstun",
      "ferret-noodle:idle",
      "ferret-noodle:jump",
      "ferret-noodle:knockdown",
      "ferret-noodle:light-kick",
      "ferret-noodle:light-punch",
      "ferret-noodle:lose",
      "ferret-noodle:special",
      "ferret-noodle:walk-back",
      "ferret-noodle:walk-forward",
      "ferret-noodle:win",
      "ginger-tabby-cat:blockstun",
      "ginger-tabby-cat:crouch",
      "ginger-tabby-cat:heavy-punch",
      "ginger-tabby-cat:hitstun",
      "ginger-tabby-cat:idle",
      "ginger-tabby-cat:jump",
      "ginger-tabby-cat:knockdown",
      "ginger-tabby-cat:light-kick",
      "ginger-tabby-cat:light-punch",
      "ginger-tabby-cat:lose",
      "ginger-tabby-cat:special",
      "ginger-tabby-cat:walk-back",
      "ginger-tabby-cat:walk-forward",
      "ginger-tabby-cat:win",
      "gray-rabbit:blockstun",
      "gray-rabbit:crouch",
      "gray-rabbit:heavy-punch",
      "gray-rabbit:hitstun",
      "gray-rabbit:idle",
      "gray-rabbit:jump",
      "gray-rabbit:knockdown",
      "gray-rabbit:light-kick",
      "gray-rabbit:light-punch",
      "gray-rabbit:lose",
      "gray-rabbit:special",
      "gray-rabbit:walk-back",
      "gray-rabbit:walk-forward",
      "gray-rabbit:win",
      "pugilist-pug:blockstun",
      "pugilist-pug:crouch",
      "pugilist-pug:heavy-punch",
      "pugilist-pug:hitstun",
      "pugilist-pug:idle",
      "pugilist-pug:jump",
      "pugilist-pug:knockdown",
      "pugilist-pug:light-kick",
      "pugilist-pug:light-punch",
      "pugilist-pug:lose",
      "pugilist-pug:special",
      "pugilist-pug:walk-back",
      "pugilist-pug:walk-forward",
      "pugilist-pug:win",
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
      if (row.fighterId === "pugilist-pug" || row.fighterId === "ferret-noodle") {
        expect(row.runtimeReady).toBe(true);
        expect(row.status).toBe("runtime-ready");
      } else {
        expect(row.runtimeReady).toBe(false);
        expect(row.status).toBe("needs-normalization");
      }
      expect(row.dimensions.width).toBeGreaterThan(0);
      expect(row.dimensions.height).toBeGreaterThan(0);
    }

    const normalizedRows = summary.rows.filter((row) => row.kind === "normalized-candidate");
    expect(normalizedRows).toHaveLength(84);
    for (const row of normalizedRows) {
      expect(row.expected).toEqual({ width: row.frameCount * 256, height: 256 });
      expect(row.dimensions).toEqual(row.expected);
      expect(row.runtimeReady).toBe(true);
      expect(row.status).toBe("runtime-ready");
    }
  }, 20_000);
});
