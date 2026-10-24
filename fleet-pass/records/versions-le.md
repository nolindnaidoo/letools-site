# Fleet pass record: versions-le

The first pass under the read-once procedure: step 1 read every file on the
manifest once with the checks of steps 2 to 7 beside it, and the steps below
answer from that read, the tables and the runs.

| | |
|---|---|
| Repo | versions-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `2b3b25628145303b53146162daaac6b89478e6f5` |
| Started | 2026-10-24 |
| Pull request | [nolindnaidoo/versions-le#39](https://github.com/nolindnaidoo/versions-le/pull/39) |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-cli,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; after `git fetch`, `git status -sb` → `## main...origin/main` |
| BASE-2 | pass | `git config user.email` → `13629544+nolindnaidoo@users.noreply.github.com` inside the repo |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from main at `2b3b2562` |
| BASE-4 | pass | Gate list below, derived from the seven workflow files and `package.json` scripts |
| BASE-5 | see table | One script (`gates.sh baseline`) ran every command unpiped, each to its own log, and recorded the exit code |
| BASE-6 | see findings | One red gate at baseline: `coverage:readme:check` (`versions-le-features-1`) |
| BASE-7 | recorded | Per-file coverage below |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. Four surfaces: `E` extension,
`M` the MCP server bundled in the extension and shipped on npm, `N` the npm
packages (`versions-le-mcp` and the command line `versions-le`), `C` the crate.
The crate chain runs inside `crate/` on the toolchain `rust-toolchain.toml`
pins, 1.98.1.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | Red once on the first final run: two tests the pass added were not in the formatter's shape (`59f8851`); the whole list was run again on that commit |
| `E` | `bun run typecheck` | exit 0 | exit 0 | Covers `src/` and `vitest.config.ts` only; `scripts/` is not type-checked (FEAT-19) |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | Baseline 20 files, 334 tests; statements 78.46, branches 71.55, functions 81.51, lines 81.86. Close 24 files, 379 tests; 79.31, 72.36, 82.44, 82.58 |
| `E` | `bun run build` | exit 0 | exit 0 | |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | static scan and runtime load of `dist/extension.js` |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 | |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | 48 KB, one tool answered over stdio |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `versions-le-mcp@1.2.2` |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | installs from the tarball, answers over stdio as `versions-le-mcp` |
| `E` | `bun run package` | exit 0 | exit 0 | `release/versions-le-1.2.2.vsix`, 34 files, 229,524 bytes; `clean:i18n` left no copied catalogue |
| `E` | `bun run coverage:readme:check` | **exit 1** | exit 0 | README said 328 cases across 19 files, the run has 334 across 20: the sweep's `guard.test.ts` landed without regenerating the section. Hand-run gate, not in CI. `versions-le-features-1` |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline |
| `E` | `python3 scripts/check-agent-files.py` | exit 0 | exit 0 | also run by `src/agent-files.test.ts` inside the unit suite |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | ext = npm = `server.json` (both fields) = 1.2.2; mcpName `io.github.nolindnaidoo/versions-le`; identifier `versions-le-mcp` |
| `C` `N` | one-version job shell (`ci-crate.yml`) | exit 0 | exit 0 | `crate/Cargo.toml` = `cli/package.json` = 1.2.2 |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` | exit 0 | exit 0 | |
| `C` | `cargo build --locked` | exit 0 | exit 0 | |
| `C` | `RUSTUP_TOOLCHAIN=1.88 cargo check --locked` | exit 0 | exit 0 | msrv job |
| `C` | policy: no inline `#[allow(`/`#[expect(` | exit 0 | exit 0 | |
| `C` | policy: no doc holding the surfaces equal | exit 0 | exit 0 | |
| `C` | `cargo llvm-cov` + per-module 70% floor on `detect/` | exit 0 | exit 0 | `cargo-llvm-cov` is installed here; lowest module `parser.rs` 98.49% |
| `C` `M` | `bun scripts/check-detection-parity.ts` | exit 0 | exit 0 | 22 corpus documents under the port, every `mcp-compare-versions.json` case under both servers |
| `C` | `cargo build --release --locked` | exit 0 | exit 0 | |
| `C` `M` | `bun scripts/check-detection-differential.ts` | exit 0 | exit 0 | 1,500 generated manifest sets, seed 20261004: identical |
| `C` `M` | `bun scripts/check-mcp-definition.ts` | exit 0 | exit 0 | |
| `N` | `bun run build:cli` | exit 0 | exit 0 | |
| `C` `N` | `bun run check:cli-parity` | exit 0 | exit 0 | 77 commands and 44 MCP lines identical between the two `versions-le` binaries |
| `C` `N` | `bun run check:cli-pipes` | exit 0 | exit 0 | 3 closed-pipe cases and 18 malformed frames alike |
| `N` | `bun run build:cli:prod` then `bun run check:cli-package` | exit 0 | exit 0 | `versions-le@1.2.2` packed, installed, scanned, served |
| `C` | `cargo audit` | not run here | not run here | `cargo-audit` is not installed; CI's `audit` job |
| `C` | `VERSIONS_LE_SCENARIOS=1 cargo test --test scenarios -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 3 passed |
| `C` | `cargo test --test hazards -- --nocapture` | exit 0 | exit 0 | |
| `C` | `cargo test --test platform -- --nocapture` | exit 0 | exit 0 | |
| `C` | `TZ=UTC` and `TZ` unset, test names compared | exit 0 | exit 0 | identical |
| `C` | `VERSIONS_LE_FUZZ_SECONDS=60 cargo test --test fuzz -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 3 passed in 60.33 s, CI's budget |
| `C` | `VERSIONS_LE_BUDGET=1 cargo test --test budget -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 3 passed |
| `C` | `cargo test --bins coverage_matrix -- --nocapture --test-threads=1` + the two marker greps | exit 0 | exit 0 | 5 ecosystems, 5 kinds, 6 findings, 4 refusals reachable |
| `C` | `cargo package --list --allow-dirty` carries `fixtures/` | exit 0 | exit 0 | release-crate preflight |
| `C` | `cargo publish --dry-run --locked` | exit 0 | exit 0 | release-crate preflight |
| `C` | crates.io version probe | not run here | not run here | release-only; its body was driven with six fixed registry answers in the fleet sweep (`ci(release): refuse to publish without a version list from crates.io`) |
| `E` | `bun run test:integration` | exit 0 | exit 0 | Baseline 9 passing in a real host (VS Code stable). Close 10 passing, plus the German language pack launch (1 passing) and the German host launch (2 passing) |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | `INSTALLED-VSIX TEST: PASS (versions-le-1.2.2.vsix)` |
| `E` `N` `C` | `vsce publish`, `ovsx publish`, `npm publish` (×2), `mcp-publisher`, `cargo publish` | not run here | not run here | publishing |
| `E` | `benchmark`, `perf:readme`, `coverage:readme`, `readme` | not run here | not run here | generated-section writers; `coverage:readme` is run at close for `versions-le-features-1` |
| `E` | `clean`, `clean:i18n`, `copy:i18n`, `build:prod`, `build:mcp`, `watch`, `test:watch`, `lint:fix`, `vscode:prepublish`, `hooks:install`, `prepare`, `publish` | run via `package` or not gates | same | `vscode:prepublish`, `copy:i18n` and `clean:i18n` ran inside `package` |

BASE-7, from `coverage/coverage-summary.json` at baseline. Floors are 70 lines, 70 functions, 60 branches, 70 statements.

| File | Lines | Functions | Branches | Statements | Why |
|---|---|---|---|---|---|
| `src/cli/main.ts`, `run.ts`, `scan.ts`, `ignoreRules.ts` | 0 | 0 | 0 | 0 | The npm command line is driven as a built binary by `check:cli-parity` and `check:cli-pipes`, never by a unit test |
| `src/cli/discover.ts` | 10.3 | 8.7 | 14.9 | 10.6 | as above; `normalise` alone is unit tested |
| `src/cli/ioError.ts` | 44.7 | 30.0 | 34.9 | 37.8 | as above |
| `src/cli/mcp.ts` | 54.3 | 55.5 | 35.8 | 50.6 | one unit test; the rest through the parity gates |
| `src/cli/args.ts` | 84.8 | 100 | 59.4 | 73.3 | branches under the floor |
| `src/mcp/info.ts`, `server.ts` | 0 | 100 | 0 | 0 | entry points, driven over stdio by `check:mcp-bundle` and `check:npm-package` |
| `src/mcp/provider.ts` | 37.5 | 33.3 | 50.0 | 37.5 | the registration branch ran in no unit test: the mock has no `vscode.lm` (`versions-le-features-3`) |
| `src/mcp/envelope.ts` | 72.7 | 55.5 | 88.2 | 73.1 | `capped`, `readString` and `isOk` are exported and called by nothing in `src/` (`versions-le-features-4`) |
| `src/extension.ts` | 100 | 50 | 100 | 100 | `deactivate` ran in no test (`versions-le-leaks-2`) |
| `src/detect/json.ts` | 72.5 | 92.1 | 53.8 | 67.0 | the transcription's refusal arms; held by the differential rather than unit tests |
| `src/detect/text.ts` | 94.4 | 80.0 | 36.4 | 88.9 | |

## Step 1: Inventory

Read manifest, from INV-1 (`git ls-files -- src test scripts mcp crate/src crate/tests package.json server.json | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/' | xargs wc -l`), 103 files, 22,037 lines at the baseline commit. Every file was read once, from its first line to its last, with the six later documents open beside it; the notes a later check needed were written into INV-5 to INV-8 as each file went by.

The filter removed, and a later step covers: `src/i18n/package.nls.*.json` (12, step 7), `src/detect/__fixtures__/manifest-cases.json` and `toml-cases.json` (read with `cases.test.ts`), `src/assets/images/*.png` (no surface). Tracked outside the roots and also read: `crate/fixtures/detection.json`, `mcp-compare-versions.json` and the 22 corpus documents (with `corpus.test.ts` and `corpus.rs`), `README.md`, `crate/README.md`, `cli/README.md` (INV-10), `CHANGELOG.md` and `crate/CHANGELOG.md` (heads), `crate/Cargo.toml`, `cli/package.json`, `.githooks/commit-msg`, `.vscodeignore`, `biome.json`, `tsconfig.json`, `tsconfig.it.json`, the seven workflows, `l10n/*.json` and `package.nls.json` (step 7). `assets/demos/`, `.vscode/`, `.github/codeql-config.yml`, `.github/dependabot.yml`, the six agent-instruction files, `.editorconfig`, `.gitattributes`, `.gitignore`, `.mailmap`, `GEMINI.md` and `LICENSE` carry no surface.

| Read | Lines | File |
|---|---|---|
| [x] | 382 | crate/src/cli.rs |
| [x] | 790 | crate/src/detect/compare.rs |
| [x] | 452 | crate/src/detect/corpus.rs |
| [x] | 1222 | crate/src/detect/grammar.rs |
| [x] | 321 | crate/src/detect/heuristics.rs |
| [x] | 5 | crate/src/detect/mod.rs |
| [x] | 1229 | crate/src/detect/parser.rs |
| [x] | 599 | crate/src/discover.rs |
| [x] | 12 | crate/src/main.rs |
| [x] | 287 | crate/src/mcp/compare.rs |
| [x] | 612 | crate/src/mcp/mod.rs |
| [x] | 452 | crate/src/scan.rs |
| [x] | 62 | crate/src/testing.rs |
| [x] | 279 | crate/tests/budget.rs |
| [x] | 490 | crate/tests/contracts.rs |
| [x] | 724 | crate/tests/fuzz.rs |
| [x] | 652 | crate/tests/hazards.rs |
| [x] | 412 | crate/tests/platform.rs |
| [x] | 142 | crate/tests/scenarios.rs |
| [x] | 227 | mcp/README.md |
| [x] | 55 | mcp/package.json |
| [x] | 220 | package.json |
| [x] | 75 | scripts/benchmark.ts |
| [x] | 57 | scripts/build-cli.js |
| [x] | 38 | scripts/build-mcp.js |
| [x] | 98 | scripts/build-npm.js |
| [x] | 135 | scripts/check-agent-files.py |
| [x] | 103 | scripts/check-bundle.js |
| [x] | 102 | scripts/check-cli-package.js |
| [x] | 434 | scripts/check-cli-parity.ts |
| [x] | 186 | scripts/check-cli-pipes.ts |
| [x] | 217 | scripts/check-detection-differential.ts |
| [x] | 117 | scripts/check-detection-parity.ts |
| [x] | 159 | scripts/check-mcp-bundle.js |
| [x] | 93 | scripts/check-mcp-definition.ts |
| [x] | 155 | scripts/check-npm-package.js |
| [x] | 182 | scripts/commit-lint.js |
| [x] | 181 | scripts/coverage-readme.js |
| [x] | 207 | scripts/e2e-vsix.js |
| [x] | 27 | scripts/install-hooks.js |
| [x] | 72 | scripts/perf-readme.js |
| [x] | 33 | server.json |
| [x] | 624 | src/__mocks__/vscode.ts |
| [x] | 62 | src/agent-files.test.ts |
| [x] | 72 | src/cli/args.ts |
| [x] | 96 | src/cli/cli.test.ts |
| [x] | 283 | src/cli/discover.ts |
| [x] | 36 | src/cli/frames.test.ts |
| [x] | 58 | src/cli/frames.ts |
| [x] | 205 | src/cli/glob.ts |
| [x] | 171 | src/cli/ignoreRules.ts |
| [x] | 144 | src/cli/ioError.ts |
| [x] | 28 | src/cli/main.ts |
| [x] | 257 | src/cli/mcp.ts |
| [x] | 138 | src/cli/output.test.ts |
| [x] | 77 | src/cli/output.ts |
| [x] | 40 | src/cli/run.ts |
| [x] | 122 | src/cli/scan.ts |
| [x] | 46 | src/cli/usage.ts |
| [x] | 206 | src/commands/commands.test.ts |
| [x] | 123 | src/commands/compare.ts |
| [x] | 81 | src/commands/guard.test.ts |
| [x] | 30 | src/commands/guard.ts |
| [x] | 87 | src/commands/help.ts |
| [x] | 39 | src/commands/index.ts |
| [x] | 37 | src/commands/output.ts |
| [x] | 70 | src/config/config.test.ts |
| [x] | 95 | src/config/config.ts |
| [x] | 24 | src/config/settings.ts |
| [x] | 65 | src/detect/cases.test.ts |
| [x] | 312 | src/detect/compare.ts |
| [x] | 91 | src/detect/corpus.test.ts |
| [x] | 67 | src/detect/detect.test.ts |
| [x] | 582 | src/detect/grammar.ts |
| [x] | 89 | src/detect/heuristics.ts |
| [x] | 575 | src/detect/json.ts |
| [x] | 111 | src/detect/libraries.test.ts |
| [x] | 630 | src/detect/parser.ts |
| [x] | 104 | src/detect/report.ts |
| [x] | 321 | src/detect/semver.ts |
| [x] | 47 | src/detect/text.ts |
| [x] | 881 | src/detect/toml.ts |
| [x] | 39 | src/extension.ts |
| [x] | 136 | src/mcp/envelope.ts |
| [x] | 13 | src/mcp/info.ts |
| [x] | 322 | src/mcp/mcp.test.ts |
| [x] | 55 | src/mcp/provider.ts |
| [x] | 107 | src/mcp/readme.test.ts |
| [x] | 13 | src/mcp/server.ts |
| [x] | 130 | src/mcp/tools.ts |
| [x] | 297 | src/mcp/transport.ts |
| [x] | 116 | src/rating/policy.test.ts |
| [x] | 84 | src/rating/policy.ts |
| [x] | 61 | src/rating/wiring.test.ts |
| [x] | 52 | src/report/format.test.ts |
| [x] | 101 | src/report/format.ts |
| [x] | 31 | src/telemetry/telemetry.test.ts |
| [x] | 34 | src/telemetry/telemetry.ts |
| [x] | 15 | src/types.ts |
| [x] | 35 | src/ui/notifier.ts |
| [x] | 317 | src/ui/ratingPrompt.test.ts |
| [x] | 179 | src/ui/ratingPrompt.ts |
| [x] | 53 | src/ui/statusBar.ts |
| [x] | 85 | src/ui/ui.test.ts |
| [x] | 50 | src/utils/errors.test.ts |
| [x] | 26 | src/utils/errors.ts |
| [x] | 84 | test/integration/extension.test.ts |
| [x] | 179 | test/integration/l10n.test.ts |

### INV-2 Manifest contributions

`contributes` keys: `commands`, `configuration`, `mcpServerDefinitionProviders`, `menus`. `main`: `./dist/extension.js`. `l10n`: `./l10n`. `engines.vscode`: `^1.101.0` with `@types/vscode` pinned to `1.101.0` exactly. `capabilities`: `virtualWorkspaces` and `untrustedWorkspaces` both `limited`, one description key.

Commands (3): `versions-le.compare`, `versions-le.openSettings`, `versions-le.help`. Every title and the category are `%key%` placeholders; L10N-1 shows the key sets equal.

Menus: `explorer/context` → `compare` in group `7_modification@1` when `explorerResourceIsFolder`; `commandPalette` → all three, no `when`. Keybindings: none. Activation events (6): `workspaceContains:**/package.json`, `**/Cargo.toml`, `**/pyproject.toml`, `**/go.mod`, `.github/workflows/*.yml`, `.github/workflows/*.yaml`.

MCP server definition providers: id `versions-le`, label `%manifest.mcp.label%`.

Configuration (8 properties). Every one is read through `config/config.ts` `readConfig()`, which the command, the notifier, the status bar and the telemetry each call when they need it.

| Property | Type | Default | Consumer |
|---|---|---|---|
| `clipboardIncludesPositions` | boolean | true | `commands/compare.ts` 101, the clipboard copy of the report |
| `copyToClipboardEnabled` | boolean | false | `commands/output.ts` 30 |
| `exclude` | string[] | [] | `commands/compare.ts` 53, joined into the `findFiles` exclude glob |
| `notificationsLevel` | enum all/important/silent | silent | `ui/notifier.ts` per message; `ui/ratingPrompt.ts` 141 inspects the user's own value |
| `openResultsSideBySide` | boolean | true | `commands/output.ts` 20 |
| `showPositions` | boolean | true | `commands/compare.ts` 98 → `report/format.ts` |
| `statusBar.enabled` | boolean | true | `ui/statusBar.ts` 21 and 44, with a change listener at 27 |
| `telemetryEnabled` | boolean | false | `telemetry/telemetry.ts` 22, per event |

Config keys read in source and not declared: none. No number settings, so the `readNumber` defect the sweep fixed elsewhere has no surface here.

### INV-3 Registrations

| Command | Registered at (baseline lines) |
|---|---|
| `versions-le.compare` | `commands/index.ts` 23, through `guarded()` |
| `versions-le.openSettings` | `config/settings.ts` 12, through `guarded()` |
| `versions-le.help` | `commands/help.ts` 13, through `guarded()` |
| provider `versions-le` | `mcp/provider.ts` 29 (`lm.registerMcpServerDefinitionProvider`, feature-detected) |

Three `registerCommand` calls, three manifest commands, no unmatched row either way. `test/integration/extension.test.ts` "registers every declared command" asserts it with `getCommands(true)`.

### INV-4 Settings and their consumers

Covered by the INV-2 table. Each value's consumer test is named under FEAT-6.

### INV-5 Resources with a lifetime

| Resource | Created | Released |
|---|---|---|
| Output channel `Versions-LE` | `telemetry.ts` 14, lazily on the first event with telemetry on | `telemetry.dispose()`, pushed to subscriptions at `extension.ts` 17 |
| Status bar item | `statusBar.ts` 11 | subscriptions at 18 |
| `onDidChangeConfiguration` listener | `statusBar.ts` 27 | subscriptions at 26 |
| Flash restore timer (`setTimeout`, 2 s) | `statusBar.ts` 47, per flash | cleared by the next flash and by a dispose object in subscriptions (34–39); a flash after dispose sets a new one against the disposed item: `versions-le-leaks-1` |
| 3 command disposables | each `registerCommand` | subscriptions |
| MCP provider disposable | `provider.ts` 29 | subscriptions at 36 |
| MCP `buffer` string, npm server | `transport.ts` 221, per `serve` | consumed per newline; capped at `MAX_FRAME_BYTES` 16 MiB with the rest of the line discarded (fleet sweep) |
| Crate MCP frame | `mcp/mod.rs` 35, `stdin.lock().lines()` | held whole until its newline, **no maximum**: `versions-le-leaks-3` |
| npm CLI MCP frame | `cli/frames.ts` 31, `pending` Buffer | held whole until its newline, **no maximum**: `versions-le-leaks-3` |
| Rating prompt state | `globalState`, `ratingPrompt.ts` | memento, no process resource |
| `TextDecoder` at `compare.ts` 30 | module scope | stateless |
| Regular expressions at module scope | `errors.ts` 7–12 (`g`, used through `replace`), `text.ts` 8–10 and 35 (no `g`), `ratingPrompt.ts` 164 (no `g`), `glob.ts` compiled per pattern (no `g`) | no `lastIndex` is kept across calls |
| Frozen tables | `CONFIG_DEFAULTS`, `VENDORED`, `TOOLS`, `ECOSYSTEMS`, `ECOSYSTEM_OF`, `NPM_OPERATORS`, `MOVING_CHANNELS`, `RATING_POLICY`, `STRERROR`, `GLIBC`, `WINDOWS`, `FLAGS`, `CHECK_ARGUMENTS`, `SHARED`, `CHECK_DEFINITION` | constants, never written |

No intervals, watchers, webviews, decorations, diagnostics collections or child processes in the extension. No module-level cache, map or counter grows with use. In the crate: no threads, no statics outside the test helper's counter, no temporary files; every file is read whole with `std::fs::read` and dropped.

### INV-6 Suspension points

| Site | Reads before | Uses after |
|---|---|---|
| `compare.ts` 58 (`findFiles`, per root) and 73 (`fs.readFile`, per file) | `workspaceFolders` or the picked folder, `readConfig()` once | the root list and the config snapshot; a folder removed mid-run is still compared, which is the question that was asked (RACE-1 safe when stale); a file gone between the listing and the read is caught at 75 (RACE-11, `versions-le-errors-2`) |
| `compare.ts` 97 (`showReport`) | the report | nothing shared; the flash and the toast after it describe the report that was computed (ERR-5 pass with a note) |
| `output.ts` 14, 18 (open, show), 33 (clipboard) | nothing shared | `ratingPrompt.recordSuccess()` only after the show resolved |
| `help.ts` 24, 28 | nothing | nothing |
| `settings.ts` 17 | nothing | nothing |
| `guard.ts` 19 | nothing | the notifier on rejection |
| `ratingPrompt.ts` 104, 111 (memento writes), 70 (toast), 86 (`openExternal`), 81/90 (settle) | the stored state, re-read on each call | written before the toast is awaited (RACE-5 pass); fleet file |
| `transport.ts` 131 (`tool.handler`), 286 (`.then`) | nothing shared | the response carries its own id (RACE-13 pass, driven) |
| `cli/mcp.ts` 80–81 (one request at a time), 170/173/186 | nothing shared | sequential by design, as the crate |
| `cli/main.ts` 15, 25 (`.then`), `frames.ts` 14, 32 | nothing | exit after both streams drain |

### INV-7 Failure sites

| Site (baseline) | What arrives | What happens |
|---|---|---|
| `compare.ts` 69–83 | `fs.readFile` rejecting (a file gone or unreadable since the listing) or `TextDecoder` throwing on bytes that are not UTF-8 | one diagnostic, `unreadable`, message "not readable as UTF-8 text" for both causes: `versions-le-errors-2` |
| `compare.ts` 110 | a run whose every manifest was unreadable | "No manifests found" toast and a report that says so, the diagnostics never printed: `versions-le-errors-1` |
| `output.ts` 13–29 | `openTextDocument`/`showTextDocument` rejecting | `notifier.error('Could not open results')`; ran in no test until this pass (`versions-le-errors-3`) |
| `output.ts` 32–36 | `clipboard.writeText` rejecting | `notifier.warn('Could not copy to clipboard')`; ran in no test until this pass (`versions-le-errors-3`) |
| `guard.ts` 18–28 | any rejection out of a command body | one redacted, localized error (fleet sweep) |
| `ratingPrompt.ts` 113–120 | memento or toast failing | reported to telemetry, never shown (fleet file, by design) |
| `transport.ts` 130–143 | a tool throwing | `isError` result with the message |
| `transport.ts` 157–203 | a protocol failure | JSON-RPC error, `-32602` for a missing name or unknown tool, `-32601` for a method, `-32603` otherwise |
| `transport.ts` 257–263, 266–275, 277–284, 291–295 | an oversized line, invalid JSON, a non-request, an oversized buffer | `-32700` parse errors, the server stays up |
| `transport.ts` 286 | `void respond().then(write)` | `respond` catches everything it runs; nothing floats |
| `tools.ts` 34, 39, 48, 52, 55; `envelope.ts` 98, 116 | argument shapes | thrown, becoming `isError` results naming the argument |
| `parser.ts` 135–141 | `parseJson` throwing | "not valid JSON" diagnostic, nothing read from the file |
| `parser.ts` 236, 351 | `parseToml` returning `undefined` | "not valid TOML" diagnostic |
| `json.ts` 75, `toml.ts` 709, `semver.ts` 114 | the transcription's own failure class | rethrown or `undefined`; anything else is rethrown (programmer error) |
| `cli/glob.ts` 192 | a glob globset refuses | `null`: the pattern excludes nothing, as the crate |
| `cli/discover.ts` 69–73, 126–133, 181–190 | a root that cannot be stat'ed, a directory that cannot be read, a file that cannot be read or is not UTF-8 | thrown with the crate's wording; the walk ends on a directory, a file becomes a diagnostic |
| `cli/scan.ts` 27–36 | `read` throwing | `unreadable` diagnostic whose `file` is the basename only (`versions-le-errors-5`, raised) |
| `cli/ignoreRules.ts` 124–131 | an ignore file that cannot be read | no rules, as the `ignore` crate (by design, commented) |
| `cli/run.ts` 28–39 | a parse or walk error | `versions-le: <message>` on stderr, exit 2 |
| `cli/main.ts` 14 | stdout failing under `mcp` | exit 2, nothing said (crate parity) |
| `cli/output.ts` 29–55 | a closed stdout or stderr | the crate's refusal in the crate's words, or carries on |
| `cli/mcp.ts` 183–190 | a tool throwing | `isError` result |
| `cli/frames.ts` 17–21, 44–50 | a line that is not JSON, not UTF-8 | dropped, the server reads on (crate parity) |
| crate `cli.rs` 83–89 | `execute` failing | `versions-le: <message>` on stderr, exit 2 |
| crate `cli.rs` 98 | the report not writable | "could not write the report: …", exit 2 |
| crate `mcp/mod.rs` 36–45 | a line that is not UTF-8 | dropped, reads on (1.2.1) |
| crate `mcp/mod.rs` 49–53 | a line that is not JSON | dropped without a word: `versions-le-errors-4` |
| crate `mcp/mod.rs` 64–68 | no `method`, no id | dropped without a word: `versions-le-errors-4` |
| crate `mcp/mod.rs` 57 | stdout failing | exit 2 |
| crate `scan.rs` 101–108 | `discover::read` failing | `unreadable` diagnostic, basename only (`versions-le-errors-5`) |
| crate `discover.rs` 55, 95 | a root or an entry the walk cannot read | `Err` with the path, ending the run |
| crate `expect`/`unwrap`/`panic!` in non-test source | `cli.rs` 114, `mcp/mod.rs` 216, 313: serialising the crate's own types; `heuristics.rs` 73 `unwrap_or(filepath)` on `rsplit`; none reachable from input | no reachable panic (ERR-15 pass); `process::exit` is not used, exit codes flow through `ExitCode` |

### INV-8 User-visible strings, by channel

| Channel | Strings |
|---|---|
| Notifications through the notifier | `guard.ts` "Versions-LE could not finish: {0}"; `compare.ts` "Open a folder or workspace to compare its manifests", "No manifests found", "{0} version problem(s) across {1} manifest(s)"; `output.ts` "Could not open results", "Could not copy to clipboard". All through `l10n.t()` |
| Status bar | `statusBar.ts` tooltip "Run Versions-LE: Compare Versions" (`l10n.t()`), text `$(versions) Versions-LE` and `$(eye) {text}` (codicon and product name, never translated), flash text "{0} finding(s)" from `compare.ts` (`l10n.t()`) |
| The report document | `format.ts`: "Versions-LE report", the summary line, "No manifests found.", "No version problems found.", "Errors", "Warnings", "Info", "Not compared ({0})", "Could not be read ({0})", "Manifests", all `l10n.t()`; finding codes, ecosystem names, keys and constraints as data; the engine's finding messages and diagnostic messages in English, which the README documents ("A finding's message is the engine's English, identical to the CLI's") |
| The help document | `help.ts` `generateHelpContent()`: English Markdown, not localized. The same carried decision as the earlier passes (L10N-5) |
| The rating toast | `ratingPrompt.ts` "Enjoying {0}? …", "Rate", "Later", "Don't Ask Again", all `l10n.t()`; fleet file |
| Manifest | 18 `%key%` placeholders in `package.json`, every title, category, description, enum description and the provider label |
| MCP tool description and errors | English, machine-read (L10N-18, L10N-19) |
| CLI usage, stderr listing and refusals | English, held byte-for-byte to the crate (L10N-19) |
| Output channel | `telemetry.ts` event lines, machine-read |

### INV-9 Machine interfaces

MCP tools. `compare_versions` on both servers, one definition (held equal by `check-mcp-definition.ts`): `files: { path, content }[]` (required, `minItems: 1`, `additionalProperties: false` on each file) and `maxResults: integer` 1..5000 default 500; success `{ ok, data: { schema, manifests, findings, refusals, summary }, diagnostics, meta: { tool, count, truncated } }`; a refusal is a tool result with `isError: true` and one sentence naming the argument. `versions_le_check` on the crate and the npm command line: `path` (required), `ecosystems` (enum of five), `exclude`, `hidden`, `ignored`; the same envelope over the CLI's report.

CLI (`crate/src/cli.rs`, mirrored by `src/cli/`): `versions-le [options] <dir|file>...`, `versions-le mcp`, `--version`/`-V`, `--help`/`-h`; options `--ecosystem <name>` (repeatable), `--fail-on conflict|any`, `--strict`, `--exclude <glob>` (repeatable), `--hidden`, `--no-ignore`. Exit 0 nothing above info or no manifests; 1 findings (any finding under `--fail-on any`); 2 an unknown flag, a flag without its value, an unknown ecosystem or `--fail-on` value, a root that cannot be read, a named file that is not a manifest, a directory the walk cannot enter, stdout failing, or `--strict` with a diagnostic or a refusal that is not `cross_ecosystem` or `per_job_tool_version`.

npm: `mcp/package.json` bin `versions-le-mcp` → `server.js`, files `server.js`, `README.md`, `LICENSE`; `cli/package.json` bin `versions-le` → `cli.js`, files `cli.js`, `README.md`, `LICENSE`. Versions: `package.json` = `mcp/package.json` = `server.json` (both fields) = `cli/package.json` = `crate/Cargo.toml` = 1.2.2, held by the two versions jobs.

### INV-10 Claims

| Claim | Where | Backed by |
|---|---|---|
| Compares every manifest in the workspace, or under the folder picked in the Explorer | README Commands, help | `commands.test.ts` "finds every finding across the tree…", "compares only the folder picked…"; integration "finds a disjoint constraint across two crates" |
| Reads `package.json` (four sections, `engines`, `packageManager`), `Cargo.toml` (dependencies, dev, build, workspace and target variants, `rust-version`), `pyproject.toml` (PEP 621), `go.mod` (`require`, `go`), `.github/workflows/*.yml` (`uses:`, `<tool>-version:`, `toolchain:`) | README What it reads, crate README, help | `parser.rs` tests, `corpus.rs` coverage matrix, `detection.json` |
| Six checks with the stated severities | README, crate README, SPEC, help | `coverage_matrix_every_finding_and_refusal_is_produced_by_the_corpus`, `compare.rs` tests |
| Four refusals; `unknown_grammar` names the listed grammars | README, SPEC, help | the `refuses …` corpus cases; `fuzz.rs` pool; `every_unmodelled_grammar_in_the_pool_is_refused_and_never_compared` |
| `>=20` and `>=20.0.0` are not a conflict | README | `two_spellings_of_one_requirement_are_not_a_conflict`; `detect.test.ts` |
| One finding per drifted dependency with every site | README | `refusals_for_one_name_merge_into_one_row_with_every_site`; scenarios "a tree of nothing but refusals" |
| Comparison never crosses an ecosystem; one bridge `msrv-mismatch` | README, SPEC, help, mcp README | `a_name_in_two_ecosystems_is_never_compared`, the msrv tests |
| `node_modules`, `vendor` and `.git` are never read; `.github` always is | README, help | `commands.test.ts` "never reads node_modules or a non-workflow yml"; `node_modules_is_never_walked`, `the_workflow_directory_is_walked_without_asking` |
| It never edits a manifest, resolves a graph, hits the network, lints style | README, SPEC | `no_flag_offers_to_change_a_manifest`, `the_schema_offers_nothing_that_writes`; `Cargo.toml` carries no network crate |
| Exit codes 0/1/2 as stated; no manifests is 0 | README, crate README, cli README, SPEC | `contracts.rs` |
| `--exclude` takes ripgrep's glob syntax; an uncompilable pattern excludes nothing | crate README, SPEC | `the_glob_syntax_is_the_one_ripgrep_uses`, `an_uncompilable_pattern_excludes_nothing`; `cli.test.ts` "refuses the globs globset refuses" |
| stdout is protocol, silent at a terminal; no `--json`; no timestamp; byte-stable | crate README, SPEC | `a_terminal_gets_no_json`, `stdout_is_one_report_with_no_timestamp_and_is_byte_stable` |
| The npm command line is held to the crate byte for byte on three operating systems | README, cli README, AGENTS | `check:cli-parity`, `check:cli-pipes` in `ci-crate.yml` `cli-parity` |
| The two `compare_versions` servers answer identically; thousands of generated sets | README, mcp README | `check:detection-differential` (1,500 sets), `check-mcp-definition.ts`, `mcp-compare-versions.json` under both |
| VS Code 1.101+ needs nothing installed: the extension registers the server | README | `e2e-vsix.js` drives the installed server as the provider builds it; the registration itself under a host with the API: `versions-le-features-3` |
| `npx versions-le-mcp` installs and answers | mcp README | `check:npm-package` |
| MCP: findings capped at 500 by default with `meta.truncated` | README, mcp README | "a cap truncates and says so" corpus case |
| No network, reads manifests and nothing else, redacted notifications, the rating prompt at most twice | README Privacy | `check:mcp-bundle` static scan; `errors.test.ts`; `ratingPrompt.test.ts`, `policy.test.ts` |
| Twelve languages, both halves covered | README Languages | `l10n.test.ts` (integration), the German host: `versions-le-translations-1` |
| `cargo install versions-le` needs Rust 1.88+ | crate README | `rust-version = "1.88"`, the msrv job |
| Install from npm: `npx versions-le`, Node 20+ | README, crate README, cli README | `check:cli-package`; `engines.node >= 20` |
| Keep a Changelog, one version for every surface | AGENTS, CHANGELOG heads | the two versions jobs |

### INV-11 Tests, matched to what they cover

| Test file | Covers |
|---|---|
| `commands/commands.test.ts` | `commands/index.ts`, `compare.ts`, `output.ts` (success paths), `help.ts`, `config/settings.ts` |
| `commands/guard.test.ts` | `guard.ts`, and every `registerCommand` site by reading the source |
| `config/config.test.ts` | `config/config.ts`, manifest default parity |
| `ui/ui.test.ts` | `ui/notifier.ts`; `ui/statusBar.ts` with no assertion in any of its three tests (`versions-le-features-2`) |
| `ui/ratingPrompt.test.ts`, `rating/policy.test.ts`, `rating/wiring.test.ts` | `ui/ratingPrompt.ts`, `rating/policy.ts`, `extension.ts` activate |
| `telemetry/telemetry.test.ts` | `telemetry/telemetry.ts` |
| `utils/errors.test.ts` | `utils/errors.ts` |
| `report/format.test.ts` | `report/format.ts` |
| `detect/cases.test.ts`, `corpus.test.ts`, `detect.test.ts`, `libraries.test.ts` | `detect/*.ts` against the crate's own answers, the corpus and the three transcribed crates |
| `mcp/mcp.test.ts` | `mcp/envelope.ts`, `tools.ts`, `transport.ts` |
| `mcp/readme.test.ts` | `mcp/README.md` against `tools.ts` |
| `cli/cli.test.ts`, `frames.test.ts`, `output.test.ts` | `cli/args.ts`, `usage.ts`, `glob.ts`, `discover.ts` (`normalise`), `mcp.ts` (one case), `frames.ts`, `output.ts` |
| `agent-files.test.ts` | the six agent-instruction files, via `scripts/check-agent-files.py` |
| `test/integration/extension.test.ts` | activation, command registration, two real-tree runs, the provider API's presence |
| `test/integration/l10n.test.ts` | manifest placeholder substitution, both catalogue sets in key and placeholder parity, positional substitution |
| crate `src/*` unit tests, `tests/{budget,contracts,fuzz,hazards,platform,scenarios}.rs` | the crate; the npm command line through `check:cli-parity` and `check:cli-pipes` |

Source files with no unit test of their own: `src/cli/{main,run,scan,discover,ignoreRules,ioError}.ts` (driven as a binary by the parity gates), `src/mcp/{provider,server,info}.ts` (provider: `versions-le-features-3`; the other two are entry points driven by `check:mcp-bundle`), `src/extension.ts` `deactivate` (`versions-le-leaks-2`), `src/types.ts` (types only).

## Step 2: Broken features

The runs behind this step: `bun run test:integration` (10 passing in the real host, plus the German-host launches), `bun run test:e2e-vsix` (PASS), the three built servers driven by `probe/protocol.js` (24 protocol frames, three servers) and `probe/bug15.ts` (50 inputs the corpus never produces, both `compare_versions` servers), and the crate binary over this repository.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | INV-3: three `registerCommand` sites, three manifest commands. `test/integration/extension.test.ts` "registers every declared command" with `getCommands(true)` |
| FEAT-2 | E | pass | Real host: `compare` opens a report holding the disjoint pair and the msrv finding ("finds a disjoint constraint across two crates", "reads a workflow under .github/workflows") and honours the exclude setting; `openSettings` and `help` are asserted under the mock (`commands.test.ts` "opens the settings filtered to this extension", "opens the help, which names every finding and every refusal"), as in the earlier passes |
| FEAT-3 | E | finding | `versions-le-features-6`: the palette (`undefined`) and the Explorer (`Uri`) shapes were tested; an editor from a keybinding, which `isUri` rejects, was not. `commands.test.ts` "compares the workspace when the argument is not a folder" |
| FEAT-4 | E | pass, read | One menu entry, `explorer/context` under `explorerResourceIsFolder`, a context key the 1.101 floor carries; the three `commandPalette` entries have no `when`. Read in the manifest; no real display here |
| FEAT-5 | E | n/a | No keybindings are contributed (INV-2) |
| FEAT-6 | E | finding | Eight settings. `versions-le-features-2`: the `statusBar.enabled` tests asserted nothing. `versions-le-features-5`: `openResultsSideBySide` had no consumer test at either value and `copyToClipboardEnabled` none when off. The rest had both values: `exclude` (every TREE test keeps `web/Cargo.toml`; "leaves out what the exclude setting names"), `showPositions` ("names the file without its line when positions are off"), `clipboardIncludesPositions` ("copies the report when asked to", "decides positions for the clipboard separately from the report"), `notificationsLevel` (three values, `ui.test.ts`), `telemetryEnabled` (`telemetry.test.ts`) |
| FEAT-7 | E | pass | `config.test.ts` "covers every declared setting" walks the manifest and asserts each default against `CONFIG_DEFAULTS` |
| FEAT-8 | E | pass | `statusBar.enabled` has a change listener (`ui.test.ts` "shows by default, hides when the setting turns off, and shows again when it turns on"); every other setting is read by `readConfig()` on each run, nothing is cached |
| FEAT-9 | E | pass, read | Six `workspaceContains` events. The integration suite activates explicitly; the globs are read, not driven one by one. A workspace matching none reaches the commands through the palette, which activates on any contributed command |
| FEAT-10 | E | pass | The VSIX (34 files) holds `dist/extension.js`, `dist/mcp-server.js` (the one `asAbsolutePath`), 13 `package.nls*.json`, 12 `l10n/bundle.l10n.*.json` and the icon; `test:e2e-vsix` PASS at baseline and at close |
| FEAT-11 | E | pass | `check:bundle` scans and then `require`s the bundle (read in INV-1); green |
| FEAT-12 | M | pass | Driven against the three built servers: a valid call (the corpus, `check:detection-parity`), schema violations (`files: 'x'`, an extra argument, `arguments: null`) and malformed documents (a BOM-led `package.json`, `{`, cut-off TOML). Each returns the envelope, `ok: false` with one `parse-error` diagnostic for the malformed ones, identical on all three (`probe/protocol.js` 24 frames ALL SAME at close; `probe/bug15.ts` 50 inputs, 0 differ). `versions_le_check` on the crate and the npm command line: `check:cli-parity`'s 44 MCP lines drive it with a valid path, a missing one, wrong-typed and unknown arguments |
| FEAT-13 | M C | pass, with a gap named | Parity (22 corpus documents and every `mcp-compare-versions.json` case under both servers), differential (1,500 generated sets) and definition scripts read and green. The generator produces no byte order mark, no nesting past a few levels and no dotted key past three segments, which is where `versions-le-bugs-2` lived; `toml-cases.json` now pins those |
| FEAT-14 | M | finding | `versions-le-features-3`: the registration branch ran in no unit test, the mock having no `vscode.lm`. `scripts/e2e-vsix.js` spawns the installed server as the provider builds it and completes the handshake (PASS) |
| FEAT-15 | N | pass | `check:npm-package` and `check:cli-package` install from the tarballs and answer over stdio; `bin`, `files` and version (INV-9) match the listings in the gate logs |
| FEAT-16 | C | pass | `contracts.rs` has a test per flag and exit code from INV-9 (`manifests_that_agree_exit_zero`, `a_drifted_constraint_exits_one_and_names_both_sites`, `no_manifests_exits_zero`, `a_floating_pin_fails_only_under_fail_on_any`, `an_ecosystem_filter_narrows_the_walk`, `an_exclude_pattern_removes_a_manifest_from_the_comparison`, `the_workflow_directory_is_walked_but_other_hidden_directories_are_not`, `several_roots_are_analysed_together`, `a_named_manifest_is_the_whole_walk`, `an_unreadable_input_exits_two`, `an_unknown_flag_exits_two_and_names_itself`, `an_unknown_ecosystem_exits_two_rather_than_widening_the_walk`, `version_and_help_exit_clear`; `--no-ignore` in `platform.rs`). Over this repository: 17 manifests, 130 constraints, 9 findings, 14 refusals, exit 1, and the npm command line's stdout byte-identical |
| FEAT-17 | all | finding | INV-10 matched row by row. Two claims had nothing behind them: "VS Code 1.101+ needs nothing installed" (the registration, `versions-le-features-3`) and "Twelve languages, both halves covered" (no test read a translated string from a host, `versions-le-translations-2`). Every other row names its test or run |
| FEAT-18 | all | finding | `versions-le-features-4`: `envelope.ts` exported `capped`, `readString` and `isOk` with no caller in `src/`. Settings all consumed (INV-2), commands all registered (INV-3), every bundle key called (`l10n.test.ts`), every `package.json` script invoked by CI, a hook or the README's hand-run instructions |
| FEAT-19 | E | finding | `vitest.config.ts` keys on `thresholds`; include and exclude drop only tests, mocks, fixtures, `i18n/` and `types.ts`. `tsconfig.json` includes `src/**/*` (tests type-checked) and not `scripts/`, which is how a parity-script regression slipped past `typecheck` in a sibling during the sweep; recorded, not changed here. `versions-le-features-1`: the README's Testing section was stale at baseline and is regenerated |
| FEAT-20 | E | n/a | No skipped test (BASE-8) |
| FEAT-21 | all | pass, two driven | `coverage:readme:check` refused the stale section at baseline (exit 1), as its paragraph says it does; `check:cli-pipes` refused the crate's old framing against the new npm reader during the pass (exit 1, naming the frame and both answers). The other gates were read against their descriptions in INV-1 |
| FEAT-22 | all | finding | `versions-le-features-2`: three status bar tests titled for behaviour asserted nothing. "names a manifest that does not parse, and one that is not text" was driven by hand: `a = ` is refused by the TOML port and `ff fe` by the decoder, so both paths are taken |
| FEAT-23 | all | pass | The `policy` job greps `*.md` for three sentences; the same grep over every file type in the repository hits only the workflow that defines it |

## Step 3: Bugs

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | Empty, whitespace, one character and one element for every manifest kind through both `compare_versions` servers (`probe/bug15.ts`): defined and identical; `files: []` refused by name; the parsers' own tables (`toml-cases.json`, `manifest-cases.json`) |
| BUG-2 | E M C | pass | Every hit of the grep read against its domain in INV-1: booleans, `??` on optionals, `\|\| '0'` on a stripped fraction (Rust prints `.0`), `XDG_CONFIG_HOME \|\| join(homedir(), '.config')` where the empty variable falls to the default as the `ignore` crate's does. No `0`, `''` or `false` is a valid value at any of them |
| BUG-3 | E C | pass | `compare.ts` labels by slicing the URI path after the root with its trailing slash removed, driven with a picked folder and a workspace root; the parsers are transcriptions held by the crate's tables; `grammar.ts` bounds carry an inclusive flag, tested in `libraries.test.ts` |
| BUG-4 | E M C | finding | `versions-le-bugs-1`: a byte order mark in a manifest on disk was kept by the extension's decoder and stripped by the CLI's read. CRLF, no trailing newline, a lone CR, tabs, astral and combining characters through both servers: identical (`probe/bug15.ts`) |
| BUG-5 | all | pass | Every sort in `src/` uses `compareStrings` or a numeric key; the bare `sort()` calls are in `scripts/`, over ASCII paths |
| BUG-6 | E | pass | Module-level patterns with `g` (`errors.ts`) are used through `replace`, which resets `lastIndex`; the patterns that run over user text (redaction, `text.ts` whitespace classes, `parser.ts` line splits) are anchored or single-class and linear. None scans from every start position to the end of a stretch, so none was timed |
| BUG-7 | all | pass | Numbers are read by the transcriptions and held by their tables; `1e400`, `-0`, `1.5e308`, u64 max and max+1, a 50,000-zero patch and a 400-segment prerelease through both servers, identical. `readMaxResults` refuses non-integers and clamps |
| BUG-8 | E C | finding | `versions-le-bugs-3`: the exclude patterns were spliced into one brace group, so a comma inside one became the group's separator, driven in a real host. Pass elsewhere: a root with a trailing slash, a root at `/`, URI paths on Windows (POSIX form), five path shapes through both servers identical |
| BUG-9 | E M C | pass | Every cast read: `(error as Error).message` in `cli/scan.ts` sits on an `Error` that `discover.read` constructs; the `as Record` casts in `transport.ts` and `cli/mcp.ts` precede `only()`, which refuses a non-object (`arguments: null` driven on all three servers); `policy.ts` casts after `typeof` and reads each field by type |
| BUG-10 | E | pass | Seven names defined twice, each pair read: `descend` (TOML table, directory), `site` (built, rendered), `parse` (manifest, flags), `unquote` (YAML scalar, gitignore pattern), `compareVersions` (version order, the tool handler), `serve` (the two servers), `verdict` (ignore rule, summary line). Different meanings in different modules, every call site unambiguous |
| BUG-11 | E M | finding | `versions-le-errors-1`: `formatReport` returned before the diagnostics section whenever no manifest was counted, so the "Could not be read" branch was unreachable for the run that needs it. `versions-le-features-4`: three exported functions with no caller |
| BUG-12 | E | pass | Every table and default is frozen (24 `Object.freeze` sites); no path mutates a parameter or a configuration object |
| BUG-13 | E C | finding | "No manifests found." when two were found and neither could be read (`versions-le-errors-1`), and the CLI's "no manifests found" verdict after naming the two it could not read (`versions-le-errors-7`). The help page's claims are held to the engine by "opens the help, which names every finding and every refusal" |
| BUG-14 | all | n/a | No sensitive value is previewed; `errors.ts` redacts paths and credential-shaped fragments |
| BUG-15 | M C | finding | `versions-le-bugs-2`: 50 inputs the corpus never produces through both servers, 2 differed, one cause: a TOML document nested past 80 arrays or inline tables was read by the port and refused by the crate; a dotted key of 81 segments, found by hand after it, the same. Agreement on the other 48, a 2,000-deep JSON document (both refuse at 128, no overflow) and a 5,000-deep TOML array included |
| BUG-16 | C | pass | No `as` cast in `crate/src` outside tests; serde_json caps recursion at 128 and toml_parser at 80; the fuzz suite ran 60 s and the budget suite's three ceilings were read; no indexing on input offsets outside the `ignore` and `globset` crates |
| BUG-17 | all | pass | Each invariant in `AGENTS.md` and `crate/AGENTS.md` names its test; the ones this pass added name theirs |
| BUG-18 | E M C | pass | `ECOSYSTEM_OF[kind]` is keyed by a `Kind` union, `STRERROR`, `GLIBC` and `WINDOWS` by an errno name the OS supplies; dependency names, sections and tool names are `Map` keys. Driven: `__proto__`, `constructor`, `toString` and `hasOwnProperty` as dependencies, sections, tools and an action owner through both servers: identical and correct |
| BUG-19 | all | pass | `manifestKind` matches exact basenames and `.github/workflows/*.yml\|yaml`; `x/.github/workflows/a.yaml` and `.github/workflows/sub/b.yml` read, `github/workflows/c.yml` refused by name, on both servers |
| BUG-20 | E | n/a | No command writes a document back |
| BUG-21 | M C | finding | The documents found under BUG-15 are pinned in `toml-cases.json` in their direction, both sides refusing, with the crate's own display read back from toml 1.1.6. Fixed with `versions-le-bugs-2` |

## Step 4: Errors

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | finding | Every `catch` in INV-7 classified. Two were findings: `compare.ts` labelled every read failure as a decode failure (`versions-le-errors-2`); `output.ts`'s two arms had never run (`versions-le-errors-3`). The rest name their cause or rethrow |
| ERR-2 | E C | finding | `versions-le-errors-1` on the extension and `versions-le-errors-7` on the CLI's verdict line. The CLI's exit code stays 0 unless `--strict`, as SPEC and the usage text state; `versions_le_check` answers `ok: false` |
| ERR-3 | M | pass | Driven on all three servers: `{`, cut-off TOML and a BOM-led `package.json` return `ok: false` and one `parse-error` diagnostic naming the file ("not valid JSON", "not valid TOML"); a cut-off `go.mod` reads what is there |
| ERR-4 | E | finding | `versions-le-errors-2`: "not readable as UTF-8 text" for a file nobody decoded; now "could not be read (NoPermissions)" and, for a file that was read, "not UTF-8 text", the CLI's words |
| ERR-5 | E | finding | `versions-le-errors-3`: the flash and the problems toast followed a `showTextDocument` that had failed. `openExternal`'s result is read ("still owes the second ask when the browser did not open"), `clipboard.writeText` is in a `try` with a warning, `executeCommand` awaited |
| ERR-6 | E M | pass | `void recordSuccess()` catches inside; `void respond().then(write)` cannot reject; `serve().then(exit)` in `cli/main.ts` runs a loop whose every arm catches |
| ERR-7 | E | pass | Three commands, each through `guarded()`; `guard.test.ts` "hands registerCommand a guarded handler at every site" reads the sources |
| ERR-8 | E N | pass | One `as Error` in `src/`, on a value `discover.read` constructs as an `Error`; elsewhere `error instanceof Error ? error.message : String(error)`; `guard.test.ts` "reports a thrown value that is not an Error without printing undefined" |
| ERR-9 | E | pass | No `console.*`; unreadable files are counted in the report and, after `versions-le-errors-1`, in the toast when nothing else was read |
| ERR-10 | E | pass | The notifier is the single channel; the one direct `showInformationMessage` is the rating prompt awaiting a choice |
| ERR-11 | E | n/a | No quick pick, input box or dialog beyond the rating toast, whose dismissal is tested ("settles on Don't Ask Again without opening anything") |
| ERR-12 | E | finding | The mock could fail neither `openTextDocument`, `clipboard.writeText` nor one listed file's `readFile`; it has `_setOpenDocumentError`, `_setClipboardError` and `_setReadFileError` now (`versions-le-errors-3`, `-2`). `openExternal` returning false and a memento failure were hooks already (`ratingPrompt.test.ts`) |
| ERR-13 | all | pass | Tests pinning the old behaviour were updated in the fixing commits: "names a manifest that does not parse, and one that is not text" (the wording), `frames.test.ts` (the drops), `mcp.test.ts` (the echo). `hazards.rs` pins the basename-only `file` field (`versions-le-errors-6`, raised) |
| ERR-14 | M | finding | `versions-le-errors-4` and `-5`: 24 frames against the three servers, 15 answered differently by the extension's server and the other two at baseline, 0 at close. An unknown tool and arguments that do not fit the schema are `-32602` and `isError` respectively, held in `mcp.test.ts`'s "protocol" and "compare_versions: arguments" tables. Nothing on stdout but protocol lines |
| ERR-15 | C | pass | Every `expect`, `unwrap` and `panic!` in non-test code serialises the crate's own values (INV-7); exit codes flow through `ExitCode`; `every_malformed_question_exits_two_and_leaves_stdout_empty` |
| ERR-16 | N M C | finding, raised | `hazards.rs` covers permission denied, a FIFO under a time limit, a symlink loop, a long path and a workspace outside the root, and an unreadable file is named with the OS error. `versions-le-errors-6`: the diagnostic's `file` field carries the basename alone while its message carries the full path, on the crate and the npm command line, pinned by `a_permission_denied_manifest_is_named_and_only_strict_makes_it_fatal`; raised, not patched |
| ERR-17 | N E | pass | Three `\|\| true` and `2>/dev/null` sites read: a `grep` whose empty result is then tested, a `rev-parse` whose empty result refuses the tag, an `ls` count that must be one. Every `spawnSync` in `scripts/` checks `status` |
| ERR-18 | E | n/a | No progress indicator or busy flag; the flash follows the result |
| ERR-19 | M | finding | `versions-le-errors-4` and `-5`: each listed frame, a BOM-led one, an `initialize` with another version and `notifications/initialized` with an id are now answered or ignored the same way by all three servers, in the same words, with the process there for the request after it |

## Step 5: Memory leaks

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | INV-5: every disposable is pushed to `context.subscriptions` where it is created; nothing is created per command |
| LEAK-2 | E M | pass | One `onDidChangeConfiguration` listener, kept and disposed; one `input.on('data')` per `serve`; no process listeners |
| LEAK-3 | E M | finding | `versions-le-leaks-1`: the flash timer could be set after dispose. Otherwise cleared when rescheduled and on dispose |
| LEAK-4 | E | pass | The output channel is created lazily and disposed by `telemetry.dispose()`, registered up front (`lifecycle.test.ts` "telemetry channel") |
| LEAK-5 | E | finding | `versions-le-leaks-2`: no test disposed anything twice; "dispose is complete and safe to repeat" |
| LEAK-6 | E | finding | `versions-le-leaks-2`: `deactivate` had never run and the mock tracked no disposal; "deactivation leaves nothing behind" |
| LEAK-7 | all | pass | No mutable module-level state outside the crate test helper's counter (INV-5); every table frozen |
| LEAK-8 | E | pass | No closure keeps a report or a document after the command returns; the rating state is counters |
| LEAK-9 | E | n/a | The extension spawns nothing; the host spawns the MCP server and owns it |
| LEAK-10 | E | finding | `versions-le-leaks-2`: "repeated runs do not grow", fifty compares and fifty help commands |
| LEAK-11 | M C N | finding | `versions-le-leaks-3`: the crate's loop and `cli/frames.ts` had no maximum; the extension's server had 16 MiB with the complete-line check from the fleet sweep. Driven one byte over with the newline in the chunk, far over with it many chunks later, and exactly at the limit, on all three. Nothing accumulates per request |
| LEAK-12 | M C N | finding | `versions-le-leaks-4`: the repo had no driver. `scripts/check-mcp-memory.js`, `bun run check:mcp-memory`: the extension's server 90 MB flat from call 500 to 3,000 and 93 MB flat from 1,500 to 9,000; the crate 4 MB flat and the npm command line 116 MB flat over 3,000 calls, one in flight at a time. Writing every request up front read 849 to 966 MB instead: replies the reader had not drained, sitting in the write queue |
| LEAK-13 | M | pass | Driven on all three: stdin closed with nothing, mid-frame, destroyed mid-frame, and after a request without newline, each exit 0 with no output |
| LEAK-14 | C | pass | `a_fifty_megabyte_manifest_completes`; the budget suite's three ceilings run and read; files read whole and dropped |
| LEAK-15 | C | pass | `a_symlink_loop_does_not_make_the_walk_infinite`, `a_workspace_pointing_outside_the_root_stays_outside_it` |
| LEAK-16 | C | pass | `std::fs::read` only; no temporary files; no threads |
| LEAK-17 | tests | pass | Every suite resets the mock in `beforeEach`; fake timers restored in `finally` or `afterEach`; three runs and a shuffled run identical |

## Step 6: Race conditions

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | pass | INV-6: roots and configuration read once; a folder removed mid-run is still the question asked; a file gone between the listing and the read is named |
| RACE-2 | E | n/a | No edit is written back |
| RACE-3 | E | finding | `versions-le-races-1`: no such test; `races.test.ts` starts each command twice at once |
| RACE-4 | E | pass | The one shared mutable value is the flash timer, written by `flash` and `dispose` with no `await` between a read and the write |
| RACE-5 | E | pass | `ratingPrompt.ts` writes the memento before awaiting the toast ("records the ask before the toast is answered") |
| RACE-6 | E | n/a | No cancellation token or progress |
| RACE-7 | E | pass | `compareWorkspace` reads its configuration once; `flash` re-reads `statusBar.enabled` on purpose and the notifier its level per message; no command spends a key |
| RACE-8 | E | finding | `versions-le-leaks-1`: the flash after dispose |
| RACE-9 | E | pass | `activate` is synchronous; the status bar's command id is bound before the registration that follows in the same tick |
| RACE-10 | E C | pass | Documents sorted by label, findings and refusals by the engine's comparators; `stdout_is_one_report_with_no_timestamp_and_is_byte_stable` |
| RACE-11 | E C | finding | `versions-le-errors-2` on the extension; the crate names the OS error |
| RACE-12 | M | pass | Driven on the three built servers: one `tools/list` split at every one of its 46 byte offsets, 46 of 46 parsed exactly once on each; a `tools/call` split inside a four-byte character, the dependency name intact on each. `mcp.test.ts` holds a split and two-in-one-chunk; the crate's tests drive 8 KiB chunks |
| RACE-13 | M | pass | Twenty `tools/call` before any reply, on each server: twenty replies, each with its own id and its own manifest |
| RACE-14 | M | pass | stdin closed mid-request on each server: exit 0, no partial frame |
| RACE-15 | C | pass | The grep finds one `AtomicUsize` in the test helper and nothing else |
| RACE-16 | C | pass | `platform.rs` run; `TZ=UTC` and `TZ` unset compared identical (gate table) |
| RACE-17 | tests | pass | Three runs and a shuffled run (seed 1792869435722) green at 334 tests. Real timers in tests: two 20 ms settles and a 300 ms one in the fleet-shared `cli/output.test.ts`, each waiting for promises rather than asserting a duration |

## Step 7: Translations

Every value in every catalogue was read: 24 runtime keys and 18 manifest keys in 12 locales, 504 values.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | `diff` of the `%key%` placeholders and `package.nls.json` keys: equal, 18 |
| L10N-2 | E | pass | No DRIFT line for 12 manifest and 12 runtime catalogues |
| L10N-3 | E | pass | `de es fr id it ja ko pt-br ru uk vi zh-cn` in both mechanisms; `check:locales ../` green |
| L10N-4 | E | finding | 24 call sites read, four wrapping across lines; the sets were equal, with no test holding them: `versions-le-translations-1` (`l10n.test.ts`) |
| L10N-5 | E | finding | INV-8 classified: every notification, flash text, tooltip, heading and the rating prompt goes through `l10n.t()` or a manifest key. Never-translate: the codicon text `$(versions) Versions-LE`, the output channel name, finding codes and ecosystem names, the engine's finding and diagnostic messages (documented as the CLI's English), MCP and CLI text, the help document's body (carried, as in the earlier passes). The mechanical half had no unit test: `versions-le-translations-1` |
| L10N-6 | E | pass | No module-scope call (grep; `l10n.test.ts` "never calls l10n.t() at module scope") |
| L10N-7 | E | pass | No template or variable inside `l10n.t()` (grep; the test) |
| L10N-8 | E | pass | VSIX listing: 13 `package.nls*.json`, 12 bundles; `clean:i18n` left no copy in the tree |
| L10N-9 | E | finding | `versions-le-translations-2`: no host ran in another language. `test/locale/german-host.test.ts` reads "Versions-LE-Bericht", "Fehler (1)" and "Manifestdateien" from a report written under `--locale=de`, 2 passing. The manifest half is still unshown: the host does not localize a development-path extension's manifest |
| L10N-10 | E | pass | Placeholder sets equal in every bundle (jq) |
| L10N-11 | E | pass | Runtime: no value identical to English. Manifest: `manifest.command.category` is `Versions-LE` in all twelve, the product name |
| L10N-12 | E | pass | `Versions-LE`, `node_modules`, `.git`, `vendor` and `{0}` to `{5}` intact in every locale |
| L10N-13 | E | finding, with notes | Each of the 504 values fits its place; the count placeholders carry counts and the label placeholders labels in every locale, including the Japanese and Chinese summary lines that reorder `{0}` and `{1}`. The read found `versions-le-translations-3` (zh-cn punctuation, recorded under L10N-14 and L10N-16). Two notes, not findings: all twelve locales render `manifest.settings.show.positions.desc`, "Show the line each constraint is written on", as "the line of each result", an older and vaguer wording of the source that still fits the report; `it` renders the `Info` heading as "Informazioni utili" |
| L10N-14 | E | finding | `versions-le-translations-3`: three zh-cn values joined Chinese clauses with ASCII commas and colons where the rest of both zh-cn catalogues use the fullwidth marks. Every other value is in its own language and script; `check:locales` green |
| L10N-15 | E | pass | `(s)` plurals follow each locale's convention: `Befund(e)`, `hallazgo(s)`, `rilievo/i`, Russian and Ukrainian as `находок: {0}`, East Asian without a plural form; read at 0, 1 and many |
| L10N-16 | E | finding | The zh-cn punctuation (`versions-le-translations-3`). Terms agree across the two mechanisms within each locale (`Manifest`, `Bericht`, `Versionen vergleichen`) |
| L10N-17 | E | pass | No label compared to an English literal; the rating prompt compares against bound constants |
| L10N-18 | E M C | pass | The report and its clipboard copy are localized in their headings by design (README, Languages), with the engine's messages in English; MCP and CLI output are never localized |
| L10N-19 | C M | pass | No `l10n` or locale code in `crate/src`, `src/cli` or `src/mcp`; the crate, both command lines and both servers write English |

