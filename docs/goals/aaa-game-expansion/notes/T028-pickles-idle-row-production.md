# T028 Pickles Idle Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly one source-only `idle` row for `pugilist-pug` / Pickles Pugilist using built-in Codex imagegen. It did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Asset

- Candidate: `assets/source/imagegen/fighters/pugilist-pug/candidates/idle-codex-01.png`
- Raw output copy: `output/imagegen/pugilist-pug-idle.png`
- Normalized proof: `output/imagegen/pugilist-pug-idle-normalized.png`
- Accepted source-only row: `assets/source/imagegen/fighters/pugilist-pug/idle.png`
- QA JSON: `output/animation-preflight/pickles-pugilist-idle-row-qa.json`
- QA HTML: `output/animation-preflight/pickles-pugilist-idle-row-qa.html`

The accepted row is an alpha PNG with exact `2048x256` dimensions: 8 frames at `256x256`.

## No-Drift QA

- Identity pass: wrinkles, round muzzle, folded ears, curled tail, red toy gloves, collar medallion, snack-belt, warm fawn palette, and compact pug boxer silhouette remain consistent.
- Scale pass: baseline/head height are stable in the candidate; normalized cells are exact `256x256`.
- Motion pass: row reads as subtle idle breathing/guard variation, not an attack or teleporting pose change.
- Alpha pass: normalized source has alpha and transparent corners.
- Source-only pass: `public/assets/generated/fighters/pugilist-pug` remains absent and Pickles is still not playable.

## Manifest/Test State

`src/assets/catalog.ts` now records only `pugilist-pug:idle` as a generated source-only animation row. All other Pickles rows remain blocked until later row-specific Workers. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `npm run typecheck`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/idle.png output/imagegen/pugilist-pug-idle-normalized.png`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-idle-source-row`

