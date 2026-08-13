# Instructions

[AGENTS.md](AGENTS.md) is the technical source of truth for this repository:
the engineering standard the code is held to — control flow, error handling,
immutability, structure — plus the architecture, content rules, accessibility
requirements, and verification chain.

**Read it before writing code.** `README.md` carries the page map; `MAINTENANCE.md` is the runbook.

Non-negotiables, restated so they are visible without a second file:

- Guard clauses first. No `else` / `else if`. Two levels of nesting maximum.
- Every content export is frozen; render bodies do no data shaping.
- Feature code imports HeroUI from `ui/`, never `@heroui/react` directly.
- Content lives in `lib/tools.ts`, never in markup. Facts derived from the
  extension repos live in `lib/tool-facts.generated.ts` — generated, never
  hand-edited.
- Accessibility is gated in CI, not reviewed by eye.
- Conventional commits are enforced by hook and by CI.
- Definition of done: `bun run verify`
- Every fact has one home. Before adding a constant, check whether
  `lib/` already owns it — drift is this codebase's failure mode.

**Provable is about behaviour and numbers, not availability.** Copy for a
release about to be made is *staged*, never forbidden: write it, leave
`cratePublished` / `zedPr` unset, and flip the flag in the release commit. The
page renders from the flag, so unflipped copy asserts nothing to anyone.

Everything else is in AGENTS.md. Do not grow a second copy of the standard
here — a copy drifts, and then two tools disagree about the same repository.
