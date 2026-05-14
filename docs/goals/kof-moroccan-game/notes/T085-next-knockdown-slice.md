# T085 Generated Stage Runtime Audit

## Decision

Choose `knockdown` rows for Atlas Lion and Sahara Viper as the next bounded fighter-animation slice.

## Evidence

- `output/web-game/stage-runtime.png` proves the generated Marrakesh Rooftop stage now renders live behind generated fighter sprites.
- Browser state reports all four stage layers as `kind=image-layer`, `sourceStatus=approved`, and `assetReadiness.runtimeFallbacks.stageLayers=0`.
- Remaining fighter rows are `walk-back`, `crouch`, `jump`, `light-kick`, `knockdown`, `win`, and `lose`.
- `src/core/simulation.ts` already enters `knockdown` when a defender reaches zero health.
- `src/assets/animationMap.ts` already maps the real `knockdown` combat state to the `knockdown` manifest row.
- `light-kick`, `win`, and `lose` are not currently mapped to playable command or shell states, so they are less direct as a runtime-improvement slice.

## Rationale

`knockdown` is the highest-leverage next slice because it improves the KO/combat-resolution moment in the existing engine with a bounded eight-frame row per fighter. Movement rows still matter, but the game now has enough neutral/attack/reaction/stage coverage that the missing fall/grounded recovery pose is the most visible combat feedback gap.

## Next Worker

Generate one two-row `knockdown` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 8x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain separate tasks.
