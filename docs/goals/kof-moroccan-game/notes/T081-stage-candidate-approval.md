# T081 Stage Candidate Approval Audit

## Decision

Do not approve the generated Marrakesh Rooftop stage candidates for runtime integration yet. Require a targeted layer-repair and normalization Worker first.

## Evidence

- `sky.png` is a clean 1024x576 atmospheric sky candidate.
- `far-architecture.png` has strong Moroccan rooftop identity, but includes side/foreground architectural elements and should be repaired into a cleaner distant skyline layer before parallax integration.
- `playfield.png` is a full composite scene with sky and distant buildings, so rendering it as the playfield layer would cover the other layers instead of stacking with them.
- `foreground-props.png` is improved after regeneration and has a clear center lane, but it uses a flat chroma-green background that must be keyed to alpha before runtime approval.
- Browser proof from T080 shows all four stage sources are `generated` and still resolve to `procedural-fallback`, so the unapproved stage art is safely queued.

## Rationale

The candidates are useful art direction, but approving them directly would create a brittle stage stack. The next step should repair the far/playfield sources into true layer candidates and produce normalized alpha-ready runtime preview layers. Runtime approval and public stage integration must stay separate until those previews pass visual QA.

## Next Worker

Repair the stage layer pack without approving it: regenerate cleaner far-architecture and playfield layer candidates through Codex app imagegen, keep the accepted sky/foreground candidates, produce normalized runtime-candidate PNGs under `output/imagegen/stages/marrakesh-rooftop/runtime-candidates/`, and create a local composite preview for QA. The manifest should remain generated-but-unapproved and the live runtime should remain procedural fallback.
