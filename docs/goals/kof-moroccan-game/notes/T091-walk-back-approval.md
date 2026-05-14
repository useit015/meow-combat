# T091 Walk-Back Approval Audit

## Decision

Approve the normalized Atlas Lion and Sahara Viper `walk-back` candidates for runtime sprite integration in a separate Worker task.

## Evidence

- `output/imagegen/atlas-lion-walk-back-normalized.png` and `output/imagegen/sahara-viper-walk-back-normalized.png` are 2048x256 RGBA candidates.
- Visual QA shows readable guarded backward step poses with stable identity, no visible labels, gore, weapons, fake text, adjacent frame fragments, or full-body crop.
- `npm run imagegen:qa`, `npm run typecheck`, `npm test`, and `npm run build` passed in T090.

## Rationale

The rows meet the bounded approval criteria and complete the generated grounded movement pair alongside `walk-forward`. Approval is limited to `walk-back`; crouch, jump, light-kick, win, and lose rows remain incomplete.

## Next Worker

Copy the normalized `walk-back` rows into public generated fighter paths, mark `walk-back` approved in the manifest, preload/render the rows in Phaser, add a local `?demo=walk-back` verification path, and verify browser state shows walk-back sprite rendering while crouch, jump, light-kick, win, and lose still fall back.
