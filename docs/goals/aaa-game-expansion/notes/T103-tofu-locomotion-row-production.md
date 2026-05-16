# T103 Tofu Locomotion Row Production

Generated exactly two accepted source-only locomotion rows for Tofu Tortoise / `tortoise-tofu`: `walk-forward` and `walk-back`. This task used built-in Codex imagegen only and did not use external image APIs, `.env`, new dependencies, audio tools, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Source row | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `walk-forward` | `assets/source/imagegen/fighters/tortoise-tofu/candidates/walk-forward-codex-01.png` | `assets/source/imagegen/fighters/tortoise-tofu/walk-forward.png` | `output/imagegen/tortoise-tofu-walk-forward-normalized.png` | `2048x256`, alpha |
| `walk-back` | `assets/source/imagegen/fighters/tortoise-tofu/candidates/walk-back-codex-01.png` | `assets/source/imagegen/fighters/tortoise-tofu/walk-back.png` | `output/imagegen/tortoise-tofu-walk-back-normalized.png` | `2048x256`, alpha |

No additional candidates were needed.

## No-Size-Drift QA

- `walk-forward`: pass. Width range `154-167px`, height range `221-223px`, average opaque pixels `25,168`, stable shell/head mass, readable forward shuffle, and visible green spill `0` in every frame.
- `walk-back`: pass. Width range `153-160px`, height range `214-219px`, average opaque pixels `23,911.5`, stable retreat shuffle, and visible green spill `0` in every frame.
- Idle baseline comparison: both rows stay below the T101 idle average height of `230px` while preserving Tofu's shell mass and grounded stance.
- Identity pass: both rows preserve the compact tortoise body, olive shell and limbs, cream belly plates, small warm face, spiral shell markings, brown belt pouch, squat legs, and raised guard.
- Source-only pass: `public/assets/generated/fighters/tortoise-tofu` remains absent and Tofu is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly three generated source-only Tofu rows: `idle`, `walk-forward`, and `walk-back`. All other Tofu rows remain blocked until later row-specific Workers. Runtime manifests still expose only the approved playable roster and do not expose Tofu.

## TDD Receipt

- Red: `npm test -- test/asset-pipeline.test.ts` failed because Tofu `walk-forward` and `walk-back` were still blocked in the planned manifest.
- Green: after wiring only the two Tofu locomotion rows in `src/assets/catalog.ts`, `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts` passed.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation walk-forward --fighters tortoise-tofu` passed.
- `node scripts/normalize-fighter-rows.mjs --animation walk-back --fighters tortoise-tofu` passed.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/tortoise-tofu/walk-forward.png assets/source/imagegen/fighters/tortoise-tofu/walk-back.png output/imagegen/tortoise-tofu-walk-forward-normalized.png output/imagegen/tortoise-tofu-walk-back-normalized.png` passed.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts` passed: 3 files / 35 tests.
- `node scripts/asset-qa.mjs --json` passed: checked `174`, runtime-ready `118`, needs-normalization `56`.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.
- `npm run verify` passed: typecheck, 33 files / 241 tests, and production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4174/ --out-dir output/web-game/tofu-locomotion-source-rows` passed: zero smoke failures, 12 scenarios, runtime roster without Tofu.

## Next Gate

T104 should be a read-only Judge review of the accepted Tofu locomotion rows. It should decide whether grounded movement is stable enough before approving crouch/jump, attack, reaction, outcome, or promotion work.

The full AAA outcome remains active and incomplete.
