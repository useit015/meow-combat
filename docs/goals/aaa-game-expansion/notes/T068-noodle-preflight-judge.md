# T068 - Noodle Preflight Judge

Result: done.

Decision: revise_preflight.

Full AAA outcome: incomplete.

## Assessment

T067 correctly moved the roster lane forward without generating assets or changing runtime exposure. The TypeScript preflight covers all required Noodle rows, keeps `ferret-noodle` source-only and not playable, requires exact 256x256 cells, and records no-size-drift/no-drift, identity, alpha, provenance, public-folder absence, and future smoke gates.

The preflight is not ready for idle-row imagegen yet because the committed JSON/HTML review artifacts do not fully preserve the row-production contract. The JSON row entries record only animation id, frame count, cell size, and facing. The HTML artifact shows a simplified acceptance summary. Both omit the row-generation brief, motion language, full acceptance criteria, and rejection triggers that are present in `src/assets/fighterAnimationPreflight.ts`.

That mismatch is a material no-slop risk. The next Worker should harden the review artifacts and tests before any imagegen task uses them as production input.

## Rejected Alternatives

- `approve_idle_worker`: rejected for now because the source-controlled artifacts are too easy to misread as the complete prompt contract.
- `ask_owner`: rejected because the owner already approved the roster-production lane and this is a local QA/receipt issue.
- `pause`: rejected because a safe non-raster Worker can close the gap immediately.

## Evidence

- `src/assets/fighterAnimationPreflight.ts` contains `rowGenerationBrief`, `motionLanguage`, `acceptanceCriteria`, and `rejectionTriggers` for Noodle rows.
- `output/animation-preflight/noodle-nibbles-animation-plan.json` omits those row-level production fields.
- `output/animation-preflight/noodle-nibbles-animation-plan.html` omits row-generation brief and rejection-trigger detail.
- `test ! -e public/assets/generated/fighters/ferret-noodle` still passes from T067.

## Next Worker

Create T069 as a bounded artifact-hardening Worker. It should make the Noodle JSON/HTML review artifacts mirror the full preflight object closely enough to drive future idle-row production, and add tests that fail if those fields are missing again.

The Worker must not run imagegen, create or edit raster assets, create a public `ferret-noodle` runtime folder, or touch roster/select/championship/runtime files, sprite sizing, frame data, hitboxes, damage, pushback, movement, audio, dependencies, source records, or lockfiles.
