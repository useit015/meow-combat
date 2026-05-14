# T071 Five-Animation Runtime Audit

## Decision

Choose `heavy-punch` rows for Atlas Lion and Sahara Viper as the next bounded content-production slice.

## Evidence

- Runtime-approved generated rows now cover `idle`, `walk-forward`, `light-punch`, `hitstun`, and `blockstun` for both fighters.
- `output/web-game/blockstun-runtime.png` and browser text state prove the generated defensive reaction row renders in Phaser.
- The K-key heavy attack already exists in the core controls and frame data, but its art still falls back procedurally.
- `light-kick` is still manifest-only and has no dedicated gameplay state/input mapping, so generating it next would not improve a currently playable action without extra engine work.
- Stage layers, special, knockdown, win/lose, and other movement rows remain incomplete.

## Rationale

`heavy-punch` is the best next slice because it improves a currently playable command with a bounded eight-frame scope. It gives the game a second generated attack weight after `light-punch`, while keeping the larger `special`, `knockdown`, and stage-art work deferred until their own QA cycles.

## Next Worker

Generate one two-row `heavy-punch` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 8x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain separate tasks.
