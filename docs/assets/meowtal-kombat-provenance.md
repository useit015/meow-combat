# Meowtal Kombat Asset Provenance

This file is the production provenance ledger for Meowtal Kombat assets. T020 created the source-level scaffold; later tasks append generated, reviewed, and approved runtime assets in small batches.

## Rules

- Do not commit API keys or provider secrets.
- Do not use untracked external images, audio, fonts, logos, or copied fighting-game branding.
- Every runtime asset needs an asset id, source or provider, prompt or source URL, license or terms summary, creation or download date, transform notes, approval notes, and runtime path.
- Character animation rows stay blocked until both canonical character sheets are generated, reviewed, and approved; non-idle rows require a separate scoped generation task after idle runtime approval.
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

Status: approved animation style-lock references, not runtime sprites.

- `gray-rabbit:canonical-character-sheet`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/canonical-character-sheet.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Usage approval: animation style-lock reference only; not approved as a runtime sprite
  - QA notes: rabbit-only upright two-legged sheet, no visible text/watermark, includes front/side/back/three-quarter pose, action pose, idle pose, head close-up, expressions, detail callouts, size reference, color swatches, green tornado language, and consistent gray rabbit proportions.
- `ginger-tabby-cat:canonical-character-sheet`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/canonical-character-sheet.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Usage approval: animation style-lock reference only; not approved as a runtime sprite
  - QA notes: cat-only upright two-legged sheet, no visible text/watermark, includes front/side/back views, upright combat poses, upright idle, head close-up, expressions, detail callouts, size reference, color swatches, yellow-green energy language, and consistent orange tabby markings.

These are approved before animation rows as style locks only. Required sheet structure includes front, side, back, 3/4 heroic pose, action pose, relaxed idle, head close-up, expression sheet, detail callouts, size reference, and color swatches. Both fighters use an upright two-legged fighting-game rig for animation consistency.

### Character Animation Rows

Status: idle rows approved for runtime publication; walk-forward source candidates generated; all other non-idle rows remain blocked pending walk-forward QA and separate scoped generation.

- `gray-rabbit:idle`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/idle.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/idle.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T027 visual QA and promoted by T028
  - QA notes: eight separated upright two-legged gray rabbit idle frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:idle`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/idle.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/idle.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T027 visual QA and promoted by T028
  - QA notes: eight separated upright two-legged ginger tabby idle frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:walk-forward`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/walk-forward.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: not approved; normalize and QA before copying to `public/assets/generated`
  - QA notes: eight separated upright two-legged gray rabbit guarded walk frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, pending normalized-row review.
- `ginger-tabby-cat:walk-forward`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/walk-forward.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: not approved; normalize and QA before copying to `public/assets/generated`
  - QA notes: eight separated upright two-legged ginger tabby guarded walk frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, pending normalized-row review.

Each fighter needs rows for idle, walk-forward, walk-back, crouch, jump, light-punch, heavy-punch, light-kick, special, hitstun, blockstun, knockdown, win, and lose. Rows must preserve the shared upright two-legged rig, species identity, markings, proportions, lighting, camera angle, scale, outline/detail level, and rendering style.

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
