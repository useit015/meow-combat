# T087 Knockdown Approval Audit

## Decision

Approve the repaired normalized Atlas Lion and Sahara Viper `knockdown` candidates for runtime sprite integration in a separate Worker task.

## Evidence

- The first generated knockdown sheet was rejected because close poses caused adjacent body fragments in normalized cells.
- The repaired sheet is separated enough for `scripts/normalize-fighter-rows.mjs --animation knockdown` to detect eight pose crops per fighter.
- `output/imagegen/atlas-lion-knockdown-normalized.png` and `output/imagegen/sahara-viper-knockdown-normalized.png` are 2048x256 RGBA candidates.
- Visual QA shows readable fall, grounded, and recovery poses with no visible labels, gore, weapons, fake text, severe cropping, or adjacent body fragments.
- `npm run imagegen:qa`, `npm run typecheck`, `npm test`, and `npm run build` passed in T086.

## Rationale

The repaired rows satisfy the bounded approval criteria for the KO/knockdown slice. Approval is limited to `knockdown`; movement rows, `light-kick`, and win/lose rows still require their own generation, QA, and runtime work.

## Next Worker

Copy the normalized `knockdown` rows into public generated fighter paths, mark `knockdown` approved in the manifest, preload/render the rows in Phaser, add a local `?demo=knockdown` verification path, and verify browser state shows the knockdown sprite rendering while remaining movement, kick, and win/lose rows still fall back.
