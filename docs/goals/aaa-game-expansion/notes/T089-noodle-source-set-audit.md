# T089 - Noodle Source Set Audit

## Result

The complete Noodle Nibbles source set is ready for a later runtime promotion prep task. No row repair is indicated by this audit.

Noodle remains source-only and not playable. The audit did not generate images, did not modify source assets, did not create public runtime files, and did not change gameplay, audio, dependencies, roster, frame data, sizing, or tests.

## Source Row Coverage

All 14 required `ferret-noodle` rows exist under `assets/source/imagegen/fighters/ferret-noodle/` with exact `256x256` cell-grid dimensions and alpha:

- `idle`: 8 frames, `2048x256`
- `walk-forward`: 8 frames, `2048x256`
- `walk-back`: 8 frames, `2048x256`
- `crouch`: 4 frames, `1024x256`
- `jump`: 6 frames, `1536x256`
- `light-punch`: 6 frames, `1536x256`
- `heavy-punch`: 8 frames, `2048x256`
- `light-kick`: 8 frames, `2048x256`
- `special`: 10 frames, `2560x256`
- `hitstun`: 5 frames, `1280x256`
- `blockstun`: 5 frames, `1280x256`
- `knockdown`: 8 frames, `2048x256`
- `win`: 8 frames, `2048x256`
- `lose`: 6 frames, `1536x256`

The machine-readable audit is in `output/animation-preflight/noodle-nibbles-source-set-audit.json`; the paired review HTML is `output/animation-preflight/noodle-nibbles-source-set-audit.html`.

## Truthfulness Checks

- `src/assets/catalog.ts` records all 14 Noodle rows as generated source outputs in the planned roster manifest.
- `animationSpecsFor("ferret-noodle", sourceOnlyAnimationBlocker)` still applies source-only blockers to Noodle animation specs.
- `test/asset-pipeline.test.ts` expects all 14 generated Noodle source rows while preserving planned roster status.
- `test/fighter-animation-preflight.test.ts` keeps Noodle `sourceOnly: true`, `playable: false`, `runtimeExposure: "not playable"`, and checks `public/assets/generated/fighters/ferret-noodle` remains absent.
- The runtime roster remains Gray Rabbit, Ginger Tabby Cat, and Pickles Pugilist.

## Recommendation

Proceed to a Judge review for runtime promotion prep. The next task should decide whether to approve a bounded promotion-prep Worker or hold for additional review, but this audit does not support a row repair task first.

Any promotion-prep task should still require byte-level source-to-public checks, explicit roster/runtime decisions, browser smoke tests, and a stop condition if Noodle becomes playable without complete approval.
