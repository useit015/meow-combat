# T050 Championship Three-Fighter Ladder

Turned championship mode from a single CPU fight shell into a minimal ladder over the current runtime roster, using existing assets only.

## Runtime Behavior

- Championship now starts a ladder for the selected P1 fighter against every other runtime fighter.
- The selected P2 fighter becomes the first ladder opponent when valid, so character select still controls the opening matchup.
- Winning a championship match records the completed opponent and advances to the next runtime fighter.
- Clearing the final opponent records a completed ladder result.
- Losing a championship match records a failed run.
- Starting the next championship fight syncs P2/CPU to the current ladder opponent.

## Smoke Coverage

`scripts/smoke-meowtal-browser.mjs` now includes a `championship-ladder` scenario that proves:

- Gray Rabbit can defeat Ginger Tabby Cat and advance to Pickles Pugilist.
- Pressing through match-over starts the next fight with Pickles as the runtime P2 sprite and CPU opponent.
- Completing the Pickles match records a cleared ladder with both runtime opponents completed.
- The ladder state is visible through `render_game_to_text`.
- Runtime fighter fallbacks remain zero.

Captured proof:

- `output/web-game/championship-three-fighter-ladder/championship-ladder-advance-match-over.png`
- `output/web-game/championship-three-fighter-ladder/championship-ladder-next-fight.png`
- `output/web-game/championship-three-fighter-ladder/championship-ladder-clear-match-over.png`
- `output/web-game/championship-three-fighter-ladder/report.json`

## Asset Guard

- No fighter rows, generated fighter assets, source fighter assets, cell sizes, dependencies, or audio assets were changed.
- Pickles source/public row byte comparisons passed for all 14 runtime rows.
- Visual sanity on `championship-ladder-next-fight.png` and `championship-ladder-clear-match-over.png` showed stable character proportions and no visible size drift.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png; done` passed.
- `npm test -- test/game-bible.test.ts test/character-select.test.ts test/combat-core.test.ts` passed: 3 files, 35 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 215 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/championship-three-fighter-ladder` passed with `failures=[]`.

The broad AAA game outcome remains incomplete.
