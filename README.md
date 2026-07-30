# letools-site

The hub site for the **LE family** of VS Code extensions — ten free,
single-purpose devtools — at [letools.dev](https://letools.dev).

One static page, built with [HeroUI v3](https://heroui.com) on Next.js 16
(App Router, `output: "export"`), themed light/dark via next-themes.

## Page map

| Section | What it is |
|---|---|
| Hero | Family tagline + badges + CTAs |
| The tools | 10 cards, filterable by category (Extract / Check / Guard), each linking to VS Code Marketplace, Open VSX, and GitHub |
| Why LE | The four family promises |
| Install | Per-editor install commands with copy buttons |
| FAQ | Accordion |

The tool list lives in `lib/tools.ts` — the grid, tabs, and links all render
from it.

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
