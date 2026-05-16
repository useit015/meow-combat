# T080 - Noodle Defense Reaction Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

Reviewed the accepted Noodle Nibbles / `ferret-noodle` source-only rows through the defense/reaction package: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `light-kick`, `hitstun`, and `blockstun`.

The `hitstun` and `blockstun` rows are good enough to continue source-only production. `hitstun` gives a readable compact recoil peak without hit sparks or knockdown drift. `blockstun` keeps paws raised and reads as guarded impact rather than an attack. Both rows preserve the face, teal scarf, belt and sock props, long body, short legs, ringed tail, exact `1280x256` dimensions, alpha, and source-only separation.

They are not good enough for runtime promotion because `heavy-punch`, `special`, `knockdown`, `win`, and `lose` are still missing.

## Rationale

- Proceed: the accepted defense/reaction rows prove Noodle can absorb impact and return to guard without identity or size drift.
- Keep source-only: public/runtime `ferret-noodle` assets remain absent, and the full required row set is not complete.
- Next package: generate `heavy-punch` as a single source-only row. It is the next gameplay-critical missing attack and the safest next risk because it tests body twist and committed recovery before the higher-risk `special` row.

## Rejected Alternatives

- Repair first: rejected because the accepted defense rows pass exact dimensions, alpha, identity, recoil readability, and source-only gates.
- `special` next: rejected because signature move/effect language is higher risk for baked effects, copied move language, and identity drift; it should follow one heavy attack proof.
- `knockdown` next: rejected because prone/fall poses are more distortion-prone and should follow a heavier standing twist row.
- `win`/`lose` next: rejected because they are lower gameplay proof than finishing the core attack set.
- Runtime promotion: rejected until every required Noodle row passes source-only production, QA, manifest review, and smoke in a later task.
- Parallel workers: rejected because `heavy-punch` will decide body-twist tolerances that should inform `special` and `knockdown`.

## Next Task

T081 should generate exactly one source-only Noodle heavy attack row with built-in imagegen only: `heavy-punch`. Normalize it to `2048x256` alpha, compare it against accepted idle/locomotion/mobility/starter-attack/defense baselines, update only source/planned manifests and focused tests, and prove Noodle remains not playable with no public/runtime assets.

## Verification

- Pass: viewed `assets/source/imagegen/fighters/ferret-noodle/idle.png`, `light-punch.png`, `light-kick.png`, `hitstun.png`, and `blockstun.png`.
- Pass: reviewed T079 QA JSON and note evidence.
- Pass: `test ! -e public/assets/generated/fighters/ferret-noodle`
- Pass: `rg -n "heavy-punch|special|knockdown|win|lose|ferret-noodle|source-only|not playable" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts`
- Pass: `ruby -e 'require "yaml"; YAML.load_file("docs/goals/aaa-game-expansion/state.yaml"); puts "state yaml ok"'`
