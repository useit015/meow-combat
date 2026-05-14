# T055 Judge Decision: Next Content Slice

## Decision

Do not mark the full goal complete. The playable game now has two approved generated idle rows, but the objective still requires a production-ready Moroccan KOF-style game with generated characters and animations. The current manifest still leaves movement, attacks, reactions, win/lose rows, and stage layers on procedural fallback.

Activate a Worker task for the next content-production slice: generate Atlas Lion and Sahara Viper `walk-forward` row candidates through the Codex app imagegen path, then use local scripts for normalization and QA. Do not treat Codex app auth as a local `OPENAI_API_KEY`; the shell preflight remains a useful blocker signal for reproducible CLI generation.

## Evidence

- T054 verified `idle` runtime sprites for both fighters and preserved procedural fallback for non-idle states.
- `src/assets/catalog.ts` approves only `atlas-lion:idle` and `sahara-viper:idle`.
- `npm run imagegen:preflight` reports `OPENAI_API_KEY=missing`.
- The Codex app imagegen path can still create images using the current Codex session auth.
- `docs/imagegen-runbook.md` lists `atlas-lion:walk-forward` as the next required animation job after idle.

## Rationale

`walk-forward` is the best next slice because it proves the sprite pipeline can handle actual motion and footwork before combat-specific attacks are approved. It also pressures the normalization tooling to become animation-agnostic instead of idle-only while keeping the approval decision separate from generation.

## Next Worker Shape

Generate or copy source candidates into:

- `assets/source/imagegen/fighters/atlas-lion/walk-forward.png`
- `assets/source/imagegen/fighters/sahara-viper/walk-forward.png`

Normalize QA candidates into:

- `output/imagegen/atlas-lion-walk-forward-normalized.png`
- `output/imagegen/sahara-viper-walk-forward-normalized.png`

The Worker should update local QA tooling only as needed, keep manifest rows generated-but-unapproved unless visual QA passes, and stop before runtime approval if identity drift, bad frame separation, visible background, or unusable footwork appears.
