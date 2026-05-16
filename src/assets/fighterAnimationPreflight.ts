import { pawbreakerPlannedFighterAssetManifests } from "./catalog";
import {
  DEFAULT_FIGHTER_CELL_SIZE,
  REQUIRED_FIGHTER_ANIMATIONS,
  type FighterAnimationId,
  type FighterAnimationSpec,
} from "./types";

export type AnimationPreflightRuntimeExposure = "not playable";
export type AnimationPreflightStatus = "preflight-only";

export interface AnimationRowPreflight {
  animationId: FighterAnimationId;
  frameCount: number;
  cellSize: {
    width: number;
    height: number;
  };
  facing: "right";
  rowGenerationBrief: string;
  motionLanguage: string;
  acceptanceCriteria: readonly string[];
  rejectionTriggers: readonly string[];
}

export interface NoDriftQaGate {
  id: string;
  label: string;
  requiredEvidence: readonly string[];
  failIf: readonly string[];
}

export interface RuntimePromotionTest {
  id: string;
  command: string;
  proves: string;
}

export interface BrowserSmokeRequirement {
  id: string;
  expectedEvidence: string;
}

export interface FighterAnimationPreflight {
  id: "pickles-pugilist-animation-preflight";
  fighterId: "pugilist-pug";
  displayName: "Pickles Pugilist";
  sourceOnly: true;
  playable: false;
  status: AnimationPreflightStatus;
  runtimeExposure: AnimationPreflightRuntimeExposure;
  fullOutcome: "incomplete";
  canonicalReferencePath: string;
  blockedPublicRuntimePath: "/assets/generated/fighters/pugilist-pug";
  rowGenerationStrategy: readonly string[];
  requiredRows: readonly AnimationRowPreflight[];
  noDriftQaGates: readonly NoDriftQaGate[];
  runtimePromotionTests: readonly RuntimePromotionTest[];
  browserSmokeRequirements: readonly BrowserSmokeRequirement[];
}

const picklesManifest = pawbreakerPlannedFighterAssetManifests.find((manifest) => manifest.id === "pugilist-pug");

if (!picklesManifest) {
  throw new Error("Missing Pickles Pugilist planned fighter manifest.");
}

const picklesAnimationSpecsById = new Map<FighterAnimationId, FighterAnimationSpec>(
  picklesManifest.animations.map((animation) => [animation.id, animation]),
);

