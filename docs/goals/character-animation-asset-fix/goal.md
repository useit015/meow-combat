# Character Animation Asset Fix

## Objective

Fix the character animation and asset quality problems so actions such as jump keep a stable character size, and animations no longer make the character look blocky.

## Original Request

"some animations changes the charcter size like jump and others changes the character looks like block, use imagegen for assets"

## Intake Summary

- Input shape: `specific`
- Audience: game player / project owner
- Authority: `requested`
- Proof type: `demo`
- Completion proof: A verified local run or browser demo shows the character keeps consistent visual scale across idle/move/jump/other animations, avoids blocky-looking animation frames/assets, and any new project-consumed raster assets generated with `imagegen` are saved inside the workspace and wired into the app.
- Likely misfire: The goal could only generate prettier assets while leaving animation transforms, sprite frame sizing, or runtime scaling bugs unfixed.
- Blind spots considered: The root cause may be animation CSS/transforms, sprite atlas/frame dimensions, canvas scaling, state-specific image dimensions, or placeholder/block fallback art. Asset generation must not happen until existing rendering and asset usage are mapped.
- Existing plan facts: User explicitly requested using the `imagegen` skill for assets.

## Goal Kind

`specific`

## Current Tranche

Discover where character animation size and blocky appearance are controlled, complete successive safe verified implementation slices that stabilize character scale and improve required assets, then audit the playable result against the original request.

## Non-Negotiable Constraints

- Use `imagegen` for any new raster character assets needed by the fix.
- Do not generate or replace assets before Scout evidence identifies the current asset/rendering pipeline and exact project-bound destinations.
- Keep implementation work in small, reviewable batches.
- Before each commit, check the staged diff and keep unrelated user or generated changes out of the commit.
- Preserve unrelated user changes and existing generated files unless the active task explicitly owns them.
- Verify visually that jump and other affected animations do not resize or distort the character.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if the user asked for working software or automation and a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices. After each slice audit, advance the board to the next highest-leverage safe Worker task and continue.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/character-animation-asset-fix/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/character-animation-asset-fix/goal.md.
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
11. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full original user outcome.
12. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original request and records `full_outcome_complete: true`.

Issue and PR handoffs are supporting artifacts. `state.yaml` remains authoritative, and every external artifact decision must be recorded in a task receipt.
