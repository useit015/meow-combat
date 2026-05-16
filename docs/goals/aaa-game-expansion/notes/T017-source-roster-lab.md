# T017 Source Roster Lab

Full outcome: incomplete.

T017 adds a source-only review surface for the Pawbreaker League 8-fighter direction. It is deliberately not a runtime feature and not a select-screen preview. Its job is to keep the roster honest before more imagegen, animation rows, portraits, or playable promotion.

## Roster Split

Playable runtime roster:

- Gray Rabbit / Bunjamin Thump: playable runtime fighter.
- Ginger Tabby Cat / Marmalade Mayhem: playable runtime fighter.

Source-only identity locks, not playable:

- Pickles Pugilist / `pugilist-pug`: source-only model sheet at `assets/source/imagegen/fighters/pugilist-pug/canonical-character-sheet.png`; not playable.
- Noodle Nibbles / `ferret-noodle`: source-only model sheet at `assets/source/imagegen/fighters/ferret-noodle/canonical-character-sheet.png`; not playable.
- Tofu Tortoise / `tortoise-tofu`: source-only model sheet at `assets/source/imagegen/fighters/tortoise-tofu/canonical-character-sheet.png`; not playable.

Missing identity lock:

- Beanie Beak / `budgie-beanie`: missing identity lock.
- Mochi Munch / `hamster-mochi`: missing identity lock.
- Quillabelle Prickles / `hedgehog-quillabelle`: missing identity lock.

## No-Slop Review Criteria

- Silhouette variety across the 8-fighter roster.
- Species readability before animation or select-screen promotion.
- Palette spread that avoids a one-note roster wall.
- Stance readability for each fighter archetype.
- Proportion consistency between views and future frame rows.
- Reject copied marks, copied costume language, or reference-game symbols.
- Reject text, logos, or watermarks in source model sheets.

## Artifacts

- JSON: `output/roster-lab/aaa-expansion-source-roster-lab.json`
- HTML: `output/roster-lab/aaa-expansion-source-roster-lab.html`

The artifacts are source-only review aids. They add no public/runtime asset paths and do not make Pickles Pugilist, Noodle Nibbles, or Tofu Tortoise playable.
