# T021 Audio Source And License Scout

Snapshot date: 2026-05-16

Result: bounded acquisition may proceed, but only for a first sample/audio cue batch that follows the provider restrictions below. No API call, login, `.env` access, audio download, generation, voice cloning, or asset acquisition was performed for this Scout.

## Local Contract Read

The runtime audio contract in `src/game/audio.ts` already matches the owner's direction: every cue has a planned primary asset of kind `authored-sample`, a required source/license record, and a runtime destination under `/assets/generated/audio/<cue>.ogg`. The current WebAudio synthesis remains a `dev-only` procedural fallback, not the primary shipped audio direction.

Current cue map:

| Cue | Role | Allowed source kinds in code | T021 provider decision |
| --- | --- | --- | --- |
| `music-loop` | Looping fight bed | `pixabay`, `manual` | Allow Pixabay music only if embedded as part of game, non-standalone, source-recorded, and Content ID risk is captured; prefer manual/owned for final AAA music. ElevenLabs Music remains blocked for this cue. |
| `ui-confirm` | Menu select tick | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `fight-announcer` | Fight-start bark/stinger | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow non-voice stingers from Pixabay/manual/ElevenLabs Sound Effects. Block ElevenLabs voice/TTS until a separate voice plan exists. |
| `hit-light` | Light impact pool | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `hit-heavy` | Heavy impact pool | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `block-impact` | Guard impact | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `dash-whoosh` | Dash/hop/roll whoosh | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `rabbit-tornado` | Bunjamin special spin | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `cat-aura-blast` | Marmalade special burst | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `ko-burst` | K.O. burst | `pixabay`, `manual`, `elevenlabs-sound-generation` | Allow Pixabay SFX, manual/owned, or ElevenLabs Sound Effects. |
| `victory-sting` | Short victory sting | `pixabay`, `manual` | Allow Pixabay short music/SFX sting or manual/owned only. ElevenLabs Music and ElevenLabs Sound Effects remain blocked unless code contract is changed by a later Judge/Worker. |

`src/assets/meowtalProductionManifest.ts` currently records all audio cues as approved procedural fallbacks while the authored/sample primaries remain planned. `test/presentation.test.ts` confirms authored samples are loaded first when present and procedural fallback is only used when missing. `test/meowtal-production-manifest.test.ts` also rejects `elevenlabs-music` in primary audio specs.

## Official Sources Checked

Pixabay:

