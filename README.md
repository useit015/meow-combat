# Atlas Arena

A Moroccan-themed, KOF-style TypeScript web fighting game with a deterministic combat core, Phaser shell, generated fighter sprites, a generated Marrakesh rooftop stage, and polished arcade presentation.

## Run

```bash
npm install
npm run dev
```

Open the local game at `http://127.0.0.1:5173/`.

The GoalBuddy board lives in `docs/goals/kof-moroccan-game/state.yaml`; the local board URL is recorded there.

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

Browser smoke proof used during development:

```bash
node /Users/oussmustaine/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url 'http://127.0.0.1:5173/?demo=win' --actions-json '{"steps":[{"buttons":[],"frames":3}]}' --iterations 1 --pause-ms 250 --screenshot-dir output/web-game
```

## Controls

- `Enter`: move from title to fighter select; start from fighter select; continue after round over.
- `A/D` or `B`: P1 movement, and P1 fighter choice on the select screen.
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

## Current Scope

Implemented locally:

- Deterministic TypeScript combat core with fixed-step snapshots.
- Phaser shell with title, fighter select, pause, round flow, match flow, HUD, and browser verification hooks.
- Product-branded `ATLAS ARENA` title/select presentation using approved generated stage art, transparent fighter showcases, arcade frames, and VS card composition instead of debug fallback geometry.
- Runtime-sprite fighter select cards using approved transparent idle sprites, with concept-sheet art retained only as a fallback.
- Atlas Lion and Sahara Viper fighter definitions.
- CPU sparring with deterministic difficulty profiles.
- Hit/block effects, camera impact feedback, procedural audio cues, low-volume procedural music, combo tracking, timer outcomes, score pips, and best-of-three match state.
- Generated Marrakesh rooftop stage layers rendered behind the fighters.
- Approved generated runtime sprites for every required fighter row: idle, walk-forward, walk-back, crouch, jump, light-punch, light-kick, heavy-punch, special, hitstun, blockstun, knockdown, win, and lose.
- Match-over presentation that renders winner `win` sprites and defeated fighter `lose` sprites.
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
- Runtime asset resolution: `src/assets/runtime.ts` and `src/assets/stageRuntime.ts`
- Readiness summary: `src/assets/readiness.ts`
- QA report: `npm run imagegen:qa`
- Runbook: `docs/imagegen-runbook.md`
