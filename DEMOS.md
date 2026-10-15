# Demos

**Status:** done. Every tool has its three recordings in `assets/demos/`,
the old layout is gone, and the site serves video made from each editor
master. Recorded once per tool, by hand, in one pass. Not re-recorded on a
schedule.

Every tool shows each surface it has, the editor, the command line and the MCP
server, in a recording a reader can read at the size it is shown. This file is
the standard every recording is held to and the order the fleet is moved in.
It lives here because only this repo sees all seventeen tools at once.

## Why this replaces what is there

- Two layouts. The ten older repos keep the editor demo at
  `src/assets/images/demo.gif` and a terminal demo at `assets/demo.gif`; the
  six newer ones have only the terminal demo; DecisionLint has an editor demo
  at `assets/demo.gif` and a CLI demo at `assets/demo-cli.gif`.
  `sourceFor` in `scripts/sync-demos.ts` picks the path from `REPOS`, so it
  broke when the six joined it, and `sync:demos` refuses the whole run.
- Legibility. Terminals were recorded at 1200 px with a 17 px font and shown
  at 800 px, about 11 px of text. Editor demos were captured at 1x, about
  900 px wide, and dithered to a 256-colour GIF, so every glyph was soft.
- The small size was never about the packages. Every `.vscodeignore` is an
  allow-list that ships no demo, the npm `files` lists name none, and a
  crate is packaged from `crate/`, which `assets/` sits outside. What it
  held down was the site's payload and the repos' history, and one
  recording pass is a one-time cost to both.

## Layout, in every tool repo

```
assets/demos/
  editor.mp4   editor.gif   editor/   the recorder's inputs: file, settings
  cli.mp4      cli.gif      cli/      cli.tape and the files it reads
  mcp.mp4      mcp.gif      mcp/      mcp.tape, the host config, PROMPT.md
```

- `<surface>.mp4` is the master. Both other outputs are made from it, never
  from each other.
- `<surface>.gif` is what the README embeds.
- `<surface>/` holds everything needed to record that surface again: the
  only way to change one demo later without rebuilding its setup.
- A surface a tool does not have is absent, never a placeholder. Today all
  seventeen have all three.

## Frame

- **1600 x 1000 output pixels**, 16:10, every surface.
- The frame is shown about 800 px wide on GitHub, the Marketplace and the
  site card, so text size is judged there.
  - **Terminal: 14 px at 800 wide.** `Set Width 1600`, `Set Height 1000`,
    `Set FontSize 28`, `Set Padding 32`. About 27 rows; content past that
    scrolls, and the demo loses its own opening.
  - **Editor: about 11 px at 800 wide, drawn at twice the pixels.** The
    window is 1200 x 750 at a device scale factor of 2, editor font 17,
    captured at 2400 x 1500 and scaled to 1600 x 1000. Most tools show the
    source and their results side by side, and two code panes do not fit
    in a smaller window: at 1000 x 625 String-LE and Paths-LE cut every
    source line, and word wrap doubled each line instead. Legibility here
    comes from pixel density, which a high-density screen shows in full.
  - **Editor inputs are written for the frame:** source lines of about 50
    characters at most, so neither pane cuts one off.
  - **No diagnostics but the tool's own.** The built-in TypeScript
    extension is off for the recording, as DecisionLint's recorder already
    does: a demo file imports modules that are not installed, and their
    errors are noise about nothing the tool does.
- **The first frame carries content.** The site's poster is frame one.
- **30 seconds at most.** A demo that needs longer is two demos.
- **Nothing private on screen:** no real key, email, name or home path. Work
  in a temp directory named for the demo.
- Themes: `Catppuccin Mocha` in the terminal, as today; the editor's default
  dark theme.

## Encoding

One ffmpeg recipe per output, in one script shared by the fleet, so 51
recordings come out alike.

| Output | Settings |
|---|---|
| Master `.mp4` | H.264, `yuv420p`, CRF 16, `+faststart`. Editor at 30 fps from the timed frames; terminal as vhs writes it |
| README `.gif` | 1600 px, 10 fps, a palette made from the clip (`stats_mode=diff`), **no dithering** |
| Site video | made by `sync:demos` from the master: H.264, `yuv420p`, muted, looped, inline, with the poster from frame one |

Dithering is off because flat UI and terminal colours are what a palette
holds exactly, and dither noise on glyph edges is what made the old editor
demos soft.

## Capture

- **Editor.** Generalised from DecisionLint's
  `scripts/record-editor-demo.mjs`: Playwright starts the VS Code the
  integration tests download, with its own profile and the packaged
  extension. Playwright's own `recordVideo` is a low-bitrate VP8 stream, too
  soft for this standard, so frames are captured losslessly and encoded by
  the shared script. Measured on DecisionLint, 2026-10-14: a
  `page.screenshot()` loop at `--force-device-scale-factor=2` and an
  800 x 500 content size gives 1600 x 1000 PNGs at about 28 fps. At the
  1200 x 750 window above a frame is 2.25 times the pixels, and the rate is
  measured again in the pilot. Each frame
  keeps its wall-clock time and the encoder places it there, so the clip
  plays at true speed whatever the loop managed. CDP screencast sends a
  frame only when the screen changes, at irregular times, and is not used.
- **CLI.** vhs, driving the built binary against the files in `cli/`.
  vhs 0.11 writes its MP4 at 25 fps whatever `Set Framerate` says, which is
  enough for typing and printed output. Its MP4 is the master as it comes.
- **MCP.** vhs, driving an agent host in the terminal against the files in
  `mcp/`, with the tool's server in the host's project config and its tools
  pre-approved. The model answers differently each run, so `PROMPT.md`
  records the host and its version, the model, the prompt and the date, and
  the take is the one kept. A recording costs one metered run, by hand.

## Where each recording is shown

- **README** (GitHub, Marketplace, Open VSX): `editor.gif` under the title,
  `cli.gif` in the command line section, `mcp.gif` in the MCP section. One
  demo at the top, each of the others beside the surface it shows.
- **npm READMEs** (`npm/`, `mcp/`) and **the crate README**: the one demo of
  that surface. Whether each registry resolves a relative image path is
  checked in the pilot, and an absolute URL is used where it does not.
- **letools.dev**: video, not GIF, copied by `sync:demos` with the hash in
  its name, as today. The site does not embed from GitHub: that would give
  up the stable cached URLs, the poster and `check:demos`, and put GitHub
  uptime under every page.

## Rollout

1. This standard.
2. The shared recorders and encoding script.
3. **Pilot: DecisionLint**, all three surfaces, checked as rendered on
   GitHub, the Marketplace, Open VSX, npm and crates.io. The numbers above
   are corrected from what it shows, once.
4. **units-le**, the first tool with no editor demo today, which tests that
   the recorder runs on a tool it was not written for.
5. `sync:demos` reads the new layout and makes the site video;
   `bun run budget` is measured again from the new payload, with room.
6. The other fifteen repos, one pull request each, and a fleet check that
   every tool has the layout and the inputs beside each recording.
7. The old layout goes, and with it the branch in `sourceFor`.
