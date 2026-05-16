# T063 Local Versus Mode

Promoted Local Versus from planned to implemented using current runtime assets only.

## Changes

- Added `local-versus` to the shell mode cycle after Championship.
- Updated mode label, mode description, and mode panel copy for browser v1 same-keyboard PvP.
- Marked Local Versus as implemented in the game bible.
- Reused existing manual P1/P2 keyboard input and existing three-fighter runtime roster.
- Exposed `localVersus` state through `render_game_to_text`:
  - enabled flag
  - same-keyboard control plan
  - manual P2 state
  - runtime roster truth line
  - P1/P2 selected fighter details
  - P1/P2 keyboard hints
- Locked the CPU toggle off while Local Versus is active so P2 cannot drift into CPU control.
- Added smoke coverage that selects Local Versus, starts the fight, proves P2 is manual, presses `C`, proves P2 remains manual, and moves P2 with ArrowLeft.

## Protected Scope

No fighter rows, generated images, imagegen outputs, audio files, dependencies, package locks, sprite frame helpers, sprite sizing helpers, placement rules, character-size logic, hitbox/damage/pushback/movement frame data, or gameplay balance constants were changed.

## Verification

- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts test/combat-core.test.ts` passed: 4 files, 46 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 218 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/local-versus-mode` passed with `failures=[]`.

## Screenshot Review

Reviewed:

- `output/web-game/local-versus-mode/local-versus-mode-selected.png`
- `output/web-game/local-versus-mode/local-versus-character-select.png`
- `output/web-game/local-versus-mode/local-versus-fight.png`
- `output/web-game/local-versus-mode/local-versus-cpu-toggle-ignored.png`
- `output/web-game/local-versus-mode/local-versus-p2-move.png`

The Local Versus mode panel and character select remain readable. Fight screenshots show Local Versus as a manual P1/P2 state without visible character-size drift or new HUD/body obstruction.

## Judge Review

Initial Judge review blocked T063 because the global CPU toggle could still make P2 CPU-controlled during Local Versus. The fix forces `p2CpuEnabled=false` in Local Versus and adds smoke coverage for pressing `C`.

The re-review approved T063 after the fix, citing:

- tracked diff limited to T063 implementation/test files
- protected diff guard clean
- Pickles row byte-compare passed
- smoke `failures=[]`
- Local Versus state stays manual after the CPU toggle

## Result

T063 satisfies its acceptance criteria. The broad AAA game outcome remains incomplete.
