# T104 Tofu Locomotion Review

Decision: approve a bounded source-only Tofu mobility Worker.

## Findings

- T103 matches its receipt and QA artifacts: `walk-forward` and `walk-back` are accepted, exact `2048x256`, alpha-enabled, and source-only.
- The locomotion rows are stable enough to extend Tofu into mobility work. `walk-forward` stays within `154-167px` width and `221-223px` height; `walk-back` stays within `153-160px` width and `214-219px` height.
- Both rows preserve the T101 idle shell-mass read while allowing grounded foot movement, and both report `0` visible green spill pixels.
- `public/assets/generated/fighters/tortoise-tofu` remains absent, so Tofu is not public/runtime playable.
- Focused manifest and QA tests pass with exactly three generated Tofu rows: `idle`, `walk-forward`, and `walk-back`.
- Protected diffs are empty for public/runtime Tofu assets, dependencies, audio, sprite cell sizing, sprite visual sizing, combat frame data, and game config.

## Approved Next Slice

Approve one Worker for exactly two source-only mobility rows:

- `crouch`
- `jump`

This is the largest safe next package. These rows test Tofu's vertical compression and airborne silhouette while still staying in basic movement language. Attacks, reactions, knockdown, win/lose, runtime promotion, public assets, UI, stage, and audio remain blocked.

## Rejected Alternatives

- Require locomotion repair: rejected because the rows are exact-size alpha spritesheets with stable shell-mass ranges and clean QA.
- Single mobility row only: rejected because crouch and jump share the same vertical-scale risk and should be reviewed together against idle/locomotion.
- Attack/reaction/outcome rows: rejected until basic vertical mobility proves Tofu can compress and lift without identity or size drift.
- Runtime promotion: rejected until all required Tofu rows pass source-only production, QA, manifest review, and later smoke.
- Parallel workers: rejected because the two mobility rows share one scale baseline and should share one QA report.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T103-tofu-locomotion-row-production.md` passed.
- `node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("output/animation-preflight/tofu-tortoise-locomotion-row-qa.json","utf8")); console.log(JSON.stringify({fighterId:r.fighterId, result:r.result, rows:Object.fromEntries(Object.entries(r.rows).map(([id,row])=>[id,row.baselineComparison]))}, null, 2)); if(r.fighterId!=="tortoise-tofu" || r.result!=="accepted" || !r.rows["walk-forward"] || !r.rows["walk-back"] || Object.values(r.rows).some(row=>row.assets.acceptedSource.dimensions.width!==2048 || row.assets.acceptedSource.dimensions.height!==256 || !row.assets.acceptedSource.dimensions.hasAlpha || row.baselineComparison.maxGreenSpillPixels!==0)) process.exit(1);'` passed.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts` passed: 3 files / 35 tests.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.

The full AAA outcome remains active and incomplete.
