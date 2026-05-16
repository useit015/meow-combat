# T077 - Noodle Starter Attack Row Production

Result: done.

Full AAA outcome: incomplete.

## Scope

Generated exactly two accepted source-only starter attack rows for Noodle Nibbles / `ferret-noodle`: `light-punch` and `light-kick`. This task used built-in Codex imagegen only and did not use external image APIs, `.env`, CLI fallback, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Source row | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `light-punch` | `assets/source/imagegen/fighters/ferret-noodle/candidates/light-punch-codex-01.png` | `assets/source/imagegen/fighters/ferret-noodle/light-punch.png` | `output/imagegen/ferret-noodle-light-punch-normalized.png` | `1536x256`, alpha |
| `light-kick` | `assets/source/imagegen/fighters/ferret-noodle/candidates/light-kick-codex-03.png` | `assets/source/imagegen/fighters/ferret-noodle/light-kick.png` | `output/imagegen/ferret-noodle-light-kick-normalized.png` | `2048x256`, alpha |

Rejected candidates:

- `light-kick-codex-01.png`: rejected because the contact frames used a long straight-leg extension instead of a compact ankle-nip kick.
- `light-kick-codex-02.png`: rejected because it still stretched the front leg too far beyond the torso length.

## No-Size-Drift QA

- `light-punch`: pass. Normalized frame bounds stay within `123-222px` wide and `206-224px` high, with `14,775-15,875` opaque pixels and `0` green-threshold edge pixels per frame.
- `light-kick`: pass. Normalized frame bounds stay compact at `125-153px` wide and `216-224px` high, with `13,708-14,963` opaque pixels and `0` green-threshold edge pixels per frame.
- Identity pass: both rows preserve Noodle's tapered muzzle, rounded ears, bright eyes, teal scarf, belt and sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail.
- Contact-pose pass: `light-punch` has a clear paw extension while `light-kick` avoids the rejected long-leg silhouette.
- Source-only pass: `public/assets/generated/fighters/ferret-noodle` remains absent and Noodle is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly seven generated source-only Noodle rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, and `light-kick`. `heavy-punch`, `special`, reaction, KO, win, and lose rows remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Noodle.

## Verification

- Pass: built-in Codex imagegen for source-only Noodle light-punch candidate 01 and light-kick candidates 01, 02, and 03; rejected candidates are preserved in the QA receipt.
- Pass: bundled `remove_chroma_key.py` cleanup on both raw accepted rows and both normalized rows.
- Pass: `node scripts/normalize-fighter-rows.mjs --animation light-punch --fighters ferret-noodle`
- Pass: `node scripts/normalize-fighter-rows.mjs --animation light-kick --fighters ferret-noodle`
- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts` (6 files, 41 tests)
- Pass: `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/light-punch.png assets/source/imagegen/fighters/ferret-noodle/light-kick.png output/imagegen/ferret-noodle-light-punch-normalized.png output/imagegen/ferret-noodle-light-kick-normalized.png`
- Pass: `node scripts/asset-qa.mjs --json` (`154` checked, `98` runtime-ready, `56` needing normalization; Noodle idle/walk-forward/walk-back/crouch/jump/light-punch/light-kick source and normalized rows are runtime-ready dimensions)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `npm run verify` (31 test files, 225 tests, build passed)
- Pass: forbidden runtime/public/dependency/audio/sprite/frame-data diff guard returned no changed files.

## Next Gate

T078 should be a read-only Judge review of the accepted Noodle idle, locomotion, mobility, and starter attack rows. It should decide whether the next safe package is defense/reaction rows, heavy-punch, special, acting rows, repair, or another bounded source-only step without approving runtime promotion.
