# T004 Judge Decision

Date: 2026-05-12

## Decision

Use a greenfield pure TypeScript combat core with a Phaser browser shell.

Rationale:

- T001 found Phaser has the strongest current browser-game foundation for this project: active, MIT, large ecosystem, TypeScript definitions, scene/input/animation/loader support, and source-backed web delivery.
- T002 found the workspace is empty, so no existing stack blocks a fresh scaffold.
- T003 found image generation is blocked until `OPENAI_API_KEY` is set, but the engine and asset-schema foundation can proceed safely with placeholders.
- A pure combat core protects future rollback compatibility by keeping deterministic game truth independent from Phaser's rendering and physics layers.

## Rejected Alternatives

- Directly fork a small browser fighting-game example: useful for reading, but too small or stale for production foundation.
- Excalibur first: good TypeScript engine, but smaller fighting-game ecosystem and 0.x warning make it a fallback.
- PixiJS-only greenfield: maximal control, but more first-slice plumbing than needed.
- Ikemen GO or Fray as dependencies: valuable architecture references, but not TypeScript/web foundations.
- Implement rollback now: explicitly out of first-tranche scope.

## First Worker Task

Objective:

Scaffold a TypeScript/Vite web game foundation with Phaser as the shell and a pure tested combat core for fixed-step ticking, input buffering, fighter state transitions, frame data, and hitbox/hurtbox resolution.

Allowed files:

- `package.json`
- `package-lock.json`
- `index.html`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`
- `src/**`
- `test/**`
- `public/**`

Verification:

- `npm install`
- `npm run typecheck`
- `npm test`
- `npm run build`

Stop if:

- Dependencies cannot install.
- A needed file falls outside the allowed files.
- Phaser dependency or Vite/Vitest setup conflicts with the TypeScript web platform constraint.
- The core implementation cannot keep combat truth independent from Phaser.
- Verification fails twice.

## Implementation Shape

- Core module:
  - fixed `TICK_RATE`
  - `InputBuffer` with per-frame snapshots and command detection
  - fighter types and explicit states
  - frame data for startup/active/recovery
  - rectangle hit/hurt volumes
  - `FightingSimulation` stepping both fighters
  - deterministic snapshots for future replay/rollback work

- Shell module:
  - Phaser boot scene that renders a minimal Moroccan-themed training stage with placeholder fighters
  - keyboard input mapping into the core
  - debug overlays for health/state/frame advantage/hitboxes

- Tests:
  - input buffer command recognition
  - state transition timing
  - hitbox collision and damage
  - deterministic replay from the same input sequence
