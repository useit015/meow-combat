# T101 Tofu Idle Row Production

Generated and accepted exactly one source-only Tofu Tortoise / `tortoise-tofu` idle row using built-in Codex imagegen. The row is normalized to an exact `2048x256` alpha spritesheet, recorded as the future shell-mass scale baseline, and kept out of public/runtime fighter assets.

## Changes

- Added the accepted built-in imagegen candidate: `assets/source/imagegen/fighters/tortoise-tofu/candidates/idle-codex-01.png`.
- Added the accepted source row: `assets/source/imagegen/fighters/tortoise-tofu/idle.png`.
- Added normalization proof artifacts:
  - `output/imagegen/tortoise-tofu-idle.png`
  - `output/imagegen/tortoise-tofu-idle-normalized.png`
- Added QA artifacts:
  - `output/animation-preflight/tofu-tortoise-idle-row-qa.json`
  - `output/animation-preflight/tofu-tortoise-idle-row-qa.html`
- Updated `src/assets/catalog.ts` so only Tofu idle is generated in the planned source manifest.
- Updated focused tests to prove the planned Tofu idle exception, asset QA counts, stable alpha bounds, and absence of `public/assets/generated/fighters/tortoise-tofu`.

## TDD Receipt

- Red: `npm test -- test/asset-pipeline.test.ts` failed because planned Tofu idle was still expected to be blocked.
- Green: after adding the Tofu idle catalog row and tests, `npm test -- test/asset-pipeline.test.ts` passed.
- Focused suite then passed: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts`.

## Evidence

- Built-in imagegen produced one accepted candidate only; no locomotion, attack, reaction, knockdown, win, lose, UI, stage, audio, or runtime assets were generated.
- Accepted source dimensions: `2048x256`, alpha: yes.
- Normalized proof dimensions: `2048x256`, alpha: yes.
- Per-frame alpha bounds are stable: widths `163-165`, heights `230`, average opaque pixels above `27,000`, visible green spill `0`.
- Browser smoke report: `output/web-game/tofu-idle-source-row/report.json` passed with zero failures and runtime roster IDs `gray-rabbit`, `ginger-tabby-cat`, `pugilist-pug`, and `ferret-noodle`; `tortoise-tofu` was absent.
- `public/assets/generated/fighters/tortoise-tofu` remains absent.
- Protected diff check produced no output.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation idle --fighters tortoise-tofu` passed.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/tortoise-tofu/idle.png output/imagegen/tortoise-tofu-idle-normalized.png` passed.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts` passed: 3 files / 34 tests.
- `node scripts/asset-qa.mjs --json` passed: checked `170`, runtime-ready `114`, needs-normalization `56`.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.
- `npm run verify` passed: typecheck, 33 files / 240 tests, and production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4174/ --out-dir output/web-game/tofu-idle-source-row` passed after rerunning outside the macOS sandbox: zero smoke failures, 12 scenarios, runtime roster without Tofu.

The full AAA outcome remains active and incomplete.
