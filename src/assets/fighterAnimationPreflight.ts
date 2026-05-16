import { meowtalFighterAssetManifests, pawbreakerPlannedFighterAssetManifests } from "./catalog";
import {
  DEFAULT_FIGHTER_CELL_SIZE,
  REQUIRED_FIGHTER_ANIMATIONS,
  type FighterAnimationId,
  type FighterAnimationSpec,
} from "./types";

export type AnimationPreflightRuntimeExposure = "playable" | "not playable";
export type AnimationPreflightStatus = "source-only-preflight" | "runtime-promoted";

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
  id: string;
  fighterId: string;
  displayName: string;
  sourceOnly: boolean;
  playable: boolean;
  status: AnimationPreflightStatus;
  runtimeExposure: AnimationPreflightRuntimeExposure;
  fullOutcome: "incomplete";
  canonicalReferencePath: string;
  publicRuntimePath: string | null;
  rowGenerationStrategy: readonly string[];
  requiredRows: readonly AnimationRowPreflight[];
  noDriftQaGates: readonly NoDriftQaGate[];
  runtimePromotionTests: readonly RuntimePromotionTest[];
  browserSmokeRequirements: readonly BrowserSmokeRequirement[];
}

interface FighterRowProfile {
  displayName: string;
  identityRequirements: string;
  noDriftTarget: string;
  rejectionMotion: string;
  motionLanguageFor: (animationId: FighterAnimationId) => string;
}

const fighterManifestsById = new Map(
  [...meowtalFighterAssetManifests, ...pawbreakerPlannedFighterAssetManifests].map((manifest) => [manifest.id, manifest]),
);

function requireManifest(fighterId: string) {
  const manifest = fighterManifestsById.get(fighterId);
  if (!manifest) {
    throw new Error(`${fighterId}: missing fighter manifest.`);
  }
  return manifest;
}

const picklesManifest = requireManifest("pugilist-pug");
const noodleManifest = requireManifest("ferret-noodle");

const picklesRowProfile: FighterRowProfile = {
  displayName: "Pickles Pugilist",
  identityRequirements:
    "preserve pug proportions, wrinkles, muzzle, folded ears, curled tail, toy gloves, and compact boxer stance",
  noDriftTarget: "Pickles idle scale, silhouette, palette, face, gloves, tail, and muzzle",
  rejectionMotion: "a short-limbed pug pressure boxer",
  motionLanguageFor: picklesMotionLanguageFor,
};

const noodleRowProfile: FighterRowProfile = {
  displayName: "Noodle Nibbles",
  identityRequirements:
    "preserve ferret proportions, tapered muzzle, bright eyes, rounded ears, long torso, short legs, ringed tail, and sock-belt gag",
  noDriftTarget: "Noodle model-sheet scale, long-body silhouette, palette, face, ringed tail, sock props, and short legs",
  rejectionMotion: "a slinky ferret mix-up fighter",
  motionLanguageFor: noodleMotionLanguageFor,
};

