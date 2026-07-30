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
