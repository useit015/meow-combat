# T085 - Noodle Knockdown Row Production

## Result

Accepted exactly one source-only Noodle Nibbles row: `ferret-noodle:knockdown`.

- Source row: `assets/source/imagegen/fighters/ferret-noodle/knockdown.png`
- Normalized proof: `output/imagegen/ferret-noodle-knockdown-normalized.png`
- Cleaned raw proof: `output/imagegen/ferret-noodle-knockdown.png`
- QA receipt: `output/animation-preflight/noodle-nibbles-knockdown-row-qa.json`
- Visual receipt: `output/animation-preflight/noodle-nibbles-knockdown-row-qa.html`

The accepted row is exact `2048x256`, alpha-enabled, and uses eight `256x256` cells. It remains source-only and not playable because `public/assets/generated/fighters/ferret-noodle` is still absent and no runtime roster, combat, frame-data, public asset, audio, dependency, or source-record files were changed.

## Candidate Review

- `knockdown-codex-01.png` accepted: the move reads as a safe loss of balance into a tumble, curled grounded pose, and low recovery while keeping Noodle's face, scarf, belt, sock props, and striped tail readable.
- `knockdown-codex-02.png` and `knockdown-codex-03.png` were not generated because the first candidate passed the quality bar.

## Processing

Candidate 01 was cleaned with the bundled chroma-key helper, vertically cropped from the tall chroma canvas to `2172x355`, and normalized to exact `2048x256` output.

Key hashes:

- Candidate 01: `f320e1a6ba81c4a8dc9dac426ea2a4a3511ba8b066ce035ce261166f8eaea3c5`
- Cleaned raw: `2b53195a82e2d1df89e953a8de1eb6df3e4c4b181c310f459a1740b72505ffdf`
- Normalized/source row: `d00e5025e85bd56cc5b2eff7f6c391f9649a3bac1f193d56a908a644957805a8`

## Alpha Bounds

The accepted row keeps full-body readability while intentionally lowering height through the grounded poses:

| Frame | Width | Height | Opaque pixels |
| --- | ---: | ---: | ---: |
| 1 | 180 | 216 | 17846 |
| 2 | 178 | 180 | 17727 |
| 3 | 168 | 151 | 16053 |
| 4 | 170 | 126 | 13767 |
| 5 | 160 | 103 | 11652 |
| 6 | 171 | 122 | 13846 |
| 7 | 162 | 111 | 10027 |
| 8 | 174 | 109 | 10477 |

## Verification Receipt

- Built-in Codex imagegen generated candidate 01; no external API, `.env`, CLI fallback, new dependency, or lockfile change was used.
- Bundled `remove_chroma_key.py` cleanup passed on candidate 01.
- `node scripts/normalize-fighter-rows.mjs --animation knockdown --fighters ferret-noodle` passed.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/knockdown.png output/imagegen/ferret-noodle-knockdown-normalized.png` passed with both rows at `2048x256` and alpha.
- `node scripts/asset-qa.mjs --json` reported `checked: 164`, `runtimeReady: 108`, `needsNormalization: 56`.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- `npm run typecheck` passed.
- Focused tests passed: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`.
- Full verification passed: `npm run verify` completed typecheck, 31 test files / 229 tests, and production build.
