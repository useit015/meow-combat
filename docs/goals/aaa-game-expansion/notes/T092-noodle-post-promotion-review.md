# T092 Noodle Post-Promotion Review

Decision: approve a post-promotion playability polish Worker before starting another roster lane.

## Findings

- T091 truthfully promotes Noodle Nibbles (`ferret-noodle`) as the fourth active runtime fighter while leaving the other four Pawbreaker fighters planned/locked.
- The public Noodle runtime folder contains exactly the 14 approved animation rows and no canonical sheet.
- The T091 receipt matches the current browser smoke report: `failures=[]`, and the report includes `four-fighter-runtime-promotion`.
- Protected dependency, audio, source-audio, sprite-frame, and sprite-visual-sizing diffs are empty.
- The smoke coverage now proves Noodle can be selected, all 14 public rows fetch in-browser, Noodle runtime visuals use `ferret-noodle:*` keys, the dynamic HUD portrait resolves, and fighter fallbacks stay at zero.

## Risks

- Smoke proves loading and selection, not whether Noodle feels fair, readable, or polished in real play.
- Noodle was added to the championship ladder, so the four-fighter ladder presentation should get a focused playability/readability pass before the project adds another fighter.
- Dynamic portraits for non-rabbit/cat fighters now carry more user-facing weight, so HUD readability should be checked in real fight states.

## Routing

Next task: T093 Noodle post-promotion playability polish.

Scope should stay bounded to browser-runtime polish for Noodle as an already-promoted fighter. Do not generate or edit image assets, do not promote another planned fighter, do not touch audio/dependencies, and do not mark the full AAA outcome complete.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T091-noodle-runtime-promotion.md` passed.
- `node -e 'const r=require("./output/web-game/noodle-runtime-promotion/report.json"); console.log(JSON.stringify({url:r.url, failures:r.failures.length, resultNames:r.results.map(x=>x.name), hasFourFighterPromotion:r.results.some(x=>x.name==="four-fighter-runtime-promotion")}, null, 2)); if (r.failures.length || !r.results.some(x=>x.name==="four-fighter-runtime-promotion")) process.exit(1);'` passed.
- `git diff --name-only -- package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts` produced no output.
- `find public/assets/generated/fighters/ferret-noodle -maxdepth 1 -type f | sort` listed the 14 promoted runtime rows only.

The full AAA outcome remains active and incomplete.
