# T067 Four-Animation Runtime Audit

## Decision

Choose `blockstun` rows for Atlas Lion and Sahara Viper as the next bounded content-production slice.

## Evidence

- Runtime-approved generated rows now cover `idle`, `walk-forward`, `light-punch`, and `hitstun` for both fighters.
- `output/web-game/hitstun-runtime.png` shows the generated attack/reaction loop in-browser: Atlas Lion connects and Sahara Viper renders the generated hitstun recoil pose.
- `npm run imagegen:qa` reports 16 generated fighter rows checked, 8 runtime-ready normalized candidates, and 8 raw source rows needing normalization.
- `src/assets/catalog.ts` still leaves `blockstun`, heavier attacks, kicks, special, knockdown, win/lose rows, and stage layers on procedural fallback.

## Rationale

`blockstun` is the best next slice because the game now has generated hit feedback but not generated guarded defense feedback. It is a five-frame scope like `hitstun`, improves combat readability immediately, and keeps the next Worker bounded before attempting larger heavy/special/knockdown or stage art.

## Next Worker

Generate one two-row `blockstun` candidate sheet through the Codex app imagegen path, split it into per-fighter source rows, normalize each row to 5x256x256 runtime-cell candidates, mark the rows generated-but-unapproved, and verify QA counts. Runtime approval and public sprite integration must remain a later Judge/Worker pair.
