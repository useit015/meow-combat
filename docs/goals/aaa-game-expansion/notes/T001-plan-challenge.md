# T001 Plan Challenge Receipt

## Decision

Rejected the current broad execution plan as unsafe to execute directly. Routing decision: revise the board before Scout or Worker execution.

## Why

The brief asks for a full AAA-scale fighting game: about 8 fighters, story/championship, all core fighting modes, training, polished raster assets, authored audio, brutal/funny tone, and browser-first controls. Treating that as one tranche would likely produce shallow substitutions: too many characters, modes, and assets that exist on paper but feel inconsistent, glitchy, generic, or AI-sloppy.

AAA cannot honestly mean a shipped commercial AAA game inside one local automation pass. For this project it must mean a credible milestone program with AAA-grade standards applied to narrow playable slices.

## Top Risks

- Roster bloat before combat identity is proven.
- Mode sprawl before the core 1v1 loop, input feel, hit reactions, camera, and pacing are solid.
- AI-generated character drift across frames, poses, portraits, UI, and animation states.
- Unlicensed or weakly sourced audio creating legal/product risk.
- Generic Pokemon/KOF/MK mimicry instead of original IP-safe creative direction.
- Parallel workers diverging on tone, scale, sprite proportions, input semantics, or data contracts.

## AAA Standard For This Project

- A polished, original, playable vertical slice beats a broad but thin feature list.
- Minimum bar: responsive fighting feel, stable character identity, coherent world tone, polished UI/audio feedback, no broken animations, and no placeholder slop presented as final.
- References are inspiration only. Names, fighters, moves, story, audio, UI, and assets must be original and IP-safe.

## Creative Pillars

- Cute pet fighters with readable silhouettes and toy-like appeal.
- Brutal/funny combat where impact is stylized, exaggerated, and comedic rather than realistic gore.
- Each fighter needs a species concept, personality, fighting archetype, signature move language, arena tie-in, and story hook.
- Worldbuilding should support championship rivalry and pet-fighter fantasy without borrowing Pokemon gyms, KOF teams, MK fatalities, or Street Fighter character templates.

## Recommended Phasing

1. Tranche 1: polished vertical slice with 2 fighters, 1 arena, keyboard controls, local single-player versus/training loop, basic AI or dummy opponent, HUD, hit feedback, pause/restart, sample-based audio proof, and asset pipeline proof.
2. Tranche 2: expand to 4 fighters, stronger AI, championship shell, move lists, training options, character select, and round flow polish.
3. Tranche 3: expand toward 8 fighters, story/championship content, additional arenas, balance pass, and mobile/touch landscape controls.

Do not start all modes or all 8 fighters until Tranche 1 proves the combat, asset, animation, and audio standards.

## Animation Acceptance Criteria

- No size drift between frames unless intentionally animated by transform rules.
- No identity drift: same character proportions, markings, face shape, colors, and costume details across idle, walk, attack, hit, win, lose, portrait, and select art.
- No glitchy transitions, warped anatomy, flickering details, broken outlines, or unnatural motion.
- Every fighter needs a locked model sheet before production animation.
- Each shipped move needs readable anticipation, contact, hit pause/impact, recovery, and cancel/lockout behavior.
- AI-generated raster assets are acceptable only after manual curation and consistency verification.

## Parallelization Strategy

Parallel Scout domains:

- Existing project architecture and game loop constraints.
- Browser input/control options and fighting-engine feasibility.
- Asset pipeline options for imagegen model sheets, sprites, portraits, and background art.
- Audio source/license verification workflow for Pixabay, ElevenLabs, or similar.
- Data model needs for fighters, moves, arenas, story beats, and modes.

Safe Worker domains after specs exist:

- Combat prototype implementation after input/state contracts are defined.
- Roster bible drafting after creative pillars are locked.
- Asset pipeline scaffolding after style and dimensions are locked.
- Audio integration after license/source rules are defined.
- UI shell after mode/control scope is narrowed.

Unsafe to parallelize initially:

- Final character art before model sheets and scale rules exist.
- All 8 fighters before the 2-fighter vertical slice proves consistency.
- Multiple game modes before the core fight loop is validated.
- Touch/mobile controls before keyboard-first browser feel is accepted.
- Story production before original world/roster canon is approved.

## First-Tranche Proof Package

- Playable browser build with 2 original fighters, 1 arena, keyboard controls, round start/end, health, timer or win condition, restart, and training/dummy behavior.
- At least idle, move, attack, hit, and victory/defeat states with no visible identity or size drift.
- One-page roster/world bible proving originality and IP safety.
- Asset manifest showing generated/edited asset sources and which assets are final versus placeholder.
- Audio manifest with source, license, and usage notes.
- Verification notes with screenshots/video or browser test evidence covering gameplay, controls, animation stability, and no obvious layout overlap.

## Required Board Updates

- Mark T001 done as a planning challenge receipt, not approval to execute the broad plan.
- Add routing decision: revise_board.
- Add Scout tasks for architecture, controls, asset pipeline, audio licensing, creative bible/IP safety, and verification strategy.
- Add explicit Tranche 1 acceptance gate with the proof package above.
- Block broad Worker implementation until Scout findings and revised acceptance criteria are reviewed.
