# T040 Collapsed Row Rubric

Result: done. Full AAA outcome remains incomplete.

The Judge approved one cautious next Worker for Pickles Pugilist: generate `lose` only. `knockdown` remains blocked until `lose` passes and a fresh Judge review approves a true-prone rubric.

## Decision

`approve_worker`

## Evidence

- Accepted Pickles source rows are exact alpha 256px-cell sheets and remain source-only.
- `public/assets/generated/fighters/pugilist-pug` is absent.
- Current Pickles scale evidence:
  - `idle`: `166-168px` wide, `228px` high.
  - corrected `jump`: `153-163px` wide, `190-212px` high.
  - defense rows: `161-218px` wide, `220-237px` high.
  - `win`: `155-167px` wide, `221-226px` high.
- T039 accepted `win` but flagged `knockdown` and `lose` as higher risk because collapsed/prone poses can hide size drift.

## Stricter Rubric

- Hard rule: Pickles must not globally shrink or enlarge. A collapsed pose cannot justify a smaller head, muzzle, gloves, torso mass, tail curl, or pug identity.
- Required metrics for every candidate QA: per-frame alpha bounds, opaque-pixel counts, dimensions, hashes, rejected-candidate reasons, and visual notes comparing head/glove/muzzle/body mass against idle, jump, defense, and win.
- For `lose`: keep it as a standing, seated, or kneeling defeated slump; reject prone, sleeping, crawling, flattened, or tiny-in-frame poses. Bounds must stay `150-210px` wide, no frame below `195px` tall, average height at least `205px`, opaque pixels at least `20000` per frame, average opaque pixels at least `22500`.
- For future `knockdown`: require a separate Judge gate after `lose`. At least two frames must anchor full-size falling/upright scale; any prone frame must preserve visible full-size head, gloves, torso mass, feet, and tail, with horizontal body length proving rotation rather than shrink. No dust clouds, floor shadows, props, camera zoom, cropping, or effects may hide size.
- Both rows reject text, logos, watermarks, frame grids, detached stars/swirls/dust/sparks, extra limbs, face mutation, generic dog drift, or copied fighting-game language.

## Next Approved Worker

Generate and QA exactly one source-only Pickles Pugilist `lose` row using built-in imagegen only. Normalize it to exact `1536x256` alpha, compare against all twelve accepted Pickles rows, update source/planned manifests/tests/QA note, and prove Pickles remains non-playable with no public/runtime assets.

`knockdown`, playable promotion, public/runtime Pickles assets, and roster/select/combat integration remain blocked.
