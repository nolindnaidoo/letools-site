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
  theme is kept except for contrast-tuned token overrides in `globals.css`
  (accent/muted — every value clears WCAG AA, axe-verified both schemes);
  otherwise only font wiring.
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
app/          routes (shims), fonts, providers, globals.css, not-found,
              sitemap.ts (generated from the registry), tools/[id] (one
              static page per tool, emitted by generateStaticParams)
features/     home/ — hero, tool-grid, principles, install, faq
              tool/ — hero, install, links, siblings (the per-tool page)
components/   shared UI: site-header, site-footer, theme-toggle, command-snippet
ui/           thin @heroui/react re-exports, one file per primitive —
              feature code imports HeroUI from ui/, NEVER @heroui/react directly
lib/          tools.ts (THE tool registry) · site.ts (urls/name/theme colors) ·
              error.ts (reportError seam — every catch routes through it)
```

- **`lib/tools.ts` is the single tool registry.** The grid, category tabs,
  every marketplace/Open VSX/GitHub/npm/MCP-registry link, the per-tool
  pages, the sitemap and the e2e page list all render from it. A new tool is
  one entry there, nothing else — including its page and its audit.
- Server Components by default; `"use client"` only at interactive leaves
  (tool-grid and install use Tabs; theme-toggle and command-snippet own
  browser state).
- No barrels. Features don't import features.

## Content truth

Every claim must stay provable against the extension repos. Verify before
writing, because these have each been wrong on this site before:

**What the rule is about, and what it is not.** It governs **behaviour and
numbers** — what a tool does, what it refuses, how many locales it ships, what
a benchmark measured. Those are true or false against the tree right now, and
a wrong one is a lie on a product page.

It does **not** govern **availability** — whether a crate is on crates.io, an
extension is on a marketplace, a listing has merged. Those are facts about a
registry at a moment in time, and every one of them is false right up until the
moment you make it true. Reading the rule as "you may not write the sentence
yet" makes launch copy unwritable, which makes the launch itself impossible:
the copy has to exist before the publish, and the publish is what the copy is
about.

**So staging copy ahead of a release is expected, not a violation.** Write it.
Availability is declared in exactly one place and the page renders from that
declaration, so unflipped copy cannot assert anything:

- `cratePublished` in `lib/tools.ts` — while it is false the page describes the
  CLI and links its source, and never links a crates.io URL that would 404.
- `EXTENSION_PENDING` in `scripts/check-fleet.ts` — a repo with no extension
  yet, deliberately not compared against the ten.
- `zedPr` — absent means there is no open submission to link, so the page says
  the listing does not exist.

Flip the flag in the same commit as the release. `bun run check:crates`
reconciles the declaration against the live registry, and its asymmetry is the
point: claiming published while the registry disagrees **fails**, being
published without the claim only **reports**, and an unreachable registry
**passes** — an outage says nothing about a claim.

The failure this whole section exists to prevent is a page that states
something untrue to a reader. Copy sitting behind a false flag states nothing
to anyone.

- **Network access.** Nine tools make none. **Scrape-LE does** — it fetches the
  page it is checking. "No network access, ever" was false and is now scoped:
  the home hero says "Local by default", and a tool page reads the badge from
  `fetchesTarget` in the registry rather than stating it for all ten. Hand-set
  like `cratePublished`, and pinned by a test — no manifest states it.
- **Locales.** All ten ship the same 12 translated bundles (plus the English
  source, which is not a translation — counting it gives 13 and is wrong). This
  used to vary, and the site said so long after it stopped being true: copy
  named Regex-LE and Secrets-LE as English-only while both shipped twelve
  translations. The count is now read from `LOCALE_COUNT`, derived from the
  repos by `scripts/sync-registry.ts` — do not restate it as prose.
- **Bundling.** Nine ship a self-contained bundle; Scrape-LE ships
  `playwright-core` alongside it.
- **Registry ids are NOT interchangeable.** VS Code resolves
  `nolindnaidoo.<id>`; Cursor and VSCodium resolve Open VSX, currently
  `OffensiveEdge.<id>`. An install command that uses one id for both simply
  fails for half the audience. `OPENVSX_NAMESPACE` in `lib/site.ts` exists for
  exactly this and flips to `PUBLISHER` when the rename lands.
- **Install count** (`INSTALL_COUNT`) is hardcoded and rounded down, because
  Marketplace acquisitions are dashboard-only and cannot be fetched at build
  time. The comment records the measurement and date — re-measure before
  raising it.

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
bun run verify:deploy   # the chain Vercel runs before it will promote a build
bun run e2e             # axe, keyboard, and the palette, against the real export
```

**`verify:deploy` is the Vercel build command.** A failing gate fails the
build, so a broken one never reaches production and the previous deployment
keeps serving. CI runs the same steps individually, so a failure names itself
in the job list. The two mean the same thing on purpose: they used to not, and
a green badge told you less than it appeared to.

The chain: lint → typecheck → registry drift → coverage → build → routes →
payload budget. It deliberately omits `e2e`, which needs browsers the build
image does not have, and the Open VSX check, which reaches a registry — an
outage there must not be able to block a deploy. Both stay in CI.

- **Coverage** is enforced over `lib/` and `scripts/`. Components are excluded:
  a coverage number over markup measures templating, not behaviour, and their
  assurance is the Playwright suite against the real export.
- **`bun run check:registry`** fails when `lib/tool-facts.generated.ts` drifts
  from the extension repos. It skips where the repos are not checked out, which
  is normal in CI. Never hand-edit the generated file, and never let biome
  format it — reformatting breaks the byte comparison the check depends on.
- **`lib/asset-hashes.generated.ts`** is the other generated file, written by
  `sync:demos`. It is biome-formatted, and a test pins it byte-for-byte to what
  the renderer emits — the two used to disagree, so every sync left a lint error
  behind correct output. Change the renderer and the committed file together.
- **`bun run routes`** asserts every registry path resolves the way a static
  host serves this export, and that no built page is missing from the registry.
- **`bun run budget`** is a ratchet. Raising a ceiling needs the reason in the
  commit body.

`e2e` serves the real static export rather than a dev server, so what is
audited is what ships. Its first run caught a real defect: the install command
overflowed into a scrollable region that could not take focus, leaving it
unreadable by keyboard on a narrow viewport. The command palette has its own
spec, because the per-page sweep only ever sees it closed — and that spec
immediately caught two ARIA errors the closed state could never show.

After `build`, `out/` must contain the page HTML, `robots.txt` and
`sitemap.xml` (both static in `public/`), and the build-time PNGs from
`app/icon.tsx` / `apple-icon.tsx` / `opengraph-image.tsx` (Satori —
literal hexes only in those files). Serve `out/` and click through:
category tabs filter, FAQ expands, the copy button writes the clipboard,
theme toggle flips. Security headers live in `vercel.json`.

## Scope discipline

When the requested change is done, stop. No unrequested components, pages,
or robustness tweaks.

## Git identity

Every commit uses the GitHub noreply address:

```
13629544+nolindnaidoo@users.noreply.github.com
```

A real address in commit metadata is public forever — GitHub's API serves it
for any public repo, and scrapers harvest it. Never set a real address in
`user.email`, globally or repo-locally, and never commit with one. GitHub's
*Block command line pushes that expose my email* is the backstop; the global
config is the default. A repo-local `user.email` silently overrides the global
one, so check `git config user.email` in a fresh clone before the first commit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
