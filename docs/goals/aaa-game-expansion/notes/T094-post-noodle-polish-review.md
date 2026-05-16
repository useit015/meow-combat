# T094 Post-Noodle Polish Review

Decision: approve a bounded four-fighter combat/readability polish Worker.

## Findings

- T093 is consistent with its receipt: the current smoke report has `failures=[]` and includes `training-demo`, `local-versus-demo`, and `four-fighter-runtime-promotion`.
- T093 improves coverage rather than broadening scope: Noodle is proven in Training, Local Versus, and Championship without image edits, source edits, audio work, dependency work, sprite-cell changes, or sprite-visual-sizing changes.
- The four-fighter runtime roster is now mechanically selectable, but the next risk is game feel/readability across the expanded roster rather than another asset lane.
- Starting another fighter lane now would add volume before the current four-fighter build has had a focused feel/readability pass.
- Audio production remains important, but combat/readability is the larger immediate gameplay proof because it touches the player-facing loop in every mode.

## Routing

Next task: T095 four-fighter combat/readability polish.

The Worker should keep scope to runtime feel/readability for existing active fighters. It may tune frame data, CPU/interaction readability, text-state/smoke coverage, and focused tests, but it must not generate or edit image/audio assets, promote planned fighters, change dependencies, or alter sprite cell/visual sizing.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T093-noodle-post-promotion-polish.md` passed.
- `node -e 'const r=require("./output/web-game/noodle-post-promotion-polish/report.json"); console.log(JSON.stringify({failures:r.failures.length,resultNames:r.results.map(x=>x.name)}, null, 2)); if (r.failures.length) process.exit(1);'` passed.
- `git diff --name-only -- public/assets/generated/fighters/ferret-noodle assets/source/imagegen/fighters/ferret-noodle package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.

The full AAA outcome remains active and incomplete.
