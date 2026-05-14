# T075 Six-Animation Runtime Audit

## Decision

Choose `special` rows for Atlas Lion and Sahara Viper as the next bounded content-production slice.

## Evidence

- Runtime-approved generated rows now cover `idle`, `walk-forward`, `light-punch`, `heavy-punch`, `hitstun`, and `blockstun` for both fighters.
- `output/web-game/heavy-punch-runtime.png` and browser text state prove the K-key heavy command renders from generated sprites.
- The L/Enter special command already exists in core frame data and maps to `specialAttack`.
- `src/assets/animationMap.ts` maps `specialAttack` to the `special` animation row, but the row still falls back procedurally.
- `light-kick` is currently manifest-only and would need gameplay/input work before it improves a playable action.
- Stage layers remain high-impact but are a larger presentation tranche than one bounded fighter-row slice.

## Rationale

`special` is the best next slice because it upgrades a currently playable command and carries the strongest Moroccan identity opportunity. It has a larger ten-frame scope than heavy-punch, but it remains bounded and fits the established generation-normalization-approval-runtime pipeline.

## Next Worker

Generate one two-row `special` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 10x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain separate tasks.
