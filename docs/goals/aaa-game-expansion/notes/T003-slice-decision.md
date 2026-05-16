# T003 Slice Decision Receipt

## Decision

Approved the first Worker slice: add an expansion-ready, source-controlled original content spine for the game while preserving current runtime behavior.

## Rationale

The repo already has the 2-fighter playable foundation, so basic combat work is not the highest-leverage first slice. Creative/data scaffolding is the safest largest useful next step because it unblocks 8-fighter expansion, story/championship structure, audio policy, and no-slop asset standards without creating inconsistent assets.

Runtime audio/sample-player and asset QA are important, but both need stable cue/content/style contracts first. Direct 8-fighter runtime expansion, generated art, or championship implementation now would amplify IP, consistency, and QA risk.

## Approved Worker Objective

Add an expansion-ready, source-controlled original content spine for the game: IP-safe working title, 8 original pet-fighter bible, move-language hooks, first championship/story beat, mode metadata, keyboard-first/browser-v1 and touch/mobile-v2 notes, audio direction requiring sample/authored primary cues with procedural fallback marked dev-only, and visual production/model-sheet acceptance rules. Keep only Gray Rabbit and Ginger Tabby Cat in the runtime roster. Do not generate assets, acquire audio, or expand runtime fighters.

## Allowed Files

- `src/content/gameBible.ts`
- `src/content/index.ts`
- `test/game-bible.test.ts`
- `src/game/gameConfig.ts`
- `test/game-config.test.ts`

## Verification

- `npm run typecheck`
- `npm test -- test/game-bible.test.ts test/game-config.test.ts`
- `npm run verify`

## Stop Conditions

- Need to touch files outside allowed files.
- Need generated image/audio assets, external APIs, `.env`, `public/assets`, `assets/source`, or output files.
- Need dependency changes.
- Need to add more than the existing 2 fighters to runtime roster.
- Need to modify combat, rendering scene flow, shellFlow, asset manifests, or audio playback implementation.
- Any proposed fighter, title, move, story beat, announcer line, or mode copies or sound-alikes Pokemon/KOF/Mortal Kombat/Street Fighter references.
- Cannot keep procedural audio explicitly dev-only/fallback in the new content contract.
- Verification fails twice for the same reason.

## Parallelization

Parallel write Workers are not safe now. This first slice owns shared creative/schema decisions that audio, story, branding, asset QA, and future runtime modes must consume. Parallel Workers would likely diverge on names, fighter IDs, cue semantics, and production rules.

## Deferred Follow-Ups

- Replace procedural runtime audio with manifest-backed sample playback and source/license records.
- Rename/replace visible Meowtal Kombat logo/UI assets after title contract is accepted.
- Harden asset QA for model sheets, identity locks, alpha/dimension variance, forbidden text/logos, and runtime promotion.
- Add data-driven championship/story shell after content schema stabilizes.
- Generate new character assets only after model-sheet and consistency rules are enforceable.
- Run browser smoke/visual proof after runtime-facing changes.
