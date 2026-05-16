# T024 Special And Stinger Audio Batch

Result: done. Full AAA outcome remains incomplete.

This Worker shipped exactly four remaining non-loop runtime primary cues: `fight-announcer`, `rabbit-tornado`, `cat-aura-blast`, and `victory-sting`. The batch used only official Pixabay pages and local conversion. It did not use `.env`, APIs, login, ElevenLabs, music-loop, voice, TTS, spoken announcer output, uploaded voices, real-person voice cloning, roster changes, story changes, or animation rows.

Terms snapshot: 2026-05-16. Pixabay commercial embedding, attribution, standalone-distribution, and Content ID/platform-claim notes follow the T021 decision. Attribution is not required by Pixabay but is recorded in every source record and manifest entry.

## Accepted Cues

| Cue | Runtime file | Source | Creator | Runtime duration | Source hash | Runtime hash |
| --- | --- | --- | --- | ---: | --- | --- |
| `fight-announcer` | `public/assets/generated/audio/fight-announcer.ogg` | [Game Start](https://pixabay.com/sound-effects/film-special-effects-game-start-317318/) | 49447089 | 1.437s | `ec4f0a70f696060679f7ae228473020b3f59771d0bebfb5fa5d7eae06bc25c23` | `f191f20dd6e058a0a7d2c02f7773e0dbea5274353ad2b649cf67fa439def1de9` |
| `rabbit-tornado` | `public/assets/generated/audio/rabbit-tornado.ogg` | [Rotate Movement Whoosh 2](https://pixabay.com/sound-effects/film-special-effects-rotate-movement-whoosh-2-185336/) | floraphonic | 1.600s | `b883e41dc422cfa22a5fec5e8d72596118ab8f916c67f963a7878d5c7a1cfccf` | `7f5e0cbf9c23c9ffb2fb0a9df762ffd01dab6d80db83b0c0404e4c54b03539f5` |
| `cat-aura-blast` | `public/assets/generated/audio/cat-aura-blast.ogg` | [Energy Beam Blast (5)](https://pixabay.com/sound-effects/film-special-effects-energy-beam-blast-5-482509/) | Yodguard | 3.045s | `926be488ffc0a15b99d7ff9334558a476d2477e0cfc337f58ce531da02d4116c` | `3d5fed538f6b8aabfe4ff3b79c727c320a6deb147f389f8019d447a9827f2755` |
| `victory-sting` | `public/assets/generated/audio/victory-sting.ogg` | [correct_answer_toy_bi-bling](https://pixabay.com/sound-effects/technology-correct-answer-toy-bi-bling-476370/) | u_o8xh7gwsrj | 2.039s | `0de91cf7c214e5ca2c19b58a261e2e32dd69de2155f25a218a73a60a4297f960` | `17b9d62beef6587d0bf10b184d52eae07b9bb505b3da35f1d2e01ac09f40d16e` |

## Source Records

Each cue has:

- Source MP3 under `assets/source/audio/<cue>/`.
- `source-record.json` under `assets/source/audio/<cue>/`.
- Runtime OGG under `public/assets/generated/audio/<cue>.ogg`.
- Manifest provenance in `src/assets/meowtalProductionManifest.ts`.

Every record includes provider, creator, exact source URL, download URL, license URL, terms URL, snapshot date, attribution string, commercial-use note, standalone-distribution restriction, Content ID/platform-claim note, conversion notes, duration, hashes, and QA notes.

## Conversion

Runtime OGG files were encoded with native Vorbis:

`ffmpeg -i <source>.mp3 -map_metadata -1 -ac 2 -ar 48000 -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a vorbis -strict -2 public/assets/generated/audio/<cue>.ogg`

`rabbit-tornado` was trimmed to 1.6 seconds with a fade-out before normalization:

`atrim=0:1.6,afade=t=out:st=1.35:d=0.25,loudnorm=I=-16:TP=-1.5:LRA=11`

Runtime ffprobe output is stored at `output/audio/aaa-expansion-special-stinger-batch/ffprobe-runtime-audio.jsonl`.

## QA Notes

- `fight-announcer`: non-speech fight-start stinger, no voice or announcer imitation.
- `rabbit-tornado`: spinning special whoosh, trimmed for gameplay timing.
- `cat-aura-blast`: non-vocal energy-blast impact for Marmalade's special.
- `victory-sting`: cute non-vocal win chime, not looped music.

No cue is music-loop, speech, TTS, voice, ElevenLabs output, or standalone redistributable sample-library material. Smoke passed and still shows only Gray Rabbit and Ginger Tabby Cat as playable runtime fighters.
