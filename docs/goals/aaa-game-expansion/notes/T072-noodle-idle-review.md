# T072 - Noodle Idle Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

The accepted `ferret-noodle:idle` row is good enough to become Noodle Nibbles' scale reference. Visual review against the canonical model sheet keeps the core identity: tapered muzzle, rounded ears, bright eyes, teal scarf, belt and sock props, long ferret body, short legs, warm brown/cream palette, and ringed tail. The eight idle frames are not a runtime promotion; they remain source-only.

The QA receipt supports the visual read. The accepted source and normalized proof are exact `2048x256` alpha PNGs, frame heights stay within `228-230px`, frame widths stay within `116-131px`, visible green spill is `0` for every frame, and `public/assets/generated/fighters/ferret-noodle` remains absent.

## Approved Next Slice

Approve one Worker for exactly two source-only locomotion rows:

- `walk-forward`
- `walk-back`

This is the largest safe next package. Forward and backward walk rows share the same grounded gait, head-height, body-length, and tail-stability risks, so they should be generated and QA-reviewed together against the accepted idle baseline. Crouch/jump, attacks, reactions, win/lose, knockdown, runtime promotion, and public assets remain blocked.

## Rejected Alternatives

- Require idle repair: rejected because the row is stable enough and the QA evidence is clean.
- Single locomotion row only: rejected because forward/backward gait consistency is easier to judge as a pair.
- Crouch/jump package: rejected until grounded movement proves the idle scale reference under motion.
- Attack/reaction/win/lose package: rejected because these introduce stronger pose distortion before basic movement is locked.
- Runtime promotion: rejected until all required Noodle rows pass source-only production, QA, manifest review, and smoke in a later task.
- Parallel workers: rejected because both locomotion rows depend on one shared idle baseline and should share one QA report.

## Next Worker Guardrails

The next Worker must use built-in imagegen only, may accept at most three candidates per row, must normalize both rows to exact `2048x256` alpha PNGs, must compare both rows against `assets/source/imagegen/fighters/ferret-noodle/idle.png`, and must prove Noodle remains not playable with no `public/assets/generated/fighters/ferret-noodle` folder.
