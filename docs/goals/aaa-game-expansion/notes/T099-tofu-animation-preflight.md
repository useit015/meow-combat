# T099 Tofu Animation Preflight

Completed the source-only animation-production preflight for Tofu Tortoise / `tortoise-tofu`. This task did not run imagegen, did not generate animation rows, did not edit public/runtime fighter assets, did not promote Tofu to the runtime roster, and did not touch combat, audio, dependencies, sprite cell size, or sprite visual sizing.

## Changes

- Added `TOFU_ANIMATION_PREFLIGHT`, `buildTofuAnimationPreflight`, and `renderTofuAnimationPreflightHtml`.
- Defined Tofu's identity requirements, row-production strategy, required row contracts, no-size-drift gates, runtime-promotion tests, and future smoke requirements.
- Added focused tests proving Tofu remains source-only, not playable, outside the runtime roster, and absent from public runtime assets.
- Added review artifacts:
  - `output/animation-preflight/tofu-tortoise-animation-preflight.json`
  - `output/animation-preflight/tofu-tortoise-animation-preflight.html`

## TDD Receipt

- Red: `npm test -- test/fighter-animation-preflight.test.ts` failed because `buildTofuAnimationPreflight` did not exist.
- Intermediate red: after adding the builder, the same test failed because `output/animation-preflight/tofu-tortoise-animation-preflight.json` did not exist.
- Green: after adding the preflight artifacts, `npm test -- test/fighter-animation-preflight.test.ts` passed.

## Evidence

- Tofu preflight JSON reports `fighterId: "tortoise-tofu"`, `sourceOnly: true`, `playable: false`, 14 required rows, and the five gates `shell-mass-scale-bounds`, `alpha-bounds`, `identity-traits`, `frame-dimensions`, and `provenance`.
- `public/assets/generated/fighters/tortoise-tofu` remains absent.
- Protected diff check produced no output.

## Verification

- `npm test -- test/fighter-animation-preflight.test.ts` passed: 1 file / 25 tests.
- `git diff --check` passed.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu assets/source/imagegen/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/meowtal-production-manifest.test.ts` passed: 3 files / 55 tests.
- `npm run verify` passed: typecheck, 33 files / 239 tests, and production build.
- `node -e 'const fs=require("fs"); const p="output/animation-preflight/tofu-tortoise-animation-preflight.json"; const r=JSON.parse(fs.readFileSync(p,"utf8")); console.log(JSON.stringify({fighterId:r.fighterId, sourceOnly:r.sourceOnly, playable:r.playable, rows:r.requiredRows.length, gates:r.noDriftQaGates.map(g=>g.id)}, null, 2)); if(r.fighterId!=="tortoise-tofu" || !r.sourceOnly || r.playable || r.requiredRows.length!==14) process.exit(1);'` passed.
- `test -s output/animation-preflight/tofu-tortoise-animation-preflight.json` passed.
- `test -s output/animation-preflight/tofu-tortoise-animation-preflight.html` passed.

The full AAA outcome remains active and incomplete.
