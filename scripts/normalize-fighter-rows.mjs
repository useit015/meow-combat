import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";

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
const DEFAULT_FIGHTERS = ["atlas-lion", "sahara-viper"];
const ROOT = process.cwd();

const animationId = readOption("--animation") ?? "idle";
const frameCount = FRAME_COUNTS[animationId];
if (!frameCount) {
  throw new Error(`Unknown animation "${animationId}". Known animations: ${Object.keys(FRAME_COUNTS).join(", ")}`);
}

const fighters = (readOption("--fighters") ?? DEFAULT_FIGHTERS.join(","))
  .split(",")
  .map((fighter) => fighter.trim())
  .filter(Boolean);
const jobs = fighters.map((fighterId) => ({
  fighterId,
  animationId,
  input: resolveInputPath(fighterId, animationId),
  output: `output/imagegen/${fighterId}-${animationId}-normalized.png`,
}));

const results = jobs.map((job) => normalizeRow(job, frameCount));

console.log(JSON.stringify({ animationId, normalized: results }, null, 2));

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function resolveInputPath(fighterId, targetAnimationId) {
  const outputCandidate = `output/imagegen/${fighterId}-${targetAnimationId}.png`;
  if (existsSync(join(ROOT, outputCandidate))) return outputCandidate;

  const sourceCandidate = `assets/source/imagegen/fighters/${fighterId}/${targetAnimationId}.png`;
  if (existsSync(join(ROOT, sourceCandidate))) return sourceCandidate;

  throw new Error(`No source row found for ${fighterId}:${targetAnimationId}`);
}

function normalizeRow(job, targetFrameCount) {
  const inputPath = join(ROOT, job.input);
  const outputPath = join(ROOT, job.output);
  const tempOutputPath = `${outputPath}.tmp-${process.pid}.png`;
  const dimensions = readPngDimensions(inputPath);
  const detectedFrames = detectFrameCrops(inputPath, dimensions, targetFrameCount, job.animationId);
  mkdirSync(dirname(outputPath), { recursive: true });

  execFileSync("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    inputPath,
    "-filter_complex",
    buildFilter(detectedFrames),
    "-map",
    "[out]",
    tempOutputPath,
  ]);
  const normalizedDimensions = readPngDimensions(tempOutputPath);
  renameSync(tempOutputPath, outputPath);

  return {
    fighterId: job.fighterId,
    animationId: job.animationId,
    input: job.input,
    output: job.output,
    sourceDimensions: dimensions,
    detectedFrames,
    normalizedDimensions,
  };
}

