# T087 - Noodle Outcome Row Production

## Result

Accepted exactly two source-only Noodle Nibbles rows: `ferret-noodle:win` and `ferret-noodle:lose`.

- Win source row: `assets/source/imagegen/fighters/ferret-noodle/win.png`
- Lose source row: `assets/source/imagegen/fighters/ferret-noodle/lose.png`
- Win normalized proof: `output/imagegen/ferret-noodle-win-normalized.png`
- Lose normalized proof: `output/imagegen/ferret-noodle-lose-normalized.png`
- QA receipt: `output/animation-preflight/noodle-nibbles-outcome-row-qa.json`
- Visual receipt: `output/animation-preflight/noodle-nibbles-outcome-row-qa.html`

The accepted rows are exact `2048x256` for win and `1536x256` for lose, alpha-enabled, and source-only. Noodle remains not playable because `public/assets/generated/fighters/ferret-noodle` is still absent and no runtime roster, combat, frame-data, public asset, audio, dependency, or source-record files were changed.

## Candidate Review

- `win-codex-01.png` accepted: reads as a playful sock-trophy victory flourish without text props, confetti, magic, UI, or copied victory language.
- `lose-codex-01.png` rejected: the character stayed on-model, but baked wobble marks/effect lines violated the no-baked-effects rule.
- `lose-codex-02.png` accepted: reads as a gentle defeated seated slump without effect marks, gore, or object/sock-pile mutation.

## Processing

Accepted candidates were cleaned with the bundled chroma-key helper, vertically cropped from the tall chroma canvas, and normalized to exact expected output sizes.

Key hashes:

- Win candidate 01: `4718184346d1e78f7e45bc0006bcf1dbc19944c2cf76364d15fe4fe234fbabc3`
- Lose candidate 01 rejected: `83e85c4e29a460ff8e8844ecfb81a2bded3b0537b50a505c07c0a00e4d250aff`
- Lose candidate 02 accepted: `3277bdd6a78951191b7c409015efd5dbb74053f2fd4b2a0b1f76d46c9561cdcc`
- Win normalized/source row: `1017f847b85767e2b1404367d5e41ccaa8a7a130a608c1fa11c53bff2a2f5051`
- Lose normalized/source row: `a5f2175276bf06dff6fa6a44f6dbb702a592928f09ad92b976cf6a99c6f82fab`

## Alpha Bounds

| Row | Frame | Width | Height | Opaque pixels |
| --- | ---: | ---: | ---: | ---: |
| win | 1 | 155 | 188 | 16394 |
| win | 2 | 150 | 197 | 15888 |
| win | 3 | 133 | 202 | 15685 |
| win | 4 | 149 | 230 | 19147 |
| win | 5 | 155 | 198 | 16409 |
| win | 6 | 168 | 160 | 13737 |
| win | 7 | 141 | 206 | 15889 |
| win | 8 | 131 | 201 | 15288 |
| lose | 1 | 163 | 219 | 18988 |
| lose | 2 | 183 | 211 | 19047 |
| lose | 3 | 186 | 184 | 19194 |
| lose | 4 | 207 | 191 | 20436 |
| lose | 5 | 165 | 177 | 16758 |
| lose | 6 | 170 | 174 | 16784 |

## Verification Receipt

- Built-in Codex imagegen generated win candidate 01 and lose candidates 01/02; no external API, `.env`, CLI fallback, new dependency, or lockfile change was used.
- Bundled `remove_chroma_key.py` cleanup passed for both accepted rows.
- `node scripts/normalize-fighter-rows.mjs --animation win --fighters ferret-noodle` passed.
- `node scripts/normalize-fighter-rows.mjs --animation lose --fighters ferret-noodle` passed.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/win.png assets/source/imagegen/fighters/ferret-noodle/lose.png output/imagegen/ferret-noodle-win-normalized.png output/imagegen/ferret-noodle-lose-normalized.png` passed with exact dimensions and alpha.
- `node scripts/asset-qa.mjs --json` reported `checked: 168`, `runtimeReady: 112`, `needsNormalization: 56`.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `npm run typecheck` passed.
- Focused tests passed: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`.
- Full verification passed: `npm run verify` completed typecheck, 31 test files / 230 tests, and production build.
