# T054 Training Mode Depth

Deepened Training mode into a small practice lab using existing runtime state and current assets only.

## Runtime Presentation

- Added a compact `TRAINING LAB` panel during Training fights and paused Training states.
- Surfaced the selected fighter's existing training tip in the fight screen.
- Exposed dummy behavior/status as smoke-verifiable state:
  - manual idle sparring dummy
  - health lock on
  - current dummy state, health, guarding flag, and readable status label
- Exposed practice feedback as smoke-verifiable state:
  - combo count
  - combo damage
  - current player action label
  - current player state
  - input hints
  - reset hint
- Added smoke coverage for entering Training, reading the lab state, checking light-punch feedback, and resetting back to ready.

## Asset And Size Guard

- No fighter rows, generated assets, source assets, sprite scale logic, cell sizes, frame sizes, placement rules, dependencies, or audio changed.
- Pickles source/public row byte comparisons passed for all 14 runtime rows.
- Visual screenshots show the Training panel stays high in the stage without obscuring fighter bodies or changing runtime character proportions.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts test/combat-core.test.ts test/match-flow.test.ts` passed: 5 files, 48 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 215 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/training-mode-depth` passed with `failures=[]`.

Reviewed screenshots:

- `output/web-game/training-mode-depth/training-fight.png`
- `output/web-game/training-mode-depth/training-light-feedback.png`
- `output/web-game/training-mode-depth/training-reset-ready.png`

The broad AAA game outcome remains incomplete.
