# T057 Judge Decision: Walk-Forward Approval

## Decision

Approve the normalized Atlas Lion and Sahara Viper `walk-forward` QA candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-walk-forward-normalized.png` is 2048x256 with alpha.
- `output/imagegen/sahara-viper-walk-forward-normalized.png` is 2048x256 with alpha.
- `npm run imagegen:qa` reports 8 generated fighter rows checked, 4 runtime-ready rows, and 4 source rows needing normalization.
- Magenta composite inspection shows the cluster-based crop removed the earlier Atlas detached-fragment issue.
- Both rows preserve fighter identity, full-body silhouettes, and readable forward footwork. No labels, logos, frame numbers, or obvious green background remain in the normalized QA view.

## Conditions

Runtime integration should only approve `walk-forward`; all attacks, reactions, knockdown, win/lose rows, and stage layers must remain procedural fallback until their own QA passes.

The next Worker should copy the normalized rows into public generated asset paths, mark `walk-forward` as approved in the manifest, preload/render the rows in the Phaser scene, and verify browser state shows sprite rendering for walking while attack states still fall back.
