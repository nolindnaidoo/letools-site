# letools-site

The hub site for the **LE family** of VS Code extensions — free,
single-purpose devtools — at [letools.dev](https://letools.dev).

A static export, built with [HeroUI v3](https://heroui.com) primitives under
the site's own tokens on Next.js 16 (App Router, `output: "export"`), themed
light/dark via next-themes.

## Page map

| Section | What it is |
|---|---|
| Hero | Tagline, the family's facts in one line, CTAs, and the featured tool's recording |
| The tools | Three bands — Extract, Check, Guard — each with its reason and its tools as rows linking to the tool page, VS Code Marketplace, Open VSX, npm and GitHub |
| Why LE | The four family promises |
| Install | Per-editor install commands with copy buttons, and the Rust CLI |
| Agents | Build the MCP config for the client and tools you pick |
| Beyond the editor | The two Rust desktop tools (pixelcoords, pixelactions) with links to their sites |
| FAQ | Accordion |

Every tool also has its own page at `/tools/<id>`. The tool list lives in
`lib/tools.ts` — the bands, the pages, and every link render from it.

## Development

```bash
bun install
bun run dev      # local dev
bun run verify   # lint + typecheck + build
bun run start    # serve the static export from out/
```

Conventions live in [AGENTS.md](AGENTS.md). Deploy is `git push` to `main`
(Vercel builds the static export).

## License

MIT © [nolindnaidoo](https://github.com/nolindnaidoo)
