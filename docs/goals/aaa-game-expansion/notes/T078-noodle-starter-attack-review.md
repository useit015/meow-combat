# T078 - Noodle Starter Attack Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

Reviewed the accepted Noodle Nibbles / `ferret-noodle` source-only starter attack rows, `light-punch` and `light-kick`, against the earlier idle, locomotion, and mobility baselines. The rows are good enough to continue source-only row production, but not good enough for runtime promotion.

`light-punch` gives a readable fast paw extension without changing the face, scarf, belt, sock props, or body mass. `light-kick` is especially important evidence because two long-leg candidates were rejected before the compact candidate was accepted. That rejection trail shows the current QA process is still catching contact-pose slop instead of accepting it.

## Rationale

- Proceed: starter attacks prove Noodle can move from guard into compact contact poses while keeping exact 256px cells, alpha, and source-only separation.
- Keep source-only: the fighter still lacks `heavy-punch`, `special`, `hitstun`, `blockstun`, `knockdown`, `win`, and `lose`, so runtime promotion remains blocked.
- Next package: generate `hitstun` and `blockstun` as a defense/reaction pair. They are the largest safe useful slice because both are short 5-frame incoming-impact rows and can share one strict no-spark/no-melting QA report.

## Rejected Alternatives

- Repair before more generation: rejected because T077 accepted only compact rows and preserved rejected long-leg evidence.
- Heavy-punch next: rejected because heavy body twist should follow proof that Noodle can recoil and guard under impact without melting.
- Special next: rejected because signature move/effect language is the highest risk for baked effects and copied fighting-game language.
- Knockdown next: rejected because prone/fall poses are more distortion-prone and should follow smaller hit/block reactions.
- Win/lose acting rows next: rejected because they are lower gameplay proof than defensive reactions.
- Runtime promotion: rejected until all required Noodle rows pass source-only production, QA, manifest review, and browser smoke in a later promotion task.
- Parallel workers: rejected because `hitstun` and `blockstun` share one impact/readability/identity-drift risk and should share one QA report.

## Next Task

T079 should generate exactly two source-only Noodle defense/reaction rows with built-in imagegen only: `hitstun` and `blockstun`. Normalize both to `1280x256` alpha, compare both against accepted idle/locomotion/mobility/starter-attack baselines, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification

- Pass: viewed `assets/source/imagegen/fighters/ferret-noodle/idle.png`, `light-punch.png`, and `light-kick.png`.
- Pass: reviewed T077 QA JSON and note evidence.
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `rg -n "hitstun|blockstun|heavy-punch|special|knockdown|win|lose|ferret-noodle" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts`
- Pass: `ruby -e 'require "yaml"; YAML.load_file("docs/goals/aaa-game-expansion/state.yaml"); puts "state yaml ok"'`
