# T081 - Noodle Heavy-Punch Row Production

## Result

Accepted exactly one source-only Noodle Nibbles row: `ferret-noodle:heavy-punch`.

- Source row: `assets/source/imagegen/fighters/ferret-noodle/heavy-punch.png`
- Normalized proof: `output/imagegen/ferret-noodle-heavy-punch-normalized.png`
- Cleaned raw proof: `output/imagegen/ferret-noodle-heavy-punch.png`
- QA receipt: `output/animation-preflight/noodle-nibbles-heavy-punch-row-qa.json`
- Visual receipt: `output/animation-preflight/noodle-nibbles-heavy-punch-row-qa.html`

The accepted row is exact `2048x256`, alpha-enabled, and uses eight `256x256` cells. It remains source-only and not playable because `public/assets/generated/fighters/ferret-noodle` is still absent and no runtime roster, combat, frame-data, public asset, audio, dependency, or source-record files were changed.

## Candidate Review

- `heavy-punch-codex-01.png` rejected: chroma cleanup normalized through equal wide crops and shrank the character too much for the no-size-drift bar.
- `heavy-punch-codex-02.png` rejected: the contact/follow-through split a fist across a cell boundary, creating a detached limb artifact.
- `heavy-punch-codex-03.png` accepted: compact windup, contact, follow-through, and recovery read as a heavier hook while preserving Noodle's ferret face, teal scarf, pouch belt, striped tail, sock-props, and warm brown palette.

## Processing

Candidate 03 was cleaned with the bundled chroma-key helper, vertically cropped from the tall transparent canvas to `2172x355`, and repaired with one narrow transparent drawbox over the boundary artifact that would otherwise leave a detached fist in the next cell. The normalizer then produced exact `2048x256` output.

Key hashes:

- Candidate 01: `923124f9c2eac96155313eb9b78c94033b95d8c08fe1cad3128d21c28ecfc177`
- Candidate 02: `ce34fb517637bc0cc51b0ee101ef7f9528ee0507143b40051355a2b48d715306`
- Candidate 03: `6b992dab508da6d7f5cc3128b5d2d21bcaf2b8034984ccce78edb3e03114582a`
- Cleaned raw: `e486f2d2ed61c2b1b412d0de0ea0d52ddd03714a62c5d875c87c8ebb389a3d9a`
- Normalized/source row: `2f3a5d72bd19ec51cdac562b5334d4ad4f3af29532e8c964d1213f3653d2d7d0`

## Alpha Bounds

The accepted row has stable alpha bounds across the heavy-punch body twist:

| Frame | Width | Height | Alpha pixels |
| --- | ---: | ---: | ---: |
| 0 | 153 | 226 | 18768 |
| 1 | 161 | 219 | 19151 |
| 2 | 183 | 217 | 18812 |
| 3 | 185 | 212 | 18210 |
| 4 | 208 | 212 | 18794 |
| 5 | 182 | 218 | 18122 |
| 6 | 152 | 226 | 18821 |
| 7 | 154 | 226 | 18721 |

## Verification Receipt

- `node scripts/normalize-fighter-rows.mjs --animation heavy-punch --fighters ferret-noodle` passed.
- Bundled `remove_chroma_key.py` cleanup was used on candidate 03; no external API, `.env`, CLI fallback, new dependency, or lockfile change was used.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/heavy-punch.png output/imagegen/ferret-noodle-heavy-punch-normalized.png` passed with both rows at `2048x256` and alpha.
- `node scripts/asset-qa.mjs --json` reported `checked: 160`, `runtimeReady: 104`, `needsNormalization: 56`.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- Focused tests passed: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`.
- Full verification passed: `npm run verify` completed typecheck, 31 test files / 227 tests, and production build.
