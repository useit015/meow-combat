# T002 Scout Aggregate Receipt

## Result

Parallel read-only discovery completed across architecture/game loop, controls/modes, imagegen asset pipeline, audio licensing, creative/data model, and verification/performance.

## Summary

The project is not a blank slate. It is already a production-oriented Vite + TypeScript + Phaser 4 browser fighting game with a deterministic 60 Hz combat core, Phaser rendering/input shell, 2 active Meowtal fighters, a courtyard arena, fighter select, 1 VS CPU, Training, HUD, round/match flow, keyboard/touch/gamepad input, generated runtime sprites/UI/stage assets, tests, asset manifests, and browser smoke scripts. The highest-leverage next work is not basic foundation. It is scaling toward the 8-fighter AAA direction through stronger original creative/data modeling, championship/story/mode structure, authored/sample-based audio, no-slop asset QA, and repeatable verification.

## Core Evidence

- `package.json`: Vite/TypeScript/Phaser app with `dev`, `build`, `preview`, `test`, `typecheck`, `verify`, `smoke:meowtal`, `imagegen:qa`.
- `src/main.ts`: creates 1024x576 Phaser CANVAS game with `Scale.FIT`.
- `src/core/simulation.ts`, `src/core/input.ts`, `src/core/frameData.ts`, `src/core/matchSet.ts`, `src/core/cpu.ts`: deterministic combat truth, input buffering, attacks, hit/block/knockdown, timer, rounds, CPU, match flow.
- `src/game/MeowtalArenaScene.ts`, `src/game/shellFlow.ts`, `src/game/gameConfig.ts`: shell phases, controls, selected fighters, rendering, audio playback, debug hooks, runtime config.
- `public/assets/generated/fighters/{gray-rabbit,ginger-tabby-cat}/`: approved runtime sprites for 14 required animation rows per active fighter.
- `public/assets/generated/stages/meowtal-courtyard/`: six generated parallax stage layers.
- `public/assets/generated/ui/meowtal/`: generated Meowtal UI sheets.
- `src/assets/catalog.ts`, `src/assets/types.ts`, `src/assets/readiness.ts`, `src/assets/meowtalProductionManifest.ts`, `src/assets/provenance.ts`: generated asset manifests, readiness, and provenance.
- `scripts/smoke-meowtal-browser.mjs`: Playwright smoke for desktop keyboard, training, gamepad, touch layouts, runtime UI, frame pacing, screenshots, and `report.json`.
- `test/**`: broad Vitest coverage; Scout observed `npm run typecheck` and `npm test` pass.

## Facts

- Current app already satisfies much of the T001 Tranche 1 foundation: 2 fighters, 1 arena, keyboard browser fighting, CPU, Training, HUD, match flow, generated assets, and tests.
- Runtime roster is only `GRAY_RABBIT` and `GINGER_TABBY_CAT`; target full direction is about 8 fighters.
- Current modes are 1 VS CPU and endless Training. No championship/story mode exists yet.
- Training is functional but minimal: endless sparring/dummy behavior without rich training options such as guard mode, reset positions, frame data, input display, or recording.
- Current runtime audio is procedural WebAudio, contradicting the owner preference against procedural sound as the primary audio direction.
- The imagegen pipeline is mature: source assets live under `assets/source/imagegen`, normalized/approved runtime assets under `public/assets/generated`, with QA/provenance/test support.
- Raw generated source rows intentionally vary in dimensions; approved runtime rows are normalized and runtime-ready. QA gates must distinguish raw source preservation from runtime acceptance.
- There is no dedicated source-controlled creative bible/story/championship data model.
- Existing branding `Meowtal Kombat` is a Mortal Kombat sound-alike and should be reviewed as an IP-safety risk before more title, announcer, story, or UI generation.
- Legacy Atlas Lion/Sahara Viper assets remain in manifests/assets but are not active runtime config fighters.
- CI runs `npm run verify` but not browser smoke or strict asset QA.
- Playwright is not installed in project dependencies; smoke can use external `PLAYWRIGHT_NODE_MODULES` per README.

