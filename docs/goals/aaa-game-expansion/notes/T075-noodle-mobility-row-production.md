# T075 - Noodle Mobility Row Production

Result: done.

Full AAA outcome: incomplete.

## Scope

Generated exactly two accepted source-only mobility rows for Noodle Nibbles / `ferret-noodle`: `crouch` and `jump`. This task used built-in Codex imagegen only and did not use external image APIs, `.env`, CLI fallback, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Source row | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `crouch` | `assets/source/imagegen/fighters/ferret-noodle/candidates/crouch-codex-02.png` | `assets/source/imagegen/fighters/ferret-noodle/crouch.png` | `output/imagegen/ferret-noodle-crouch-normalized.png` | `1024x256`, alpha |
| `jump` | `assets/source/imagegen/fighters/ferret-noodle/candidates/jump-codex-03.png` | `assets/source/imagegen/fighters/ferret-noodle/jump.png` | `output/imagegen/ferret-noodle-jump-normalized.png` | `1536x256`, alpha |

Rejected candidates:

- `crouch-codex-01.png`: rejected because later frames rose into a near-standing posture instead of staying low.
- `jump-codex-01.png`: rejected because normalized body bounds shrank to `88-141px` wide and `103-191px` high with weak opaque-pixel coverage.
- `jump-codex-02.png`: rejected because the sheet still drew a tall vertical trajectory across the overall canvas instead of in-cell full-size jump poses.

## No-Size-Drift QA

- `crouch`: pass. Normalized frame bounds stay broad and low at `231-233px` wide, `164-181px` high, with `19,919-20,843` opaque pixels and `0` green spill pixels per frame.
- `jump`: pass. Normalized frame bounds stay full-size for a jump row at `133-167px` wide, `139-203px` high, with `11,620-13,549` opaque pixels and `0-3` green-threshold edge pixels per frame.
- Identity pass: both rows preserve Noodle's tapered muzzle, rounded ears, bright eyes, teal scarf, belt and sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail.
- Alpha pass: both accepted rows are exact alpha PNGs; residual green-threshold pixels are tiny edge values with no visible key field.
- Source-only pass: `public/assets/generated/fighters/ferret-noodle` remains absent and Noodle is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly five generated source-only Noodle rows: `idle`, `walk-forward`, `walk-back`, `crouch`, and `jump`. All attack, reaction, KO, win, and lose rows remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Noodle.

## Verification

- Pass: built-in Codex imagegen for source-only Noodle crouch candidate 01, crouch candidate 02, jump candidate 01, jump candidate 02, and jump candidate 03; rejected candidates are preserved in the QA receipt.
- Pass: bundled `remove_chroma_key.py` cleanup on both raw accepted rows and both normalized rows.
- Pass: `node scripts/normalize-fighter-rows.mjs --animation crouch --fighters ferret-noodle`
- Pass: `node scripts/normalize-fighter-rows.mjs --animation jump --fighters ferret-noodle`
- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts` (6 files, 40 tests)
- Pass: `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/crouch.png assets/source/imagegen/fighters/ferret-noodle/jump.png output/imagegen/ferret-noodle-crouch-normalized.png output/imagegen/ferret-noodle-jump-normalized.png`
- Pass: `node scripts/asset-qa.mjs --json` (`150` checked, `94` runtime-ready, `56` needing normalization; Noodle idle/walk-forward/walk-back/crouch/jump source and normalized rows are runtime-ready dimensions)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `npm run verify` (31 test files, 224 tests, build passed)
- Pass: forbidden runtime/public/dependency/audio/sprite/frame-data diff guard returned no changed files.

## Next Gate

T076 should be a read-only Judge review of the accepted Noodle idle, locomotion, and mobility rows. It should decide whether the next safe package is starter attacks, defense/reaction rows, repair, or another bounded source-only step without approving runtime promotion.
