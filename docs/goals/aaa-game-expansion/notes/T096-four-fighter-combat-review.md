# T096 Four-Fighter Combat Review

Decision: approve a bounded championship/story polish Worker.

## Findings

- T095 is consistent with its receipt: the browser report has `failures=[]` and includes Training, Local Versus, Championship, and four-fighter runtime promotion coverage.
- The active roster now has a combat/readability test and smoke proof for Noodle, Pickles, Gray Rabbit, and Ginger Tabby Cat without touching protected asset/audio/dependency surfaces.
- The current championship ladder is implemented and smoke-covered, but its next quality gap is richer four-rival story presentation rather than another frame-data or roster-lane pass.
- Starting another fighter lane now would add production volume before the current four-fighter game has a more memorable campaign wrapper.
- Audio production remains important, but a story/championship pass can improve the playable loop without needing external licensing, API quota, or generated media.
- A final tranche audit is premature because the full AAA outcome still lacks the full 8-fighter content direction, authored/sample-based audio pass, deeper championship presentation, and final before/after proof.

## Routing

Next task: T097 championship/story polish.

The Worker should keep scope to existing active fighters and existing implemented modes. It may enrich the game bible, championship interstitial text/state, shell/story copy, focused tests, and browser smoke assertions/screenshots. It must not generate or edit image/audio assets, promote planned fighters, change dependencies, or alter sprite cell/visual sizing.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T095-four-fighter-combat-polish.md` passed.
- `node -e 'const r=require("./output/web-game/four-fighter-combat-polish/report.json"); console.log(JSON.stringify({failures:r.failures.length,resultNames:r.results.map(x=>x.name),hasTraining:r.results.some(x=>x.name==="training-demo"),hasLocalVersus:r.results.some(x=>x.name==="local-versus-demo"),hasFourFighter:r.results.some(x=>x.name==="four-fighter-runtime-promotion"),hasChampionship:r.results.some(x=>x.name==="championship-ladder")}, null, 2)); if (r.failures.length || !r.results.some(x=>x.name==="training-demo") || !r.results.some(x=>x.name==="local-versus-demo") || !r.results.some(x=>x.name==="four-fighter-runtime-promotion") || !r.results.some(x=>x.name==="championship-ladder")) process.exit(1);'` passed.
- `git diff --name-only -- public/assets/generated/fighters assets/source/imagegen/fighters package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.

The full AAA outcome remains active and incomplete.
