# T102 Tofu Idle Row Review

Decision: approve a bounded source-only Tofu locomotion Worker.

## Findings

- T101 matches its receipt and QA artifacts: `tortoise-tofu:idle` is accepted, exact `2048x256`, alpha-enabled, and source-only.
- The idle row is stable enough to become Tofu's shell-mass scale reference. Per-frame alpha bounds stay within `163-165px` width and `230px` height, and every frame reports `0` visible green spill pixels.
- `public/assets/generated/fighters/tortoise-tofu` remains absent, so Tofu is not public/runtime playable.
- Focused manifest and QA tests pass with Tofu idle as the only generated Tofu row.
- Protected diffs are empty for public/runtime Tofu assets, dependencies, audio, sprite cell sizing, sprite visual sizing, combat frame data, and game config.

## Approved Next Slice

Approve one Worker for exactly two source-only grounded locomotion rows:

- `walk-forward`
- `walk-back`

This is the largest safe next package. Forward and backward walk rows share the same shell-height, squat limb, body-mass, and foot-placement risks, so they should be generated and QA-reviewed together against the accepted idle baseline. Crouch/jump, attacks, reactions, knockdown, win/lose, runtime promotion, public assets, UI, stage, and audio remain blocked.

## Rejected Alternatives

- Require idle repair: rejected because T101's dimensions, alpha, shell-mass bounds, and green-spill checks are clean.
- Single walk row only: rejected because forward/backward gait consistency is easier to judge as a pair.
- Crouch/jump package: rejected until grounded movement proves the idle scale under motion.
- Attack/reaction/outcome rows: rejected because they introduce stronger pose distortion before basic movement is locked.
- Runtime promotion: rejected until all required Tofu rows pass source-only production, QA, manifest review, and later smoke.
- Parallel workers: rejected because both locomotion rows depend on one shared idle baseline and should share one QA report.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T101-tofu-idle-row-production.md` passed.
- `node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("output/animation-preflight/tofu-tortoise-idle-row-qa.json","utf8")); console.log(JSON.stringify({fighterId:r.fighterId, animationId:r.animationId, result:r.result, dimensions:r.assets.acceptedSource.dimensions, frameBounds:r.frameBounds.map(f=>({w:f.width,h:f.height,green:f.greenSpillPixels}))}, null, 2)); if(r.fighterId!=="tortoise-tofu" || r.animationId!=="idle" || r.result!=="accepted" || r.assets.acceptedSource.dimensions.width!==2048 || r.assets.acceptedSource.dimensions.height!==256 || !r.assets.acceptedSource.dimensions.hasAlpha || r.frameBounds.some(f=>f.greenSpillPixels!==0)) process.exit(1);'` passed.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts` passed: 3 files / 34 tests.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.

The full AAA outcome remains active and incomplete.
