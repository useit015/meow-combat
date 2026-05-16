# T041 Pickles Lose Row Production

Result: done. Full AAA outcome remains incomplete.

This Worker generated exactly one source-only defeated/end-state row for `pugilist-pug` / Pickles Pugilist: `lose`. It used built-in Codex imagegen, was chroma-key cleaned, normalized to an exact alpha spritesheet, and remains source-only. This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion.

## Accepted Asset

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `lose` | `assets/source/imagegen/fighters/pugilist-pug/candidates/lose-codex-02.png` | `assets/source/imagegen/fighters/pugilist-pug/lose.png` | `output/imagegen/pugilist-pug-lose-normalized.png` | `1536x256`, alpha |

Rejected candidate:

- `assets/source/imagegen/fighters/pugilist-pug/candidates/lose-codex-01.png`: rejected because it included a detached breath puff and motion/vibration marks, which T040 forbids for collapsed/end-state rows.

QA records:

- `output/animation-preflight/pickles-pugilist-lose-row-qa.json`
- `output/animation-preflight/pickles-pugilist-lose-row-qa.html`

## Size-Lock QA

- T040 `lose` rubric: `150-210px` wide, no frame below `195px` tall, average height at least `205px`, opaque pixels at least `20000` per frame, average opaque pixels at least `22500`, no prone/flat/sleeping/crawling pose, no detached effects.
- `lose` body bounds: `160-165px` wide, `225-232px` high, `229px` average height.
- `lose` opaque pixels: `25574-26709` per frame, `26182` average.
- Visual review: `lose-codex-02` stays upright/full-scale with slumped shoulders and lowered gloves; it is not prone, sleeping, crawling, flattened, or tiny-in-frame. Head, muzzle, gloves, belt, collar, tail curl, feet, and body mass remain consistent with accepted rows.
- Judge review accepted T041. Caveat: runtime promotion remains separate; `knockdown` is still higher risk and must stay Judge-gated.

## Manifest/Test State

`src/assets/catalog.ts` now records exactly thirteen generated source-only Pickles rows: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, `special`, `hitstun`, `blockstun`, `win`, and `lose`. `knockdown` remains blocked. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation lose --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/lose.png output/imagegen/pugilist-pug-lose-normalized.png`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-lose-source-row`

Verification results: focused tests passed (`4` files, `22` tests), full verify passed (`31` files, `209` tests), asset QA reported `138` checked / `82` runtime-ready / `56` needs-normalization, and browser smoke reported no failures.
