# Imagegen Runbook

The local game now has generated art integrated for both fighters and the Marrakesh rooftop stage. This runbook describes the current asset state and the safe path for future regeneration or replacement.

## Current Asset State

- Total imagegen jobs: 34
- Fighter canonical references: 2 generated source references.
- Fighter animation rows: 28 approved runtime rows.
- Stage layers: 4 approved runtime layers.
- Runtime fallbacks: 0 fighter rows, 0 stage layers.
- Blocked jobs: 0.

Approved fighter rows for both `atlas-lion` and `sahara-viper`:

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

Approved stage layers for `marrakesh-rooftop`:

```text
sky
far-architecture
playfield
foreground-props
```

## Where Assets Live

Source imagegen outputs:

```text
assets/source/imagegen/fighters/<fighter-id>/<animation-id>.png
assets/source/imagegen/stages/marrakesh-rooftop/<layer-id>.png
```

Normalized fighter QA candidates:

```text
output/imagegen/<fighter-id>-<animation-id>-normalized.png
```

Approved runtime assets:

```text
public/assets/generated/fighters/<fighter-id>/<animation-id>.png
public/assets/generated/stages/marrakesh-rooftop/<layer-id>.png
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

Before marking any replacement source as approved in `src/assets/catalog.ts`, inspect for:

- Consistent fighter identity across frames.
- No text, logos, watermarks, frame numbers, or trademarks.
- Clean alpha after chroma-key removal.
- Correct animation row frame count and 256x256 runtime cells.
- No detached fragments, severe holes, or baked detached effects in fighter rows.
- Stage layers that stack cleanly and keep the fighting lane readable.

## Regeneration Notes

The current integrated art was produced through the Codex app imagegen path. That path does not require a shell `OPENAI_API_KEY`, and Codex app auth should not be extracted or impersonated.

For reproducible CLI regeneration outside the app imagegen path, set `OPENAI_API_KEY` locally and run:

```bash
npm run imagegen:preflight
```

Then regenerate only the target source asset, normalize it, inspect it over a contrasting background, update `src/assets/catalog.ts` only after approval, and run the QA/verify commands above.
