import { REQUIRED_FIGHTER_ANIMATIONS, type FighterAnimationId } from "./types";
import {
  plannedLicense,
  validateProvenanceEntries,
  type AssetLicense,
  type AssetProvenance,
  type AssetSourceKind,
  type ProvenanceStatus,
  type ProvenanceValidationResult,
} from "./provenance";
import { AUDIO_CUE_ASSET_SPECS, type ArenaAudioAssetSpec } from "../game/audio";

export type MeowtalFighterId = "gray-rabbit" | "ginger-tabby-cat";
export type MeowtalSourceOnlyFighterId = "pugilist-pug";
export type MeowtalStageLayerId =
  | "sky-lighting"
  | "distant-hills-city"
  | "background-walls-pillars"
  | "midground-trees-bushes"
  | "playfield-stone-courtyard"
  | "foreground-dust-leaves";
export type MeowtalVisualSurfaceId =
  | "logo-title-mark"
  | "title-crest"
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

export interface MeowtalSourceOnlyFighterAssetPlan {
  id: MeowtalSourceOnlyFighterId;
  displayName: string;
  engineCharacterId: null;
  sourceOnly: true;
  silhouette: string;
  personality: string;
  specialEnergy: string;
  canonicalSheet: {
    fighterId: MeowtalSourceOnlyFighterId;
    requiredBeforeAnimationRows: true;
    styleLockApproved: boolean;
    provenance: AssetProvenance;
  };
  animationRows: readonly [];
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
  primaryAsset: ArenaAudioAssetSpec["primary"];
  proceduralFallback: ArenaAudioAssetSpec["proceduralFallback"];
  provenance: AssetProvenance;
}

export interface MeowtalProductionManifest {
  id: "meowtal-kombat-production";
  title: "Pawbreaker League";
  provenanceDocument: "docs/assets/meowtal-kombat-provenance.md";
  visualReferences: readonly string[];
  fighters: readonly MeowtalFighterAssetPlan[];
  sourceOnlyFighters: readonly MeowtalSourceOnlyFighterAssetPlan[];
  stage: {
    id: "meowtal-courtyard";
    displayName: "Bright Courtyard";
    layers: readonly MeowtalStageLayerPlan[];
  };
  visualSurfaces: readonly MeowtalVisualSurfacePlan[];
  audioCues: readonly MeowtalAudioCuePlan[];
}

type MeowtalEndStateAnimationId = Extract<FighterAnimationId, "win" | "lose">;

const binaryBlocker = "Planned production asset only; no binary image or audio generated in the T020 scaffold.";
const generatedOn = "2026-05-14";
const pawbreakerGeneratedOn = "2026-05-16";

const stageLayerSourcePaths: Readonly<Record<MeowtalStageLayerId, string>> = {
  "sky-lighting": "assets/source/imagegen/stages/meowtal-courtyard/sky-lighting.png",
  "distant-hills-city": "assets/source/imagegen/stages/meowtal-courtyard/distant-hills-city.png",
  "background-walls-pillars": "assets/source/imagegen/stages/meowtal-courtyard/background-walls-pillars.png",
  "midground-trees-bushes": "assets/source/imagegen/stages/meowtal-courtyard/midground-trees-bushes.png",
  "playfield-stone-courtyard": "assets/source/imagegen/stages/meowtal-courtyard/playfield-stone-courtyard.png",
  "foreground-dust-leaves": "assets/source/imagegen/stages/meowtal-courtyard/foreground-dust-leaves.png",
};

const stageLayerRuntimePaths: Readonly<Record<MeowtalStageLayerId, string>> = {
  "sky-lighting": "/assets/generated/stages/meowtal-courtyard/sky-lighting.png",
  "distant-hills-city": "/assets/generated/stages/meowtal-courtyard/distant-hills-city.png",
  "background-walls-pillars": "/assets/generated/stages/meowtal-courtyard/background-walls-pillars.png",
  "midground-trees-bushes": "/assets/generated/stages/meowtal-courtyard/midground-trees-bushes.png",
  "playfield-stone-courtyard": "/assets/generated/stages/meowtal-courtyard/playfield-stone-courtyard.png",
  "foreground-dust-leaves": "/assets/generated/stages/meowtal-courtyard/foreground-dust-leaves.png",
};

const stageLayerOutputCandidatePaths: Readonly<Record<MeowtalStageLayerId, string>> = {
  "sky-lighting": "output/imagegen/meowtal-courtyard-sky-lighting.png",
  "distant-hills-city": "output/imagegen/meowtal-courtyard-distant-hills-city.png",
  "background-walls-pillars": "output/imagegen/meowtal-courtyard-background-walls-pillars.png",
  "midground-trees-bushes": "output/imagegen/meowtal-courtyard-midground-trees-bushes.png",
  "playfield-stone-courtyard": "output/imagegen/meowtal-courtyard-playfield-stone-courtyard.png",
  "foreground-dust-leaves": "output/imagegen/meowtal-courtyard-foreground-dust-leaves.png",
};

const stageLayerTransformNotes: Readonly<Record<MeowtalStageLayerId, readonly string[]>> = {
  "sky-lighting": [
    "Generated with Codex built-in imagegen as the opaque 1024x576 sky and lighting base.",
    "Copied selected output into the repo source asset tree and mirrored it as an output QA candidate.",
  ],
  "distant-hills-city": [
    "Generated with Codex built-in imagegen as a magenta chroma-key parallax layer.",
    "Copied selected output into the repo source asset tree, resized to 1024x576, and chroma-key normalized into the output QA candidate.",
  ],
  "background-walls-pillars": [
    "Generated with Codex built-in imagegen as a magenta chroma-key parallax layer.",
    "Copied selected output into the repo source asset tree, resized to 1024x576, and chroma-key normalized into the output QA candidate.",
  ],
  "midground-trees-bushes": [
    "Generated with Codex built-in imagegen as a magenta chroma-key parallax layer after rejecting a UI-contaminated candidate.",
    "Copied selected output into the repo source asset tree, resized to 1024x576, and chroma-key normalized into the output QA candidate.",
  ],
  "playfield-stone-courtyard": [
    "Generated with Codex built-in imagegen as a magenta chroma-key parallax layer.",
    "Copied selected output into the repo source asset tree, resized to 1024x576, shifted downward 40 pixels to fill the bottom of the fighting lane, and chroma-key normalized into the output QA candidate.",
  ],
  "foreground-dust-leaves": [
    "Generated with Codex built-in imagegen as a magenta chroma-key parallax layer after rejecting candidates with unusable background artifacts.",
    "Copied selected output into the repo source asset tree, resized to 1024x576, and chroma-key normalized into the output QA candidate.",
  ],
};

const stageLayerQaNotes: Readonly<Record<MeowtalStageLayerId, string>> = {
  "sky-lighting":
    "Approved runtime parallax layer: bright blue sky, warm lens flare, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
  "distant-hills-city":
    "Approved runtime parallax layer: colorful distant hills and cityscape behind the courtyard wall, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
  "background-walls-pillars":
    "Approved runtime parallax layer: low stone walls and pillars with readable depth, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
  "midground-trees-bushes":
    "Approved runtime parallax layer: trees and bushes frame the combat lane without covering the center, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
  "playfield-stone-courtyard":
    "Approved runtime parallax layer: bright stone-paved fighting lane with solid bottom coverage and clear gameplay readability, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
  "foreground-dust-leaves":
    "Approved runtime parallax layer: edge props, leaves, petals, and dust puffs for foreground parallax, no fighters, HUD, text, logos, watermarks, or brand marks. Approved for runtime promotion by T093.",
};

