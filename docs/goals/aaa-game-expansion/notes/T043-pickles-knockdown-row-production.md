# T043 Pickles Knockdown Row Production

## Result

Accepted exactly one source-only `knockdown` row for Pickles Pugilist.

The accepted row is a generated raster asset produced with built-in Codex imagegen, normalized to an exact `2048x256` alpha spritesheet with eight `256x256` frames. Pickles remains source-only and non-playable; no public runtime folder was created for `pugilist-pug`.

## Artifacts

- Candidate: `assets/source/imagegen/fighters/pugilist-pug/candidates/knockdown-codex-01.png`
  - Dimensions: `2172x724`
  - Alpha: no
  - SHA-256: `364706ffe985c78eb6fb23a62b337338529b15747158038f9739cc7a707ba159`
- Preisolated source: `output/imagegen/pugilist-pug-knockdown.png`
  - Dimensions: `2048x256`
  - Alpha: yes
  - SHA-256: `9226462ae72502e42c45997af45f93a92e9123504cc285e0c053391961469994`
- Normalized proof: `output/imagegen/pugilist-pug-knockdown-normalized.png`
  - Dimensions: `2048x256`
  - Alpha: yes
  - SHA-256: `7537503735fe4661416fe9ca0624161e0f3bae5112b47b33786319711cffd51b`
- Accepted source: `assets/source/imagegen/fighters/pugilist-pug/knockdown.png`
  - Dimensions: `2048x256`
  - Alpha: yes
  - SHA-256: `7537503735fe4661416fe9ca0624161e0f3bae5112b47b33786319711cffd51b`
- QA JSON: `output/animation-preflight/pickles-pugilist-knockdown-row-qa.json`
- QA HTML: `output/animation-preflight/pickles-pugilist-knockdown-row-qa.html`
- Smoke output: `output/web-game/pickles-knockdown-source-row/`

## Processing Notes

The candidate art was chroma-keyed, then mechanically isolated into eight fixed `256x256` cells before the existing normalize script ran. This was needed because a mixed upright-to-prone row can make the detector fall back to equal full-height slices, which shrinks prone frames. No drawing details, pose content, identity features, character markings, or runtime logic were edited.

No extra effects, props, dust clouds, shadows, text, logos, crop tricks, or zoom tricks were accepted.

## Size And Identity QA

Frame metrics from the accepted source:

| Frame | Width | Height | Opaque Pixels | Notes |
| --- | ---: | ---: | ---: | --- |
| 1 | 161 | 233 | 24544 | full-size upright anchor |
| 2 | 196 | 233 | 28289 | full-size falling anchor |
| 3 | 228 | 190 | 25827 | rotated body, still full-size |
| 4 | 237 | 163 | 26571 | sideways transition, still full-size |
| 5 | 238 | 128 | 22960 | true prone side-lying |
| 6 | 238 | 131 | 23162 | true prone side-lying |
| 7 | 236 | 128 | 22390 | true prone side-lying |
| 8 | 237 | 128 | 22836 | true prone side-lying |

Rubric result:

- Early full-size anchors: frames `1, 2`.
- Final true prone frames: frames `5, 6, 7, 8`.
- Tiny frame violations: none.
- Average opaque pixels: `24572`, above the `22500` minimum.
- Final prone width range: `236-238px`, inside the `210-245px` accepted range.
- Every frame below `195px` height is at least `228px` wide, proving rotated/prone scale rather than shrinkage.
- Edge-contact frames: none.

Visual rationale: Pickles keeps the same head, muzzle, wrinkles, ears, red gloves, belt medallion, feet, compact torso, and tail curl across the fall. The final frames read as the same full-size body rotated onto its side, not a smaller sprite.

## Manifest And Tests

- Added `knockdown` to `generatedAnimationRows["pugilist-pug"]` in `src/assets/catalog.ts`.
- Updated asset pipeline and asset QA expectations from `138/82/56` to `140/84/56`.
- Added a true-prone Pickles knockdown preflight test enforcing:
  - two early upright/falling full-size anchors,
  - at least two final prone frames,
  - no tiny width and height shrinkage,
  - average opaque pixels at or above `22500`.

## Verification

Commands run:

```bash
node scripts/normalize-fighter-rows.mjs --animation knockdown --fighters pugilist-pug
sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/pugilist-pug/knockdown.png output/imagegen/pugilist-pug-knockdown-normalized.png
npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts
node scripts/asset-qa.mjs --json
test ! -e public/assets/generated/fighters/pugilist-pug
npm run typecheck
npm run build
npm run verify
PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/pickles-knockdown-source-row
```

Results:

- Focused tests: passed, `4` files and `23` tests.
- Asset QA: passed, `140` checked, `84` runtime-ready, `56` source rows needing normalization.
- Public runtime gate: passed, `public/assets/generated/fighters/pugilist-pug` absent.
- Typecheck: passed.
- Build: passed.
- Full verify: passed, `31` files and `210` tests.
- Browser smoke: passed with no failures.

## Judge Review

Independent read-only audit accepted T043 with no blocking findings.

Judge evidence:

- `knockdown.png` is `2048x256`, RGBA alpha, 8 fixed `256x256` frames.
- Independent alpha-bounds check matched the QA: early anchors `1, 2`; final prone frames `5, 6, 7, 8`; no tiny frames; average opaque pixels `24572`.
- Final prone widths are `238, 238, 236, 237`, all within `210-245`, and opaque pixels are all `>=20000`.
- Catalog marks exactly `14` generated Pickles rows.
- No public/runtime Pickles folder exists; playable roster remains `gray-rabbit` and `ginger-tabby-cat`.
- Relevant knockdown rubric test passed.

Visual challenge result:

- The row reads as full-size body rotation, not shrinkage.
- Frames `1-2` anchor upright/falling scale; frames `3-4` rotate into impact; frames `5-8` hold true side-prone mass.
- Pug face, muzzle, gloves, belt, feet, and tail remain visible and consistent.
- No identity drift, crop/zoom hiding, detached effects, or glitchy pose jumps were found beyond acceptable held prone recovery frames.

Residual risk:

- QA records `rejected: []` because the first generated candidate passed. This is acceptable for T043, but provenance around mechanical pre-isolation must remain visible in review notes.
