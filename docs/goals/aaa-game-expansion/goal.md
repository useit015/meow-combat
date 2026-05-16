# AAA Game Expansion

## Objective

Prepare and execute a GoalBuddy-driven transformation of the current project toward a real AAA-grade game program: richer characters, scenes, settings, controls, moves, story systems, visual/audio production quality, verification, and a credible production path rather than a superficial feature pass.

## Original Request

"we need to make this into a full AAA game with richer characters, scenes, settings, controls, moves, stories, ..."

## Intake Summary

- Input shape: `vague`
- Audience: player and project owner
- Authority: `requested`
- Proof type: `demo` with artifact and review evidence
- Completion proof: A playable polished local demo, a concrete content milestone inventory, and a before/after review checklist all show richer visuals, audio, UX, scenes/content, presentation, characters, controls, moves, settings, and story surface.
- Likely misfire: Producing a plan, superficial UI/theme pass, or scattered assets without a cohesive playable improvement path.
- Blind spots considered:
  - AAA scope must be translated into achievable local milestones.
  - The first tranche needs evidence from the existing project before implementation.
  - Success means a polished fighting game direction: KOF-style team/arena fighting quality, Street Fighter/Mortal Kombat-level impact inspiration, and Pokemon-like cute pet character appeal.
  - The owner prefers production polish and content scale as the first major improvement target.
  - The owner does not like procedural sounds; audio work should evaluate authored or sample-based programmatic alternatives instead of procedural synthesis.
  - Completion must include demo, content milestone, and review checklist evidence rather than just one proof type.
  - The owner chose not to pre-limit scope for this tranche; Scout and Judge should inspect first and then set practical implementation boundaries.
  - The owner explicitly requested `imagegen` for image asset generation.
  - The owner asked whether Pixabay, ElevenLabs, or similar services can be used for music and SFX.
  - The owner explicitly asked to review and challenge the plan before execution because the goal should not be mishandled.
  - A true AAA game is a production standard, not a single local patch; the first tranche must define a credible AAA-grade milestone strategy and reject shallow substitutions.
- Existing plan facts:
  - Genre: KOF-style fighting game with cute pet characters; "Pokemon meets KOF."
  - Gameplay references: King of Fighters, Street Fighter, Mortal Kombat for fighting/gameplay feel; Pokemon for cute character appeal.
  - Player fantasy: fighting Pokemon-like pets.
  - Hard negative: avoid AI slop.
  - Camera/view: KOF-style fighting presentation.
  - Main loop: championship with story behind it; moment-to-moment fighting.
  - Moves: KOF-style attacks adapted to each original pet character.
  - Initial characters: cat and rabbit with funny names to be created.
  - Roster target: about 8 original cute pet fighters, not only cat and rabbit.
  - Setting: normal 2026 with a fun twist.
  - Conflict and tone: funny, brutal/funny combat, original conflict to be invented.
  - Gore/violence: allowed when it is funny and fits the tone.
  - Production target: full AAA-quality ambition, browser now and mobile later.
  - Modes: championship/story, all core fighting modes, and single-player training mode.
  - Controls: keyboard-first for the first browser version; touch/mobile can come in v2.
  - Mobile orientation: landscape.
  - Performance target: visuals should be excellent while keeping decent performance.
  - Assets: AI-generated assets are acceptable as final assets if polished and non-sloppy.
  - Animation/character consistency: never ship glitchy animations, character size drift, weird frame-to-frame appearance changes, inconsistent character identity, or unnatural movements.
  - Attribution: acceptable for Pixabay-style assets.
  - Environment: owner says `ELEVENLABS_API_KEY` and `PIXABAY_KEY` are present in `.env` and approves using them, including normal quota/credit use.
  - Generation/API usage: quality-first rather than cost-conservative.
  - Visual direction, voice, music, character names, and story details: PM/Judge have creative freedom as long as the final game is good enough and avoids slop.
  - The owner asked how to speed implementation with multiple agents/subagents and what additional skills/resources are needed.

## Goal Kind

`open_ended`

## Current Tranche

The initial Judge challenge rejected one broad "full AAA game" tranche as unsafe because it would likely produce shallow, inconsistent, AI-sloppy output. The current execution plan is phased: first prove a credible AAA-grade local vertical slice standard, then scale toward the 8-fighter full-game direction.

Tranche 1 must discover the current project and prove the pipeline with a polished browser slice: 2 original fighters, 1 arena, keyboard controls, round start/end, health, timer or win condition, restart, training/dummy behavior, stable animation states, sample-based audio proof, asset/source manifests, and verification evidence. Continue only through safe, verified work packages; do not call the broad outcome complete until a final audit maps the result back to the full owner outcome.

## Non-Negotiable Constraints

