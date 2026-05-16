# T045 Pickles Runtime Promotion

Promoted Pickles Pugilist (`pugilist-pug`) from approved source rows to public/runtime as a selectable playable fighter. No new images were generated, no rows were resized or normalized, and every promoted runtime PNG is a byte-identical copy of the accepted source row from `assets/source/imagegen/fighters/pugilist-pug`.

## Runtime State

- Public runtime folder now exists: `public/assets/generated/fighters/pugilist-pug`.
- `src/assets/catalog.ts` routes all 14 Pickles rows as approved runtime sprites under `/assets/generated/fighters/pugilist-pug/*.png`.
- Pickles is included in the active runtime fighter manifests, game config roster, content bible runtime IDs, source roster lab runtime grouping, character-select tests, and runtime asset no-fallback tests.
- Other planned Pawbreaker fighters remain source-only planned entries.

## Source/Runtime SHA-256

| Row | SHA-256 |
| --- | --- |
| `idle` | `ee69da955091c7e10218fb1a192cf935e1863b669ae71f8308792e3b69df69e1` |
| `walk-forward` | `591f06436f4b7dfadf721a24b106cd33c521fd257d76a8dea42488fafe44d365` |
| `walk-back` | `391d9248426b1ef086dae206ae427e899a168fc4b6031f9a24959b7c6efc20ec` |
| `crouch` | `7c4c5c042875e6855a9ff79ce64752c975a6e762ad51b79db756f22e6ab18532` |
| `jump` | `33e41b2cc670507d71d7d78d87e66bd041170feb90082914dbcbecc0840a145c` |
| `light-punch` | `670e9cbf334dd63db01f50315e33ff1bde9ddfd73df7844d8d9d99f511d47de6` |
| `heavy-punch` | `e6f5437ea779513968ddd874a13030e48e5c62b8ef12ad781d0011a360c5abea` |
| `light-kick` | `09b02e271701156363a976002aec19c40949bd22a1021cc209637b2ac26739d3` |
| `special` | `223c0ada2eab934d1f8c847a2d41e9747bdbf6ef0e580c1a8021e87093294d7a` |
| `hitstun` | `300596498e77c9bef866d378080cebe2984a1f4b96b7e4646375742ad6ee02f0` |
| `blockstun` | `48d8b77dfad7615d5c216af133f6c9cda90a05d52189c6d4dc8aca381dbb57c3` |
| `knockdown` | `7537503735fe4661416fe9ca0624161e0f3bae5112b47b33786319711cffd51b` |
| `win` | `55bc7ab01570f3e9345b73b2993d8cfb40b9658c96c04231419e39d6a0befa9a` |
| `lose` | `09fc21e57beffc3679e5bc0b61092da0dd2b6d3b19fb7e8b964cacb7d9bcde68` |

`cmp -s` passed for every accepted source row against its promoted public runtime copy.

## Verification

- `test -d public/assets/generated/fighters/pugilist-pug` passed.
- `node scripts/asset-qa.mjs --json` passed: `checked=140`, `runtimeReady=84`, `needsNormalization=56`; Pickles source rows report `runtime-ready`.
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/asset-qa.test.ts test/game-config.test.ts test/source-roster-lab.test.ts test/character-select.test.ts test/asset-runtime.test.ts` passed: 7 files, 52 tests.
- `npm run typecheck` passed.
- `npm run build` passed.
