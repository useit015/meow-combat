# T071 - Noodle Idle Row Production

Result: done.

Full AAA outcome: incomplete.

## Scope

Generated exactly one source-only `idle` row for Noodle Nibbles / `ferret-noodle` using built-in Codex imagegen. This task did not use external image APIs, `.env`, CLI fallback, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Asset

- Candidate: `assets/source/imagegen/fighters/ferret-noodle/candidates/idle-codex-01.png`
- Raw output copy: `output/imagegen/ferret-noodle-idle.png`
- Normalized proof: `output/imagegen/ferret-noodle-idle-normalized.png`
- Accepted source-only row: `assets/source/imagegen/fighters/ferret-noodle/idle.png`
- QA JSON: `output/animation-preflight/noodle-nibbles-idle-row-qa.json`
- QA HTML: `output/animation-preflight/noodle-nibbles-idle-row-qa.html`

The accepted row is an alpha PNG with exact `2048x256` dimensions: 8 frames at `256x256`.

## No-Size-Drift QA

- Identity pass: tapered muzzle, rounded ears, bright eyes, teal scarf, belt, sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail remain consistent.
- Scale pass: per-frame alpha bounds stay within `116-131px` width and `228-230px` height; this row becomes the future Noodle scale baseline.
- Motion pass: the row reads as subtle idle guard/breathing variation, not an attack, walk, jump, or crouch.
- Alpha pass: the green chroma key was removed after normalization; QA records `0` visible green spill pixels in every accepted frame.
- Source-only pass: `public/assets/generated/fighters/ferret-noodle` remains absent and Noodle is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records only `ferret-noodle:idle` as a generated source-only animation row. All other Noodle rows remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Noodle.

## Verification

- Pass: built-in Codex imagegen for source-only Noodle Nibbles idle row
- Pass: `node scripts/normalize-fighter-rows.mjs --animation idle --fighters ferret-noodle`
- Pass: bundled `remove_chroma_key.py` cleanup on the normalized row using `#00ff00`
- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts` (6 files, 38 tests)
- Pass: `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/idle.png output/imagegen/ferret-noodle-idle-normalized.png`
- Pass: `node scripts/asset-qa.mjs --json` (`142` checked, `86` runtime-ready, `56` needing normalization; Noodle idle source and normalized candidate are runtime-ready dimensions)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `npm run verify` (31 test files, 222 tests, build passed)
- Pass: forbidden runtime/public/dependency/audio/sprite/frame-data diff guard returned no changed files.

## Next Gate

T072 should be a read-only Judge review of this accepted idle row. It should decide whether Noodle idle is good enough as the scale reference before approving any locomotion or other row production.
