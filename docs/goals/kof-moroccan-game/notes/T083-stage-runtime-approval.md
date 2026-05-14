# T083 Stage Runtime-Candidate Approval Audit

## Decision

Approve the normalized Marrakesh Rooftop runtime-candidate stage pack for Phaser runtime integration in a separate Worker task.

## Evidence

- `output/imagegen/stages/marrakesh-rooftop/runtime-candidates/*.png` are all 1024x576 RGBA PNGs.
- `composite-preview.png` stacks sky, far architecture, playfield, and foreground props into a readable Moroccan rooftop stage with an open center lane for fighters.
- The preview has no visible text, logos, watermark, characters, weapons, copied landmarks, fake checkerboard transparency, or severe layer ordering issues.
- T082 repaired the earlier blockers: far architecture is no longer hidden behind the playfield, playfield is no longer a full-scene layer, and foreground uses keyed alpha instead of fake transparency.
- T082 verification passed: stage candidate dimensions/alpha, `npm run imagegen:qa`, `npm run typecheck`, `npm test`, and `npm run build`.

## Rationale

The stage pack is good enough for the first generated runtime stage integration. Minor chroma-edge cleanup can be polished later, but the preview now meets the approval criteria for a production-progress slice: Moroccan identity is clear, the fighter lane stays readable, and the four layers compose without blocking combat visibility.

## Next Worker

Copy the approved runtime-candidate layers into public generated stage paths, mark the four stage manifest layers approved, preload and render approved image layers in Phaser with procedural fallback preserved for missing/unapproved layers, add tests for approved stage runtime/readiness, and capture browser proof that the live game renders the generated Marrakesh stage.
