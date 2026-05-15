# Imagegen Runbook

The local game now has generated art integrated for both Meowtal fighters, the bright courtyard stage, and routed runtime UI sheets. This runbook describes the current asset state and the safe path for future regeneration or replacement.

## Current Asset State

- Fighter/stage imagegen jobs: 36
- UI surface jobs: 9
- Fighter canonical references: 2 generated source references.
- Fighter animation rows: 28 approved runtime rows.
- Stage layers: 6 approved runtime layers.
- Runtime UI sheets: 9 approved runtime PNGs with crop specs in `src/game/gameConfig.ts`.
- Runtime fallbacks: 0 fighter rows, 0 stage layers.
- Blocked jobs: 0.

Approved fighter rows for both `gray-rabbit` and `ginger-tabby-cat`:

```text
idle
walk-forward
walk-back
crouch
jump
light-punch
light-kick
heavy-punch
special
hitstun
blockstun
knockdown
win
lose
```

Approved stage layers for `meowtal-courtyard`:

```text
sky-lighting
distant-hills-city
background-walls-pillars
midground-trees-bushes
playfield-stone-courtyard
foreground-dust-leaves
```

Approved generated UI sheets for `public/assets/generated/ui/meowtal/`:

```text
logo-title-mark
hud-frame
rabbit-portrait
cat-portrait
health-bar-rabbit
health-bar-cat
super-meter
timer-frame
fight-ko-victory-overlays
```

## Where Assets Live

Source imagegen outputs:

```text
assets/source/imagegen/fighters/<fighter-id>/<animation-id>.png
assets/source/imagegen/stages/meowtal-courtyard/<layer-id>.png
assets/source/imagegen/ui/meowtal/<ui-surface-id>.png
```

Normalized fighter QA candidates:

```text
output/imagegen/<fighter-id>-<animation-id>-normalized.png
```

Approved runtime assets:

```text
public/assets/generated/fighters/<fighter-id>/<animation-id>.png
public/assets/generated/stages/meowtal-courtyard/<layer-id>.png
public/assets/generated/ui/meowtal/<ui-surface-id>.png
```

## QA Checks

Run:

```bash
npm run imagegen:qa
npm run verify
```

`npm run imagegen:qa` reports raw source rows separately from normalized runtime candidates. Raw source rows often need normalization; approved runtime sprites are expected to come from the normalized/public assets.

To regenerate normalized candidates for a fighter row:

```bash
node scripts/normalize-fighter-rows.mjs --animation <animation-id>
```

Examples:

```bash
node scripts/normalize-fighter-rows.mjs --animation win
node scripts/normalize-fighter-rows.mjs --animation lose
```

Before marking any replacement fighter or stage source as approved in `src/assets/catalog.ts`, inspect for:

- Consistent fighter identity across frames.
- No text, logos, watermarks, frame numbers, or trademarks.
- Clean alpha after chroma-key removal.
- Correct animation row frame count and 256x256 runtime cells.
- No detached fragments, severe holes, or baked detached effects in fighter rows.
- Stage layers that stack cleanly and keep the fighting lane readable.

Before marking any replacement UI surface as approved in `src/assets/meowtalProductionManifest.ts`, inspect for:

- Original view preserved: same Meowtal arcade direction, visual hierarchy, focal scale, and safe margins.
- Crop-compatible layout for the runtime specs in `src/game/gameConfig.ts`.
- 1024x576 PNG source sheet dimensions.
- No text drift, copied fighting-game branding, watermarks, real brand marks, or UI elements that cover the gameplay center.
- Runtime smoke still reports no missing runtime UI and the expected visible slots for title, fight, K.O., victory, rematch, and mobile states.

## Regeneration Notes

The current integrated art was produced through the Codex app imagegen path. That path does not require a shell `OPENAI_API_KEY`, and Codex app auth should not be extracted or impersonated.

For reproducible CLI regeneration outside the app imagegen path, set `OPENAI_API_KEY` locally and run:

```bash
npm run imagegen:preflight
```

Then regenerate only the target source asset, normalize it, inspect it over a contrasting background, update `src/assets/catalog.ts` only after approval, and run the QA/verify commands above.

For owner-requested fresh Meowtal UI regeneration, use the UI surface jobs from `src/assets/imagegenJobs.ts`. Those jobs intentionally preserve the original view, crop-compatible layout, focal scale, and 1024x576 runtime contract. Promote UI candidates only after updating or confirming the matching crop specs in `src/game/gameConfig.ts` and passing `npm run verify` plus production-preview smoke.
