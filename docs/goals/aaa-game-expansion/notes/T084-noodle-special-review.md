# T084 - Noodle Special Review

## Decision

Proceed with the next Worker task: generate exactly one source-only `ferret-noodle:knockdown` row.

The accepted `special` row is good enough to keep moving. It is exact `2560x256`, alpha-enabled, source-only, and visually preserves Noodle Nibbles' ferret identity, teal scarf, pouch belt, sock props, and striped tail through a readable feint-to-wraparound strike. The QA receipt records ten stable frames with no size drift, no detached magic/effect blob, no baked text, and no runtime exposure.

Runtime promotion remains blocked. Noodle still has missing required rows: `knockdown`, `win`, and `lose`; `public/assets/generated/fighters/ferret-noodle` remains absent, so the fighter stays not playable.

## Rejected Alternatives

- Repair first: rejected because T083 passed exact dimensions, alpha checks, focused tests, full verify, asset QA, and visual review.
- Win/lose next: rejected because they are lower gameplay proof than finishing the final combat-state row.
- Knockdown plus win/lose: rejected because prone/tumble anatomy and acting-result poses have different QA risks.
- Runtime promotion: rejected until every required Noodle row passes source-only production, QA, Judge approval, and a separate promotion task.
- Parallel workers: rejected because the knockdown row will set grounded/full-body readability tolerances that should inform the later win/lose rows.

## Next Worker Scope

Generate and QA exactly one source-only Noodle Nibbles / `ferret-noodle` row: `knockdown`.

The row should use built-in imagegen only, normalize to exact `2048x256` transparent spritesheet form, compare against accepted Noodle idle, locomotion, mobility, attack, special, and defense/reaction baselines, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification Receipt

- `view_image assets/source/imagegen/fighters/ferret-noodle/special.png` passed visual review.
- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T083-noodle-special-row-production.md` passed.
- `sed -n '1,180p' output/animation-preflight/noodle-nibbles-special-row-qa.json` passed.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `rg -n "knockdown|win|lose|special|ferret-noodle|source-only|not playable" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts docs/goals/aaa-game-expansion/state.yaml` passed.
