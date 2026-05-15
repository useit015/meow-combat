# Meowtal Kombat

A production-oriented TypeScript web fighting game where a gray rabbit and a ginger tabby cat clash in a bright parallax courtyard with generated fighter sprites, arcade HUD presentation, responsive controls, and repeatable production smoke checks.

## Run

```bash
npm install
npm run dev
```

Open the local game at `http://127.0.0.1:5173/`.

The active GoalBuddy board lives in `docs/goals/meowtal-kombat-production/state.yaml`; the local board URL is recorded there.

## Verify

```bash
npm run imagegen:qa
npm run verify
```

`npm run verify` runs typecheck, tests, and the production build. CI runs the same command from `.github/workflows/ci.yml`.

Production preview smoke for Meowtal Kombat:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

In another terminal, run the repeatable browser smoke:

```bash
PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/meowtal-smoke-local
```

The smoke captures desktop keyboard play plus phone portrait/landscape touch play, checks the control fallback line, pause/touch readability, missing runtime UI, and console/page errors, then writes screenshots and `report.json` into the chosen output directory. If Playwright is not already available, install it outside the repo once with `npm install --prefix /tmp/meowtal-playwright playwright@1.60.0` to avoid changing the project lockfile.

Useful focused commands:

```bash
npm run typecheck
npm test
npm run build
```

Repeatable browser smoke entrypoint:

```bash
npm run smoke:meowtal -- --url http://127.0.0.1:4173/ --out-dir output/web-game/meowtal-smoke-local
```

## Controls

- `Enter`: move from title to mode select, confirm mode, start from fighter select, and continue after round over.
- `A/D`, `B`, or arrow keys: choose Training or 1 VS CPU on mode select.
- `A/D` or `B`: P1 movement, and P1 fighter choice on the fighter select screen.
- `Arrow Left/Right`: P2 fighter choice on the select screen when manual controls are relevant.
- `Space` or `J`: light punch.
- `I`: light kick.
- `K`: heavy attack.
- `L`: special attack.
- `C`: toggle P2 CPU/manual mode.
- `V`: cycle CPU difficulty, easy/normal/hard.
- `P` or `Esc`: pause/resume.
- `F`: toggle fullscreen.
- `R`: reset to title.
- Touch controls appear on phone-sized portrait and landscape viewports.
- Gamepad detection is surfaced in-game; keyboard and phone touch remain the supported fallback when no gamepad is connected.

## Current Scope

Implemented locally:

- Deterministic TypeScript combat core with fixed-step snapshots.
- Phaser shell with title, fighter select, pause, round flow, match flow, HUD, and browser verification hooks.
- Explicit arcade mode flow with title, mode select, fighter select, 1 VS CPU, and endless Training sparring.
- Product-branded `MEOWTAL KOMBAT` title/select presentation using approved generated stage art, transparent fighter showcases, arcade frames, and VS card composition instead of debug fallback geometry.
- Runtime-sprite fighter select cards using approved transparent idle sprites, with concept-sheet art retained only as a fallback.
- Gray Rabbit and Ginger Tabby Cat fighter definitions with a shared upright two-legged normal stance convention.
- CPU sparring with deterministic difficulty profiles.
- Hit/block effects, camera impact feedback, procedural audio cues, low-volume procedural music, combo tracking, timer outcomes, score pips, and best-of-three match state.
- Generated bright Meowtal Courtyard parallax stage layers rendered behind and around the fighters.
- Approved generated runtime sprites for every required fighter row: idle, walk-forward, walk-back, crouch, jump, light-punch, light-kick, heavy-punch, special, hitstun, blockstun, knockdown, win, and lose.
- Match-over presentation that renders winner `win` sprites and defeated fighter `lose` sprites.
- Responsive phone portrait/landscape touch controls, keyboard controls, pause/reset affordances, and explicit gamepad fallback messaging.
- Asset manifests, imagegen job specs, QA reports, and readiness summaries showing zero blocked imagegen jobs and zero runtime fallbacks.
- Production build chunking that isolates the Phaser engine vendor chunk from the smaller game/application chunk.

Generated source rows and normalized runtime candidates are preserved under `assets/source/imagegen/...` and `output/imagegen/...`. Approved runtime assets live under `public/assets/generated/...`.

## Imagegen Pipeline

The integrated art was generated through the Codex app imagegen path and then normalized/approved through local QA. Do not try to extract Codex app auth into a shell key.

For reproducible CLI regeneration outside the Codex app imagegen path, set `OPENAI_API_KEY` locally and run:

```bash
npm run imagegen:preflight
```

Pipeline entry points:

- Fighter and stage manifests: `src/assets/catalog.ts`
- Imagegen jobs: `src/assets/imagegenJobs.ts`
- UI surface provenance: `src/assets/meowtalProductionManifest.ts`
- Runtime UI crop specs: `src/game/gameConfig.ts`
- Runtime asset resolution: `src/assets/runtime.ts` and `src/assets/stageRuntime.ts`
- Readiness summary: `src/assets/readiness.ts`
- QA report: `npm run imagegen:qa`
- Runbook: `docs/imagegen-runbook.md`
