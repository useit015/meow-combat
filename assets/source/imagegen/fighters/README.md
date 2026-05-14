# Imagegen Fighter Source Art

## Moroccan fighters concept sheet

- Source: Codex app image generation session using the user's current Codex imagegen access.
- Original generated file: `/Users/oussmustaine/.codex/generated_images/019e1945-e96d-7ce1-bc32-7db83aba487c/ig_00c2f5853a6b3b20016a027b3f7f1481919c3c338d84eb8a15.png`
- Repo source copy: `assets/source/imagegen/fighters/moroccan-fighters-concept-sheet.png`
- Manifest copies:
  - `assets/source/imagegen/fighters/atlas-lion/canonical-reference.png`
  - `assets/source/imagegen/fighters/sahara-viper/canonical-reference.png`
- Status: generated, not approved for runtime sprite use.
- QA note: the sheet is useful as first-pass character concept art, but it is not a frame-consistent animation row. Fighter animation rows and stage layers remain blocked until they are generated and approved separately.

## Idle row candidates

- Source: Codex app image generation session using the user's current Codex imagegen access.
- Original generated sheet: `/Users/oussmustaine/.codex/generated_images/019e1945-e96d-7ce1-bc32-7db83aba487c/ig_0b518fcdc9d4a7f6016a027f540ddc8191804ba3e665eb1de7.png`
- Repo source rows:
  - `assets/source/imagegen/fighters/atlas-lion/idle.png`
  - `assets/source/imagegen/fighters/sahara-viper/idle.png`
- QA note: these rows have 8 readable idle poses and consistent identities, but they are generated source rows, not approved runtime sprites. They still need exact 8x256x256 cell slicing, background cleanup, and final approval before `src/assets/runtime.ts` can promote them from procedural fallback.
