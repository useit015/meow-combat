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
- The production asset pack must cover every visible game surface, including logo/title mark, title/key art, parallax arena layers, HUD frames, health/super/timer treatments, character portraits, button/icon art, pause/options panels, round/victory/K.O. overlays, damage-number styling, mobile/touch controls, loading/fallback states, particle sprites, and capture/promo artwork as needed.
- The arena must render as a layered parallax stage, not a single flat backdrop. It should include at least foreground/playfield, midground set dressing, background architecture or hills/cityscape, sky/lighting, and subtle depth motion compatible with gameplay readability.
- No placeholder assets, broken menu states, silent critical interactions, overlapping HUD/text, console errors, missing run instructions, or "works only in dev by accident" completion.
- Production readiness requires a local production build or production preview, stable frame pacing for the implemented effects, graceful loading/fallback behavior, and readable controls on supported viewports.
- Commit work in small, coherent batches throughout implementation; do not save all production-game work for one large final commit.
- Character animation assets must look consistent across each fighter's move set. Reject completion if animation frames vary noticeably in species identity, costume/markings, body proportions, lighting, camera angle, scale, outline/detail level, or rendering style.
- The rabbit and cat must share one normal stance convention. The current production direction is upright two-legged for ordinary stance, movement, attacks, and victory presentation; grounded or prone poses are allowed only when they clearly read as hit reactions, K.O., or defeat, not four-legged locomotion, crawl/rest behavior, loafing, or a second normal rig.
- Use Tough Love Arena (`https://toughlovearena.com/`) as a quality benchmark for smooth web fighting-game feel, responsive controls, readable combat, polished presentation, fast restart/rematch flow, and overall beauty. This is a feel benchmark only: do not copy its characters, art, UI, code, brand, or exact mechanics.

## Gameplay Feel Benchmark

Tough Love Arena is a web-based indie fighting game and should be treated as a reference bar for how smooth and good a browser fighting game can feel. Meowtal Kombat should aim for that level of responsiveness, visual clarity, juicy impact feedback, readable UI, input comfort, round flow, and overall polish while remaining its own original animal-combat game.

Benchmark checks to carry into implementation and audit:

- Controls respond immediately and predictably, with no mushy input feel.
- Movement, attacks, hitstop, knockback, blockstun, recovery, and restart/rematch flow feel intentional rather than accidental.
- Visual effects are beautiful but never hide the fighters, hitboxes, HUD, or current state.
- The game feels complete and fun in-browser, not like a decorative animation test.
- Any networking/rollback inspiration from Tough Love Arena is non-blocking unless a later Judge task explicitly scopes multiplayer; the current required target is a polished production-ready scoped game.

## Visual References

Use these repo-local vision images as aspirational art-direction targets for the production game. They are not final runtime assets.

- `docs/visual-reference/meowtal-kombat/vision-01.png`
- `docs/visual-reference/meowtal-kombat/vision-02.png`
- `docs/visual-reference/meowtal-kombat/vision-03.png`
- `docs/visual-reference/meowtal-kombat/vision-04.png`

## Character Sheet Template

Before generating animation frames, create canonical character sheets for the gray rabbit and ginger/orange tabby cat. Use the structure below, adapted only to original Meowtal Kombat characters. Do not request or copy copyrighted characters, franchise outfits, logos, or named IP.

Both sheets must use the same upright two-legged fighting-game rig selected for the production game. Do not mix two-legged and four-legged normal stance conventions across the fighters or across ordinary gameplay moves.

```text
Create a complete polished character design sheet for [FIGHTER NAME], an original Meowtal Kombat fighter, on a clean light background. Show a faithful consistent depiction of [SPECIES AND ROLE] with [CORE SILHOUETTE], [FACE/PERSONALITY], [BODY PROPORTIONS], [FUR COLOR AND MARKINGS], [SIGNATURE COMBAT TRAITS], and [SPECIAL ENERGY COLOR].

Present the sheet as professional production concept art with multiple sections and a neat panel layout. Include: full-body front view, side view, back view, 3/4 heroic pose, action-ready fighting pose, relaxed idle pose, large head close-up, and an expression sheet with calm idle, excited grin, battle focus, shocked comedic expression, hit reaction, and powering-up intensity.

Also include detail callouts for silhouette, ears/tail/paws, fur markings, attack limbs, special-effect aura shape, readable gameplay pose shapes, and any fighter-specific props or visual motifs. Add a size reference section and color swatches.

Render it in polished high-quality 2D arcade fighting game concept art style, clean linework, vibrant cel-shaded color, readable presentation, consistent proportions across all views, animation-friendly shapes, professional character design sheet, no watermark.
```

Rabbit-specific fill:
- Fighter name: Gray Rabbit.
- Core silhouette: long ears, compact athletic body, strong hind legs, springy hopping stance.
- Signature traits: hopping movement, spinning kicks, tornado special, green energy trail.

Cat-specific fill:
- Fighter name: Ginger/Orange Tabby Cat.
- Core silhouette: fluffy orange tabby fur, round expressive face, agile body, visible striped tail.
- Signature traits: pounce attacks, tail strikes, loaf idle pose, acrobatic flips, yellow-green aura/projectile.

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
