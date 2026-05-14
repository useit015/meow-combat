# T061 Judge Decision: Light-Punch Approval

## Decision

Approve the normalized Atlas Lion and Sahara Viper `light-punch` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-light-punch-normalized.png` is 1536x256 with alpha.
- `output/imagegen/sahara-viper-light-punch-normalized.png` is 1536x256 with alpha.
- `npm run imagegen:qa` reports 12 generated fighter rows checked and 6 runtime-ready normalized candidates.
- Magenta composite inspection shows no remaining Atlas detached-fist slicing artifact after the normalizer fix.
- Both rows preserve fighter identity and show readable startup, punch extension, and recovery poses without baked hit sparks, dust, text, logos, or frame labels.

## Conditions

Runtime integration should approve `light-punch` only. Heavy punch, light kick, special, hit/block reactions, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own QA passes.

The next Worker should copy the normalized rows into public generated asset paths, mark `light-punch` approved in the manifest, preload/render the rows in the Phaser scene, and verify browser state shows light-attack sprite rendering while heavier/special/reaction states still fall back.