const generatedUiSurfaceSourcePaths: Readonly<Partial<Record<MeowtalVisualSurfaceId, string>>> = {
  "title-crest": "assets/source/imagegen/ui/pawbreaker/title-crest.png",
  "logo-title-mark": "assets/source/imagegen/ui/meowtal/logo-title-mark.png",
  "hud-frame": "assets/source/imagegen/ui/meowtal/hud-frame.png",
  "rabbit-portrait": "assets/source/imagegen/ui/meowtal/rabbit-portrait.png",
  "cat-portrait": "assets/source/imagegen/ui/meowtal/cat-portrait.png",
  "health-bar-rabbit": "assets/source/imagegen/ui/meowtal/health-bar-rabbit.png",
  "health-bar-cat": "assets/source/imagegen/ui/meowtal/health-bar-cat.png",
  "super-meter": "assets/source/imagegen/ui/meowtal/super-meter.png",
  "timer-frame": "assets/source/imagegen/ui/meowtal/timer-frame.png",
  "fight-ko-victory-overlays": "assets/source/imagegen/ui/meowtal/fight-ko-victory-overlays.png",
};

const generatedUiSurfaceRuntimePaths: Readonly<Partial<Record<MeowtalVisualSurfaceId, string>>> = {
  "title-crest": "/assets/generated/ui/pawbreaker/title-crest.png",
  "logo-title-mark": "/assets/generated/ui/meowtal/logo-title-mark.png",
  "hud-frame": "/assets/generated/ui/meowtal/hud-frame.png",
  "rabbit-portrait": "/assets/generated/ui/meowtal/rabbit-portrait.png",
  "cat-portrait": "/assets/generated/ui/meowtal/cat-portrait.png",
  "health-bar-rabbit": "/assets/generated/ui/meowtal/health-bar-rabbit.png",
  "health-bar-cat": "/assets/generated/ui/meowtal/health-bar-cat.png",
  "super-meter": "/assets/generated/ui/meowtal/super-meter.png",
  "timer-frame": "/assets/generated/ui/meowtal/timer-frame.png",
  "fight-ko-victory-overlays": "/assets/generated/ui/meowtal/fight-ko-victory-overlays.png",
};

const generatedUiSurfaceOutputCandidatePaths: Readonly<Partial<Record<MeowtalVisualSurfaceId, string>>> = {
  "title-crest": "assets/source/imagegen/ui/pawbreaker/candidates/title-crest-codex-01.png",
  "logo-title-mark": "assets/source/imagegen/ui/meowtal/candidates/logo-title-mark-codex-01.png",
  "hud-frame": "assets/source/imagegen/ui/meowtal/candidates/hud-frame-codex-01.png",
  "rabbit-portrait": "output/imagegen/meowtal-ui-rabbit-portrait.png",
  "cat-portrait": "output/imagegen/meowtal-ui-cat-portrait.png",
  "health-bar-rabbit": "assets/source/imagegen/ui/meowtal/candidates/health-bar-rabbit-codex-01.png",
  "health-bar-cat": "assets/source/imagegen/ui/meowtal/candidates/health-bar-cat-codex-01.png",
  "super-meter": "assets/source/imagegen/ui/meowtal/candidates/super-meter-codex-01.png",
  "timer-frame": "assets/source/imagegen/ui/meowtal/candidates/timer-frame-codex-01.png",
  "fight-ko-victory-overlays": "assets/source/imagegen/ui/meowtal/candidates/fight-ko-victory-overlays-codex-01.png",
};

const generatedUiSurfaceQaNotes: Readonly<Partial<Record<MeowtalVisualSurfaceId, string>>> = {
  "title-crest":
    "Approved runtime UI asset: Codex built-in imagegen generated a textless Pawbreaker League crest/backplate with rabbit-ear, paw, toy-glove, and treat-belt motifs on flat chroma key; chroma key was removed to transparent alpha. The bitmap contains no readable text, pseudo-text, MK, Meowtal, Kombat, watermark, copied fighting-game logo, dragon mark, or real brand mark. Exact PAWBREAKER LEAGUE title words are rendered code-native by Phaser scene text. Approved by T010 visual QA, promoted by T010, and routed behind code-native title text.",
  "logo-title-mark":
    "Approved runtime UI asset: Codex built-in imagegen regenerated readable MEOWTAL KOMBAT title mark with rabbit-ear and cat-tail motifs, transparent alpha, original-view crop-compatible layout, no copied branding, watermark, or brand marks. Approved by T155 visual QA, promoted by T156, and routed into scene rendering by T100.",
  "hud-frame":
    "Approved runtime UI asset: Codex built-in imagegen regenerated top HUD frame with left/right health housings and center timer medallion, transparent alpha, original-view crop-compatible layout, no text, portraits, copied branding, watermark, or brand marks. Approved by T157 visual QA, promoted by T158, and routed into scene rendering by T100.",
  "rabbit-portrait":
    "Approved runtime UI asset: Gray Rabbit HUD portrait medallion derived from approved transparent idle sprite to preserve upright two-legged identity and proportions, transparent alpha, no text, copied branding, watermark, or brand marks. Approved by T098 visual QA, promoted by T099, routed into scene rendering by T100, and retained by T159 portrait audit because source/public assets are byte-identical and replacement imagegen would risk character drift.",
  "cat-portrait":
    "Approved runtime UI asset: Ginger Tabby Cat HUD portrait medallion derived from approved transparent idle sprite to preserve upright two-legged identity and proportions, transparent alpha, no text, copied branding, watermark, or brand marks. Approved by T098 visual QA, promoted by T099, routed into scene rendering by T100, and retained by T159 portrait audit because source/public assets are byte-identical and replacement imagegen would risk character drift.",
  "health-bar-rabbit":
    "Approved runtime UI asset: Codex built-in imagegen regenerated red rabbit-side health bar treatment with transparent alpha, original-view crop-compatible layout, no text, portraits, copied branding, watermark, or brand marks. Approved by T157 visual QA, promoted by T158, and routed into scene rendering by T100.",
  "health-bar-cat":
    "Approved runtime UI asset: Codex built-in imagegen regenerated blue cat-side health bar treatment with transparent alpha, original-view crop-compatible layout, no text, portraits, copied branding, watermark, or brand marks. Approved by T157 visual QA, promoted by T158, and routed into scene rendering by T100.",
  "super-meter":
    "Approved runtime UI asset: Codex built-in imagegen regenerated bottom special/super meter bar with gold/obsidian trim and green/yellow segmented energy fill, transparent alpha, original-view crop-compatible layout, no text, copied branding, watermark, or brand marks. Approved by T157 visual QA, promoted by T158, and routed into scene rendering by T100.",
  "timer-frame":
    "Approved runtime UI asset: Codex built-in imagegen regenerated circular center timer frame with transparent alpha, original-view crop-compatible layout, no numbers, copied branding, watermark, or brand marks. Approved by T157 visual QA, promoted by T158, and routed into scene rendering by T100.",
  "fight-ko-victory-overlays":
    "Approved runtime UI asset: Codex built-in imagegen regenerated FIGHT, K.O., Rabbit Wins, and Tabby Wins overlay sheet with crisp lettering, transparent alpha, original-view four-quadrant crop-compatible layout, no copied branding, watermark, or brand marks. Approved by T155 visual QA, promoted by T156, and routed into scene rendering by T100.",
};

