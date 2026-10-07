# Step 5: Memory leaks

Resources that are created and never released, and state that grows for as
long as the process lives. An extension host stays up for days and an MCP
server for a whole agent session, so a small leak per call is a real one.

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

Re-read in full: the extension entry point, every file that appears in the
INV-5 table, every command and provider file, the MCP transport and server,
and in the crate the discovery, scanning and server modules.

Every row of INV-5 gets an answer. There is no sampling.

## Checks

**LEAK-1 (`E`). Every disposable has an owner.** For each row of INV-5 that
VS Code returns as a `Disposable`, name where it is pushed to
`context.subscriptions` or explicitly disposed. One created inside a command
handler, a loop or a callback is created once per call, so it must be disposed
per call, not handed to the subscription list to pile up until deactivation.

**LEAK-2 (`E`). Every listener is removed.** Each `onDid*` subscription and
each `.on(` handler has its returned disposable kept and released. A listener
registered inside another listener, or on each command run, is a finding.

**LEAK-3 (`E` `M`). Every timer is cleared on every path.** Each `setTimeout`
and `setInterval` has its handle kept, cleared when rescheduled, and cleared on
dispose. Read what the callback touches. A callback that runs after dispose and
uses a disposed object is also a `race-conditions` finding.

**LEAK-4 (`E`). Lazily created resources are released.** An output channel,
webview, watcher or decoration type created on first use is disposed by
something registered up front, whether or not it was ever created.

**LEAK-5 (`E`). Dispose is complete and safe to repeat.** For each object with
a `dispose`, a test calls it and asserts every resource it owns was released,
then calls it again and asserts no throw.

**LEAK-6 (`E`). Deactivation leaves nothing behind.** A test activates, runs
every command once, disposes every subscription, and asserts through the mock
that no status bar item, channel, listener or timer is still live. This needs
the mock to track what was created and disposed. If it cannot, extending it is
part of this step.

**LEAK-7 (all). Module-level state is bounded.** For each mutable module-level
or static value in INV-5: what adds to it, what removes from it, and the
largest it can get. A cache keyed by document URI, file path or input text
with no eviction and no clearing on close is a finding.

**LEAK-8 (`E`). Large values are not retained.** A closure, cache, status
object or telemetry record that holds a document's full text, a whole report
or a parsed tree after the command returns. Read what each long-lived closure
captures.

**LEAK-9 (`E`). Child processes and external handles end.** Every spawned
process, browser, server or stream is closed on success, on failure, on
cancellation and on deactivation. Trace each of the four paths separately.

**LEAK-10 (`E`). Repeated runs do not grow.** For each command, a test runs it
many times against the mock and asserts the count of live disposables,
listeners and timers after the last run equals the count after the first.

**LEAK-11 (`M`). The server's buffers are bounded.** Read the transport. The
input buffer is consumed as frames complete, has a stated maximum, and rejects
or drops input beyond it. Nothing accumulates per request for the life of the
process: no request log, no growing map of pending ids that failures never
remove.

**LEAK-12 (`M`). Memory is flat across many requests.** Drive the built server
through a few thousand tool calls over one session, sampling resident memory,
and assert it levels off. Record the command and the samples.

```bash
node --expose-gc <driver script>   # the driver spawns dist/mcp-server.js and samples its RSS
```

If the repo has no such driver, that absence is a `test-gap` finding.

**LEAK-13 (`M`). Session end releases everything.** When stdin closes, the
server exits. No timer, listener or pending promise keeps the process alive.
Verify by closing stdin on a real process and observing the exit.

**LEAK-14 (`C`). Input size is bounded or streamed.** A very large file, a very
deep directory tree and a very large number of files are each read against how
the crate holds them. The crate's own large-input and budget suites are run
with their environment variables set, and their ceilings are read.

**LEAK-15 (`C`). Traversal terminates.** Symlink loops, recursive includes and
self-referential workspace definitions end, with a named diagnostic.

**LEAK-16 (`C`). Handles and temporary files are released.** Every file
opened, directory created and thread spawned is closed, removed or joined on
every path, including the error path.

**LEAK-17 (tests). The test suite does not leak into itself.** Timers,
listeners, fake clocks and mock state are reset between tests. A test that
passes alone and fails in the suite, or the reverse, is a finding here.

## Done when

Every row of INV-5 names its release on every path, LEAK-6, LEAK-10 and
LEAK-12 each have a test or a recorded run, and every unreleased resource has
a failing test and a finding id.
