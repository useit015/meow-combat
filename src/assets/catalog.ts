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
  "Keep normal gameplay rows upright and two-legged; grounded or prone poses are only for hit reactions and K.O. end states.",
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
  ["special", 10, "Signature character special strike pose without detached magical effects."],
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
  "gray-rabbit": {
    idle: "/assets/generated/fighters/gray-rabbit/idle.png",
    "walk-forward": "/assets/generated/fighters/gray-rabbit/walk-forward.png",
    "walk-back": "/assets/generated/fighters/gray-rabbit/walk-back.png",
    crouch: "/assets/generated/fighters/gray-rabbit/crouch.png",
    jump: "/assets/generated/fighters/gray-rabbit/jump.png",
    "light-punch": "/assets/generated/fighters/gray-rabbit/light-punch.png",
    "light-kick": "/assets/generated/fighters/gray-rabbit/light-kick.png",
    "heavy-punch": "/assets/generated/fighters/gray-rabbit/heavy-punch.png",
    special: "/assets/generated/fighters/gray-rabbit/special.png",
    hitstun: "/assets/generated/fighters/gray-rabbit/hitstun.png",
    blockstun: "/assets/generated/fighters/gray-rabbit/blockstun.png",
    knockdown: "/assets/generated/fighters/gray-rabbit/knockdown.png",
    win: "/assets/generated/fighters/gray-rabbit/win.png",
    lose: "/assets/generated/fighters/gray-rabbit/lose.png",
  },
  "ginger-tabby-cat": {
    idle: "/assets/generated/fighters/ginger-tabby-cat/idle.png",
    "walk-forward": "/assets/generated/fighters/ginger-tabby-cat/walk-forward.png",
    "walk-back": "/assets/generated/fighters/ginger-tabby-cat/walk-back.png",
    crouch: "/assets/generated/fighters/ginger-tabby-cat/crouch.png",
    jump: "/assets/generated/fighters/ginger-tabby-cat/jump.png",
    "light-punch": "/assets/generated/fighters/ginger-tabby-cat/light-punch.png",
    "light-kick": "/assets/generated/fighters/ginger-tabby-cat/light-kick.png",
    "heavy-punch": "/assets/generated/fighters/ginger-tabby-cat/heavy-punch.png",
    special: "/assets/generated/fighters/ginger-tabby-cat/special.png",
    hitstun: "/assets/generated/fighters/ginger-tabby-cat/hitstun.png",
    blockstun: "/assets/generated/fighters/ginger-tabby-cat/blockstun.png",
    knockdown: "/assets/generated/fighters/ginger-tabby-cat/knockdown.png",
    win: "/assets/generated/fighters/ginger-tabby-cat/win.png",
    lose: "/assets/generated/fighters/ginger-tabby-cat/lose.png",
  },
};

const generatedAnimationRows: Record<string, Partial<Record<FighterAnimationSpec["id"], string>>> = {
  "atlas-lion": {},
  "sahara-viper": {},
  "gray-rabbit": {},
  "ginger-tabby-cat": {},
};

