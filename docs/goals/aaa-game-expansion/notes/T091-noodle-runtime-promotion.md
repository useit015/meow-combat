# T091 Noodle Runtime Promotion

Promoted Noodle Nibbles (`ferret-noodle`) from approved source rows to public/runtime as the fourth selectable fighter. No new Noodle images were generated, no rows were resized or normalized, and every promoted public PNG is byte-identical to its accepted source row from `assets/source/imagegen/fighters/ferret-noodle`.

## Runtime State

- Public runtime folder now exists: `public/assets/generated/fighters/ferret-noodle`.
- `src/assets/catalog.ts` routes all 14 Noodle rows as approved runtime sprites under `/assets/generated/fighters/ferret-noodle/*.png`.
- `src/game/gameConfig.ts`, `src/core/frameData.ts`, and content/tests now include Noodle as an active playable runtime fighter.
- Runtime roster truth is now 4 playable fighters and 4 planned locked fighters.
- The smoke script now includes a four-fighter promotion case that selects Noodle, fetches all 14 Noodle public rows, checks dynamic HUD portrait keys, and asserts zero fighter fallbacks.
- Other planned Pawbreaker fighters remain source-only planned entries.

## Source/Runtime SHA-256

| Row | SHA-256 |
| --- | --- |
| `idle` | `53a597097f3a687e9778fbd459d8a5fd7351cf4e2d34f16630d4c833b454eb19` |
| `walk-forward` | `83dc8d936baa753d55dedbb353417ff68216c8659a737165800407b3f203c068` |
| `walk-back` | `ca18a30755750294628f801b261760392144e557e17e67c6e60b9b532f515a37` |
| `crouch` | `0c2f355d5610200ae4f0535db1bfe7ec0612410453cbc1bf075d016caa1e191a` |
| `jump` | `4155304b8aad9d3c9a19e6d0e1be07605c4ca83b5ac7a5abea53a58ad7096933` |
| `light-punch` | `2f51c117f8f07b3f9cf7d9d90a575a9e8ad2659ab294906f584c5cca8ce13259` |
| `heavy-punch` | `2f3a5d72bd19ec51cdac562b5334d4ad4f3af29532e8c964d1213f3653d2d7d0` |
| `light-kick` | `24b43be6bb906f91dfc02dd4e9592cb517ac846798f97c8eed9d58b034c1824f` |
| `special` | `3bb313ff5e856cafc63e10780b2fc4d37bb5a7f819bfbbcfc9de7c349aeedd8c` |
| `hitstun` | `312aea1faf6b636870c4e9273dfcc5adca0f06b0d45511aeef07dc6bc83860c7` |
| `blockstun` | `dde796d27c35c471e98a8f884c19d2e2eb82a5ad2fcc77a92bc622e29a13abaa` |
| `knockdown` | `d00e5025e85bd56cc5b2eff7f6c391f9649a3bac1f193d56a908a644957805a8` |
| `win` | `1017f847b85767e2b1404367d5e41ccaa8a7a130a608c1fa11c53bff2a2f5051` |
| `lose` | `a5f2175276bf06dff6fa6a44f6dbb702a592928f09ad92b976cf6a99c6f82fab` |

`cmp -s` passed for every accepted source row against its promoted public runtime copy.

## Verification

- `test -d public/assets/generated/fighters/ferret-noodle` passed.
- Source/public byte-identity loop passed for all 14 Noodle rows.
- `node scripts/asset-qa.mjs --json` passed: `checked=168`, `runtimeReady=112`, `needsNormalization=56`; Noodle source and public rows report `runtime-ready`.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts test/source-roster-lab.test.ts test/character-select.test.ts test/asset-runtime.test.ts` passed: 7 files, 68 tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- Fresh `npm run verify` passed: 31 files, 233 tests, plus production build.
- `node --check scripts/smoke-meowtal-browser.mjs` passed.
- `PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/noodle-runtime-promotion` passed with `failures=[]`.
- Protected-diff check for dependencies, audio/source records, sprite sizing, and visual sizing produced no output.

## Browser Smoke Evidence

The four-fighter runtime promotion smoke selected Noodle as P1 against Pickles and verified:

- `runtimeVisuals.p1.assetKey`: `ferret-noodle:idle`
- `runtimeVisuals.p1.path`: `/assets/generated/fighters/ferret-noodle/idle.png`
- dynamic HUD portrait key: `ferret-noodle:idle`
- `assetReadiness.runtimeFallbacks.fighterAnimations`: `0`
- all 14 public Noodle PNG rows fetched successfully in-browser

Screenshots:

- `output/web-game/noodle-runtime-promotion/runtime-roster-noodle-pickles-select.png`
- `output/web-game/noodle-runtime-promotion/runtime-roster-noodle-pickles-fight.png`

The full AAA outcome remains active and incomplete.
