# T026 Pickles Animation Preflight

Result: done. Full AAA outcome remains incomplete.

This Worker created a source-controlled animation-production preflight for `pugilist-pug` / Pickles Pugilist. It is not playable promotion. It did not run imagegen, generate animation rows, add public fighter assets, change runtime roster/select/combat, acquire audio, call APIs, read `.env`, add dependencies, or touch scene flow.

## Scope

- Source module: `src/assets/fighterAnimationPreflight.ts`.
- Review artifact: `output/animation-preflight/pickles-pugilist-animation-plan.json`.
- HTML review artifact: `output/animation-preflight/pickles-pugilist-animation-plan.html`.
- Tests: `test/fighter-animation-preflight.test.ts`.

## Production Decision

Pickles Pugilist is the first playable-candidate preflight only. The current runtime roster remains Gray Rabbit and Ginger Tabby Cat. `public/assets/generated/fighters/pugilist-pug` must not exist until a later Worker generates, QA-checks, normalizes, records provenance for, and promotes every required row.

## Row-Generation Coverage

The preflight covers every `REQUIRED_FIGHTER_ANIMATIONS` row:

- `idle`
- `walk-forward`
- `walk-back`
- `crouch`
- `jump`
- `light-punch`
- `heavy-punch`
- `light-kick`
- `special`
- `hitstun`
- `blockstun`
- `knockdown`
- `win`
- `lose`

Every row includes a Pickles-specific row-generation brief, motion language, planned frame count, exact `256x256` cell requirement, transparent-background requirement, no-drift acceptance criteria, and rejection triggers.

## No-Drift Gates

- Scale and silhouette: compare alpha bounds, head height, shoulder width, glove size, torso height, and tail curl against the future approved idle row.
- Alpha bounds: require transparent sprite frames with no detached dust, speed lines, hit sparks, text, frame numbers, or UI artifacts baked in.
- Identity traits: preserve wrinkles, round muzzle, folded ears, curled tail, compact torso, stubby limbs, warm fawn palette, dark muzzle, and toy gloves.
- Frame dimensions: require exact `frameCount * 256` row width and `256` row height.
- Provenance: source prompt, canonical reference, candidate path, QA decision, source path, and runtime path must be recorded before runtime promotion.

## Runtime Promotion Matrix

- `npm test -- test/fighter-animation-preflight.test.ts`
- `npm test -- test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts`
- `test ! -e public/assets/generated/fighters/pugilist-pug`
- Future promotion smoke must use `npm run smoke:meowtal` and prove Pickles has approved sprite rows for every required animation, exact `256x256` cells, no fallback rows, and explicit roster state.

## Verification

- `npm run typecheck`
- `npm test -- test/fighter-animation-preflight.test.ts test/asset-pipeline.test.ts test/source-roster-lab.test.ts test/game-config.test.ts`
- `npm run verify`
- `rg -n "Pickles Pugilist|pugilist-pug|no-drift|row-generation|runtime promotion|smoke|not playable" src/assets/fighterAnimationPreflight.ts test/fighter-animation-preflight.test.ts docs/goals/aaa-game-expansion/notes/T026-pickles-animation-preflight.md`
- `test ! -e public/assets/generated/fighters/pugilist-pug`

