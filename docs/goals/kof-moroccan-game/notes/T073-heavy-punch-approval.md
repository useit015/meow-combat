# T073 Heavy-Punch Approval Audit

## Decision

Approve the repaired normalized Atlas Lion and Sahara Viper `heavy-punch` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-heavy-punch-normalized.png` is 2048x256 with alpha.
- `output/imagegen/sahara-viper-heavy-punch-normalized.png` is 2048x256 with alpha.
- `npm run imagegen:qa` reports 24 generated fighter rows checked and 12 runtime-ready normalized candidates.
- The first generated heavy-punch sheet was rejected for detached limb fragments after magenta QA.
- The repaired sheet uses wider gutters; visual QA over magenta shows readable heavy punch wind-up/contact/recovery, preserved fighter identities, no visible green background, no labels, no gore, no detached sparks, and no severe body-part clipping.

## Scope

Approval is limited to `heavy-punch` only. Light kick, special, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own generation and QA passes.

## Next Worker

Copy the normalized `heavy-punch` rows into public generated asset paths, mark `heavy-punch` approved in the manifest, preload/render the rows in Phaser, add a local `?demo=heavy-punch` verification path, and verify browser state shows heavy-punch sprite rendering while light kick, special, knockdown, win/lose, and stage layers still fall back.
