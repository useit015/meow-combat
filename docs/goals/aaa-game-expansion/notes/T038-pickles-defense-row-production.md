# T038 Pickles Defense Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly two source-only defensive reaction rows for `pugilist-pug` / Pickles Pugilist: `hitstun` and `blockstun`. Both used built-in Codex imagegen, were chroma-key cleaned, normalized to exact alpha spritesheets, and remain source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `hitstun` | `assets/source/imagegen/fighters/pugilist-pug/candidates/hitstun-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/hitstun.png` | `output/imagegen/pugilist-pug-hitstun-normalized.png` | `1280x256`, alpha |
| `blockstun` | `assets/source/imagegen/fighters/pugilist-pug/candidates/blockstun-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/blockstun.png` | `output/imagegen/pugilist-pug-blockstun-normalized.png` | `1280x256`, alpha |

QA records:

- `output/animation-preflight/pickles-pugilist-defense-row-qa.json`
- `output/animation-preflight/pickles-pugilist-defense-row-qa.html`

## Size-Lock QA

- Idle row body bounds: `166-168px` wide, `228px` high.
- T037 `heavy-punch` body bounds: `164-233px` wide, `204-223px` high.
- T037 `special` body bounds: `152-200px` wide, `220-233px` high.
- `hitstun` body bounds: `161-218px` wide, `220-237px` high, `228px` average height. The wide frame is local recoil and arm spread, not global scale drift. A tiny detached mark above one raw candidate frame was removed by blank-margin crop before normalization.
- `blockstun` body bounds: `169-180px` wide, `227-231px` high, `230px` average height. The row keeps a full-size guard and braced stance.
- Both rows: alpha pass, exact expected dimensions, no baked hit sparks/text/effects/logos/watermarks, no public/runtime promotion.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly eleven generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, `special`, `hitstun`, and `blockstun`. `knockdown`, `win`, and `lose` remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation hitstun --fighters pugilist-pug`
- `node scripts/normalize-fighter-rows.mjs --animation blockstun --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/hitstun.png assets/source/imagegen/fighters/pugilist-pug/blockstun.png output/imagegen/pugilist-pug-hitstun-normalized.png output/imagegen/pugilist-pug-blockstun-normalized.png`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-defense-source-rows`
