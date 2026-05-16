# T048 Three-Fighter Runtime Polish

Made Pickles Pugilist first-class in runtime-facing state and smoke coverage without changing any generated fighter rows, sprite cell dimensions, character scale logic, dependencies, audio, or assets.

## Runtime Integration

- `render_game_to_text` now exposes `runtimeRoster`, `selectedFighterDetails`, and `cpuOpponent`.
- Championship story telemetry now includes the Snackbelt premise, opening beat, and the currently selected rivals.
- Character select copy now distinguishes `CPU` from `P2` when the selected mode uses a CPU opponent.
- Championship-facing copy now uses the three active fighter names: Bunjamin Thump, Marmalade Mayhem, and Pickles Pugilist.

## Smoke Coverage

`scripts/smoke-meowtal-browser.mjs` now includes a `three-fighter-runtime-polish` scenario that runs championship CPU fights for:

- Gray Rabbit vs Ginger Tabby Cat, preserving the stock static rabbit/cat HUD portraits.
- Pickles Pugilist vs Gray Rabbit, proving dynamic Pickles and dynamic P2 rabbit HUD portraits.
- Ginger Tabby Cat vs Pickles Pugilist, proving dynamic P1 cat and dynamic P2 Pickles HUD portraits.

Each case verifies selected fighter details, runtime roster order, CPU opponent identity, championship story rivals, runtime sprite fighter IDs, HUD portrait truth, and zero runtime fighter fallbacks.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-config.test.ts test/game-bible.test.ts test/character-select.test.ts test/combat-core.test.ts test/combat-effects.test.ts` passed: 5 files, 46 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 215 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/three-fighter-runtime-polish` passed with `failures=[]`.

Visual sanity:

- `output/web-game/three-fighter-runtime-polish/three-fighter-pickles-rabbit-fight.png` shows stable-size Pickles versus Gray Rabbit with truthful dynamic HUD portraits.

The broad AAA game outcome remains incomplete.
