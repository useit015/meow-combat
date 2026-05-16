# T086 - Noodle Knockdown Review

## Decision

Proceed with the next Worker task: generate exactly two source-only Noodle Nibbles outcome rows, `ferret-noodle:win` and `ferret-noodle:lose`.

The accepted `knockdown` row is good enough to keep moving. It is exact `2048x256`, alpha-enabled, source-only, and visually preserves Noodle's ferret face, teal scarf, belt pouches, sock props, and striped tail through a safe fall, curled grounded pose, and low recovery. The row intentionally lowers the silhouette through grounded frames while keeping body mass and character landmarks readable.

Runtime promotion remains blocked. Noodle still has missing required rows: `win` and `lose`; `public/assets/generated/fighters/ferret-noodle` remains absent, so the fighter stays not playable.

## Rejected Alternatives

- Repair first: rejected because T085 passed exact dimensions, alpha checks, focused tests, full verify, asset QA, and visual review.
- Win only next: rejected because `win` and `lose` share the same outcome-row acting QA profile and can be reviewed together without touching runtime.
- Lose only next: rejected because isolating one outcome row would slow the final source-only set closure without reducing a distinct technical risk.
- Runtime promotion: rejected until `win` and `lose` pass source-only production, QA, Judge approval, and a separate promotion/audit task.
- Parallel workers: rejected because the final outcome rows should share one scale/style decision and one source-only receipt.

## Next Worker Scope

Generate and QA exactly two source-only Noodle Nibbles / `ferret-noodle` rows: `win` and `lose`.

The rows should use built-in imagegen only, normalize `win` to exact `2048x256` and `lose` to exact `1536x256` transparent spritesheet form, compare against all accepted Noodle combat/movement rows, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification Receipt

- `view_image assets/source/imagegen/fighters/ferret-noodle/knockdown.png` passed visual review.
- `sed -n '1,180p' docs/goals/aaa-game-expansion/notes/T085-noodle-knockdown-row-production.md` passed.
- `sed -n '1,160p' output/animation-preflight/noodle-nibbles-knockdown-row-qa.json` passed.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `rg -n "win|lose|knockdown|ferret-noodle|source-only|not playable" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts docs/goals/aaa-game-expansion/state.yaml` passed.
