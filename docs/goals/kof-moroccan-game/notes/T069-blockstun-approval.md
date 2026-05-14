# T069 Blockstun Approval Audit

## Decision

Approve the normalized Atlas Lion and Sahara Viper `blockstun` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-blockstun-normalized.png` is 1280x256 with alpha.
- `output/imagegen/sahara-viper-blockstun-normalized.png` is 1280x256 with alpha.
- `npm run imagegen:qa` reports 20 generated fighter rows checked and 10 runtime-ready normalized candidates.
- Visual QA over magenta shows readable guard recoil/recovery poses, preserved fighter identities, no visible green background, no labels, no gore, no detached sparks, and no severe body-part clipping.

## Scope

Approval is limited to `blockstun` only. Heavy punch, light kick, special, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own generation and QA passes.

## Next Worker

Copy the normalized `blockstun` rows into public generated asset paths, mark `blockstun` approved in the manifest, preload/render the rows in Phaser, add a local `?demo=blockstun` verification path, and verify browser state shows blockstun sprite rendering while heavier/special/other rows still fall back.
