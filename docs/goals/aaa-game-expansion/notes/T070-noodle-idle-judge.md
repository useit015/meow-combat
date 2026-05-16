# T070 - Noodle Idle Row Judge

Result: done.

Decision: approve_idle_worker.

Full AAA outcome: incomplete.

## Assessment

T069 fixed the T068 blocker. The source-controlled Noodle JSON artifact now includes `rowGenerationBrief`, `motionLanguage`, `acceptanceCriteria`, and `rejectionTriggers` for the idle row and every other required row. The HTML artifact exposes the same idle-row production contract for review, including the `Noodle Nibbles idle row-generation pass`, `long-body guard sway`, exact 256x256 cell requirement, no-size-drift/no-drift review, and rejection triggers.

It is now safe to start exactly one source-only idle-row production task. Idle is the correct first row because it becomes the future scale/reference baseline for Noodle; approving locomotion, attacks, reactions, or a full row batch before the idle baseline is accepted would multiply size-drift and identity-drift risk.

## Rejected Alternatives

- Generate multiple Noodle rows now: rejected because idle must be accepted first as the scale reference.
- Generate all rows now: rejected because one off-model interpretation could contaminate the whole source set.
- Runtime promotion: rejected until every required row is generated, QA-reviewed, normalized, manifest-updated, tested, and browser-smoked.
- Ask owner: rejected because the owner already approved the roster-production lane and this is a bounded local execution step.
- Parallel workers: rejected because every later row depends on the accepted idle baseline.

## Next Worker

Create T071 to generate and QA exactly one source-only Noodle Nibbles / `ferret-noodle` idle row with built-in imagegen only. The Worker must normalize it to exact `2048x256` alpha spritesheet form, record QA/provenance, update only source/planned manifests and tests, and prove Noodle remains not playable with no public/runtime assets.