export const PICKLES_ANIMATION_PREFLIGHT: FighterAnimationPreflight = {
  id: "pickles-pugilist-animation-preflight",
  fighterId: "pugilist-pug",
  displayName: "Pickles Pugilist",
  sourceOnly: true,
  playable: false,
  status: "preflight-only",
  runtimeExposure: "not playable",
  fullOutcome: "incomplete",
  canonicalReferencePath: picklesManifest.canonicalReference.outputPath ?? "",
  blockedPublicRuntimePath: "/assets/generated/fighters/pugilist-pug",
  rowGenerationStrategy: [
    "Use the approved Pickles Pugilist canonical model sheet as the only identity source before any row-generation pass.",
    "Generate one animation row at a time at the locked 256x256 cell size; keep right-facing rows until a separate mirror review approves exceptions.",
    "Keep Pickles upright, compact, pug-faced, short-limbed, and pressure-boxer readable in every normal gameplay row.",
    "Compare each candidate row against the idle scale reference before accepting any motion row; no-drift approval is required before runtime promotion.",
    "Keep rejected candidates and QA notes source-only; do not copy any pugilist-pug files into public/assets/generated/fighters during this preflight.",
    "Runtime promotion must be a later Worker that proves source provenance, normalized spritesheet dimensions, tests, and browser smoke.",
  ],
  requiredRows: REQUIRED_FIGHTER_ANIMATIONS.map((animationId) => rowPreflight(animationId)),
  noDriftQaGates: [
    {
      id: "scale-bounds",
      label: "Scale and silhouette no-drift",
      requiredEvidence: [
        "Per-row alpha bounding boxes compared against the approved Pickles idle row once generated.",
        "Head height, shoulder width, glove size, torso height, and tail curl remain within the accepted row tolerance.",
      ],
      failIf: [
        "Pickles changes size between frames or rows.",
        "The silhouette becomes a different dog, a generic mascot, a human boxer, or an unrelated creature.",
      ],
    },
    {
      id: "alpha-bounds",
      label: "Transparent sprite bounds",
      requiredEvidence: [
        "Every frame has an alpha channel and stable non-transparent bounds.",
        "No detached dust, speed lines, shadows, hit sparks, text, frame numbers, or UI artifacts are baked into the row.",
      ],
      failIf: [
        "A frame is cropped, clipped, floating outside its 256x256 cell, or has baked effects that belong in the game effects layer.",
        "The row needs hand-waved cleanup before it can pass tests.",
      ],
    },
    {
      id: "identity-traits",
      label: "Pickles identity lock",
      requiredEvidence: [
        "Wrinkles, round muzzle, folded ears, curled tail, compact torso, stubby limbs, warm fawn palette, dark muzzle, and toy gloves survive every row.",
        "Any asymmetrical scuffs or belt-tag details are tracked as intentional source notes, not accidental frame drift.",
      ],
      failIf: [
        "The face, ears, muzzle, wrinkles, gloves, tail, or palette mutate between frames.",
        "The row borrows recognizable costume, move, logo, title, or UI language from a reference fighting game.",
      ],
    },
    {
      id: "frame-dimensions",
      label: "Frame dimensions and row structure",
      requiredEvidence: [
        "Each accepted row has the planned frame count and exact 256x256 cell dimensions.",
        "Spritesheet width equals frameCount * 256 and spritesheet height equals 256.",
      ],
      failIf: [
        "Any row uses inconsistent dimensions, missing frames, variable cell sizes, or an unreviewed frame order.",
        "The motion reads as glitchy, jittery, resized, or mechanically unnatural when scrubbed frame by frame.",
      ],
    },
    {
      id: "provenance",
      label: "Source and runtime provenance",
      requiredEvidence: [
        "Source prompt, canonical-reference path, candidate path, QA decision, accepted source path, and runtime path are recorded before promotion.",
        "Manifest entries remain blocked until the generation and QA Worker explicitly promotes a row.",
      ],
      failIf: [
        "A row lacks a source record, reviewer decision, or runtime destination.",
        "Pickles appears in runtime config, select UI, public assets, or playable roster before the full promotion Worker passes.",
      ],
    },
  ],
  runtimePromotionTests: [
    {
      id: "preflight-unit",
      command: "npm test -- test/fighter-animation-preflight.test.ts",
      proves: "The Pickles preflight covers every required row and remains not playable.",
    },
    {
      id: "asset-pipeline-regression",
      command: "npm test -- test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts",
      proves: "The source-only planned manifest, roster lab, and runtime roster still block public/runtime Pickles exposure.",
    },
    {
      id: "public-path-block",
      command: "test ! -e public/assets/generated/fighters/pugilist-pug",
      proves: "No public/runtime pugilist-pug folder exists during preflight.",
    },
    {
      id: "future-smoke",
      command:
        "PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-runtime-promotion",
      proves: "Future runtime promotion must prove browser gameplay, roster state, sprite loading, and no fallback rows.",
    },
  ],
  browserSmokeRequirements: [
    {
      id: "current-roster-unchanged",
      expectedEvidence: "Before promotion, smoke selectedFighters remain Gray Rabbit and Ginger Tabby Cat; Pickles Pugilist is not playable.",
    },
    {
      id: "promotion-roster-explicit",
      expectedEvidence:
        "If a future Worker promotes Pickles, smoke must show an explicit pugilist-pug runtime spritesheet for every required animation row.",
    },
    {
      id: "no-fallback-rows",
      expectedEvidence:
        "Future smoke must show Pickles uses approved sprite rows, exact 256x256 cells, and no procedural or missing-output fallback.",
    },
  ],
};

