# T030 Pickles Locomotion Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly two source-only locomotion rows for `pugilist-pug` / Pickles Pugilist: `walk-forward` and `walk-back`. Both used built-in Codex imagegen, were normalized to exact alpha spritesheets, and remain source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `walk-forward` | `assets/source/imagegen/fighters/pugilist-pug/candidates/walk-forward-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/walk-forward.png` | `output/imagegen/pugilist-pug-walk-forward-normalized.png` | `2048x256`, alpha |
| `walk-back` | `assets/source/imagegen/fighters/pugilist-pug/candidates/walk-back-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/walk-back.png` | `output/imagegen/pugilist-pug-walk-back-normalized.png` | `2048x256`, alpha |

QA records:

- `output/animation-preflight/pickles-pugilist-locomotion-row-qa.json`
- `output/animation-preflight/pickles-pugilist-locomotion-row-qa.html`

## No-Drift QA

- `walk-forward`: pass. Forward pressure-step motion keeps Pickles upright, compact, and scale-stable against idle; gloves, muzzle, ears, tail curl, belt, palette, and silhouette remain consistent.
- `walk-back`: pass. Backward defensive shuffle remains grounded while preserving idle scale, head height, body width, gloves, muzzle, ears, tail curl, palette, and silhouette.
- Both rows: alpha pass, exact `2048x256`, 8 x `256x256`, no baked text/effects, no public/runtime promotion.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly three generated source-only Pickles rows: `idle`, `walk-forward`, and `walk-back`. All remaining Pickles rows remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `npm run typecheck`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/walk-forward.png assets/source/imagegen/fighters/pugilist-pug/walk-back.png output/imagegen/pugilist-pug-walk-forward-normalized.png output/imagegen/pugilist-pug-walk-back-normalized.png`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-locomotion-source-rows`

