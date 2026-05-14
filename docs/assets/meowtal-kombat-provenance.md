# Meowtal Kombat Asset Provenance

This file is the production provenance ledger for Meowtal Kombat assets. T020 created the source-level scaffold; later tasks append generated, reviewed, and approved runtime assets in small batches.

## Rules

- Do not commit API keys or provider secrets.
- Do not use untracked external images, audio, fonts, logos, or copied fighting-game branding.
- Every runtime asset needs an asset id, source or provider, prompt or source URL, license or terms summary, creation or download date, transform notes, approval notes, and runtime path.
- Character animation rows stay blocked until both canonical character sheets are generated, reviewed, and approved; each new animation row batch requires a separate scoped generation task, visual QA, and runtime-promotion task before runtime use.
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

Status: idle, walk-forward, walk-back, crouch, jump, light-punch, heavy-punch, hitstun, and blockstun rows approved for runtime publication; light-kick source rows are generated candidates pending visual QA; all other rows remain blocked pending separate scoped generation.

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
  - Runtime path: `/assets/generated/fighters/gray-rabbit/walk-forward.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T031 visual QA and promoted by T032
  - QA notes: eight separated upright two-legged gray rabbit guarded walk frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:walk-forward`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/walk-forward.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/walk-forward.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T031 visual QA and promoted by T032
  - QA notes: eight separated upright two-legged ginger tabby guarded walk frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:walk-back`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/walk-back.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/walk-back.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T035 visual QA and promoted by T036
  - QA notes: eight separated upright two-legged gray rabbit guarded backward-footwork frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:walk-back`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/walk-back.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/walk-back.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T035 visual QA and promoted by T036
  - QA notes: eight separated upright two-legged ginger tabby guarded backward-footwork frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:crouch`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/crouch.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/crouch.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T039 visual QA and promoted by T040
  - QA notes: four separated upright two-legged gray rabbit crouch/guard frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1024x256 RGBA.
- `ginger-tabby-cat:crouch`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/crouch.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/crouch.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T039 visual QA and promoted by T040
  - QA notes: four separated upright two-legged ginger tabby crouch/guard frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1024x256 RGBA.
- `gray-rabbit:jump`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/jump.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/jump.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T043 visual QA and promoted by T044
  - QA notes: six separated upright two-legged gray rabbit jump/hop frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.
- `ginger-tabby-cat:jump`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/jump.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/jump.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T043 visual QA and promoted by T044
  - QA notes: six separated upright two-legged ginger tabby jump/hop frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.
- `gray-rabbit:light-punch`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/light-punch.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/light-punch.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T047 visual QA and promoted by T048
  - QA notes: six separated upright two-legged gray rabbit quick paw-jab frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.
- `ginger-tabby-cat:light-punch`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/light-punch.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/light-punch.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T047 visual QA and promoted by T048
  - QA notes: six separated upright two-legged ginger tabby quick paw-jab frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.
- `gray-rabbit:hitstun`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/hitstun.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/hitstun.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T051 visual QA and promoted by T052
  - QA notes: five separated upright two-legged gray rabbit hurt/recoil frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA.
- `ginger-tabby-cat:hitstun`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/hitstun.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/hitstun.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T051 visual QA and promoted by T052
  - QA notes: five separated upright two-legged ginger tabby hurt/recoil frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA.
- `gray-rabbit:blockstun`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/blockstun.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/blockstun.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T055 visual QA and promoted by T056
  - QA notes: five separated upright two-legged gray rabbit guarded block-recoil frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA.
- `ginger-tabby-cat:blockstun`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/blockstun.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/blockstun.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T055 visual QA and promoted by T056
  - QA notes: five separated upright two-legged ginger tabby guarded block-recoil frames, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1280x256 RGBA.
- `gray-rabbit:heavy-punch`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/heavy-punch.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/heavy-punch.png`
  - Provider: Codex built-in imagegen chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T067 visual QA and promoted by T068
  - QA notes: eight separated upright two-legged gray rabbit committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:heavy-punch`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/heavy-punch.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/heavy-punch.png`
  - Provider: Codex built-in imagegen chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T067 visual QA and promoted by T068
  - QA notes: eight separated upright two-legged ginger tabby committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA.
- `gray-rabbit:light-kick`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/light-kick.png`
  - Runtime path: none
  - Provider: Codex built-in imagegen style-lock assets plus deterministic transparent row construction
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: not approved for runtime use; pending follow-up visual QA
  - QA notes: regenerated from a Codex imagegen light-kick reference row after T073 rejected deterministic composited candidates as tube-like; eight separated upright two-legged gray rabbit low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA QA candidate.
- `ginger-tabby-cat:light-kick`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/light-kick.png`
  - Runtime path: none
  - Provider: Codex built-in imagegen style-lock assets plus deterministic transparent row construction
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: not approved for runtime use; pending follow-up visual QA
  - QA notes: regenerated from a Codex imagegen light-kick reference row after T073 rejected deterministic composited candidates as tube-like; eight separated upright two-legged ginger tabby low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA QA candidate.

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
