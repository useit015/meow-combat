# T001 Repo And Architecture Research

Date: 2026-05-12

## Ranked Candidates

1. [phaserjs/phaser](https://github.com/phaserjs/phaser) - strongest direct foundation for a TypeScript desktop web fighting game.
   - Evidence: README describes Phaser as an open-source HTML5 framework with WebGL/Canvas rendering, desktop/mobile browser support, JavaScript/TypeScript usage, scene architecture, loader, physics, animation, input, cameras, tilemaps, particles, tweens, API docs, examples, and first-class TypeScript definitions.
   - Current GitHub API snapshot: MIT, 39.6k stars, 7.1k forks, pushed 2026-04-30, open issues 102, not archived.
   - Fit: best production scaffolding for browser delivery; use Phaser for rendering/input/asset loading/scenes, but keep deterministic fighting simulation in our own pure TypeScript core.
   - Risk: Phaser physics are convenient but should not own fighter combat truth. Use custom hitboxes/hurtboxes and fixed-step simulation rather than Arcade/Matter physics for authoritative combat.

2. [excaliburjs/Excalibur](https://github.com/excaliburjs/Excalibur) - strong TypeScript-first alternative.
   - Evidence: README describes Excalibur as a free TypeScript 2D engine for HTML5 canvas; it handles boilerplate, cross-platform targeting, and is BSD-2-Clause for commercial projects.
   - Current GitHub API snapshot: BSD-2-Clause, 2.3k stars, 225 forks, pushed 2026-05-11, TypeScript, not archived.
   - Fit: good if the priority is a clean typed engine API and smaller community surface.
   - Risk: README warns the project is still 0.x and may have breaking API changes. Smaller ecosystem than Phaser.

3. [pixijs/pixijs](https://github.com/pixijs/pixijs) plus a custom simulation core - best greenfield renderer path.
   - Evidence: README positions PixiJS as a fast flexible 2D WebGL renderer; setup is `npm create pixi.js@latest` or `npm install pixi.js`; MIT licensed.
   - Current GitHub API snapshot: MIT, 47.2k stars, 5.0k forks, pushed 2026-05-07, TypeScript, not archived.
   - Fit: excellent renderer for generated sprite sheets, shaders, stage layers, and custom engine architecture.
   - Risk: not a game framework; we would need to own scene lifecycle, input, timing, asset orchestration, audio, and tooling.

4. [Pyxus/fray](https://github.com/Pyxus/fray) - architecture reference, not a dependency.
   - Evidence: docs describe combatant state management, complex input detection, input buffering, and hitbox organization. README calls out resource-based hierarchical state machines, composite inputs, and hitbox state managers.
   - Current GitHub API snapshot: MIT, 300 stars, 16 forks, pushed 2024-01-30, GDScript, not archived.
   - Fit: useful design pattern: split State, Input, and Hit modules that communicate through stable identifiers.
   - Risk: Godot/GDScript, alpha-state notes in README, not directly usable in TypeScript.

5. [ikemen-engine/Ikemen-GO](https://github.com/ikemen-engine/Ikemen-GO) - fighting-engine feature reference, not a direct web/TS foundation.
   - Evidence: README describes an open-source fighting engine supporting M.U.G.E.N resources, with releases for Windows/macOS/Linux and engine-development docs.
   - Current GitHub API snapshot: 1.3k stars, 206 forks, pushed 2026-05-10, Go, not archived. README says engine source is MIT, but bundled screenpack assets are Creative Commons and FFmpeg is LGPL-linked.
   - Fit: study how mature 2D fighter content is organized: characters, stages, commands, animation frames, screenpack/UI separation.
   - Risk: Go/native stack; MUGEN asset licensing can be messy and should not drive a new commercial asset pipeline.

6. [pond3r/ggpo](https://github.com/pond3r/ggpo) - rollback architecture reference only for first tranche.
   - Evidence: README explains rollback uses input prediction and speculative execution so offline timing/muscle memory translate online; MIT licensed.
   - Current GitHub API snapshot: MIT, 3.5k stars, 397 forks, pushed 2024-06-26, C++.
   - Fit: informs future rollback compatibility: deterministic simulation, input history, serializable state, replay/resimulation.
   - Risk: direct implementation is out of scope for first tranche and Windows/C++-oriented.

7. [piqnt/planck.js](https://github.com/piqnt/planck.js) - optional physics utility, not recommended for authoritative fighter combat.
   - Evidence: README says Planck.js is a JavaScript/TypeScript rewrite of Box2D for cross-platform HTML5 game development; MIT licensed.
   - Current GitHub API snapshot: MIT, 5.2k stars, 254 forks, pushed 2026-04-07, TypeScript.
   - Fit: could help with stage props or non-authoritative effects.
   - Risk: fighting games generally need frame-data hit volumes more than general rigid-body physics; physics determinism can complicate rollback readiness.

8. Browser fighter examples worth reading but not adopting:
   - [zkfazal/phaser-games](https://github.com/zkfazal/phaser-games): README describes "Brutal Brawl", a Phaser + ESBuild + TypeScript Street Fighter-like project. MIT, but very small and last pushed 2024-06-26.
   - [mkhandotnet/StreetPhyter](https://github.com/mkhandotnet/StreetPhyter): README describes an HTML5 fighting game in Phaser with walk/crouch/punch/kick, hadouken, health, and planned hitbox/hurtbox/blockstun work. No license detected, last pushed 2020-05-04, maintainer says it is not maintained. Read for pitfalls only.
   - [roundonejs/roundonejs.github.io](https://github.com/roundonejs/roundonejs.github.io): site says it loads MUGEN DEF/AIR/SFF/ACT files into canvas. No license detected, last pushed 2019-12-29. Useful only for understanding MUGEN file-shape ideas.

## Architecture Lessons

- Use a pure TypeScript combat core independent from the renderer. The core should model fixed ticks, fighters, command input history, state machines, animation frame data, hitboxes/hurtboxes, damage, stun, pushback, round rules, and deterministic snapshots.
- Let Phaser or Pixi render snapshots, play audio, load assets, and route browser input. Do not let the rendering engine's physics/collision system become the source of combat truth.
- Model fighter state with explicit state IDs and frame data: startup, active, recovery, cancel windows, invulnerability, hitstop, blockstun, knockdown, and transitions.
- Use an input buffer that records per-frame directional/buttons plus derived commands. Future rollback compatibility requires input history, state serialization, and deterministic replay.
- Store hitbox/hurtbox data as authored frame data tied to animation frames. Fray's module split suggests keeping Hit, Input, and State domains replaceable and testable.
- Keep generated assets downstream of engine data requirements. The imagegen pipeline should produce spritesheets and animation frame sets that conform to engine schemas, not force the engine to fit ad hoc art.
- Moroccan theming should enter the data model early: character archetype IDs, stage IDs, costume palettes, music/audio hooks, and UI copy/assets should be structured even before final art exists.

## Recommendation For Judge

Use a greenfield TypeScript combat core with Phaser as the browser/game-framework shell unless T002 discovers an incompatible local workspace. This gives the project:

- Production-friendly browser delivery and tooling.
- Strong ecosystem/docs/examples.
- Clear separation between deterministic combat logic and presentation.
- A path to generated assets through spritesheets and data-driven animation.
- Future rollback compatibility without implementing networking in the first tranche.

Fallback: if a smaller typed engine is preferred after workspace inspection, Excalibur is the best alternative. If maximal control is preferred and the team accepts more plumbing, PixiJS plus custom loop/input/audio wrappers is viable.

## Candidate Next Tasks

- T002 should inspect the local workspace for package manager, framework, tests, and whether a new Vite/TypeScript game scaffold is needed.
- T003 should define imagegen asset specs after the engine data model is known: per-character turnarounds, animation keys, frame counts, spritesheet sizes, transparent backgrounds, naming, and provenance.
- T004 should select the first Worker slice. Recommended first Worker slice: create or adapt a TypeScript project with a pure combat-core module and tests for fixed-step ticking, input buffering, state transitions, and hitbox collision, plus a minimal renderer shell only if workspace setup supports it.