const generatedUiSurfaceTransformNotes: Readonly<Partial<Record<MeowtalVisualSurfaceId, readonly string[]>>> = {
  "title-crest": [
    "Generated one textless Pawbreaker title crest/backplate with Codex built-in imagegen on green chroma-key background.",
    "Rejected generated text as a source of title wording by design; exact PAWBREAKER LEAGUE title words remain code-native Phaser text.",
    "Removed chroma-key background to alpha with the imagegen helper and promoted the selected output to source and runtime Pawbreaker UI paths.",
  ],
  "logo-title-mark": [
    "Regenerated complete title-mark sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible title placement.",
    "Promoted T155 candidate assets/source/imagegen/ui/meowtal/candidates/logo-title-mark-codex-01.png to source and runtime paths in T156.",
  ],
  "hud-frame": [
    "Regenerated complete HUD frame sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible top HUD placement.",
    "Promoted T157 candidate assets/source/imagegen/ui/meowtal/candidates/hud-frame-codex-01.png to source and runtime paths in T158.",
  ],
  "rabbit-portrait": [
    "Derived portrait medallion from approved Codex imagegen gray-rabbit idle runtime sprite to avoid character drift.",
    "Composited into a transparent 1024x576 HUD portrait source candidate with local frame, glow, and side markers.",
    "Retained unchanged in T159 after alpha/dimension/source-public identity checks and browser smoke confirmed the portrait remains the safest no-drift runtime asset.",
  ],
  "cat-portrait": [
    "Derived portrait medallion from approved Codex imagegen ginger-tabby-cat idle runtime sprite to avoid character drift.",
    "Composited into a transparent 1024x576 HUD portrait source candidate with local frame, glow, and side markers.",
    "Retained unchanged in T159 after alpha/dimension/source-public identity checks and browser smoke confirmed the portrait remains the safest no-drift runtime asset.",
  ],
  "health-bar-rabbit": [
    "Regenerated complete rabbit health-bar sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible left-bar placement.",
    "Promoted T157 candidate assets/source/imagegen/ui/meowtal/candidates/health-bar-rabbit-codex-01.png to source and runtime paths in T158.",
  ],
  "health-bar-cat": [
    "Regenerated complete cat health-bar sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible right-bar placement.",
    "Promoted T157 candidate assets/source/imagegen/ui/meowtal/candidates/health-bar-cat-codex-01.png to source and runtime paths in T158.",
  ],
  "super-meter": [
    "Regenerated complete super-meter sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible bottom meter placement.",
    "Promoted T157 candidate assets/source/imagegen/ui/meowtal/candidates/super-meter-codex-01.png to source and runtime paths in T158.",
  ],
  "timer-frame": [
    "Regenerated complete timer-frame sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original crop-compatible center timer placement.",
    "Promoted T157 candidate assets/source/imagegen/ui/meowtal/candidates/timer-frame-codex-01.png to source and runtime paths in T158.",
  ],
  "fight-ko-victory-overlays": [
    "Regenerated complete FIGHT/K.O./victory overlay sheet with Codex built-in imagegen on magenta chroma-key background.",
    "Removed chroma-key background to alpha, resized to 1024x576, and preserved the original four-quadrant crop-compatible overlay placement.",
    "Promoted T155 candidate assets/source/imagegen/ui/meowtal/candidates/fight-ko-victory-overlays-codex-01.png to source and runtime paths in T156.",
  ],
};

const proceduralUiSurfaceDetails: Readonly<
  Partial<
    Record<
      MeowtalVisualSurfaceId,
      {
        sourcePath: string;
        runtimePath: string;
        transforms: readonly string[];
        approvalNotes: string;
      }
    >
  >
> = {
  "title-key-art": {
    sourcePath: "src/game/MeowtalArenaScene.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Composed at runtime from approved parallax stage layers, approved Meowtal logo/title art, and approved idle fighter sprites.",
      "Uses Phaser scene placement and procedural frames instead of a separate static title-key-art bitmap.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: title and select key-art presentation is implemented by the Meowtal scene composition, with approved logo art and upright two-legged fighter sprites visible in the shell. Verified by T100-T103 and smoke evidence from T111/T115.",
  },
  "pause-options-panel": {
    sourcePath: "src/game/MeowtalArenaScene.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Rendered at runtime through Phaser Graphics in drawPauseOptionsPanel.",
      "Uses approved Meowtal palette, readable modal layout, and existing shell overlay depth.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: pause/options/rematch panel is implemented as an owned Phaser Graphics overlay and verified for desktop/mobile readability by T102.",
  },
  "touch-controls": {
    sourcePath: "src/game/touchControls.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Defines phone portrait, phone landscape, and standard touch zones in code.",
      "Renders labels, fills, strokes, active states, safe spacing, and pause-safe controls through Phaser Graphics.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: mobile touch controls are owned code assets with no external art dependency, verified by T106-T107 and smoke-tested on portrait and landscape phone viewports.",
  },
  "loading-fallback": {
    sourcePath: "src/game/MeowtalArenaScene.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Keeps procedural stage, HUD, and fighter fallback rendering paths available if image textures are unavailable.",
      "Production smoke verifies the approved generated runtime assets load, while fallback paths remain graceful instead of blank.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: loading/fallback presentation is implemented by owned canvas fallback rendering and runtime readiness text, with production smoke reporting no missing runtime UI or stage/fighter fallbacks.",
  },
  "particle-atlas": {
    sourcePath: "src/game/effects.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Creates hit/block effect descriptors from combat events.",
      "Draws impact sparks, block rings, action trails, aura flashes, screen flash, and camera shake procedurally at runtime instead of using a bitmap particle atlas.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: hit sparks, block flashes, special/super trails, impact flashes, and shake are implemented as owned code-driven effects. No external particle atlas is required for the current production scope.",
  },
  "damage-number-style": {
    sourcePath: "src/game/effects.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Creates per-hit damage popup descriptors from combat hit events.",
      "Renders floating damage values through owned Phaser Text objects with move-specific color, stroke, pop scale, drift, and fade.",
    ],
    approvalNotes:
      "Approved procedural runtime surface: floating per-hit damage-number popups are implemented as owned code-driven text effects and exposed through render_game_to_text telemetry.",
  },
};

const plannedVisualSurfaceBlockers: Readonly<Partial<Record<MeowtalVisualSurfaceId, string>>> = {};

const implementedAudioCueDetails: Readonly<
  Partial<
    Record<
      MeowtalAudioCueId,
      {
        sourcePath: string;
        runtimePath: string;
        transforms: readonly string[];
        approvalNotes: string;
      }
    >
  >
