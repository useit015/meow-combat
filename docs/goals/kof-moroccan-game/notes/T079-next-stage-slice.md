# T079 Seven-Animation Runtime Audit

## Decision

Choose Marrakesh Rooftop stage layer candidates as the next bounded production-art slice.

## Evidence

- Runtime-approved generated fighter rows now cover `idle`, `walk-forward`, `light-punch`, `heavy-punch`, `special`, `hitstun`, and `blockstun` for both fighters.
- `output/web-game/special-runtime.png` and browser text state prove the L/Enter special command can render from generated sprites.
- `src/assets/catalog.ts` still marks all four Marrakesh Rooftop stage layers as blocked.
- `src/assets/stageRuntime.ts` already fails closed: generated or blocked stage layers stay procedural fallback until explicitly approved.
- The full goal asks for a Moroccan-themed production fighting game, and the current stage is still procedural rather than generated layered art.

## Rationale

The next biggest production gap is not another frequent attack row; it is the whole Moroccan stage presentation. Generating stage candidates improves the first-read identity of the game while staying bounded to four layer files. Runtime approval and Phaser image-layer rendering should remain separate so the project can QA layer readability before replacing the procedural fallback.

## Next Worker

Generate one candidate PNG for each Marrakesh Rooftop layer through the Codex app imagegen path, save the files under `assets/source/imagegen/stages/marrakesh-rooftop/` and `output/imagegen/stages/marrakesh-rooftop/`, mark the four stage layers generated-but-unapproved in the manifest, and verify job/readiness tests. The live game must continue to use procedural stage fallback until a later approval/integration task.
