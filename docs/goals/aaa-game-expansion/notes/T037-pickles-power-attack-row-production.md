# T037 Pickles Power Attack Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly two source-only power/offense rows for `pugilist-pug` / Pickles Pugilist: `heavy-punch` and `special`. Both used built-in Codex imagegen, were chroma-key cleaned, normalized to exact alpha spritesheets, and remain source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Assets

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `heavy-punch` | `assets/source/imagegen/fighters/pugilist-pug/candidates/heavy-punch-codex-02.png` | `assets/source/imagegen/fighters/pugilist-pug/heavy-punch.png` | `output/imagegen/pugilist-pug-heavy-punch-normalized.png` | `2048x256`, alpha |
| `special` | `assets/source/imagegen/fighters/pugilist-pug/candidates/special-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/special.png` | `output/imagegen/pugilist-pug-special-normalized.png` | `2560x256`, alpha |

Rejected candidate:

- `assets/source/imagegen/fighters/pugilist-pug/candidates/heavy-punch-codex-01.png`: rejected after visual and normalization QA because the pose idea was usable but equal-slice normalization exposed stray disconnected glove fragments crossing frame boundaries.

QA records:

- `output/animation-preflight/pickles-pugilist-power-attack-row-qa.json`
- `output/animation-preflight/pickles-pugilist-power-attack-row-qa.html`

## Size-Lock QA

- Idle row body bounds: `166-168px` wide, `228px` high.
- Corrected T035 jump row body bounds: `153-163px` wide, `190-212px` high.
- `heavy-punch` body bounds: `164-233px` wide, `204-223px` high, `220px` average height. The wide frame is the intentional extended punch, not a global scale change.
- `special` body bounds: `152-200px` wide, `220-233px` high, `226px` average height. The side-on frames stay above the width floor and the row keeps Pickles' head, muzzle, gloves, belt, collar, tail, and body mass consistent.
- Both rows: alpha pass, exact expected dimensions, no baked projectiles/hit sparks/text/effects/logos/watermarks, no public/runtime promotion.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly nine generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, and `special`. `hitstun`, `blockstun`, `knockdown`, `win`, and `lose` remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation heavy-punch --fighters pugilist-pug`
- `node scripts/normalize-fighter-rows.mjs --animation special --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/heavy-punch.png assets/source/imagegen/fighters/pugilist-pug/special.png output/imagegen/pugilist-pug-heavy-punch-normalized.png output/imagegen/pugilist-pug-special-normalized.png`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-power-attacks-source-rows`

Verification results: focused tests passed (`4` files, `19` tests), full verify passed (`31` files, `206` tests), asset QA reported `130` checked / `74` runtime-ready / `56` needs-normalization, and browser smoke reported no failures.
