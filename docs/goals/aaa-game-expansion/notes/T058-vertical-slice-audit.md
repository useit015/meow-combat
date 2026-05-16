# T058 Vertical Slice Audit

Ran a post-T056 read-only audit of the current three-fighter browser milestone.

## Verification

- `git status --short` showed only local untracked `.codex/`, `.env`, and `docs/goals/aaa-game-expansion/.goalbuddy-board/`.
- `git diff --name-only -- assets/source/imagegen/fighters public/assets/generated/fighters output/imagegen package.json package-lock.json src/game/audio.ts public/assets/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts` produced no output.
- `for row in idle walk-forward walk-back crouch jump light-punch heavy-punch light-kick special hitstun blockstun knockdown win lose; do cmp -s assets/source/imagegen/fighters/pugilist-pug/$row.png public/assets/generated/fighters/pugilist-pug/$row.png || exit 1; done` passed.
- `npm test -- test/game-bible.test.ts test/shell-flow.test.ts test/character-select.test.ts test/combat-core.test.ts test/combat-effects.test.ts test/presentation.test.ts test/match-flow.test.ts` passed: 7 files, 66 tests.
- `npm run typecheck` passed.
- `npm run verify` passed: 31 files, 217 tests, plus production build.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/vertical-slice-audit` passed with `failures=[]`.

## Tranche Mapping

- Championship ladder and presentation: proved by `championship-ladder` smoke states and screenshots for advance, next fight, clear, and fail. Current story state exposes the Snackbelt ladder, rival order, current rival, and existing story hooks.
- Training lab: proved by `training-demo` smoke and screenshots. Training exposes selected fighter tips, dummy behavior/status, input/combo feedback, and reset-to-ready behavior.
- Combat readability: proved by `combat-readability-demo` smoke. The five feedback states expose `HIT`, `HEAVY BLOCK`, `HEAVY`, `SPECIAL`, and `SUPER`; all use stable idle rows in the demo evidence.
- 1 VS CPU and round flow: proved by desktop, endgame, match-flow tests, and full smoke. HUD, timer, health, meter, KO/victory overlays, reset, rematch, and CPU fight flow are live.
- Mode/select flow: functionally covered by shell tests and smoke, but it is now the largest visible polish gap. The mode and fighter-select screens work, yet still read more like a prototype than an AAA-grade browser shell.
- Pause/end states: covered by smoke and tests, with basic behavior passing. They can be improved later, but they are less urgent than the shell/select presentation.
- Responsive surfaces: landscape smoke passes and is the owner’s v1 orientation target. Portrait/touch smoke exists from earlier work, but portrait is not the v1 production target and should not drive the next milestone unless it blocks landscape/browser quality.
- Story truthfulness: `gameBible` and smoke agree that three runtime fighters are active and five roster fighters remain planned. The build does not claim the full 8-fighter game is complete.
- No-size invariant: protected asset/sizing/frame-data diff guard is empty, Pickles rows compare byte-identical, runtime frames remain 256x256, and reviewed screenshots do not show visible character size drift caused by recent work.

## Reviewed Screenshots

- `output/web-game/vertical-slice-audit/desktop-keyboard-fight.png`
- `output/web-game/vertical-slice-audit/championship-ladder-next-fight.png`
- `output/web-game/vertical-slice-audit/training-fight.png`
- `output/web-game/vertical-slice-audit/combat-readability-super-hit.png`
- `output/web-game/vertical-slice-audit/three-fighter-pickles-rabbit-fight.png`
- `output/web-game/vertical-slice-audit/landscape-fight.png`
- `output/web-game/vertical-slice-audit/portrait-fight.png`
- `output/web-game/vertical-slice-audit/training-mode-selected.png`
- `output/web-game/vertical-slice-audit/three-fighter-cat-pickles-select.png`

## Ranked Gaps

1. Keyboard-first landscape shell UX polish: ready, mode-select, character-select, pause, and end-state copy/presentation should better communicate modes, controls, runtime roster, fighter story hooks, and next action without advertising phone touch as a v1 desktop path.
2. Championship rewards and short interstitial flavor: useful after shell clarity, but lower leverage until the current shell better frames the three existing modes.
3. Authored/sample-based audio integration: important for AAA feel, but should be a separate asset/source-record task with license and source metadata.
4. Fourth fighter or broader roster asset work: still high value for the final 8-fighter direction, but unsafe until a dedicated asset/animation consistency gate is explicitly scoped.

## Next Package

Proceed with a bounded Worker for keyboard-first shell UX polish using current assets only. Do not touch fighter rows, generated assets, audio, dependencies, sprite scale, cell sizes, frame sizes, placement rules, or gameplay frame data.

The broad AAA game outcome remains incomplete.
