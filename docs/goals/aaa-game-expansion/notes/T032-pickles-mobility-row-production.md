# T032 Pickles Mobility Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly two source-only mobility rows for `pugilist-pug` / Pickles Pugilist: `crouch` and `jump`. Both used built-in Codex imagegen, were normalized to exact alpha spritesheets, and remain source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `crouch` | `assets/source/imagegen/fighters/pugilist-pug/candidates/crouch-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/crouch.png` | `output/imagegen/pugilist-pug-crouch-normalized.png` | `1024x256`, alpha |
| `jump` | `assets/source/imagegen/fighters/pugilist-pug/candidates/jump-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/jump.png` | `output/imagegen/pugilist-pug-jump-normalized.png` | `1536x256`, alpha |

QA records:

- `output/animation-preflight/pickles-pugilist-mobility-row-qa.json`
- `output/animation-preflight/pickles-pugilist-mobility-row-qa.html`

## No-Drift QA

- `crouch`: pass. Low guarded squat stays two-legged and compact; gloves, muzzle, ears, belt, tail curl, palette, and silhouette match the accepted idle plus locomotion references.
- `jump`: pass. Small vertical hop keeps Pickles upright with tucked knees, no stretched limbs, and stable pug traits. The tall jump-cell scale matches the existing playable-fighter jump convention.
- Both rows: alpha pass, exact expected dimensions, no baked text/effects, no public/runtime promotion.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly five generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, and `jump`. All attack, reaction, KO, win, and lose rows remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation crouch --fighters pugilist-pug`
- `node scripts/normalize-fighter-rows.mjs --animation jump --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/crouch.png assets/source/imagegen/fighters/pugilist-pug/jump.png`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-mobility-source-rows`
