# Moroccan KOF-Style Fighting Game

## Objective

Create a strong, production-ready Moroccan-themed KOF-style fighting game through a continuous GoalBuddy run that first researches useful open-source repositories, engines, asset pipelines, and references, then uses that evidence to build successive verified implementation slices until a polished playable local game exists.

## Original Request

"the goal is to create a kof style game moroccan themed, lets first dearch the web for any repos that would help"

## Intake Summary

- Input shape: `vague`
- Audience: player or developer audience still to be clarified
- Authority: `requested`
- Proof type: `artifact`
- Completion proof: a production-ready TypeScript web engine foundation with strong combat/input/state architecture, clear asset and animation pipeline requirements, and a verified path toward a playable Moroccan KOF-style game
- Likely misfire: GoalBuddy could over-focus on generic repo research or a decorative theme and fail to produce a playable KOF-like fighting experience.
- Blind spots considered: visual board preference confirmed as local live board; target quality clarified as production-ready; first tranche proof clarified as engine foundation; platform clarified as desktop web game in TypeScript; online multiplayer and rollback netcode implementation excluded from the first tranche while preserving architecture compatibility; image-generated characters and animations requested; "pet workflow" inspiration requested; asset licensing and API-key readiness still need clarification during execution.
- Existing plan facts: first execution step should search the web for helpful repositories before implementation; later execution should use the imagegen workflow to create character and animation assets; investigate the relevant pet workflow as inspiration for the asset pipeline.

## Goal Kind

`open_ended`

## Current Tranche

Complete diagnostic intake, research suitable open-source TypeScript/web fighting game repositories, engines, and asset-generation workflows, select a production-quality engine direction, then build and verify the core combat/input/state foundation before advancing into generated character and animation production.

## Non-Negotiable Constraints

- Start with source-backed web research for helpful repositories before implementation.
- Include source-backed research into production-ready fighting game foundations and asset/animation workflows.
- Prioritize desktop web and TypeScript-compatible repositories, libraries, and architecture patterns.
- Prioritize a strong engine foundation for the first tranche over content-heavy early output.
- Keep online multiplayer and rollback netcode implementation out of the first tranche, while avoiding architecture choices that would make rollback impossible later.
- Use the imagegen workflow during execution to create characters and animation assets, after the implementation direction and asset requirements are validated.
- Investigate the relevant pet workflow during execution and adapt useful process ideas without blindly copying unrelated mechanics.
- Keep repo search, implementation planning, asset creation, and product-file edits inside the later `/goal` run.
- Preserve Moroccan theming as a first-class requirement, not a cosmetic afterthought.
- Avoid claiming completion from research or planning alone; completion requires a production-ready playable artifact and final audit.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if the user asked for working software or automation and a safe Worker task can be activated.

Do not stop after a single verified Worker slice when the broader owner outcome still has safe local follow-up slices. After each slice audit, advance the board to the next highest-leverage safe Worker task and continue.

Do not stop because a slice needs owner input, credentials, production access, destructive operations, or policy decisions. Mark that exact slice blocked with a receipt, create the smallest safe follow-up or workaround task, and continue all local, non-destructive work that can still move the goal toward the full outcome.

## Canonical Board

Machine truth lives at:

`docs/goals/kof-moroccan-game/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/kof-moroccan-game/goal.md.
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
11. Treat a slice audit as a checkpoint, not completion, unless it explicitly proves the full original user outcome and records `full_outcome_complete: true`.
