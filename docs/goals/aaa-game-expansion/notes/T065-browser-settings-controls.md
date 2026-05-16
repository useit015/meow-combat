# T065 Browser Settings Controls

Added a browser-v1 options/settings surface using current code-rendered UI only.

## Changes

- Added `browserSettings` to `render_game_to_text` so smoke can assert the settings/options state.
- Added pause-panel copy for the browser-v1 options surface:
  - current mode
  - P1 keyboard controls
  - P2 manual or CPU control truth
  - CPU difficulty/toggle availability
  - fullscreen/reset/resume actions
  - no key rebinding in browser v1
- Kept Local Versus truthful: P2 remains manual and CPU toggles are reported as locked off.
- Added smoke coverage for:
  - 1 VS CPU options panel
  - CPU difficulty changing to hard
  - manual P2 toggle
  - Local Versus manual P2 settings
  - Local Versus CPU-toggle ignored state

## Protected Scope

No fighter rows, generated images, imagegen outputs, audio files, source audio records, dependencies, package locks, sprite frame helpers, sprite sizing helpers, placement rules, character-size logic, hitbox/damage/pushback/movement frame data, gameplay balance constants, persistence, key rebinding, touch redesign, or roster content were changed.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts test/control-fallback.test.ts` passed: 4 files, 26 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 218 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/browser-settings-controls` passed with `failures=[]`.

## Screenshot Review

Reviewed:

- `output/web-game/browser-settings-controls/browser-settings-versus-cpu.png`
- `output/web-game/browser-settings-controls/browser-settings-cpu-hard.png`
- `output/web-game/browser-settings-controls/browser-settings-manual-p2.png`
- `output/web-game/browser-settings-controls/browser-settings-local-versus.png`
- `output/web-game/browser-settings-controls/browser-settings-local-versus-cpu-ignored.png`

Initial screenshot review caught a too-long Local Versus CPU explanation line. The visible copy was shortened and smoke was rerun. Current settings rows fit inside the pause panel, the overlay does not obscure critical HUD/body readability, and no visible character-size drift was observed.

## Judge Review

Judge approved T065. The review confirmed the tracked diff is limited to `src/game/MeowtalArenaScene.ts` and `scripts/smoke-meowtal-browser.mjs`, protected paths are clean, Pickles rows are byte-identical, smoke report has `failures=[]`, and screenshots show fitting settings copy with no apparent character-size drift.

## Result

T065 satisfies its acceptance criteria. The broad AAA game outcome remains incomplete.
