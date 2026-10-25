# Fleet pass record: envsync-le

The fourth repo in the navigation's order and the second pass under the
read-once procedure: step 1 read every file on the manifest once with the
checks of steps 2 to 7 beside it, and the steps below answer from that read,
the tables and the runs.

| | |
|---|---|
| Repo | envsync-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `4d95f569aff9604f48bf777f01d7006a5fa7a0ab` |
| Started | 2026-10-25 |
| Pull request | [nolindnaidoo/envsync-le#57](https://github.com/nolindnaidoo/envsync-le/pull/57) |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-cli,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; after `git fetch`, `git status -sb` → `## main...origin/main` |
| BASE-2 | pass | `git config user.email` → `13629544+nolindnaidoo@users.noreply.github.com` inside the repo |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from main at `4d95f569` |
| BASE-4 | pass | Gate list below, derived from the seven workflow files and `package.json` scripts |
| BASE-5 | see table | One script (`gates.sh baseline`) ran every command unpiped, each to its own log, and recorded the exit code |
| BASE-6 | see findings | One red gate at baseline: `coverage:readme:check` (`envsync-le-features-2`) |
| BASE-7 | recorded | Per-file coverage below |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. Four surfaces: `E` extension,
`M` the MCP server bundled in the extension and shipped on npm, `N` the npm
packages (`envsync-le-mcp` and the command line `envsync-le`), `C` the crate.
The crate chain runs inside `crate/` on the toolchain `rust-toolchain.toml`
pins, 1.98.1. Before the final run the crate's artefacts were cleaned
(`cargo clean -p envsync-le`) and rebuilt, after a stale debug binary had
answered one probe for the old code mid-pass.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | Red once mid-pass on five files the pass's own fixes left outside biome's shape (`70552d0`); read through a pipe that hid the exit code, the same mistake the last pass made |
| `E` | `bun run typecheck` | exit 0 | exit 0 | Covers `src/` and `vitest.config.ts`; `scripts/` is not type-checked (FEAT-19) |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | Baseline 23 files, 291 tests; statements 87.29, branches 81.31, functions 89.94, lines 88.63. Close 26 files, 338 tests; 88.76 statements |
| `E` | `bun run build` | exit 0 | exit 0 | |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | static scan and runtime load of `dist/extension.js` |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 | |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | 9 KB, one tool answered over stdio, the missing key named, no value in the answer |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `envsync-le-mcp@2.4.5` |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | installs from the tarball, answers over stdio as `envsync-le-mcp` |
| `E` | `bun run package` | exit 0 | exit 0 | `release/envsync-le-2.4.5.vsix`; `clean:i18n` left no copied catalogue |
| `E` | `bun run coverage:readme:check` | **exit 1** | exit 0 | README said 285 cases across 22 files, the run has 291 across 23. Hand-run gate, not in CI. `envsync-le-features-2` |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline; 18 conform at close |
| `E` | `python3 scripts/check-agent-files.py` | exit 0 | exit 0 | also run by `src/agent-files.test.ts` inside the unit suite |
| `E` | `bun run benchmark` | exit 0 | exit 0 | writes `benchmark-results.json`, which is git-ignored |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | ext = npm = `server.json` (both fields) = 2.4.5; mcpName `io.github.nolindnaidoo/envsync-le`; identifier `envsync-le-mcp` |
| `C` `N` | one-version job shell (`ci-crate.yml`) | exit 0 | exit 0 | `crate/Cargo.toml` = `cli/package.json` = 2.4.5 |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` | exit 0 | exit 0 | |
| `C` | `cargo build --locked` | exit 0 | exit 0 | |
| `C` | `RUSTUP_TOOLCHAIN=1.88 cargo check --locked` | exit 0 | exit 0 | msrv job |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 | |
| `C` | policy: no `std::fs` in `detect/` | exit 0 | exit 0 | |
| `C` | policy: no doc holding the surfaces equal | exit 0 | exit 0 | the one near-miss, `crate/README.md` "the extension, which is the reference implementation:", is about the parser, which is parity scope (FEAT-21, FEAT-23) |
| `C` | `cargo llvm-cov` + per-module 70% floor on `detect/` | exit 0 | exit 0 | `cargo-llvm-cov` is installed here |
| `C` `M` | `bun scripts/check-detection-parity.ts` | exit 0 | exit 0 | 8 corpus documents, 15 names, 7 comparisons (8 at close), every `mcp-compare-env-files.json` case under the extension; the crate runs the same corpus in `cargo test` |
| `C` `M` | `DIFFERENTIAL_SEED=20260812 DIFFERENTIAL_CASES=600 bun scripts/check-differential.ts` | exit 0 | exit 0 | 600 generated documents through both servers, byte-identical, no value in either answer |
| `C` `M` | `bun scripts/check-mcp-definition.ts` | exit 0 | exit 0 | |
| `N` | `bun run build:cli` | exit 0 | exit 0 | |
| `C` `N` | `bun run check:cli-parity` | exit 0 | exit 0 | 62 commands at baseline, 65 at close, and the MCP surface identical between the two `envsync-le` binaries |
| `C` `N` | `bun run check:cli-pipes` | exit 0 | exit 0 | 3 closed-pipe cases and 18 malformed frames alike |
| `N` | `bun run build:cli:prod` then `bun run check:cli-package` | exit 0 | exit 0 | `envsync-le@2.4.5` packed, installed, scanned, served |
| `C` | `cargo audit` | not run here | not run here | `cargo-audit` is not installed; CI's `audit` job |
| `C` | `ENVSYNC_LE_SCENARIOS=1 cargo test --test scenarios -- --test-threads=1` | exit 0 | exit 0 | 3 passed |
| `C` | `cargo test --test hazards` | exit 0 | exit 0 | |
| `C` | `cargo test --test platform` | exit 0 | exit 0 | |
| `C` | `TZ=UTC` and `TZ` unset, test names compared | exit 0 | exit 0 | identical |
| `C` | `ENVSYNC_LE_FUZZ_SECONDS=60 cargo test --test fuzz -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 60 s, CI's budget |
| `C` | `ENVSYNC_LE_BUDGET=1 cargo test --release --locked --test budget -- --test-threads=1 --nocapture` | exit 0 | exit 0 | |
| `C` | `cargo test --test coverage_matrix` | exit 0 | exit 0 | every corpus name opened and typed |
| `C` | `cargo package --list --allow-dirty` carries the corpus and no contributor file | exit 0 | exit 0 | release-crate preflight |
| `C` | `cargo publish --dry-run --locked` | exit 0 | exit 0 | release-crate preflight |
| `C` | crates.io version probe | not run here | not run here | release-only |
| `E` | `bun run test:integration` | exit 0 | exit 0 | Baseline 9 passing in a real host (VS Code stable 1.143.1). Close 10 passing: `test/integration/settings.test.ts` added |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | `INSTALLED-VSIX TEST: PASS (envsync-le-2.4.5.vsix)` |
| `E` `N` `C` | `vsce publish`, `ovsx publish`, `npm publish` (×2), `mcp-publisher`, `cargo publish` | not run here | not run here | publishing |
| `E` | `perf:readme`, `coverage:readme`, `readme` | not run here | not run here | generated-section writers; `coverage:readme` is run at close for `envsync-le-features-2` |
| `E` | `clean`, `clean:i18n`, `copy:i18n`, `build:prod`, `build:mcp`, `watch`, `test:watch`, `lint:fix`, `vscode:prepublish`, `hooks:install`, `prepare` | run via `package` or not gates | same | `vscode:prepublish`, `copy:i18n` and `clean:i18n` ran inside `package` |

BASE-7, from `coverage/coverage-summary.json` at baseline. Floors are 70 lines, 70 functions, 60 branches, 70 statements.

| File | Lines | Functions | Branches | Statements | Why |
|---|---|---|---|---|---|
| `src/cli/main.ts`, `src/cli/mcp.ts` | 0 | 0 | 0 | 0 | The npm command line's entry and its server loop are driven as a built binary by `check:cli-parity` and `check:cli-pipes`, never by a unit test |
| `src/mcp/info.ts`, `src/mcp/server.ts` | 0 | 100 | 0 | 0 | entry points, driven over stdio by `check:mcp-bundle` and `check:npm-package` |
| `src/mcp/provider.ts` | 37.5 | 33.3 | 50.0 | 37.5 | the registration branch ran in no unit test: the mock had no `vscode.lm` (`envsync-le-features-7`) |
| `src/cli/args.ts` | 78.8 | 37.5 | 94.4 | 80.6 | functions under the floor: the option tables' closures run only through the binary |
| `src/cli/ioError.ts` | 89.5 | 80.0 | 65.1 | 77.8 | the Windows arms |
| `src/cli/checkTool.ts` | 90.0 | 75.0 | 66.7 | 91.7 | |
| `src/adapters/vscodeTelemetry.ts` | 100 | 100 | 66.7 | 100 | |
| `src/adapters/vscodeWatcher.ts` | 89.1 | 100 | 66.7 | 86.0 | the two `console.error` arms, reachable only from a check that rejects, which `checkSync` never does |
| `src/commands/ignoreFile.ts` | 75.4 | 75.0 | 60.7 | 73.2 | the three catch arms and the picker branches |
| `src/commands/showIssues.ts` | 77.8 | 85.7 | 60.0 | 77.8 | the report's failure path: the mock could not refuse to open a document (`envsync-le-errors-5`) |

## Step 1: Inventory

Read manifest, from INV-1 (`git ls-files -- src test scripts mcp crate/src crate/tests package.json server.json | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/' | xargs wc -l`), 124 files, 19,660 lines at the baseline commit. Every file was read once, from its first line to its last, with the six later documents open beside it; the notes a later check needed were written into INV-5 to INV-8 as each file went by.

The filter removed, and a later step covers: `src/i18n/package.nls.*.json` (12, step 7), `src/detection/__fixtures__/{basic,tricky}.env` and `src/detection/__snapshots__/characterization.test.ts.snap` (read with `characterization.test.ts`), `src/assets/images/icon.png` (no surface). Tracked outside the roots and also read: `crate/fixtures/detection.json`, `mcp-compare-env-files.json` and the 8 corpus documents (with `corpus.rs`), `README.md`, `crate/README.md`, `cli/README.md`, `mcp/README.md` (INV-10), `CHANGELOG.md` and `crate/CHANGELOG.md` (heads), `crate/Cargo.toml`, `cli/package.json`, `.githooks/commit-msg`, `.vscodeignore`, `.gitignore`, `.github/codeql-config.yml`, `.cursorrules`, `tsconfig.json`, `tsconfig.it.json`, the seven workflows, `samples/.env*`, `l10n/*.json` and `package.nls.json` (step 7). `assets/demos/`, `.vscode/`, `.github/dependabot.yml`, the five other agent-instruction files (held to `.cursorrules` by `check-agent-files.py`), `.editorconfig`, `.gitattributes`, `biome.json`, `GEMINI.md` and `LICENSE` carry no surface.

| Read | Lines | File |
|---|---|---|
| [x] | 393 | `crate/src/cli.rs` |
| [x] | 507 | `crate/src/detect/compare.rs` |
| [x] | 160 | `crate/src/detect/corpus.rs` |
| [x] | 343 | `crate/src/detect/heuristics.rs` |
| [x] | 4 | `crate/src/detect/mod.rs` |
| [x] | 337 | `crate/src/detect/parser.rs` |
| [x] | 406 | `crate/src/discover.rs` |
| [x] | 12 | `crate/src/main.rs` |
| [x] | 319 | `crate/src/mcp/compare.rs` |
| [x] | 522 | `crate/src/mcp/mod.rs` |
| [x] | 310 | `crate/src/scan.rs` |
| [x] | 60 | `crate/src/testing.rs` |
| [x] | 189 | `crate/tests/budget.rs` |
| [x] | 365 | `crate/tests/contracts.rs` |
| [x] | 220 | `crate/tests/coverage_matrix.rs` |
| [x] | 485 | `crate/tests/fuzz.rs` |
| [x] | 598 | `crate/tests/hazards.rs` |
| [x] | 327 | `crate/tests/platform.rs` |
| [x] | 132 | `crate/tests/scenarios.rs` |
| [x] | 194 | `mcp/README.md` |
| [x] | 51 | `mcp/package.json` |
| [x] | 284 | `package.json` |
| [x] | 87 | `scripts/benchmark.ts` |
| [x] | 57 | `scripts/build-cli.js` |
| [x] | 38 | `scripts/build-mcp.js` |
| [x] | 98 | `scripts/build-npm.js` |
| [x] | 135 | `scripts/check-agent-files.py` |
| [x] | 103 | `scripts/check-bundle.js` |
| [x] | 103 | `scripts/check-cli-package.js` |
| [x] | 348 | `scripts/check-cli-parity.ts` |
| [x] | 186 | `scripts/check-cli-pipes.ts` |
| [x] | 250 | `scripts/check-detection-parity.ts` |
| [x] | 334 | `scripts/check-differential.ts` |
| [x] | 158 | `scripts/check-mcp-bundle.js` |
| [x] | 93 | `scripts/check-mcp-definition.ts` |
| [x] | 156 | `scripts/check-npm-package.js` |
| [x] | 182 | `scripts/commit-lint.js` |
| [x] | 181 | `scripts/coverage-readme.js` |
| [x] | 214 | `scripts/e2e-vsix.js` |
| [x] | 27 | `scripts/install-hooks.js` |
| [x] | 72 | `scripts/perf-readme.js` |
| [x] | 33 | `server.json` |
| [x] | 494 | `src/__mocks__/vscode.ts` |
| [x] | 388 | `src/adapters/adapters.test.ts` |
| [x] | 7 | `src/adapters/index.ts` |
| [x] | 43 | `src/adapters/vscodeCommand.ts` |
| [x] | 22 | `src/adapters/vscodeConfiguration.ts` |
| [x] | 61 | `src/adapters/vscodeFileSystem.ts` |
| [x] | 132 | `src/adapters/vscodeNotifier.ts` |
| [x] | 130 | `src/adapters/vscodeStatusBar.ts` |
| [x] | 39 | `src/adapters/vscodeTelemetry.ts` |
| [x] | 105 | `src/adapters/vscodeUserInterface.ts` |
| [x] | 187 | `src/adapters/vscodeWatcher.test.ts` |
| [x] | 110 | `src/adapters/vscodeWatcher.ts` |
| [x] | 62 | `src/agent-files.test.ts` |
| [x] | 110 | `src/cli/args.ts` |
| [x] | 90 | `src/cli/checkTool.ts` |
| [x] | 364 | `src/cli/cli.test.ts` |
| [x] | 338 | `src/cli/discover.ts` |
| [x] | 36 | `src/cli/frames.test.ts` |
| [x] | 58 | `src/cli/frames.ts` |
| [x] | 171 | `src/cli/ignoreRules.ts` |
| [x] | 144 | `src/cli/ioError.ts` |
| [x] | 34 | `src/cli/main.ts` |
| [x] | 142 | `src/cli/mcp.ts` |
| [x] | 138 | `src/cli/output.test.ts` |
| [x] | 77 | `src/cli/output.ts` |
| [x] | 86 | `src/cli/run.ts` |
| [x] | 194 | `src/cli/scan.ts` |
| [x] | 55 | `src/cli/usage.ts` |
| [x] | 331 | `src/commands/commands.test.ts` |
| [x] | 235 | `src/commands/compareSelected.ts` |
| [x] | 81 | `src/commands/guard.test.ts` |
| [x] | 30 | `src/commands/guard.ts` |
| [x] | 98 | `src/commands/help.ts` |
| [x] | 219 | `src/commands/ignoreFile.ts` |
| [x] | 33 | `src/commands/index.ts` |
| [x] | 130 | `src/commands/setTemplate.ts` |
| [x] | 197 | `src/commands/showIssues.ts` |
| [x] | 162 | `src/config/config.test.ts` |
| [x] | 148 | `src/config/config.ts` |
| [x] | 48 | `src/config/settings.test.ts` |
| [x] | 17 | `src/config/settings.ts` |
| [x] | 141 | `src/detection/characterization.test.ts` |
| [x] | 268 | `src/detection/comparator.test.ts` |
| [x] | 264 | `src/detection/comparator.ts` |
| [x] | 416 | `src/detection/detector.test.ts` |
| [x] | 291 | `src/detection/detector.ts` |
| [x] | 250 | `src/detection/discovery.ts` |
| [x] | 37 | `src/detection/glob.test.ts` |
| [x] | 134 | `src/detection/heuristics.test.ts` |
| [x] | 165 | `src/detection/heuristics.ts` |
| [x] | 120 | `src/detection/parser.test.ts` |
| [x] | 140 | `src/detection/parser.ts` |
| [x] | 275 | `src/extension.test.ts` |
| [x] | 94 | `src/extension.ts` |
| [x] | 10 | `src/interfaces/command.ts` |
| [x] | 11 | `src/interfaces/configuration.ts` |
| [x] | 42 | `src/interfaces/fileSystem.ts` |
| [x] | 11 | `src/interfaces/index.ts` |
| [x] | 6 | `src/interfaces/notifier.ts` |
| [x] | 6 | `src/interfaces/statusBar.ts` |
| [x] | 4 | `src/interfaces/telemetry.ts` |
| [x] | 62 | `src/interfaces/userInterface.ts` |
| [x] | 134 | `src/mcp/envelope.ts` |
| [x] | 13 | `src/mcp/info.ts` |
| [x] | 341 | `src/mcp/mcp.test.ts` |
| [x] | 55 | `src/mcp/provider.ts` |
| [x] | 107 | `src/mcp/readme.test.ts` |
| [x] | 13 | `src/mcp/server.ts` |
| [x] | 192 | `src/mcp/tools.ts` |
| [x] | 293 | `src/mcp/transport.ts` |
| [x] | 116 | `src/rating/policy.test.ts` |
| [x] | 84 | `src/rating/policy.ts` |
| [x] | 55 | `src/rating/wiring.test.ts` |
| [x] | 66 | `src/types.ts` |
| [x] | 317 | `src/ui/ratingPrompt.test.ts` |
| [x] | 179 | `src/ui/ratingPrompt.ts` |
| [x] | 32 | `src/utils/errors.test.ts` |
| [x] | 19 | `src/utils/errors.ts` |
| [x] | 84 | `test/integration/extension.test.ts` |
| [x] | 3 | `test/integration/fixtures/.env` |
| [x] | 2 | `test/integration/fixtures/.env.local` |
| [x] | 189 | `test/integration/l10n.test.ts` |

### INV-2. Manifest contributions

`jq '.contributes | keys'` → `commands`, `configuration`, `mcpServerDefinitionProviders`, `menus`. `activationEvents` → `workspaceContains:**/.env*`. `main` → `./dist/extension.js`. `l10n` → `./l10n`. `engines` → `vscode ^1.101.0`, `node >=20.0.0`. `capabilities`: virtual workspaces limited, untrusted workspaces unsupported, both with `%manifest.capability.*%` descriptions. No keybindings, no views, no languages.

Commands (9, every title a `%key%`, category `%manifest.command.category%`):

| Id | Title key |
|---|---|
| `envsync-le.openSettings` | `manifest.command.settings.title` |
| `envsync-le.showIssues` | `manifest.command.show-issues.title` |
| `envsync-le.compareSelected` | `manifest.command.compare-selected.title` |
| `envsync-le.setTemplate` | `manifest.command.set-template.title` |
| `envsync-le.clearTemplate` | `manifest.command.clear-template.title` |
| `envsync-le.ignoreFile` | `manifest.command.ignore-file.title` |
| `envsync-le.stopIgnoring` | `manifest.command.stop-ignoring.title` |
| `envsync-le.clearAllIgnored` | `manifest.command.clear-all-ignored.title` |
| `envsync-le.help` | `manifest.command.help.title` |

Menus: `explorer/context` → `compareSelected` and `ignoreFile`, both `when: resourceFilename =~ /^\.env\.|\.env$/`, groups `dotsync@1`, `dotsync@2`. `resourceFilename` exists at the 1.101 floor. The clause admits `.env`, `.env.x` and `x.env`: `\.env$` matches a bare `.env` as well as a name that ends in it. The record first read it as excluding a bare `.env`; that reading was wrong and is corrected here.

Configuration (12 properties under `envsync-le`):

| Property | Type | Default | Enum |
|---|---|---|---|
| `enabled` | boolean | `true` | |
| `watchPatterns` | string[] | `[".env*"]` | |
| `excludePatterns` | string[] | `[]` | |
| `notificationLevel` | string | `important` | `all`, `important`, `silent` |
| `statusBar.enabled` | boolean | `true` | |
| `debounceMs` | number, minimum 100 | `1000` | |
| `caseSensitive` | boolean | `true` | |
| `telemetryEnabled` | boolean | `false` | |
| `comparisonMode` | string | `auto` | `auto`, `manual`, `template` |
| `compareOnlyFiles` | string[] | `[]` | |
| `templateFile` | string | none declared | |
| `temporaryIgnore` | string[] | `[]` | |

MCP server definition providers: one, id `envsync-le`, label `%manifest.mcp.label%`.

### INV-3. Registrations

| Command | Registered at |
|---|---|
| `envsync-le.openSettings` | `config/settings.ts:9` through `adapters/vscodeCommand.ts:21` (guarded) |
| `envsync-le.showIssues` | `commands/showIssues.ts:25` |
| `envsync-le.compareSelected` | `commands/compareSelected.ts:24` |
| `envsync-le.setTemplate` | `commands/setTemplate.ts:25` |
| `envsync-le.clearTemplate` | `commands/setTemplate.ts:100` |
| `envsync-le.ignoreFile` | `commands/ignoreFile.ts:46` |
| `envsync-le.stopIgnoring` | `commands/ignoreFile.ts:120` |
| `envsync-le.clearAllIgnored` | `commands/ignoreFile.ts:166` |
| `envsync-le.help` | `commands/help.ts:14` |

`grep -rnE 'register[A-Za-z]*\(' src --exclude='*.test.ts'`: the nine `registerCommand` sites above, `registerAllCommands`, `registerOpenSettingsCommand`, `registerVSCodeWatchers`, `registerMcpProvider` → `vscode.lm.registerMcpServerDefinitionProvider('envsync-le', …)` (`mcp/provider.ts:30`), matching the manifest's provider id. Nothing registered that the manifest does not declare; nothing declared that is not registered.

### INV-4. Settings and their consumers

| Property | Read at | Consumers |
|---|---|---|
| `enabled` | `config.ts` `readConfig` | `detector.ts` `checkSync` returns the disabled report |
| `watchPatterns` | same | `discovery.ts` `discoverDotenvFiles` (one `findFiles` per pattern); `vscodeWatcher.ts` `createWatchers` (one watcher per pattern), rebuilt on change |
| `excludePatterns` | same | `discovery.ts` `shouldSkipFile`; `vscodeWatcher.ts` `handleEvent` |
| `notificationLevel` | same | `vscodeNotifier.ts` (every method), `detector.ts` `notifyUser`/`handleSyncCheckError`, `vscodeWatcher.ts` (console gating), `ui/ratingPrompt.ts` `promptsAllowed` (`inspect`) |
| `statusBar.enabled` | same | `vscodeStatusBar.ts` `render`, re-rendered on change |
| `debounceMs` | same | `vscodeWatcher.ts` `debouncedDetect` |
| `caseSensitive` | same | `detector.ts` `buildCompareOptions` → `comparator.ts` |
| `telemetryEnabled` | same | `vscodeTelemetry.ts` `event` |
| `comparisonMode` | same | `detector.ts` `buildCompareOptions` (template), `discovery.ts` `applyComparisonModeFilter` (manual) |
| `compareOnlyFiles` | same | `discovery.ts` `filterManualModeFiles` |
| `templateFile` | same | `detector.ts` `findTemplatePath`; written by `setTemplate.ts` |
| `temporaryIgnore` | same | `discovery.ts` `isTemporarilyIgnored`; read and written by `ignoreFile.ts` |

Every property has a consumer and every key read is declared. The adapter all of them read through, `adapters/vscodeConfiguration.ts`, held one `WorkspaceConfiguration` from activation (`envsync-le-features-1`).

### INV-5. Resources with a lifetime

| What | Created | Released |
|---|---|---|
| status bar item | `vscodeStatusBar.ts:21` `createStatusBarItem` | pushed to `context.subscriptions` (:25) and again by `statusBar.dispose()` (:55); idempotent in the host and now in the mock |
| `onDidChangeConfiguration` (statusBar.enabled) | `vscodeStatusBar.ts:48` | pushed |
| output channel, lazy | `vscodeTelemetry.ts:11` on the first event with telemetry on | `telemetry.dispose()` (`outputChannel?.dispose()`); telemetry pushed at `extension.ts:72` |
| `FileSystemWatcher` per watch pattern, three `onDid*` each | `vscodeWatcher.ts:67-73` | `disposeWatchers()` on a `watchPatterns` change and in the pushed disposable; the host drops a disposed watcher's listeners |
| debounce `setTimeout` | `vscodeWatcher.ts` `debouncedDetect` | cleared on reschedule and on dispose; the callback checks `disposed` |
| `onDidChangeConfiguration` (watchPatterns) | `vscodeWatcher.ts:89` | pushed |
| nine commands | the sites in INV-3 | pushed |
| MCP provider | `mcp/provider.ts:30` | pushed |
| detector | `extension.ts:73` | `dispose()` is empty; it owns nothing |
| `M` stdin listener and line buffer | `transport.ts` `serve` | the process ends with stdin; buffer consumed per line, capped at `MAX_FRAME_BYTES` |
| `C` `BufRead` loop and frame buffer | `crate/src/mcp/mod.rs` `serve_streams` | capped at `MAX_FRAME_BYTES` after `envsync-le-leaks-2`; no threads, no temp files; `TempTree` in tests removes itself on drop |
| module-level mutable state | none in `src/` outside tests (`MATCHES_NOTHING`, `KEY_PATTERN` are non-global regexes); crate: `static COUNTER: AtomicUsize` in `testing.rs` (tests only), two `LazyLock<Regex>` | |

### INV-6. Suspension points

| Site | Read before | Used after | Answer |
|---|---|---|---|
| `extension.ts` | none (`void detector.checkSync()`) | | no await |
| `settings.ts:12` `await executeCommand(openSettings)` | nothing | nothing | safe |
| `vscodeWatcher.ts` timer callback: `await runCheck()`; `runCheck` awaits `checkPromise` | `disposed`, `checkPromise` | `disposed`, `changedDuringCheck` re-read after | the change that arrived during a check was dropped (`envsync-le-races-1`) |
| `detector.ts` `checkSync`: `await performSyncCheck(config)` | `config` snapshot | the same snapshot throughout | coherent per run (RACE-7) |
| `detector.ts` `checkSyncForFiles`: `await loadSpecificFiles` then `readConfig` | paths | config read after the read | coherent |
| `discovery.ts` `findFiles` per pattern, `readFile` and `getFileStats` per file | the listing | a file gone between the listing and the read is a named read-error (RACE-11) | safe |
| `showIssues.ts` `await checkSync`, `await openTextDocument`, `await showTextDocument` | nothing shared | report content computed from the awaited result | safe |
| `compareSelected.ts` `findFiles`, `showQuickPick`, `showProgress` → `checkSyncForFiles` | the selection | the selection | safe |
| `setTemplate.ts` `findFiles`, `showQuickPick`, `config.update` ×2, `checkSync` | the picked file | written then re-checked | safe; two runs at once both write (RACE-3) |
| `ignoreFile.ts` `findFiles`, `showQuickPick`, `readConfig` then `config.update`, `checkSync` | `temporaryIgnore` read before the write with no await between | written | a second run started during the write in a real host reads the list from before it (carried, RACE-4 note) |
| `help.ts` `openTextDocument`, `showTextDocument` | nothing | | safe |
| `ratingPrompt.ts` `state.update` before `showInformationMessage`; `openExternal` | the stored state | the ask is written before the toast (RACE-5) | safe |
| `vscodeFileSystem.ts`, `vscodeUserInterface.ts` | adapter awaits over host calls | | pass-through |

### INV-7. Failure sites

| Site | What arrives | What happens | Answer |
|---|---|---|---|
| `guard.ts` catch | any rejection from a command body | one redacted, localized error toast | ERR-1 pass, ERR-7 pass, ERR-8 pass |
| `vscodeFileSystem.ts` `fileExists` catch → `false` | a stat failure of any kind | permission denied read as "does not exist"; no caller | `envsync-le-features-5` removed it |
| `vscodeFileSystem.ts` `decodeUtf8` catch | a decode failure | `not UTF-8 text` | added by `envsync-le-errors-2` |
| `vscodeWatcher.ts` two catches → `console.error` unless silent | a check that rejects; a handler that throws | logged only | ERR-9: unreachable, `checkSync` resolves with an error report and `handleEvent` calls nothing that throws; kept as the backstop |
| `detector.ts` `checkSync` catch → `handleSyncCheckError` | `readConfig` succeeds outside it; discovery's own catches swallow the rest | status `parse-error`, count 0, one error toast | ERR-1 pass; reachable from a `configuration.get` that throws (`_setConfigReadError`) and from a rejected `findFiles` before `envsync-le-errors-1`, after it the latter is a report error |
| `detector.ts` `checkSyncForFiles` catch | as above | same, message now localized (`envsync-le-translations-1`) | pass |
| `discovery.ts` `processPattern` catch | `findFiles` rejects | a `read-error` naming the pattern; after `envsync-le-errors-1` the status says so | pass |
| `discovery.ts` `parseAndAddFile` catch | `readFile` or `getFileStats` rejects | a `read-error` naming the file with the host's message | pass (ERR-4, RACE-11) |
| `showIssues.ts` `displayIssuesReport` catch | `openTextDocument` or `showTextDocument` rejects | localized "Failed to show issues" | ERR-12: the mock could not reach it (`envsync-le-errors-5`) |
| `compareSelected.ts` `compareFiles` catch | `checkSyncForFiles` never rejects | localized error | unreachable backstop |
| `setTemplate.ts` two try/catch, `ignoreFile.ts` three | `config.update` rejects (a read-only settings file) | localized errors; two of them were English (`envsync-le-translations-1`) | pass after the fix; the mock cannot make `update` reject (ERR-12 note) |
| `heuristics.ts` `globToRegex` catch → `MATCHES_NOTHING` | an uncompilable pattern | excludes nothing | documented; `glob.test.ts` |
| `ratingPrompt.ts` catch | a `globalState.update` that throws | reported to telemetry, no toast | documented; tested |
| `mcp/transport.ts` `callTool` catch; `respond` catch | a tool that throws; anything else | `isError` result; JSON-RPC error with the thrown code | pass |
| `src/cli/mcp.ts` `callTool` catch | a tool that throws | `isError` result | pass |
| `src/cli/run.ts` catch | `parse`, `scan` throw | `envsync-le: <message>` on stderr, exit 2 | pass, parity-held |
| `src/cli/discover.ts` `entriesOf` catch → throw; `read` catch → throw with reason | `readdirSync`, `statSync`, `readFileSync`, decode | the crate's words | pass, parity-held |
| `src/cli/ignoreRules.ts` `readText` catch → `null` | an unreadable ignore file | no rules, as the crate | documented |
| `src/cli/output.ts` `stdout.on('error')` | a closed pipe | one refusal, exit 2 | pass, `check:cli-pipes` |
| crate `unwrap`/`expect`: `cli.rs:97` `expect("a report serializes")`, `mcp/mod.rs` `expect("a report serializes")`, `expect("an envelope serializes")`, `corpus.rs` `panic!` on an unknown document (test-only), `parser.rs`/`heuristics.rs` `expect("a constant pattern compiles")` | serde on owned structs; constant regexes | unreachable from input | ERR-15 pass |
| crate `?` at boundaries | `scan::scan` → `discover` errors; `check_tool` → `scan` | `envsync-le: <path>: <os error>` exit 2; a tool failure with the reason | pass |
| crate `process::exit` | none; `ExitCode` returned from `main` | | pass |

### INV-8. User-visible strings, by channel

| Channel | Strings | Classification |
|---|---|---|
| notifications through `vscodeNotifier.ts` | `Missing keys in {0}: {1}`, `Extra keys in {0}: {1}`, `Failed to parse {0}: {1}`, and every `showError` caller's text | `l10n.t()` |
| notifications through `vscodeUserInterface.ts` from the commands | 26 strings in `compareSelected.ts`, `setTemplate.ts`, `ignoreFile.ts`, `showIssues.ts` | 16 through `l10n.t()`; 10 were literals (`envsync-le-translations-1`) |
| the guard | `EnvSync-LE could not finish: {0}` | `l10n.t()` |
| the rating toast | `Enjoying {0}? …`, `Rate`, `Later`, `Don't Ask Again` | `l10n.t()`, bound and compared |
| dialog buttons | `Yes`, `No` on Clear Ignored Files | literals, compared to `'Yes'` (`envsync-le-translations-1`) |
| status bar | `$(file) N`; tooltips `All dotenv files are in sync`, `Dotenv files out of sync - click for details`, `Error checking dotenv files - click for settings` | `l10n.t()`; the third said settings where the click opens details (`envsync-le-bugs-4`) |
| quick picks | placeholders ×4, `Currently ignored` | `l10n.t()`; labels are paths |
| progress | `Comparing selected files...` | `l10n.t()` |
| the markdown report | `# envsync-le Sync Report`, `Checked files:`, `Status:`, `Missing Keys`, `Compared to:`, `other files`, `Parse / Read Errors` | English at the pass, by design; the follow-up (nolindnaidoo/envsync-le#58) put the headings through `l10n.t()` so a German host could read them |
| the help document | ~60 lines | English by design (carried, as the family carries it) |
| telemetry output channel | event lines | machine |
| manifest | 32 `%key%` values | `package.nls.json` and 12 catalogues |
| `M` tool descriptions and refusals | `compare_env_files` description, schema descriptions, 8 refusals | English, machine-read (L10N-19) |
| `N` CLI | `USAGE`, the stderr listing, refusals | English, held byte for byte to the crate (L10N-19) |
| `C` | the same as `N`; `envsync_le_check` description and refusals | English (L10N-19) |

### INV-9. Machine interfaces

`M` the extension's server (`dist/mcp-server.js`): one tool, `compare_env_files` (`files[] {path, content}` required, `mode` enum, `templatePath`, `caseSensitive`, `maxResults` 1..5000 default 500, `additionalProperties: false`); success `{ ok, data: { status, files[] {path, type, keyCount}, missingKeys[], extraKeys[] }, diagnostics[], meta { tool, count, truncated } }`; a refusal is an `isError` result whose text is the reason.

`N` `envsync-le mcp` and `C` `envsync-le mcp`: the same tool plus `envsync_le_check` (`path` required; `template`, `caseSensitive`, `exclude[]`, `hidden`, `ignored`), whose data is the CLI report. Protocol refusals are JSON-RPC errors; see ERR-14.

`C` and `N` CLI: `envsync-le [options] [dir]`, `--file <path>...`, `mcp`, `--version | -V`, `--help | -h`; options `--template <path>`, `--strict`, `--file`, `--ignore-case`, `--exclude <glob>`, `--hidden`, `--no-ignore`. Exit 0 in sync or no dotenv files, 1 out of sync, 2 a malformed question or, with `--strict`, a skipped file. stdout one JSON report when not a terminal; stderr the listing and verdict.

`N` packages: `mcp/package.json` `envsync-le-mcp`, `bin envsync-le-mcp → server.js`, files `server.js README.md LICENSE`; `cli/package.json` `envsync-le`, `bin envsync-le → cli.js`, files `cli.js README.md LICENSE`. Versions: `package.json`, `mcp/package.json`, `server.json` (both fields), `cli/package.json`, `crate/Cargo.toml` all 2.4.5.

### INV-10. Claims

| Source | Claim | Backing |
|---|---|---|
| README | compares variable names, never reads or compares values, never modifies files | parity script's value grep, crate corpus test, contracts `no_value_ever_reaches_stdout_or_stderr`, `mcp.test.ts` |
| README | automatic debounced checks on file change | `vscodeWatcher.test.ts`; the change during a check was dropped (`envsync-le-races-1`) |
| README | status bar counter, one click from the report | `adapters.test.ts`; the count hid on an error (`envsync-le-errors-1`) |
| README | markdown report lists every missing key per file | `extension.test.ts`, integration, e2e |
| README | three modes; template reports extras | `detector.test.ts`, corpus |
| README | ignore list | `extension.test.ts` |
| README | VS Code 1.101+ registers `compare_env_files` with agent mode | `provider.test.ts` (`envsync-le-features-7`), e2e |
| README | file classification table | `heuristics.test.ts`, corpus, `coverage_matrix` |
| README | CLI from npm and crates.io, same output byte for byte | `check:cli-parity`, `check:cli-pipes` |
| README | exit codes | `contracts.rs`, `cli.test.ts` |
| README | settings table, `statusBar.enabled` applies immediately | true after `envsync-le-features-1`; false at baseline in a real host |
| README | keys match `[A-Za-z_][A-Za-z0-9_.-]*` | `parser.test.ts`; the crate docs said otherwise (`envsync-le-features-3`) |
| README | twelve languages, manifest and runtime | `l10n.test.ts`, integration; ten strings were English (`envsync-le-translations-1`); report and help are English and now say so |
| README | no network, values never logged, redaction, one rating prompt at most twice | `ratingPrompt.test.ts`, `errors.test.ts`; `grep -rn 'fetch\|http.request' src` → none outside URLs in strings |
| mcp/README | status `in-sync`, `missing-keys`, `extra-keys` or `parse-error` | the tool never returns `parse-error` (`envsync-le-features-3`) |
| mcp/README | no dependencies, no network, no filesystem | `check:mcp-bundle` |
| crate/README, SPEC | key regex without the dot; `--no-ignore` walks what .gitignore excludes; the CLI honours .gitignore | all three stale (`envsync-le-features-3`) |
| crate/README, SPEC | exit codes, two modes, no values, hidden is about directories, uncompilable pattern excludes nothing | `contracts.rs`, `discover.rs` tests, `heuristics.rs` tests |
| cli/README | same command line as the crate, identical | `check:cli-parity` |
| help command | commands, template system, ignore system, troubleshooting | the commands exist; "Ignored files are skipped by sync checks" true |
| manifest description | env sync and check, compare keys across a workspace | the detector |

### INV-11. Tests, matched

| Test file | Covers |
|---|---|
| `src/extension.test.ts` | `extension.ts` through the mock, every command through the real wiring |
| `src/adapters/adapters.test.ts` | the eight adapters |
| `src/adapters/vscodeWatcher.test.ts` | `vscodeWatcher.ts` |
| `src/commands/commands.test.ts` | `compareSelected.ts`, `setTemplate.ts`, `ignoreFile.ts` through ports |
| `src/commands/guard.test.ts` | `guard.ts`, every registration guarded |
| `src/config/config.test.ts`, `settings.test.ts` | `config.ts` (manifest parity), `settings.ts` |
| `src/detection/*.test.ts` | `parser.ts`, `heuristics.ts` (+ `glob.test.ts`), `comparator.ts`, `detector.ts`, goldens |
| `src/mcp/mcp.test.ts`, `readme.test.ts`, `provider.test.ts` (new) | `transport.ts`, `tools.ts`, `envelope.ts`, `mcp/README.md`, `provider.ts` |
| `src/cli/cli.test.ts`, `frames.test.ts`, `output.test.ts` | `args.ts`, `usage.ts`, `run.ts`, `scan.ts`, `discover.ts`, `checkTool.ts`, `ioError.ts`, `frames.ts`, `output.ts`; `mcp.ts` and `main.ts` through the parity gates |
| `src/rating/policy.test.ts`, `wiring.test.ts`, `src/ui/ratingPrompt.test.ts` | the rating prompt |
| `src/utils/errors.test.ts` | `errors.ts` |
| `src/agent-files.test.ts` | `scripts/check-agent-files.py` |
| `src/l10n.test.ts` (new), `lifecycle.test.ts` (new), `races.test.ts` (new) | the catalogues against the sources; disposal and repeated runs; concurrent runs |
| `test/integration/extension.test.ts`, `l10n.test.ts`, `settings.test.ts` (new) | the real host |
| `scripts/e2e-vsix.js` | the installed VSIX |
| crate unit tests in every module; `tests/{contracts,hazards,platform,scenarios,budget,fuzz,coverage_matrix}.rs` | the crate |
| `discovery.ts` | covered through `detector.test.ts` and `extension.test.ts`; no file of its own |
| `types.ts`, `interfaces/*.ts`, `mcp/info.ts`, `mcp/server.ts`, `cli/main.ts` | types and entry points; the entry points run under the stdio gates |

## Step 2: Broken features

Files reopened for this step: `package.json`, `src/extension.ts`, the commands, `src/mcp/provider.ts`, `scripts/e2e-vsix.js`, `.vscodeignore`, `crate/src/cli.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | INV-3 matches both ways; `test/integration/extension.test.ts` "registers every declared command" with `getCommands(true)` |
| FEAT-2 | E | pass | `extension.test.ts` through the real wiring asserts an effect per command: a report document, a toast, a configuration write, a built-in executed; integration asserts the report's content and the help document in a real host |
| FEAT-3 | E | pass | Shapes read from the handlers: `showIssues`, `clearTemplate`, `clearAllIgnored`, `help`, `openSettings` take none; `compareSelected` `(uri?, uris?)` and `setTemplate`/`ignoreFile`/`stopIgnoring` `(uri?)`, from the palette (nothing) and the explorer (the clicked resource, and the selection for `compareSelected`). Each shape has a test in `extension.test.ts` or `commands.test.ts`. `ignoreFile` from a multi-selection ignores the clicked file only; recorded, the manifest offers no multi-select contract |
| FEAT-4 | E | pass | Two entries, one clause, `resourceFilename` exists at 1.101. The clause admits `.env`, `.env.x` and `x.env` (INV-2) |
| FEAT-5 | E | n/a | no keybindings |
| FEAT-6 | E | finding | Every setting but one had a consumer test showing a changed effect: `enabled` (`detector.test.ts` disabled report), `watchPatterns` (`adapters.test.ts` rebuild), `excludePatterns` (watcher skip, `heuristics.test.ts`), `notificationLevel` (notifier ×3), `statusBar.enabled` (toggle), `caseSensitive` (`comparator.test.ts`), `telemetryEnabled` (channel), `comparisonMode` manual and template (`detector.test.ts`), `compareOnlyFiles`, `templateFile`, `temporaryIgnore` (`extension.test.ts`). `debounceMs` was read back only (`envsync-le-features-6`) |
| FEAT-7 | E | pass | `config.test.ts` "config defaults parity with package.json" walks every declared property through `KEY_MAP` and fails on one the map lacks |
| FEAT-8 | E | finding | `envsync-le-features-1`: in a real host, `enabled` set to false after activation left `Show Details` opening a report. `test/integration/settings.test.ts` shows it; four unit tests fail against the old adapter once the mock hands out a snapshot as the host does |
| FEAT-9 | E | pass | `workspaceContains:**/.env*`: the integration workspace (`test/integration/fixtures/.env`) activates ("activates"); the e2e profile's workspace with `.env` and `.env.local` activates. A workspace without one is not driven: the commands are declared in the manifest and the palette shows them, which is what the manifest promises; recorded as not run rather than pass |
| FEAT-10 | E | pass | `bun run package` → the VSIX carries `dist/extension.js`, `dist/mcp-server.js`, `package.nls.json`, 12 `package.nls.*.json`, 12 `l10n/bundle.l10n.*.json`, the icon, README, CHANGELOG, LICENSE: everything `asAbsolutePath('dist/mcp-server.js')`, `"l10n": "./l10n"` and `"icon"` resolve. `bun run test:e2e-vsix` drives the installed artifact: the report, and the server spawned exactly as `provider.ts` spawns it |
| FEAT-11 | E | pass | `check:bundle` read: static scan plus a real `require` with `vscode` stubbed |
| FEAT-12 | M | finding | Driven over stdio, three servers, forty probe frames (`evidence-protocol-baseline.log`): a valid call, a schema-violating call and a call on a malformed document each return the documented shape on all three. The malformed frames differed on twenty-one of forty (`envsync-le-errors-4`) and five argument shapes answered differently on the shared tool (`envsync-le-bugs-1`, `-2`) |
| FEAT-13 | M C | pass | `check-detection-parity.ts` read: parsing, classification and comparison of the corpus, every `mcp-compare-env-files.json` case, and the value grep. `check-differential.ts` read: 600 generated documents (quoted, multi-line, unterminated, exported, duplicated, CRLF, BOM, no trailing newline) through both servers, canonicalised, plus the value marker. `check-mcp-definition.ts` read: the definition field by field. The differential never names a template other than by its exact label and never sends a bad `mode`, which is why BUG-15 is a run beside it |
| FEAT-14 | M | finding | `envsync-le-features-7`: the registration ran in no unit test (mock had no `lm`). `provider.test.ts` now asserts the id, the executable, `ELECTRON_RUN_AS_NODE`, the bundle path and the version, and the host-without-the-API branch. `scripts/e2e-vsix.js` spawns the installed server as the provider does and reads `tools/list` |
| FEAT-15 | N | pass | `check:npm-package` and `check:cli-package` read and run: packed, installed into a throwaway project, driven through the shim; `bin`, `files` and the versions match INV-9 |
| FEAT-16 | C | pass | Every flag and exit code has a `contracts.rs` test (`version_and_help_exit_clear`, `an_unknown_flag_exits_two_and_names_itself`, `a_template_turns_a_local_key_into_a_finding`, `ignoring_case…`, `an_exclude_pattern…`, `hidden_controls_directories…`, `named_files_replace_discovery`, `an_unreadable_input_exits_two`, `a_parse_error_warns…`, `--strict` in `hazards.rs`). Real repositories: `check:cli-parity`'s generated tree, `crate/fixtures` and `samples/` are driven as cases; `samples/ --hidden` answered `missing-keys`, exit 1, on both binaries |
| FEAT-17 | all | finding | INV-10: four claims unbacked (`envsync-le-features-3`), one true only after a fix (`statusBar.enabled` applies immediately), one true only after `envsync-le-translations-1` |
| FEAT-18 | all | finding | `envsync-le-features-5`: `comparator.areFilesInSync`, `FileSystem.fileExists` and `discovery.sanitizeParseMessage` had no caller. Settings all consumed (INV-4); commands all registered (INV-3); every bundle key called (`l10n.test.ts`); every `package.json` script runs or is a writer (gate table). `DotenvFile.lastModified` is set by a `getFileStats` call and read by nothing but the goldens (carried) |
| FEAT-19 | E | pass | `vitest.config.ts` read: `coverage.thresholds`, `include src/**/*.ts`, excludes only tests, mocks, fixtures, snapshots, `i18n`, `types.ts`. `tsconfig.json` includes `src/**/*`, so test files are type-checked; `scripts/` is not (carried, as the last pass carried it). README sections regenerated at close |
| FEAT-20 | E | n/a | BASE-8 found no skipped test |
| FEAT-21 | all | pass | `check-bundle.js`: a bundle requiring a non-builtin is refused by the static scan (read). `check-mcp-bundle.js`: refuses `vscode`, the ceiling, a server that answers without the missing key (read). `commit-lint.js`: driven with `style: x` by the last pass's hook; the hook refused. `ci-crate.yml` policy: the grep refuses `is the reference implementation for`; driven in the scratchpad with a file carrying it, exit 1. `check-detection-parity.ts`: driven with the two new corpus cases before the fix, refused (`fail/bugs-1-parity.log`). `check-cli-parity.ts`: refused the `constructor` case before `envsync-le-bugs-3` (`fail/bugs-3.log`). `check-cli-pipes.ts`: refused the npm loop before the crate caught up (exit 1 mid-pass) |
| FEAT-22 | all | finding | `envsync-le-features-4`: `commands.test.ts` "reports files that could not be parsed" fed a `parse-error` status no input reached. After `envsync-le-errors-1` the detector produces it, and `extension.test.ts` drives `compareSelected` and `showIssues` through the real wiring with a file that will not parse. Every other failure-titled test was read: each input reaches its path (the parser tests, the `cli.test.ts` refusals, the hazards) |
| FEAT-23 | all | pass | `grep -rniE 'difference is a regression\|reproduces its output exactly\|is the reference implementation'` over every file type outside `node_modules`, `target`, `dist`: the CI job's own pattern, and `crate/README.md:123` "the extension, which is the reference implementation:", which is about the parser, the parity scope, and not a surface claim; no `.ts`, `.rs`, `.js` or `.yml` carries one |

## Step 3: Bugs

Files reopened for this step: `src/detection/*.ts`, `src/mcp/tools.ts`, `src/cli/args.ts`, `src/cli/scan.ts`, `crate/src/detect/*.rs`, `crate/src/mcp/compare.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | `parser.test.ts` empty, comments-only; `comparator.test.ts` empty list; `mcp.test.ts` empty `files`; `hazards.rs` empty and whitespace files; `cli.test.ts` a tree with no dotenv files; `mcp/compare.rs` tests |
| BUG-2 | E | pass | `grep -rnE 'if \(![a-zA-Z_.]+\)\|\|\| ' src --exclude='*.test.ts'` → 31 sites read. `readTemplateFile` tests `length > 0` explicitly; `readNumber` goes through `Number.isFinite` and `Math.max(100, …)`, so `''`, `null` and `true` land on the minimum rather than 0; `basename(filepath) \|\| filepath`; `selected \|\| []` on a pick; none sits on a value where `0`, `''` or `false` is meaningful |
| BUG-3 | all | pass | `formatKeyList` `slice(0, 3)` plus `...` when `length > 3`; `errors.slice(0, 3)`; `found.slice(0, MAX_FILES_PER_PATTERN)` after asking for one more (`envsync-le-errors-3`); parser `substring(0, equalIndex)` and `substring(equalIndex + 1)` on an index found; `closesQuote` `j++` past a backslash at end of line is bounded by `length`; crate `&line[..equals]` and `[equals + 1..]` on a byte index of `=`, an ASCII byte; `first.len_utf8()` |
| BUG-4 | all | pass | BOM: a leading one is dropped by `decodeUtf8` (fatal decoder) and by the crate's `without_bom`; mid-file one is JS whitespace on both sides (`parser.rs` tests, differential arm 10). CRLF: `split(/\r?\n/)` and `trim_end_matches('\r')`; `hazards.rs`. Lone `\r`: one line on both sides, pinned (`line_endings_do_not_change_the_keys`). No trailing newline: `hazards.rs`. Tabs: trimmed. Astral characters: `hazards.rs` emoji; the parity probe's `é😀/.env` path intact. Invalid UTF-8: `envsync-le-errors-2` names it on the extension; the crate and npm CLI already did |
| BUG-5 | E N C | pass | `grep -rnE '\.sort\(\|localeCompare\|toLocale[A-Z]' src --exclude='*.test.ts'` → `cli/discover.ts:331` only, `compareRanked` by bytes as the crate sorts a `PathBuf` (`cli.test.ts` "sorts by component"). The extension's report order was the search's (`envsync-le-races-2`, now sorted by code unit). "First match wins": `findReferenceFile` is the first file holding the keys, in sorted order on both sides |
| BUG-6 | all | pass | Every pattern read: `KEY_PATTERN` and the crate's `KEY` anchored, no `g`; `sanitizeErrorMessage`'s six `g` patterns are literals inside the function; `translateGlob` builds per call; `rustTrim`'s pattern per call; `commit-lint.js` `LOCAL_PATH` with `g` is used with `match`, which resets. No nested quantifier; `[^/]*` and `.*` inside anchored globs over file names. Timed: `shouldExcludeFile('a/'.repeat(5000) + '.env', ['**/.env.{dev,prod}'])` 2 ms and `'a/'.repeat(50000)` 6 ms, linear |
| BUG-7 | E N C | pass | `readNumber` `Number(…)` with `isFinite` and a floor; `parseInt` nowhere in `src/`; `readMaxResults` `Number.isInteger`; the crate reads `maxResults` as a double after `envsync-le-bugs-2` so `1e20` and `5.0` agree with JavaScript |
| BUG-8 | E N C | pass | `basename` splits on both separators (`heuristics.test.ts` Windows paths); `shouldExcludeFile` normalises `\\` to `/`; the crate's `display` and `same_file` accept either separator (`platform.rs`); `relativePath` strips the root as `Path::strip_prefix` (`cli.test.ts`); a trailing slash on the root (`repo/` parity case), a root path, spaces and non-ASCII names (`hazards.rs` `awkward_file_names…`), a 260-character path. `findFiles` returns `file` URIs; the pickers build `Uri.file(fsPath)`. The watch patterns are each handed to their own watcher and their own `findFiles`, never joined into one brace group |
| BUG-9 | E | pass | 22 casts read. On untrusted input: `tools.ts` `entry as Record<string, unknown>` followed by `typeof` checks on both fields; `transport.ts` `params?.arguments ?? {} as Record` then the tool's own reads; `vscodeUserInterface.ts` the quick-pick overload cast with a comment; `config.ts` reads through `typeof`/`Array.isArray`; `ratingPrompt.ts` `parseRatingState` re-checks every field. None stands alone |
| BUG-10 | E | pass | `compareFiles`, `serve`, `showInSyncMessage`, `showNoFilesMessage`, `verdict` defined twice. `compareFiles` the comparator and a command's local orchestration (different meaning); `serve` two protocols by design; the two `show*Message` pairs: `showIssues.ts`'s were the unlocalized copies, `envsync-le-translations-1` made them the same text through the same port; `verdict` the CLI's summary line and the ignore rules' tri-state, unrelated. `sameFile` was duplicated between `scan.ts` and the comparator's need; `envsync-le-bugs-1` moved it to the comparator |
| BUG-11 | E | finding | `compareSelected.ts`'s `parse-error` arm was reachable only from the detector's outer catch (`envsync-le-errors-1` makes it reachable from a parse error); `discovery.sanitizeParseMessage` stripped a prefix no message has (`envsync-le-features-5`); `comparator.collectTemplateKeys`'s `!templatePath` branch is dead behind `shouldUseTemplateMode`'s check, harmless |
| BUG-12 | E | pass | `readConfig` returns frozen; `compareFiles` freezes its arrays; `CONFIG_DEFAULTS` frozen; `DEFAULT_SCAN`, `DEFAULT_DISCOVER` frozen; `args.ts` builds a draft per call; no parameter mutated (`discovery.ts` pushes into arrays it created) |
| BUG-13 | E | finding | The status bar said `$(file) 0` with tooltip "All dotenv files are in sync" beside a parse error, and `Show Details` said in sync (`envsync-le-errors-1`); the error tooltip said "click for settings" and the click opens the details (`envsync-le-bugs-4`); the mcp README named a status the tool never returns (`envsync-le-features-3`) |
| BUG-14 | all | pass | No preview of a value exists: the parser keeps no value (`a_value_is_never_kept`), diagnostics carry the line number and the key name, the report counts keys per file; the parity grep, the fuzz marker and `contracts.rs` hold it |
| BUG-15 | M C | finding | Driven, three servers, the shared tool: a template named `./.env.example` or `sub/.env.example` was template mode on the crate and the union on npm (`envsync-le-bugs-1`); `mode: "template"` with no path, `mode: "manual"`, an entry without `content`, `maxResults: 1e20` and `caseSensitive: "no"` answered differently or wrongly (`envsync-le-bugs-2`). A document cut mid-value: the unterminated quote case, identical. Deep nesting and long paths do not apply to a line format. The corpus now pins each shape |
| BUG-16 | C | pass | `clippy::pedantic -D warnings` green; `&line[..equals]` is a byte index of an ASCII byte; `first.len_utf8()`; `usize` from `u64` through `try_from`; `maxResults` through `to_string().parse()` rather than a cast; no recursion on input (`translate_glob` recurses on brace bodies, bounded by the pattern's length) |
| BUG-17 | E C | pass | Every item under both "Invariants" headings named with its test: bundle (`check:bundle`), rating (`ratingPrompt.test.ts`), `CONFIG_DEFAULTS` (`config.test.ts`), consumers (INV-4 read), goldens (`characterization.test.ts`), nls parity and runtime parity (`l10n.test.ts`, integration), heuristics in one place (`grep basename\|split('.')` → `heuristics.ts` only), config per use (`adapters.test.ts` "reads a value changed after it was created"), extras only in template mode (`comparator.test.ts`), no `vscode` in the server (`check:mcp-bundle`), `ELECTRON_RUN_AS_NODE` (`provider.test.ts`, e2e), placeholders (integration), frame cap (`mcp.test.ts`, `frames.test.ts`, crate tests), guard (`guard.test.ts`). The crate's "Decisions": each has a test in `scan.rs`, `discover.rs`, `compare.rs` or `contracts.rs`. The eleven invariants this pass added each name theirs |
| BUG-18 | E N C | finding | `grep -rnE '\b[A-Z_]+\[[a-zA-Z_.()]+\]' src --exclude='*.test.ts'`: `args.ts` `VALUED[arg]`, `SWITCHES[arg]` on argv (`envsync-le-bugs-3`); `ioError.ts` `GLIBC[code]`, `STRERROR[code]`, `WINDOWS[code]` on an errno name the OS supplies. The extension's quick picks map by label, a path. The crate matches on strings. `constructor`, `toString`, `__proto__`, `hasOwnProperty`, `valueOf` driven through both binaries before and after |
| BUG-19 | E N C | pass | `isEnvFileName` reads the whole basename (`.env`, `.env.*`, `*.env`); `detectFileType` segments after the second; `.envrc`, `.env-backup`, `.env_local`, `env`, `environment` refused (`heuristics.test.ts`, `coverage_matrix.rs`, corpus classification); a dotfile with a path (`nested/.env.staging`); both resolvers answer the same corpus |
| BUG-20 | E | n/a | no command reads a document as lines and writes it back; the extension never writes a file |
| BUG-21 | M C | pass | The two parsers draw the same line: 600 generated documents identical, the fuzz target's swallowed-key property, the JS-whitespace port with its BOM and NEL tests on the crate side. No hand-found document on which one side refuses and the other does not; nothing to pin in a direction |

## Step 4: Errors

Files reopened for this step: `src/detection/detector.ts`, `src/detection/discovery.ts`, `src/adapters/vscodeFileSystem.ts`, `src/__mocks__/vscode.ts`, `src/mcp/transport.ts`, `src/cli/mcp.ts`, `src/cli/frames.ts`, `crate/src/mcp/mod.rs`, `crate/src/discover.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | finding | INV-7, every catch classified. `fileExists`'s catch returned false for every failure and had no caller (`envsync-le-features-5`); the two `console.error` catches are unreachable backstops and say so now in the table; every other catch names what failed |
| ERR-2 | E M C | finding | `envsync-le-errors-1`: `checkSync` returned `in-sync` beside a parse error and `no-files` beside a failed search or an unreadable file; the status bar hid. The crate: `exit_code` 0 with a skipped file unless `--strict`, documented and tested; the MCP tool's `ok` is false on a parse error (`mcp.test.ts`). `envsync-le-errors-3`: a comparison over the first hundred of more files looked complete |
| ERR-3 | M | pass | Run, three servers, a malformed document: `compare_env_files` on `.env.broken` answers `ok: false` with three `parse-error` diagnostics naming the file and line, identical on all three (`mcp-compare-env-files.json` "a file that will not parse cleanly", `check:cli-parity` call 10). A file that is not text: `envsync_le_check` names it `skipped` with `not UTF-8 text` on both binaries (`cli-parity` `--file repo/.env.latin1`) |
| ERR-4 | E | finding | `envsync-le-errors-2`: a Latin-1 or UTF-16 file was reported as `Line 1: Invalid key format` rather than `not UTF-8 text`. Every other message read against its causes: `Failed to search pattern X: <host>`, `<host message>` for a read, `More than 100 files match…`, the parser's three, `Failed to show issues: <host>` |
| ERR-5 | E | pass | `grep` → `openTextDocument`/`showTextDocument` awaited in try (showIssues, help); `config.update` ×7 awaited in try; `executeCommand` awaited (openSettings returns nothing); `env.openExternal`'s boolean read (`ratingPrompt.ts`); no `applyEdit`, `edit`, clipboard or `workspace.fs` writes. The in-sync toast and `recordSuccess` follow the awaited check; the report's `recordSuccess` follows the awaited `showTextDocument` |
| ERR-6 | E M | pass | `void detector.checkSync()` (never rejects, comment), `void ratingPrompt.recordSuccess()` ×2 (catches inside, documented); `transport.ts` `void respond(parsed).then(write)` (`respond` catches everything); every `async` handler is awaited by `guarded` |
| ERR-7 | E | pass | `guard.test.ts` "hands registerCommand a guarded handler at every site" reads the sources; the guard reports one redacted localized error; `openSettings` goes through `vscodeCommand.ts`, which guards too |
| ERR-8 | E | pass | `grep 'as Error\b\|catch \((e\|err\|error)\)'`: every `.message` read sits behind `instanceof Error`, else `String(error)` (`errors.ts`, `guard.ts`, `transport.ts`, `cli/*.ts`); `guard.test.ts` "a thrown value that is not an Error" |
| ERR-9 | E | finding | `envsync-le-errors-3`: the per-pattern cap and the three picker caps cut silently. `console.error` ×2 unreachable. Every other skip reaches the report: excluded and ignored files are not findings by design; unreadable files, failed searches and the error limit are errors |
| ERR-10 | E | finding | `grep vscode.window.show*`: `showIssues.ts` ×2 bypassed the UI port and were English (`envsync-le-translations-1`); `ratingPrompt.ts` by documented design; `vscodeUserInterface.ts` is the port. The notifier gates by level; the commands' own toasts go through the port, which does not gate, by design (a command the user invoked answers) |
| ERR-11 | E | pass | Every quick pick and dialog: `!selected` → return (`compareSelected`, `setTemplate`, `ignoreFile`, `pickIgnoredFile`); `confirmed !== yes` → return; the rating toast's `undefined` is "Later". No error, no result |
| ERR-12 | E | finding | `envsync-le-errors-5`: the mock could not refuse to open a document, hand back bytes that are not text, or present `vscode.lm`; `_setOpenDocumentError`, `_setFileBytes`, `_setLmApi` added, each with a test. Hooks present: `_setFindFilesError`, `_setConfigReadError`, a file's absence for `readFile`/`stat`, `_respondToQuickPick`, `_respondToWarning`, `openExternal` by spy. Still absent: a `config.update` that rejects (the seven try/catch arms around it run in no test; the `commands.test.ts` harness supplies its own configuration without a failing update) and a `showTextDocument` that rejects separately from `openTextDocument`. Recorded in the carried table |
| ERR-13 | E | finding | `detector.test.ts` "should handle file reading errors gracefully" and "should handle errors during sync check" pinned `no-files` and a hidden bar (`envsync-le-errors-1` rewrote them); `vscodeWatcher.test.ts` "does not start a second check while one is in flight" pinned half of the policy, kept, with the rerun test beside it |
| ERR-14 | M | finding | `envsync-le-errors-4`: unknown method, unknown tool, nameless call, missing argument, oversized frame, invalid JSON driven on all three servers; eight shapes answered differently, now one set of words and codes. `tools/call` on an unknown tool and a nameless call are `-32602` protocol errors; a schema-violating argument is an `isError` result; the two tables are `mcp.test.ts` "protocol" and `mcp.test.ts` "compare_env_files: arguments" |
| ERR-15 | C | pass | INV-7: five `expect`s on serde of owned structs and two constant regexes; `corpus.rs`'s panic is test-only; indexing on byte offsets of ASCII bytes; `hazards.rs` asserts exit 0/1/2 and never a signal on every input it builds |
| ERR-16 | N M C | pass | `hazards.rs`: permission denied skipped and named, `--strict` 2; FIFO refused, not read (`a_fifo_does_not_block_the_run`, 60 s limit); symlink loop terminates; directory named like a dotenv file skipped; 300-character path; undecodable file skipped and named. `check:cli-parity` drives a FIFO, a mode-000 file and a mode-000 directory through both binaries. The extension: a file gone between listing and read is a named read-error (`detector.test.ts`) |
| ERR-17 | N E | pass | `grep '\|\| true\|continue-on-error\|2>/dev/null' scripts .github/workflows`: `ci-crate.yml:232` `grep … \|\| true` captures a possibly-empty grep, then tests the capture; `release.yml:106` counts VSIX files, then refuses any count but one; `release-cli.yml:54` reads a tag that may not exist, then refuses. Every `spawnSync`/`execFileSync` in `scripts/` either throws on failure or reads `.status` |
| ERR-18 | E | pass | `showProgress` wraps `withProgress`, which closes when the task settles; the status bar has no busy state; no flag set before a dialog |
| ERR-19 | M | finding | `envsync-le-errors-4`: invalid bytes, an invalid byte inside a string, a BOM-led line, not JSON, no method, no version, the wrong version, a null id, `initialize` asking another version, `notifications/initialized` with an id, driven on all three servers (`evidence-protocol-baseline.log`, `-after.log`); twenty-one differed, every one identical now but `tools/list`, which differs by design. Every server was there for the request after |

## Step 5: Memory leaks

Files reopened for this step: `src/extension.ts`, `src/adapters/vscodeStatusBar.ts`, `vscodeTelemetry.ts`, `vscodeWatcher.ts`, `src/mcp/transport.ts`, `crate/src/mcp/mod.rs`, `crate/src/discover.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | INV-5: every disposable the host returns is pushed to `context.subscriptions`; none is created per command |
| LEAK-2 | E M | pass | Two `onDidChangeConfiguration` listeners pushed; three `onDid*` per watcher owned by the watcher and dropped with it; `transport.ts` one `input.on('data')` for the process; `main.ts` `process.stdout.once('error')` once; no listener inside a handler |
| LEAK-3 | E M | pass | The one timer: cleared on reschedule, cleared on dispose, and its callback returns on `disposed` (`lifecycle.test.ts` "watchers, their listener and the debounce timer": `getTimerCount()` 0 after dispose, no check after an event post-dispose). No timer in the servers |
| LEAK-4 | E | pass | The lazy output channel is disposed by `telemetry.dispose()`, pushed up front, created or not (`lifecycle.test.ts` "telemetry channel") |
| LEAK-5 | E | finding | `envsync-le-leaks-1`: no test called `dispose` and asserted release, or called it twice. `lifecycle.test.ts` does for the status bar, the channel and the watchers |
| LEAK-6 | E | finding | `envsync-le-leaks-1`: `lifecycle.test.ts` "after every command has run once": activate, nine commands, dispose every subscription; `_live()` → every count zero, no timer pending. The mock tracks it now |
| LEAK-7 | all | pass | No module-level mutable state in `src/`; the crate's two `LazyLock` regexes are constants; the servers hold a line buffer consumed per line |
| LEAK-8 | E | pass | `createDotenvFile` keeps the keys, never the text; the report holds paths and keys; the watcher's closure holds the detector and the configuration; `ratingPrompt` holds counts |
| LEAK-9 | E | pass | No child process, browser or stream in the extension; the MCP server is spawned by the host, not the extension (`provider.ts` returns a definition) |
| LEAK-10 | E | finding | `envsync-le-leaks-1`: `lifecycle.test.ts` "fifty rounds of every command": `_live()` after fifty rounds equals after one |
| LEAK-11 | M | finding | `envsync-le-leaks-2`: the extension's transport capped a frame at 16 MiB; the crate's loop and the npm command line's held a line whole (`oversized frame then ping`: refused on one, answered on two). Now capped on all three, one byte over with the newline in that chunk, far over with the newline later, and exactly at the limit (`frames.test.ts`, `mcp.test.ts`, crate `a_frame_over_the_limit…`, `a_frame_at_the_limit_is_served`). Nothing per request outlives the reply |
| LEAK-12 | M C N | pass | Driven, `memory.js`, one call in flight at a time, 3,000 `compare_env_files` calls over one session (two 200-key files, template mode): the extension's server 52 MB after 500, 57 flat from 1,000; the crate 5 MB flat; the npm command line 56 → 64 over 3,000, then a 9,000-call run 60, 62, 64, 66, 68, 70, 73, 73, 73: levels off at 73 MB after 7,000 (`evidence-memory.log`, `evidence-memory-npmcli-9000.log`). No driver in the repo; the last pass's `check-mcp-memory.js` shape is recorded for the owner (carried) |
| LEAK-13 | M | pass | `evidence-protocol-after.log` RACE-14/LEAK-13: stdin closed immediately, half a frame, destroyed, closed after a request without newline: exit 0, no signal, no partial frame, on all three servers |
| LEAK-14 | C | pass | `scenarios.rs` with `ENVSYNC_LE_SCENARIOS=1`: 300 services, a 20,000-key template, a 100,000-line unterminated value; `budget.rs` 500 files inside 550 ms and four times the tree under six times the clock; `hazards.rs` a 1 MB line and 100,000 lines. A file is read whole (`std::fs::read`), as the extension reads it; the ceilings are the suites' |
| LEAK-15 | C | pass | `hazards.rs` `a_symlink_loop_terminates`, `symlinks_do_not_crash_the_walk` (links never followed); no includes in a dotenv file |
| LEAK-16 | C | pass | `std::fs::read` and `metadata` own nothing after they return; no threads; `TempTree` removes itself on drop, tests only |
| LEAK-17 | tests | pass | RACE-17 runs identical; `vi.useRealTimers()` in `finally` or `beforeEach`; `_resetMockState()` in every `beforeEach`; `vi.restoreAllMocks()` in `ratingPrompt.test.ts` |

## Step 6: Race conditions

Files reopened for this step: `src/adapters/vscodeWatcher.ts`, `src/detection/detector.ts`, `src/commands/ignoreFile.ts`, `src/mcp/transport.ts`, `crate/src/discover.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | finding | INV-6: `envsync-le-races-1`, the watcher's in-flight guard dropped the event that arrived during a read, so the state after the edit was never read. Every other row re-reads or is safe when stale |
| RACE-2 | E | n/a | nothing is written back to a document |
| RACE-3 | E | finding | `envsync-le-races-3`: no test started a command twice. `races.test.ts` does for `showIssues` (two reports, one bar state), `compareSelected` (two results), `setTemplate` with `clearTemplate` (every write lands), `help` and `openSettings`. Policy: each run independent; the settings end in the last writer's state. The ignore commands' read-then-write is the carried case |
| RACE-4 | E | pass | No module-level state; the one read-await-write is `ignoreFile.ts`'s `temporaryIgnore` (read, then `config.update`), a lost update only if two runs start within one host write; recorded under RACE-3 and carried |
| RACE-5 | E | pass | `ratingPrompt.ts` writes the ask before the toast (`ratingPrompt.test.ts` "records the ask before the toast is answered"); `setKeysForSync` roams it |
| RACE-6 | E | n/a | `showProgress` is called with `cancellable: false` and no token reaches the task; no cancellation token exists |
| RACE-7 | E | pass | `checkSync` reads `config` once and threads it (INV-6); `checkSyncForFiles` reads it once after the files; no key is spent |
| RACE-8 | E | pass | The timer callback returns on `disposed`; `runCheck`'s rerun checks `disposed`; `lifecycle.test.ts` fires an event after dispose and sees no check |
| RACE-9 | E | pass | `activate` read line by line: adapters first, the status bar's item starts hidden with no command, commands registered before the watchers, the initial check after everything, the provider last; the status bar's click command is set only when a result arrives |
| RACE-10 | E C | finding | `envsync-le-races-2`: the extension's report followed `findFiles`' order; the crate sorts (`discover.rs` `the_order_is_stable_between_runs`), the npm command line sorts the same way (`cli.test.ts`). Now sorted by path on the extension too |
| RACE-11 | E C | pass | A file gone between the listing and the read: the extension names the host's message in a read-error (`detector.test.ts` "should handle file reading errors gracefully", now `parse-error`); the crate names the OS error in a `skipped` diagnostic (`scan.rs`, `hazards.rs`); neither vanishes |
| RACE-12 | M | pass | `evidence-protocol-after.log`: one request split at every byte offset, 46 splits, parsed exactly once on all three servers; split inside a four-byte character, name intact on all three; two messages in one chunk (`mcp.test.ts`, crate tests) |
| RACE-13 | M | pass | Twenty requests before any answer on all three: twenty replies, ids in order, each answer carrying its own file's path |
| RACE-14 | M | pass | LEAK-13 row |
| RACE-15 | C | pass | `grep -rnE 'rayon\|thread::\|tokio\|async fn\|Mutex\|RwLock\|Arc<\|static mut\|Atomic' crate/src` → `testing.rs` `AtomicUsize` counter, tests only |
| RACE-16 | C | pass | `platform.rs`: separators, `TZ`, case folding, reserved names, early stdin; the `tz-compare` gate; the walk sorted |
| RACE-17 | tests | pass | `bun run test` ×3: 291, 291, 291 passed; `--sequence.shuffle`: 291 passed (`race17-*.log`). 38 timer/clock sites in tests read: fake timers in the watcher and lifecycle tests, `Date.now()` only as fixture mtimes, `setTimeout(…, 0/20)` to let detached promises settle |

## Step 7: Translations

Scope read in full: `package.json`, `package.nls.json`, the 12 `src/i18n/package.nls.*.json`, `l10n/bundle.l10n.json`, the 12 `l10n/bundle.l10n.*.json`, `test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n` scripts. Every value in every locale was read: 32 manifest keys and 36 runtime keys at baseline, 45 at close, times twelve.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | `diff <(grep -oE '%[^%" ]+%' package.json …) <(jq -r 'keys[]' package.nls.json …)` → no output |
| L10N-2 | E | pass | the key-parity loop over both mechanisms → no `DRIFT` |
| L10N-3 | E | pass | de es fr id it ja ko pt-br ru uk vi zh-cn for both; `bun run check:locales ../` from the site: every string in its own language |
| L10N-4 | E | pass | `src/l10n.test.ts` "every string passed to l10n.t() is in the bundle" and the reverse, across line breaks; by hand at baseline the seven wrapped calls accounted for the seven keys the one-line grep missed |
| L10N-5 | E | finding | `envsync-le-translations-1`: ten literals. The mechanical half is `l10n.test.ts` "hands no literal to a notification, the status bar, a prompt or a dialog button", which named all ten before the fix. INV-8 classifies every row: `l10n.t()`, a manifest key, or English by design (the report, the help page, the machine surfaces) |
| L10N-6 | E | pass | `l10n.test.ts` "never calls l10n.t() at module scope"; `grep -rnE '^(export )?(const\|let) .*l10n\.t\('` → none |
| L10N-7 | E | pass | `l10n.test.ts` "every call hands l10n.t() a string literal"; `grep 'l10n\.t(`'` → none |
| L10N-8 | E | pass | `unzip -l release/envsync-le-2.4.5.vsix`: `package.nls.json`, 12 `package.nls.*.json`, 12 `l10n/bundle.l10n.*.json`; `git status` clean after `package`, so `clean:i18n` took back every copy |
| L10N-9 | E | finding | `envsync-le-translations-3`, carried at the pass and closed by the follow-up (nolindnaidoo/envsync-le#58): `test/locale/german-host.test.ts` reads `# envsync-le Sync-Bericht` and `## Fehlende Schlüssel` off a report in a host launched with `--locale=de` and the German language pack. At the pass: no test showed a translated string in a real non-English host. The runtime half has no surface the API can read back here: the report and the help page are English by design and the toasts, tooltips and pickers cannot be read; the manifest half is not localized for a dev-loaded extension (the last two passes recorded the same). What would settle it: a German host run that reads a command title off an installed VSIX, or a localized report |
| L10N-10 | E | pass | the placeholder loop → no output, before and after the new keys |
| L10N-11 | E | pass | runtime: no value identical to English; manifest: `manifest.command.category` (`EnvSync-LE`) and `manifest.settings.title` (`envsync-le`) in all twelve, product names |
| L10N-12 | E | pass | `EnvSync-LE`, `envsync-le`, `dotenv`, `.env`, `$(file)` (code, not in a catalogue), `{0}`/`{1}`, `Unignore File`'s translated title used in the new key, checked by search in every locale |
| L10N-13 | E | finding | `envsync-le-translations-2`: every value read in its place; 41 did not fit. Runtime: `Extra keys` as keyboard keys (de `Tasten`, es `Teclas`, ru `клавиши`, uk `клавіші`) and as game shortcuts (vi); `Stop ignoring all {0} files?` with the count read as a path or directory (de, es, fr, it, ja, ko, pt-br, uk); `No longer ignoring {0}` naming a website (ru `сайт`), glued into a truncated word (id `mengabaik{0}`), imperative (de, ja, ko); `Failed to ignore file: {0}` with the error read as a file name (ja, ko); `Error checking…` as "checking for errors" (id, it, ja, ko, pt-br, ru) and "click for settings" everywhere where the click opens details; `Set {0} as template` imperative (de, es, fr, pt-br, ru, uk); `Some files are missing keys` with 密钥 (zh-cn, a secret). Manifest: `manifest.mcp.label` read as "EnvSync-LE and dotenv comparison tools" in all twelve; id `Polanya`; ja `自動比較すべて`; vi `chế độ đại lý` (agent as dealer) and `Bỏ bỏ qua`. Indonesian and Vietnamese were judged with less confidence than the ten others, and only clear errors were changed there |
| L10N-14 | E | finding | `envsync-le-translations-2`: the `pt-br` manifest was European Portuguese (`ficheiros`, `definições`, `monitorizar`, `registos`, `estado`, and `Designorar`), rewritten in Brazilian Portuguese; `check:locales` passes before and after, which shows its reach stops at the language |
| L10N-15 | E | pass | `Stop ignoring all {0} files?` and `Compared {0} files` read for 0, 1 and many in each locale: the count sits where the language puts a numeral; `{0} file(s)` forms do not occur |
| L10N-16 | E | finding | part of `envsync-le-translations-2`: id `Template`/`templat` and `Atur Template`/`Hapus Template` made `templat`; vi `phớt lờ`/`bỏ qua` made `bỏ qua`; `Unignore File`'s title and the new runtime key that names it agree in every locale |
| L10N-17 | E | finding | part of `envsync-le-translations-1`: `confirmed !== 'Yes'` compared the dialog's answer to an English literal; bound now. `grep "\.label ===\|=== '[A-Z][a-z]+"` → the quick-pick mapping by its own label only |
| L10N-18 | E | pass | The report, the clipboard (none), the MCP responses, the CLI output and the help page are English and stable across locales; the README now states the report and help page are English |
| L10N-19 | C M | pass | `grep -rn 'l10n\|locale' crate/src src/cli src/mcp` → none; the crate, the CLI and both servers produce English only |

## Findings

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| envsync-le-features-1 | broken-features | The configuration adapter kept the `WorkspaceConfiguration` from activation, a snapshot, so no setting took effect without a reload and the ignore commands read the list from activation | `test/integration/settings.test.ts` in a real host: `enabled` false after activation, `Show Details` opened a report (`fail/features-1-host.log`); with a snapshot mock, four existing tests red (`fail/features-1-unit.log`) | `cbfb474` | `adapters.test.ts` "reads a value changed after it was created"; `settings.test.ts` "honours enabled=false set after activation" | `1 !== 0` in the host; `expected true to be false` and three more in the suite |
| envsync-le-features-2 | broken-features | README testing section stale; `coverage:readme:check` red at baseline | the gate's output | `1b18e7e` | `coverage:readme:check` | exit 1 |
| envsync-le-features-3 | broken-features | Four documentation claims false: the key regex without the dot (parser comment, crate README, SPEC, fuzz comment), `--no-ignore` and the walk honouring .gitignore (crate README, SPEC), a `parse-error` status the tool never returns (mcp README), the languages section implying the report is localized | read against the code | `ead4809` | none: documentation; `check-agent-files.py` and `cargo fmt` ran | n/a |
| envsync-le-features-4 | broken-features | `commands.test.ts` "reports files that could not be parsed" fed a status no input reached | read; `fail/errors-1.log` | `b78369f` | `extension.test.ts` "compareSelected names files that could not be parsed" | `expected false to be true` |
| envsync-le-features-5 | broken-features | `areFilesInSync`, `fileExists`, `sanitizeParseMessage` had no caller; `fileExists` read every failure as absence | `grep` in INV-7/FEAT-18 | `ba14210` | removed with their tests; the suite, parity and typecheck green | n/a |
| envsync-le-features-6 | broken-features | `debounceMs` had no consumer test | read | `901dab0` | `vscodeWatcher.test.ts` "waits the configured debounce, not the default" | test-gap |
| envsync-le-features-7 | broken-features | The MCP provider's registration ran in no unit test; the mock had no `lm` | BASE-7 37.5% | `6e990cb` | `provider.test.ts` ×3 | test-gap |
| envsync-le-errors-1 | errors | A parse error beside matching keys reported `in-sync` with the bar at `0`; an unreadable file or a failed search reported `no-files` with the bar hidden; `Show Details` said in sync and never opened the report | `fail/errors-1.log`: 7 tests | `b78369f` | `detector.test.ts` ×4, `extension.test.ts` ×2 | `expected 'in-sync' to be 'parse-error'`, `expected 'no-files' …`, the toast present |
| envsync-le-errors-2 | errors | A file that is not UTF-8 was decoded leniently and reported as malformed keys | `fail/errors-2.log` | `69c166b` | `adapters.test.ts` ×2, `extension.test.ts` "showIssues names a file that is not UTF-8 text" | resolved a string where a rejection was expected |
| envsync-le-errors-3 | errors | 100 files per pattern compared and the rest unmentioned; pickers offered the first 50 | `fail/errors-3.log` | `92dc50f` | `detector.test.ts` "says so when more files match…"; `extension.test.ts` ×3 "offers every env file" | `expected 101 to be 100`, `expected 50 to be 60` |
| envsync-le-errors-4 | errors | Three servers answered a malformed frame three ways on 21 of 40 frames | `evidence-protocol-baseline.log` | `b1bf2c3` | `mcp.test.ts` protocol ×4 and the BOM frame, `frames.test.ts` ×9, crate `serve_streams` ×9; `check:cli-pipes` | `check:cli-pipes` exit 1 with the npm side moved first; the probe's 21 `DIFFER` lines, now 0 outside `tools/list` and key order |
| envsync-le-errors-5 | errors | The mock could not refuse to open a document, hand back bytes, or present `lm` | ERR-12 | `6e990cb`, `69c166b` | `extension.test.ts` "showIssues reports a report it could not open", the bytes tests, `provider.test.ts` | test-gap |
| envsync-le-bugs-1 | bugs | The shared tool matched a template by exact label on npm and by trailing component on the crate | `fail/bugs-1-parity.log`; the probe's two template frames | `6c4cb90` | corpus "template: matched by the name it ends in…", fixture "a template named with a leading ./ is the same file", `comparator.test.ts` ×6 | parity FAILED (2) on the extension's side |
| envsync-le-bugs-2 | bugs | The crate fell through to auto on `mode: "template"` with no path and on `mode: "manual"`, named a bad entry generically, refused `maxResults: 1e20`; both read `caseSensitive: "false"` as true | `fail/bugs-2-ts.log`, `fail/bugs-2-crate.log` | `f452880` | five fixture cases on both runners; `mcp.test.ts` "refuses a caseSensitive that is not true or false" | parity FAILED (1) and the crate's `every_shared_case_answers_identically` panicked |
| envsync-le-bugs-3 | bugs | `envsync-le constructor` on npm: "constructor needs undefined"; the crate names a missing directory | `fail/bugs-3.log` | `ea15e48` | `cli.test.ts` ×2; three `check-cli-parity` cases | `expected … to be 'constructor'`; parity FAIL: 3 differences |
| envsync-le-bugs-4 | bugs | The error tooltip said "click for settings"; the click opens the details | read | `7fcca9f` | the key renamed in 13 bundles and the source; `l10n.test.ts` holds the sources to the bundle | n/a |
| envsync-le-leaks-1 | memory-leaks | No test disposed and asserted release, disposed twice, deactivated after every command, or ran commands fifty times | LEAK-5, -6, -10 | `6e990cb` | `lifecycle.test.ts` ×5 | test-gap |
| envsync-le-leaks-2 | memory-leaks | The crate's loop and the npm command line held an oversized frame whole | the probe's "oversized frame then ping" | `b1bf2c3` | `frames.test.ts` limit tests, crate `a_frame_over_the_limit…`, `a_frame_at_the_limit_is_served` | two servers answered the 17 MiB frame |
| envsync-le-races-1 | race-conditions | The watcher dropped a change that arrived while a check was in flight | `fail/races-1.log` | `dca9f88` | `vscodeWatcher.test.ts` "checks once more for a change that arrived while a check was in flight" | `expected 1 to be 2` |
| envsync-le-races-2 | race-conditions | The report's order was the workspace search's | `fail/races-2.log` | `2acb4fe` | `detector.test.ts` "orders the report by path…" | `expected ['/w/.env.production', …]` |
| envsync-le-races-3 | race-conditions | No test started a command twice at once | RACE-3 | `6e990cb` | `races.test.ts` ×4 | test-gap |
| envsync-le-translations-1 | translations | Ten strings English in every locale; `Yes`/`No` compared as literals; two toasts bypassed the UI port | `fail/translations-1.log`: the test named all ten sites | `67d9cde` | `src/l10n.test.ts` ×7; nine keys in 13 bundles | the ten sites listed |
| envsync-le-translations-2 | translations | 41 values said something other than their source; `pt-br` manifest in European Portuguese | the full read, L10N-13/14/16 rows | `7fcca9f` | the catalogues; `check:locales`, the placeholder loop, `l10n.test.ts` parity | n/a: catalogue values |
| envsync-le-translations-3 | translations | No test shows a translated string in a real host | L10N-9 | follow-up nolindnaidoo/envsync-le#58 | `test/locale/german-host.test.ts` ×2, run in a real German host | test-gap |

Every commit on the branch is one of the above, or `70552d0` (formatting the pass's own tests). The follow-up branch, nolindnaidoo/envsync-le#58, closes the carried items the table below marks. Every new test that holds a fix was run with the fix absent and its failure is in `fail/` beside the record's evidence in the session scratchpad; the words are in the table.

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| envsync-le-translations-3 (L10N-9) | No test shows a translated string in a real non-English host; the runtime half has no readable surface here and the manifest half is not localized for a dev-loaded extension | Closed in nolindnaidoo/envsync-le#58: the report's headings are localized and a German host reads them. The manifest half still has no test, for the reason every pass has recorded |
| RACE-3 / RACE-4, the ignore commands | `ignoreFile` and `stopIgnoring` read `temporaryIgnore` and write it; two runs started within one host write would lose one. The mock writes synchronously and cannot show it; a queue is a design decision | Closed in nolindnaidoo/envsync-le#58: the three commands take turns at the list, and two tests hold writes with `_holdConfigUpdates()` and lose a file without the queue |
| FEAT-18, `DotenvFile.lastModified` | Set by a `getFileStats` call per file and read by nothing but the goldens; the stat is a failure point (a file gone between read and stat drops the file with a named error) | Closed in nolindnaidoo/envsync-le#58: the field, the stat and the port method are gone, and the goldens regenerated |
| ERR-12, `config.update` | The seven try/catch arms around `config.update` run in no test: the mock's `update` cannot reject | Closed in nolindnaidoo/envsync-le#58: `_setConfigUpdateError` and `_setShowDocumentError`, one test per arm |
| LEAK-12, a driver in the repo | The three servers were driven from the scratchpad; the repo has no `check:mcp-memory` script | Closed in nolindnaidoo/envsync-le#58: `bun run check:mcp-memory`, 57 MB flat from 1,000 to 3,000 calls |
| LEAK-12, write backpressure | `transport.ts` and `src/cli/mcp.ts` ignore `write()`'s return; a client that never drains holds replies in the write queue (measured as resident memory in the last pass) | Closed in nolindnaidoo/envsync-le#58: both servers stop reading while the pipe is full, with a slow-reader test each |
| FEAT-19, `scripts/` | Not type-checked; `tsconfig.json` includes `src/**/*` only | Still open: `tsconfig.json` is fleet-shared, so this is a sweep across the family, not one repo's change |
| INV-8, the help page | English by design; the README says so. The report's headings were localized in nolindnaidoo/envsync-le#58 | A decision to localize the help page |
| `cargo audit` | Not installed here; CI's `audit` job | the pull request's CI (CLOSE-9) |

No `unknown`: every check has an answer per surface.

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | Every check above has an answer per surface; no `not done`, no blank row, no `unknown` |
| CLOSE-2 | pass | 24 findings: 23 fixed with a commit and a test named, 1 carried (`envsync-le-translations-3`), with the owner's decisions listed above |
| CLOSE-3 | pass | The "Failed without fix" column; the logs are `fail/*.log` in the session scratchpad and their words are quoted in the table |
| CLOSE-4 | pass | `gates.sh final` on `1b18e7e` after `cargo clean -p envsync-le`: the Final column, every gate exit 0 but `cargo audit` (not installed, as at baseline); `coverage:readme:check` went from red to green |
| CLOSE-5 | pass | From this checkout of `letools-site` with the tool repos beside it: `check:fleet ../`, `check:locales ../`, `check:doc-paths ../`, `check:registry`; `check:fleet` after `src/mcp/transport.ts`, `src/cli/frames.ts` and `src/cli/frames.test.ts` joined envsync-le's own-copy lists |
| CLOSE-6 | pass | Every behaviour change has a CHANGELOG line under `[Unreleased]` in `CHANGELOG.md` and `crate/CHANGELOG.md`; eleven invariants added to `AGENTS.md` and two to `crate/AGENTS.md`, each naming its test; the README's Testing section regenerated by its script |
| CLOSE-7 | pass | `git diff main...HEAD` read in full: the fixes, their tests, the catalogues, the docs; no scratch file, no probe test, no debug output. `git log main..HEAD --format='%ae %s'`: 18 commits, every author `13629544+nolindnaidoo@users.noreply.github.com`, every subject conventional; `bun run lint:commits` → 18 commit(s) conform |
| CLOSE-8 | pass | [nolindnaidoo/envsync-le#57](https://github.com/nolindnaidoo/envsync-le/pull/57), body = the findings table, the carried table; no attribution |
| CLOSE-9 | pass | Every check on the pull request green: `ci.yml` on three operating systems, `ci-crate.yml` test, hazards, platform, scenarios and cli-parity on three, commit messages, one version, versions and registry identity, CodeQL; merged by squash as `1357ff29` on 2026-10-25 |
| CLOSE-10 | pass | This record and the ledger row, in one `letools-site` change |
| CLOSE-11 | pass | Added in this `letools-site` change: `race-conditions.md` RACE-18 (a debounced run that finds one in flight runs once more after it); `broken-features.md` FEAT-8 sharpened (a `WorkspaceConfiguration` is a snapshot; the mock must be one too); `errors.md` ERR-9 sharpened (a search's result cap: ask for one more than is read); `bugs.md` BUG-15 widened (a numeric argument as `1e20` or `5.0`, a mode without the argument it needs, an entry of the wrong shape); `translations.md` L10N-13 (a domain word with a homonym) and L10N-14 (a regional variant's vocabulary from another region). The hunt: BUG-8, BUG-21, LEAK-3, LEAK-12 and RACE-11 leave, having passed here; nothing joins, since every check that found something here passed in at least one earlier pass it applied to |
