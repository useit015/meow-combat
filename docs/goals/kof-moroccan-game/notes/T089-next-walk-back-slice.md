# T089 Knockdown Runtime Audit

## Decision

Choose `walk-back` rows for Atlas Lion and Sahara Viper as the next bounded fighter-animation slice.

## Evidence

- `output/web-game/knockdown-runtime.png` proves the KO/knockdown state now renders from generated sprites on the approved generated stage.
- Runtime-approved generated rows now cover `idle`, `walk-forward`, `light-punch`, `heavy-punch`, `special`, `hitstun`, `blockstun`, and `knockdown` for both fighters.
- Remaining rows are `walk-back`, `crouch`, `jump`, `light-kick`, `win`, and `lose`.
- `walkBack` is already a real core state in `src/core/simulation.ts` and maps to `walk-back` in `src/assets/animationMap.ts`.
- `light-kick`, `win`, and `lose` are still manifest-only rather than currently playable command/shell states.

## Rationale

`walk-back` is the best next slice because defensive retreat is a common neutral-game action, it complements the already approved `walk-forward` row, and it is a bounded eight-frame scope. Crouch and jump remain important, but walk-back completes the most basic grounded movement pair first.

## Next Worker

Generate one two-row `walk-back` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 8x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain separate tasks.
