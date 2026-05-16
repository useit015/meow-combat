# T079 - Noodle Defense Reaction Row Production

Result: done.

Full AAA outcome: incomplete.

## Scope

Generated exactly two accepted source-only defense/reaction rows for Noodle Nibbles / `ferret-noodle`: `hitstun` and `blockstun`. This task used built-in Codex imagegen only and did not use external image APIs, `.env`, CLI fallback, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Source row | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `hitstun` | `assets/source/imagegen/fighters/ferret-noodle/candidates/hitstun-codex-01.png` | `assets/source/imagegen/fighters/ferret-noodle/hitstun.png` | `output/imagegen/ferret-noodle-hitstun-normalized.png` | `1280x256`, alpha |
| `blockstun` | `assets/source/imagegen/fighters/ferret-noodle/candidates/blockstun-codex-01.png` | `assets/source/imagegen/fighters/ferret-noodle/blockstun.png` | `output/imagegen/ferret-noodle-blockstun-normalized.png` | `1280x256`, alpha |

No candidates were rejected. Each accepted first candidate stayed inside the three-candidate-per-row limit.

## No-Size-Drift QA

- `hitstun`: pass. Normalized frame bounds stay within `139-192px` wide and `205-236px` high, with `17,457-20,772` opaque pixels and `0` green-threshold edge pixels per frame.
- `blockstun`: pass. Normalized frame bounds stay within `145-160px` wide and `202-237px` high, with `18,203-19,669` opaque pixels and `0` green-threshold edge pixels per frame.
- Identity pass: both rows preserve Noodle's tapered muzzle, rounded ears, bright eyes, teal scarf, belt and sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail.
- Reaction readability pass: `hitstun` has a compact recoil peak and recovery; `blockstun` keeps paws raised in a guarded recoil without shield graphics, hit sparks, text, or attack extension.
- Source-only pass: `public/assets/generated/fighters/ferret-noodle` remains absent and Noodle is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly nine generated source-only Noodle rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `light-kick`, `hitstun`, and `blockstun`. `heavy-punch`, `special`, `knockdown`, `win`, and `lose` remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Noodle.

## Verification

- Pass: built-in Codex imagegen for source-only Noodle `hitstun` candidate 01 and `blockstun` candidate 01.
- Pass: bundled `remove_chroma_key.py` cleanup on both raw accepted rows.
- Pass: `node scripts/normalize-fighter-rows.mjs --animation hitstun --fighters ferret-noodle`
- Pass: `node scripts/normalize-fighter-rows.mjs --animation blockstun --fighters ferret-noodle`
- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts` (6 files, 42 tests)
- Pass: `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/hitstun.png assets/source/imagegen/fighters/ferret-noodle/blockstun.png output/imagegen/ferret-noodle-hitstun-normalized.png output/imagegen/ferret-noodle-blockstun-normalized.png`
- Pass: `node scripts/asset-qa.mjs --json` (`158` checked, `102` runtime-ready, `56` needing normalization; Noodle idle/walk-forward/walk-back/crouch/jump/light-punch/light-kick/hitstun/blockstun source and normalized rows are runtime-ready dimensions)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `npm run verify` (31 test files, 226 tests, build passed)
- Pass: forbidden runtime/public/dependency/audio/sprite/frame-data diff guard returned no changed files.

## Next Gate

T080 should be a read-only Judge review of the accepted Noodle idle, locomotion, mobility, starter attack, and defense/reaction rows. It should decide whether the next safe package is `heavy-punch`, `special`, `knockdown`, `win`/`lose`, repair, or another bounded source-only step without approving runtime promotion.
