# Step 6: Race conditions

Results that depend on timing or ordering. JavaScript is single-threaded, so
every race in the extension and the MCP server lives at a suspension point:
something changed while the function was waiting.

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

Re-read in full: every file that appears in the INV-6 table, the extension
entry point, every file holding module-level mutable state from INV-5, the MCP
transport, and in the crate any module that uses threads, shared state or the
filesystem.

Every row of INV-6 gets an answer. There is no sampling.

## How to prove one

A race is reproduced with a test that controls the interleaving. Replace the
awaited call with a promise the test resolves by hand, start the operation,
make the change, then resolve. A test that sleeps and hopes is not a
reproduction. A real race that only sleeping finds is still a finding, with the
run that showed it recorded.

## Checks

**RACE-1 (`E`). State read before an `await` is still valid after it.** For
each row of INV-6: what the function read before the suspension (active
editor, document and its version, selection, configuration, workspace folders,
a file's existence) and whether it uses that value afterwards. Each use is
either re-read, version-checked, or shown to be safe when stale.

**RACE-2 (`E`). An edit is applied to the document it was computed from.** Any
result computed from a document's text and then written back checks that the
document version has not changed, or the edit lands on text the user has since
altered.

**RACE-3 (`E`). Every command is safe to invoke twice at once.** For each
command, start a second invocation while the first is suspended at each
`await`. They must not interleave writes to shared state, both announce a
result, open two reports for one request, or corrupt a shared timer or status
item. State the policy the code implements (run both independently, ignore the
second, cancel the first) and test it.

**RACE-4 (`E`). Shared mutable state has one writer at a time.** For each
module-level mutable value from INV-5, list every function that writes it and
every `await` between a read and the write that depends on it. A
read-await-write sequence on shared state is a lost update.

**RACE-5 (`E`). Persisted state is written before the wait, not after.** A
counter or flag in `globalState` or `workspaceState` that must survive a window
closing is updated before any prompt is awaited. A window closed with the
prompt open never resolves it. Two windows of the same editor share global
state, so read what happens when both run the same path.

**RACE-6 (`E`). Cancellation is honoured after every suspension.** Wherever a
cancellation token or a progress callback exists, the token is checked after
each `await`, and a cancelled run delivers nothing and announces nothing.

**RACE-7 (`E`). Configuration changing mid-run is coherent.** A command reads
its configuration once and uses that snapshot throughout, or re-reads
deliberately. Mixed values from before and after a change inside one run is a
finding.

**RACE-8 (`E`). Nothing runs after dispose.** Each timer callback, pending
promise continuation and listener is read for what it touches. A continuation
that resolves after deactivation and uses a disposed item, channel or context
is a finding.

**RACE-9 (`E`). Activation order does not matter.** Anything clickable or
invocable before `activate` finishes (a status bar item bound to a command, a
provider registered before its dependencies exist) is checked. Read `activate`
line by line for a use before a registration.

**RACE-10 (`E`). Collected results are ordered deterministically.** Output
built from `Promise.all`, `findFiles`, directory listings or map iteration is
sorted by an explicit key before it reaches the user. Two runs over the same
workspace produce byte-identical output.

**RACE-11 (`E` `C`). The filesystem can change between the listing and the
read.** A file found and then deleted, replaced, or made unreadable before it
is opened is reported for what actually happened to it. This is also ERR-4.

**RACE-12 (`M`). Frames are reassembled across any chunk boundary.** Feed the
server one valid message split at every byte offset, two messages in one
chunk, and a message split inside a multi-byte character. Each is parsed
exactly once.

**RACE-13 (`M`). Concurrent requests do not share state.** Send several
requests before any response. Every response carries the id of its own request
and the result for its own arguments. Where handlers are asynchronous, no
handler reads a module-level value another handler is partway through writing.

**RACE-14 (`M`). Input closing mid-request is clean.** Close stdin while a
request is in flight. The server neither hangs nor writes a partial frame.

**RACE-15 (`C`). Parallelism is deliberate.** Search the crate for threads,
thread pools, async runtimes and shared-state types. If there are none, record
the search and its empty result as the evidence. If there are, every shared
value has a stated owner, output order does not depend on scheduling, and
stdout writes are not interleaved.

```bash
grep -rnE 'rayon|thread::|tokio|async fn|Mutex|RwLock|Arc<|static mut|Atomic' crate/src
```

**RACE-16 (`C`). Output does not depend on the environment's ordering.**
Directory iteration order, hash map iteration order, the time zone and the
locale do not change the report. The crate's platform suite is run and read.

**RACE-17 (tests). No test depends on timing or on another test.** Run the
unit suite three times, and once with the order shuffled. Read every test that
uses a real timer, a real clock or `Date.now()`. Any result that differs
between runs is a finding, and so is any gate from BASE-6 that failed once and
then passed.

```bash
bun run test && bun run test && bun run test
bunx vitest run --pool=threads --sequence.shuffle
grep -rnE 'setTimeout|Date\.now|new Date\(\)|useFakeTimers' src test --include='*.test.ts'
```

## Done when

Every row of INV-6 has an answer, RACE-3 has a test per command, RACE-12 and
RACE-13 have tests against the built server, and every timing-dependent result
has a controlled reproduction and a finding id.
