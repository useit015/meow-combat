# T067 - Noodle Nibbles Animation Preflight

Result: done.

Full AAA outcome: incomplete.

Owner decision: the owner answered `yes` on 2026-05-16, interpreted from the T066 gate as option B: proceed with roster production for the next fighter under strict no-size-drift, no-slop, candidate/source/public separation, and verification gates.

## Scope

Created a source-only animation-production preflight for Noodle Nibbles / `ferret-noodle`.

This task did not run imagegen, generate raster assets, edit existing fighter rows, create public/runtime Noodle assets, promote Noodle to the playable roster, or touch audio, dependencies, sprite sizing, placement, frame data, hitboxes, damage, pushback, or movement.

## Artifacts

- `src/assets/fighterAnimationPreflight.ts`
- `test/fighter-animation-preflight.test.ts`
- `output/animation-preflight/noodle-nibbles-animation-plan.json`
- `output/animation-preflight/noodle-nibbles-animation-plan.html`

The output artifacts are intentionally source-controlled for review even though the broader `output/` tree is ignored.

## Gates Recorded

- Noodle remains `source-only`, `not playable`, and has `publicRuntimePath: null`.
- Future rows must use exact 256x256 cells.
- Future row-generation is blocked behind no-size-drift/no-drift acceptance.
- The first accepted idle row must become the scale reference before locomotion, attack, reaction, or K.O. rows.
- Alpha bounds, identity traits, frame dimensions, provenance, public/runtime absence, and browser smoke are explicit promotion gates.
- `public/assets/generated/fighters/ferret-noodle` must remain absent until a separate promotion task approves runtime assets.

## Verification

- Pass: `npm run typecheck`
- Pass: `npm test -- test/fighter-animation-preflight.test.ts test/imagegen-jobs.test.ts test/source-roster-lab.test.ts test/game-config.test.ts` (4 files, 29 tests)
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `test -s output/animation-preflight/noodle-nibbles-animation-plan.json && test -s output/animation-preflight/noodle-nibbles-animation-plan.html`
- Pass: `npm run verify` (31 test files, 221 tests, build passed)
- Pass: protected diff guard for generated fighter assets, audio assets/source records, dependency files, sprite sizing, and frame data returned no changed files.

## Next Gate

T068 should be a read-only Judge review of this preflight before any imagegen or row production. If approved, the safest next Worker package should be only the Noodle idle row, because idle establishes the future scale baseline for all other rows.
