# Step 2: Broken features

Every feature the repo declares is driven and its result observed. A feature
that is registered, compiles and has a unit test can still do nothing when a
user invokes it.

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

Re-read in full: `package.json`, the extension entry point, every file under
the commands, providers, config and UI directories, `test/integration/`,
`scripts/e2e-vsix.js`, `.vscodeignore`, the MCP server sources, `crate/src/`
entry points and CLI, and `mcp/package.json`.

"Driven" means the real thing ran: the extension host, the installed VSIX, the
spawned server, the built binary. A unit test against the mock shows the logic.
It does not show the feature.

## Checks

**FEAT-1 (`E`). Every command in the manifest is registered, and every
registered command is in the manifest.** From INV-3. A real-host test asserts
it with `vscode.commands.getCommands(true)`.

**FEAT-2 (`E`). Every command is invoked in the real host and its effect is
asserted.** One row per command: the integration test that executes it, and the
observable result that test checks (a document opened with given content, the
clipboard, a setting changed). "Executes without throwing" is not an effect.

**FEAT-3 (`E`). Every command is invoked with every argument shape its entry
points can pass.** A command reachable from the palette, a context menu and a
status bar click receives different arguments from each. Read the handler and
list the shapes. Each has a test.

**FEAT-4 (`E`). Every menu entry appears where it is declared and nowhere
else.** For each `when` clause, state the context in which it is true and
verify the context key exists in the supported VS Code floor. A clause that can
never be true hides the entry forever with no error.

**FEAT-5 (`E`). Every keybinding fires its command, and does not shadow a
built-in binding in the same context.**

**FEAT-6 (`E`). Every setting changes observed behaviour at every value.**
From INV-4. For each property and each value in its domain (both booleans,
every enum member, an empty and a populated array), a test shows the output or
effect differs as documented. A setting whose test only reads the value back
has no consumer test.

**FEAT-7 (`E`). The config defaults in code equal the manifest defaults**, for
every declared property, asserted by a test that walks the manifest and cannot
skip a new one.

**FEAT-8 (`E`). A setting changed while the extension is running takes effect
as documented**, without a reload unless the description says a reload is
needed.

**FEAT-9 (`E`). Every activation event activates the extension.** For each
event, a workspace that matches it and one that does not. Confirm the first
activates and the second leaves the commands available by whatever means the
manifest promises.

**FEAT-10 (`E`). The packaged VSIX contains everything the code loads at
runtime.**

```bash
bun run package && unzip -l release/*.vsix
```

Compare the listing against every path the source resolves at runtime
(`asAbsolutePath`, `l10n`, icons, the MCP server bundle). Then
`bun run test:e2e-vsix` drives the installed artifact.

**FEAT-11 (`E`). The bundle is self-contained.** `bun run check:bundle` passes,
and the check is read to confirm it loads the bundle and does not only scan it.

**FEAT-12 (`M`). Every MCP tool answers over a real stdio session.** For each
tool in INV-9, three calls against the built server: a valid input, an input
that violates the schema, and a well-formed call on a malformed document. Each
returns the documented shape. Run both servers where the repo has two.

**FEAT-13 (`M` `C`). The two implementations agree.** The repo's parity,
differential and definition scripts pass, and each script is read to confirm
what it compares. A script that compares only the cases in the corpus says
nothing about inputs outside it.

**FEAT-14 (`M`). The server starts the way the extension starts it.** Spawned
with the same executable, arguments and environment the provider builds, it
completes a handshake. The provider's feature detection is exercised on a host
without the API.

**FEAT-15 (`N`). The npm package installs and runs from its tarball.**
`bun run check:npm-package` passes, and the `bin`, `files` and version fields
from INV-9 agree with what the tarball contains.

**FEAT-16 (`C`). Every CLI subcommand, flag and exit code is driven against the
built binary.** One row per flag and per exit code from INV-9, each with the
test in `crate/tests/` that produces it. Then run the binary over a real
repository that contains the files it reads, not only the fixtures.

**FEAT-17 (all). Every claim is backed.** Each row of INV-10 is matched to the
test or the run that demonstrates it. An unbacked claim is a finding. The fix
is either the missing behaviour or the removed sentence, and the owner chooses.

**FEAT-18 (all). Nothing is declared and dead.** Settings with no consumer,
commands with no registration, exported functions with no caller, locale keys
with no use, scripts in `package.json` that fail or that nothing invokes.

**FEAT-19 (`E`). The gates measure what they claim.** Read
`vitest.config.ts`: the coverage key is `thresholds`, and the include and
exclude lists do not drop a directory that holds logic. Read `tsconfig.json`:
test files are type-checked. Read the generated README sections against a real
run.

**FEAT-20 (`E`). Skipped tests from BASE-8 are each explained or restored.**

## Running a development host by hand

`--user-data-dir` must be a short path such as `/tmp/le-rec`. VS Code creates
its IPC socket inside that directory, Unix socket paths are capped at 104
characters, and a longer path makes the editor exit during startup with no
window and no error. The session scratchpad path is already too long. To see
the real error, run the executable directly, because `open -na` and the `code`
shim both swallow stderr:

```bash
"/Applications/Visual Studio Code.app/Contents/MacOS/Code" \
  --user-data-dir=/tmp/le-rec --new-window <folder> 2>&1
```

What a real display, a real permission prompt or another operating system would
show cannot be verified from a headless run. Say so in the record instead of
implying coverage.

## Done when

Every row of INV-2, INV-3, INV-4, INV-9 and INV-10 has a driven result, and
every result that was not the documented one has a finding id.
