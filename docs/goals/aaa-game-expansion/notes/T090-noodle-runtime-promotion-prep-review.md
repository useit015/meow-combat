# T090 - Noodle Runtime Promotion Prep Review

## Decision

Approve a bounded runtime/public promotion Worker for Noodle Nibbles. Do not repair rows first.

T089 gives enough evidence to proceed: every required `ferret-noodle` source row exists, each row has exact `256x256` cell-grid dimensions with alpha, catalog and tests still represent the rows truthfully as generated source-only assets, and `public/assets/generated/fighters/ferret-noodle` is absent before promotion.

This review does not promote Noodle by itself. Until the next Worker intentionally copies runtime files and updates runtime manifests, Noodle remains source-only and not playable.

## Rejected Alternatives

- Row repair first: rejected because the audit found all 14 required rows exact, alpha-enabled, cataloged, and source-only.
- Hold for another audit: rejected because T089 already provides source-row hashes, catalog/test truthfulness, public absence proof, asset QA, and full verify.
- Promote only public files without runtime truth updates: rejected because public assets, catalog, config, content, tests, and smoke must move together.
- Mark the full AAA goal complete: rejected because one additional runtime fighter is useful progress, not the complete AAA expansion.

## Required Worker Boundaries

The next Worker should promote Noodle in one coherent package:

- Copy only the 14 accepted source rows to `public/assets/generated/fighters/ferret-noodle/`.
- Keep every promoted PNG byte-identical to its accepted source row.
- Update runtime catalog/config/content/tests from source-only to promoted runtime state.
- Prove every Noodle runtime spritesheet loads without fallback rows.
- Do not generate, resize, normalize, crop, repaint, or otherwise alter any fighter row.
- Do not promote any other planned Pawbreaker fighter.
- Do not change audio, dependencies, source records, stage assets, or unrelated gameplay systems.
- Keep the full AAA outcome explicitly incomplete.

## Verification Receipt

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T089-noodle-source-set-audit.md` passed.
- `node -e 'JSON.parse(...)' output/animation-preflight/noodle-nibbles-source-set-audit.json` passed and reported `ready-for-runtime-promotion-prep`.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `rg -n "runtime promotion prep|source-only|not playable|ferret-noodle|Noodle Nibbles|full AAA outcome remains incomplete" ...` passed.
- `git diff --name-only -- public/assets/generated/fighters package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/assets/catalog.ts test/asset-pipeline.test.ts test/fighter-animation-preflight.test.ts test/asset-qa.test.ts` produced no output.
