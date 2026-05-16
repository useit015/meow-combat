# T044 Pickles Source Set Audit

## Result

Decision: `promote_pickles_source_rows`.

The complete Pickles Pugilist generated source-row set is approved for a separate bounded runtime/public promotion Worker. This is not a runtime promotion by itself, and the full AAA goal remains incomplete.

## Evidence

- Active board task: `T044`.
- Pickles source-row generation receipts `T028-T043` show staged source-only production, including `T035` replacing the undersized jump row after the owner clarified that character size must not change.
- Exact generated Pickles source-row count: `14`.
- Generated rows:
  - `idle`
  - `walk-forward`
  - `walk-back`
  - `crouch`
  - `jump`
  - `light-punch`
  - `heavy-punch`
  - `light-kick`
  - `special`
  - `hitstun`
  - `blockstun`
  - `knockdown`
  - `win`
  - `lose`
- Filesystem and catalog agree: `assets/source/imagegen/fighters/pugilist-pug/*.png` has exactly those `14` animation rows plus the canonical sheet, and `src/assets/catalog.ts` records all `14` as generated source rows.
- Required state coverage is complete for `REQUIRED_FIGHTER_ANIMATIONS`.
- Public/runtime Pickles is absent now: `public/assets/generated/fighters/pugilist-pug` does not exist.
- Runtime config roster remains `gray-rabbit`, `ginger-tabby-cat`.
- Asset QA reports `140` checked, `84` runtime-ready, `56` source rows needing normalization. Pickles contributes `14` source rows and `14` normalized candidates, all runtime-ready dimensions.

## Size And Quality Challenge

The audit found no current size-drift blocker.

Key metrics:

- `idle`: width `166-168`, height `228`
- corrected `jump`: width `153-163`, height `190-212`
- attacks/reactions: within accepted pose-driven ranges
- `lose`: width `160-165`, height `225-232`
- `knockdown`: full-size anchors and prone body rotation, not shrinkage

Visual review found no blocking identity drift, malformed frames, detached effects, or AI-slop artifacts. The only residual caveat is that `knockdown` uses the T043 mechanical pre-isolation provenance, which must remain documented.

## Next Worker

Create `T045` Worker: promote Pickles Pugilist source rows to public/runtime in one bounded package.

Worker boundaries:

- No new Pickles image generation.
- No regeneration.
- No resizing.
- No animation fixes unless runtime promotion exposes a verifiable blocker.
- Do not promote other Pawbreaker planned fighters.
- Do not mark the AAA goal complete.

Required verification:

```bash
test -d public/assets/generated/fighters/pugilist-pug
node scripts/asset-qa.mjs --json
npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts test/source-roster-lab.test.ts test/character-select.test.ts test/asset-runtime.test.ts
npm run typecheck
npm run build
npm run verify
PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-runtime-promotion
```