export function buildPicklesAnimationPreflight(): FighterAnimationPreflight {
  return PICKLES_ANIMATION_PREFLIGHT;
}

export function validateFighterAnimationPreflight(plan: FighterAnimationPreflight): readonly string[] {
  const errors: string[] = [];
  const rowIds = plan.requiredRows.map((row) => row.animationId);

  if (plan.fighterId !== "pugilist-pug") errors.push("preflight must target pugilist-pug.");
  if (plan.playable) errors.push("Pickles Pugilist preflight must not mark the fighter playable.");
  if (plan.runtimeExposure !== "not playable") errors.push("Pickles Pugilist must remain not playable during preflight.");
  if (plan.requiredRows.length !== REQUIRED_FIGHTER_ANIMATIONS.length) {
    errors.push("preflight must cover every REQUIRED_FIGHTER_ANIMATIONS row.");
  }
  for (const animationId of REQUIRED_FIGHTER_ANIMATIONS) {
    if (!rowIds.includes(animationId)) errors.push(`${animationId}: missing required row preflight.`);
  }
  for (const row of plan.requiredRows) {
    if (row.cellSize.width !== DEFAULT_FIGHTER_CELL_SIZE.width || row.cellSize.height !== DEFAULT_FIGHTER_CELL_SIZE.height) {
      errors.push(`${row.animationId}: row must keep exact ${DEFAULT_FIGHTER_CELL_SIZE.width}x${DEFAULT_FIGHTER_CELL_SIZE.height} cells.`);
    }
    if (!row.rowGenerationBrief.includes("row-generation")) {
      errors.push(`${row.animationId}: row-generation brief must be explicit.`);
    }
    if (!row.acceptanceCriteria.join(" ").includes("no-drift")) {
      errors.push(`${row.animationId}: no-drift row acceptance criterion is required.`);
    }
  }

  const gateText = plan.noDriftQaGates.map((gate) => `${gate.label} ${gate.requiredEvidence.join(" ")} ${gate.failIf.join(" ")}`).join(" ");
  for (const requiredPhrase of ["Scale", "alpha", "identity", "256x256", "provenance"]) {
    if (!gateText.includes(requiredPhrase)) errors.push(`no-drift QA gate missing ${requiredPhrase}.`);
  }
  if (!plan.runtimePromotionTests.some((test) => test.command.includes("smoke:meowtal"))) {
    errors.push("runtime promotion tests must require browser smoke.");
  }
  if (!plan.runtimePromotionTests.some((test) => test.command.includes("test ! -e public/assets/generated/fighters/pugilist-pug"))) {
    errors.push("runtime promotion tests must prove public Pickles assets do not exist during preflight.");
  }

  return errors;
}