export const PICKLES_ANIMATION_PREFLIGHT: FighterAnimationPreflight = {
  id: "pickles-pugilist-animation-preflight",
  fighterId: "pugilist-pug",
  displayName: "Pickles Pugilist",
  sourceOnly: false,
  playable: true,
  status: "runtime-promoted",
  runtimeExposure: "playable",
  fullOutcome: "incomplete",
  canonicalReferencePath: picklesManifest.canonicalReference.outputPath ?? "",
  publicRuntimePath: "/assets/generated/fighters/pugilist-pug",
  rowGenerationStrategy: [
    "Use the approved Pickles Pugilist canonical model sheet as the only identity source before any row-generation pass.",
    "Generate one animation row at a time at the locked 256x256 cell size; keep right-facing rows until a separate mirror review approves exceptions.",
    "Keep Pickles upright, compact, pug-faced, short-limbed, and pressure-boxer readable in every normal gameplay row.",
    "Compare each candidate row against the idle scale reference before accepting any motion row; no-drift approval is required before runtime promotion.",
    "Keep rejected candidates and QA notes source-only; only the approved rows are promoted into public/assets/generated/fighters/pugilist-pug.",
    "Runtime promotion requires source provenance, exact spritesheet dimensions, byte-identical source/runtime rows, and no fallback runtime rows.",
  ],
  requiredRows: REQUIRED_FIGHTER_ANIMATIONS.map((animationId) => rowPreflight(animationId, picklesManifest, picklesRowProfile)),
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
        "Manifest entries are approved only after the generation and QA receipts explicitly promote each row.",
      ],
      failIf: [
        "A row lacks a source record, reviewer decision, or runtime destination.",
        "Pickles runtime rows differ from the accepted source rows or fall back to procedural rendering.",
      ],
    },
  ],
  runtimePromotionTests: [
    {
      id: "preflight-unit",
      command: "npm test -- test/fighter-animation-preflight.test.ts",
      proves: "The Pickles runtime promotion covers every required row and marks the fighter playable.",
    },
    {
      id: "asset-pipeline-regression",
      command: "npm test -- test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts",
      proves: "The roster lab and runtime roster expose Pickles only after approved runtime promotion.",
    },
    {
      id: "public-path-block",
      command: "test -d public/assets/generated/fighters/pugilist-pug",
      proves: "The promoted public/runtime pugilist-pug folder exists.",
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
      expectedEvidence: "After promotion, smoke selectedFighters can include Pickles Pugilist from the runtime roster.",
    },
    {
      id: "promotion-roster-explicit",
      expectedEvidence:
        "Smoke must show an explicit pugilist-pug runtime spritesheet for every required animation row.",
    },
    {
      id: "no-fallback-rows",
      expectedEvidence:
        "Smoke must show Pickles uses approved sprite rows, exact 256x256 cells, and no procedural or missing-output fallback.",
    },
  ],
};

export const NOODLE_ANIMATION_PREFLIGHT: FighterAnimationPreflight = {
  id: "noodle-nibbles-animation-preflight",
  fighterId: "ferret-noodle",
  displayName: "Noodle Nibbles",
  sourceOnly: true,
  playable: false,
  status: "source-only-preflight",
  runtimeExposure: "not playable",
  fullOutcome: "incomplete",
  canonicalReferencePath: noodleManifest.canonicalReference.outputPath ?? "",
  publicRuntimePath: null,
  rowGenerationStrategy: [
    "Use the approved source-only Noodle Nibbles canonical model sheet as the only identity source before any row-generation pass.",
    "Start actual imagegen with idle only after a Judge approves it as the scale/reference row; row groups and runtime promotion remain blocked.",
    "Keep Noodle upright, ferret-faced, long-bodied, short-legged, mischievous, and readable as a side-switch mix-up fighter in every normal gameplay row.",
    "Every future row must keep exact 256x256 cells, transparent frames, stable alpha bounds, and no-size-drift evidence against the accepted idle/reference row.",
    "Keep rejected candidates and QA notes source-only; do not create public/assets/generated/fighters/ferret-noodle until every required row passes and a separate promotion task approves it.",
    "Runtime promotion requires byte-identical source/runtime rows, source provenance, browser smoke, and explicit roster/select/championship updates in a later task.",
  ],
  requiredRows: REQUIRED_FIGHTER_ANIMATIONS.map((animationId) => rowPreflight(animationId, noodleManifest, noodleRowProfile)),
  noDriftQaGates: [
    {
      id: "scale-bounds",
      label: "Scale and silhouette no-size-drift",
      requiredEvidence: [
        "The first accepted idle row becomes the future Noodle scale reference before any locomotion, attack, reaction, or K.O. row.",
        "Head height, long torso length, shoulder width, sock-belt scale, short-leg length, and ringed-tail size remain stable across frames and rows.",
      ],
      failIf: [
        "Noodle changes character size between frames or rows.",
        "The silhouette becomes a generic weasel, noodle mascot, snake, cat, or unrelated creature.",
      ],
    },
    {
      id: "alpha-bounds",
      label: "Transparent sprite bounds",
      requiredEvidence: [
        "Every future frame has an alpha channel and stable non-transparent bounds.",
        "No detached dust, speed lines, shadows, hit sparks, text, frame numbers, grids, or UI artifacts are baked into a row.",
      ],
      failIf: [
        "A frame is cropped, clipped, floating outside its 256x256 cell, or has baked effects that belong in the game effects layer.",
        "The row needs hand-waved cleanup before it can pass tests.",
      ],
    },
    {
      id: "identity-traits",
      label: "Noodle identity lock",
      requiredEvidence: [
        "Tapered muzzle, bright eyes, rounded ears, long torso, short legs, ringed tail, sock-belt gag, mischievous face, and warm ferret palette survive every row.",
        "Any asymmetrical sock props, mask markings, tail rings, or belt-pouch details are tracked as intentional source notes, not accidental frame drift.",
      ],
      failIf: [
        "The face, muzzle, eyes, ears, torso length, tail rings, sock props, or palette mutate between frames.",
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
        "Source prompt, canonical-reference path, candidate path, QA decision, accepted source path, and future runtime path are recorded before promotion.",
        "Manifest entries are approved only after generation and QA receipts explicitly promote each row.",
      ],
      failIf: [
        "A row lacks a source record, reviewer decision, or future runtime destination.",
        "Noodle public/runtime rows differ from accepted source rows or fall back to procedural rendering.",
      ],
    },
  ],
  runtimePromotionTests: [
    {
      id: "preflight-unit",
      command: "npm test -- test/fighter-animation-preflight.test.ts",
      proves: "The Noodle preflight covers every required row and keeps the fighter source-only.",
    },
    {
      id: "source-only-public-block",
      command: "test ! -e public/assets/generated/fighters/ferret-noodle",
      proves: "Noodle Nibbles has no public/runtime fighter folder during preflight and row production.",
    },
    {
      id: "future-smoke",
      command:
        "PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/noodle-runtime-promotion",
      proves: "Future runtime promotion must prove browser gameplay, roster state, sprite loading, and no fallback rows.",
    },
  ],
  browserSmokeRequirements: [
    {
      id: "current-roster-unchanged",
      expectedEvidence: "During preflight and source-only row production, Noodle Nibbles remains absent from the selectable runtime roster.",
    },
    {
      id: "promotion-roster-explicit",
      expectedEvidence:
        "Only a later promotion smoke may show ferret-noodle runtime spritesheets for every required animation row.",
    },
    {
      id: "no-fallback-rows",
      expectedEvidence:
        "Future promotion smoke must show approved sprite rows, exact 256x256 cells, and no procedural or missing-output fallback.",
    },
  ],
};

