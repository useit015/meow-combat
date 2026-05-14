import { REQUIRED_FIGHTER_ANIMATIONS, type FighterAnimationId } from "./types";
import {
  plannedLicense,
  validateProvenanceEntries,
  type AssetProvenance,
  type AssetSourceKind,
  type ProvenanceStatus,
  type ProvenanceValidationResult,
} from "./provenance";

export type MeowtalFighterId = "gray-rabbit" | "ginger-tabby-cat";
export type MeowtalStageLayerId =
  | "sky-lighting"
  | "distant-hills-city"
  | "background-walls-pillars"
  | "midground-trees-bushes"
  | "playfield-stone-courtyard"
  | "foreground-dust-leaves";
export type MeowtalVisualSurfaceId =
  | "logo-title-mark"
  | "title-key-art"
  | "hud-frame"
  | "rabbit-portrait"
  | "cat-portrait"
  | "health-bar-rabbit"
  | "health-bar-cat"
  | "super-meter"
  | "timer-frame"
  | "fight-ko-victory-overlays"
  | "pause-options-panel"
  | "touch-controls"
  | "loading-fallback"
  | "particle-atlas"
  | "damage-number-style";
export type MeowtalAudioCueId =
  | "music-loop"
  | "ui-confirm"
  | "fight-announcer"
  | "hit-light"
  | "hit-heavy"
  | "block-impact"
  | "dash-whoosh"
  | "rabbit-tornado"
  | "cat-aura-blast"
  | "ko-burst"
  | "victory-sting";

export interface MeowtalCanonicalSheetPlan {
  fighterId: MeowtalFighterId;
  requiredBeforeAnimationRows: true;
  styleLockApproved: boolean;
  provenance: AssetProvenance;
}

export interface MeowtalAnimationRowPlan {
  fighterId: MeowtalFighterId;
  animationId: FighterAnimationId;
  frameCount: number;
  cellSize: 256;
  provenance: AssetProvenance;
}

export interface MeowtalFighterAssetPlan {
  id: MeowtalFighterId;
  displayName: string;
  engineCharacterId: string;
  silhouette: string;
  personality: string;
  specialEnergy: string;
  canonicalSheet: MeowtalCanonicalSheetPlan;
  animationRows: readonly MeowtalAnimationRowPlan[];
}

export interface MeowtalStageLayerPlan {
  id: MeowtalStageLayerId;
  parallax: number;
  role: string;
  provenance: AssetProvenance;
}

export interface MeowtalVisualSurfacePlan {
  id: MeowtalVisualSurfaceId;
  role: string;
  provenance: AssetProvenance;
}

export interface MeowtalAudioCuePlan {
  id: MeowtalAudioCueId;
  role: string;
  provenance: AssetProvenance;
}

export interface MeowtalProductionManifest {
  id: "meowtal-kombat-production";
  title: "Meowtal Kombat";
  provenanceDocument: "docs/assets/meowtal-kombat-provenance.md";
  visualReferences: readonly string[];
  fighters: readonly MeowtalFighterAssetPlan[];
  stage: {
    id: "meowtal-courtyard";
    displayName: "Bright Courtyard";
    layers: readonly MeowtalStageLayerPlan[];
  };
  visualSurfaces: readonly MeowtalVisualSurfacePlan[];
  audioCues: readonly MeowtalAudioCuePlan[];
}

const binaryBlocker = "Planned production asset only; no binary image or audio generated in the T020 scaffold.";
const generatedOn = "2026-05-14";

const canonicalSheetSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/canonical-character-sheet.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/canonical-character-sheet.png",
};

const canonicalSheetQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved as animation style-lock reference only. Visual QA: rabbit-only upright two-legged sheet, no visible text/watermark, includes front/side/back/three-quarter pose, action pose, idle pose, head close-up, expressions, detail callouts, size reference, color swatches, green tornado language, and consistent gray rabbit proportions.",
  "ginger-tabby-cat":
    "Approved as animation style-lock reference only. Visual QA: cat-only upright two-legged sheet, no visible text/watermark, includes front/side/back views, upright combat poses, upright idle, head close-up, expressions, detail callouts, size reference, color swatches, yellow-green energy language, and consistent orange tabby markings.",
};

const idleRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/idle.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/idle.png",
};

const idleRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/idle.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/idle.png",
};

const walkForwardRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/walk-forward.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/walk-forward.png",
};

const walkForwardRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/walk-forward.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/walk-forward.png",
};

const walkBackRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/walk-back.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/walk-back.png",
};

const walkBackRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/walk-back.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/walk-back.png",
};

const crouchRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/crouch.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/crouch.png",
};

const crouchRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/crouch.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/crouch.png",
};

const jumpRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/jump.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/jump.png",
};

const jumpRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/jump.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/jump.png",
};

const lightPunchRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/light-punch.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/light-punch.png",
};

const lightPunchRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/light-punch.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/light-punch.png",
};

const lightKickRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/light-kick.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/light-kick.png",
};

const lightKickRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/light-kick.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/light-kick.png",
};

const specialRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/special.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/special.png",
};

const hitstunRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/hitstun.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/hitstun.png",
};

const hitstunRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/hitstun.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/hitstun.png",
};

const blockstunRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/blockstun.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/blockstun.png",
};

const blockstunRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/blockstun.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/blockstun.png",
};

const heavyPunchRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/heavy-punch.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/heavy-punch.png",
};

const heavyPunchRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/heavy-punch.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/heavy-punch.png",
};

const idleRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime idle row. Visual QA: eight separated upright two-legged gray rabbit idle frames, no visible text/watermark/frame numbers, same stance and proportions as the canonical sheet, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T027.",
  "ginger-tabby-cat":
    "Approved runtime idle row. Visual QA: eight separated upright two-legged ginger tabby idle frames, no visible text/watermark/frame numbers, same stance and proportions as the canonical sheet, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T027.",
};

const walkForwardRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime walk-forward row. Visual QA: eight separated upright two-legged gray rabbit guarded walk frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T031.",
  "ginger-tabby-cat":
    "Approved runtime walk-forward row. Visual QA: eight separated upright two-legged ginger tabby guarded walk frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T031.",
};

const walkBackRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime walk-back row. Visual QA: eight separated upright two-legged gray rabbit guarded backward-footwork frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T035.",
  "ginger-tabby-cat":
    "Approved runtime walk-back row. Visual QA: eight separated upright two-legged ginger tabby guarded backward-footwork frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T035.",
};

const crouchRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime crouch row. Visual QA: four separated upright two-legged gray rabbit crouch/guard frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back, chroma-key removed to transparent alpha, normalized to 1024x256 RGBA, and approved for runtime publication by T039.",
  "ginger-tabby-cat":
    "Approved runtime crouch row. Visual QA: four separated upright two-legged ginger tabby crouch/guard frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back, chroma-key removed to transparent alpha, normalized to 1024x256 RGBA, and approved for runtime publication by T039.",
};

const jumpRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime jump row. Visual QA: six separated upright two-legged gray rabbit jump/hop frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back/crouch, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T043.",
  "ginger-tabby-cat":
    "Approved runtime jump row. Visual QA: six separated upright two-legged ginger tabby jump/hop frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back/crouch, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T043.",
};

const lightPunchRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime light-punch row. Visual QA: six separated upright two-legged gray rabbit quick paw-jab frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back/crouch/jump, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T047.",
  "ginger-tabby-cat":
    "Approved runtime light-punch row. Visual QA: six separated upright two-legged ginger tabby quick paw-jab frames, no visible text/watermark/frame numbers, same stance and proportions as approved idle/walk-forward/walk-back/crouch/jump, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T047.",
};

const hitstunRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime hitstun row. Visual QA: five separated upright two-legged gray rabbit hurt/recoil frames, no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA, and approved for runtime publication by T051.",
  "ginger-tabby-cat":
    "Approved runtime hitstun row. Visual QA: five separated upright two-legged ginger tabby hurt/recoil frames, no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA, and approved for runtime publication by T051.",
};

const blockstunRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime blockstun row. Visual QA: five separated upright two-legged gray rabbit guarded block-recoil frames, no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch/hitstun, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA, and approved for runtime publication by T055.",
  "ginger-tabby-cat":
    "Approved runtime blockstun row. Visual QA: five separated upright two-legged ginger tabby guarded block-recoil frames, no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch/hitstun, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA, and approved for runtime publication by T055.",
};

const heavyPunchRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime heavy-punch row. Visual QA: eight separated upright two-legged gray rabbit committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch/hitstun/blockstun, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA, and approved for runtime publication by T067.",
  "ginger-tabby-cat":
    "Approved runtime heavy-punch row. Visual QA: eight separated upright two-legged ginger tabby committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, same stance convention and proportions as approved idle/walk-forward/walk-back/crouch/jump/light-punch/hitstun/blockstun, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA, and approved for runtime publication by T067.",
};

const lightKickRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime light-kick row. Visual QA: eight separated upright two-legged gray rabbit low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, same stance convention and proportions as approved runtime rows through heavy-punch, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T075.",
  "ginger-tabby-cat":
    "Approved runtime light-kick row. Visual QA: eight separated upright two-legged ginger tabby low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, same stance convention and proportions as approved runtime rows through heavy-punch, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T075.",
};

const specialRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Generated source special row candidate. Visual self-check: ten separated upright two-legged gray rabbit rapid spinning tornado frames with crouch-load, readable spin build-up, character-attached green energy ribbons, deceleration, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to a 2560x256 RGBA QA candidate, and pending follow-up visual QA before runtime publication.",
  "ginger-tabby-cat":
    "Generated source special row candidate. Visual self-check: ten separated upright two-legged ginger tabby acrobatic flip-kick frames with planted chamber, readable mid-flip, green/yellow foot-attached aura crescents, controlled landing, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to a 2560x256 RGBA QA candidate, and pending follow-up visual QA before runtime publication.",
};

