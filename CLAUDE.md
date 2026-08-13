# CLAUDE.md

Read [AGENTS.md](AGENTS.md) — conventions, architecture, and the definition
of done. README.md carries the page map.

Quick gates before any commit:

```bash
bun run verify
```

Two hard rules: feature code imports HeroUI from `ui/`, never
`@heroui/react` directly; and every content claim must stay provable
against the extension repos (`lib/tools.ts` is the registry — no
embellishment).

**Provable is about behaviour and numbers, not availability.** Copy for a
release you are about to make is *staged*, never forbidden — write it, leave
`cratePublished` / `zedPr` unset, and flip the flag in the release commit. The
page renders from the flag, so unflipped copy asserts nothing to anyone.
Refusing to write it is the bug: the copy has to exist before the publish, and
the publish is what the copy is about. See **Content truth** in AGENTS.md.
