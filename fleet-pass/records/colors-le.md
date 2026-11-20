# Fleet pass record: colors-le

| | |
|---|---|
| Repo | colors-le |
| Branch | `fix/fleet-pass`, then `fix/fleet-pass-remainder` |
| Baseline commit | `7f34b01a3cbce087e4deeba92a07ad8f0707dc5c` |
| Started | 2026-10-30 |
| Pull request | [nolindnaidoo/colors-le#67](https://github.com/nolindnaidoo/colors-le/pull/67), then [nolindnaidoo/colors-le#68](https://github.com/nolindnaidoo/colors-le/pull/68) |

The pass ran in two walks. The first, merged as #67, answered 42 of the 118 checks in steps 2 to 7 and fixed 20 findings. The second walked the other 76 from `13c6e90`, the merge of #67, in two halves read in parallel, steps 2 to 4 and steps 5 to 7, and fixed or carried what they found. Every check now has an answer. Fix logs and probes were kept in the session scratchpad, `fail/` for the first walk and `fail2/` for the second, and are not committed, so the log names below will not resolve after the session.

## Step 0: Baseline

49 of 50 gates exited 0. `cargo-publish-dry-run` exited 101 on the untracked `crate/coverage.json`, fixed by `aa08e33`.

## Final gates

Run once on `eb7f504`, the head of #68, with the same commands as the baseline and the first walk's final run, plus `check:mcp-loops`, which this walk added. The publish dry run uses its own target directory: run in the crate's, it left cargo's record for the binary pointing at the packaged sources, and plain builds then called a stale binary fresh. The second walk found that when an integration test drove a binary from before its fix, and removed the four record files the first walk's dry run had written.

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
| check-mcp-loops | exit=0 |
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
| FEAT-3 | Finding broken-features-8: the Explorer hands Extract Folder the clicked folder and the selection, and only the first was scanned (`3bbe21f`). Palette and `Uri` shapes driven in `extractWorkspace.test.ts` |
| FEAT-4 | `editor/context` on `editorLangId`, `explorer/context` on `explorerResourceIsFolder`, both keys in the 1.101 floor; no host API exposes menu placement, so placement itself is not driven |
| FEAT-5 | n/a: the manifest contributes no keybindings |
| FEAT-6 | Finding broken-features-9: `safety.largeOutputLinesThreshold` counted document lines and warned through a toast `silent` hides; `safety.fileSizeWarnBytes` compared UTF-16 units (`f83ee5e`). Every other value has a consumer test (`sort.test.ts`, `services.test.ts`, `commands.test.ts`, `scan.test.ts`) |
| FEAT-7 | `config.test.ts`, gate green |
| FEAT-8 | Finding broken-features-13, test gap: real-host test "reads a setting changed after activation on the next run, without a reload" (`32ebf98`) |
| FEAT-9 | `onStartupFinished` only; host test "activates"; `test:e2e-vsix` passed |
| FEAT-10 | `unzip -l release/colors-le-2.6.7.vsix`: 34 files, the bundle, the MCP server, 12 bundles, 13 manifest catalogues and the icon; `test:e2e-vsix` drives the installed server |
| FEAT-11 | `check:bundle` green |
| FEAT-12 | `check:mcp-bundle` and `check-extraction-parity.ts` green |
| FEAT-13 | Parity scripts green; 500 generated documents identical |
| FEAT-14 | Finding broken-features-14, test gap: `src/mcp/provider.test.ts` reads the provider's definition and a host without `vscode.lm` (`af6e02a`) |
| FEAT-15 | `check:npm-package`, `check:cli-package` green |
| FEAT-16 | Finding broken-features-12: `--help` omitted `--palette` from Options and bracketed a required `--format` (`13eecee`); `-h`, `-V`, `--hidden`, `--no-ignore` and a forced `--format` now in `contracts.rs`. Both binaries over this repository: identical, `2126 colors in 261 files` |
| FEAT-17 | Finding broken-features-1 and -2 |
| FEAT-18 | Finding broken-features-10: four test-only exports and an always-null detector removed (`a8d89fd`). Filter `hueRange`, `customPattern` and Validate `customRules` carried for the owner |
| FEAT-19 | `vitest.config.ts` key `thresholds`, `src/**/*.ts` included, tests and mocks excluded; `tsconfig.json` includes tests; `coverage:readme:check` within 1pp |
| FEAT-21 | Finding broken-features-11: the inline-suppression grep passed `#![allow]` and `cfg_attr(..., allow)` (`5b4031f`, `src/ciGates.test.ts`). commit-lint skipping an unreadable range: errors-9, fleet-shared, carried |
| FEAT-22 | Finding broken-features-3 |
| FEAT-23 | The policy grep reads `*.md`; its three sentences over `src crate/src scripts test .github` match only the workflow line |
| FEAT-20 | No `.skip`, `.todo` or `.only` in `src` or `test`; the gated crate suites say when they did not run |

## Step 3 Bugs

| Check | Answer |
|---|---|
| BUG-1 | Finding bugs-8: empty and whitespace content was an error on Extract and `ok: false` on two of three servers (`a8ef6af`, corpus cases). `parseColor('')`, `readColorList('')`, `sortColors([])`, `findColorLiterals('')` return defined empties |
| BUG-2 | The step's grep read, 115 lines: every `|| 0` is a count default, `if (!x)` sits on objects, arrays or parsed results; the one numeric `&&` cannot see 0 |
| BUG-3 | Findings bugs-9 (a legacy hue past 360 and a channel past 255, `8740277`) and bugs-10 (Filter's strict presets kept their bound, `d5fdb5e`); the results cap inside the last file is errors-5 |
| BUG-4 | Finding bugs-1 |
| BUG-5 | Finding bugs-2 |
| BUG-6 | Finding bugs-15: `FUNCTIONAL_RE`, the style-block and the text-node patterns were quadratic, 10 to 83 s at 200,000 characters (`6b3474c`); old and new identical over 200,000 generated documents. No `g` pattern held across calls without a reset |
| BUG-7 | Finding bugs-4 |
| BUG-8 | Finding bugs-18 in a real host: a comma inside a `scanExcludes` pattern splits it. `workspace/scan.ts` is fleet-shared: carried to the fleet sweep. Trailing slash and drive letter covered in `scan.test.ts` |
| BUG-9 | Finding bugs-14: `transport.ts` casts `arguments` unchecked, so a string answers "unknown arguments: 0, 1, 2" on the extension's server. Fleet-shared: carried. Every other cast read and guarded |
| BUG-10 | Finding bugs-11: the converter's second colour reader, and Filter's regex transparency test (`1c4212a`); it led to bugs-19, the palette's p/q rounding (`465b668`). `rustTrim`, `isRequest`, `serve` twins are held by `check:cli-parity` |
| BUG-11 | Finding bugs-12, five parts fixed: `yml` (`6d4303c`), quadratic `settle` (`9506310`), Convert's inert prompts (`b1211c5`), Analyze's dead WCAG arms (`11e5540`), the scan tools' unreachable `unreadable` arm (`88522e1`). The crate's `is_incomplete` exit-2 arm is unreachable and carried with errors-7 |
| BUG-12 | Every sort runs on a fresh array; `CONFIG_DEFAULTS` and results are frozen; no module-level mutable state outside the mock and the transport buffer |
| BUG-13 | Findings errors-1, errors-2 |
| BUG-14 | n/a: nothing previewed is sensitive; error text goes through `sanitizeErrorMessage` |
| BUG-15 | Differential and corpus green |
| BUG-16 | `COLORS_LE_FUZZ=1` 20 s: 66,202, 43,506, 52,384 and 59,858 documents; `hazards` passed; slices on byte offsets of an ASCII-lowered copy; no recursion |
| BUG-18 | Prototype names refused by `parseColor` (`f690d38`) |
| BUG-19 | Finding bugs-13: a filename that is a format name resolved on the crate and not on the JavaScript servers (`ea91fda`, corpus cases) |
| BUG-20 | Finding bugs-1 |
| BUG-21 | Finding bugs-16: a lone surrogate escape, an id of `1e400` and nesting 200 deep are answered by the JavaScript servers and refused by the crate, pinned nowhere. Which side is right is the owner's; the fix touches the fleet-shared transport. Carried |
| BUG-17 | Finding bugs-17: the crate hard rule "a file that cannot be read ... exits 2" is false; carried with errors-7. "One reader judges a colour" was broken (bugs-11, fixed). "Commands pass `document.languageId`" now tested (`acb5a2e`) |

## Step 4 Errors

| Check | Answer |
|---|---|
| ERR-1 | Finding errors-6: `extractColorsFromText` caught every reader throw and the file read as clean (`018b03b`). The other 37 `catch` sites each report through the notifier, a diagnostic, a counted field or `isError` |
| ERR-2 | Finding errors-7: a run in which every input failed exits 1 and `colors_le_scan` answers `ok: true`, the same as a clean run. SPEC says a skip never changes the exit code; carried for the owner |
| ERR-3 | Finding errors-10, test gap: all three servers answer a cut-off document identically with no diagnostic; the engines parse no format, SPEC now says so, and `mcp.test.ts` holds four documents (`86d8253`) |
| ERR-4 | Finding errors-2 |
| ERR-5 | `replaceDocumentContent` result checked by each caller |
| ERR-6 | `void deps.ratingPrompt.recordSuccess()` catches inside; `void respond(parsed).then(…)` where `respond` catches everything; notifier thenables never reject |
| ERR-7 | Every `registerCommand` handler is `guarded(...)`; `guard.test.ts` reads the source for one that is not |
| ERR-8 | `describeError`, guard in `src/l10n.test.ts` |
| ERR-9 | Finding errors-5: the results limit inside the last file (`14786ba`), and Analyze's dropped clusters and truncated tables (`e5a0e7d`). No `console.*` in `src` |
| ERR-10 | Finding broken-features-7 |
| ERR-11 | Finding errors-3 |
| ERR-12 | Cancel token added to the mock |
| ERR-13 | `colorConverter.test.ts` pin removed (`50ba69e`) |
| ERR-14 | Finding errors-4 |
| ERR-19 | All three servers: invalid bytes, a BOM-led line, not JSON, no method, no version, wrong version, an array, a null id, another protocol, `notifications/initialized` with an id, an invalid byte inside a string, each followed by a ping that is answered |
| ERR-20 | `check:cli-pipes` green |
| ERR-15 | Fuzz and hazards as BUG-16; every `expect` is on a constant pattern, own-struct serialization or test helpers |
| ERR-16 | Finding errors-8, with memory-leaks-3: a FIFO in a walk or named outright, and every link, vanished; a FIFO palette hung both binaries (`d6e59b2`, `check:cli-parity` holds the cases). A locked directory, a denied file, a broken link and a 300-character name were already named |
| ERR-18 | Dedupe and Sort reset the status bar in `finally`; Extract's `finally` calls `hideProgress`; progress notifications are `withProgress` |
| ERR-17 | Finding errors-9: `commit-lint.js --range` exits 0 on any `git log` failure. Fleet-shared: carried. Every other `spawnSync` and `|| true` is followed by a check of its value |

## Step 5 Memory leaks

| Check | Answer |
|---|---|
| LEAK-1 | The status bar item, its listener, the wrapper, telemetry, 11 commands, 10 code action registrations and the MCP provider are pushed at activation; nothing disposable is made per call. `lifecycle.test.ts` |
| LEAK-2 | One `onDidChangeConfiguration`; the extension's server adds one `data` listener and at most one outstanding `once('drain')`; the npm loop awaits each write |
| LEAK-3 | n/a: no `setTimeout` or `setInterval` in `src` outside tests; `vi.getTimerCount()` 0 after every command |
| LEAK-4 | The telemetry channel is created on first event and released by `telemetry.dispose`, pushed up front; `lifecycle.test.ts` channels 1 to 0 |
| LEAK-5 | Finding memory-leaks-6, test gap: the mock's code action registration tracked nothing; it counts them now (`83298d4`) |
| LEAK-6 | `src/lifecycle.test.ts` |
| LEAK-7 | No growing module-level state; the three extractor patterns reset `lastIndex`; `ALIASES` is a frozen `Map`; the crate holds only `LazyLock` patterns |
| LEAK-8 | Commands capture the deps bag only; telemetry records counts and a message; the workspace map is dropped with the run |
| LEAK-9 | n/a: the extension spawns nothing; the host launches the server from the provider's definition |
| LEAK-10 | `src/lifecycle.test.ts`, fifty rounds |
| LEAK-11 | Finding memory-leaks-1: the extension's server counts its frame limit in UTF-16 units and answered a 24 MiB frame the other two refuse. `src/mcp/transport.ts` is fleet-shared: carried to the fleet sweep |
| LEAK-12 | Finding memory-leaks-5, test gap: no driver measured memory. `check:mcp-memory`, 200,000 calls one at a time, levels off: the extension's server 58 to 59 MB, the npm command line's 60 to 70 MB, the crate's 6 MB (`210074f`) |
| LEAK-13 | Stdin closed, idle or mid-frame: all three exit 0 in 2 to 26 ms with nothing written; `check:mcp-loops` |
| LEAK-14 | Finding memory-leaks-2: neither command line bounds a file; past about 512 MiB the npm side calls an ASCII file "not UTF-8 text". The mislabel is in fleet-shared `ioError.ts` and a size ceiling is a contract change: carried. Scenarios and budget suites run, inside their ceilings |
| LEAK-15 | Finding memory-leaks-3: a link loop in a tree was passed over without a word; links are counted now (`d6e59b2`). A loop named outright was already refused by name |
| LEAK-16 | Finding memory-leaks-4: the hazard suite left two trees in the temporary directory every run (`80f0f23`). Production code writes no temporary file |
| LEAK-17 | `_resetMockState` in every `beforeEach`; fake timers restored; suite shuffled, shuffled with `--no-isolate`, and each file alone |

## Step 6 Race conditions

| Check | Answer |
|---|---|
| RACE-1 | Extract reads the text after the safety modal; Dedupe and Sort read and build the edit with no suspension between; the report commands only report on their snapshot |
| RACE-2 | Every write builds its edit synchronously after the read and checks `applyEdit`'s boolean; the host rejects a changed version |
| RACE-3 | Finding race-conditions-2, test gap: the eight commands the first walk did not cover each run twice at once (`f2dad6a`). Policy: run both independently |
| RACE-4 | The only shared mutable value is the status bar text; later write wins; no read-await-write on shared state |
| RACE-5 | `ratingPrompt.test.ts` "records the ask before the toast is answered" |
| RACE-6 | Finding race-conditions-1: a cancel during the last file's read or the clipboard copy still opened the workspace report (`035d1d3`) |
| RACE-7 | Each command takes one `getConfiguration()` snapshot; the notifier and telemetry re-read per message by design; no command spends a key |
| RACE-8 | Unknown: a continuation resolving after deactivation would write to the disposed telemetry channel. Settling it needs a host test that deactivates with a command pending |
| RACE-9 | `activate` is synchronous; services exist before commands register |
| RACE-10 | Listing sorted by path, palette by count then plain compare; crate `collect` sorts; two runs over 50,000 files byte-identical |
| RACE-11 | A listed-then-gone file is `unreadable` in the extension (`scan.test.ts`) and `skipped` with the OS error on both command lines (`hazards.rs`) |
| RACE-12 | Finding race-conditions-3, test gap: every byte split and splits inside a multi-byte character, against the three built servers (`210074f`, `check:mcp-loops`) |
| RACE-13 | Finding race-conditions-3, same driver: 20 requests in flight, each answered with its own id and result |
| RACE-14 | Stdin closed after a large request answers it whole; closed mid-frame exits 0 with nothing written, all three |
| RACE-15 | The grep finds only `LazyLock` patterns and a test-only `AtomicUsize`; no threads, no runtime |
| RACE-16 | `platform` passed; the suite under `TZ=UTC` and unset; output over 50,000 files identical under other time zones and locales, crate and npm |
| RACE-17 | 593 passed under seeds 1, 2, 3 |
| RACE-18 | n/a: nothing is debounced |

## Step 7 Translations

| Check | Answer |
|---|---|
| L10N-1 | The `%key%` diff against `package.nls.json` prints nothing |
| L10N-2 | `src/l10n.test.ts` |
| L10N-3 | All 12 locales on both mechanisms; `check-locales.ts` over this tree: 0 findings |
| L10N-4 | `src/l10n.test.ts` |
| L10N-5 | `src/l10n.test.ts`; reports left English |
| L10N-6 | `src/l10n.test.ts` |
| L10N-7 | `src/l10n.test.ts` |
| L10N-8 | `bun run package`: 13 manifest catalogues and 12 runtime bundles in the VSIX, the English bundle excluded on purpose |
| L10N-9 | `test/locale/german-host.test.ts` passed |
| L10N-10 | `src/l10n.test.ts` |
| L10N-11 | `WCAG AA`, `LE Tools`, `Colors-LE` in all 12; de `Support`, es `No`/`Color`, it `No`, fr `Occurrences`/`Documentation` are words of those languages |
| L10N-12 | Finding l10n-4 |
| L10N-13 | Finding l10n-7: every value read; 40 keys wrong in at least one locale (`2b23a72`). Unknown: the id and vi word for the Explorer, which needs those VS Code language packs |
| L10N-14 | Finding l10n-9: a pasted zh-cn locale label, ASCII colons in ja, English `Output` in vi (`46234e7`, `src/l10n.catalogue.test.ts`) |
| L10N-15 | `color(s)` wording; `{0} colors` report strings remain |
| L10N-16 | Finding l10n-8: seven locales named commands by titles the palette does not show; lightness two or three ways inside one locale (`5909201`, `2b23a72`) |
| L10N-17 | `src/l10n.test.ts`, finding l10n-3 |
| L10N-18 | `src/cli`, `src/mcp` and `crate/src` call no `l10n`; MCP replies and JSON Lines are locale-free; the four markdown reports are English, see Carried |
| L10N-19 | The grep over `src/cli src/mcp crate/src` finds only the extension-side provider |

## Findings

The first twenty are the first walk, merged in #67; the rest are the second. Ids are not contiguous: bugs-5, bugs-6 and broken-features-5, -6 were merged into others or dropped during reproduction, and the ids carried below have no fix commit.

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
| colors-le-race-conditions-1 | 6 | A cancel during the last file's read or the clipboard copy still opened the workspace report | `035d1d3` | `extractWorkspace.test.ts` | fail2/race-1.log |
| colors-le-race-conditions-2 | 6 | Eight commands had no two-at-once test (test gap) | `f2dad6a` | `concurrency.test.ts` | test gap, passes |
| colors-le-race-conditions-3 | 6 | Framing and concurrency untested against the built servers (test gap) | `210074f` | `check:mcp-loops` | test gap, passes |
| colors-le-memory-leaks-3 | 5 | A link loop in a tree was passed over without a word | `d6e59b2` | `hazards.rs`, `cli.test.ts` | fail2/errors-8-c.log, -n.log |
| colors-le-memory-leaks-4 | 5 | The hazard suite left two trees in the temporary directory on every run | `80f0f23` | `hazards.rs` | fail2/memory-leaks-4.log |
| colors-le-memory-leaks-5 | 5 | No driver measured memory across many calls (test gap) | `210074f` | `check:mcp-memory` | test gap, passes |
| colors-le-memory-leaks-6 | 5 | The mock could not see the code action registrations released (test gap) | `83298d4` | `lifecycle.test.ts` | fail2/memory-leaks-6.log, with the registrations left unowned |
| colors-le-bugs-8 | 3 | An empty document was an error on Extract and `ok: false` on two of three servers | `a8ef6af` | `commands.test.ts`, `characterization.test.ts`, corpus | fail2/bugs-8.log, fail2/bugs-8-parity.log |
| colors-le-bugs-9 | 3 | A legacy hue past 360 and a channel past 255 read unwrapped and unclamped, on all three readers | `8740277` | `colorConversion.test.ts`, `cli.test.ts`, `palette.rs` | fail2/bugs-9.log, -n.log, -c.log |
| colors-le-bugs-10 | 3 | Filter's strict presets kept a colour at their bound | `d5fdb5e` | `prompts.test.ts` | fail2/bugs-10.log |
| colors-le-bugs-11 | 3 | Convert and Validate's contrast had a second colour reader; Exclude transparent missed three notations | `1c4212a` | `colorConverter.test.ts`, `filterColors.test.ts` | fail2/bugs-11.log |
| colors-le-bugs-12 | 3 | Options accepted and ignored, branches no input reaches, `yml`, quadratic `settle` | `6d4303c`, `9506310`, `b1211c5`, `11e5540`, `88522e1` | host suite, `budget.rs`, `reportCommands.test.ts`, `mod.rs`, `cli.test.ts` | fail2/bugs-12-*.log; the Analyze arms were unreachable, so nothing could fail |
| colors-le-bugs-13 | 3 | A filename that is a format name resolved on the crate only | `ea91fda` | `mcp.test.ts`, corpus | fail2/bugs-13.log |
| colors-le-bugs-15 | 3 | Three extractor patterns were quadratic | `6b3474c` | `html.test.ts`, `heuristics.test.ts` | fail2/bugs-15.log |
| colors-le-bugs-17 | 3 | "Commands pass `document.languageId`" had no test (test gap; the false hard rule is carried) | `acb5a2e` | `commands.test.ts` | test gap, passes |
| colors-le-bugs-19 | 3 | The palette's hsl rounded a channel on .5 down, hundreds of values off by one | `465b668` | `cli.test.ts`, `palette.rs` | fail2/bugs-11-n.log, -c.log |
| colors-le-errors-5 | 4 | The results limit inside the last file, two Analyze clusters and two tables' tails dropped without a note | `14786ba`, `e5a0e7d` | `extractWorkspace.test.ts`, `colorAnalysis.test.ts`, `reportCommands.test.ts` | fail2/errors-5-cap.log, -analyze.log |
| colors-le-errors-6 | 4 | A file the reader threw on read as clean | `018b03b` | `extractWorkspaceReaderFailure.test.ts` | fail2/errors-6.log |
| colors-le-errors-8 | 4 | FIFOs and links vanished, a FIFO named outright was an empty tree, a FIFO palette hung | `d6e59b2` | `hazards.rs`, `cli.test.ts`, `check:cli-parity` | fail2/errors-8-c.log, -n.log; the npm palette case blocks the old code and was shown hanging, not failing |
| colors-le-errors-10 | 4 | No test said a cut-off document has no malformed state (test gap) | `86d8253` | `mcp.test.ts` | test gap, passes |
| colors-le-broken-features-8 | 2 | Extract Folder on a multi-selection scanned one folder | `3bbe21f` | `extractWorkspace.test.ts` | fail2/bf-8.log |
| colors-le-broken-features-9 | 2 | The two safety settings measured document lines and UTF-16 units | `f83ee5e` | `safety.test.ts`, `commands.test.ts` | fail2/bf-9.log |
| colors-le-broken-features-10 | 2 | Four test-only exports and a detector that never detects | `a8d89fd` | removal | not applicable |
| colors-le-broken-features-11 | 2 | The suppression gate passed inner and `cfg_attr` forms | `5b4031f` | `ciGates.test.ts` | fail2/bf-11.log |
| colors-le-broken-features-12 | 2 | `--help` omitted `--palette` and bracketed a required flag | `13eecee` | `cli.rs`, `cli.test.ts`, `contracts.rs` | fail2/bf-12-c.log, -n.log |
| colors-le-broken-features-13 | 2 | No host test changed a setting after activation (test gap) | `32ebf98` | `settings-and-languages.test.ts` | test gap, passes |
| colors-le-broken-features-14 | 2 | The provider's definition and a host without agent mode untested (test gap) | `af6e02a` | `provider.test.ts` | test gap, passes |
| colors-le-l10n-7 | 7 | 40 keys said something other than the source in at least one locale | `2b23a72` | none, not mechanical | not applicable |
| colors-le-l10n-8 | 7 | Seven locales named commands by titles the palette does not show | `5909201` | `l10n.catalogue.test.ts` | fail2: 7 locales failed on `46234e7` |
| colors-le-l10n-9 | 7 | A pasted locale label, ASCII colons in Japanese, English `Output` in Vietnamese | `46234e7` | `l10n.catalogue.test.ts` | fail2/l10n-9.log |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| colors-le-errors-7, BUG-17 | A run in which every input failed exits 1 and `colors_le_scan` answers `ok: true`, the same as a clean run. SPEC says a skipped file never changes the exit code, numbers-le passed the same behaviour, and the crate's hard rule says such a run exits 2; two of the three disagree whichever is kept. The crate's `is_incomplete` exit-2 arm is unreachable either way | Owner: exit 2 and `ok: false` when nothing was read, or the hard rule rewritten to SPEC |
| colors-le-broken-features-10 | Filter `hueRange`, `customPattern` and Validate `customRules` have consumers and no prompt that sets them | Owner: add the prompts or remove the options |
| colors-le-bugs-16 | A lone surrogate escape, an id of `1e400` and nesting 200 deep are answered by the JavaScript servers and refused by the crate; the JavaScript side echoes `1e400` as `null` | Owner picks each document's side; the fix is in the fleet-shared transport and frame reader |
| colors-le-memory-leaks-1 | The extension's server counts its frame limit in UTF-16 units | Fleet sweep: `src/mcp/transport.ts` is held identical by `check:fleet` |
| colors-le-memory-leaks-2 | Neither command line bounds a file's size; past V8's string limit the npm side calls ASCII "not UTF-8 text" | Fleet sweep for the mislabel in `src/cli/ioError.ts`; the owner for a size ceiling, a contract change on both command lines |
| colors-le-bugs-14 | Tool arguments that are not an object are refused in the wrong words by the extension's server | Fleet sweep: `src/mcp/transport.ts` |
| colors-le-bugs-18 | A comma inside a `scanExcludes` pattern splits it, in a real host | Fleet sweep: `src/workspace/scan.ts` |
| colors-le-errors-9 | `commit-lint.js --range` exits 0 on any `git log` failure | Fleet sweep: `scripts/commit-lint.js` |
| `check:mcp-loops` in CI | The driver runs locally only; wiring it into CI touches the fleet-shared `ci.yml` | Fleet sweep |
| L10N-5 | The four markdown reports are English in every locale; `AGENTS.md` records this as decided, and the maintainer has not decided it | Maintainer decision |
| L10N-13 | The id and vi word for the Explorer in one help line | The VS Code id and vi language packs |
| RACE-8 | A continuation resolving after deactivation would write to the disposed telemetry channel | A host test that deactivates with a command pending |
| CLOSE-5 | `check:locales` is red on numbers-le only | The numbers-le pass |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | Yes | Every check has an answer. Two are `unknown`, RACE-8 and the Explorer word in L10N-13, listed in #68 |
| CLOSE-2 | Yes | Findings and Carried above |
| CLOSE-3 | Yes, bar the named ones | Each fix's test was run with the fix stashed, logs in `fail2/`; test gaps have no fix to stash; l10n-7 is not mechanical; the npm FIFO palette case blocks the old code and was shown hanging. From the first walk: l10n-5, l10n-6, broken-features-2 |
| CLOSE-4 | Yes | 51 gates exit 0 on `eb7f504`; tree clean after |
| CLOSE-5 | Yes, bar numbers-le | `check:fleet` and `check:doc-paths` pass; `check:locales` red on numbers-le's three "GitHub Issues" values only; `check:registry` was red on decisionlint 1.1.1's facts, synced in the site change that carries this record |
| CLOSE-6 | Yes | Changelog lines for each behaviour change; `AGENTS.md` and `crate/AGENTS.md` invariants name their tests (`eb7f504`); `crate/SPEC.md` |
| CLOSE-7 | Yes | Every commit by the noreply address with a typed subject; `lint-commits` passes |
| CLOSE-8 | Yes | #67 merged; #68 opened, then merged as `c8b07af` on 2026-11-20 |
| CLOSE-9 | Yes | #68 on `eb7f504`: 34 passed, 1 skipped, and the Windows leg failed on two new tests, one calling grep, which that runner did not have, the other expecting the platform's path separator where a report uses `/`; fixed in `5778c81`, then 35 passed, 1 skipped |
| CLOSE-10 | Yes | Ledger row |
| CLOSE-11 | Yes | BUG-23 (one dense document is timed), BUG-24 (two conversions compared over a grid), and FEAT-3 names the Explorer's selection argument. The hunt is unchanged: no check found something here and in every earlier pass without already being in it |
