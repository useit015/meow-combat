# T061 Championship Rewards Interstitials

Added current-assets-only championship reward and interstitial flavor for the Snackbelt ladder.

## Changes

- Added smoke-verifiable `reward` state to championship presentation:
  - `up-for-grabs` during rival preview
  - `checkpoint` after advancing
  - `claimed` after clearing the ladder
  - `lost` after a failed run
- Added smoke-verifiable `interstitial` state with kind, progress, payoff line, next action, roster truth, completed count, and total opponent count.
- Rendered compact reward/progress/payoff lines in the existing championship panel without changing fighter placement or sprite scale.
- Added smoke assertions for:
  - advance checkpoint at `1/2`
  - next-fight rival preview at `1/2`
  - cleared reward claimed at `2/2`
  - failed reward lost at `0/2`
  - truthful `3 playable runtime fighters; 5 planned locked for model-sheet QA`

## Protected Scope

No fighter rows, generated images, imagegen outputs, audio files, dependencies, package locks, sprite frame helpers, sprite sizing helpers, placement rules, character-size logic, or gameplay frame data were changed.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts` passed: 3 files, 23 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 218 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/championship-rewards-interstitials` passed with `failures=[]`.

## Screenshot Review

Reviewed:

- `output/web-game/championship-rewards-interstitials/championship-ladder-advance-match-over.png`
- `output/web-game/championship-rewards-interstitials/championship-ladder-clear-match-over.png`
- `output/web-game/championship-rewards-interstitials/championship-ladder-fail-match-over.png`
- `output/web-game/championship-rewards-interstitials/championship-ladder-next-fight.png`

The championship reward/interstitial text remains readable and compact. The reviewed screenshots did not show new fighter body/HUD obstruction or visible character-size drift from this task.

## Judge Review

GoalBuddy Judge approved T061 for receipt and commit. The judge found:

- tracked diff limited to `src/game/MeowtalArenaScene.ts` and `scripts/smoke-meowtal-browser.mjs` before receipt
- protected diff guard clean
- Pickles row byte-compare passed
- smoke report `failures=[]`
- advance, rival-preview, cleared, and failed reward/interstitial states exposed in smoke

## Result

T061 satisfies its acceptance criteria. The broad AAA game outcome remains incomplete.