> = {
  "music-loop": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/audio.ts",
    transforms: [
      "Synthesizes a low-volume looping fight phrase through WebAudio oscillators after browser audio unlock.",
      "Does not download, embed, or license external music.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: ArenaAudio.startMusicLoop and playMusicPhrase synthesize the current fight music loop as an owned WebAudio cue.",
  },
  "ui-confirm": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps start, reset, pause, fullscreen, and shell confirm actions to the procedural ui-confirm cue.",
      "Synthesizes a short two-tone confirmation tick through WebAudio oscillators.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: UI confirm/select feedback is implemented and routed through the Meowtal scene shell.",
  },
  "fight-announcer": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Routes fight-start transitions through the procedural fight-announcer cue.",
      "Synthesizes a dramatic two-tone stinger with a short noise accent through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: fight-announcer is routed on fight start/round restart and synthesized without external voice or sample assets.",
  },
  "hit-light": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps light and light-kick hit events to a distinct lighter procedural hit cue.",
      "Synthesizes a short noise burst plus high tonal tick through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: light-hit impacts now use a distinct owned WebAudio cue.",
  },
  "hit-heavy": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps heavy hit events and unknown special/super fallbacks to a distinct heavier procedural hit cue.",
      "Synthesizes a deeper noise and bass impact through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: heavy-hit impacts now use a distinct owned WebAudio cue.",
  },
  "block-impact": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps block combat events to the procedural block cue.",
      "Synthesizes a short noise burst plus tonal clack through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: block-impact is implemented through audioCueForCombatEvents and ArenaAudio.play('block-impact').",
  },
  "dash-whoosh": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps run, backdash, roll, and hop state transitions to a procedural movement whoosh.",
      "Synthesizes a short noise burst and rising sine motion cue through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: dash/hop whoosh is implemented from mobility state events with no external samples.",
  },
  "rabbit-tornado": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps gray-rabbit special/super hit events to the rabbit-tornado cue.",
      "Synthesizes a noisy spinning sweep through WebAudio oscillators.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: Rabbit tornado/special impact now has a distinct owned procedural cue.",
  },
  "cat-aura-blast": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps ginger-tabby-cat special/super hit events to the cat-aura-blast cue.",
      "Synthesizes a rising aura tone and short blast noise through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: Cat aura/blast special impact now has a distinct owned procedural cue.",
  },
  "ko-burst": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps round-over transitions to a procedural K.O. burst cue.",
      "Synthesizes a larger noise burst plus descending bass impact through WebAudio.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: K.O. burst is implemented for round-over transitions with no external samples.",
  },
  "victory-sting": {
    sourcePath: "src/game/audio.ts",
    runtimePath: "src/game/MeowtalArenaScene.ts",
    transforms: [
      "Maps match-over transitions to the procedural match-over cue.",
      "Synthesizes a short three-tone victory sting through WebAudio oscillators.",
    ],
    approvalNotes:
      "Approved procedural runtime audio: victory-sting is implemented through audioCueForMatchTransition and ArenaAudio.play('match-over').",
  },
};

const plannedAudioCueBlockers: Readonly<Partial<Record<MeowtalAudioCueId, string>>> = {};

const canonicalSheetSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/canonical-character-sheet.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/canonical-character-sheet.png",
};

const sourceOnlyCanonicalSheetSourcePaths: Readonly<Record<MeowtalSourceOnlyFighterId, string>> = {
  "pugilist-pug": "assets/source/imagegen/fighters/pugilist-pug/canonical-character-sheet.png",
};

const canonicalSheetQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved as animation style-lock reference only. Visual QA: rabbit-only upright two-legged sheet, no visible text/watermark, includes front/side/back/three-quarter pose, action pose, idle pose, head close-up, expressions, detail callouts, size reference, color swatches, green tornado language, and consistent gray rabbit proportions.",
  "ginger-tabby-cat":
    "Approved as animation style-lock reference only. Visual QA: cat-only upright two-legged sheet, no visible text/watermark, includes front/side/back views, upright combat poses, upright idle, head close-up, expressions, detail callouts, size reference, color swatches, yellow-green energy language, and consistent orange tabby markings.",
};

const sourceOnlyCanonicalSheetQaNotes: Readonly<Record<MeowtalSourceOnlyFighterId, string>> = {
  "pugilist-pug":
    "Approved as source-only identity lock, not a runtime sprite. Visual QA: Pickles reads as one cute upright pug pressure-boxer with consistent wrinkles, round muzzle, folded ears, curled tail, short limbs, warm fawn/dark muzzle palette, toy boxing gloves, and compact silhouette across views/poses; no readable text, pseudo-text, watermark, logo, copied fighting-game costume language, extra characters, or public/runtime promotion.",
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

const specialRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/special.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/special.png",
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

const knockdownRowSourcePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "assets/source/imagegen/fighters/gray-rabbit/knockdown.png",
  "ginger-tabby-cat": "assets/source/imagegen/fighters/ginger-tabby-cat/knockdown.png",
};

const knockdownRowRuntimePaths: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit": "/assets/generated/fighters/gray-rabbit/knockdown.png",
  "ginger-tabby-cat": "/assets/generated/fighters/ginger-tabby-cat/knockdown.png",
};

const endStateRowSourcePaths: Readonly<Record<MeowtalFighterId, Readonly<Record<MeowtalEndStateAnimationId, string>>>> =
  {
    "gray-rabbit": {
      win: "assets/source/imagegen/fighters/gray-rabbit/win.png",
      lose: "assets/source/imagegen/fighters/gray-rabbit/lose.png",
    },
    "ginger-tabby-cat": {
      win: "assets/source/imagegen/fighters/ginger-tabby-cat/win.png",
      lose: "assets/source/imagegen/fighters/ginger-tabby-cat/lose.png",
    },
  };

const endStateRowRuntimePaths: Readonly<Record<MeowtalFighterId, Readonly<Record<MeowtalEndStateAnimationId, string>>>> =
  {
    "gray-rabbit": {
      win: "/assets/generated/fighters/gray-rabbit/win.png",
      lose: "/assets/generated/fighters/gray-rabbit/lose.png",
    },
    "ginger-tabby-cat": {
      win: "/assets/generated/fighters/ginger-tabby-cat/win.png",
      lose: "/assets/generated/fighters/ginger-tabby-cat/lose.png",
    },
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
    "Approved runtime special row. Visual QA: ten separated upright two-legged gray rabbit rapid spinning tornado frames with crouch-load, readable spin build-up, character-attached green energy ribbons, deceleration, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to 2560x256 RGBA, and approved for runtime publication by T079.",
  "ginger-tabby-cat":
    "Approved runtime special row. Visual QA: ten separated upright two-legged ginger tabby acrobatic flip-kick frames with planted chamber, readable mid-flip, green/yellow foot-attached aura crescents, controlled landing, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to 2560x256 RGBA, and approved for runtime publication by T079.",
};

const knockdownRowQaNotes: Readonly<Record<MeowtalFighterId, string>> = {
  "gray-rabbit":
    "Approved runtime knockdown row. Visual QA: eight separated gray rabbit fighting-game knockdown frames with upright two-legged hurt/fall anticipation, loss of balance, ground impact, and dazed grounded hit-reaction hold; no crawl/rest/sleeping or stance-convention reset, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T083.",
  "ginger-tabby-cat":
    "Approved runtime knockdown row. Visual QA: eight separated ginger tabby fighting-game knockdown frames with upright two-legged hurt/fall anticipation, loss of balance, ground impact, and dazed grounded hit-reaction hold; no crawl/rest/sleeping or stance-convention reset, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T083.",
};

