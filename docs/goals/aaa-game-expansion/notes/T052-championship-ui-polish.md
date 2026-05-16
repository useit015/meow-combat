# T052 Championship UI Polish

Polished the three-fighter Snackbelt championship ladder presentation using current runtime assets only.

## Runtime Presentation

- Added a compact championship panel that appears during championship fights and match-over states.
- Surfaced ladder progress, opponent order, current rival, and existing fighter story hooks.
- Added distinct presentation states for:
  - `ADVANCE TO NEXT RIVAL`
  - `SNACKBELT LADDER 2/2`
  - `SNACKBELT CLEARED`
  - `SNACKBELT RUN ENDED`
- Updated runtime text state so smoke can assert championship presentation content directly.
- Updated championship mode metadata from planned shell to implemented three-fighter ladder without claiming the full AAA outcome is complete.

## Asset And Size Guard

- No fighter rows, generated assets, source assets, sprite scale logic, cell sizes, frame sizes, dependencies, or audio changed.
- Pickles source/public row byte comparisons passed for all 14 runtime rows.
- Visual screenshots show the panel stays in the upper sky/HUD-adjacent area without obscuring fighter bodies or changing character proportions.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts test/combat-core.test.ts` passed: 4 files, 45 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 215 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/championship-ui-polish` passed with `failures=[]`.
- `node ~/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url 'http://127.0.0.1:4173/?demo=championship-ladder-advance' --actions-json '{"steps":[{"buttons":[],"frames":8}]}' --iterations 1 --pause-ms 120 --screenshot-dir output/web-game/championship-ui-polish-client` captured the advance panel and state.

Reviewed screenshots:

- `output/web-game/championship-ui-polish/championship-ladder-next-fight.png`
- `output/web-game/championship-ui-polish/championship-ladder-clear-match-over.png`
- `output/web-game/championship-ui-polish/championship-ladder-fail-match-over.png`
- `output/web-game/championship-ui-polish-client/shot-0.png`

The broad AAA game outcome remains incomplete.
