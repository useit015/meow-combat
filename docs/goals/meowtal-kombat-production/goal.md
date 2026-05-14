# Meowtal Kombat Production Game

## Objective

Prepare and execute a continuous GoalBuddy run to turn the existing Meowtal Kombat concept into a polished, production-ready scoped fighting game with smooth gameplay, strong visual effects, proper assets, responsive controls, audio, arcade flow, production build readiness, and verification.

## Original Request

Make the app into a real production-ready and smooth game: create proper assets using current Codex capabilities, rethink the game architecture for smooth play and great effects, and use available resources, skills, dependencies, time, and subagents. The app should adapt the Meowtal Kombat concept: a fluffy ginger/orange cat fights a gray rabbit in an absurd, flashy Mortal Kombat-style animal fighting demo.

Owner clarification: the final product must be a full polished production-ready game for the defined scope, not an unfinished proof of concept, tech demo, or mostly visual mockup. The original word "demo" describes the compact roster/arena concept, not the quality bar.

## Intake Summary

- Input shape: `specific`
- Audience: players of the finished scoped game, plus future maintainers
- Authority: `requested`
- Proof type: `artifact`
- Completion proof: the game runs as a polished production build or production-preview build, passes relevant build/test/lint/smoke/browser checks, and has evidence showing the full scoped game loop: title/start flow, character presentation, fight start, movement, blocking/dashing, combos, specials, super/special meters, HUD/timer/health, pause/options, restart/rematch, K.O./victory, audio, effects, responsive desktop/mobile layout, and no obvious console/runtime/layout/performance failures.
- Likely misfire: shipping a flashy-looking proof of concept, asset showcase, or "good enough demo" without satisfying complete game flow, playable fighting-game feel, controls, responsiveness, effects, HUD, audio, combat mechanics, production build readiness, maintainable architecture, performance, and verification.
- Blind spots considered: visual board selected; improvement target is balanced across gameplay feel, visual spectacle/assets, and maintainable architecture; success proof requires production-build playable game, browser verification, and capture artifact; scope target is full arcade package; plan was challenged to remove unfinished-PoC/demo escape hatches.
- Existing plan facts: preserve the user-provided concept, including bright outdoor courtyard arena, gray rabbit and ginger/orange tabby cat, Mortal Kombat-inspired HUD, health bars, timer, special meters, FIGHT/K.O. announcements, hit sparks, energy auras, dust, screen shake, damage numbers, keyboard/gamepad controls, blocking/dashing, simple combo chains, unique attacks, specials, jump/knockback/bounce/ragdoll-like heavy-hit reactions.

## Goal Kind

`specific`

## Current Tranche

Discover the existing app shape, architecture, assets, rendering stack, and verification commands; then continuously complete safe verified implementation slices until the full original outcome is proven by a polished production-ready scoped game, production build/preview verification, and visual/browser/capture evidence.

## Non-Negotiable Constraints

- Do not treat planning or discovery as completion.
- Preserve and adapt the provided Meowtal Kombat concept.
- Prioritize actual playable feel over a static or decorative mockup.
- Treat "demo" wording in the original concept as compact content scope, not as permission to ship an unfinished PoC.
- Use relevant skills, dependencies, and subagents during `/goal`, not during `$goal-prep`.
- Use local visual board tracking for this goal.
- Keep implementation slices bounded and verified.
- Balance gameplay feel, visual spectacle, and architecture instead of optimizing only one.
- Completion must include a capture artifact and production-readiness evidence, not only code changes.
- Scope includes title/start flow, character presentation, pause/options, audio polish, keyboard controls, responsive/mobile-friendly controls, production build readiness, restart/rematch flow, and a richer arcade package around the core fight.
- External visual/audio assets must be generated, procedural, owned, or license-vetted; record source, license, prompt/tool, and usage in a repo asset/license manifest.
- No placeholder assets, broken menu states, silent critical interactions, overlapping HUD/text, console errors, missing run instructions, or "works only in dev by accident" completion.
- Production readiness requires a local production build or production preview, stable frame pacing for the implemented effects, graceful loading/fallback behavior, and readable controls on supported viewports.
- Commit work in small, coherent batches throughout implementation; do not save all production-game work for one large final commit.
- Character animation assets must look consistent across each fighter's move set. Reject completion if animation frames vary noticeably in species identity, costume/markings, body proportions, lighting, camera angle, scale, outline/detail level, or rendering style.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if the user asked for working software or automation and a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices. After each slice audit, advance the board to the next highest-leverage safe Worker task and continue.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/meowtal-kombat-production/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/meowtal-kombat-production/goal.md.
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
9. If Judge selected a safe Worker task with `allowed_files`, `verify`, and `stop_if`, activate it and continue unless blocked.
10. If a problem, suggestion, or follow-up should become a repo artifact, create an approved issue/PR or ask the operator whether to create one.
11. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full original outcome is complete.
12. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome and records `full_outcome_complete: true`.

Issue and PR handoffs are supporting artifacts. `state.yaml` remains authoritative, and every external artifact decision must be recorded in a task receipt.