const endStateRowQaNotes: Readonly<Record<MeowtalFighterId, Readonly<Record<MeowtalEndStateAnimationId, string>>>> = {
  "gray-rabbit": {
    win: "Approved runtime win row. Visual QA: eight separated upright two-legged gray rabbit arcade victory frames with guard recovery, hop, fist pump, playful flourish, confident smile, and held victory pose; no four-legged stance/crawl/rest/sleeping, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T087.",
    lose: "Approved runtime lose row. Visual QA: six separated gray rabbit arcade defeated/KO frames with upright two-legged stunned wobble, buckling, collapse, impact, and dazed grounded KO hold; no crawl/rest/sleeping or peaceful nap expression, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T087.",
  },
  "ginger-tabby-cat": {
    win: "Approved runtime win row. Visual QA: eight separated upright two-legged ginger tabby arcade victory frames with guard recovery, proud tail flick, bounce, paw flourish, grin, and held smug victory pose; no four-legged stance/crawl/rest/sleeping, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 2048x256 RGBA, and approved for runtime publication by T087.",
    lose: "Approved runtime lose row. Visual QA: six separated ginger tabby arcade defeated/KO frames with upright two-legged stunned wobble, buckling, collapse, impact, and dazed grounded KO hold; no crawl/rest/sleeping or peaceful nap expression, no visible text/watermark/frame numbers, green chroma-key removed to transparent alpha, normalized to 1536x256 RGBA, and approved for runtime publication by T087.",
  },
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

const sourceOnlyFighterDetails: Readonly<
  Record<
    MeowtalSourceOnlyFighterId,
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
  "pugilist-pug": {
    displayName: "Pickles Pugilist",
    silhouette: "upright two-legged compact pug stance, folded ears, curled tail, stubby limbs, broad guard, toy boxing gloves",
    personality: "cute, stubborn, brave, snack-motivated, comedic but battle-ready",
    body: "short upright biped pug body with stocky chest, planted feet, guarded shoulders, and readable pressure-boxer punching shapes",
    markings: "warm fawn coat, dark muzzle, soft wrinkle folds, black folded ears, pale belly patch, small curled tail",
    signatureTraits: "peekaboo guard, stubby glove jabs, shoulder bumps, treat-belt medallion, funny over-serious stare",
    specialEnergy: "small golden treat-belt spark effects kept attached to the character silhouette",
  },
};

