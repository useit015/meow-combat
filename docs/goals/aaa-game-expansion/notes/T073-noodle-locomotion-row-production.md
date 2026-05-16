# T073 - Noodle Locomotion Row Production

Result: done.

Full AAA outcome: incomplete.

## Scope

Generated exactly two accepted source-only locomotion rows for Noodle Nibbles / `ferret-noodle`: `walk-forward` and `walk-back`. This task used built-in Codex imagegen only and did not use external image APIs, `.env`, CLI fallback, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Source row | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `walk-forward` | `assets/source/imagegen/fighters/ferret-noodle/candidates/walk-forward-codex-02.png` | `assets/source/imagegen/fighters/ferret-noodle/walk-forward.png` | `output/imagegen/ferret-noodle-walk-forward-normalized.png` | `2048x256`, alpha |
| `walk-back` | `assets/source/imagegen/fighters/ferret-noodle/candidates/walk-back-codex-01.png` | `assets/source/imagegen/fighters/ferret-noodle/walk-back.png` | `output/imagegen/ferret-noodle-walk-back-normalized.png` | `2048x256`, alpha |

`walk-forward-codex-01.png` was rejected because the frames were packed too tightly; normalization pulled tail fragments into neighboring cells. `walk-forward-codex-02.png` fixed the frame isolation problem.

## No-Size-Drift QA

- `walk-forward`: pass. Height range `217-224px`, width range `182-196px`, average opaque pixels above `15k`, stable head height, clean forward stepping, and no adjacent-frame fragments.
- `walk-back`: pass. Height range `222-228px`, width range `144-170px`, average opaque pixels above `15k`, readable retreat shuffle, and no body-length shrink.
- Identity pass: both rows preserve Noodle's tapered muzzle, rounded ears, bright eyes, teal scarf, belt and sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail.
- Alpha pass: both accepted rows are exact alpha PNGs; residual green-threshold edge pixels are `0-5` per frame with no visible key field.
- Source-only pass: `public/assets/generated/fighters/ferret-noodle` remains absent and Noodle is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly three generated source-only Noodle rows: `idle`, `walk-forward`, and `walk-back`. All other Noodle rows remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Noodle.

## Verification

- Pass: built-in Codex imagegen for source-only Noodle walk-forward candidate 01, walk-forward candidate 02, and walk-back candidate 01.
- Pass: `node scripts/normalize-fighter-rows.mjs --animation walk-forward --fighters ferret-noodle`
- Pass: `node scripts/normalize-fighter-rows.mjs --animation walk-back --fighters ferret-noodle`
- Pass: bundled `remove_chroma_key.py` cleanup on both raw rows and both normalized rows.
- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts` (6 files, 39 tests)
- Pass: `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/walk-forward.png assets/source/imagegen/fighters/ferret-noodle/walk-back.png output/imagegen/ferret-noodle-walk-forward-normalized.png output/imagegen/ferret-noodle-walk-back-normalized.png`
- Pass: `node scripts/asset-qa.mjs --json` (`146` checked, `90` runtime-ready, `56` needing normalization; Noodle idle/walk-forward/walk-back source and normalized rows are runtime-ready dimensions)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `npm run verify` (31 test files, 223 tests, build passed)
- Pass: forbidden runtime/public/dependency/audio/sprite/frame-data diff guard returned no changed files.

## Next Gate

T074 should be a read-only Judge review of the accepted Noodle locomotion rows. It should decide whether grounded movement is stable enough before approving crouch/jump, attack, reaction, or promotion work.
