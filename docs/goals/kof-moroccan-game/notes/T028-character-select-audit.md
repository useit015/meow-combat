# T028 Character Select Audit

## Verdict

- `current_playable_foundation_ready`: true
- `full_outcome_complete`: false

The game now has a meaningful playable shell: fighter select, deterministic combat, CPU profiles, pause, combos, match sets, effects, and asset-ready fighter/stage runtime metadata. The full user outcome is still incomplete because the required imagegen-produced character references, animation rows, and stage art do not exist.

## Evidence

- Character select: T027 verified P1 can change from Atlas Lion to Sahara Viper before fight start, and the simulation starts with the selected definition.
- Playable loop: T010-T012, T016, T021-T024 cover shell flow, CPU sparring, pause, combos, effects, and difficulty cycling.
- Asset readiness: T014, T015, T017, T020, T026 cover animation/stage runtime metadata and fail-closed fallback.
- Verification: latest T027 receipt passed typecheck, 13 test files / 52 tests, build, browser two-Enter flow, and direct select-cycle browser proof.
- Blocker: T009 and T019 show `OPENAI_API_KEY` is missing.

## Missing Evidence

- Generated canonical fighter images.
- Generated fighter animation spritesheet rows.
- Generated stage layer images.
- Approved image assets being rendered by Phaser.
- Final production polish over real assets.

## Next Worker

Add a local asset-readiness/debug panel or export surface that summarizes fighter/stage imagegen job counts, blocked credentials, runtime fallback counts, and next required generated assets. This gives the project a clear production checklist inside the running artifact while the credential blocker remains.
