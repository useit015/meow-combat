# T056 Combat Readability

Added a non-asset combat readability pass using current runtime assets only.

## Runtime Feedback

- Added deterministic combat feedback tiers for:
  - `HIT`
  - `HEAVY BLOCK`
  - `HEAVY`
  - `SPECIAL`
  - `SUPER`
- Expanded runtime text state so smoke can assert effect kind, move, tier, label, age, duration, and damage-number kind/value.
- Enriched the existing canvas effect overlay with distinct hit, block, heavy, special, and super shapes.
- Tuned impact flash/shake cues by feedback tier while keeping the implementation event-driven and deterministic.
- Added smoke-only `combat-readability-*` demo states for stable evidence without changing normal gameplay frame data.

## Asset And Size Guard

- No fighter rows, generated assets, source assets, sprite scale logic, cell sizes, frame sizes, placement rules, gameplay frame data, dependencies, or audio changed.
- Pickles source/public row byte comparisons passed for all 14 runtime rows.
- Combat-readability smoke demos use stable idle fighter rows with unchanged 256x256 frame dimensions.
- Visual screenshots show the effects are readable without obscuring HUD or fighter bodies, and without changing runtime character proportions.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/combat-effects.test.ts test/presentation.test.ts test/combat-core.test.ts` passed: 3 files, 41 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 217 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/combat-readability` passed with `failures=[]`.

Reviewed screenshots:

- `output/web-game/combat-readability/combat-readability-light-hit.png`
- `output/web-game/combat-readability/combat-readability-block.png`
- `output/web-game/combat-readability/combat-readability-heavy-hit.png`
- `output/web-game/combat-readability/combat-readability-special-hit.png`
- `output/web-game/combat-readability/combat-readability-super-hit.png`

Judge approved T056 with no blockers. The broad AAA game outcome remains incomplete.
