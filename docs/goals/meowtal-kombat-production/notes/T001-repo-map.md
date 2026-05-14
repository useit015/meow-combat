# T001 Repo And Runtime Map

## Result

Scout completed read-only discovery for the Meowtal Kombat production-game goal.

## Current App Shape

- The repo is a Vite + TypeScript + Phaser browser fighting-game foundation, currently branded as `Atlas Arena`, not Meowtal Kombat.
- Package scripts in `package.json` include `dev`, `build`, `preview`, `test`, `typecheck`, `verify`, `imagegen:preflight`, and `imagegen:qa`.
- `src/main.ts` creates a 1024x576 Phaser CANVAS game with `Phaser.Scale.FIT`.
- `src/core/` owns the deterministic combat truth: fixed-step simulation, input buffering, attacks, hitboxes, hitstop, blockstun, knockdown, meter, timer, rounds, CPU, and match set.
- `src/game/MoroccanArenaScene.ts` owns rendering, input mapping, shell flow, audio, effects, HUD drawing, stage layers, runtime sprites, demo modes, and debug hooks.
- `src/assets/` owns generated-asset manifests, imagegen job specs, readiness, runtime asset resolution, animation mapping, and stage runtime layers.
- `window.render_game_to_text()` and `window.advanceTime(ms)` already exist through `MoroccanArenaScene`.

## Verification Health

- `npm run verify` passed: typecheck, 19 test files, 90 tests, and production build.
- `npm run imagegen:qa` passes as a command, but it reports 28 source rows needing normalization and 28 normalized runtime-ready rows.
- Web-game smoke against `http://127.0.0.1:5173/?demo=super` rendered successfully to `output/meowtal-scout/shot-0.png` with JSON state at `output/meowtal-scout/state-0.json`.
- Current state confirms runtime sprites, stage layers, audio status, match-set state, and debug hooks work.

## Current Product Gap

- The visible runtime is still `ATLAS ARENA` / `MARRAKESH ROOFTOP DUEL`.
- The only fighter definitions are `ATLAS_LION` and `SAHARA_VIPER` in `src/core/frameData.ts`.
- `src/game/MoroccanArenaScene.ts` hard-codes title/subtitle, Atlas/Sahara roster, concept sheet, runtime spritesheet paths, and many demo-mode assumptions.
- `src/assets/catalog.ts` defines Atlas/Sahara and Marrakesh rooftop assets, not gray rabbit, ginger tabby, or a bright courtyard arena.
- Existing runtime assets under `public/assets/generated/` are for Moroccan human fighters and Marrakesh rooftop, not Meowtal Kombat.
- The stage has parallax metadata, but `renderStageLayers()` currently toggles full-size fixed images and does not apply depth motion.
- HUD is procedural drawing, not a complete Meowtal production HUD/logo/menu asset pack.
- No repo asset/license/provenance manifest was found for external/generated final assets.

## Asset Risks

- Existing source fighter rows vary widely in dimensions, which proves the animation-generation/normalization pipeline needs strict same-character consistency gates.
- Current QA validates dimensions/alpha readiness but not species identity, markings, lighting, camera angle, scale, or style consistency.
- Existing assets are useful as pipeline precedent but cannot be used as final Meowtal content.

## Recommended First Slices

1. Extract hard-coded content into a small game config while preserving current behavior.
2. Add/switch original gray rabbit and ginger/orange tabby fighter definitions and display metadata through that config.
3. Scaffold Meowtal asset manifests, canonical-sheet prompts, provenance docs, and blocked/generated job specs.
4. Generate canonical character sheets before any animation rows.
5. Replace/implement parallax courtyard, logo/HUD/menu/overlay/control/particle asset pack, then rabbit/cat animation rows.
6. Run browser smoke and production build after each small slice, committing in coherent batches.

## Candidate Worker Slice

Preferred first Worker:

- Objective: Extract hard-coded title/subtitle/roster/stage/runtime asset list into a small data/config module while preserving current runtime behavior.
- Allowed files: `src/game/MoroccanArenaScene.ts`, `src/game/gameConfig.ts`, `test/game-config.test.ts`, `test/character-select.test.ts`.
- Verify: `npm run typecheck`, `npm test -- --run test/game-config.test.ts test/character-select.test.ts`, `npm run build`.
- Stop if: needing asset generation, broad renderer rewrite, or loss of `render_game_to_text` state fields.