export const meowtalProductionManifest: MeowtalProductionManifest = {
  id: "meowtal-kombat-production",
  title: "Pawbreaker League",
  provenanceDocument: "docs/assets/meowtal-kombat-provenance.md",
  visualReferences: [
    "docs/visual-reference/meowtal-kombat/vision-01.png",
    "docs/visual-reference/meowtal-kombat/vision-02.png",
    "docs/visual-reference/meowtal-kombat/vision-03.png",
    "docs/visual-reference/meowtal-kombat/vision-04.png",
  ],
  fighters: makeFighters(),
  sourceOnlyFighters: makeSourceOnlyFighters(),
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
    visualSurface("title-crest", "Textless Pawbreaker League decorative crest/backplate routed behind code-native title text."),
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
    audioCue("music-loop", "Short arcade fight music loop for the courtyard match.", "procedural"),
    audioCue("ui-confirm", "Menu confirm and select tick.", "procedural"),
    audioCue("fight-announcer", "FIGHT announcement voice or stylized bark.", "procedural"),
    audioCue("hit-light", "Light hit impact.", "procedural"),
    audioCue("hit-heavy", "Heavy impact with hitstop punch.", "procedural"),
    audioCue("block-impact", "Guard impact clack.", "procedural"),
    audioCue("dash-whoosh", "Dash and hop movement whoosh.", "procedural"),
    audioCue("rabbit-tornado", "Rabbit tornado special spin.", "procedural"),
    audioCue("cat-aura-blast", "Cat aura projectile or flip-kick special.", "procedural"),
    audioCue("ko-burst", "K.O. burst and particle explosion.", "procedural"),
    audioCue("victory-sting", "Short victory sting.", "procedural"),
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
    ...manifest.sourceOnlyFighters.map((fighter) => fighter.canonicalSheet.provenance),
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

  for (const layer of manifest.stage.layers) {
    if (layer.provenance.status !== "approved") {
      errors.push(`${layer.provenance.assetId}: courtyard layer should be runtime-approved after T093.`);
    }
    if (layer.provenance.sourcePath !== stageLayerSourcePaths[layer.id]) {
      errors.push(`${layer.provenance.assetId}: courtyard layer requires the scoped generated source path.`);
    }
    if (layer.provenance.runtimePath !== stageLayerRuntimePaths[layer.id]) {
      errors.push(`${layer.provenance.assetId}: courtyard layer requires the promoted runtime path.`);
    }
  }

  for (const surface of manifest.visualSurfaces) {
    const generatedSourcePath = generatedUiSurfaceSourcePaths[surface.id];
    const generatedRuntimePath = generatedUiSurfaceRuntimePaths[surface.id];
    if (generatedSourcePath) {
      if (surface.provenance.sourcePath !== generatedSourcePath) {
        errors.push(`${surface.provenance.assetId}: UI surface requires the scoped generated source path.`);
      }
      if (generatedRuntimePath) {
        if (surface.provenance.status !== "approved") {
          errors.push(`${surface.provenance.assetId}: UI surface should be runtime-approved after T096.`);
        }
        if (surface.provenance.runtimePath !== generatedRuntimePath) {
          errors.push(`${surface.provenance.assetId}: UI surface requires the promoted runtime path.`);
        }
      } else {
        if (surface.provenance.status !== "generated") {
          errors.push(`${surface.provenance.assetId}: UI surface should remain generated source-only until visual QA.`);
        }
        if (surface.provenance.runtimePath !== null) {
          errors.push(`${surface.provenance.assetId}: UI source candidate must not have runtimePath before promotion.`);
        }
      }
    } else if (surface.provenance.status !== "planned") {
      const proceduralSurface = proceduralUiSurfaceDetails[surface.id];
      if (proceduralSurface) {
        if (surface.provenance.status !== "approved") {
          errors.push(`${surface.provenance.assetId}: procedural UI surface should be approved after T118.`);
        }
        if (surface.provenance.sourceKind !== "procedural") {
          errors.push(`${surface.provenance.assetId}: procedural UI surface should use procedural sourceKind.`);
        }
        if (surface.provenance.sourcePath !== proceduralSurface.sourcePath) {
          errors.push(`${surface.provenance.assetId}: procedural UI surface requires the implementation source path.`);
        }
        if (surface.provenance.runtimePath !== proceduralSurface.runtimePath) {
          errors.push(`${surface.provenance.assetId}: procedural UI surface requires the implementation runtime path.`);
        }
        if (surface.provenance.license.kind !== "procedural-owned") {
          errors.push(`${surface.provenance.assetId}: procedural UI surface should use procedural-owned license.`);
        }
      } else {
        errors.push(`${surface.provenance.assetId}: out-of-scope UI surface should remain planned.`);
      }
    } else if (!plannedVisualSurfaceBlockers[surface.id]) {
      errors.push(`${surface.provenance.assetId}: planned UI surface requires an explicit remaining-gap blocker.`);
    }
  }

  for (const cue of manifest.audioCues) {
    const implementedCue = implementedAudioCueDetails[cue.id];
    const audioSpec = AUDIO_CUE_ASSET_SPECS.find((spec) => spec.id === cue.id);
    if (!audioSpec) {
      errors.push(`${cue.id}: audio cue requires an authored/sample asset spec.`);
      continue;
    }
    if (cue.primaryAsset.kind !== "authored-sample") {
      errors.push(`${cue.provenance.assetId}: primary audio must be authored/sample-based.`);
    }
    if (cue.primaryAsset.status !== "planned") {
      errors.push(`${cue.provenance.assetId}: primary authored/sample audio should remain planned until a source record exists.`);
    }
    if (!cue.primaryAsset.sourceRecordRequired) {
      errors.push(`${cue.provenance.assetId}: primary audio requires a source/license record.`);
    }
    if (cue.primaryAsset.runtimePath !== `/assets/generated/audio/${cue.id}.ogg`) {
      errors.push(`${cue.provenance.assetId}: primary audio runtime path must use the generated audio folder.`);
    }
    if (cue.primaryAsset.allowedSourceKinds.includes("elevenlabs-music")) {
      errors.push(`${cue.provenance.assetId}: ElevenLabs Music is not approved for game music without written approval.`);
    }
    if (cue.proceduralFallback.status !== "dev-only") {
      errors.push(`${cue.provenance.assetId}: procedural fallback must be dev-only.`);
    }
    if (cue.proceduralFallback.implementationPath !== "src/game/audio.ts") {
      errors.push(`${cue.provenance.assetId}: procedural fallback must point at src/game/audio.ts.`);
    }
    if (implementedCue) {
      if (cue.provenance.status !== "approved") {
        errors.push(`${cue.provenance.assetId}: implemented audio cue should be approved after T118.`);
      }
      if (cue.provenance.sourceKind !== "procedural") {
        errors.push(`${cue.provenance.assetId}: implemented audio cue should use procedural sourceKind.`);
      }
      if (cue.provenance.sourcePath !== implementedCue.sourcePath) {
        errors.push(`${cue.provenance.assetId}: implemented audio cue requires the implementation source path.`);
      }
      if (cue.provenance.runtimePath !== implementedCue.runtimePath) {
        errors.push(`${cue.provenance.assetId}: implemented audio cue requires the implementation runtime path.`);
      }
      if (cue.provenance.license.kind !== "procedural-owned") {
        errors.push(`${cue.provenance.assetId}: implemented audio cue should use procedural-owned license.`);
      }
    } else if (cue.provenance.status !== "planned") {
      errors.push(`${cue.provenance.assetId}: unimplemented audio cue should remain planned.`);
    } else if (!plannedAudioCueBlockers[cue.id]) {
      errors.push(`${cue.provenance.assetId}: planned audio cue requires an explicit remaining-gap blocker.`);
    }
  }

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
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: special row should be runtime-approved after T080`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved special row requires a generated runtime path`);
        }
      } else if (row.animationId === "knockdown") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: knockdown row should be runtime-approved after T084`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved knockdown row requires a generated runtime path`);
        }
        if (row.provenance.sourcePath !== knockdownRowSourcePaths[fighter.id]) {
          errors.push(`${row.provenance.assetId}: knockdown row requires the scoped generated source path`);
        }
      } else if (row.animationId === "win" || row.animationId === "lose") {
        if (row.provenance.status !== "approved") {
          errors.push(`${row.provenance.assetId}: ${row.animationId} row should be runtime-approved after T088`);
        }
        if (!row.provenance.runtimePath?.includes("/assets/generated/fighters/")) {
          errors.push(`${row.provenance.assetId}: approved ${row.animationId} row requires a generated runtime path`);
        }
        if (row.provenance.sourcePath !== endStateRowSourcePaths[fighter.id][row.animationId]) {
          errors.push(`${row.provenance.assetId}: ${row.animationId} row requires the scoped generated source path`);
        }
      } else {
        if (row.provenance.status !== "blocked") {
          errors.push(`${row.provenance.assetId}: remaining animation rows must remain blocked`);
        }
        if (!row.provenance.blocker?.includes("win/lose row scope")) {
          errors.push(`${row.provenance.assetId}: remaining row blocker must reference win/lose row scope`);
        }
      }
    }
  }

  for (const fighter of manifest.sourceOnlyFighters) {
    const provenance = fighter.canonicalSheet.provenance;
    if (!fighter.sourceOnly) errors.push(`${fighter.id}: planned fighter must be source-only.`);
    if (fighter.engineCharacterId !== null) errors.push(`${fighter.id}: source-only fighter must not expose an engine character id.`);
    if (fighter.animationRows.length !== 0) errors.push(`${fighter.id}: source-only fighter must not define animation rows.`);
    if (!fighter.canonicalSheet.requiredBeforeAnimationRows) errors.push(`${fighter.id}: canonical sheet must gate animation rows.`);
    if (!fighter.canonicalSheet.styleLockApproved) errors.push(`${fighter.id}: source-only canonical identity lock should be approved.`);
    if (provenance.status !== "generated") {
      errors.push(`${provenance.assetId}: source-only canonical sheet should remain generated, not runtime-approved.`);
    }
    if (provenance.sourceKind !== "codex-imagegen") {
      errors.push(`${provenance.assetId}: source-only canonical sheet should use Codex imagegen.`);
    }
    if (provenance.sourcePath !== sourceOnlyCanonicalSheetSourcePaths[fighter.id]) {
      errors.push(`${provenance.assetId}: source-only canonical sheet requires the scoped source path.`);
    }
    if (provenance.runtimePath !== null) {
      errors.push(`${provenance.assetId}: source-only canonical sheet must not have a runtime path.`);
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
                                ? approvedSpecialRowProvenance(fighterId, details)
                                : animationId === "knockdown"
                                  ? approvedKnockdownRowProvenance(fighterId, details)
                                  : animationId === "win" || animationId === "lose"
                                    ? approvedEndStateRowProvenance(fighterId, animationId, details)
                                  : blockedAnimationRowProvenance(fighterId, animationId, details),
      })),
    };
  });
}

