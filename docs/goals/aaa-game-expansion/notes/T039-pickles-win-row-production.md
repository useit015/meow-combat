# T039 Pickles Win Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly one source-only presentation row for `pugilist-pug` / Pickles Pugilist: `win`. It used built-in Codex imagegen, was chroma-key cleaned, normalized to an exact alpha spritesheet, and remains source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Asset

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `win` | `assets/source/imagegen/fighters/pugilist-pug/candidates/win-codex-01.png` | `assets/source/imagegen/fighters/pugilist-pug/win.png` | `output/imagegen/pugilist-pug-win-normalized.png` | `2048x256`, alpha |

QA records:

- `output/animation-preflight/pickles-pugilist-win-row-qa.json`
- `output/animation-preflight/pickles-pugilist-win-row-qa.html`

## Size-Lock QA

- Idle row body bounds: `166-168px` wide, `228px` high.
- T035 corrected jump row body bounds: `153-163px` wide, `190-212px` high.
- T037 `heavy-punch` body bounds: `164-233px` wide, `204-223px` high.
- T037 `special` body bounds: `152-200px` wide, `220-233px` high.
- T038 `hitstun` body bounds: `161-218px` wide, `220-237px` high.
- T038 `blockstun` body bounds: `169-180px` wide, `227-231px` high.
- `win` body bounds: `155-167px` wide, `221-226px` high, `224px` average height. The narrowest frame is a local guarded smile/wink compression, not global shrink. Head, muzzle, gloves, belt, collar, tail curl, feet, and body mass visually match the accepted rows.
- The row avoids props, confetti, trophies, text, logos, particles, speed lines, detached effects, and camera tricks.

Judge review accepted the row. Caveat: frame 5 is the narrowest at `155px`, but the visual read is local pose compression, not scale drift. Next rows, especially `knockdown` and `lose`, require a stricter prone/collapsed-pose rubric before generation.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly twelve generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, `special`, `hitstun`, `blockstun`, and `win`. `knockdown` and `lose` remain blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation win --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/win.png output/imagegen/pugilist-pug-win-normalized.png`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-win-source-row`

Verification results: focused tests passed (`4` files, `21` tests), full verify passed (`31` files, `208` tests), asset QA reported `136` checked / `80` runtime-ready / `56` needs-normalization, and browser smoke reported no failures.
