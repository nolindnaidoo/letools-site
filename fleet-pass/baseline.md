# Step 0: Baseline

Establish what is already red before any code is read, so a pre-existing
failure is never mistaken for one the pass caused, and never goes unrecorded.

<!-- read-rule:start -->
> **Read rule.** Every file in this document's scope is opened and read from
> its first line to its last, during this pass, before any check below is
> answered. Nothing is answered from memory of this repo, from a sibling repo,
> from an earlier pass, from a summary, or from a comment, a test name, a
> README or an `AGENTS.md`. A search result locates code. It never replaces
> reading the file it points into. A check on a file that was not read in full
> during this pass is `not done`, never `pass`. Where the code and a run cannot
> settle a question, the answer is `unknown` plus what is needed to settle it.
> No guesses.
<!-- read-rule:end -->

## Scope

Read in full: the repo's `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`,
`crate/CLAUDE.md`, `crate/SPEC.md`, `package.json`, `vitest.config.ts`,
`.vscode-test.mjs`, and every file under `.github/workflows/`.

These are read to learn the repo's rules and to find its gates. They are not
evidence that the code follows them.

## Checks

**BASE-1. The tree is clean and current.**
`git status --porcelain` prints nothing. `git fetch` then `git status -sb`
shows `main` level with `origin/main`. Anything else stops the pass until the
owner says what the uncommitted work is.

**BASE-2. The commit identity is the noreply address.**
`git config user.email` prints
`13629544+nolindnaidoo@users.noreply.github.com`. A repo-local value overrides
the global one, so run it inside this repo.

**BASE-3. Work happens on a branch.**
`git switch -c fix/fleet-pass` from `main`. Record the `main` commit it was cut
from with `git rev-parse HEAD`.

**BASE-4. The gate list is derived from the workflows, not from this page.**
List every `run:` step in every workflow file and every entry in
`package.json` `scripts`. Each one is either run in BASE-5 or written into the
record as `not run here` with the reason. The usual reasons are that it needs
another operating system, a registry or a secret.

The list from the sample repo, to show the shape:

| Surface | Command |
|---|---|
| `E` | `bun install --frozen-lockfile` |
| `E` | `bun run lint` |
| `E` | `bun run typecheck` |
| `E` | `bun run test:coverage` |
| `E` | `bun run coverage:readme:check` |
| `E` | `bun run build` |
| `E` | `bun run check:bundle` |
| `M` | `bun run build:mcp` then `bun run check:mcp-bundle` |
| `E` | `bun run package` |
| `E` | `bun run test:integration` |
| `E` | `bun run test:e2e-vsix` |
| `N` | `bun run build:npm` then `bun run check:npm-package` |
| `C` | `cargo fmt --all --check` in `crate/` |
| `C` | `cargo clippy --all-targets -- -D warnings` in `crate/` |
| `C` | `cargo test --locked` in `crate/` |
| `C` | `cargo build --release --locked` in `crate/` |
| `C` | each `cargo test --test <suite>` the crate workflow runs, with the environment variables that workflow sets |
| `C` `M` | every `scripts/check-*-parity.ts`, `check-*-differential.ts` and `check-mcp-definition.ts` |

Several crate suites are skipped unless an environment variable is set. A
skipped suite prints that it did not run. Read the workflow for the variable
names and set them, or the suite reports nothing and looks green.

**BASE-5. Every gate is run once and its result recorded.**
Run each command unpiped. Record the exit code and, for a failure, the failing
output. Do not fix anything yet.

**BASE-6. Every failure is a finding before any code is read.**
Give each one an id under the document it belongs to. A gate that fails here
and passes on a second run with no change is a `race-conditions` finding, not
noise.

**BASE-7. Coverage is recorded per file, not as a headline.**
From `coverage/coverage-summary.json`, list every file under the repo's own
floor and every file at 0% for any metric. These are inputs to later steps. A
provider or entry point at 0% branch coverage behind a healthy total is where
defects have been found before.

**BASE-8. Skipped and disabled tests are listed.**

```bash
grep -rnE '\b(it|test|describe)\.(skip|todo|only)\b|\bxit\(|\bxdescribe\(' src test
grep -rnE '#\[ignore' crate/src crate/tests
```

Each hit is recorded with the reason the file gives. A skip with no reason is a
finding under `broken-features`.

## Done when

Every command from BASE-4 has a result or a `not run here` reason in the
record, and every failure has a finding id.