## Findings

Every fix is one commit on `fix/fleet-pass`, named by its finding id in the commit body. "Failed without fix" is the test's output with the fix absent, taken before the fix was written, or the probe's output before it; the logs are in the pass's scratch `fail/` directory and the decisive line is quoted. A test-gap has no fix to stash: the new test is the deliverable and passes against the code as it was.

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| versions-le-features-1 | broken-features | The README's generated Testing section said 328 cases across 19 files; the suite had 334 across 20 at baseline, a sweep test having landed without a regeneration | `bun run coverage:readme:check` exit 1 at baseline | `5a4bf0d` | `coverage:readme:check` green at close (379 across 24) | `coverage:readme:check` exit 1 |
| versions-le-features-2 | broken-features | Three status bar tests created the item, fired a setting change or advanced a fake clock, and asserted nothing | Read; the mock did not record status bar items | `f50ec46` | `ui.test.ts` five status bar tests reading text, visibility and the timer count | test-gap |
| versions-le-features-3 | broken-features | The MCP provider's registration branch ran in no unit test: the mock had no `vscode.lm` | Coverage: `provider.ts` 37.5% lines | `e36af37` | `mcp/provider.test.ts` two tests, with and without the API | test-gap |
| versions-le-features-4 | broken-features | `envelope.ts` exported `capped`, `readString` and `isOk` with no caller in `src/` | grep | `539cd18` | `tsc`, the suite | not a test: dead exports removed |
| versions-le-features-5 | broken-features | `openResultsSideBySide` had no consumer test at either value; `copyToClipboardEnabled` none when off | Read; `_shownDocumentOptions` was recorded and never read | `59be66f` | `commands.test.ts` "opens the report beside the editor, or in the active column when asked", "leaves the clipboard alone unless asked" | test-gap |
| versions-le-features-6 | broken-features | A non-folder command argument, an editor from a keybinding, had no test | Read `isUri` | `fe19e7c` | `commands.test.ts` "compares the workspace when the argument is not a folder" | test-gap |
| versions-le-bugs-1 | bugs | The extension decoded manifests with `ignoreBOM: true`, so a byte order mark reached the parser: a `package.json` was "not valid JSON", a `go.mod` lost its first line, a workflow its first key, where the CLI strips the mark | A BOM-led `package.json` and `go.mod` in the mock workspace | `d81b685` | `commands.test.ts` "reads a manifest written with a byte order mark as the CLI reads it" | `expected '# Versions-LE report\n\n2 manifest(s)…' to contain '2 manifest(s), 3 constraint(s)'` |
| versions-le-bugs-2 | bugs | `toml.ts` had no recursion limit; the toml crate refuses the 81st nested array or inline table and a dotted key with 80 segments before its last, so a document past either bound was read by the extension and the npm server and refused by the CLI | `probe/bug15.ts` "deep TOML inline", "deep TOML array": npm `ok: true`, crate `not valid TOML`; dotted keys by hand | `e578acd` | Ten documents in `toml-cases.json` at and past each bound, display read back from toml 1.1.6 (`cases.test.ts`) | 6 of the 10 failed: the port displayed what the crate refuses |
| versions-le-bugs-3 | bugs | The exclude patterns were spliced into one brace group with the vendored ones, so a comma inside a pattern became the group's separator: `**/a,b/**` left `a,b/Cargo.toml` in and took `b/Cargo.toml` out, in a real host | Integration test before the fix: the report listed `a,b/Cargo.toml` and `keep/Cargo.toml` | `76a0e24` | `commands.test.ts` and `test/integration/extension.test.ts` "honours an exclude pattern holding a comma or a brace group"; the mock's glob reader splits on a comma inside braces only | mock and host: `expected … to contain '- \`b/Cargo.toml\`'` |
| versions-le-errors-1 | errors | A run in which every manifest failed to read reported "No manifests found" in the toast and in the report, which returned before its diagnostics section | Two undecodable manifests in the mock workspace | `7381c89` | `format.test.ts` "lists the files it could not read when none could"; `commands.test.ts` "says every manifest could not be read, rather than that none was found"; a new runtime string in 13 bundles | `expected '# Versions-LE report\n\n0 manifest(s)…' to contain '## Could not be read (2)'` |
| versions-le-errors-2 | errors | One `catch` around the read and the decode reported "not readable as UTF-8 text" for a file that could not be read at all | `_setReadFileError` with code `NoPermissions` beside an undecodable file | `ec451e5` | `commands.test.ts` "names a file that could not be read apart from one that is not text" | `expected … to contain '- \`Cargo.toml\`: could not be read (No…'` |
| versions-le-errors-3 | errors | After the editor refused to open the report, the command still flashed the count and announced the problems; the mock could fail neither the open nor the clipboard | `_setOpenDocumentError`, `_setClipboardError` | `7c8bb46` | `commands.test.ts` "says the results could not open, and announces nothing else", "warns when the clipboard refuses, and the report is still open" | `expected [ [ 'error', … ], … ] to deeply equal [ [ 'error', 'Could not open results' ] ]`, the second entry being the problems toast |
| versions-le-errors-4 | errors | The crate's server and `versions-le mcp` on npm dropped a line that was not JSON, a request without a method, an array and a number without a word, answered a request lacking `jsonrpc` or carrying `1.0`, answered a null id, read a last line with no newline as a frame, and worded their refusals their own way; the extension's server did each differently | `probe/protocol.js`, 24 frames, 15 answered differently at baseline | `45f5996` | `mcp/mod.rs` seven loop tests driven in 8 KiB chunks and the words test; `frames.test.ts` seven tests; `check:cli-pipes` 18 frames | "not JSON then ping": ext `{"error":{"code":-32700,"message":"Invalid JSON"}…}` then the ping; crate and npmcli the ping alone. The new `frames` tests: `frames is not a function` |
| versions-le-errors-5 | errors | The extension's server echoed the client's protocol version, advertised `listChanged`, answered `initialize` with a null id, ignored `notifications/initialized` with an id, and read a BOM-led frame that the crate refuses | `probe/protocol.js` "BOM-led request then ping" and `mcp.test.ts` | `506a9b4` | `mcp.test.ts` "answers with its own protocol version, as the crate's server does", "does not reply to a notification, a null id included", "refuses notifications/initialized sent with an id…", "refuses a frame led by a byte order mark as not JSON…" | `expected '2024-11-05' to be '2025-06-18'`; the BOM-led ping answered |
| versions-le-errors-6 | errors | The crate's and the npm command line's `unreadable` diagnostic carries the basename alone in `file` while the message carries the full path, pinned by `hazards.rs` | `versions-le <tree>` with two unreadable manifests: `"file":"package.json"` and the path in `message` | carried | | raised: a deliberate shape with a test behind it; the owner decides |
| versions-le-errors-7 | errors | The CLI's last line said "no manifests found" after naming the manifests it could not read, on the crate and on npm | Two undecodable manifests under one root | `f305cc1` | `cli.rs` `the_verdict_tells_nothing_found_from_nothing_readable`; `check:cli-parity` | `left: "no manifests found", right: "no manifests could be read"` |
| versions-le-leaks-1 | memory-leaks | A status bar flash after dispose wrote to the disposed item and set a two-second timer that outlived the extension | Dispose every subscription, flash | `e27eabd` | `lifecycle.test.ts` "a flash after dispose schedules nothing" | `expected 1 to be +0` |
| versions-le-leaks-2 | memory-leaks | Nothing disposed an owner twice, deactivated after the commands had run, or ran a command fifty times; the mock tracked no disposal | Read; `deactivate` at 50% function coverage | `7c68e43` | `lifecycle.test.ts` four tests; the mock's `_live()`, `_outputChannels()`, `_statusBarItems()` | test-gap |
| versions-le-leaks-3 | memory-leaks | The crate's loop and `cli/frames.ts` held a frame whole until its newline with no ceiling | `probe/protocol.js` "oversized frame then ping": the 17 MiB frame held and answered on both | `49c74c5` | `mcp/mod.rs` two cap tests; `frames.test.ts` two cap tests; `check:cli-pipes` | ext the frame refusal then the ping; crate and npmcli the ping with id 1 answered |
| versions-le-leaks-4 | memory-leaks | No driver sampled the server's memory over a session | | `9b95453` | `scripts/check-mcp-memory.js`, `bun run check:mcp-memory`: 90 MB flat over 3,000 calls, 93 MB over 9,000 | test-gap; the crate 4 MB and the npm command line 116 MB flat by hand |
| versions-le-races-1 | race-conditions | No test started a command while another run of it was suspended | | `8175ee3` | `races.test.ts` three tests | test-gap |
| versions-le-translations-1 | translations | Nothing held the strings passed to `l10n.t()` to the bundle, or refused a literal handed to a notification, flash, prompt or dialog | | `ac7f107` | `src/l10n.test.ts` seven tests | test-gap |
| versions-le-translations-2 | translations | No test launched the host in another language, so nothing showed the runtime bundle loads | | `b93be83` | `test/locale/german-host.test.ts` under the `german host` launch: 2 passing | test-gap |
| versions-le-translations-3 | translations | Three zh-cn values joined Chinese clauses with ASCII commas and colons, against the rest of both zh-cn catalogues | The catalogue read | `2099700` | The corrected catalogues; `check:locales` green | not a test: catalogue values |

