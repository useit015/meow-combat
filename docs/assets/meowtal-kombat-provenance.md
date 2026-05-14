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

Status: all Meowtal fighter animation rows are approved for runtime publication: idle, walk-forward, walk-back, crouch, jump, light-punch, heavy-punch, light-kick, special, hitstun, blockstun, knockdown, win, and lose.

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
  - Provider: Codex built-in imagegen style-lock assets plus deterministic transparent row construction
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T067 visual QA and promoted by T068
  - QA notes: eight separated upright two-legged gray rabbit committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:heavy-punch`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/heavy-punch.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/heavy-punch.png`
  - Provider: Codex built-in imagegen style-lock assets plus deterministic transparent row construction
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T067 visual QA and promoted by T068
  - QA notes: eight separated upright two-legged ginger tabby committed heavy paw-strike frames with crouch-load, planted weight shift, committed extension, follow-through, and recovery; no visible text/watermark/frame numbers, deterministic transparent source construction from approved rows, normalized to 2048x256 RGBA.
- `gray-rabbit:light-kick`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/light-kick.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/light-kick.png`
  - Provider: Codex built-in imagegen chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T075 visual QA and promoted by T076
  - QA notes: eight separated upright two-legged gray rabbit low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:light-kick`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/light-kick.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/light-kick.png`
  - Provider: Codex built-in imagegen chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T075 visual QA and promoted by T076
  - QA notes: eight separated upright two-legged ginger tabby low snap-kick frames with crouch-load, planted support, organic hip/knee front-foot extension, recoil, and guard recovery; no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:special`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/special.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/special.png`
  - Provider: Codex built-in imagegen magenta chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T079 visual QA and promoted by T080
  - QA notes: ten separated upright two-legged gray rabbit rapid spinning tornado frames with crouch-load, readable spin build-up, character-attached green energy ribbons, deceleration, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to 2560x256 RGBA.
- `ginger-tabby-cat:special`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/special.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/special.png`
  - Provider: Codex built-in imagegen magenta chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T079 visual QA and promoted by T080
  - QA notes: ten separated upright two-legged ginger tabby acrobatic flip-kick frames with planted chamber, readable mid-flip, green/yellow foot-attached aura crescents, controlled landing, recovery, and guard settle; no visible text/watermark/frame numbers, magenta chroma-key removed to transparent alpha, normalized to 2560x256 RGBA.
- `gray-rabbit:knockdown`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/knockdown.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/knockdown.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal and selected-frame source composition
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T083 visual QA and promoted by T084
  - QA notes: eight separated gray rabbit fighting-game knockdown frames with upright two-legged hurt/fall anticipation, loss of balance, ground impact, and dazed grounded hit-reaction hold; no crawl/rest/sleeping or stance-convention reset, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:knockdown`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/knockdown.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/knockdown.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal and selected-frame source composition
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T083 visual QA and promoted by T084
  - QA notes: eight separated ginger tabby fighting-game knockdown frames with upright two-legged hurt/fall anticipation, loss of balance, ground impact, and dazed grounded hit-reaction hold; no crawl/rest/sleeping or stance-convention reset, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:win`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/win.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/win.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T087 visual QA and promoted by T088
  - QA notes: eight separated upright two-legged gray rabbit arcade victory frames with guard recovery, hop, fist pump, playful flourish, confident smile, and held victory pose; no four-legged stance/crawl/rest/sleeping, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `ginger-tabby-cat:win`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/win.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/win.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T087 visual QA and promoted by T088
  - QA notes: eight separated upright two-legged ginger tabby arcade victory frames with guard recovery, proud tail flick, bounce, paw flourish, grin, and held smug victory pose; no four-legged stance/crawl/rest/sleeping, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 2048x256 RGBA.