- [Pixabay Content License Summary](https://pixabay.com/service/license-summary/), checked 2026-05-16.
- [Pixabay Terms of Service](https://pixabay.com/service/terms/), last updated 2024-11-18, checked 2026-05-16.
- [Pixabay FAQ: Music / Content ID](https://pixabay.com/service/faq/), checked 2026-05-16.
- [Pixabay API Documentation](https://pixabay.com/api/docs/), checked 2026-05-16.

ElevenLabs:

- [ElevenLabs Terms of Service](https://elevenlabs.io/terms-of-use), last updated 2026-03-31, checked 2026-05-16.
- [ElevenLabs help: Can I publish generated content?](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform), checked 2026-05-16.
- [ElevenLabs Sound Effects Terms](https://elevenlabs.io/sound-effects-terms), last updated 2026-02-12, checked 2026-05-16.
- [ElevenLabs Prohibited Use Policy](https://elevenlabs.io/use-policy), last updated 2025-09-03, checked 2026-05-16.
- [ElevenLabs Sound Effects help article](https://help.elevenlabs.io/hc/en-us/articles/25735182995985-What-is-Sound-Effects), checked 2026-05-16.
- [ElevenLabs Music Terms](https://elevenlabs.io/music-terms), last updated 2025-11-21, checked 2026-05-16.
- [Eleven Music v1 Terms](https://elevenlabs.io/eleven-music-v1-terms), last updated 2026-03-24, checked 2026-05-16.
- [ElevenLabs Voice Library Addendum](https://elevenlabs.io/vla), last updated 2026-03-06, checked 2026-05-16.

## Pixabay Decision

Pixabay is approved for a first audio Worker, with restrictions.

Commercial use and embedding: Pixabay's terms define Audio as including music, sounds, and sound effects. For non-CC0 content, the Content License grants a worldwide, non-exclusive, royalty-free right to download, use, copy, modify, or adapt content for commercial or non-commercial purposes, subject to prohibited uses. Embedding a track or SFX inside Pawbreaker as part of a larger creative game work is compatible with that shape.

Attribution: Pixabay says attribution is not required but appreciated. For this project, record attribution anyway in source metadata and add a credits entry if a runtime cue ships, because it improves auditability and costs us nothing.

Redistribution/game embedding: Standalone sale or distribution is prohibited. A game build that embeds audio as part of the interactive work is not standalone, but the Worker must not expose the original file as a downloadable sample pack, music library, or isolated asset collection.

Prohibited-use risks: Avoid clips with recognizable trademarks, brands, recognizable people, samples, or material that suggests a third-party endorsement. Do not use Pixabay content as a trademark, brand sound, or official service mark.

Content ID and platform-claim risk: Pixabay explicitly warns that some music may be registered with YouTube Content ID and can trigger claims even when use is legal. The Worker must prefer tracks not registered with Content ID when possible, keep download records, source URL, file name, license URL, and any certificate/shield state, and record platform-claim notes. For streaming/video exports, claims may still occur on YouTube, Instagram, Facebook, Pinterest, or similar platforms; this does not block browser game embedding, but it must be documented.

API note: The current official Pixabay API documentation is for images/videos. Do not use the API key for audio acquisition unless a later Scout verifies a current official audio API path. The next Worker should manually source from official Pixabay pages or use no Pixabay asset.

Pixabay cue recommendation:

- Approved now: `music-loop`, `victory-sting`, and all SFX cues if the specific asset record passes QA.
- Prefer non-Content-ID tracks for `music-loop` and `victory-sting`.
- Prefer short SFX for impacts and movement over long music beds.
- Block any asset with unclear source page, no creator/title, copied brands/logos/voices, or unresolved claim warning.

## ElevenLabs Sound Effects Decision

ElevenLabs Sound Effects is approved for a first SFX-only Worker, with restrictions.

Commercial use and tier: ElevenLabs' public help and Prohibited Use Policy distinguish free and paid usage. Free usage is non-commercial; paid subscription output can be used commercially if the user has the necessary IP rights and follows the Terms and Prohibited Use Policy. Therefore any runtime-bound ElevenLabs SFX must be generated under a paid plan/account whose plan status is recorded. This Scout did not inspect `.env`, account plan, or credits.

Output rights: ElevenLabs Terms say users retain rights in Output as between the user and ElevenLabs, subject to the terms and policies. Outputs may be downloaded where the Service enables it.

Sound Effects terms: Sound Effects creates SFX Outputs. The terms also say SFX Outputs can be sublicensed to third parties unless the user opts out through the product page; opting out does not unwind prior sublicenses. For this project, the next Worker must immediately disable sublicensing/third-party availability for SFX Outputs before generating any runtime candidate, or stop.

Standalone prohibition: The Prohibited Use Policy blocks selling, reselling, licensing, sublicensing, distributing, performing, or commercially exploiting Sound Effects Output on a standalone basis, including isolated files, samples, sound libraries, or collections. Embedding a sound effect inside the game is materially different from standalone redistribution, but the project must not publish the generated files as a sample pack or source library.

Prohibited-use risks: Do not generate SFX that infringe third-party IP, mimic named game/audio brands, target real people, or create deceptive/unauthorized impersonation. Brutal/funny fictional game sounds are acceptable only as fictional, stylized, non-realistic effects.

Content ID and platform-claim risk: I found no official ElevenLabs Sound Effects page that gives a Content ID guarantee. This is bounded by only using short, non-musical, non-voice SFX for event cues and recording prompt/model/settings/output hash. Do not use ElevenLabs SFX for music loops, victory music, or speech-like announcer calls in the next Worker.

ElevenLabs SFX cue recommendation:

- Approved now: `ui-confirm`, `hit-light`, `hit-heavy`, `block-impact`, `dash-whoosh`, `rabbit-tornado`, `cat-aura-blast`, `ko-burst`.
- Approved only as non-speech stinger: `fight-announcer`.
- Blocked: `music-loop`, `victory-sting`, any music-like loop, any voice/TTS/announcer speech, any output that will be distributed standalone.

## ElevenLabs Music And Voice Risk

ElevenLabs Music remains blocked for runtime audio in the next Worker.

The project code already excludes `elevenlabs-music` from every primary audio cue. Eleven Music v1 terms include plan-specific eligibility, generation/download limits, attribution requirements, and media rights that allow self-serve commercial use except film, TV, radio, and large studio games. They list independent interactive media, websites, apps, and digital experiences as examples of permitted self-serve or Enterprise Music Lite commercial uses, but the owner's ambition is a AAA-grade game program and the line between "indie game" and "large studio game" is a release/business decision, not a code decision. For now, use Pixabay or manual/owned music; revisit ElevenLabs Music only after a Judge approves a separate music plan with the exact plan/tier and release scale.

ElevenLabs voice/TTS/voice library use remains blocked for runtime audio in the next Worker.

Reason: the local contract has no `elevenlabs-voice` source kind; the Prohibited Use Policy restricts unauthorized impersonation; the Terms require rights for any voice inputs; and the Voice Library Addendum has separate rules for shared User Voice Models. If Pawbreaker needs funny announcer speech later, safest path is an owned/manual actor recording or a separate ElevenLabs voice Scout/Worker that uses an original synthetic voice, no real-person clone, paid plan, disclosure/credits if required, and explicit consent/source records.

## Manual / Owned Fallback

Manual or owned audio is always approved when it is genuinely owned by the project: original recording, commissioned composition, or internally authored DAW/sample work with no uncleared third-party samples. It should be the preferred path for final AAA music because it avoids platform-claim ambiguity and lets the team art-direct the Pawbreaker identity instead of stitching together generic stock loops.

Manual source records still need proof: creator, date, tool/project file, sample sources if any, signed/recorded rights if commissioned, export path, runtime path, duration, hash, and QA notes.

## Required Source Record Before Runtime Promotion

Every external or generated cue must have a source record before any file lands in `/public/assets/generated/audio/`:

- `assetId` and cue id.
- `sourceKind`: `pixabay`, `elevenlabs-sound-generation`, or `manual`.
- Provider name and product: e.g. Pixabay Music, Pixabay Sound Effects, ElevenLabs Sound Effects.
- Provider URL and exact source URL or generation job URL when available.
- Creator/artist/uploader or model/product name.
- Title, provider asset id, download file name, and original file extension.
- Generation prompt, model/version, settings, duration, and date for ElevenLabs outputs.
- Terms URLs, license summary URL, and terms snapshot date: `2026-05-16` or newer if acquired later.
- Plan/tier and commercial-use note for ElevenLabs; must confirm paid plan for commercial runtime use.
- Attribution requirement and exact credits string.
- Standalone-distribution restriction note.
- Content ID / platform-claim note: shield/certificate state for Pixabay music; no music/voice use for ElevenLabs SFX; any known claim risk.
- Source path under `assets/source/audio/...`.
- Runtime path under `/assets/generated/audio/<cue>.ogg`.
- Conversion/transformation command and normalization notes.
- Duration, loopability, loudness target, file size, and SHA-256 hash.
- QA notes: no clipping, no clicks at loop boundary, no speech if not approved, no recognizable brands/people, fits cute-brutal funny tone.
- Approver/task id and verification commands.

## Recommendation For T022

Proceed with a bounded Worker for a first authored/sample audio batch. Keep it small enough to QA properly and avoid music/voice ambiguity.

Recommended T022 Worker objective:

"Acquire or author the first six runtime primary audio cues with source records and QA proof: `ui-confirm`, `hit-light`, `hit-heavy`, `block-impact`, `dash-whoosh`, and `ko-burst`. Use Pixabay SFX, ElevenLabs Sound Effects under a paid plan with SFX sublicensing disabled, or manual/owned recordings only. Do not acquire music, victory music, voice, or spoken announcer cues in this slice. Convert accepted assets to OGG at `/assets/generated/audio/<cue>.ogg`, register source/license metadata, and prove the sample-first runtime uses them before dev-only procedural fallback."

Allowed provider/source kinds for T022:

- `manual` for all six cues.
- `pixabay` for all six cues, official Pixabay source page only.
- `elevenlabs-sound-generation` for all six cues only if paid commercial plan status is recorded and SFX output sublicensing is disabled before generation.

Suggested T022 allowed files:

- `assets/source/audio/<cue>/...`
- `public/assets/generated/audio/<cue>.ogg`
- `src/assets/meowtalProductionManifest.ts`
- `src/assets/provenance.ts` if a narrower audio source-record type is required.
- `test/meowtal-production-manifest.test.ts`
- `test/presentation.test.ts`
- `docs/goals/aaa-game-expansion/notes/T022-audio-batch.md`
- `output/audio/aaa-expansion-first-sample-batch/...`

Suggested T022 verify:

- `npm test -- test/presentation.test.ts test/meowtal-production-manifest.test.ts`
- `npm run typecheck`
- `npm run verify`
- `rg -n "ui-confirm|hit-light|hit-heavy|block-impact|dash-whoosh|ko-burst|Pixabay|ElevenLabs|commercial|attribution|Content ID|platform-claim|snapshot" docs/goals/aaa-game-expansion/notes/T022-audio-batch.md src/assets/meowtalProductionManifest.ts`
- `test -s public/assets/generated/audio/ui-confirm.ogg && test -s public/assets/generated/audio/hit-light.ogg && test -s public/assets/generated/audio/hit-heavy.ogg && test -s public/assets/generated/audio/block-impact.ogg && test -s public/assets/generated/audio/dash-whoosh.ogg && test -s public/assets/generated/audio/ko-burst.ogg`

Suggested T022 stop conditions:

- Need to use `.env`, API calls, login, or account plan details but cannot verify paid commercial status and SFX sublicensing opt-out first.
- Need music, victory sting, voice, TTS, real-person voice cloning, uploaded voices, or spoken announcer output.
- A candidate has unclear provider URL, missing creator/title, unclear commercial use, missing attribution/credits string, or unresolved Content ID/platform-claim risk.
- Any source would require standalone redistribution, sample-library distribution, or terms more permissive to end users than the source terms.
- Any output sounds generic, clipped, noisy, too procedural, too realistic/gory, mismatched to Pawbreaker tone, or lower quality than the existing dev fallback.
- Need runtime roster, fighter art, story, select UI, or any non-audio work.

Full AAA outcome remains incomplete. T021 only clears the legal/source path for the first authored/sample audio slice; it does not ship audio, expand the roster, or finish the game.
