import {
  DEFAULT_FIGHTER_CELL_SIZE,
  type FighterAnimationSpec,
  type FighterAssetManifest,
  type StageAssetManifest,
} from "./types";

const sharedAnimationConstraints = [
  "Use the approved canonical fighter reference as grounding input.",
  "Transparent background preferred; otherwise clean flat chroma-key background.",
  "No logos, trademarks, text, watermarks, visible grids, frame numbers, detached dust, or speed lines.",
  "Preserve fighter identity, proportions, palette, face, outfit, and readable silhouette across every frame.",
] as const;

const animationBriefs = [
  ["idle", 8, "Calm fighting stance with subtle breathing and grounded weight shift."],
  ["walk-forward", 8, "Forward step cycle with guarded upper body and stable head height."],
  ["walk-back", 8, "Backward step cycle with defensive posture and readable footwork."],
  ["crouch", 4, "Low guarded crouch pose, compact silhouette, no floor shadow."],
  ["jump", 6, "Vertical jump arc poses with tucked knees and controlled landing posture."],
  ["light-punch", 6, "Fast jab with clear startup, active extension, and recovery frames."],
  ["heavy-punch", 8, "Heavier committed punch with stronger shoulder rotation and recovery."],
  ["light-kick", 8, "Quick low-to-mid kick with balanced stance and clean contact pose."],
  ["special", 10, "Signature Moroccan-themed special strike pose without detached magical effects."],
  ["hitstun", 5, "Readable recoil poses from being hit, no loose impact symbols."],
  ["blockstun", 5, "Guard impact recoil with arms raised, no detached sparks or text."],
  ["knockdown", 8, "Fall and grounded recovery poses kept inside frame bounds."],
  ["win", 8, "Respectful victory stance with controlled celebratory motion."],
  ["lose", 6, "Defeated idle pose, readable and non-comedic."],
] as const satisfies readonly (readonly [FighterAnimationSpec["id"], number, string])[];

const approvedAnimationRows: Record<string, Partial<Record<FighterAnimationSpec["id"], string>>> = {
  "atlas-lion": {
    idle: "/assets/generated/fighters/atlas-lion/idle.png",
    "walk-forward": "/assets/generated/fighters/atlas-lion/walk-forward.png",
    "walk-back": "/assets/generated/fighters/atlas-lion/walk-back.png",
    crouch: "/assets/generated/fighters/atlas-lion/crouch.png",
    jump: "/assets/generated/fighters/atlas-lion/jump.png",
    "light-punch": "/assets/generated/fighters/atlas-lion/light-punch.png",
    "light-kick": "/assets/generated/fighters/atlas-lion/light-kick.png",
    "heavy-punch": "/assets/generated/fighters/atlas-lion/heavy-punch.png",
    special: "/assets/generated/fighters/atlas-lion/special.png",
    hitstun: "/assets/generated/fighters/atlas-lion/hitstun.png",
    blockstun: "/assets/generated/fighters/atlas-lion/blockstun.png",
    knockdown: "/assets/generated/fighters/atlas-lion/knockdown.png",
    win: "/assets/generated/fighters/atlas-lion/win.png",
    lose: "/assets/generated/fighters/atlas-lion/lose.png",
  },
  "sahara-viper": {
    idle: "/assets/generated/fighters/sahara-viper/idle.png",
    "walk-forward": "/assets/generated/fighters/sahara-viper/walk-forward.png",
    "walk-back": "/assets/generated/fighters/sahara-viper/walk-back.png",
    crouch: "/assets/generated/fighters/sahara-viper/crouch.png",
    jump: "/assets/generated/fighters/sahara-viper/jump.png",
    "light-punch": "/assets/generated/fighters/sahara-viper/light-punch.png",
    "light-kick": "/assets/generated/fighters/sahara-viper/light-kick.png",
    "heavy-punch": "/assets/generated/fighters/sahara-viper/heavy-punch.png",
    special: "/assets/generated/fighters/sahara-viper/special.png",
    hitstun: "/assets/generated/fighters/sahara-viper/hitstun.png",
    blockstun: "/assets/generated/fighters/sahara-viper/blockstun.png",
    knockdown: "/assets/generated/fighters/sahara-viper/knockdown.png",
    win: "/assets/generated/fighters/sahara-viper/win.png",
    lose: "/assets/generated/fighters/sahara-viper/lose.png",
  },
};

const generatedAnimationRows: Record<string, Partial<Record<FighterAnimationSpec["id"], string>>> = {
  "atlas-lion": {},
  "sahara-viper": {},
};

