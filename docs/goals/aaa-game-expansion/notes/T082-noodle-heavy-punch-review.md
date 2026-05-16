# T082 - Noodle Heavy-Punch Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

Reviewed the accepted Noodle Nibbles / `ferret-noodle` source-only rows through `heavy-punch`: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, `hitstun`, and `blockstun`.

The T081 heavy-punch row is good enough to continue. It is exact `2048x256`, alpha-enabled, source-only, and visually preserves Noodle's ferret face, teal scarf, pouch belt, striped tail, short legs, and compact mischievous silhouette. The body twist reads heavier than `light-punch` without body melt, detached limbs, copied move language, hit sparks, text, or a runtime/public asset leak.

It is not good enough for runtime promotion because `special`, `knockdown`, `win`, and `lose` are still missing.

## Rationale

- Proceed: `heavy-punch` proves a committed standing twist and recovery can preserve Noodle's identity and no-size-drift standard.
- Keep source-only: public/runtime `ferret-noodle` assets remain absent, and the full required row set is not complete.
- Next package: generate exactly `special` as a single source-only row. It is the next gameplay-critical row after attacks/reactions and should now use the heavy-punch body-twist proof to avoid melting, but it is too signature-risky to bundle with `knockdown` or acting rows.

## Rejected Alternatives

- Repair first: rejected because T081 passed exact dimensions, alpha, focused tests, asset QA, full `npm run verify`, and visual review.
- `knockdown` next: rejected for this step because prone/tumble poses have a different distortion risk and should follow the special row's identity/effects decision.
- `win`/`lose` next: rejected because they are lower gameplay proof than finishing the special/core combat row.
- `special` plus `knockdown`: rejected because signature-effect risk and grounded-pose risk are different QA profiles and should stay sequential.
- Runtime promotion: rejected until every required Noodle row passes source-only production, QA, manifest review, and smoke in a later task.
- Parallel workers: rejected because the `special` row will set effect/no-effect boundaries that should inform the remaining Noodle rows.

## Next Task

T083 should generate exactly one source-only Noodle special row with built-in imagegen only: `special`. Normalize it to exact `2560x256` alpha form, compare it against accepted idle/locomotion/mobility/attack/reaction baselines, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification

- Pass: viewed `assets/source/imagegen/fighters/ferret-noodle/heavy-punch.png`.
- Pass: reviewed T081 production note and heavy-punch QA JSON.
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `rg -n "special|knockdown|win|lose|heavy-punch|ferret-noodle|source-only|not playable" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts docs/goals/aaa-game-expansion/state.yaml`
- Pass: `ruby -e 'require "yaml"; YAML.load_file("docs/goals/aaa-game-expansion/state.yaml"); puts "state yaml ok"'`
