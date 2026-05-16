# T022 First Authored Sample Audio Batch

Result: done. Full AAA outcome remains incomplete.

This Worker shipped the first six runtime primary sample cues for Pawbreaker League without using `.env`, API calls, login, ElevenLabs generation, music, voice, TTS, uploaded voices, or spoken announcer output. The batch uses official Pixabay Sound Effects pages only, with local source records and converted OGG runtime files.

Terms snapshot: 2026-05-16. Provider decision follows T021: Pixabay SFX is allowed for commercial browser-game embedding with attribution recorded for audit, no standalone redistribution, and Content ID/platform-claim notes captured. ElevenLabs was not used because paid plan status and Sound Effects sublicensing opt-out were not verified in this slice.

## Accepted Cues

| Cue | Runtime file | Source | Creator | Duration | Source hash | Runtime hash |
| --- | --- | --- | --- | ---: | --- | --- |
| `ui-confirm` | `public/assets/generated/audio/ui-confirm.ogg` | [Menu Button](https://pixabay.com/sound-effects/film-special-effects-menu-button-190039/) | Liecio | 1.020s | `2fc41e360c25f378a04f460b1a13dac36312e165dcb1ed82a56234a3c1a1c3b1` | `11d89faaf9fa717e2a1cae973a1826a655110de4553f208402f44ce5bc46d1a5` |
| `hit-light` | `public/assets/generated/audio/hit-light.ogg` | [Classic Punch Impact](https://pixabay.com/sound-effects/film-special-effects-classic-punch-impact-352711/) | Universfield | 0.720s | `81d76f16094e6f6b09e28e930e2900571a8b46d83fab0e9ac9b9a6b7a96cc694` | `83709c83a77354fc81abd7f3d5743bdd967c8b3072dd63fc6bc81b4ce3e3ea85` |
| `hit-heavy` | `public/assets/generated/audio/hit-heavy.ogg` | [Hard Heavy Impact](https://pixabay.com/sound-effects/film-special-effects-hard-heavy-impact-515256/) | DRAGON-STUDIO | 2.904s | `5b19974d1914c70cf7fcc838674813ae27ebd7696d4063a3a0e61ee1c1530275` | `3a00f0a6869845454fa5a0dd44d4750147d3600d8a471a51bd53d20787411a13` |
| `block-impact` | `public/assets/generated/audio/block-impact.ogg` | [clack](https://pixabay.com/sound-effects/film-special-effects-clack-85854/) | freesound_community | 0.408s | `f875bb17f373f176373183960c9895c91aba5f74c142ce3e4f2a6c7b765306ef` | `29ecaa360e85e839d2be0b1829ea6ec5fac0111cd4f3109b8a0a2912d00f60df` |
| `dash-whoosh` | `public/assets/generated/audio/dash-whoosh.ogg` | [Simple Whoosh](https://pixabay.com/sound-effects/film-special-effects-simple-whoosh-382724/) | DRAGON-STUDIO | 0.576s | `c2efd9d902a59bf9ec5019035d7deadd17762136896b6e3cb6dd99ea50997a30` | `0818336cb25ec4f61757b84bf70c6dcc6f41a06ecfd7f03bbf25ff688735aebc` |
| `ko-burst` | `public/assets/generated/audio/ko-burst.ogg` | [Animated Cartoon Explosion Impact](https://pixabay.com/sound-effects/film-special-effects-animated-cartoon-explosion-impact-352744/) | Universfield | 2.376s | `526e9be9511bc120af3bac6abf4c28b1a3f0ea5d5d08fc02b7a80d2ffae4ca60` | `dba798ce0039aff0c29671b73387111e938e40e2a7ce00c46e6717b7e94aca07` |

## Source Records

Each cue has:

- Source MP3 under `assets/source/audio/<cue>/`.
- `source-record.json` under `assets/source/audio/<cue>/`.
- Runtime OGG under `public/assets/generated/audio/<cue>.ogg`.
- Manifest provenance in `src/assets/meowtalProductionManifest.ts`.

Every source record includes provider, creator, source URL, download URL, license URL, terms URL, snapshot date, commercial-use note, attribution note, standalone-distribution restriction, Content ID/platform-claim note, source/runtime paths, hashes, duration, conversion command summary, and QA notes.

## Conversion

The local ffmpeg build did not include `libvorbis`, so conversion used native Vorbis:

`ffmpeg -i <source>.mp3 -map_metadata -1 -ac 2 -ar 48000 -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a vorbis -strict -2 public/assets/generated/audio/<cue>.ogg`

Runtime ffprobe output is stored at `output/audio/aaa-expansion-first-sample-batch/ffprobe-runtime-audio.jsonl`.

## QA Notes

- `ui-confirm`: crisp, non-speech confirm tick.
- `hit-light`: short classic arcade punch impact.
- `hit-heavy`: larger impact punctuation, still stylized.
- `block-impact`: compact clack that reads as guard contact.
- `dash-whoosh`: clean movement whoosh for dash, hop, and roll.
- `ko-burst`: comic cartoon burst for K.O. punctuation, not realistic gore.

No cue contains voice, TTS, spoken announcer content, music beds, recognizable brands, copied fighting-game audio identity, or realistic gore. No ElevenLabs output was generated. No asset is approved for standalone redistribution as a sound library, isolated sample, or asset pack.
