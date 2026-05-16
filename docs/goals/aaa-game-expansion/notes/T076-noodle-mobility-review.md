# T076 - Noodle Mobility Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

Reviewed the accepted Noodle Nibbles / `ferret-noodle` source-only rows: `idle`, `walk-forward`, `walk-back`, `crouch`, and `jump`, plus the T071/T073/T075 QA receipts. The current set is good enough to continue source-only row production, but not good enough for runtime promotion.

The row set has clean alpha, exact 256px cell structure, and preserved source/public separation. The earlier production tasks also show the right rejection behavior: bad forward packing, near-standing crouch drift, jump shrink, and full-canvas jump trajectory candidates were rejected instead of waved through.

## Rationale

- Proceed: the accepted mobility set proves Noodle can hold idle, grounded movement, crouch compression, and jump extension without the global shrink that broke earlier candidates.
- Keep source-only: the rows still have visible pose-to-pose style and silhouette variation, so runtime promotion remains blocked until every required row is produced and reviewed together.
- Next package: generate `light-punch` and `light-kick` as starter attacks. They are the largest safe useful attack slice because they prove contact poses and limb extension without the heavier body-twist risk of `heavy-punch` or the effect/readability risk of `special`.

## Rejected Alternatives

- Repair before more generation: rejected because the accepted rows meet the current source-only QA gates and bad candidates were already rejected.
- Heavy-punch or special next: rejected because those rows ask for stronger body twist, identity-risking stretch, or signature-effect language before simple contact attacks are proven.
- Hitstun/blockstun/knockdown next: rejected because incoming-impact distortion should follow clean self-driven attack poses.
- Win/lose acting rows next: rejected because they are lower gameplay proof than starter attacks.
- Runtime promotion: rejected until all required Noodle rows pass source-only production, QA, manifest review, and browser smoke in a later promotion task.
- Parallel workers: rejected because `light-punch` and `light-kick` should share one QA report against the same Noodle baseline.

## Next Task

T077 should generate exactly two source-only Noodle starter attack rows with built-in imagegen only: `light-punch` and `light-kick`. Normalize `light-punch` to `1536x256` alpha and `light-kick` to `2048x256` alpha, compare both against accepted idle/locomotion/mobility baselines, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification

- Pass: viewed `assets/source/imagegen/fighters/ferret-noodle/idle.png`, `walk-forward.png`, `walk-back.png`, `crouch.png`, and `jump.png`.
- Pass: reviewed T071/T073/T075 QA JSON evidence.
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `rg -n "light-punch|heavy-punch|light-kick|special|hitstun|blockstun|knockdown|win|lose|ferret-noodle" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts`
- Pass: `ruby -e 'require "yaml"; YAML.load_file("docs/goals/aaa-game-expansion/state.yaml"); puts "state yaml ok"'`
