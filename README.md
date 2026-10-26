# Meowtal Kombat

A browser fighting game. A gray rabbit and a ginger tabby cat fight best-of-three rounds in a parallax courtyard, against a friend or a CPU with three difficulty levels. It plays on desktop with a keyboard and on phones with touch controls.

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/.

## Controls

| Key | Action |
|---|---|
| `Enter` | Title to fighter select, start the match, continue after a round |
| `A` / `D` | Move (P1), pick a fighter on the select screen |
| `Arrow Left` / `Arrow Right` | Pick P2's fighter on the select screen |
| `Space` or `J` | Light punch |
| `I` | Light kick |
| `K` | Heavy attack |
| `L` | Special attack |
| `C` | Switch P2 between CPU and manual |
| `V` | Cycle CPU difficulty (easy, normal, hard) |
| `P` or `Esc` | Pause |
| `F` | Fullscreen |
| `R` | Back to title |

On phone-sized screens, touch controls appear in portrait and landscape.

## How it's built

- **Combat core:** deterministic TypeScript on a fixed timestep, separate from rendering, so fights replay the same way in tests.
- **Shell:** Phaser 4 for scenes, HUD, input, camera shake, and hit and block effects.
- **Audio:** procedural sound effects and music, no audio files.
- **Art:** generated fighter sprites (14 animation rows per fighter) and stage layers, checked by an asset QA script before they ship.
- **Tests:** Vitest covers combat, animation mapping, character select, and the asset pipeline.

## Verify

```bash
npm run verify   # typecheck, tests, production build (same as CI)
```

The browser smoke test, asset regeneration pipeline, and scope notes are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
