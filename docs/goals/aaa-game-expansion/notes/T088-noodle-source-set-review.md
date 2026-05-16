# T088 - Noodle Source Set Review

## Decision

Proceed with a source-set audit/readiness Worker before any runtime promotion.

The complete Noodle Nibbles source-only animation set is mechanically complete: every required row exists in `assets/source/imagegen/fighters/ferret-noodle/`, every source row reports exact expected dimensions with alpha, and `public/assets/generated/fighters/ferret-noodle` remains absent. T087 also preserved catalog truthfulness: the rows are generated source assets, not runtime-playable assets.

## Rejected Alternatives

- Repair first: rejected for now because the full source set passes dimensions, alpha, focused tests, full verify, and source-only public-folder gates.
- Direct runtime promotion: rejected because promotion should be a separate audited package with explicit source-set consistency, public asset, roster, and smoke-test acceptance.
- Parallel promotion prep and runtime wiring: rejected because runtime exposure should follow one completed source-set audit receipt.
- Marking the AAA goal complete: rejected because this only finishes one planned fighter's source row production.

## Next Worker Scope

Produce a read-only Noodle source-set audit/readiness package.

The Worker should not generate assets or promote runtime files. It should verify the complete source-only row set, record exact row dimensions/hash/readiness evidence, confirm catalog/test truthfulness, prove the runtime public folder is still absent, and decide whether the following task can safely be runtime promotion prep or must repair a row first.

## Verification Receipt

- `sips -g pixelWidth -g pixelHeight -g hasAlpha` over every Noodle source row passed with expected dimensions and alpha.
- `sed -n '1,180p' docs/goals/aaa-game-expansion/notes/T087-noodle-outcome-row-production.md` passed.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `rg -n "ferret-noodle|Noodle Nibbles|runtimeExposure|not playable|source-only|win|lose|knockdown" src/assets/catalog.ts src/assets/fighterAnimationPreflight.ts test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts docs/goals/aaa-game-expansion/state.yaml` passed.
- `node -e 'JSON.parse(...)' output/animation-preflight/noodle-nibbles-outcome-row-qa.json` passed.
