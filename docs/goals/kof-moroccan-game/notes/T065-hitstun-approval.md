# T065 Judge Decision: Hitstun Approval

## Decision

Approve the normalized Atlas Lion and Sahara Viper `hitstun` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-hitstun-normalized.png` is 1280x256 with alpha.
- `output/imagegen/sahara-viper-hitstun-normalized.png` is 1280x256 with alpha.
- `npm run imagegen:qa` reports 16 generated fighter rows checked and 8 runtime-ready normalized candidates.
- Magenta composite inspection shows readable recoil/recovery poses with no visible green background, gore, text, detached hit effects, or frame labels.
- Both rows preserve fighter identity and keep the reaction non-comedic.

## Conditions

Runtime integration should approve `hitstun` only. Blockstun, heavy punch, light kick, special, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own QA passes.

The next Worker should copy the normalized rows into public generated asset paths, mark `hitstun` approved in the manifest, preload/render the rows in the Phaser scene, and verify browser state shows hitstun sprite rendering while blockstun/heavy/special/other rows still fall back.
