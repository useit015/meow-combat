# T074 - Noodle Locomotion Review

Result: done.

Decision: proceed_with_worker.

Full AAA outcome: incomplete.

## Review

The accepted Noodle Nibbles source rows are good enough to continue source-only row production. The idle row remains the scale reference, while `walk-forward` and `walk-back` preserve the core identity and keep grounded movement readable: tapered muzzle, rounded ears, teal scarf, belt/sock props, long body, short legs, warm brown/cream palette, and ringed tail remain intact.

The T073 rejected-candidate evidence is a good sign rather than a blocker: `walk-forward-codex-01` was rejected for neighboring-frame tail fragments, and the accepted second candidate fixed that production flaw. The accepted rows are exact `2048x256` alpha PNGs, source-only, and absent from `public/assets/generated/fighters/ferret-noodle`.

## Approved Next Slice

Approve one Worker for exactly two source-only mobility rows:

- `crouch`
- `jump`

This is the largest safe next package. Crouch and jump are both mobility/posture rows that stress the accepted idle and locomotion scale baseline without introducing attack contact poses, hit reactions, knockdown, win/lose acting, or runtime promotion. They should be reviewed together because they test body compression and extension around the same character identity lock.

## Rejected Alternatives

- Require locomotion repair: rejected because the accepted rows are stable enough and the first bad forward candidate was correctly rejected.
- Starter attacks next: rejected until non-attack mobility proves the body can compress and extend without identity drift.
- Defense/reaction rows next: rejected because hit/block distortion should follow clean crouch/jump posture proof.
- Runtime promotion: rejected until every required Noodle row passes source-only production, QA, manifest review, and smoke in a later task.
- Parallel workers: rejected because crouch and jump share one scale/identity risk and should share one QA report.

## Next Worker Guardrails

The next Worker must use built-in imagegen only, may accept at most three candidates per row, must normalize crouch to exact `1024x256` alpha form and jump to exact `1536x256` alpha form, must compare both rows against `idle`, `walk-forward`, and `walk-back`, and must prove Noodle remains not playable with no `public/assets/generated/fighters/ferret-noodle` folder.