- `gray-rabbit:lose`
  - Source path: `assets/source/imagegen/fighters/gray-rabbit/lose.png`
  - Runtime path: `/assets/generated/fighters/gray-rabbit/lose.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T087 visual QA and promoted by T088
  - QA notes: six separated gray rabbit arcade defeated/KO frames with upright two-legged stunned wobble, buckling, collapse, impact, and dazed grounded KO hold; no crawl/rest/sleeping or peaceful nap expression, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.
- `ginger-tabby-cat:lose`
  - Source path: `assets/source/imagegen/fighters/ginger-tabby-cat/lose.png`
  - Runtime path: `/assets/generated/fighters/ginger-tabby-cat/lose.png`
  - Provider: Codex built-in imagegen green chroma-key reference row plus local chroma removal
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T087 visual QA and promoted by T088
  - QA notes: six separated ginger tabby arcade defeated/KO frames with upright two-legged stunned wobble, buckling, collapse, impact, and dazed grounded KO hold; no crawl/rest/sleeping or peaceful nap expression, no visible text/watermark/frame numbers, chroma-key removed to transparent alpha, normalized to 1536x256 RGBA.

Each fighter needs rows for idle, walk-forward, walk-back, crouch, jump, light-punch, heavy-punch, light-kick, special, hitstun, blockstun, knockdown, win, and lose. Rows must preserve the shared upright two-legged rig, species identity, markings, proportions, lighting, camera angle, scale, outline/detail level, and rendering style. Do not mix two-legged and four-legged normal stance conventions; ordinary stance and movement stay upright two-legged for both fighters, and grounded/prone poses are allowed only when they clearly read as hit reactions.

### Parallax Courtyard

Status: approved runtime parallax layers.

Composite QA candidate: `output/imagegen/meowtal-courtyard-composite-preview.png`

- `meowtal-courtyard:sky-lighting`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/sky-lighting.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/sky-lighting.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-sky-lighting.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: generated as opaque 1024x576 sky and lighting base, copied into the source tree, mirrored as output QA candidate, promoted to runtime.
  - QA notes: bright blue sky, warm lens flare, no fighters, HUD, text, logos, watermarks, or brand marks.
- `meowtal-courtyard:distant-hills-city`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/distant-hills-city.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/distant-hills-city.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-distant-hills-city.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: generated as magenta chroma-key layer, copied into the source tree, resized to 1024x576, chroma-key normalized into an alpha QA candidate, promoted to runtime.
  - QA notes: colorful distant hills and cityscape behind the wall, no fighters, HUD, text, logos, watermarks, or brand marks.
- `meowtal-courtyard:background-walls-pillars`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/background-walls-pillars.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/background-walls-pillars.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-background-walls-pillars.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: generated as magenta chroma-key layer, copied into the source tree, resized to 1024x576, chroma-key normalized into an alpha QA candidate, promoted to runtime.
  - QA notes: low stone walls and pillars with readable depth, no fighters, HUD, text, logos, watermarks, or brand marks.
- `meowtal-courtyard:midground-trees-bushes`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/midground-trees-bushes.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/midground-trees-bushes.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-midground-trees-bushes.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: regenerated after rejecting a UI-contaminated candidate, copied into the source tree, resized to 1024x576, chroma-key normalized into an alpha QA candidate, promoted to runtime.
  - QA notes: trees and bushes frame the combat lane without covering the center, no fighters, HUD, text, logos, watermarks, or brand marks.
- `meowtal-courtyard:playfield-stone-courtyard`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/playfield-stone-courtyard.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/playfield-stone-courtyard.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-playfield-stone-courtyard.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: generated as magenta chroma-key layer, copied into the source tree, resized to 1024x576, shifted downward 40 pixels to fill the bottom of the fighting lane, chroma-key normalized into an alpha QA candidate, promoted to runtime.
  - QA notes: bright stone-paved fighting lane with solid bottom coverage and clear gameplay readability, no fighters, HUD, text, logos, watermarks, or brand marks.
- `meowtal-courtyard:foreground-dust-leaves`
  - Source path: `assets/source/imagegen/stages/meowtal-courtyard/foreground-dust-leaves.png`
  - Runtime path: `/assets/generated/stages/meowtal-courtyard/foreground-dust-leaves.png`
  - Output QA candidate: `output/imagegen/meowtal-courtyard-foreground-dust-leaves.png`
  - Provider: Codex built-in imagegen
  - Generated on: 2026-05-14
  - License status: owned generated source asset
  - Runtime status: approved by T092 visual QA and promoted by T093
  - Transform notes: regenerated after rejecting candidates with unusable background artifacts, copied into the source tree, resized to 1024x576, chroma-key normalized into an alpha QA candidate, promoted to runtime.
  - QA notes: edge props, leaves, petals, and dust puffs for foreground parallax, no fighters, HUD, text, logos, watermarks, or brand marks.

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