- Follow the repository's existing technology, style, and asset pipeline unless a Judge task approves a bounded change.
- Preserve unrelated user or generated changes.
- Keep implementation slices reviewable and coherent.
- A read-only Judge plan-challenge gate must run before Scout discovery or any implementation.
- T001 completed that gate and rejected broad direct execution. Follow the revised Scout-first phased plan in `state.yaml`.
- Do not equate "AAA" with a larger asset pile; require production standards for game feel, art direction, audio direction, narrative integration, UX, performance, QA, and cohesive playable proof.
- If the first tranche cannot honestly deliver a full shipped AAA game, the board must frame the work as a credible AAA-grade milestone program and identify what remains beyond local automation.
- Treat KOF, Street Fighter, Mortal Kombat, and Pokemon as inspiration references only; create original characters, names, lore, moves, UI, audio, and visual assets.
- Avoid copyrighted/trademarked characters, logos, names, signature moves, announcer calls, music, UI layouts, or direct visual imitation from reference games.
- "No AI slop" is a hard quality bar: generated assets must be cohesive, intentional, artifact-checked, style-consistent, and rejected when they look generic, inconsistent, malformed, or low-effort.
- Target an 8-character original pet-fighter roster for the full game direction; phase implementation if needed, but do not call the broad outcome complete from a tiny proof slice alone.
- Design first implementation around keyboard/browser controls. Keep architecture extensible for touch/mobile v2, but do not let touch complexity delay the first high-quality browser version.
- Prefer landscape layout and composition for the fighting game experience.
- Include championship/story, core fighting modes, and single-player training in the product plan; if not all modes fit the first tranche, record what is deferred and why.
- Brutal/funny violence is allowed; gore must stay stylized, comic, and tone-appropriate rather than realistic shock content.
- Use `ELEVENLABS_API_KEY` and `PIXABAY_KEY` from `.env` when the selected task requires them, after verifying terms and recording source/license metadata.
- Use a quality-first generation strategy for image/audio assets and API-backed creation; do not accept lower-quality outputs merely to save credits when the selected task depends on asset polish.
- Character animation assets must preserve consistent silhouette, proportions, costume/markings, face identity, scale, and readable pose language across every frame. Reject or regenerate animation frames that show glitches, melted anatomy, size drift, identity drift, warped limbs, inconsistent details, or unnatural motion.
- Use parallel agents to accelerate only after the Judge plan-challenge defines the standard. Favor parallel read-only Scout tasks first. Use parallel Workers only when `state.yaml` proves disjoint write scopes, explicit allowed files, independent verification, and no shared unresolved design decision.
- Before dispatching parallel Workers, run or create a parallel plan that separates domains such as combat engine, touch controls, modes/UI, roster/data, generated visual assets, audio pipeline, story/content, and verification/performance.
- Do not parallelize core architecture decisions, shared schemas, combat-state ownership, or final art direction until a Judge task resolves them.
- Do not make procedural sound synthesis the primary audio direction unless the owner explicitly revises this preference.
- Treat programmatic audio alternatives as authored/sample-based playback, layering, adaptive mixing, stems, loops, and event-driven audio systems to be evaluated during Scout/Judge work.
- Pixabay, ElevenLabs, and similar audio sources may be used only after Scout/Judge verifies current commercial-use terms, plan/tier restrictions, attribution requirements, prohibited uses, and any Content ID or platform-claim risks.
- Every external or generated audio asset used in the game must have a source record with provider, creator/model where applicable, source URL or generation prompt, license/terms snapshot date, attribution requirement, and runtime destination path.
- ElevenLabs voice cloning or voice generation must not imitate real people or use uploaded voices unless the owner has the necessary rights/consent and the active plan/feature allows the intended use.
- Use the `imagegen` skill/tool path for raster image assets such as concept art, texture-like bitmaps, scene backdrops, sprites, character art, promotional images, or other generated bitmap visuals.
- Do not substitute SVG, CSS, canvas, or placeholder code for requested generated raster image assets unless Scout/Judge determine the existing project asset system requires repo-native vector/code assets.
- Scope boundaries should be evidence-led by Scout/Judge rather than preselected during intake.
- Every Worker slice still requires explicit allowed files, verification commands, and stop conditions before implementation.
- Commit work in small, coherent batches when commit work is requested or becomes part of the goal execution.
- Do not bundle unrelated implementation, generated assets, dependency changes, and verification fixes into one large commit.
- Before each commit, check the staged diff and keep unrelated changes out of the commit unless explicitly requested.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete for the current tranche.

Do not stop after planning, discovery, or Judge selection if safe Worker work can be activated.

Do not stop after a single verified Worker package when the broader owner outcome still has safe local follow-up work. Advance the board to the next highest-leverage safe Worker package and continue unless a phase, risk, rejected-verification, ambiguity, or final-completion review is due.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Slice Sizing

Safe means bounded, explicit, verified, and reversible. It does not mean tiny.

A good task is the largest safe useful slice.

Small is not the goal. Useful is the goal.

A Worker should finish the whole assigned slice. A Judge should judge the whole assigned slice. A PM should reorient the board when tasks are safe but not moving the outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/aaa-game-expansion/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/aaa-game-expansion/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Run the bundled GoalBuddy update checker when available and mention a newer version without blocking.
4. Re-check the intake: original request, input shape, authority, proof, blind spots, existing plan facts, and likely misfire.
5. Work only on the active board task.
6. Assign Scout, Judge, Worker, or PM according to the task.
7. Write a compact task receipt.
8. Update the board.
9. If safe local work remains, choose the next largest reversible Worker package and continue unless blocked.
10. Review at phase, risk, rejected-verification, ambiguity, or final-completion boundaries.
11. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome and records `full_outcome_complete: true`.
