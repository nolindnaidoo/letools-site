# Fleet pass

The repeatable review of one tool repo. It replaces the earlier fleet audit checklist, whose
still-valid checks were moved into the documents below.

A pass covers **one repo**, start to finish, and ends in **one pull request**.
The next repo does not start until that pull request is open and the ledger row
is written. Merging and releasing are separate decisions and are not part of a
pass.

## The read rule

Every document in this directory opens with this block, verbatim. A test holds
the copies identical.

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

**One read.** Step 1 reads every file once, from its first line to its last,
with the checks of steps 2 to 7 beside it, and writes what each later step
will need into the inventory tables as it goes. Steps 2 to 7 answer from that
read and from runs. A file is reopened to settle a particular check, never
re-read whole for each document in turn. The first three passes re-read a
repo of about twenty-five thousand lines under each of six documents, and the
re-reads found nothing the first read and the tables had not.

## Surfaces

Every repo in the family carries four surfaces. Each document says which of its
checks apply to which. A pass covers all four.

| Code | Surface | Where it lives in the sample repo |
|---|---|---|
| `E` | VS Code extension | `src/` except `src/mcp/`, `package.json`, `test/integration/` |
| `M` | MCP server shipped in the extension and on npm | `src/mcp/`, `server.json`, `scripts/build-mcp.js` |
| `N` | npm package | `mcp/package.json`, `scripts/build-npm.js`, `scripts/check-npm-package.js` |
| `C` | Rust crate, its CLI and its own MCP server | `crate/src/`, `crate/tests/`, `crate/fixtures/` |

The sample repo is `versions-le`. Paths and commands quoted from it are
examples of the shape. **Derive the real list from the repo in front of you.**
Script names differ between repos (`check-detection-parity.ts` in one,
`check-extraction-parity.ts` in another), and a copied name that does not exist
runs nothing.

## Order

Run the documents in this order. Each one writes into the pass record.

| Step | Document | Produces |
|---|---|---|
| 0 | [baseline.md](baseline.md) | A clean branch and the result of every gate before any code is read |
| 1 | [inventory.md](inventory.md) | The read manifest and the tables every later step checks against |
| 2 | [broken-features.md](broken-features.md) | Every declared feature driven, with its observed result |
| 3 | [bugs.md](bugs.md) | Wrong results from correct-looking code |
| 4 | [errors.md](errors.md) | Failures that are swallowed, mislabelled or reported as success |
| 5 | [memory-leaks.md](memory-leaks.md) | Resources that are never released and state that grows without bound |
| 6 | [race-conditions.md](race-conditions.md) | Results that depend on timing or ordering |
| 7 | [translations.md](translations.md) | Missing, unloaded and incorrect translations |
| 8 | [close.md](close.md) | Gates green, the pull request, the ledger row |

Steps 2 to 7 are answered one at a time. Finish a document before opening the
next. A defect noticed while working on a different document is written into
the record under the document it belongs to and left until that document's
turn.

## The hunt

Four passes answered every check in every document. About half the checks
found something in no repo, and a smaller set found something in every repo
it applied to. Those are the hunt: each is driven or traced in full, with a
run or a controlled reproduction, before it is answered. Every other check is
still answered, from the step 1 read and the inventory tables, with one line
of evidence, and none is removed. Each document names its hunt under its
`Checks` heading, and `scripts/fleet-pass.test.ts` holds this table to those
lines.

| Step | Found something in every pass it applied to |
|---|---|
| broken-features | FEAT-6, FEAT-17, FEAT-18, FEAT-22 |
| bugs | BUG-8, BUG-11, BUG-13, BUG-15, BUG-21 |
| errors | ERR-1, ERR-4, ERR-12, ERR-14, ERR-19 |
| memory-leaks | LEAK-3, LEAK-5, LEAK-6, LEAK-10, LEAK-11, LEAK-12 |
| race-conditions | RACE-3, RACE-11 |
| translations | L10N-5, L10N-9, L10N-13 |

The checks that drive a built server with input the corpus never produces,
ERR-3 beside BUG-15, ERR-14 and ERR-19, are runs rather than reads and are in
the hunt whatever their count. The close step updates this table from the
record.

## What counts

**A check has four possible answers.**

| Answer | Requires |
|---|---|
| `pass` | The evidence: the command and its output, or the test that asserts it, named by file and test title. A check that a gate run at BASE-5 answers is `pass` by that gate's command and output, once the gate's script has been read (FEAT-19, FEAT-21); the gate is not re-derived by hand |
| `finding` | A reproduction that was run. See below |
| `n/a` | The reason the check cannot apply to this repo, verified against the inventory |
| `unknown` | What is needed to settle it. An `unknown` blocks the close step |

**A missing explicit test is a finding.** If a check passes only because the
code was read and looks right, the repo has no guard against the next change
breaking it. Record it as a `test-gap` finding and write the test.

**A finding is not a finding until it has been reproduced.** Drive it with a
failing test or a run in the real host, and paste what happened. A defect
reported from reading alone has been wrong in this family before: a
`Range(0, 0, lineCount, 0)` that "drops the final line" does not, because VS
Code clamps the position.

**Check the mock before trusting a test.** `src/__mocks__/vscode.ts` is a
hand-written stand-in. A path the mock cannot make fail is an untested path
whatever the coverage figure says. If a check needs a failure the mock cannot
produce, adding that hook to the mock is part of the fix.

## Fixing

1. One finding, one commit. The commit body names the finding id.
2. The test comes with the fix, and it is shown failing with the fix stashed.
   A new test that passes without the fix proves nothing.
3. A changed output updates its golden or snapshot in the same commit and gets
   a CHANGELOG line.
4. A fix in a file the family shares is copied, never re-found. Before fixing,
   hash the file across the sibling checkouts with the repo's name written out
   (`normalize()` in `scripts/check-fleet.ts`). Where the pre-fix bytes match
   in other repos, the fix and its test go to each of them in the same pass,
   one commit per repo, shown failing there too, and the file joins a list in
   `check-fleet.ts` in the same `letools-site` change so the copies cannot
   drift again. The first two fleet passes re-found twenty-nine findings in
   shared files before this rule, each reproduced, fixed and tested twice.
5. A fix in a repo's own code, its engine, its commands and its catalogues,
   stays in that repo. If the same defect probably exists in a sibling's own
   code, add a check for it to the matching document here so each later pass
   looks for it.
6. Something that looks wrong but may be compensated for downstream is recorded
   and raised, not patched.

## The record and the ledger

Each pass writes one record, `records/<repo>.md`, started from
[records/TEMPLATE.md](records/TEMPLATE.md). It holds the baseline results, the
read manifest, every check's answer with its evidence, and every finding.

[LEDGER.md](LEDGER.md) has one row per repo. A test holds its rows against
`REPOS` in `scripts/check-fleet.ts`, so a tool cannot be absent from it.

Finding ids are `<repo>-<step>-<n>`, for example `versions-le-errors-2`.

## Changing these documents

A defect class found during a pass that no check here would have caught is
added to the matching document in the same change that closes the pass. Add a
check, never a story about the repo it came from, and never name a tool repo
inside a check.

The same change updates the hunt: a check that found something in this pass
and every earlier one it applied to joins its document's hunt line and the
table above, and one that has now passed in a repo it applied to leaves. The
test holds the two in step.
