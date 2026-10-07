# Step 4: Errors

What happens when something fails. The defect this family has shipped most
often is a command that announces a result it never delivered, followed by a
failed check that reads exactly like a clean one.

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

Re-read in full: every file that appears in the INV-7 table, every command
file, every file that calls a `vscode` API, the error and notifier modules,
`src/__mocks__/vscode.ts`, the MCP transport and tool handlers, and in the
crate every file that returns a `Result`, reads the filesystem or sets an exit
code.

Every row of INV-7 gets an answer. There is no sampling.

## Checks

**ERR-1. Every `catch` is classified.** For each one: what can be thrown into
it, what it does with the cause, and what the user and the caller learn. An
empty `catch`, a `catch` that returns a default, and a `catch` that only logs
are each findings unless a comment states why the failure is ignorable and a
test shows the user-visible result is still true.

**ERR-2. A failed check never reads as a clean one.** Every top-level entry
point that returns "nothing found" is traced for the paths that reach that
result. If an exception, an unreadable file or a parse failure arrives at the
same value as a clean input, it is a finding. An inner best-effort `catch`
around one signal among several is legitimate. The entry point is what matters.

**ERR-3. A refused input comes back named.** A document the tool cannot read or
parse produces a diagnostic with a code, a severity and a message that says
which malformation occurred. Zero findings with zero diagnostics on a file that
was never read is the silent miss. **Verify by running the MCP server on a
malformed document, not by reading the code.** Use the repo's existing
diagnostic code spelling. Do not introduce another.

**ERR-4. Every label on a failure is true.** Read each error message against
every cause that can reach it. A `catch` around a read and a decode that
reports "not valid UTF-8" for a file that was deleted is a false statement.
Each message names what failed, why, and what state the user is in.

**ERR-5. No success is announced without checking it happened.** Every API
whose return value means "it did not work" has that value used:
`workspace.applyEdit`, `TextEditor.edit`, `window.showTextDocument`,
`env.clipboard.writeText`, `env.openExternal`, `workspace.fs.*`,
`commands.executeCommand`. Any count, status flash, telemetry event or
notification that follows one is reached only on success.

```bash
grep -rnE 'applyEdit|\.edit\(|showTextDocument|clipboard\.|openExternal|workspace\.fs\.|executeCommand' \
  src --include='*.ts' --exclude='*.test.ts'
```

**ERR-6. No floating promises.** Every call that returns a promise is awaited,
returned, or has a `.catch` that routes somewhere a user or a log can see. Read
each `void` expression and each event handler that is `async`.

**ERR-7. A throw inside a command reaches a deliberate handler.** For each
registered command, trace what the user sees when the body throws at each
`await`. An unhandled rejection that VS Code reports in its own words, or does
not report at all, is a finding.

**ERR-8. Thrown values are not assumed to be `Error`.** Every
`(error as Error).message`, `error.message` on an untyped catch variable, and
`String(error)` is read. A thrown string or plain object must not produce
"undefined" in a message. Fix where the value is produced or narrowed, not at
each call site.

```bash
grep -rnE 'as Error\b|catch \((e|err|error)\)' src --include='*.ts' --exclude='*.test.ts'
```

**ERR-9. Shortfalls are visible.** A loop that skips an item on failure and
continues must surface the count and the items skipped in its output. A record
that exists only in `console.*` or the extension host log is invisible to the
user.

```bash
grep -rnE 'console\.(log|warn|error|debug)' src --include='*.ts' --exclude='*.test.ts'
```

**ERR-10. Notifications go through the notifier.** If the repo's notifier
claims to be the single channel, every direct `vscode.window.show*Message`
call is checked against that claim. A modal dialog awaiting a choice is
interaction and may be direct. Anything else bypasses the user's notification
setting.

```bash
grep -rnE 'vscode\.window\.show(Information|Warning|Error)Message' src --include='*.ts' --exclude='*.test.ts'
```

**ERR-11. Cancellation is not failure and not success.** A dismissed quick
pick, input box or dialog returns `undefined`. Each call site handles it by
stopping quietly. It reports no error and no result.

**ERR-12. The mock can produce every failure the code handles.** For each API
in ERR-5 and each `catch` in ERR-1, the mock has a way to make that call fail,
and a test uses it. List the mock's failure hooks from the file itself. An API
with no hook has an untested failure arm, and adding the hook is part of the
finding's fix.

**ERR-13. Existing tests do not pin the defect.** Read every test whose title
mentions errors, failures, graceful handling or defaults. A test that asserts
a swallowed error or a "safe default" is recorded, and its golden is updated in
the commit that fixes the behaviour.

**ERR-14 (`M`). Protocol errors are well formed.** A malformed frame, invalid
JSON, an unknown method, an unknown tool, a missing argument and an oversized
message each produce a correct JSON-RPC error with the request id, and the
server stays up. Nothing is written to stdout that is not a protocol message.

**ERR-15 (`C`). No panic on input.** Each `unwrap`, `expect`, `panic!`,
`unreachable!` and indexing expression from INV-7 is read. One reachable from
file contents, arguments or environment is a finding. Each exit code is
produced by the condition its documentation states, and stderr carries the
reason.

**ERR-16 (`C`). Filesystem failures are named.** Permission denied, a symlink
loop, a FIFO, a directory where a file was expected, a file removed mid-run,
and a path over the platform limit each appear in the report. The property is
that an input never silently vanishes from the output.

**ERR-17 (`N` `E`). Build and release scripts fail loudly.** Every script under
`scripts/` and every workflow step is read for `|| true`,
`continue-on-error`, an unchecked `spawnSync` status, and a `catch` that exits
zero.

```bash
grep -rnE '\|\| true|continue-on-error|2>/dev/null' scripts .github/workflows
```

## Done when

Every row of INV-7 has an answer, every API in ERR-5 has a failure test, and
every false or missing report has a failing test and a finding id.
