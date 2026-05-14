# Meowtal Kombat Asset Provenance

This file is the production provenance ledger for Meowtal Kombat assets. T020 only creates the source-level scaffold; no binary image or audio assets were generated or approved by this task.

## Rules

- Do not commit API keys or provider secrets.
- Do not use untracked external images, audio, fonts, logos, or copied fighting-game branding.
- Every runtime asset needs an asset id, source or provider, prompt or source URL, license or terms summary, creation or download date, transform notes, approval notes, and runtime path.
- Character animation rows stay blocked until both canonical character sheets are generated, reviewed, and approved.
- The arena must be built as layered parallax art, not a single flat backdrop.
- External library assets such as Pixabay require source URL, license review, attribution where required, and download date before approval.

## Source Of Truth

Typed production asset plans live in:

`src/assets/meowtalProductionManifest.ts`

Runtime exports live through:

`src/assets/index.ts`

The barrel exports Meowtal manifest types only. Tooling and tests import the value manifest directly from `src/assets/meowtalProductionManifest.ts` so prompt-heavy planning data does not become part of the gameplay runtime by accident.

## Visual References

The current art-direction references are aspirational only and are not runtime assets:

- `docs/visual-reference/meowtal-kombat/vision-01.png`
- `docs/visual-reference/meowtal-kombat/vision-02.png`
- `docs/visual-reference/meowtal-kombat/vision-03.png`
- `docs/visual-reference/meowtal-kombat/vision-04.png`

## Required Asset Families

### Canonical Character Sheets

Status: planned.

- `gray-rabbit:canonical-character-sheet`
- `ginger-tabby-cat:canonical-character-sheet`

These must be generated and approved before animation rows. Required sheet structure includes front, side, back, 3/4 heroic pose, action pose, relaxed idle, head close-up, expression sheet, detail callouts, size reference, and color swatches.

### Character Animation Rows

Status: blocked by canonical character sheet approval.

Each fighter needs rows for idle, walk-forward, walk-back, crouch, jump, light-punch, heavy-punch, light-kick, special, hitstun, blockstun, knockdown, win, and lose. Rows must preserve species identity, markings, proportions, lighting, camera angle, scale, outline/detail level, and rendering style.

### Parallax Courtyard

Status: planned.

- `meowtal-courtyard:sky-lighting`
- `meowtal-courtyard:distant-hills-city`
- `meowtal-courtyard:background-walls-pillars`
- `meowtal-courtyard:midground-trees-bushes`
- `meowtal-courtyard:playfield-stone-courtyard`
- `meowtal-courtyard:foreground-dust-leaves`

### UI, HUD, And Effects Surfaces

Status: planned.

- `ui:logo-title-mark`
- `ui:title-key-art`
- `ui:hud-frame`
- `ui:rabbit-portrait`
- `ui:cat-portrait`
- `ui:health-bar-rabbit`
- `ui:health-bar-cat`
- `ui:super-meter`
- `ui:timer-frame`
- `ui:fight-ko-victory-overlays`
- `ui:pause-options-panel`
- `ui:touch-controls`
- `ui:loading-fallback`
- `ui:particle-atlas`
- `ui:damage-number-style`

### Audio Cues

Status: planned.

- `audio:music-loop`
- `audio:ui-confirm`
- `audio:fight-announcer`
- `audio:hit-light`
- `audio:hit-heavy`
- `audio:block-impact`
- `audio:dash-whoosh`
- `audio:rabbit-tornado`
- `audio:cat-aura-blast`
- `audio:ko-burst`
- `audio:victory-sting`

Procedural WebAudio cues can be approved as owned procedural assets after implementation review. Provider-generated or library audio needs provider, prompt or source URL, license review, and transform notes before runtime use.
