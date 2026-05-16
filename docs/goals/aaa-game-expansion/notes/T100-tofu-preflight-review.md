# T100 Tofu Preflight Review

Decision: approve a bounded source-only Tofu idle-row Worker.

## Findings

- T099 is consistent with its receipt: the preflight JSON reports `fighterId: "tortoise-tofu"`, `sourceOnly: true`, `playable: false`, 14 required rows, and the required shell-mass/no-drift gates.
- `public/assets/generated/fighters/tortoise-tofu` remains absent, so Tofu is not public/runtime playable.
- Protected diffs are empty for Tofu public/runtime assets, Tofu source image assets, dependencies, audio, sprite frame/cell logic, sprite visual sizing, combat frame data, and game config.
- The preflight is strong enough to start row production, but only with the baseline row. Generating locomotion, attacks, reactions, or outcome rows before idle would create scale-reference risk.
- Starting another planned fighter lane now would spread asset QA before Tofu's first row establishes whether the shell-heavy grappler design can animate without size drift.

## Routing

Next task: T101 Tofu idle row production.

The Worker should generate and QA exactly one source-only Tofu Tortoise / `tortoise-tofu` idle row using built-in imagegen only. The accepted row must normalize to an exact `2048x256` alpha spritesheet, become the future Tofu scale reference, update only source/planned manifests and focused tests, and prove Tofu remains non-playable with no public/runtime assets.

## Verification

- `sed -n '1,220p' docs/goals/aaa-game-expansion/notes/T099-tofu-animation-preflight.md` passed.
- `node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("output/animation-preflight/tofu-tortoise-animation-preflight.json","utf8")); console.log(JSON.stringify({fighterId:r.fighterId, sourceOnly:r.sourceOnly, playable:r.playable, rows:r.requiredRows.length, gates:r.noDriftQaGates.map(g=>g.id)}, null, 2)); if(r.fighterId!=="tortoise-tofu" || !r.sourceOnly || r.playable || r.requiredRows.length!==14 || !r.noDriftQaGates.some(g=>g.id==="shell-mass-scale-bounds")) process.exit(1);'` passed.
- `test ! -e public/assets/generated/fighters/tortoise-tofu` passed.
- `git diff --name-only -- public/assets/generated/fighters/tortoise-tofu assets/source/imagegen/fighters/tortoise-tofu package.json package-lock.json src/game/audio.ts public/assets/audio assets/source/audio src/game/spriteFrame.ts src/game/spriteVisualSizing.ts src/core/frameData.ts src/game/gameConfig.ts` produced no output.

The full AAA outcome remains active and incomplete.
