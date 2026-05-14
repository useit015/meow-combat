# T077 Special Approval Audit

## Decision

Approve the repaired normalized Atlas Lion and Sahara Viper `special` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-special-normalized.png` is 2560x256 with alpha.
- `output/imagegen/sahara-viper-special-normalized.png` is 2560x256 with alpha.
- `npm run imagegen:qa` reports 28 generated fighter rows checked and 14 runtime-ready normalized candidates.
- The first generated special sheet was rejected for crowded/detached fragments after magenta QA.
- The repaired sheet uses smaller, compact poses; visual QA over magenta shows readable grounded special wind-up/contact/recovery, preserved fighter identities, no visible green background, no labels, no gore, no weapons, no projectiles, no detached effects, and no severe body-part clipping.

## Scope

Approval is limited to `special` only. Light kick, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own generation and QA passes.

## Next Worker

Copy the normalized `special` rows into public generated asset paths, mark `special` approved in the manifest, preload/render the rows in Phaser, add a local `?demo=special` verification path, and verify browser state shows special sprite rendering while light kick, knockdown, win/lose, and stage layers still fall back.
