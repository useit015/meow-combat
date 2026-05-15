# Arcade Shell, Modes, Gameplay Depth, and Generated Assets

## Objective

Build a polished arcade-style game shell with a proper menu, character selection, training mode, 1 vs CPU mode, meaningful gameplay depth, and generated raster assets integrated into the project.

## Original Request

"We need multiple playing modes: training, 1 vs CPU, a proper menu character selection, ... use imagegen for assets."

## Intake Summary

- Input shape: `specific`
- Audience: the player using the local game app
- Authority: `requested`
- Proof type: `demo`
- Completion proof: a browser demo can navigate `menu -> character select -> training` and `menu -> character select -> 1 vs CPU`, showing generated assets integrated and gameplay depth such as CPU behavior, moves, scoring, or training affordances.
- Likely misfire: GoalBuddy could make attractive menus or standalone generated assets without producing a coherent playable arcade flow across both requested modes.
- Blind spots considered: generated assets can create review noise; the current repo/game state is unknown; gameplay depth needs proof in motion; CPU behavior and tuning should be meaningful without becoming a forever balancing project.
- Existing plan facts: add training mode, add 1 vs CPU mode, add a proper menu, add character selection, use imagegen for assets, prioritize a full arcade shell, include gameplay depth, and verify by browser demo.

## Goal Kind

`specific`

## Current Tranche

Discover the existing game structure, choose safe implementation slices, then keep implementing and verifying coherent batches until the full arcade shell works in-browser. The tranche is not complete until both requested flows are playable and demo-verified with generated assets integrated into the workspace.

## Non-Negotiable Constraints

- Use `imagegen` for new raster game assets during the `/goal` execution phase.
- Do not generate assets during goal prep; asset work belongs to a later active Worker task.
- Save any project-bound generated assets into the workspace, not only under `$CODEX_HOME`.
- Keep generated assets, dependency changes, gameplay foundation, verification fixes, and polish in small coherent batches where possible.
- Before each commit, check the staged diff and keep unrelated user or generated changes out of the commit unless explicitly requested.
- Preserve the requested modes: training and 1 vs CPU.
- Preserve a proper menu and character selection flow.
- Verify with browser/demo evidence, not only static screenshots or successful builds.

## Out of Scope For This Tranche

- Online multiplayer.
- Packaging or deployment outside the local project unless needed for verification.
- A large roster, campaign, save system, or exhaustive competitive balancing.
- Replacing the entire game architecture unless Scout and Judge find it is the safest route.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices. After each slice audit, advance the board to the next highest-leverage safe Worker task and continue.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/arcade-shell-modes-assets/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/arcade-shell-modes-assets/goal.md.
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
10. If generated raster assets are needed, use the `imagegen` skill and save final project-bound assets into the workspace.
11. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full original outcome is complete.
12. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome and records `full_outcome_complete: true`.