Twenty-four findings: twenty-three fixed, one carried. Beyond them, `1ca73fd` records the invariants in `AGENTS.md`, `59f8851` formats two tests the pass added as biome prints them, and the crate's `AGENTS.md` and both `CHANGELOG.md` files gained their entries in the fixing commits.

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| versions-le-errors-6 | The `unreadable` diagnostic's `file` field carries the basename alone on the crate and the npm command line, while the message carries the full path; `hazards.rs` pins the basename | A decision: label it as every other diagnostic labels its manifest, root-relative, and update the test, or state why the basename is the contract |
| L10N-5 | The help document's body is English in every locale | A product decision: translate the page or state that it is English, as in the earlier passes |
| L10N-9 | The manifest half, the command titles, is shown by no test: the host does not localize the manifest of an extension loaded from a development path | A `--locale=de` run of the installed-VSIX test that reads a command title |
| FEAT-4, FEAT-9 | The menu entry and the six activation events were read, not driven | A real display, or a host test opening one workspace per glob |
| FEAT-19 | `tsconfig.json` does not type-check `scripts/`, which is how a parity-script regression slipped past a sibling's `typecheck` during the sweep | A fleet decision: add `scripts/` to the type-checked set in every repo, as one change |
| BASE-5 | `cargo audit` not run locally; CI's `audit` job runs it on the pull request | Install `cargo-audit`, or leave it to CI |
| CLOSE-5 | `check:doc-paths ../` is red on three `fixtures/*.json` paths named by `cron-le/crate/AGENTS.md` and `CLAUDE.md`, a repo this pass did not touch; `check:registry` says `lib/tool-facts.generated.ts` is out of date. Both are red on `main` before this change | `sync:registry` and the cron-le docs, each as its own change |
| LEAK-12 | With every request written up front the extension's server reads 849 to 966 MB resident: undrained replies in its write queue, since `transport.ts` ignores `write()`'s return. One call in flight reads 90 MB flat | A decision whether the server should honour backpressure; no client holds thousands of replies unread |