export function buildPicklesAnimationPreflight(): FighterAnimationPreflight {
  return PICKLES_ANIMATION_PREFLIGHT;
}

export function buildNoodleAnimationPreflight(): FighterAnimationPreflight {
  return NOODLE_ANIMATION_PREFLIGHT;
}

export function validateFighterAnimationPreflight(plan: FighterAnimationPreflight): readonly string[] {
  const errors: string[] = [];
  const rowIds = plan.requiredRows.map((row) => row.animationId);
  const publicPath = `/assets/generated/fighters/${plan.fighterId}`;

  if (!plan.fighterId) errors.push("preflight must target a fighter.");
  if (!plan.canonicalReferencePath.includes(`fighters/${plan.fighterId}/`)) {
    errors.push(`${plan.fighterId}: canonical reference path must live under the fighter source folder.`);
  }
  if (plan.sourceOnly) {
    if (plan.playable) errors.push(`${plan.displayName} preflight must not mark the fighter playable.`);
    if (plan.status !== "source-only-preflight") errors.push(`${plan.displayName} must remain a source-only preflight.`);
    if (plan.runtimeExposure !== "not playable") errors.push(`${plan.displayName} must not have runtime exposure.`);
    if (plan.publicRuntimePath !== null) errors.push(`${plan.displayName} source-only preflight must not set a public runtime path.`);
  } else {
    if (!plan.playable) errors.push(`${plan.displayName} promotion must mark the fighter playable.`);
    if (plan.status !== "runtime-promoted") errors.push(`${plan.displayName} must be runtime-promoted.`);
    if (plan.runtimeExposure !== "playable") errors.push(`${plan.displayName} must be playable after promotion.`);
    if (plan.publicRuntimePath !== publicPath) errors.push(`${plan.displayName} runtime path must be ${publicPath}.`);
  }
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
  if (plan.sourceOnly) {
    if (!plan.runtimePromotionTests.some((test) => test.command.includes(`test ! -e public/assets/generated/fighters/${plan.fighterId}`))) {
      errors.push(`${plan.displayName} preflight must prove public assets remain absent.`);
    }
  } else if (!plan.runtimePromotionTests.some((test) => test.command.includes(`test -d public/assets/generated/fighters/${plan.fighterId}`))) {
    errors.push(`${plan.displayName} runtime promotion tests must prove public assets exist after promotion.`);
  }

  return errors;
}

