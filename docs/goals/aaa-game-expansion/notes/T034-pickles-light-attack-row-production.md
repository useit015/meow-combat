# T034 Pickles Light Attack Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly two source-only starter attack rows for `pugilist-pug` / Pickles Pugilist: `light-punch` and `light-kick`. Both used built-in Codex imagegen, were normalized to exact alpha spritesheets, and remain source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `light-punch` | `assets/source/imagegen/fighters/pugilist-pug/candidates/light-punch-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/light-punch.png` | `output/imagegen/pugilist-pug-light-punch-normalized.png` | `1536x256`, alpha |
| `light-kick` | `assets/source/imagegen/fighters/pugilist-pug/candidates/light-kick-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/light-kick.png` | `output/imagegen/pugilist-pug-light-kick-normalized.png` | `2048x256`, alpha |

QA records:

- `output/animation-preflight/pickles-pugilist-light-attack-row-qa.json`
- `output/animation-preflight/pickles-pugilist-light-attack-row-qa.html`

## No-Drift QA

- `light-punch`: pass. The jab stays compact, grounded, and readable as a starter punch rather than a heavy/special. Pickles keeps stable gloves, muzzle, ears, belt, tail curl, palette, and silhouette.
- `light-kick`: pass. The kick remains low-to-mid, non-acrobatic, and balanced. Foot scale is readable without turning into an off-model gag.
- Both rows: alpha pass, exact expected dimensions, no baked hit sparks/text/effects, no public/runtime promotion.
- Size clarification: the owner confirmed character size should not change. A quick alpha-bounds audit found these light-attack rows remain near idle/grounded scale, but the previously accepted `jump` row is too small and must be replaced in the next corrective task before heavier attacks, reactions, or playable promotion.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly seven generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, and `light-kick`. Heavy, special, reaction, KO, win, and lose rows remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation light-punch --fighters pugilist-pug`
- `node scripts/normalize-fighter-rows.mjs --animation light-kick --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/light-punch.png assets/source/imagegen/fighters/pugilist-pug/light-kick.png`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-light-attacks-source-rows`
