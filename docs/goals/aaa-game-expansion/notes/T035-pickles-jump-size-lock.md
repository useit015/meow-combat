# T035 Pickles Jump Size Lock

Result: done. Full AAA outcome remains incomplete.

The owner clarified that character size should not change. This Worker replaced the previously accepted `pugilist-pug` / Pickles Pugilist `jump` source row because the old row shrank Pickles globally (`144-158px` body height versus idle at `228px`). The replacement used built-in Codex imagegen only, was normalized to an exact alpha spritesheet, and remains source-only.

## Accepted Asset

| Row | Candidate | Accepted source | Normalized proof | Dimensions |
| --- | --- | --- | --- | --- |
| `jump` | `assets/source/imagegen/fighters/pugilist-pug/candidates/jump-size-lock-codex-02.png` | `assets/source/imagegen/fighters/pugilist-pug/jump.png` | `output/imagegen/pugilist-pug-jump-normalized.png` | `1536x256`, alpha |

Rejected candidate:

- `assets/source/imagegen/fighters/pugilist-pug/candidates/jump-size-lock-codex-01.png`: improved over the old jump but still undersized after normalization.

QA records:

- `output/animation-preflight/pickles-pugilist-jump-size-lock-qa.json`
- `output/animation-preflight/pickles-pugilist-jump-size-lock-qa.html`

## Size-Lock QA

- Idle row body bounds: `166-168px` wide, `228px` high.
- Previous jump row body bounds: `113-117px` wide, `144-158px` high. Rejected as global shrink.
- Replacement jump row body bounds: `153-163px` wide, `190-212px` high. Accepted because tucked-knee poses reduce silhouette height without shrinking head/glove/body scale.
- A focused test now fails if the Pickles generated jump row repeats the undersized pattern.

## Runtime Gate

This task did not use external APIs, `.env`, audio tools, new dependencies, runtime roster/select/combat changes, public fighter assets, or playable promotion. Runtime manifests still expose only Gray Rabbit and Ginger Tabby Cat.

## Verification

- `node scripts/normalize-fighter-rows.mjs --animation jump --fighters pugilist-pug`
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/jump.png output/imagegen/pugilist-pug-jump-normalized.png`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-qa.test.ts`
- `node scripts/asset-qa.mjs --json`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-jump-size-lock`
