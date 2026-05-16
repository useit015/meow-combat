# T047 Pickles Promotion Truthfulness

Fixed the post-promotion truth gap for Pickles Pugilist without regenerating, resizing, normalizing, or pixel-editing any fighter animation row.

## Runtime HUD

- `src/game/MeowtalArenaScene.ts` now treats the static rabbit/cat portrait slots as exact fighter/player matches only.
- When Pickles is selected, the HUD uses a constant-scale dynamic portrait from `pugilist-pug:idle` instead of exposing the wrong rabbit/cat portrait slot.
- `render_game_to_text` now reports `runtimeUi.hudPortraits` so smoke can assert the visible HUD identity directly.
- Rabbit P1 and cat P2 still use the approved static portrait slots, preserving the stock smoke path.
- A non-rabbit/non-cat winner falls back to the neutral KO overlay instead of reusing the cat victory overlay.

## Roster Lab

- Tracked roster-lab JSON/HTML artifacts now mark Pickles as `playable-runtime`.
- Pickles is no longer present in tracked `sourceOnlyIdentityLocks`.
- `test/source-roster-lab.test.ts` now checks the tracked artifacts so stale source-only output cannot pass silently.

## Verification

- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `node scripts/asset-qa.mjs --json` passed: `checked=140`, `runtimeReady=84`, `needsNormalization=56`.
- `npm test -- test/source-roster-lab.test.ts test/game-config.test.ts test/asset-runtime.test.ts` passed: 3 files, 29 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 214 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-runtime-promotion` passed with `failures=[]`.
- Targeted Pickles Playwright smoke passed and wrote `output/web-game/pickles-runtime-promotion/pickles-targeted-report.json`.

## Targeted Smoke Proof

- Selected Pickles as P1 and Ginger Tabby Cat as P2 in Training mode.
- Fetched all 14 Pickles public runtime rows as `image/png`.
- Verified `pugilist-pug:idle`, `pugilist-pug:jump`, `pugilist-pug:light-punch`, and `pugilist-pug:special` runtime routing with no fighter fallback.
- Verified `runtimeUi.visibleSlots` excludes `rabbit-portrait` for P1 Pickles and keeps `cat-portrait` for P2 cat.
- Verified `runtimeUi.hudPortraits.p1` is `fighterId=pugilist-pug`, `dynamicAssetKey=pugilist-pug:idle`, `dynamicVisible=true`, `usesFallback=false`, `staticSlot=null`.

Screenshots:

- `output/web-game/pickles-runtime-promotion/pickles-selected.png`
- `output/web-game/pickles-runtime-promotion/pickles-fight-idle.png`
- `output/web-game/pickles-runtime-promotion/pickles-fight-jump.png`
- `output/web-game/pickles-runtime-promotion/pickles-fight-light-punch.png`
- `output/web-game/pickles-runtime-promotion/pickles-fight-special.png`