## Contradictions And Judge Questions

- Current code already includes touch/gamepad support, while the current goal is keyboard-first browser v1 with touch/mobile v2. Judge should keep touch from distracting from keyboard feel, but may preserve existing coverage.
- Current runtime audio is procedural; Judge should decide whether authored/sample-based audio architecture is the first implementation priority.
- Current two-fighter vertical slice is strong; Judge should decide whether to run a fresh acceptance audit or proceed to a content/system expansion slice.
- Current asset QA strict mode fails raw source rows while normalized candidates/runtime rows are viable; Judge should clarify QA gate semantics.
- Judge should decide whether `Meowtal Kombat` must be renamed before more story/audio/UI generation.
- Judge should decide whether Atlas Lion/Sahara Viper are future roster candidates or legacy prototype content to quarantine.
- Judge should decide whether Pixabay music/SFX Content ID risk is acceptable for Tranche 1, and whether ElevenLabs is limited to SFX/TTS rather than Eleven Music.

## Candidate Work Domains

Strong candidates:

- Creative/data layer: add an expansion-ready 8-fighter bible/story/mode data model while preserving the 2-fighter runtime.
- Audio architecture: introduce manifest-backed authored/sample playback and source/license records, keeping procedural audio as fallback/dev-only.
- Championship/story shell: add a non-final data-driven championship/story shell using existing fight flow, without new assets.
- Asset QA/pipeline hardening: add stricter no-slop QA fields/checks for identity locks, model sheets, alpha/dimension variance, forbidden text/logos, and runtime promotion.
- Verification gate: formalize Tranche 1 proof with `typecheck`, tests, build, production preview smoke, screenshots/report, asset readiness, audio source policy.

Less suitable as first workers:

- Generating more final character art before model sheets/scale rules are locked.
- Expanding to all 8 runtime fighters before data/asset/audio standards are stable.
- Building all modes before the championship/story data structure and core loop boundaries are approved.
- Touch/mobile expansion before keyboard-first v1 priorities are settled.

## Candidate First Worker Slices

1. Expansion-ready creative/content bible:
   - Objective: add a source-controlled game bible/data layer for 8 original pet fighters, story hooks, move language, mode metadata, and IP-safety notes while keeping only the existing 2 fighters in runtime roster.
   - Likely files: `src/content/gameBible.ts`, `test/game-bible.test.ts`, possibly `src/game/gameConfig.ts`.
   - Verification: `npm run typecheck`, focused tests, `npm run verify`.

2. Sample-based audio architecture:
   - Objective: add audio manifest/source-record types and a sample-player abstraction behind existing cue mapping; keep procedural fallback optional/dev-only; do not acquire audio yet.
   - Likely files: `src/game/audio.ts`, `src/assets/provenance.ts`, `src/assets/meowtalProductionManifest.ts`, audio tests.
   - Verification: `npm run typecheck`, focused tests, `npm run verify`.

3. Championship/story shell:
   - Objective: add a non-final championship/story shell driven by data and existing fight flow, without new assets.
   - Likely files: `src/game/shellFlow.ts`, `src/game/MeowtalArenaScene.ts`, `src/game/gameConfig.ts`, shell/match-flow tests.
   - Verification: `npm run typecheck`, focused tests, `npm run verify`.

4. Asset pipeline hardening:
   - Objective: add no-slop manifest fields/checks for identity-lock references, pose roles, approved scale bounds, review status, no text/logos, and runtime promotion readiness.
   - Likely files: `src/assets/types.ts`, `src/assets/catalog.ts`, `src/assets/provenance.ts`, `scripts/asset-qa.mjs`, related tests.
   - Verification: `npm run typecheck`, focused asset tests, `npm run verify`.

## Recommended Next Step

Run T003 Judge integration before implementation. The Judge should choose one largest safe useful slice. A good default is the creative/content bible because it lets the project pursue 8 fighters and story without generating assets prematurely or changing combat behavior. Audio is the strongest competing choice because it directly resolves the procedural-audio mismatch.
