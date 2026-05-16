# T069 - Noodle Preflight Artifact Hardening

Result: done.

Full AAA outcome: incomplete.

## Scope

Hardened the source-controlled Noodle Nibbles / `ferret-noodle` animation preflight artifacts so they preserve the full row-production contract before any idle-row imagegen work.

This task did not run imagegen, create or edit raster assets, create public/runtime Noodle assets, promote Noodle to the playable roster, or touch audio, dependencies, sprite sizing, placement, frame data, hitboxes, damage, pushback, movement, or runtime roster/select/championship files.

## Changes

- Updated `renderAnimationPreflightHtml` so row tables include the row-generation brief, motion language, acceptance criteria, and rejection triggers.
- Regenerated `output/animation-preflight/noodle-nibbles-animation-plan.json` from `buildNoodleAnimationPreflight()` so every required Noodle row includes `rowGenerationBrief`, `motionLanguage`, `acceptanceCriteria`, and `rejectionTriggers`.
- Regenerated `output/animation-preflight/noodle-nibbles-animation-plan.html` so reviewers can inspect the idle-row production contract without reading TypeScript.
- Strengthened `test/fighter-animation-preflight.test.ts` so the committed JSON artifact must match the full generated preflight rows, gates, runtime-promotion tests, and smoke requirements.

## Verification

- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/imagegen-jobs.test.ts test/source-roster-lab.test.ts test/game-config.test.ts` (4 files, 29 tests)
- Pass: `npm run typecheck`
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `rg -n "rowGenerationBrief|motionLanguage|acceptanceCriteria|rejectionTriggers|Noodle Nibbles idle|long-body guard sway|no-size-drift|not playable" output/animation-preflight/noodle-nibbles-animation-plan.json output/animation-preflight/noodle-nibbles-animation-plan.html test/fighter-animation-preflight.test.ts src/assets/fighterAnimationPreflight.ts`
- Pass: protected diff guard for generated fighter assets, audio assets/source records, dependency files, sprite sizing, and frame data returned no changed files.

## Next Gate

T070 should be a read-only Judge review. If the hardened artifacts are sufficient, the next safe Worker can be an idle-row-only Noodle source asset generation task with no public/runtime promotion.