const animationFrameCounts: Readonly<Record<FighterAnimationId, number>> = {
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

const fighterDetails: Readonly<
  Record<
    MeowtalFighterId,
    {
      displayName: string;
      silhouette: string;
      personality: string;
      body: string;
      markings: string;
      signatureTraits: string;
      specialEnergy: string;
    }
  >
> = {
  "gray-rabbit": {
    displayName: "Gray Rabbit",
    silhouette: "upright two-legged stance, long ears, compact athletic body, strong hind legs, springy hopping stance",
    personality: "cute, alert, determined, slightly comedic",
    body: "small upright biped animal body with powerful hind legs and readable kicking shapes",
    markings: "soft gray fur, lighter belly, dark ear tips, white paws",
    signatureTraits: "hopping movement, spinning kicks, tornado special, green energy trail",
    specialEnergy: "green tornado energy",
  },
  "ginger-tabby-cat": {
    displayName: "Ginger/Orange Tabby Cat",
    silhouette: "upright two-legged stance, fluffy orange tabby fur, round expressive face, agile body, visible striped tail",
    personality: "playful, confident, mischievous, dramatic",
    body: "agile upright biped house-cat body with acrobatic pounce poses and clear tail-attack silhouettes",
    markings: "orange tabby stripes, lighter muzzle and chest, fluffy striped tail",
    signatureTraits: "pounce attacks, tail strikes, compact loaf-inspired upright idle stance, acrobatic flips, yellow-green aura projectile",
    specialEnergy: "yellow-green aura and projectile energy",
  },
};

export const meowtalProductionManifest: MeowtalProductionManifest = {
  id: "meowtal-kombat-production",
  title: "Meowtal Kombat",
  provenanceDocument: "docs/assets/meowtal-kombat-provenance.md",
  visualReferences: [
    "docs/visual-reference/meowtal-kombat/vision-01.png",
    "docs/visual-reference/meowtal-kombat/vision-02.png",
    "docs/visual-reference/meowtal-kombat/vision-03.png",
    "docs/visual-reference/meowtal-kombat/vision-04.png",
  ],
  fighters: makeFighters(),
  stage: {
    id: "meowtal-courtyard",
    displayName: "Bright Courtyard",
    layers: [
      stageLayer("sky-lighting", 0.08, "Vibrant blue sky, warm sun rays, lens flare, and soft atmosphere."),
      stageLayer("distant-hills-city", 0.18, "Distant colorful hills and city shapes behind the arena."),
      stageLayer("background-walls-pillars", 0.34, "Low stone walls, courtyard pillars, and readable architectural depth."),
      stageLayer("midground-trees-bushes", 0.58, "Scattered trees and bushes that frame the fight without covering silhouettes."),
      stageLayer("playfield-stone-courtyard", 1, "Bright stone-paved fighting lane with stable gameplay readability."),
      stageLayer("foreground-dust-leaves", 1.16, "Subtle foreground leaves, dust puffs, and edge props for parallax motion."),
    ],
  },
  visualSurfaces: [
    visualSurface("logo-title-mark", "Production Meowtal Kombat title mark for title and loading surfaces."),
    visualSurface("title-key-art", "Hero key art showing rabbit versus tabby without becoming runtime animation."),
    visualSurface("hud-frame", "Mortal-Kombat-inspired HUD frame with original shapes and no copied branding."),
    visualSurface("rabbit-portrait", "Gray Rabbit HUD/select portrait grounded in canonical sheet."),
    visualSurface("cat-portrait", "Ginger tabby HUD/select portrait grounded in canonical sheet."),
    visualSurface("health-bar-rabbit", "Red rabbit health bar treatment."),
    visualSurface("health-bar-cat", "Blue cat health bar treatment."),
    visualSurface("super-meter", "Bottom special/super meter treatment with readable fill states."),
    visualSurface("timer-frame", "Top center 99 timer frame."),
    visualSurface("fight-ko-victory-overlays", "FIGHT, K.O., round, and victory overlays with explosive particles."),
    visualSurface("pause-options-panel", "Pause/options/rematch panel art."),
    visualSurface("touch-controls", "Mobile touch-control button art and icons."),
    visualSurface("loading-fallback", "Loading and graceful fallback surface."),
    visualSurface("particle-atlas", "Hit sparks, dust, aura, projectile, tornado, flash, and meter particles."),
    visualSurface("damage-number-style", "Damage number typography/style sprites or procedural style source."),
  ],
  audioCues: [
    audioCue("music-loop", "Short arcade fight music loop for the courtyard match.", "manual"),
    audioCue("ui-confirm", "Menu confirm and select tick.", "procedural"),
    audioCue("fight-announcer", "FIGHT announcement voice or stylized bark.", "elevenlabs-sound-generation"),
    audioCue("hit-light", "Light hit impact.", "procedural"),
    audioCue("hit-heavy", "Heavy impact with hitstop punch.", "procedural"),
    audioCue("block-impact", "Guard impact clack.", "procedural"),
    audioCue("dash-whoosh", "Dash and hop movement whoosh.", "procedural"),
    audioCue("rabbit-tornado", "Rabbit tornado special spin.", "elevenlabs-sound-generation"),
    audioCue("cat-aura-blast", "Cat aura projectile or flip-kick special.", "elevenlabs-sound-generation"),
    audioCue("ko-burst", "K.O. burst and particle explosion.", "elevenlabs-sound-generation"),
    audioCue("victory-sting", "Short victory sting.", "elevenlabs-sound-generation"),
  ],
};

export function collectMeowtalProvenanceEntries(
  manifest: MeowtalProductionManifest = meowtalProductionManifest,
): readonly AssetProvenance[] {
  return [
    ...manifest.fighters.flatMap((fighter) => [
      fighter.canonicalSheet.provenance,
      ...fighter.animationRows.map((row) => row.provenance),
    ]),
    ...manifest.stage.layers.map((layer) => layer.provenance),
    ...manifest.visualSurfaces.map((surface) => surface.provenance),
    ...manifest.audioCues.map((cue) => cue.provenance),
  ];
}

export function validateMeowtalProductionManifest(
  manifest: MeowtalProductionManifest = meowtalProductionManifest,
): ProvenanceValidationResult {
  const errors = [...validateProvenanceEntries(collectMeowtalProvenanceEntries(manifest)).errors];
  if (manifest.fighters.length !== 2) errors.push("Meowtal production manifest requires exactly two fighters.");
  if (manifest.stage.layers.length < 5) errors.push("Meowtal courtyard requires at least five parallax layers.");

  for (const fighter of manifest.fighters) {
    if (!fighter.canonicalSheet.requiredBeforeAnimationRows) {
      errors.push(`${fighter.id}: canonical sheet must gate animation rows`);
    }
    if (fighter.animationRows.length !== REQUIRED_FIGHTER_ANIMATIONS.length) {
      errors.push(`${fighter.id}: missing animation row plans`);
    }
    for (const row of fighter.animationRows) {
      if (row.animationId === "idle") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: idle row should be runtime-approved after T028`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved idle row requires a generated runtime path`);
        }
      } else if (row.animationId === "walk-forward") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: walk-forward row should be runtime-approved after T032`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved walk-forward row requires a generated runtime path`);
        }
      } else if (row.animationId === "walk-back") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: walk-back row should be runtime-approved after T036`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved walk-back row requires a generated runtime path`);
        }
      } else if (row.animationId === "crouch") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: crouch row should be runtime-approved after T040`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved crouch row requires a generated runtime path`);
        }
      } else if (row.animationId === "jump") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: jump row should be runtime-approved after T044`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved jump row requires a generated runtime path`);
        }
      } else if (row.animationId === "light-punch") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: light-punch row should be runtime-approved after T048`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved light-punch row requires a generated runtime path`);
        }
      } else if (row.animationId === "hitstun") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: hitstun row should be runtime-approved after T052`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved hitstun row requires a generated runtime path`);
        }
      } else if (row.animationId === "blockstun") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: blockstun row should be runtime-approved after T056`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved blockstun row requires a generated runtime path`);
        }
      } else if (row.animationId === "heavy-punch") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: heavy-punch row should be runtime-approved after T068`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved heavy-punch row requires a generated runtime path`);
        }
      } else if (row.animationId === "light-kick") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: light-kick row should be runtime-approved after T076`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved light-kick row requires a generated runtime path`);
        }
      } else if (row.animationId === "special") {
        if (row.provenance.status !== "generated") {
          errors.push(`${row.provenance.assetId}: special row should remain generated until follow-up visual QA`);
        }
        if (row.provenance.runtimePath !== null) {
          errors.push(`${row.provenance.assetId}: generated special row must not have a runtime path before QA`);
        }
      } else {
        if (row.provenance.status !== "blocked") {
          errors.push(`${row.provenance.assetId}: remaining animation rows must remain blocked`);
        }
        if (!row.provenance.blocker?.includes("special row QA")) {
          errors.push(`${row.provenance.assetId}: remaining row blocker must reference special row QA`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function canonicalSheetsApproved(manifest: MeowtalProductionManifest = meowtalProductionManifest): boolean {
  return manifest.fighters.every((fighter) => fighter.canonicalSheet.styleLockApproved);
}

export function blockedAnimationRowsUntilCanonicalApproved(
  manifest: MeowtalProductionManifest = meowtalProductionManifest,
): readonly MeowtalAnimationRowPlan[] {
  if (canonicalSheetsApproved(manifest)) return [];
  return manifest.fighters.flatMap((fighter) => fighter.animationRows);
}

function makeFighters(): readonly MeowtalFighterAssetPlan[] {
  return (Object.keys(fighterDetails) as MeowtalFighterId[]).map((fighterId) => {
    const details = fighterDetails[fighterId];
    return {
      id: fighterId,
      displayName: details.displayName,
      engineCharacterId: fighterId,
      silhouette: details.silhouette,
      personality: details.personality,
      specialEnergy: details.specialEnergy,
      canonicalSheet: {
        fighterId,
        requiredBeforeAnimationRows: true,
        styleLockApproved: true,
        provenance: generatedCanonicalSheetProvenance(fighterId),
      },
      animationRows: REQUIRED_FIGHTER_ANIMATIONS.map((animationId) => ({
        fighterId,
        animationId,
        frameCount: animationFrameCounts[animationId],
        cellSize: 256,
        provenance:
          animationId === "idle"
            ? approvedIdleRowProvenance(fighterId, details)
            : animationId === "walk-forward"
              ? approvedWalkForwardRowProvenance(fighterId, details)
              : animationId === "walk-back"
                ? approvedWalkBackRowProvenance(fighterId, details)
                : animationId === "crouch"
                  ? approvedCrouchRowProvenance(fighterId, details)
                  : animationId === "jump"
                    ? approvedJumpRowProvenance(fighterId, details)
                    : animationId === "light-punch"
                      ? approvedLightPunchRowProvenance(fighterId, details)
                      : animationId === "hitstun"
                        ? approvedHitstunRowProvenance(fighterId, details)
                        : animationId === "blockstun"
                          ? approvedBlockstunRowProvenance(fighterId, details)
                          : animationId === "heavy-punch"
                            ? approvedHeavyPunchRowProvenance(fighterId, details)
                            : animationId === "light-kick"
                              ? approvedLightKickRowProvenance(fighterId, details)
                              : animationId === "special"
                                ? generatedSpecialRowProvenance(fighterId, details)
                      : blockedAnimationRowProvenance(fighterId, animationId, details),
      })),
    };
  });
}

function blockedAnimationRowProvenance(
  fighterId: MeowtalFighterId,
  animationId: FighterAnimationId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return imageProvenance({
    assetId: `${fighterId}:${animationId}`,
    promptSlug: `${fighterId}-${animationId}-animation-row`,
    prompt: animationRowPrompt(details.displayName, animationId),
    status: "blocked",
    blocker:
      "Wait for special row QA and a separate scoped generation task before generating this remaining animation row.",
  });
}

function generatedSpecialRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:special`,
      promptSlug: `${fighterId}-special-animation-row`,
      prompt: animationRowPrompt(details.displayName, "special"),
      status: "generated",
      blocker: "",
    }),
    sourcePath: specialRowSourcePaths[fighterId],
    runtimePath: null,
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen as a magenta chroma-keyed special-attack reference row for this project; retained as a non-runtime special row candidate pending follow-up visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Generated a magenta-keyed imagegen special-attack reference row after T077 scoped paired source-only specials.",
      "Removed the magenta chroma-key background with soft matte and despill to preserve green/yellow character-attached effects.",
      "Normalized to a 10-frame 2560x256 QA candidate under output/imagegen for visual review only.",
    ],
    approvalNotes: specialRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedLightKickRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:light-kick`,
      promptSlug: `${fighterId}-light-kick-animation-row`,
      prompt: animationRowPrompt(details.displayName, "light-kick"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: lightKickRowSourcePaths[fighterId],
    runtimePath: lightKickRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen as a chroma-keyed light-kick reference row for this project; approved normalized runtime light-kick row after T075 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Generated a chroma-keyed imagegen light-kick reference row after T073 rejected deterministic composited candidates as tube-like.",
      "Removed the green chroma-key background with soft matte and despill to produce a transparent source row.",
      "Normalized to an 8-frame 2048x256 QA candidate under output/imagegen and promoted the approved row to public runtime assets after T075 visual QA.",
    ],
    approvalNotes: lightKickRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedHeavyPunchRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:heavy-punch`,
      promptSlug: `${fighterId}-heavy-punch-animation-row`,
      prompt: animationRowPrompt(details.displayName, "heavy-punch"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: heavyPunchRowSourcePaths[fighterId],
    runtimePath: heavyPunchRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen style-lock assets and deterministic transparent row construction for this project; approved normalized runtime heavy-punch row after T067 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Constructed a clean transparent 8-frame source row from approved idle, crouch, and light-punch runtime style-lock components.",
      "Added crouch-load, planted weight shift, top-body shear into impact, follow-through, and recovery to distinguish heavy-punch from light-punch.",
      "Normalized to an 8-frame 2048x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: heavyPunchRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedBlockstunRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:blockstun`,
      promptSlug: `${fighterId}-blockstun-animation-row`,
      prompt: animationRowPrompt(details.displayName, "blockstun"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: blockstunRowSourcePaths[fighterId],
    runtimePath: blockstunRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime blockstun row after T055 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to a 5-frame 1280x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: blockstunRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedHitstunRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:hitstun`,
      promptSlug: `${fighterId}-hitstun-animation-row`,
      prompt: animationRowPrompt(details.displayName, "hitstun"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: hitstunRowSourcePaths[fighterId],
    runtimePath: hitstunRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime hitstun row after T051 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to a 5-frame 1280x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: hitstunRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedLightPunchRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:light-punch`,
      promptSlug: `${fighterId}-light-punch-animation-row`,
      prompt: animationRowPrompt(details.displayName, "light-punch"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: lightPunchRowSourcePaths[fighterId],
    runtimePath: lightPunchRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime light-punch row after T047 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to a 6-frame 1536x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: lightPunchRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedJumpRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:jump`,
      promptSlug: `${fighterId}-jump-animation-row`,
      prompt: animationRowPrompt(details.displayName, "jump"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: jumpRowSourcePaths[fighterId],
    runtimePath: jumpRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime jump row after T043 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to a 6-frame 1536x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: jumpRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedCrouchRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:crouch`,
      promptSlug: `${fighterId}-crouch-animation-row`,
      prompt: animationRowPrompt(details.displayName, "crouch"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: crouchRowSourcePaths[fighterId],
    runtimePath: crouchRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime crouch row after T039 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to a 4-frame 1024x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: crouchRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedWalkBackRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:walk-back`,
      promptSlug: `${fighterId}-walk-back-animation-row`,
      prompt: animationRowPrompt(details.displayName, "walk-back"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: walkBackRowSourcePaths[fighterId],
    runtimePath: walkBackRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime walk-back row after T035 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to an 8-frame 2048x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: walkBackRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedWalkForwardRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:walk-forward`,
      promptSlug: `${fighterId}-walk-forward-animation-row`,
      prompt: animationRowPrompt(details.displayName, "walk-forward"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: walkForwardRowSourcePaths[fighterId],
    runtimePath: walkForwardRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime walk-forward row after T031 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to an 8-frame 2048x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: walkForwardRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedIdleRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:idle`,
      promptSlug: `${fighterId}-idle-animation-row`,
      prompt: animationRowPrompt(details.displayName, "idle"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: idleRowSourcePaths[fighterId],
    runtimePath: idleRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved normalized runtime idle row after T027 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Copied selected built-in imagegen output into the repo source asset tree.",
      "Removed generated chroma-key background to transparent alpha with the imagegen remove_chroma_key helper.",
      "Normalized to an 8-frame 2048x256 runtime spritesheet and copied into public/assets/generated.",
    ],
    approvalNotes: idleRowQaNotes[fighterId],
    blocker: null,
  };
}

function animationRowPrompt(displayName: string, animationId: FighterAnimationId): string {
  return [
    `Using the approved canonical character sheet for ${displayName}, create the ${animationId} animation row.`,
    "Use the same upright two-legged fighting-game rig as the canonical sheet.",
    "Keep the fighter identity, species, markings, proportions, camera angle, lighting, scale, and render style consistent.",
    "Do not include detached hit sparks, dust, text, logos, watermarks, frame numbers, or background art in the row.",
  ].join("\n");
}

function generatedCanonicalSheetProvenance(fighterId: MeowtalFighterId): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:canonical-character-sheet`,
      promptSlug: `${fighterId}-canonical-character-sheet`,
      prompt: canonicalSheetPrompt(fighterId),
      status: "generated",
      blocker: "",
    }),
    sourcePath: canonicalSheetSourcePaths[fighterId],
    runtimePath: null,
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen for this project; approved as animation style-lock reference only, not as a runtime sprite.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: ["Copied selected built-in imagegen output into the repo source asset tree without runtime normalization."],
    approvalNotes: canonicalSheetQaNotes[fighterId],
    blocker: null,
  };
}

function canonicalSheetPrompt(fighterId: MeowtalFighterId): string {
  const details = fighterDetails[fighterId];
  return [
    `Create a complete polished character design sheet for ${details.displayName}, an original Meowtal Kombat fighter, on a clean light background.`,
    `Show a faithful consistent depiction with ${details.silhouette}, ${details.personality} expression, ${details.body}, ${details.markings}, ${details.signatureTraits}, and ${details.specialEnergy}.`,
    "All full-body views and combat poses must use one consistent upright two-legged fighting-game rig.",
    "Present the sheet as professional production concept art with full-body front view, side view, back view, 3/4 heroic pose, action-ready fighting pose, relaxed idle pose, large head close-up, and expression sheet.",
    "Include calm idle, excited grin, battle focus, shocked comedic expression, hit reaction, and powering-up intensity.",
    "Include detail callouts for silhouette, ears/tail/paws, fur markings, attack limbs, special-effect aura shape, readable gameplay pose shapes, size reference, and color swatches.",
    "Render as polished high-quality 2D arcade fighting game concept art, clean linework, vibrant cel-shaded color, animation-friendly shapes, consistent proportions, no watermark.",
  ].join("\n");
}

function stageLayer(id: MeowtalStageLayerId, parallax: number, role: string): MeowtalStageLayerPlan {
  return {
    id,
    parallax,
    role,
    provenance: imageProvenance({
      assetId: `meowtal-courtyard:${id}`,
      promptSlug: `meowtal-courtyard-${id}`,
      prompt: `Create the ${id} parallax layer for Meowtal Kombat's bright outdoor stone courtyard. ${role} Keep fighters and HUD readable. No text, logos, watermarks, or real brand marks.`,
      blocker: binaryBlocker,
    }),
  };
}

function visualSurface(id: MeowtalVisualSurfaceId, role: string): MeowtalVisualSurfacePlan {
  return {
    id,
    role,
    provenance: imageProvenance({
      assetId: `ui:${id}`,
      promptSlug: `meowtal-ui-${id}`,
      prompt: `Create the ${id} visual surface for Meowtal Kombat. ${role} Keep it original, readable, arcade-polished, and free of copied fighting-game branding.`,
      blocker: binaryBlocker,
    }),
  };
}

function audioCue(id: MeowtalAudioCueId, role: string, sourceKind: AssetSourceKind): MeowtalAudioCuePlan {
  return {
    id,
    role,
    provenance: {
      ...baseProvenance({
        assetId: `audio:${id}`,
        sourceKind,
        promptSlug: `meowtal-audio-${id}`,
        prompt: `Create or synthesize ${id} for Meowtal Kombat. ${role}`,
        blocker: binaryBlocker,
      }),
      medium: "audio",
    },
  };
}

function imageProvenance(input: {
  assetId: string;
  promptSlug: string;
  prompt: string;
  status?: ProvenanceStatus;
  blocker: string;
}): AssetProvenance {
  return {
    ...baseProvenance({
      assetId: input.assetId,
      sourceKind: "codex-imagegen",
      promptSlug: input.promptSlug,
      prompt: input.prompt,
      status: input.status,
      blocker: input.blocker,
    }),
    medium: "image",
  };
}

function baseProvenance(input: {
  assetId: string;
  sourceKind: AssetSourceKind;
  promptSlug: string;
  prompt: string;
  status?: ProvenanceStatus;
  blocker: string;
}): AssetProvenance {
  return {
    assetId: input.assetId,
    medium: "image",
    status: input.status ?? "planned",
    sourceKind: input.sourceKind,
    provider: providerFor(input.sourceKind),
    promptSlug: input.promptSlug,
    prompt: input.prompt,
    sourcePath: null,
    runtimePath: null,
    license: plannedLicense("Pending generated, procedural, or vetted-source asset approval before runtime use."),
    createdOrDownloadedOn: null,
    transforms: [],
    approvalNotes: "Not approved for runtime use yet.",
    blocker: input.blocker,
  };
}

function providerFor(sourceKind: AssetSourceKind): string {
  if (sourceKind === "codex-imagegen") return "Codex imagegen";
  if (sourceKind === "elevenlabs-sound-generation") return "ElevenLabs sound generation";
  if (sourceKind === "pixabay") return "Pixabay";
  if (sourceKind === "procedural") return "WebAudio/procedural synthesis";
  return "Manual production";
}
