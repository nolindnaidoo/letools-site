# Fleet pass record: colors-le

| | |
|---|---|
| Repo | colors-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `7f34b01a3cbce087e4deeba92a07ad8f0707dc5c` |
| Started | 2026-10-30 |
| Pull request | [nolindnaidoo/colors-le#67](https://github.com/nolindnaidoo/colors-le/pull/67) |

**This record is incomplete.** 42 of 118 checks in steps 2 to 7 have evidence here. The rest were not walked individually, and CLOSE-1 is open. Fix logs and probes were kept in the session scratchpad and are not committed, so the log names below will not resolve after the session.

## Step 0: Baseline

49 of 50 gates exited 0. `cargo-publish-dry-run` exited 101 on the untracked `crate/coverage.json`, fixed by `aa08e33`.

## Final gates

Run on `3929019`. The one later commit changes bundle values only and was checked by `src/l10n.test.ts`.

| Gate | Final |
|---|---|
| install | exit=0 |
| lint | exit=0 |
| typecheck | exit=0 |
| test-coverage | exit=0 |
| coverage-readme-check | exit=0 |
| build | exit=0 |
| check-bundle | exit=0 |
| build-mcp | exit=0 |
| check-mcp-bundle | exit=0 |
| build-npm | exit=0 |
| check-npm-package | exit=0 |
| package | exit=0 |
| test-integration | exit=0 |
| test-e2e-vsix | exit=0 |
| versions-ci | exit=0 |
| lint-commits | exit=0 |
| versions-crate | exit=0 |
| cargo-fmt | exit=0 |
| cargo-clippy | exit=0 |
| cargo-test | exit=0 |
| cargo-build | exit=0 |
| msrv-check | exit=0 |
| policy-allow | exit=0 |
| policy-fs | exit=0 |
| policy-docs | exit=0 |
| crate-coverage | exit=0 |
| scenarios | exit=0 |
| hazards | exit=0 |
| platform | exit=0 |
| suite-tz-utc | exit=0 |
| suite-tz-unset | exit=0 |
| cargo-build-release | exit=0 |
| cargo-build-debug | exit=0 |
| differential | exit=0 |
| check-mcp-definition | exit=0 |
| build-cli | exit=0 |
| check-cli-parity | exit=0 |
| check-cli-pipes | exit=0 |
| fuzz | exit=0 |
| budget | exit=0 |
| coverage-matrix | exit=0 |
| extraction-parity | exit=0 |
| crate-package-list | exit=0 |
| crate-changelog | exit=0 |
| cargo-publish-dry-run | exit=0 |
| root-changelog | exit=0 |
| build-cli-prod | exit=0 |
| check-cli-package | exit=0 |
| benchmark | exit=0 |
| git-status-after | exit=0 |

## Step 1: Inventory

Every source, crate, script and document file was read, except the catalogues until step 7, `crate/fixtures/extraction.json` corpus data, `__fixtures__`, the snapshot and images. Tables INV-2 to INV-11 were kept as scratch notes and are not reproduced.

## Step 2 Broken features

| Check | Answer |
|---|---|
| FEAT-1 | `services.test.ts` compares registered commands with the manifest (`f930540`) |
| FEAT-2 | Only extract, help and activation in the host; reports driven through the mock (`5e04d3c`) |
| FEAT-3 | Not walked |
| FEAT-4 | Not walked |
| FEAT-5 | Not walked |
| FEAT-6 | Not walked |
| FEAT-7 | `config.test.ts`, gate green |
| FEAT-8 | Not walked |
| FEAT-9 | Not walked |
| FEAT-10 | Not walked |
| FEAT-11 | `check:bundle` green |
| FEAT-12 | `check:mcp-bundle` and `check-extraction-parity.ts` green |
| FEAT-13 | Parity scripts green; 500 generated documents identical |
| FEAT-14 | Not walked |
| FEAT-15 | `check:npm-package`, `check:cli-package` green |
| FEAT-16 | Not walked |
| FEAT-17 | Finding broken-features-1 and -2 |
| FEAT-18 | Open: filter `hueRange`, `customPattern` and validate `customRules` cannot be set; carried |
| FEAT-19 | Not walked |
| FEAT-21 | Not walked |
| FEAT-22 | Finding broken-features-3 |
| FEAT-23 | Not walked |
| FEAT-20 | Not walked |

## Step 3 Bugs

| Check | Answer |
|---|---|
| BUG-1 | Empty document kept empty by the line commands (`3ac7eb4`); rest not walked |
| BUG-2 | Not walked |
| BUG-3 | Not walked |
| BUG-4 | Finding bugs-1 |
| BUG-5 | Finding bugs-2 |
| BUG-6 | Not walked |
| BUG-7 | Finding bugs-4 |
| BUG-8 | Not walked |
| BUG-9 | Not walked |
| BUG-10 | Not walked |
| BUG-11 | Not walked |
| BUG-12 | Not walked |
| BUG-13 | Findings errors-1, errors-2 |
| BUG-14 | Not walked |
| BUG-15 | Differential and corpus green |
| BUG-16 | Not walked |
| BUG-18 | Prototype names refused by `parseColor` (`f690d38`) |
| BUG-19 | Not walked |
| BUG-20 | Finding bugs-1 |
| BUG-21 | Not walked |
| BUG-17 | Not walked |

## Step 4 Errors

| Check | Answer |
|---|---|
| ERR-1 | Not walked |
| ERR-2 | Not walked |
| ERR-3 | Not walked |
| ERR-4 | Finding errors-2 |
| ERR-5 | `replaceDocumentContent` result checked by each caller |
| ERR-6 | Not walked |
| ERR-7 | Not walked |
| ERR-8 | `describeError`, guard in `src/l10n.test.ts` |
| ERR-9 | Not walked |
| ERR-10 | Finding broken-features-7 |
| ERR-11 | Finding errors-3 |
| ERR-12 | Cancel token added to the mock |
| ERR-13 | `colorConverter.test.ts` pin removed (`50ba69e`) |
| ERR-14 | Finding errors-4 |
| ERR-19 | Not walked |
| ERR-20 | `check:cli-pipes` green |
| ERR-15 | Not walked |
| ERR-16 | Not walked |
| ERR-18 | Not walked |
| ERR-17 | Not walked |

## Step 5 Memory leaks

| Check | Answer |
|---|---|
| LEAK-1 | Not walked |
| LEAK-2 | Not walked |
| LEAK-3 | Not walked |
| LEAK-4 | Not walked |
| LEAK-5 | Not walked |
| LEAK-6 | `src/lifecycle.test.ts` |
| LEAK-7 | Not walked |
| LEAK-8 | Not walked |
| LEAK-9 | Not walked |
| LEAK-10 | `src/lifecycle.test.ts`, fifty rounds |
| LEAK-11 | Not walked |
| LEAK-12 | 20,000 calls: crate 5 MB flat; both Node servers 49 to about 70 MB, not shown to level off beyond that run |
| LEAK-13 | Not walked |
| LEAK-14 | Not walked |
| LEAK-15 | Not walked |
| LEAK-16 | Not walked |
| LEAK-17 | Not walked |

## Step 6 Race conditions

| Check | Answer |
|---|---|
| RACE-1 | Not walked |
| RACE-2 | Not walked |
| RACE-3 | `two invocations at once`, extract and the line commands only |
| RACE-4 | Not walked |
| RACE-5 | Not walked |
| RACE-6 | Not walked |
| RACE-7 | Not walked |
| RACE-8 | Not walked |
| RACE-9 | Not walked |
| RACE-10 | Not walked |
| RACE-11 | Not walked |
| RACE-12 | Not walked |
| RACE-13 | Not walked |
| RACE-14 | Not walked |
| RACE-15 | Not walked |
| RACE-16 | Not walked |
| RACE-17 | 593 passed under seeds 1, 2, 3 |
| RACE-18 | Not walked |

## Step 7 Translations

| Check | Answer |
|---|---|
| L10N-1 | Not walked |
| L10N-2 | `src/l10n.test.ts` |
| L10N-3 | Not walked |
| L10N-4 | `src/l10n.test.ts` |
| L10N-5 | `src/l10n.test.ts`; reports left English |
| L10N-6 | `src/l10n.test.ts` |
| L10N-7 | `src/l10n.test.ts` |
| L10N-8 | Not walked |
| L10N-9 | `test/locale/german-host.test.ts` passed |
| L10N-10 | `src/l10n.test.ts` |
| L10N-11 | Not walked |
| L10N-12 | Finding l10n-4 |
| L10N-13 | Not walked |
| L10N-14 | Not walked |
| L10N-15 | `color(s)` wording; `{0} colors` report strings remain |
| L10N-16 | Not walked |
| L10N-17 | `src/l10n.test.ts`, finding l10n-3 |
| L10N-18 | Not walked |
| L10N-19 | Not walked |

## Findings

Ids are not contiguous: bugs-5, bugs-6 and broken-features-5, -6 were merged into others or dropped during reproduction.

| Id | Step | What is wrong | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|
| colors-le-bugs-1 | 3 | Dedupe and Sort wiped a stylesheet, dropped short hex, rgba, hwb and named lines, and lost CRLF and the terminator | `3ac7eb4` | `postProcess.test.ts` | fail/bugs-1.log |
| colors-le-bugs-2 | 3 | Hex sort used host collation | `0a9b69d` | `sort.test.ts` | fail/bugs-2.log |
| colors-le-bugs-3 | 3 | Readers refused keywords and 4-digit hex; most notations had no HSL | `f690d38` | `colorConversion.test.ts` and others | fail/bugs-3.log |
| colors-le-bugs-4 | 3 | Fractional timings | `4224433` | `format.test.ts` | fail/bugs-4.log |
| colors-le-bugs-7 | 3 | Seven grey keywords not found on any surface | `c8ca1d8` | both sides, corpus | fail/bugs-7-*.log |
| colors-le-errors-1 | 4 | Analyze printed unmeasured WCAG pass and false patterns | `4b30f15` | `colorAnalysis.test.ts` | fail/errors-1.log |
| colors-le-errors-2 | 4 | Contrast of an unreadable colour was 1 | `50ba69e` | `validateColors.test.ts` | fail/errors-2.log |
| colors-le-errors-3 | 4 | Cancel reported as failure | `acb0363` | `commands.test.ts` | fail/errors-3.log |
| colors-le-errors-4 | 4 | Schema violations on all three servers | `cc031ea` | three suites, corpus, parity | fail/errors-4-*.log |
| colors-le-broken-features-1 | 2 | Help stale | `fa3909a` | `help.test.ts` | fail/broken-features-1.log |
| colors-le-broken-features-2 | 2 | README claims | `53f4b79` | none, documentation | not applicable |
| colors-le-broken-features-3 | 2 | Vacuous report tests | `5e04d3c` | `reportCommands.test.ts` | fail/broken-features-3.log |
| colors-le-broken-features-4 | 2 | Nine of eleven commands tested | `f930540` | `services.test.ts` | fail/broken-features-4.log |
| colors-le-broken-features-7 | 2 | Four commands bypassed the notifier | `fe151b9` | `reportCommands.test.ts` | fail/broken-features-7.log |
| colors-le-l10n-1 | 7 | English literals to users | `135f3b5` | `src/l10n.test.ts` | fail/l10n-1-and-3.log |
| colors-le-l10n-2 | 7 | Help English everywhere | `886727a` | `help.test.ts` | fail/l10n-2.log |
| colors-le-l10n-3 | 7 | Named compared by label | `ab758a7` | `src/l10n.test.ts` | fail/l10n-1-and-3.log |
| colors-le-l10n-4 | 7 | "Farben-LE" | `ec13917` | `src/l10n.test.ts` | fail/l10n-1-and-3.log |
| colors-le-l10n-5 | 7 | No German host test | `959e0ba` | `test/locale/` | new suite, not shown failing |
| colors-le-l10n-6 | 7 | Hex prompt and Named mistranslated | `7b6f6b0` | none | not shown failing |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| CLOSE-1 | 76 checks not walked | Walk them against this tree |
| FEAT-18 | Filter `hueRange`, `customPattern`, validate `customRules` have no way to be set | Add prompts or remove the options |
| L10N-5 | The four markdown reports are English in every locale; `AGENTS.md` records this as decided, and the maintainer has not decided it | Maintainer decision |
| L10N-13 | New translations have had no native review, and existing values were sampled, not read in full | Read every value |
| BUG-11 | `SUPPORTED_LANGUAGES` lists `yml`, not a language id; crate `settle` is quadratic but passes scenarios | Separate small fix |
| CLOSE-5 | `check:locales` is red on numbers-le only | The numbers-le pass |
| CLOSE-9 | CI reported no checks when last read | Read CI on the pull request |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | **Open** | 76 checks not walked |
| CLOSE-2 | Yes | Findings and Carried above |
| CLOSE-3 | Partly | Not shown for l10n-5, l10n-6, broken-features-2 |
| CLOSE-4 | Yes, bar the last commit | Final gates above |
| CLOSE-5 | Yes, bar numbers-le | `check:fleet`, `check:doc-paths` green |
| CLOSE-6 | Yes | `AGENTS.md`, `crate/AGENTS.md`, `crate/SPEC.md`, changelogs |
| CLOSE-7 | Yes | Commits listed in the pull request |
| CLOSE-8 | Yes | #67 opened, nothing merged or released |
| CLOSE-9 | **Open** | See Carried |
| CLOSE-10 | Yes | Ledger row |
| CLOSE-11 | Yes | FEAT-24, BUG-22, ERR-21 added |