export function renderPicklesAnimationPreflightHtml(plan: FighterAnimationPreflight = PICKLES_ANIMATION_PREFLIGHT): string {
  const rows = plan.requiredRows
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.animationId)}</td>
        <td>${row.frameCount}</td>
        <td>${escapeHtml(row.motionLanguage)}</td>
        <td>${escapeHtml(row.acceptanceCriteria.join(" "))}</td>
      </tr>`,
    )
    .join("\n");
  const gates = plan.noDriftQaGates.map((gate) => `<li><strong>${escapeHtml(gate.label)}</strong>: ${escapeHtml(gate.failIf.join(" "))}</li>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(plan.displayName)} Animation Preflight</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f4f7f3; color: #151915; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 32px; margin: 0 0 8px; }
    p { line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #c8d8c4; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #dbe7d8; text-align: left; vertical-align: top; }
    th { background: #24412f; color: #fff; }
    .pill { display: inline-block; margin: 4px 8px 12px 0; border: 1px solid #b7c9ae; padding: 8px 10px; font-weight: 700; background: #fff; }
  </style>
</head>
<body>
<main>
  <h1>${escapeHtml(plan.displayName)} Animation Preflight</h1>
  <p>This is a source-only no-drift row-generation plan for ${escapeHtml(plan.fighterId)}. It is not playable and does not approve runtime promotion.</p>
  <div>
    <span class="pill">Status: ${escapeHtml(plan.status)}</span>
    <span class="pill">Runtime exposure: ${escapeHtml(plan.runtimeExposure)}</span>
    <span class="pill">Full AAA outcome: ${escapeHtml(plan.fullOutcome)}</span>
  </div>
  <h2>Required Rows</h2>
  <table>
    <thead><tr><th>Animation</th><th>Frames</th><th>Motion language</th><th>Acceptance</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <h2>No-Drift QA Gates</h2>
  <ul>${gates}</ul>
</main>
</body>
</html>`;
}

function rowPreflight(animationId: FighterAnimationId): AnimationRowPreflight {
  const animation = picklesAnimationSpecsById.get(animationId);
  if (!animation) {
    throw new Error(`${animationId}: missing Pickles animation spec.`);
  }
  return {
    animationId,
    frameCount: animation.frameCount,
    cellSize: animation.cellSize,
    facing: "right",
    rowGenerationBrief:
      `Pickles Pugilist ${animationId} row-generation pass: ${animation.promptIntent} ` +
      "Use only the approved canonical model sheet and preserve pug proportions, wrinkles, muzzle, folded ears, curled tail, toy gloves, and compact boxer stance.",
    motionLanguage: motionLanguageFor(animationId),
    acceptanceCriteria: [
      `Matches the planned ${animation.frameCount}-frame timing and exact ${animation.cellSize.width}x${animation.cellSize.height} cells.`,
      "Passes no-drift review against Pickles idle scale, silhouette, palette, face, gloves, tail, and muzzle.",
      "Contains transparent-background sprite frames only; no text, logo, watermark, frame number, loose effect, or UI element.",
      "Reads as a natural fighting-game motion when scrubbed frame by frame, with no character resizing or identity mutation.",
    ],
    rejectionTriggers: [
      "size drift, identity drift, warped anatomy, extra limbs, or changing face structure",
      "generic mascot look, copied fighting-game costume language, or non-original special effect identity",
      "cropped frame, unstable alpha bounds, baked impact effect, visible text, watermark, logo, or frame grid",
      "motion that looks glitchy, floaty, mechanical, or inconsistent with a short-limbed pug pressure boxer",
    ],
  };
}

function motionLanguageFor(animationId: FighterAnimationId): string {
  switch (animationId) {
    case "idle":
      return "compact peekaboo guard, tiny bounce, stable head height, gloves near cheeks";
    case "walk-forward":
      return "short pressure steps forward, shoulders tucked, feet grounded, tail curl stable";
    case "walk-back":
      return "defensive shuffle backward, chin tucked, gloves high, no panic resizing";
    case "crouch":
      return "low squat guard with pug belly compact, ears and muzzle still readable";
    case "jump":
      return "stubby-limb hop arc with controlled knees, no long-limbed stretch";
    case "light-punch":
      return "quick jab from cheek guard, tiny glove pop, fast recovery";
    case "heavy-punch":
      return "overhand haymaker with committed shoulder turn, still compact and cute";
    case "light-kick":
      return "short shin kick with boxer balance, no martial-arts costume drift";
    case "special":
      return "snack-belt corkscrew body blow, no detached magic or copied signature move";
    case "hitstun":
      return "squished recoil with cheeks and wrinkles intact, funny but readable";
    case "blockstun":
      return "gloves absorb impact close to face, stable stance, no baked spark";
    case "knockdown":
      return "safe fall and grounded recovery inside frame bounds, curled tail visible";
    case "win":
      return "tiny glove raise and proud snort posture, no readable text prop";
    case "lose":
      return "dizzy seated slump, stylized and funny, not grotesque or off-model";
  }
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