export const fighterAssetManifests: readonly FighterAssetManifest[] = [
  {
    id: "atlas-lion",
    displayName: "Atlas Lion",
    engineCharacterId: "atlas-lion",
    archetype: "balanced close-range striker",
    designNotes: [
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
    designNotes: [
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

export const meowtalFighterAssetManifests: readonly FighterAssetManifest[] = [
  {
    id: "gray-rabbit",
    displayName: "Gray Rabbit",
    engineCharacterId: "gray-rabbit",
    archetype: "upright hopping kickboxer with rapid spin pressure",
    designNotes: [
      "Meowtal production fighter: fluffy gray rabbit, expressive ears, clean upright two-legged martial stance.",
      "Normal gameplay animation must not swap into four-legged locomotion; only knockdown and lose may go grounded.",
      "Readable pale-gray silhouette, energetic green special trails, and consistent scale against the ginger tabby.",
    ],
    asymmetryNotes: [
      "Ear tilt, cheek fur, and small wraps may be side-specific; do not mirror rows until reviewed.",
    ],
    canonicalReference: generatedSource(
      "gray-rabbit-canonical-character-sheet",
      "assets/source/imagegen/fighters/gray-rabbit/canonical-character-sheet.png",
    ),
    animations: animationSpecsFor("gray-rabbit"),
  },
  {
    id: "ginger-tabby-cat",
    displayName: "Ginger Tabby Cat",
    engineCharacterId: "ginger-tabby-cat",
    archetype: "upright acrobatic claw-and-tail striker",
    designNotes: [
      "Meowtal production fighter: fluffy orange tabby cat with clear stripes, bright face, and upright two-legged guard.",
      "Normal gameplay animation must not swap into four-legged locomotion; loaf-like personality should read as an upright idle attitude, not a crawl.",
      "Warm orange silhouette, green-yellow special energy, and consistent proportions across all moves.",
    ],
    asymmetryNotes: [
      "Stripe pattern, tail curve, and cheek markings may be side-specific; do not mirror rows until reviewed.",
    ],
    canonicalReference: generatedSource(
      "ginger-tabby-cat-canonical-character-sheet",
      "assets/source/imagegen/fighters/ginger-tabby-cat/canonical-character-sheet.png",
    ),
    animations: animationSpecsFor("ginger-tabby-cat"),
  },
];

export const stageAssetManifests: readonly StageAssetManifest[] = [
  {
    id: "marrakesh-rooftop",
    displayName: "Marrakesh Rooftop",
    designNotes: [
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

export const meowtalStageAssetManifests: readonly StageAssetManifest[] = [
  {
    id: "meowtal-courtyard",
    displayName: "Meowtal Courtyard",
    designNotes: [
      "Bright outdoor stone-paved courtyard built as layered parallax art for Meowtal Kombat.",
      "Readable central fighting lane with trees, bushes, walls, pillars, city/hills, dust, leaves, and warm arcade lighting.",
      "No fighters, HUD, text, real brand marks, signage, watermarks, or copyrighted characters are baked into the stage layers.",
    ],
    layers: [
      {
        id: "sky-lighting",
        parallax: 0.08,
        promptIntent: "Vibrant blue sky, warm sun rays, lens flare, and soft atmosphere.",
        source: approvedSource(
          "meowtal-courtyard-sky-lighting",
          "/assets/generated/stages/meowtal-courtyard/sky-lighting.png",
        ),
      },
      {
        id: "distant-hills-city",
        parallax: 0.18,
        promptIntent: "Distant colorful hills and city shapes behind the arena.",
        source: approvedSource(
          "meowtal-courtyard-distant-hills-city",
          "/assets/generated/stages/meowtal-courtyard/distant-hills-city.png",
        ),
      },
      {
        id: "background-walls-pillars",
        parallax: 0.34,
        promptIntent: "Low stone walls, courtyard pillars, and readable architectural depth.",
        source: approvedSource(
          "meowtal-courtyard-background-walls-pillars",
          "/assets/generated/stages/meowtal-courtyard/background-walls-pillars.png",
        ),
      },
      {
        id: "midground-trees-bushes",
        parallax: 0.58,
        promptIntent: "Scattered trees and bushes that frame the fight without covering silhouettes.",
        source: approvedSource(
          "meowtal-courtyard-midground-trees-bushes",
          "/assets/generated/stages/meowtal-courtyard/midground-trees-bushes.png",
        ),
      },
      {
        id: "playfield-stone-courtyard",
        parallax: 1,
        promptIntent: "Bright stone-paved fighting lane with stable gameplay readability.",
        source: approvedSource(
          "meowtal-courtyard-playfield-stone-courtyard",
          "/assets/generated/stages/meowtal-courtyard/playfield-stone-courtyard.png",
        ),
      },
      {
        id: "foreground-dust-leaves",
        parallax: 1.16,
        promptIntent: "Subtle foreground leaves, dust puffs, and edge props for parallax motion.",
        source: approvedSource(
          "meowtal-courtyard-foreground-dust-leaves",
          "/assets/generated/stages/meowtal-courtyard/foreground-dust-leaves.png",
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