export const fighterAssetManifests: readonly FighterAssetManifest[] = [
  {
    id: "atlas-lion",
    displayName: "Atlas Lion",
    engineCharacterId: "atlas-lion",
    archetype: "balanced close-range striker",
    moroccanDesignNotes: [
      "Inspired by Atlas mountain strength and Moroccan geometric textile trim.",
      "Use original costume motifs only; do not copy existing fighting-game characters.",
      "Palette should stay readable over warm zellige and cedar-toned stages.",
    ],
    asymmetryNotes: [
      "Potential sash or shoulder trim may be asymmetric; do not mirror rows until reviewed.",
    ],
    canonicalReference: generatedSource(
      "atlas-lion-canonical-reference",
      "assets/source/imagegen/fighters/atlas-lion/canonical-reference.png",
    ),
    animations: animationSpecsFor("atlas-lion"),
  },
  {
    id: "sahara-viper",
    displayName: "Sahara Viper",
    engineCharacterId: "sahara-viper",
    archetype: "fast evasive mid-range fighter",
    moroccanDesignNotes: [
      "Inspired by Sahara movement, wrapped travel fabric, and restrained desert palette.",
      "Keep silhouette distinct from Atlas Lion through lighter stance and sharper angles.",
      "Use original visual language; no trademarks or real-world logos.",
    ],
    asymmetryNotes: [
      "Head wrap tail and belt accessories may be side-specific; do not mirror rows until reviewed.",
    ],
    canonicalReference: generatedSource(
      "sahara-viper-canonical-reference",
      "assets/source/imagegen/fighters/sahara-viper/canonical-reference.png",
    ),
    animations: animationSpecsFor("sahara-viper"),
  },
];

export const stageAssetManifests: readonly StageAssetManifest[] = [
  {
    id: "marrakesh-rooftop",
    displayName: "Marrakesh Rooftop",
    moroccanDesignNotes: [
      "Warm rooftop training stage with zellige geometry, cedar beams, and distant medina architecture.",
      "Readable fighting lane must stay uncluttered behind character silhouettes.",
      "No real brand marks, signage, or copyrighted characters.",
    ],
    layers: [
      {
        id: "sky",
        parallax: 0.1,
        promptIntent: "Wide dusk sky gradient with subtle haze for a Moroccan rooftop fighting stage.",
        source: approvedSource(
          "marrakesh-rooftop-sky",
          "/assets/generated/stages/marrakesh-rooftop/sky.png",
        ),
      },
      {
        id: "far-architecture",
        parallax: 0.25,
        promptIntent: "Distant medina silhouettes and minaret-inspired forms, original and non-specific.",
        source: approvedSource(
          "marrakesh-rooftop-far-architecture",
          "/assets/generated/stages/marrakesh-rooftop/far-architecture.png",
        ),
      },
      {
        id: "playfield",
        parallax: 1,
        promptIntent: "Flat readable rooftop fighting floor with zellige-inspired border pattern.",
        source: approvedSource(
          "marrakesh-rooftop-playfield",
          "/assets/generated/stages/marrakesh-rooftop/playfield.png",
        ),
      },
      {
        id: "foreground-props",
        parallax: 1.15,
        promptIntent: "Sparse cedar rail and textile props at edges only, never obscuring fighters.",
        source: approvedSource(
          "marrakesh-rooftop-foreground-props",
          "/assets/generated/stages/marrakesh-rooftop/foreground-props.png",
        ),
      },
    ],
  },
];

function animationSpecsFor(fighterId: string): readonly FighterAnimationSpec[] {
  return animationBriefs.map(([id, frameCount, promptIntent]) => animation(fighterId, id, frameCount, promptIntent));
}

function animation(
  fighterId: string,
  id: FighterAnimationSpec["id"],
  frameCount: number,
  promptIntent: string,
): FighterAnimationSpec {
  const approvedOutputPath = approvedAnimationRows[fighterId]?.[id];
  const generatedOutputPath = generatedAnimationRows[fighterId]?.[id];
  return {
    id,
    frameCount,
    cellSize: DEFAULT_FIGHTER_CELL_SIZE,
    facing: "right",
    canMirrorFrom: null,
    source: approvedOutputPath
      ? approvedSource(`${fighterId}-${id}-animation-row`, approvedOutputPath)
      : generatedOutputPath
        ? generatedSource(`${fighterId}-${id}-animation-row`, generatedOutputPath)
      : blockedSource(`${fighterId}-${id}-animation-row`),
    promptIntent,
    constraints: sharedAnimationConstraints,
  };
}

function blockedSource(promptSlug: string) {
  return {
    status: "blocked" as const,
    promptSlug,
    outputPath: null,
    blocker: "OPENAI_API_KEY is missing; generate with imagegen after credentials are set.",
  };
}

function generatedSource(promptSlug: string, outputPath: string) {
  return {
    status: "generated" as const,
    promptSlug,
    outputPath,
  };
}

function approvedSource(promptSlug: string, outputPath: string) {
  return {
    status: "approved" as const,
    promptSlug,
    outputPath,
  };
}
