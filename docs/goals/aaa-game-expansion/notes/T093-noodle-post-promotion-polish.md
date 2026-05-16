# T093 Noodle Post-Promotion Polish

Expanded the browser smoke coverage for Noodle Nibbles after runtime promotion. No image, audio, dependency, source-record, sprite-cell, or sprite-visual-sizing files were changed.

## Changes

- Added a shared smoke helper for selecting runtime roster pairs from fighter select.
- Training smoke now selects Noodle as P1 against Pickles as the sparring dummy.
- Local Versus smoke now selects Noodle as P1 against Pickles as manual P2.
- Both new mode paths verify Noodle/Pickles selected fighter state, runtime sprite fighter IDs, dynamic HUD portrait keys, zero fighter fallbacks, and all 14 Noodle public PNG rows fetched in-browser.
- Dynamic-fighter smoke checks now use core fight UI slots so rabbit/cat static portraits are not required when neither fighter owns those static portrait slots.

## Evidence

- `output/web-game/noodle-post-promotion-polish/report.json` has `failures=[]`.
- Browser smoke result names include `training-demo`, `local-versus-demo`, and `four-fighter-runtime-promotion`.
- Noodle proof screenshots:
  - `output/web-game/noodle-post-promotion-polish/training-noodle-character-select.png`
  - `output/web-game/noodle-post-promotion-polish/training-noodle-fight.png`
  - `output/web-game/noodle-post-promotion-polish/training-noodle-light-feedback.png`
  - `output/web-game/noodle-post-promotion-polish/local-versus-noodle-pickles-select.png`
  - `output/web-game/noodle-post-promotion-polish/local-versus-noodle-pickles-fight.png`
  - `output/web-game/noodle-post-promotion-polish/local-versus-noodle-cpu-toggle-ignored.png`
  - `output/web-game/noodle-post-promotion-polish/runtime-roster-noodle-pickles-select.png`
  - `output/web-game/noodle-post-promotion-polish/runtime-roster-noodle-pickles-fight.png`

## Verification

- `node --check scripts/smoke-meowtal-browser.mjs` passed.
- `git diff --check` passed.
- `npm test -- test/character-select.test.ts test/game-config.test.ts test/game-bible.test.ts test/asset-runtime.test.ts test/fighter-animation-preflight.test.ts` passed: 5 files / 63 tests.
- `npm run verify` passed: typecheck, 31 files / 233 tests, and production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4174/ --out-dir output/web-game/noodle-post-promotion-polish` passed with `failures=[]`.
- `git diff --name-only -- public/assets/generated/fighters/ferret-noodle assets/source/imagegen/fighters/ferret-noodle package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.

The full AAA outcome remains active and incomplete.
