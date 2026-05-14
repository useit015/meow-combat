# T059 Judge Decision: Next Combat Slice

## Decision

Choose `light-punch` rows for Atlas Lion and Sahara Viper as the next bounded content-production slice.

## Evidence

- T058 proves generated runtime sprites now cover `idle` and `walk-forward` for both fighters.
- `npm run imagegen:qa` reports four runtime-ready normalized rows: idle and walk-forward for both fighters.
- `src/assets/catalog.ts` still blocks attack rows, reaction rows, win/lose rows, and stage layers.
- The current playable combat shell still falls back procedurally for light attacks, which makes hit timing readable mechanically but not visually production-ready.

## Rationale

`light-punch` is the best next slice because it is the most frequently used attack input, has a smaller six-frame scope than heavy/special animations, and directly improves the player-visible combat loop. It should be generated and QA'd before approval, exactly like idle and walk-forward.

## Next Worker Shape

Generate one two-row `light-punch` candidate sheet through the Codex app imagegen path, split it into per-fighter rows, normalize to 6x256x256 cells, and mark the rows generated-but-unapproved if source quality is acceptable.

Do not approve runtime sprites in the same task; approval needs a separate visual audit.
