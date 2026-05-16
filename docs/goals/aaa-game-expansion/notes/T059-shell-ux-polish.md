# T059 Shell UX Polish

Polished the browser v1 shell around keyboard-first landscape play while preserving the no-size hard gate.

## Changes

- Added `shellPresentation` to `render_game_to_text` so smoke can assert shell phase, visible copy, mode truth, roster truth, selected fighter identity, story hooks, authored move names, keyboard-first posture, and mobile-v2 touch boundary.
- Updated ready, mode-select, character-select, pause, round-over, and match-over copy to read as a browser v1 shell rather than prototype text.
- Expanded character-select presentation around the three runtime fighters:
  - Bunjamin Thump / Gray Rabbit
  - Marmalade Mayhem / Ginger Tabby Cat
  - Pickles Pugilist
- Kept the planned five fighters locked in shell truth copy: `3 PLAYABLE NOW | 5 PLANNED LOCKED FOR MODEL-SHEET QA`.
- Added smoke assertions for keyboard-first shell presentation, truthful implemented modes, character-select identity/story/move coverage, pause actions, and end-state next actions.
- Added focused character-select coverage requiring runtime-selectable fighters to have league identity, story hook, signature move, super move, and training tip.

## Protected Scope

No fighter rows, generated images, imagegen outputs, audio files, dependencies, package locks, sprite frame helpers, sprite sizing helpers, placement rules, or gameplay frame data were changed.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts` passed: 3 files, 23 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 218 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/shell-ux-polish` passed with `failures=[]`.

## Screenshot Review

Reviewed:

- `output/web-game/shell-ux-polish/training-mode-selected.png`
- `output/web-game/shell-ux-polish/three-fighter-cat-pickles-select.png`
- `output/web-game/shell-ux-polish/gamepad-pause.png`
- `output/web-game/shell-ux-polish/championship-ladder-next-fight.png`
- `output/web-game/shell-ux-polish/desktop-keyboard-fight.png`

The mode, select, and pause screens are readable and keyboard-first. Championship and desktop fight screenshots did not show new body/HUD obstruction or visible character-size drift from this task.

## Judge Review

GoalBuddy Judge approved the receipt and commit. The judge found the tracked diff limited to:

- `src/game/MeowtalArenaScene.ts`
- `scripts/smoke-meowtal-browser.mjs`
- `test/character-select.test.ts`

The judge found no protected asset/sizing/audio/dependency/frame-data changes and no missing evidence.

## Result

T059 satisfies its acceptance criteria. The broad AAA game outcome remains incomplete.