function detectFrameCrops(inputPath, dimensions, targetFrameCount, targetAnimationId) {
  const pixels = execFileSync("ffmpeg", ["-v", "error", "-i", inputPath, "-f", "rawvideo", "-pix_fmt", "rgba", "-"], {
    maxBuffer: dimensions.width * dimensions.height * 4 + 1024,
  });
  const columnCounts = Array.from({ length: dimensions.width }, () => 0);
  let minY = dimensions.height - 1;
  let maxY = 0;

  for (let y = 0; y < dimensions.height; y += 1) {
    for (let x = 0; x < dimensions.width; x += 1) {
      const index = (y * dimensions.width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      if (a > 0 && !isChromaGreen(r, g, b)) {
        columnCounts[x] += 1;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const threshold = Math.max(6, Math.round(dimensions.height * 0.015));
  const rawSegments = findSegments(columnCounts, threshold);
  const segments =
    rawSegments.length === targetFrameCount ? rawSegments : mergeSegments(rawSegments, 10, targetFrameCount);
  if (segments.length !== targetFrameCount || minY > maxY) {
    return equalFrameCrops(dimensions, targetFrameCount);
  }

  const yMargin = 20;
  const y = Math.max(0, minY - yMargin);
  const height = Math.min(dimensions.height - y, maxY - minY + 1 + yMargin * 2);
  const xMargin = 22;

  return segments.map((segment, index) => {
    const leftBoundary = index === 0 ? 0 : Math.floor((segments[index - 1].end + segment.start) / 2) + 1;
    const rightBoundary =
      index === segments.length - 1 ? dimensions.width - 1 : Math.floor((segment.end + segments[index + 1].start) / 2);
    const bounds =
      targetAnimationId === "idle"
        ? findPixelBounds(pixels, dimensions, leftBoundary, rightBoundary)
        : {
            minX: segment.start,
            maxX: segment.end,
            minY,
            maxY,
          };
    if (!bounds) {
      return equalFrameCrops(dimensions, targetFrameCount)[index];
    }

    const x = Math.max(leftBoundary, segment.start - xMargin);
    const cropX = targetAnimationId === "idle" ? Math.max(leftBoundary, bounds.minX - xMargin) : x;
    const end = Math.min(rightBoundary, bounds.maxX + xMargin);
    const cropY = Math.max(0, bounds.minY - yMargin);
    const cropHeight = Math.min(dimensions.height - cropY, bounds.maxY - bounds.minY + 1 + yMargin * 2);
    return {
      x: cropX,
      y: cropY,
      width: end - cropX + 1,
      height: cropHeight,
    };
  });
}

function findPixelBounds(pixels, dimensions, minX, maxX) {
  const bounds = {
    minX: maxX,
    maxX: minX,
    minY: dimensions.height - 1,
    maxY: 0,
  };
  let found = false;

  for (let y = 0; y < dimensions.height; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const index = (y * dimensions.width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      if (a > 0 && !isChromaGreen(r, g, b)) {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxY = Math.max(bounds.maxY, y);
        found = true;
      }
    }
  }

  return found ? bounds : null;
}

function findSegments(columnCounts, threshold) {
  const segments = [];
  let current = null;
  for (let x = 0; x < columnCounts.length; x += 1) {
    if (columnCounts[x] >= threshold) {
      current ??= { start: x, end: x };
      current.end = x;
    } else if (current) {
      segments.push(current);
      current = null;
    }
  }
  if (current) segments.push(current);
  return segments;
}

function mergeSegments(segments, maxGap, targetFrameCount) {
  const merged = [];
  for (const segment of segments) {
    const previous = merged.at(-1);
    if (previous && segment.start - previous.end <= maxGap) {
      previous.end = segment.end;
    } else {
      merged.push({ ...segment });
    }
  }

  while (merged.length > targetFrameCount) {
    let bestIndex = 0;
    let bestGap = Number.POSITIVE_INFINITY;
    for (let index = 0; index < merged.length - 1; index += 1) {
      const gap = merged[index + 1].start - merged[index].end;
      if (gap < bestGap) {
        bestGap = gap;
        bestIndex = index;
      }
    }
    merged[bestIndex].end = merged[bestIndex + 1].end;
    merged.splice(bestIndex + 1, 1);
  }

  return merged;
}

function equalFrameCrops({ width, height }, targetFrameCount) {
  return Array.from({ length: targetFrameCount }, (_, index) => {
    const x = Math.round((index * width) / targetFrameCount);
    const nextX = Math.round(((index + 1) * width) / targetFrameCount);
    return {
      x,
      y: 0,
      width: nextX - x,
      height,
    };
  });
}

function isChromaGreen(r, g, b) {
  return g > 120 && g > r * 1.25 && g > b * 1.25;
}

function buildFilter(frames) {
  const splitLabels = Array.from({ length: frames.length }, (_, index) => `[f${index}]`).join("");
  const frameFilters = frames.map((frame, index) => {
    return `[f${index}]crop=${frame.width}:${frame.height}:${frame.x}:${frame.y},format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(alpha(X,Y),1)+gt(g(X,Y),145)*lt(r(X,Y),100)*lt(b(X,Y),100)*gt(g(X,Y),r(X,Y)*1.35)*gt(g(X,Y),b(X,Y)*1.35),0,255)',scale=${CELL_SIZE}:${CELL_SIZE}:force_original_aspect_ratio=decrease,pad=${CELL_SIZE}:${CELL_SIZE}:(ow-iw)/2:oh-ih:color=black@0,setsar=1[n${index}]`;
  }).join(";");
  const stackLabels = Array.from({ length: frames.length }, (_, index) => `[n${index}]`).join("");

  return `[0:v]split=${frames.length}${splitLabels};${frameFilters};${stackLabels}hstack=inputs=${frames.length}[out]`;
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