function makeSourceOnlyFighters(): readonly MeowtalSourceOnlyFighterAssetPlan[] {
  return (Object.keys(sourceOnlyFighterDetails) as MeowtalSourceOnlyFighterId[]).map((fighterId) => {
    const details = sourceOnlyFighterDetails[fighterId];
    return {
      id: fighterId,
      displayName: details.displayName,
      engineCharacterId: null,
      sourceOnly: true,
      silhouette: details.silhouette,
      personality: details.personality,
      specialEnergy: details.specialEnergy,
      canonicalSheet: {
        fighterId,
        requiredBeforeAnimationRows: true,
        styleLockApproved: true,
        provenance: generatedSourceOnlyCanonicalSheetProvenance(fighterId),
      },
      animationRows: [],
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
      "Wait for win/lose row scope and a separate generation task before generating this remaining animation row.",
  });
}

function approvedKnockdownRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:knockdown`,
      promptSlug: `${fighterId}-knockdown-animation-row`,
      prompt: animationRowPrompt(details.displayName, "knockdown"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: knockdownRowSourcePaths[fighterId],
    runtimePath: knockdownRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen as a chroma-keyed knockdown reference row for this project; approved normalized runtime knockdown row after T083 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Generated green chroma-keyed imagegen knockdown reference rows after T081 scoped paired source-only knockdown candidates.",
      "Removed the green chroma-key background with soft matte and despill to produce transparent frame sources.",
      "Composed an eight-frame transparent source row from the best fall/impact frames while dropping sleepy or crawl-like end poses.",
      "Normalized to an 8-frame 2048x256 QA candidate under output/imagegen and promoted the approved row to public runtime assets after T083 visual QA.",
    ],
    approvalNotes: knockdownRowQaNotes[fighterId],
    blocker: null,
  };
}

function approvedEndStateRowProvenance(
  fighterId: MeowtalFighterId,
  animationId: MeowtalEndStateAnimationId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  const frameCount = animationFrameCounts[animationId];
  const width = frameCount * 256;
  return {
    ...imageProvenance({
      assetId: `${fighterId}:${animationId}`,
      promptSlug: `${fighterId}-${animationId}-animation-row`,
      prompt: animationRowPrompt(details.displayName, animationId),
      status: "approved",
      blocker: "",
    }),
    sourcePath: endStateRowSourcePaths[fighterId][animationId],
    runtimePath: endStateRowRuntimePaths[fighterId][animationId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen as a chroma-keyed end-state reference row for this project; approved normalized runtime end-state row after T087 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Generated green chroma-keyed imagegen win/lose reference rows after T085 scoped paired source-only end-state candidates.",
      "Removed the green chroma-key background with soft matte and despill to produce transparent source rows.",
      `Normalized to a ${frameCount}-frame ${width}x256 QA candidate under output/imagegen and promoted the approved row to public runtime assets after T087 visual QA.`,
    ],
    approvalNotes: endStateRowQaNotes[fighterId][animationId],
    blocker: null,
  };
}

function approvedSpecialRowProvenance(
  fighterId: MeowtalFighterId,
  details: (typeof fighterDetails)[MeowtalFighterId],
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:special`,
      promptSlug: `${fighterId}-special-animation-row`,
      prompt: animationRowPrompt(details.displayName, "special"),
      status: "approved",
      blocker: "",
    }),
    sourcePath: specialRowSourcePaths[fighterId],
    runtimePath: specialRowRuntimePaths[fighterId],
    license: {
      kind: "owned-generated",
      summary:
        "Generated with Codex built-in imagegen as a magenta chroma-keyed special-attack reference row for this project; approved normalized runtime special row after T079 visual QA.",
      sourceUrl: null,
      attribution: null,
      checkedOn: generatedOn,
    },
    createdOrDownloadedOn: generatedOn,
    transforms: [
      "Generated a magenta-keyed imagegen special-attack reference row after T077 scoped paired source-only specials.",
      "Removed the magenta chroma-key background with soft matte and despill to preserve green/yellow character-attached effects.",
      "Normalized to a 10-frame 2560x256 QA candidate under output/imagegen and promoted the approved row to public runtime assets after T079 visual QA.",
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
    "Do not switch between two-legged and four-legged normal stance conventions; ordinary stance and movement stay upright two-legged for both fighters.",
    "For knockdown and lose only, prone or grounded poses are acceptable when they clearly read as hit reactions or defeated arcade poses, not crawl, rest, sleeping, or a new normal stance.",
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

function generatedSourceOnlyCanonicalSheetProvenance(fighterId: MeowtalSourceOnlyFighterId): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `${fighterId}:canonical-character-sheet`,
      promptSlug: `${fighterId}-canonical-character-sheet`,
      prompt: sourceOnlyCanonicalSheetPrompt(fighterId),
      status: "generated",
      blocker: "",
    }),
    sourcePath: sourceOnlyCanonicalSheetSourcePaths[fighterId],
    runtimePath: null,
    license: ownedGeneratedImageLicense(
      "Generated with Codex built-in imagegen for this project; accepted as a source-only Pawbreaker roster identity lock, not a runtime sprite.",
      pawbreakerGeneratedOn,
    ),
    createdOrDownloadedOn: pawbreakerGeneratedOn,
    transforms: [
      "Generated exactly one source-only canonical model sheet with Codex built-in imagegen.",
      "Copied the accepted candidate into the repo source asset tree and output QA path without runtime/public promotion.",
    ],
    approvalNotes: sourceOnlyCanonicalSheetQaNotes[fighterId],
    blocker: null,
  };
}

function canonicalSheetPrompt(fighterId: MeowtalFighterId): string {
  const details = fighterDetails[fighterId];
  return [
    `Create a complete polished character design sheet for ${details.displayName}, an original Meowtal Kombat fighter, on a clean light background.`,
    `Show a faithful consistent depiction with ${details.silhouette}, ${details.personality} expression, ${details.body}, ${details.markings}, ${details.signatureTraits}, and ${details.specialEnergy}.`,
    "All full-body views and combat poses must use one consistent upright two-legged fighting-game rig.",
    "Do not mix two-legged and four-legged normal stance conventions; the production rig uses upright two-legged fighting stances for both fighters.",
    "Present the sheet as professional production concept art with full-body front view, side view, back view, 3/4 heroic pose, action-ready fighting pose, relaxed idle pose, large head close-up, and expression sheet.",
    "Include calm idle, excited grin, battle focus, shocked comedic expression, hit reaction, and powering-up intensity.",
    "Include detail callouts for silhouette, ears/tail/paws, fur markings, attack limbs, special-effect aura shape, readable gameplay pose shapes, size reference, and color swatches.",
    "Render as polished high-quality 2D arcade fighting game concept art, clean linework, vibrant cel-shaded color, animation-friendly shapes, consistent proportions, no watermark.",
  ].join("\n");
}

function sourceOnlyCanonicalSheetPrompt(fighterId: MeowtalSourceOnlyFighterId): string {
  const details = sourceOnlyFighterDetails[fighterId];
  return [
    `Create a complete polished source-only character design sheet for ${details.displayName}, an original Pawbreaker League fighter, on a clean light background.`,
    `Show a faithful consistent depiction with ${details.silhouette}, ${details.personality} expression, ${details.body}, ${details.markings}, ${details.signatureTraits}, and ${details.specialEnergy}.`,
    "All full-body views and combat poses must use one consistent upright two-legged fighting-game rig.",
    "Do not create animation rows, spritesheets, runtime portraits, select UI slots, public assets, or playable content.",
    "Present the sheet as professional production concept art with full-body front view, side view, back view, 3/4 heroic pose, action-ready guard pose, relaxed idle pose, large head close-up, expression sheet, silhouette guide, and color swatches.",
    "No text, pseudo-text, labels, logos, watermarks, copied fighting-game costume language, extra characters, background scenery, or real brand marks.",
    "Render as polished high-quality 2D arcade fighting game concept art, clean linework, vibrant cel-shaded color, animation-friendly shapes, consistent proportions, and source-only identity-lock clarity.",
  ].join("\n");
}

function stageLayer(id: MeowtalStageLayerId, parallax: number, role: string): MeowtalStageLayerPlan {
  return {
    id,
    parallax,
    role,
    provenance: approvedStageLayerProvenance(id, role),
  };
}

