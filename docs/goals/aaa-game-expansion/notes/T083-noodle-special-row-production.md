# T083 - Noodle Special Row Production

## Result

Accepted exactly one source-only Noodle Nibbles row: `ferret-noodle:special`.

- Source row: `assets/source/imagegen/fighters/ferret-noodle/special.png`
- Normalized proof: `output/imagegen/ferret-noodle-special-normalized.png`
- Cleaned raw proof: `output/imagegen/ferret-noodle-special.png`
- QA receipt: `output/animation-preflight/noodle-nibbles-special-row-qa.json`
- Visual receipt: `output/animation-preflight/noodle-nibbles-special-row-qa.html`

The accepted row is exact `2560x256`, alpha-enabled, and uses ten `256x256` cells. It remains source-only and not playable because `public/assets/generated/fighters/ferret-noodle` is still absent and no runtime roster, combat, frame-data, public asset, audio, dependency, or source-record files were changed.

## Candidate Review

- `special-codex-01.png` accepted: the move reads as a grounded feint into a playful wraparound strike and recovery, with no detached magic, hit sparks, text, or copied fighting-game signature language.
- `special-codex-02.png` and `special-codex-03.png` were not generated because the first candidate passed the quality bar.

## Processing

Candidate 01 was cleaned with the bundled chroma-key helper, vertically cropped from the tall transparent canvas to `2172x301`, and normalized to exact `2560x256` output.

Key hashes:

- Candidate 01: `873162b206c00f6f1a124eec8efa10d9b270ca90d4d4a1e30f5312396754fb1a`
- Cleaned raw: `e0df9ec064fd726557c76f4c57ce2f2329441eb629dce7f6a64e6516586a7b21`
- Normalized/source row: `3bb313ff5e856cafc63e10780b2fc4d37bb5a7f819bfbbcfc9de7c349aeedd8c`

## Alpha Bounds

The accepted row has stable alpha bounds across the special feint and wraparound strike:

| Frame | Width | Height | Opaque pixels |
| --- | ---: | ---: | ---: |
| 0 | 147 | 221 | 17368 |
| 1 | 177 | 180 | 19180 |
| 2 | 165 | 205 | 17389 |
| 3 | 155 | 210 | 16926 |
| 4 | 200 | 202 | 19330 |
| 5 | 210 | 203 | 17053 |
| 6 | 154 | 197 | 17075 |
| 7 | 142 | 211 | 15992 |
| 8 | 140 | 212 | 15757 |
| 9 | 144 | 222 | 17141 |

## Verification Receipt

- `node scripts/normalize-fighter-rows.mjs --animation special --fighters ferret-noodle` passed.
- Bundled `remove_chroma_key.py` cleanup was used on candidate 01; no external API, `.env`, CLI fallback, new dependency, or lockfile change was used.
- `sips -g pixelWidth -g pixelHeight -g hasAlpha assets/source/imagegen/fighters/ferret-noodle/special.png output/imagegen/ferret-noodle-special-normalized.png` passed with both rows at `2560x256` and alpha.
- `node scripts/asset-qa.mjs --json` reported `checked: 162`, `runtimeReady: 106`, `needsNormalization: 56`.
- `test ! -e public/assets/generated/fighters/ferret-noodle` passed.
- Focused tests passed: `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts test/imagegen-jobs.test.ts test/asset-qa.test.ts`.
- Full verification passed: `npm run verify` completed typecheck, 31 test files / 228 tests, and production build.
