# T042 Knockdown Rubric

Result: done. Full AAA outcome remains incomplete.

The Judge approved exactly one cautious next Worker for Pickles Pugilist: generate `knockdown` only under a true-prone no-size-change rubric. Runtime promotion, public assets, and playable integration remain blocked.

## Decision

`approve_worker`

## Evidence

- T040 explicitly allowed `lose` only and kept `knockdown` blocked pending this Judge gate.
- T041 `lose` passed as a full-size upright slump: `160-165px` wide, `225-232px` high, `229px` average height, `26182` average opaque pixels.
- Accepted Pickles row metrics now give stable scale references: `idle` at `166-168px` wide and `228px` high; corrected `jump` at `153-163px` wide and `190-212px` high; `win` at `155-167px` wide and `221-226px` high; `lose` at `160-165px` wide and `225-232px` high.
- Catalog still keeps Pickles source-only; `knockdown` is absent and `public/assets/generated/fighters/pugilist-pug` is absent.
- Existing normalization already supports `knockdown` as `8` frames / `2048x256`.

## True-Prone Rubric

- Hard rule: Pickles must not change character size. Falling/prone frames must read as rotation of the same full-size body, not a smaller sprite.
- Exactly 8 frames in a `2048x256` alpha spritesheet.
- At least 2 early frames must anchor full-size upright/falling scale: height `>=205px`, width `150-230px`, opaque pixels `>=22000`.
- At least 2 final frames must be true prone/side-lying, not seated/kneeling/slumped: horizontal body length `>=210px` and `<=245px`, opaque pixels `>=20000`.
- Any frame below `195px` vertical height must have width `>=205px` and visual proof that the same body is rotated/prone.
- No frame may have both width `<195px` and height `<195px`.
- Row average opaque pixels must be `>=22500`.
- Visible full-size head, muzzle, wrinkles, ears, red gloves, belt medallion, feet, compact torso, and tail curl must match accepted rows.
- Reject smaller head/gloves/muzzle, changed dog face, changed palette, missing tail, extra limbs, cropped limbs, generic pug drift, dust clouds, floor shadows, stars, hit sparks, speed lines, props, text, logos, watermarks, camera zoom, crop tricks, and flattened tiny poses.

## Next Approved Worker

Generate and QA exactly one source-only Pickles Pugilist `knockdown` row using built-in imagegen only. Normalize it to exact `2048x256` alpha, enforce this true-prone no-size-change rubric against all thirteen accepted Pickles rows, update only source/planned manifests/tests/QA note, and prove Pickles remains non-playable with no public/runtime assets.