export function renderAnimationPreflightHtml(plan: FighterAnimationPreflight): string {
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
  const purpose = plan.sourceOnly
    ? `This is the source-only production preflight for ${escapeHtml(plan.fighterId)}. It keeps row-generation blocked behind no-size-drift gates and does not expose the fighter as playable.`
    : `This is the runtime promotion record for ${escapeHtml(plan.fighterId)}. It keeps no-drift row provenance while exposing approved spritesheets as playable runtime assets.`;

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
  <p>${purpose}</p>
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

export function renderPicklesAnimationPreflightHtml(plan: FighterAnimationPreflight = PICKLES_ANIMATION_PREFLIGHT): string {
  return renderAnimationPreflightHtml(plan);
}

export function renderNoodleAnimationPreflightHtml(plan: FighterAnimationPreflight = NOODLE_ANIMATION_PREFLIGHT): string {
  return renderAnimationPreflightHtml(plan);
}

function rowPreflight(
  animationId: FighterAnimationId,
  manifest: { animations: readonly FighterAnimationSpec[] },
  profile: FighterRowProfile,
): AnimationRowPreflight {
  const animation = manifest.animations.find((candidate) => candidate.id === animationId);
  if (!animation) {
    throw new Error(`${animationId}: missing ${profile.displayName} animation spec.`);
  }
  return {
    animationId,
    frameCount: animation.frameCount,
    cellSize: animation.cellSize,
    facing: "right",
    rowGenerationBrief:
      `${profile.displayName} ${animationId} row-generation pass: ${animation.promptIntent} ` +
      `Use only the approved canonical model sheet and ${profile.identityRequirements}.`,
    motionLanguage: profile.motionLanguageFor(animationId),
    acceptanceCriteria: [
      `Matches the planned ${animation.frameCount}-frame timing and exact ${animation.cellSize.width}x${animation.cellSize.height} cells.`,
      `Passes no-size-drift/no-drift review against ${profile.noDriftTarget}.`,
      "Contains transparent-background sprite frames only; no text, logo, watermark, frame number, loose effect, or UI element.",
      "Reads as a natural fighting-game motion when scrubbed frame by frame, with no character resizing or identity mutation.",
    ],
    rejectionTriggers: [
      "size drift, identity drift, warped anatomy, extra limbs, or changing face structure",
      "generic mascot look, copied fighting-game costume language, or non-original special effect identity",
      "cropped frame, unstable alpha bounds, baked impact effect, visible text, watermark, logo, or frame grid",
      `motion that looks glitchy, floaty, mechanical, or inconsistent with ${profile.rejectionMotion}`,
    ],
  };
}

function picklesMotionLanguageFor(animationId: FighterAnimationId): string {
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

function noodleMotionLanguageFor(animationId: FighterAnimationId): string {
  switch (animationId) {
    case "idle":
      return "long-body guard sway, mischievous head tilt, sock-belt visible, stable head and hip height";
    case "walk-forward":
      return "slinky forward steps with long torso held together, short legs grounded, tail rings stable";
    case "walk-back":
      return "quick retreat shuffle with sneaky shoulder angle, no body-length shrink";
    case "crouch":
      return "low coiled ferret guard with full body folded, muzzle and tail still readable";
    case "jump":
      return "arched ferret hop with controlled stretch, same body mass, clean landing posture";
    case "light-punch":
      return "fast paw poke from a side-switch stance, tiny reach, quick recovery";
    case "heavy-punch":
      return "laundry-basket lariat windup with body twist, no noodle-like melting";
    case "light-kick":
      return "short ankle-nip kick with grounded hips and stable tail counterbalance";
    case "special":
      return "sock-drawer feint into a playful wraparound strike, no detached magic or copied move";
    case "hitstun":
      return "elastic recoil that keeps the ferret face, body length, and ringed tail intact";
    case "blockstun":
      return "compact guard recoil with paws up and body still full-size";
    case "knockdown":
      return "safe tumble and curled grounded recovery inside frame bounds, same full-size body";
    case "win":
      return "sly sock-trophy flourish, readable grin, no text prop";
    case "lose":
      return "dramatic sock-pile slump, stylized and funny, not melted or off-model";
  }
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
