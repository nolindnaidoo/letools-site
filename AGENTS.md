# letools-site — agent guide

Source of truth for working in this repo. If you change a convention, update
this file in the same change. Engineering conventions are adapted from
`~/dev/rust/pixelcoords-site/AGENTS.md`; the **design is deliberately
independent** — this site rides HeroUI's own design language, not the pixel
sites' terminal-poster aesthetic.

## What this repo is

The hub site for the LE family of VS Code extensions (`~/dev/extensions/*-le`),
at **https://letools.dev**. A fully static one-pager: `output: "export"`, no
API routes, no server actions, no fetches. Deploy is `git push` to `main` →
Vercel. **One page** (plus the 404) is a product rule — a second page is a
product decision, not a PR.

## Stack snapshot

- **Next.js 16** (App Router) on React 19, static export. `@/*` → repo root.
- **Components: HeroUI v3** (`@heroui/react` + `@heroui/styles`, react-aria
  based) — and unlike the pixel sites, **the primitives are actually in use**:
  Button, Card, Chip, Tabs, Accordion, Link, Separator. Compound API
  (`Card.Header`, `Tabs.Panel`, `Accordion.Trigger`, …). The default HeroUI
  theme is kept wholesale; `globals.css` adds only font wiring.
- **Styling:** Tailwind v4 via PostCSS. HeroUI semantic tokens only
  (`bg-background`, `bg-surface`, `text-muted`, `border-border`,
  `*-soft` washes) — never hardcode a hex in a component.
- **Theming:** next-themes toggles `.light`/`.dark` on `<html>`; system
  until the header ThemeToggle records an explicit choice.
- **Fonts:** Geist Sans (body) + Geist Mono (tool ids, commands) via
  `next/font/google`.
- **Lint/format:** Biome (single quotes, no semicolons, 2-space, 100-col,
  JSX attrs double-quoted, `tailwindDirectives` parser flag on).
- **Package manager:** bun. Never add another lockfile.

## Architecture

```
app/          routes (shims), fonts, providers, globals.css, not-found
features/     home/ — hero, tool-grid, principles, install, faq
components/   shared UI: site-header, site-footer, theme-toggle, command-snippet
ui/           thin @heroui/react re-exports, one file per primitive —
              feature code imports HeroUI from ui/, NEVER @heroui/react directly
lib/          tools.ts (THE tool registry) · site.ts (urls/name/theme colors) ·
              error.ts (reportError seam — every catch routes through it)
```

- **`lib/tools.ts` is the single tool registry.** The grid, category tabs,
  and every marketplace/Open VSX/GitHub link render from it. A new tool is
  one entry there, nothing else.
- Server Components by default; `"use client"` only at interactive leaves
  (tool-grid and install use Tabs; theme-toggle and command-snippet own
  browser state).
- No barrels. Features don't import features.

## Content truth

Every claim must stay provable against the extension repos: local-only /
no network access, MIT, 13 locales, the 3-OS CI + test bar, publisher ids.
Tool summaries come from each tool's manifest — keep them in step, never
embellish. No invented download counts, stars, or testimonials.
Card icons (`public/icons/`, downscaled to 128px) and hover demos
(`public/demos/`) are copied from each tool repo's `src/assets/images/` —
refresh them when a tool's branding or demo changes.

## Code principles

kebab-case files · PascalCase components · early returns, no `else` chains ·
3+ case mappings are `as const` lookup tables · never mutate props/state ·
every catch routes `reportError(error, { source })` · a floating promise
without `.catch()` is a bug (the clipboard write included) · no class
components · ~200-line split threshold.

## Mobile-first & a11y

Base classes target the smallest screen; `sm:`/`md:` are enhancement —
verify at 375px. `min-h-dvh`, skip link first-focusable, one
`<main id="main-content">`, focus rings stay, `prefers-reduced-motion`
respected (scroll-behavior included). Both schemes must remain readable —
screenshots in light, dark, and mobile before shipping visual changes.

## Verification — the definition of done

```bash
bun run verify   # lint + typecheck + build (static export to out/)
```

After `build`, `out/` must contain the page HTML, `robots.txt` and
`sitemap.xml` (both static in `public/`), and the build-time PNGs from
`app/icon.tsx` / `apple-icon.tsx` / `opengraph-image.tsx` (Satori —
literal hexes only in those files). Serve `out/` and click through:
category tabs filter, FAQ expands, the copy button writes the clipboard,
theme toggle flips. Security headers live in `vercel.json`.

## Scope discipline

When the requested change is done, stop. No unrequested components, pages,
or robustness tweaks.
