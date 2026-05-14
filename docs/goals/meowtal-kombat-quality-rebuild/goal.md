# Meowtal Kombat Quality Rebuild

## Objective

Prepare and execute a fresh GoalBuddy run that treats the previous Meowtal Kombat completion as rejected by the owner and raises the game to a visibly high-quality, cohesive, smooth, production-grade fighting game. The goal is not to satisfy a checklist; it is to make the game look and feel good enough that the owner no longer describes the quality as bad.

## Original Request

The owner rejected the prior completion: "i dont think so, quality is still bas use a new set_goal".

## Intake Summary

- Input shape: `recovery`
- Audience: the owner as the primary quality judge, plus players of the finished scoped game
- Authority: `requested`
- Proof type: `review`
- Completion proof: the game passes fresh technical verification and visual/browser capture review against a stricter quality rubric, with no obvious bad-looking character animation inconsistency, awkward composition, placeholder-feeling surfaces, mushy feel, or checklist-only production claims. Final completion requires a Judge receipt that explicitly addresses the owner's rejection and records `full_outcome_complete: true`.
- Likely misfire: repeating the previous mistake: marking the project complete because tests, provenance, and basic smoke checks pass while the actual visible game still feels low quality, visually inconsistent, stiff, or amateur.
- Blind spots considered:
  - The previous GoalBuddy board marked production complete, but the owner rejected visible quality. This new board must treat that as the most important evidence.
  - Asset existence is not enough; art direction, animation cohesion, pose readability, compositing, scale, lighting, and frame-to-frame consistency must be judged visually.
  - Smooth fighting-game feel needs real input, hit feedback, camera, effect timing, audio, transitions, and readable combat, not only deterministic tests.
  - Browser screenshots can pass smoke while still looking bad. The new run must use visual critique and strict acceptance gates.
  - The current normal stance rule remains: both fighters use the same upright two-legged normal gameplay convention; grounded/prone frames are only defeat/hit-reaction contexts.
  - Small commits remain mandatory.
- Existing plan facts:
  - Current repo has an implemented Phaser/Vite Meowtal Kombat game and a completed previous goal at `docs/goals/meowtal-kombat-production/`.
  - Previous final preview evidence exists under `output/web-game/meowtal-final-preview-t999/` and `output/web-game/meowtal-final-preview-flow-t999/`, but the owner does not accept it as quality-complete.
  - The game concept remains gray rabbit versus ginger/orange tabby cat in a bright parallax courtyard with flashy arcade fighting presentation.
  - Tough Love Arena remains the feel/polish benchmark, without copying its IP, art, UI, code, brand, or exact mechanics.

## Goal Kind

`recovery`

## Current Tranche

Recover from the rejected completion by first auditing the current game as a player-facing artifact, then choosing the smallest high-leverage rebuild slices that materially improve perceived quality. Continue through Scout, Judge, Worker, verification, and strict final audit until the visible result is clearly better than the rejected version and the owner-facing quality bar is satisfied.

## Non-Negotiable Constraints

- The previous `meowtal-kombat-production` completion is not accepted as sufficient quality.
- Do not call the goal complete merely because tests, build, smoke, manifests, or provenance pass.
- Treat the owner's visible-quality rejection as a blocking quality signal.
- Prefer real visual improvement over board bookkeeping.
- Use strict visual QA on screenshots and, where useful, generated/image assets before runtime promotion.
- Character animation must feel cohesive across each fighter's move set: identity, proportions, lighting, camera angle, scale, outline/detail level, pose mechanics, and stance convention must not drift.
- Both fighters must share the same upright two-legged normal gameplay stance convention. Grounded/prone poses are allowed only as K.O., defeat, or explicit hit reactions.
- The arena must remain layered parallax and should become more beautiful, readable, and less flat or awkward if the audit finds it weak.
- Improve combat feel and presentation timing, not only art files.
- Reuse proven libraries and project architecture where they help; replace or refactor brittle parts when the audit proves they are causing bad quality.
- Use current Codex capabilities, image generation skills, design/audit skills, browser verification, subagents, and available dependencies as needed during `/goal`.
- Commit and push in small, coherent batches.
- Do not store secrets in the repo.
- External assets must be owned, generated, procedural, or license-vetted with provenance.

## Quality Bar

The final game should pass a human visual/feel review at a much higher standard than the previous completion:

- The first screen should look composed, premium, and intentional.
- Character sprites should look like one coherent production set, not a collage of inconsistent generated poses.
- Animation poses should read cleanly in motion and still screenshots.
- Effects should add impact without hiding the fighters or HUD.
- HUD, menus, touch controls, and overlays should look integrated rather than pasted on.
- The game should feel responsive and satisfying in the browser, with fast restart/rematch flow.
- Captures should make the game look exciting without needing explanations.

## Stop Rule

Stop only when a final audit proves the full quality-rebuild outcome is complete.

Do not stop after planning, discovery, or a single verified slice when the broader owner outcome still has safe local follow-up slices.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/meowtal-kombat-quality-rebuild/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/meowtal-kombat-quality-rebuild/goal.md.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Run the bundled GoalBuddy update checker when available and mention a newer version without blocking.
4. Re-check the intake, especially the owner's rejected-quality signal and the likely misfire.
5. Work only on the active board task.
6. Assign Scout, Judge, Worker, or PM according to the task.
7. Write a compact task receipt.
8. Update the board.
9. If Judge selected a safe Worker task with `allowed_files`, `verify`, and `stop_if`, activate it and continue unless blocked.
10. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full quality-rebuild outcome is complete.
11. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the owner's rejection and records `full_outcome_complete: true`.
