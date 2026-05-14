# T093 Walk-Back Runtime Audit

## Decision

Choose `crouch` rows for Atlas Lion and Sahara Viper as the next bounded fighter-animation slice.

## Evidence

- `output/web-game/walk-back-runtime.png` proves the defensive retreat state now renders from generated sprites on the approved generated stage.
- Runtime-approved generated rows now cover `idle`, `walk-forward`, `walk-back`, `light-punch`, `heavy-punch`, `special`, `hitstun`, `blockstun`, and `knockdown` for both fighters.
- Remaining rows are `crouch`, `jump`, `light-kick`, `win`, and `lose`.
- `crouch` is already a real state in `src/core/simulation.ts` and maps to `crouch` in `src/assets/animationMap.ts`.
- `light-kick`, `win`, and `lose` are still manifest-only rather than currently playable command/shell states.

## Rationale

`crouch` is the best next slice because it improves an existing defensive/low stance with only four frames per fighter. It is smaller and lower risk than jump while still covering a real gameplay state used by the current input and blocking logic.

## Next Worker

Generate one two-row `crouch` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 4x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain separate tasks.
