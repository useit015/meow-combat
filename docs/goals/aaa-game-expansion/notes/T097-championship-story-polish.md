# T097 Championship Story Polish

Completed a bounded championship/story polish slice for the current four-fighter Snackbelt ladder. No image, audio, dependency, source-record, sprite-cell, or sprite-visual-sizing files were changed.

## Changes

- Added complete championship beat sets for all planned fighters, with the active roster now owning distinct `rivalIntro`, `advancePayoff`, `titleClaim`, and `runEnd` copy.
- Wired the championship ladder presentation and debug state to use fighter-specific story beats for rival previews, advance payoffs, ladder clears, and failed runs.
- Exposed championship beat data through selected fighter, runtime roster, shell presentation, and CPU opponent debug state.
- Expanded browser smoke assertions to prove the ladder renders fighter-specific beats for Marmalade, Pickles, Bunjamin, and failed-run copy.
- Added a focused `test/championship-story.test.ts` to lock complete and distinct championship beat sets for the active roster.

## TDD Receipt

- Red: `npm test -- test/championship-story.test.ts` failed because runtime fighters did not have a `championship` beat set.
- Green: after adding the content model and wiring the presentation, `npm test -- test/championship-story.test.ts` passed.
- Typecheck also caught a missing content barrel type export; `src/content/index.ts` now exports `FighterChampionshipStory`.

## Evidence

- `output/web-game/championship-story-polish/report.json` has `failures=[]`.
- Browser smoke result names include `championship-ladder`, `training-demo`, `local-versus-demo`, and `four-fighter-runtime-promotion`.
- Championship proof screenshots:
  - `output/web-game/championship-story-polish/championship-ladder-advance-match-over.png`
  - `output/web-game/championship-story-polish/championship-ladder-next-fight.png`
  - `output/web-game/championship-story-polish/championship-ladder-clear-match-over.png`
  - `output/web-game/championship-story-polish/championship-ladder-fail-match-over.png`

## Verification

- `npm test -- test/championship-story.test.ts` passed: 1 file / 2 tests.
- `node --check scripts/smoke-meowtal-browser.mjs` passed.
- `git diff --check` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/championship-story.test.ts` passed: 3 files / 19 tests.
- `npm run verify` passed: typecheck, 33 files / 236 tests, and production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4174/ --out-dir output/web-game/championship-story-polish` passed with `failures=[]` and 74 screenshots.
- `git diff --name-only -- public/assets/generated/fighters assets/source/imagegen/fighters package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.

The full AAA outcome remains active and incomplete.
