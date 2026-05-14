# T003 Imagegen And Pet-Workflow Asset Pipeline

Date: 2026-05-12

## Current Readiness

- `OPENAI_API_KEY` is missing in the current environment, so live image generation is blocked until the user sets the variable locally.
- The imagegen skill requires the bundled CLI at `/Users/oussmustaine/.codex/skills/imagegen/scripts/image_gen.py`, defaults to `gpt-image-1.5`, and requires `OPENAI_API_KEY` for live calls.
- No assets were generated in this Scout task.

## Production Asset Pipeline Recommendation

Use the pet workflow as a process model, adapted from 8x9 digital-pet sheets into fighting-game production assets:

1. Character brief and canonical base image.
   - Generate or approve one canonical reference per fighter before row/animation generation.
   - Store the prompt, output path, model, date, constraints, and source metadata.

2. Animation job manifest.
   - Define each character's required animation rows before generation: `idle`, `walk-forward`, `walk-back`, `crouch`, `jump`, `light-punch`, `heavy-punch`, `light-kick`, `special`, `hitstun`, `blockstun`, `knockdown`, `win`, `lose`.
   - Each row/job should name frame count, cell size, facing, silhouette constraints, Moroccan costume motifs, background/transparency rules, and forbidden artifacts.

3. Layout guides.
   - Create guide images per row so generated animation strips keep frame count, spacing, centering, and padding consistent.
   - Guides should be construction-only and never appear in final output.

4. Grounded row generation.
   - Every animation row should use the canonical base image as grounding input.
   - Later rows can use approved prior rows as gait/pose references.
   - Only mirror left/right rows when identity, side-specific clothing, weapon/prop hand, text, and lighting remain correct.

5. QA and ingestion.
   - Build contact sheets for each fighter and stage asset pack.
   - Validate transparent backgrounds, frame count, dimensions, padding, identity consistency, no detached effects, no watermarks, no text, and no visible guides.
   - Ingest only selected original imagegen outputs, preserving provenance.

6. Game asset packaging.
   - Convert approved rows into spritesheets plus JSON metadata.
   - Suggested repo paths after scaffold:
     - `assets/source/imagegen/<fighter-id>/`
     - `assets/game/fighters/<fighter-id>/<animation>.png`
     - `assets/game/fighters/<fighter-id>/fighter.json`
     - `assets/game/stages/<stage-id>/`
     - `tools/assets/` for deterministic sheet/metadata assembly scripts.

## Prompt Requirements

Use `stylized-concept` from the imagegen taxonomy for fighter and stage concepts, with transparent or clean removable backgrounds for sprite work.

Important prompt constraints:

- Original Moroccan-inspired characters, no existing KOF/SNK/Capcom characters, no trademarks.
- Clear full-body side-facing fighting stance for base fighter references.
- Strong silhouette at game scale.
- Consistent outfit, palette, proportions, head shape, face, and accessories across rows.
- No text, logos, watermarks, UI, visible grids, frame numbers, detached motion marks, dust clouds, speed lines, or shadows for animation rows.
- Use transparent background when supported; otherwise use a clean flat chroma-key background that can be removed.

Example base prompt skeleton:

```text
Use case: stylized-concept
Asset type: fighting game character canonical reference
Primary request: original Moroccan-inspired 2D fighting game character, production-ready, full-body side-facing fighting stance
Subject: <fighter archetype>, readable silhouette, practical combat outfit with Moroccan textile motifs
Style/medium: stylized high-resolution game character concept, sprite-production friendly
Composition/framing: full body, centered, generous padding, neutral pose, facing right
Lighting/mood: clean studio lighting, crisp edges
Constraints: original character only; no logos; no text; no watermark; consistent anatomy; usable as animation grounding reference
```

## Pet Workflow Ideas To Adapt

- Run manifests for all visual jobs.
- Canonical base reference before row generation.
- Row-specific prompts and layout guides.
- Record selected imagegen outputs rather than hand-fabricating art.
- Contact sheet QA before accepting assets.
- Targeted repair jobs for failed rows instead of regenerating everything.
- Centralized provenance and validation.

## Pet Workflow Ideas To Avoid Or Modify

- Do not use the pet-specific 8x9 atlas geometry; fighting-game sprites need per-character animation metadata and variable row/frame counts.
- Do not keep the tiny digital-pet style; this game needs larger readable fighters and stage art.
- Do not require pet packaging files like `pet.json`; define game-native `fighter.json`, animation frame data, and atlas metadata instead.
- Do not rely on mirroring as a default because Moroccan costume asymmetry, props, or readable symbols can become wrong.

## Blocker Handling

Before live asset generation, the user should set `OPENAI_API_KEY` locally. The game can still proceed with engine scaffolding, placeholder vector/canvas debug shapes, and asset schema work while image generation is blocked.
