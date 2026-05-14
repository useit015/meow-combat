import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const CELL_SIZE = 256;
const FRAME_COUNTS = {
  idle: 8,
  "walk-forward": 8,
  "walk-back": 8,
  crouch: 4,
  jump: 6,
  "light-punch": 6,
  "heavy-punch": 8,
  "light-kick": 8,
  special: 10,
  hitstun: 5,
  blockstun: 5,
  knockdown: 8,
  win: 8,
  lose: 6,
};

const json = process.argv.includes("--json");
const strict = process.argv.includes("--strict");
const root = process.cwd();
const fightersDir = join(root, "assets/source/imagegen/fighters");

const rows = [...scanRows(fightersDir, "source"), ...scanNormalizedCandidates()];
const summary = {
  checked: rows.length,
  runtimeReady: rows.filter((row) => row.runtimeReady).length,
  needsNormalization: rows.filter((row) => !row.runtimeReady).length,
  rows,
};

if (json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printSummary(summary);
}

if (strict && summary.needsNormalization > 0) {
  process.exit(1);
}

function scanRows(baseDir, kind) {
  try {
    return readdirSync(baseDir)
      .map((entry) => join(baseDir, entry))
      .filter((entryPath) => statSync(entryPath).isDirectory())
      .flatMap((fighterDir) => scanFighterDir(fighterDir, kind));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function scanFighterDir(fighterDir, kind) {
  return readdirSync(fighterDir)
    .filter((file) => file.endsWith(".png"))
    .map((file) => {
      const animationId = basename(file, ".png");
      const frameCount = FRAME_COUNTS[animationId];
      if (!frameCount) return null;

      const path = join(fighterDir, file);
      const dimensions = readPngDimensions(path);
      const expected = {
        width: frameCount * CELL_SIZE,
        height: CELL_SIZE,
      };
      const runtimeReady = dimensions.width === expected.width && dimensions.height === expected.height;

      return {
        kind,
        path: path.slice(root.length + 1),
        fighterId: basename(fighterDir),
        animationId,
        frameCount,
        cellSize: CELL_SIZE,
        dimensions,
        expected,
        runtimeReady,
        status: runtimeReady ? "runtime-ready" : "needs-normalization",
      };
    })
    .filter(Boolean);
}

function scanNormalizedCandidates() {
  const outputDir = join(root, "output/imagegen");
  try {
    return readdirSync(outputDir)
      .filter((file) => file.endsWith("-normalized.png"))
      .map((file) => {
        const path = join(outputDir, file);
        const animationId = parseAnimationId(file);
        if (!animationId) return null;
        const frameCount = FRAME_COUNTS[animationId];
        const fighterId = file.replace(`-${animationId}-normalized.png`, "");
        const dimensions = readPngDimensions(path);
        const expected = {
          width: frameCount * CELL_SIZE,
          height: CELL_SIZE,
        };
        const runtimeReady = dimensions.width === expected.width && dimensions.height === expected.height;

        return {
          kind: "normalized-candidate",
          path: path.slice(root.length + 1),
          fighterId,
          animationId,
          frameCount,
          cellSize: CELL_SIZE,
          dimensions,
          expected,
          runtimeReady,
          status: runtimeReady ? "runtime-ready" : "needs-normalization",
        };
      })
      .filter(Boolean);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function parseAnimationId(file) {
  return Object.keys(FRAME_COUNTS)
    .sort((a, b) => b.length - a.length)
    .find((animationId) => file.endsWith(`-${animationId}-normalized.png`));
}

function readPngDimensions(path) {
  const buffer = readFileSync(path);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a PNG file`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function printSummary(summary) {
  console.log(`Generated fighter rows checked: ${summary.checked}`);
  console.log(`Runtime-ready rows: ${summary.runtimeReady}`);
  console.log(`Rows needing normalization or repair: ${summary.needsNormalization}`);

  for (const row of summary.rows) {
    const actual = `${row.dimensions.width}x${row.dimensions.height}`;
    const expected = `${row.expected.width}x${row.expected.height}`;
    console.log(`${row.status}: ${row.path} actual=${actual} expected=${expected}`);
  }
}
