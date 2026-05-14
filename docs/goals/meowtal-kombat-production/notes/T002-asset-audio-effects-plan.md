# T002 Asset, Audio, And Effects Plan

## Result

Scout completed a read-only production asset/effects plan for Meowtal Kombat.

## Asset Strategy

The existing Atlas Arena pipeline should be adapted rather than discarded:

- Keep the manifest-driven asset model in `src/assets/catalog.ts`.
- Keep generated source assets under `assets/source/imagegen/...`.
- Keep normalized/runtime assets under `public/assets/generated/...`.
- Keep QA scripts and extend them for Meowtal-specific identity/style consistency.
- Add a provenance/license manifest before final external/generated assets are marked production-ready.

The current pipeline is useful but content-specific to Atlas Lion, Sahara Viper, and Marrakesh rooftop. It must be retargeted to:

- `gray-rabbit`
- `ginger-tabby-cat`
- `meowtal-courtyard`
- Meowtal logo/title/HUD/menu/overlay/control/particle assets
- Audio cues/music provenance

## Canonical Character Sheets

Generate canonical sheets before animation rows. Each sheet should include:

- Full-body front, side, back, and 3/4 heroic views.
- Action-ready fighting pose.
- Relaxed idle pose.
- Large head close-up.
- Expression sheet: calm idle, excited grin, battle focus, shocked comedic expression, hit reaction, powering-up intensity.
- Detail callouts for silhouette, ears/tail/paws, fur markings, attack limbs, special-effect aura shape, readable gameplay pose shapes.
- Size reference and color swatches.
- Clean light background, high-quality 2D arcade fighting game concept art style, animation-friendly shapes, no watermark.

Rabbit prompt fill:

- Fighter: Gray Rabbit.
- Silhouette: long ears, compact athletic body, strong hind legs, springy hopping stance.
- Personality: cute, alert, determined, slightly comedic.
- Special color: green tornado energy.

Cat prompt fill:

- Fighter: Ginger/Orange Tabby Cat.
- Silhouette: fluffy orange tabby, round expressive face, agile body, visible striped tail.
- Personality: playful, confident, mischievous, dramatic.
- Special color: yellow-green aura/projectile.

## Required Visual Pack

The final asset pack must include:

- Rabbit/cat canonical sheets.
- Rabbit/cat animation rows: idle, walk forward/back, crouch, jump/hop, light attack, light kick, heavy attack, special, hitstun, blockstun, knockdown, win, lose.
- Bright stone courtyard parallax stage layers: sky/lighting, distant hills/city, trees/bushes/pillars/walls, playfield, foreground props/dust/leaves.
- Meowtal Kombat logo/title mark and title/key art.
- HUD frames, red rabbit health bar, blue cat health bar, timer, super/special meters, round/FIGHT/K.O./victory overlays.
- Character portraits.
- Pause/options/menu panels.
- Buttons/icons, mobile/touch controls, loading/fallback states.
- Particle sprites for hit sparks, dust, aura, tornado, projectile, screen flash, damage numbers.
- Capture/promo artwork if needed for completion evidence.

## Audio Strategy

Use a hybrid audio approach:

- Procedural WebAudio for highly responsive hits, blocks, UI ticks, meter pips, whooshes, charge pulses, and lightweight music beds.
- ElevenLabs `/v1/sound-generation` for custom one-shot SFX such as rabbit tornado, cat aura blast, K.O. burst, victory sting, and menu stinger. Prior key test succeeded and cost 10 credits for a 0.55s MP3.
- OpenAI TTS may be used for announcer barks only if a local API key is available and the license/provenance is recorded.
- Pixabay/Freesound/other libraries may be used only with source URL, license, author where required, download date, and usage recorded.
- Do not store API keys in the repo. Rotate previously pasted keys before final asset production.

## Provenance Requirements

Create a repo-native provenance file before final assets are approved, likely:

```text
docs/assets/meowtal-kombat-provenance.md
```

Track for each final asset:

- Asset id and runtime path.
- Source/generation method.
- Prompt or provider.
- License/terms.
- Date created/downloaded.
- Transform/normalization steps.
- Approval notes.

## QA And Consistency

Existing `npm run imagegen:qa` checks dimensions and runtime readiness. It must be extended or supplemented because the Meowtal goal requires:

- Same-character identity across every frame.
- Stable species, markings, proportions, lighting, camera angle, scale, line/detail level, and style.
- Clean alpha or no visible chroma residue.
- No text, logos, watermarks, frame numbers, detached fragments, or baked detached effects inside fighter rows.
- Parallax layers that stack cleanly and keep the fighting lane readable.
- Browser screenshots proving stage depth, HUD readability, and combat clarity.

## Worker-Ready Slices

1. Meowtal config/content foundation:
   - Extract title/subtitle/roster/stage/spritesheet metadata into config while preserving current behavior.
   - This reduces risk before content replacement.

2. Meowtal asset manifest and provenance scaffold:
   - Add manifest schema/content for rabbit, cat, courtyard, UI, audio, and provenance without generating final art.
   - Verify tests and readiness behavior.

3. Canonical character sheets:
   - Generate or integrate gray rabbit and ginger tabby sheets using the goal template.
   - Record provenance and perform visual QA before animation rows.

4. Parallax courtyard pack:
   - Generate/integrate layered courtyard stage.
   - Add actual runtime parallax movement, not just stacked images.

5. Logo/HUD/menu/overlay/control/particle pack:
   - Generate/integrate complete non-character visual surface assets.
   - Verify title/select/fight/pause/K.O. screenshots.

6. Rabbit/cat animation rows:
   - Generate, normalize, approve, and integrate rows in small batches.
   - Verify each row visually and via browser state.

7. Audio pack:
   - Add procedural and generated/licensed SFX/music with provenance.
   - Verify browser unlock behavior and event cues.

## Recommendation

Judge should select the config/content foundation first. Direct asset generation before config/provenance would produce files without a stable runtime destination and risks repeating the current hard-coded Atlas/Moroccan coupling.