Observations that are not findings: the mock's glob reader treated a comma as a separator everywhere until this pass, which happened to match the defect in the host and now matches the host's correct reading; the differential's generator produces no BOM, no deep nesting and no long dotted key, so the two parity gaps this pass found lived outside it; `cargo build` reported the debug binary fresh after `mod.rs` changed, and `check:cli-pipes` drove the stale binary until `cargo clean -p versions-le`, which CLOSE-4 already prescribes; the `it` runtime catalogue renders the `Info` heading as "Informazioni utili" and all twelve locales render the `showPositions` description with "result" where the source now says "constraint".

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | Every check in every step has an answer above; no `not done`, no `unknown` |
| CLOSE-2 | pass | Twenty-three findings fixed with commit and test named; one carried (`versions-le-errors-6`) with the decision needed |
| CLOSE-3 | pass | Each fix's "Failed without fix" column quotes the run; the logs are in the pass's scratch `fail/` directory. Test-gaps are marked as such |
| CLOSE-4 | pass | Every BASE-4 gate run again on `59f8851` (`gates.sh final`): every gate green at baseline is green, `coverage:readme:check` went from red to green, `cargo audit` still not installed here. The first final run, on `5a4bf0d`, had `lint` red on two formatting diagnostics in tests this pass added; fixed, and the whole list run again. Before the crate binary was driven, `cargo clean -p versions-le` and a rebuild, after `cargo build` once reported a stale debug binary fresh |
| CLOSE-5 | pass, two pre-existing reds | From `letools-site` with the repos beside it: `check:fleet ../` green with `src/cli/frames.ts` and its test recorded as versions-le's own (this change); `check:locales ../` green; `check:doc-paths ../` red on three `fixtures/*.json` paths named by `cron-le`'s crate docs and `check:registry` red on a stale `lib/tool-facts.generated.ts`, both red on `main` before this change and neither touched by it |
| CLOSE-6 | pass | Every behaviour change has a line under `## [Unreleased]` in `CHANGELOG.md` or `crate/CHANGELOG.md`; eleven invariants added to `AGENTS.md` and two to `crate/AGENTS.md`, each naming its test; the README's Testing section regenerated by its script |
| CLOSE-7 | pass | `git log main..HEAD --format='%ae %s'`: 25 commits, one author address, `13629544+nolindnaidoo@users.noreply.github.com`; `bun run lint:commits` green. The diff holds the fixes, their tests, the catalogues, the docs and the memory driver; no probe, scratch file or unrelated change |
| CLOSE-8 | pass | [nolindnaidoo/versions-le#39](https://github.com/nolindnaidoo/versions-le/pull/39), body from the findings table, carried items listed, no attribution |
| CLOSE-9 | pass | 33 jobs green on the pull request, 2 skipped by design (`auto-merge`, the CodeQL summary): the three-OS `CI` legs, `test`, `cli-parity`, `hazards` and `platform` on ubuntu-24.04, macos-15 and windows-2025, `audit` (the gate not run here), `fuzz`, `budget`, `scenarios`, `differential`, `coverage`, `coverage-matrix`, `msrv`, `parity`, `policy`, the two versions jobs, the commit-message and CodeQL analyses. No job was red. Squash-merged as `b1048d2` |
| CLOSE-10 | pass | Ledger row written in this change |
| CLOSE-11 | pass | Five checks sharpened: BUG-8 (a list of patterns handed to one call as a brace group), BUG-15 (a key or path longer than the reference parser follows), ERR-19 (a BOM-led frame, `initialize` asking another version, `notifications/initialized` with an id), L10N-14 (the locale's own punctuation), LEAK-12 (one call in flight). The hunt table: FEAT-22, BUG-21, ERR-19 and LEAK-3 join; FEAT-12, BUG-2, BUG-5, BUG-7, BUG-18, ERR-7, ERR-17, LEAK-7 and RACE-1 leave, having passed here |