function approvedStageLayerProvenance(id: MeowtalStageLayerId, role: string): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `meowtal-courtyard:${id}`,
      promptSlug: `meowtal-courtyard-${id}`,
      prompt: `Create the ${id} parallax layer for Meowtal Kombat's bright outdoor stone courtyard. ${role} Keep fighters and HUD readable. No text, logos, watermarks, real brand marks, characters, or UI.`,
      status: "approved",
      blocker: "",
    }),
    sourcePath: stageLayerSourcePaths[id],
    runtimePath: stageLayerRuntimePaths[id],
    license: ownedGeneratedImageLicense(
      "Generated with Codex built-in imagegen for this project; approved as a runtime parallax stage layer for Meowtal Kombat.",
    ),
    createdOrDownloadedOn: generatedOn,
    transforms: [
      ...stageLayerTransformNotes[id],
      `Promoted normalized QA candidate ${stageLayerOutputCandidatePaths[id]} to ${stageLayerRuntimePaths[id]}.`,
    ],
    approvalNotes: `${stageLayerQaNotes[id]} QA candidate: ${stageLayerOutputCandidatePaths[id]}. Composite preview: output/imagegen/meowtal-courtyard-composite-preview.png.`,
    blocker: null,
  };
}

function ownedGeneratedImageLicense(summary: string, checkedOn: string = generatedOn): AssetLicense {
  return {
    kind: "owned-generated",
    summary,
    sourceUrl: null,
    attribution: null,
    checkedOn,
  };
}

function ownedProceduralLicense(summary: string): AssetLicense {
  return {
    kind: "procedural-owned",
    summary,
    sourceUrl: null,
    attribution: null,
    checkedOn: generatedOn,
  };
}

function visualSurface(id: MeowtalVisualSurfaceId, role: string): MeowtalVisualSurfacePlan {
  const generatedSourcePath = generatedUiSurfaceSourcePaths[id];
  if (generatedSourcePath) {
    return {
      id,
      role,
      provenance: approvedUiSurfaceProvenance(id, role, generatedSourcePath),
    };
  }

  const proceduralSurface = proceduralUiSurfaceDetails[id];
  if (proceduralSurface) {
    return {
      id,
      role,
      provenance: approvedProceduralUiSurfaceProvenance(id, role, proceduralSurface),
    };
  }

  return {
    id,
    role,
    provenance: imageProvenance({
      assetId: `ui:${id}`,
      promptSlug: `meowtal-ui-${id}`,
      prompt: `Create the ${id} visual surface for Meowtal Kombat. ${role} Keep it original, readable, arcade-polished, and free of copied fighting-game branding.`,
      blocker: plannedVisualSurfaceBlockers[id] ?? binaryBlocker,
    }),
  };
}

function approvedUiSurfaceProvenance(
  id: MeowtalVisualSurfaceId,
  role: string,
  sourcePath: string,
): AssetProvenance {
  const runtimePath = generatedUiSurfaceRuntimePaths[id];
  const isApproved = Boolean(runtimePath);
  return {
    ...imageProvenance({
      assetId: `ui:${id}`,
      promptSlug: `meowtal-ui-${id}`,
      prompt:
        id === "title-crest"
          ? `Create the ${id} visual surface for Pawbreaker League. ${role} Keep it original, textless, readable as a decorative crest, arcade-polished, source-only, and free of copied fighting-game branding, readable text, pseudo-text, watermarks, or real brand marks.`
          : `Create the ${id} visual surface for Meowtal Kombat. ${role} Keep it original, readable, arcade-polished, source-only, and free of copied fighting-game branding, watermarks, or real brand marks.`,
      status: isApproved ? "approved" : "generated",
      blocker: "",
    }),
    sourcePath,
    runtimePath: runtimePath ?? null,
    license: ownedGeneratedImageLicense(
      id === "title-crest"
        ? "Generated with Codex built-in imagegen for this project; approved as a textless Pawbreaker runtime UI crest and routed behind code-native title text by T010."
        : isApproved
          ? "Generated with Codex built-in imagegen for this project; approved as a runtime UI asset and routed into scene rendering by T100."
          : "Generated or derived from Codex imagegen source material for this project; source-only UI candidate pending visual QA and runtime promotion.",
      id === "title-crest" ? pawbreakerGeneratedOn : generatedOn,
    ),
    createdOrDownloadedOn: id === "title-crest" ? pawbreakerGeneratedOn : generatedOn,
    transforms: runtimePath
      ? [...(generatedUiSurfaceTransformNotes[id] ?? []), `Promoted source UI candidate to ${runtimePath}.`]
      : (generatedUiSurfaceTransformNotes[id] ?? []),
    approvalNotes: `${generatedUiSurfaceQaNotes[id]} QA candidate: ${generatedUiSurfaceOutputCandidatePaths[id]}.`,
    blocker: null,
  };
}

function approvedProceduralUiSurfaceProvenance(
  id: MeowtalVisualSurfaceId,
  role: string,
  details: NonNullable<(typeof proceduralUiSurfaceDetails)[MeowtalVisualSurfaceId]>,
): AssetProvenance {
  return {
    ...imageProvenance({
      assetId: `ui:${id}`,
      promptSlug: `meowtal-ui-${id}`,
      prompt: `Implement the ${id} visual surface for Meowtal Kombat as an owned procedural runtime surface. ${role} Keep it readable, original, arcade-polished, and free of copied fighting-game branding.`,
      status: "approved",
      blocker: "",
    }),
    sourceKind: "procedural",
    provider: providerFor("procedural"),
    sourcePath: details.sourcePath,
    runtimePath: details.runtimePath,
    license: ownedProceduralLicense(
      "Implemented as owned procedural Phaser/Web canvas rendering for this project; no external image asset, copied branding, watermark, or third-party art is used.",
    ),
    createdOrDownloadedOn: generatedOn,
    transforms: details.transforms,
    approvalNotes: details.approvalNotes,
    blocker: null,
  };
}

function audioCue(id: MeowtalAudioCueId, role: string, sourceKind: AssetSourceKind): MeowtalAudioCuePlan {
  const implementedCue = implementedAudioCueDetails[id];
  const audioSpec = AUDIO_CUE_ASSET_SPECS.find((spec) => spec.id === id);
  if (!audioSpec) {
    throw new Error(`${id}: missing authored/sample audio asset spec`);
  }

  if (implementedCue) {
    return {
      id,
      role,
      primaryAsset: audioSpec.primary,
      proceduralFallback: audioSpec.proceduralFallback,
      provenance: {
        ...baseProvenance({
          assetId: `audio:${id}`,
          sourceKind: "procedural",
          promptSlug: `meowtal-audio-${id}`,
          prompt: `Implement or synthesize ${id} for Meowtal Kombat as an owned procedural runtime audio cue. ${role}`,
          status: "approved",
          blocker: "",
        }),
        medium: "audio",
        sourcePath: implementedCue.sourcePath,
        runtimePath: implementedCue.runtimePath,
        license: ownedProceduralLicense(
          "Implemented as owned procedural WebAudio synthesis for this project; no external audio file, provider voice, sample pack, or third-party music is used.",
        ),
        createdOrDownloadedOn: generatedOn,
        transforms: implementedCue.transforms,
        approvalNotes: `${implementedCue.approvalNotes} Approved dev-only procedural fallback pending authored/sample primary audio with source records.`,
        blocker: null,
      },
    };
  }

  return {
    id,
    role,
    primaryAsset: audioSpec.primary,
    proceduralFallback: audioSpec.proceduralFallback,
    provenance: {
      ...baseProvenance({
        assetId: `audio:${id}`,
        sourceKind,
        promptSlug: `meowtal-audio-${id}`,
        prompt: `Create or synthesize ${id} for Meowtal Kombat. ${role}`,
        blocker: plannedAudioCueBlockers[id] ?? binaryBlocker,
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
