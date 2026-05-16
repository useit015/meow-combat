# T095 Four-Fighter Combat Polish

Completed a bounded combat/readability polish slice for the active roster: Gray Rabbit, Ginger Tabby Cat, Pickles Pugilist, and Noodle Nibbles. No image, audio, dependency, source-record, sprite-cell, or sprite-visual-sizing files were changed.

## Changes

- Added a focused combat readability test that locks the four active fighters to distinct frame-data archetypes.
- Tuned Noodle's light-kick frame data to make it read as a longer-range spacing kick: `blockstun: 11` and `pushback: 16`.
- Expanded browser smoke coverage so Training proves Noodle's light-kick action and runtime `light-kick` animation row.
- Added a smoke readiness guard for the debug text hook so scenario checks wait for `window.render_game_to_text` before reading combat state.

## TDD Receipt

- Red: `npm test -- test/combat.test.ts` failed because Noodle's inherited light-kick blockstun was `9`, not greater than Ginger Tabby Cat's light-kick blockstun.
- Green: after the bounded Noodle frame-data tune, `npm test -- test/combat.test.ts` passed.

## Evidence

- `output/web-game/four-fighter-combat-polish/report.json` has `failures=[]`.
- Browser smoke result names include `combat-readability-demo`, `training-demo`, `local-versus-demo`, `four-fighter-runtime-promotion`, and `championship-ladder`.
- Proof screenshots:
  - `output/web-game/four-fighter-combat-polish/training-noodle-kick-feedback.png`
  - `output/web-game/four-fighter-combat-polish/training-noodle-fight.png`
  - `output/web-game/four-fighter-combat-polish/local-versus-noodle-pickles-fight.png`
  - `output/web-game/four-fighter-combat-polish/runtime-roster-noodle-pickles-fight.png`
  - `output/web-game/four-fighter-combat-polish/combat-readability-special-hit.png`

## Verification

- `node --check scripts/smoke-meowtal-browser.mjs` passed.
- `git diff --check` passed.
- `npm test -- test/combat.test.ts test/match-flow.test.ts test/character-select.test.ts test/game-config.test.ts test/game-bible.test.ts` passed: 5 files / 25 tests.
- `npm run verify` passed: typecheck, 32 files / 234 tests, and production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4174/ --out-dir output/web-game/four-fighter-combat-polish` passed with `failures=[]` and 74 screenshots.
- `git diff --name-only -- public/assets/generated/fighters assets/source/imagegen/fighters package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.

The full AAA outcome remains active and incomplete.
