# T063 Judge Decision: Next Fight-Readability Slice

## Decision

Choose `hitstun` rows for Atlas Lion and Sahara Viper as the next bounded content-production slice.

## Evidence

- T062 proves generated runtime sprites now cover `idle`, `walk-forward`, and `light-punch` for both fighters.
- `output/web-game/light-punch-runtime.png` shows a generated attack sprite in the browser.
- The combat core already emits hit events and hitstun states, but the fighter reaction art still falls back procedurally.
- `hitstun` has a bounded five-frame scope, smaller than heavy/special/knockdown, and directly improves player feedback when a light punch connects.

## Rationale

`hitstun` is the best next slice because the game now has a generated attack but not a generated response. Adding hit reaction candidates improves combat readability more than another neutral movement row and keeps the approval surface smaller than knockdown or special moves.

## Next Worker Shape

Generate one two-row `hitstun` candidate sheet through the Codex app imagegen path, split it into per-fighter rows, normalize to 5x256x256 cells, and mark the rows generated-but-unapproved if source quality is acceptable.

Do not approve runtime sprites in the same task; approval needs a separate visual audit.
