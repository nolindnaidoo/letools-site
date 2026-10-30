# Fleet pass record: string-le

| | |
|---|---|
| Repo | string-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `5554c3974cc91fb1b789f40bea7b8d7f263cbb4d` |
| Started | 2026-10-11 |
| Pull request | https://github.com/nolindnaidoo/string-le/pull/53 |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; after `git fetch`, `git status -sb` → `## main...origin/main` |
| BASE-2 | pass | `git config user.email` → `13629544+nolindnaidoo@users.noreply.github.com`; no repo-local override |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from main at `5554c397` |
| BASE-4 | pass | Gate list below, derived from `ci.yml`, `ci-crate.yml`, `release.yml`, `release-crate.yml` and `package.json` scripts |
| BASE-5 | see table | Every command run once, unpiped, each to its own log, exit codes below |
| BASE-6 | see findings | |
| BASE-7 | recorded | Per-file coverage below |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. Baseline is `5554c397`; Final is `ddc06bc`, the release head: the branch ends in `9586dc4` (extension, server and npm package to 2.5.1) and `ddc06bc` (crate to 0.4.3). The chains also ran green on `dafa793`, the first close, and on `cb2530f`, after the two fixes made on the owner's decision (`2ed9747`, `495b64e`). Each chain is one script that runs every gate unpiped, writes each gate's output to its own log and records the exit code; the extension chain, then the crate chain, then the host chain, in that order so nothing is timed against a cargo build. Three surfaces: `E` extension, `M` the bundled MCP server, `N` the npm package, `C` the crate.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | 2 infos: `biome.json` schema 2.5.7 older than CLI 2.5.15, deprecated `recommended` key. Informational |
| `E` | `bun run typecheck` | exit 0 | exit 0 | |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | Baseline 34 files, 424 tests; statements 89.48, branches 81.99, functions 96.88, lines 91.00. Final 40 files, 486 tests; 92.32, 85.42, 98.89, 93.89 |
| `E` | `bun run build` | exit 0 | exit 0 | |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 | |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | 133 KB at baseline, 134 KB at close; the gate itself was widened by `string-le-features-5` |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `string-le-mcp@2.5.0` at baseline, `@2.5.1` at the release head |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | installs from the tarball, answers over stdio |
| `E` | `bun run package` | exit 0 | exit 0 | `release/string-le-2.5.0.vsix`: 34 files, 193.61 KB at baseline; `string-le-2.5.1.vsix`, 34 files, 211.04 KB at the release head |
| `E` | `bun run coverage:readme:check` | exit 0 | exit 0 | hand-run gate, not in CI; the section was regenerated at each close (`dafa793`, `cb2530f`); unchanged by the release commits |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline; "39 commit(s) conform" at the release head |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | ext = npm = `server.json` (both fields) = 2.5.0 at baseline, 2.5.1 at the release head; mcpName `io.github.nolindnaidoo/string-le` |
| `E` | `bun run test:integration` | exit 0 | exit 0 | 11 passing at baseline; at close 11 in the integration launch, 1 in the language-pack launch, 2 in the German host (`string-le-translations-4`) |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | `INSTALLED-VSIX TEST: PASS` for `string-le-2.5.0.vsix` at baseline and `string-le-2.5.1.vsix` at the release head |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | Red on the working tree between `e0c5192` and `b552bac` (see CLOSE-7); green on every pushed commit |
| `C` | `cargo test --locked` | exit 0 | exit 0 | 232 unit tests at baseline, 251 at close, plus contracts 21, hazards 9, platform 6, scenarios 3, budget 2, coverage_matrix 2 |
| `C` | `cargo build --locked` | exit 0 | exit 0 | `Cargo.lock` refreshed by `cargo check --offline` in the crate release commit, so `--locked` holds at 0.4.3 |
| `C` | `RUSTUP_TOOLCHAIN=1.88 cargo check --locked` | exit 0 | exit 0 | msrv job |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 | |
| `C` | policy: no `std::fs`/`File::open` in `crate/src/extract` | exit 0 | exit 0 | |
| `C` | policy: no doc holding the surfaces equal | exit 0 | exit 0 | At baseline over `*.md`; the CI grep now covers `*.rs` and `*.ts` too (`string-le-features-7`) and the final run uses the widened grep |
| `C` | `STRING_LE_SCENARIOS=1 cargo test --test scenarios -- --test-threads=1` | exit 0 | exit 0 | 3 passed, 77.8 s at baseline, 79.7 s at close |
| `C` | `cargo test --locked --test hazards -- --test-threads=1 --nocapture` | exit 0 | exit 0 | |
| `C` | `cargo test --locked --test platform -- --test-threads=1 --nocapture` | exit 0 | exit 0 | |
| `C` | `TZ=UTC cargo test --locked` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` with `TZ` unset | exit 0 | exit 0 | |
| `C` | `cargo test --locked --test coverage_matrix -- --nocapture` | exit 0 | exit 0 | |
| `C` | `cargo build --release --locked` | exit 0 | exit 0 | |
| `C` | `STRING_LE_FUZZ_SECONDS=20 STRING_LE_FUZZ_SEED=20251011 cargo test --release --locked --bin string-le extract::fuzz -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 4 targets, 20 s each here, 60 s in CI |
| `C` | `STRING_LE_BUDGET=1 cargo test --release --locked --test budget -- --test-threads=1 --nocapture` | exit 0 | exit 0 | 500 files in 33.4 ms at baseline, 37.8 ms at close, ceiling 400 ms; 4× tree 3.75× the time, bound 6× |
| `C` | `cargo llvm-cov` + per-module 70% floor on `extract/` | exit 0 | exit 0 | lowest module `fuzz.rs` 94.61% at baseline; writes `crate/coverage.json`, removed after each run |
| `C` | `cargo audit` | not run here | not run here | `cargo-audit` is not installed; CI's `audit` job ran green on the pull request |
| `C` `M` | `bun scripts/check-extraction-parity.ts` | exit 0 | exit 0 | 24 corpus cases at baseline, 33 at close; "both MCP servers agree" |
| `C` `M` | `DIFFERENTIAL_SEED=20251011 DIFFERENTIAL_CASES=600 bun scripts/check-differential.ts` | exit 0 | exit 0 | 600 generated documents; the three hand-found divergences are pinned since `293ec08` |
| `C` `M` | `bun scripts/check-mcp-definition.ts` | exit 0 | exit 0 | |
| `C` | `cargo package --list` corpus assertions, crates.io version probe, `cargo publish --dry-run` | not run here | driven | release-only; the probe step's body was driven with five fixed registry answers (`string-le-errors-6`) |
| `E` `N` | `vsce publish`, `ovsx publish`, `npm publish`, `mcp-publisher` | not run here | not run here | publishing |
| `E` | `bun run benchmark`, `perf:readme`, `coverage:readme`, `readme` | not run here | `coverage:readme` run at close | generated-section writers; `coverage:readme` regenerated the Testing section from the final run |
| `E` | `clean`, `clean:i18n`, `copy:i18n`, `build:prod`, `build:mcp`, `watch`, `test:watch`, `lint:fix`, `vscode:prepublish`, `hooks:install`, `prepare` | run via `package` or not gates | run via `package` | `vscode:prepublish` ran inside `package` |

BASE-7, from `coverage/coverage-summary.json` at baseline. Floors are 70 lines, 70 functions, 60 branches, 70 statements. Under the floor: `src/mcp/info.ts` and `src/mcp/server.ts` (0% lines: entry points driven only over stdio by `check-mcp-bundle.js` and `check-npm-package.js`), `src/mcp/provider.ts` (37.5% lines: the registration branch ran in no test, see `string-le-features-4`). Lowest branch coverage above the floor: `config/config.ts`, `commands/extractCsv.ts`, `ui/statusBar.ts`.

## Step 1: Inventory

Read manifest, from INV-1 (`git ls-tree -r --name-only 5554c39 -- src test scripts mcp crate/src crate/tests package.json server.json | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/'`), 135 files, 23,149 lines at the baseline commit. `src/i18n/` (12 catalogues) is read in step 7; `src/extraction/__fixtures__/` and `__snapshots__/` with `characterization.test.ts`.

| Read | Lines | File |
|---|---|---|
| [x] | 422 | crate/src/cli.rs |
| [x] | 132 | crate/src/extract/collect.rs |
| [x] | 117 | crate/src/extract/corpus.rs |
| [x] | 263 | crate/src/extract/csv.rs |
| [x] | 117 | crate/src/extract/dotenv.rs |
| [x] | 161 | crate/src/extract/fallback.rs |
| [x] | 307 | crate/src/extract/format.rs |
| [x] | 406 | crate/src/extract/fuzz.rs |
| [x] | 157 | crate/src/extract/ini.rs |
| [x] | 247 | crate/src/extract/json.rs |
| [x] | 130 | crate/src/extract/locate.rs |
| [x] | 218 | crate/src/extract/mod.rs |
| [x] | 180 | crate/src/extract/position.rs |
| [x] | 1325 | crate/src/extract/source.rs |
| [x] | 82 | crate/src/extract/text.rs |
| [x] | 89 | crate/src/extract/toml.rs |
| [x] | 104 | crate/src/extract/yaml.rs |
| [x] | 12 | crate/src/main.rs |
| [x] | 298 | crate/src/mcp/extract.rs |
| [x] | 550 | crate/src/mcp/mod.rs |
| [x] | 497 | crate/src/scan.rs |
| [x] | 60 | crate/src/testing.rs |
| [x] | 219 | crate/src/walk.rs |
| [x] | 225 | crate/tests/budget.rs |
| [x] | 488 | crate/tests/contracts.rs |
| [x] | 206 | crate/tests/coverage_matrix.rs |
| [x] | 515 | crate/tests/hazards.rs |
| [x] | 276 | crate/tests/platform.rs |
| [x] | 90 | crate/tests/scenarios.rs |
| [x] | 179 | mcp/README.md |
| [x] | 51 | mcp/package.json |
| [x] | 427 | package.json |
| [x] | 102 | scripts/benchmark.ts |
| [x] | 38 | scripts/build-mcp.js |
| [x] | 98 | scripts/build-npm.js |
| [x] | 135 | scripts/check-agent-files.py |
| [x] | 103 | scripts/check-bundle.js |
| [x] | 514 | scripts/check-differential.ts |
| [x] | 267 | scripts/check-extraction-parity.ts |
| [x] | 152 | scripts/check-mcp-bundle.js |
| [x] | 93 | scripts/check-mcp-definition.ts |
| [x] | 153 | scripts/check-npm-package.js |
| [x] | 182 | scripts/commit-lint.js |
| [x] | 181 | scripts/coverage-readme.js |
| [x] | 223 | scripts/e2e-vsix.js |
| [x] | 27 | scripts/install-hooks.js |
| [x] | 72 | scripts/perf-readme.js |
| [x] | 33 | server.json |
| [x] | 758 | src/__mocks__/vscode.ts |
| [x] | 62 | src/agent-files.test.ts |
| [x] | 360 | src/commands/commands.test.ts |
| [x] | 41 | src/commands/dedupe.ts |
| [x] | 41 | src/commands/editorLines.ts |
| [x] | 620 | src/commands/extract.test.ts |
| [x] | 328 | src/commands/extract.ts |
| [x] | 342 | src/commands/extractCsv.ts |
| [x] | 225 | src/commands/extractWorkspace.test.ts |
| [x] | 306 | src/commands/extractWorkspace.ts |
| [x] | 107 | src/commands/help.ts |
| [x] | 29 | src/commands/index.ts |
| [x] | 124 | src/commands/largeOutput.test.ts |
| [x] | 179 | src/commands/postProcessHelper.test.ts |
| [x] | 106 | src/commands/postProcessHelper.ts |
| [x] | 98 | src/commands/sort.ts |
| [x] | 47 | src/commands/toggleCsvStreaming.ts |
| [x] | 98 | src/commands/workspaceShared.ts |
| [x] | 120 | src/config/config.test.ts |
| [x] | 272 | src/config/config.ts |
| [x] | 18 | src/config/fileTypes.test.ts |
| [x] | 69 | src/config/fileTypes.ts |
| [x] | 48 | src/config/readConfig.test.ts |
| [x] | 19 | src/config/settings.ts |
| [x] | 31 | src/extension.ts |
| [x] | 90 | src/extraction/characterization.test.ts |
| [x] | 26 | src/extraction/collect.test.ts |
| [x] | 60 | src/extraction/collect.ts |
| [x] | 251 | src/extraction/extract.test.ts |
| [x] | 78 | src/extraction/extract.ts |
| [x] | 173 | src/extraction/formats/csv.test.ts |
| [x] | 252 | src/extraction/formats/csv.ts |
| [x] | 169 | src/extraction/formats/dotenv.test.ts |
| [x] | 82 | src/extraction/formats/dotenv.ts |
| [x] | 24 | src/extraction/formats/fallback.multiline.test.ts |
| [x] | 130 | src/extraction/formats/fallback.test.ts |
| [x] | 69 | src/extraction/formats/fallback.ts |
| [x] | 37 | src/extraction/formats/ini.ts |
| [x] | 124 | src/extraction/formats/json.test.ts |
| [x] | 33 | src/extraction/formats/json.ts |
| [x] | 74 | src/extraction/formats/jsonc.ts |
| [x] | 84 | src/extraction/formats/parsers.test.ts |
| [x] | 268 | src/extraction/formats/source.test.ts |
| [x] | 855 | src/extraction/formats/source.ts |
| [x] | 36 | src/extraction/formats/toml.ts |
| [x] | 39 | src/extraction/formats/yaml.ts |
| [x] | 78 | src/extraction/positions.test.ts |
| [x] | 127 | src/extraction/positions.ts |
| [x] | 143 | src/mcp/envelope.ts |
| [x] | 130 | src/mcp/fileType.ts |
| [x] | 13 | src/mcp/info.ts |
| [x] | 347 | src/mcp/mcp.test.ts |
| [x] | 55 | src/mcp/provider.ts |
| [x] | 107 | src/mcp/readme.test.ts |
| [x] | 13 | src/mcp/server.ts |
| [x] | 119 | src/mcp/tools.ts |
| [x] | 249 | src/mcp/transport.ts |
| [x] | 50 | src/providers/codeActions.test.ts |
| [x] | 84 | src/providers/codeActions.ts |
| [x] | 116 | src/rating/policy.test.ts |
| [x] | 84 | src/rating/policy.ts |
| [x] | 60 | src/rating/wiring.test.ts |
| [x] | 47 | src/telemetry/telemetry.test.ts |
| [x] | 26 | src/telemetry/telemetry.ts |
| [x] | 14 | src/types.ts |
| [x] | 46 | src/ui/largeOutput.ts |
| [x] | 56 | src/ui/notifier.ts |
| [x] | 172 | src/ui/prompts.ts |
| [x] | 281 | src/ui/ratingPrompt.test.ts |
| [x] | 179 | src/ui/ratingPrompt.ts |
| [x] | 167 | src/ui/statusBar.ts |
| [x] | 166 | src/ui/ui.test.ts |
| [x] | 36 | src/utils/errors.test.ts |
| [x] | 13 | src/utils/errors.ts |
| [x] | 36 | src/utils/filename.test.ts |
| [x] | 25 | src/utils/filename.ts |
| [x] | 59 | src/utils/positions.test.ts |
| [x] | 64 | src/utils/positions.ts |
| [x] | 33 | src/utils/text.test.ts |
| [x] | 76 | src/utils/text.ts |
| [x] | 228 | src/workspace/defaults.ts |
| [x] | 72 | src/workspace/ignore.test.ts |
| [x] | 156 | src/workspace/ignore.ts |
| [x] | 434 | src/workspace/scan.test.ts |
| [x] | 344 | src/workspace/scan.ts |
| [x] | 143 | test/integration/extension.test.ts |
| [x] | 176 | test/integration/l10n.test.ts |

Also read: `l10n/bundle.l10n.json` and the 12 locale bundles, every value (step 7); `package.nls.json` and the 12 locale catalogues, every value (step 7); `crate/fixtures/extraction.json`, `crate/fixtures/mcp-extract-strings.json`, the 23 corpus documents; `README.md`, `mcp/README.md`, `crate/README.md`, `CHANGELOG.md` (head), `crate/CHANGELOG.md` (head), `crate/SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`, `.vscodeignore`, `biome.json`, `tsconfig*.json`, `.vscode-test.mjs`, `vitest.config.ts`, `.githooks/commit-msg`, `.vscode/*.json`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.cursorrules`, `crate/Cargo.toml`, all six workflows, `.github/codeql-config.yml`, `.github/dependabot.yml`, the six agent-instruction files, `assets/demo.tape`, `assets/demo/messages.ts`, `samples/*`. The `zed/` directory holds only an ignored `target/` build tree (750 MB) and no source; `crate/CHANGELOG.md` 0.4.2 records the Zed extension's removal. No surface, outside scope.

### INV-2 Manifest contributions

`contributes` keys: `commands`, `configuration`, `mcpServerDefinitionProviders`, `menus`. `main`: `./dist/extension.js`. `l10n`: `./l10n`. `engines.vscode`: `^1.101.0`.

Commands (8): `string-le.extractStrings`, `string-le.extractWorkspace`, `string-le.extractFolder`, `string-le.postProcess.dedupe`, `string-le.postProcess.sort`, `string-le.csv.toggleStreaming`, `string-le.openSettings`, `string-le.help`. Every title and the category are `%key%` placeholders; L10N-1 shows the key sets equal.

Menus: `editor/context` → `extractStrings` when `editorLangId =~ /^(json|yaml|csv|toml|ini|dotenv|env)$/`; `explorer/context` → `extractFolder` when `explorerResourceIsFolder`; `commandPalette` → all eight, no `when`. The editor menu names seven language ids where the engine reads twenty-one (observation, carried).

Keybindings: none. Activation events: 20 `onLanguage:*` (json, yaml, csv, toml, ini, dotenv, env, python, rust, go, shellscript, php, ruby, perl, csharp, javascript, javascriptreact, typescript, typescriptreact, markdown).

MCP server definition providers: id `string-le`, label `%manifest.mcp.label%`.

Configuration (26 properties). Every one is read through `config/config.ts` `readConfig()` at the start of the command that uses it, except where noted.

| Property | Type | Default | Consumer |
|---|---|---|---|
| `clipboardIncludesPositions` | boolean | false | `commands/extract.ts`, `commands/extractWorkspace.ts` |
| `copyToClipboardEnabled` | boolean | false | `extract.ts`, `extractWorkspace.ts` |
| `csv.streamingEnabled` | boolean | false | `commands/extractCsv.ts`; `ui/statusBar.ts` (direct, for the suffix); `commands/toggleCsvStreaming.ts` (direct read and write) |
| `dedupeEnabled` | boolean | false | `extract.ts`, `extractCsv.ts` |
| `notificationsLevel` | enum all/important/silent | silent | `ui/notifier.ts` per message; `ui/ratingPrompt.ts` (inspect) |
| `postProcess.openInNewFile` | boolean | true | `commands/postProcessHelper.ts` |
| `openResultsSideBySide` | boolean | true | `extract.ts`, `extractCsv.ts`, `postProcessHelper.ts`, `extractWorkspace.ts` |
| `safety.enabled` | boolean | true | `extract.ts` (size warning, large-output dialog), `extractCsv.ts` (many-documents dialog) |
| `safety.fileSizeWarnBytes` | number ≥1000 | 1000000 | `extract.ts`. The warning printed this value instead of the file's size: `string-le-errors-5` |
| `safety.largeOutputLinesThreshold` | number ≥100 | 50000 | `extract.ts` → `ui/largeOutput.ts` |
| `safety.manyDocumentsThreshold` | number ≥1 | 8 | `extractCsv.ts` → `confirmManyDocuments` |
| `fallback.multiline` | boolean | false | `extract.ts`, `extractCsv.ts`, `extractWorkspace.ts` → the fallback reader and the position scanner |
| `showParseErrors` | boolean | false | `extract.ts`, `extractCsv.ts` (`onParseError` → notifier) |
| `sortEnabled`, `sortMode` | boolean, enum | false, off | `extract.ts`, `extractCsv.ts` |
| `showPositions` | boolean | false | `extract.ts`, `extractWorkspace.ts` |
| `statusBar.enabled` | boolean | true | `ui/statusBar.ts` (direct, with a change listener) |
| `telemetryEnabled` | boolean | false | `telemetry/telemetry.ts`, read per event |
| `workspace.scanExcludes`, `scanMaxFiles`, `scanMaxResults`, `scanPatterns`, `scanRespectGitignore`, `scanAlwaysInclude`, `scanSkipBinaryFiles`, `scanUseDefaultExcludes` | array/number/boolean | [], 5000, 10000, ["**/*"], true, [], true, true | `commands/workspaceShared.ts` → `workspace/scan.ts`; `extractWorkspace.ts` for the results limit |

Config keys read in source and not declared: none. Number settings read through `Number(...)`, so `''` and `null` became 0 and were clamped to the floor: `string-le-bugs-7`.

### INV-3 Registrations

| Command | Registered at (baseline lines) |
|---|---|
| `string-le.extractStrings` | `commands/extract.ts` 265 |
| `string-le.extractWorkspace` | `commands/extractWorkspace.ts` 47 |
| `string-le.extractFolder` | `extractWorkspace.ts` 52 |
| `string-le.postProcess.dedupe` | `commands/dedupe.ts` 13 |
| `string-le.postProcess.sort` | `commands/sort.ts` 41 |
| `string-le.csv.toggleStreaming` | `commands/toggleCsvStreaming.ts` 7 |
| `string-le.openSettings` | `config/settings.ts` 10 |
| `string-le.help` | `commands/help.ts` 14 |
| provider `string-le` | `mcp/provider.ts` 29 (`lm.registerMcpServerDefinitionProvider`, feature-detected) |
| code actions | `providers/codeActions.ts` 76, one `registerCodeActionsProvider` per language id in its list (seven) |

Eight `registerCommand` calls, eight manifest commands, no unmatched row either way. `test/integration/extension.test.ts` asserts it with `getCommands(true)`.

### INV-4 Settings and their consumers

Covered by the INV-2 table. Each value's consumer test is named under FEAT-6.

### INV-5 Resources with a lifetime

| Resource | Created | Released |
|---|---|---|
| Output channel `String-LE` | `telemetry.ts` 8, at activation | `context.subscriptions` (line 9) |
| Status bar item | `statusBar.ts` 10 | subscriptions at 11 |
| `onDidChangeConfiguration` listener | `statusBar.ts` 62 | subscriptions at 56 |
| Flash restore timer (`setTimeout`, 2 s) | `statusBar.ts` 162, per flash | cleared by the next flash and by a dispose object in subscriptions (84–93); a flash after dispose set a new one: `string-le-leaks-2` |
| 7 code action provider disposables | `codeActions.ts` 76 | subscriptions at 82 |
| MCP provider disposable | `provider.ts` 29 | subscriptions at 36 |
| 8 command disposables | each `register*` | subscriptions |
| CSV streaming generators (`activeStreams`) | `extractCsv.ts` per column | `return()` in `finally` |
| MCP `buffer` string | `transport.ts` 205, per `serve` | consumed per newline; **no maximum**: `string-le-leaks-1` |
| Crate MCP frame (`lines()` buffer) | `mcp/mod.rs` 37 | held whole until its newline: `string-le-leaks-1` |
| Rating prompt state | `globalState`, `ratingPrompt.ts` | memento, no process resource |

No intervals, watchers or child processes; the fallback's `g` patterns are used through `matchAll` (no shared `lastIndex`).

### INV-6 Suspension points

`await` and `.then(` in non-test source, by file: `extractCsv.ts` 19, `extract.ts` 13, `scan.ts` 9, `ratingPrompt.ts` 9, `extractWorkspace.ts` 6, `prompts.ts` 5, `postProcessHelper.ts` 5, `workspaceShared.ts` 4, `transport.ts` 3, `sort.ts` 3, `help.ts` 3, `largeOutput.ts` 2. The ones that read state before and use it after:

| Site | Reads before | Uses after |
|---|---|---|
| `extract.ts` 77 | `document.getText()` | the text's strings; results always go to a new document, never back into the source, so nothing stale is written (RACE-2 pass) |
| `extract.ts` 212, 228 | nothing shared | a result announced regardless of the open's outcome: `string-le-errors-1` |
| `extractCsv.ts` per column | text snapshot | each column's document; the run announced "CSV opened" whatever happened: `string-le-errors-2` |
| `toggleCsvStreaming.ts` 18–21 | the setting | `!value` written after `update` resolves; two presses before the first write lands may both read the old value on a real host (RACE-3, policy stated in `commands.test.ts`) |
| `dedupe.ts` 32, `sort.ts` 67 | the document's lines | written as a full-range replace computed at apply time; the only suspension is the edit itself |
| `scan.ts` 229, 234 | listing | per-file stat and read; a file gone in between was counted as "not UTF-8 text": `string-le-errors-3` |
| `transport.ts` 244 | nothing shared | response carries its own id |

### INV-7 Failure sites

| Site (baseline) | What arrives | What happens |
|---|---|---|
| `extract.ts` 94 | `getText()` throwing, or the type prompt rejecting | both labelled "Document is no longer valid": `string-le-errors-4` |
| `extract.ts` 212 | `openTextDocument`/`showTextDocument` rejecting | error shown, then the run counted as delivered: `string-le-errors-1`; a non-`Error` was swallowed |
| `extract.ts` 228 | clipboard | warning shown, tested |
| `extract.ts` 302 | `fs.stat` on an untitled document | ignored, by design, now commented |
| `extractCsv.ts` 148, 225 | a column's stream or open failing | error shown, non-`Error` swallowed; the run then announced "CSV opened": `string-le-errors-2` |
| `extractCsv.ts` 174, 335 | generator cleanup | ignored, by design |
| `extractCsv.ts` 319 | streaming | named error, tested |
| `postProcessHelper.ts` 40, 74 | open or edit failing | `vscode.window.showErrorMessage` directly, untranslated: `string-le-translations-1` |
| `workspaceShared.ts` 70 | clipboard | warning shown |
| `formats/csv.ts` 44, 84, 200; `ini.ts` 31; `json.ts` 27; `toml.ts` 30; `yaml.ts` 33 | parser throwing | `onParseError` with an `Invalid X:` message, `null`; JSONC comment-only reached `JSON.parse` as whitespace: `string-le-bugs-5` |
| `positions.ts` 97 | position scan | `undefined`, the caller warns |
| `transport.ts` 121, 180 | tool or protocol failure | `isError` result or JSON-RPC error |
| `transport.ts` 226 | `JSON.parse` | parse error written |
| `ratingPrompt.ts` 110 | `openExternal` | reported to telemetry (family file) |
| `ignore.ts` 104 | `new RegExp` on a translated pattern | rule dropped; inert, every branch escapes |
| `scan.ts` 168, 181, 197 | `.gitignore` read, `.git` stat, decode | by design, commented |
| `scan.ts` 235 | `fs.stat`/`fs.readFile` on a listed file | counted as `notText`: `string-le-errors-3` |
| crate `mcp/mod.rs` 38 | a line that is not UTF-8 | `return ExitCode::from(2)`: `string-le-errors-8` |
| crate `mcp/mod.rs` 44 | a line that is not JSON | dropped without a word: `string-le-errors-8` |
| crate readers | parser `Err` | `Invalid X:` diagnostic |
| no outer handler on any command body | a rejection from `openTextDocument`, `config.update`, the picker | the editor reported it in its own words: `string-le-errors-4` |

### INV-8 User-visible channels

Notifications through `notifier` (info, warning, error, and three advisories built inside it); the status bar text, tooltip and flash; three quick picks (file type, CSV column, sort mode); one input box with a `validateInput` message; two modal warnings with buttons (large output, many documents); one direct `showWarningMessage` (`prompts.ts` out-of-range); three direct `showErrorMessage` (`postProcessHelper.ts`); progress titles ("Extracting...", "Scanning files..."); results documents (plain text); the workspace report (markdown); the help document (markdown); manifest titles and descriptions; MCP tool descriptions and errors; CLI output. Classified under step 7.

### INV-9 Machine interfaces

`M` (npm server `dist/mcp-server.js`): one tool, `extract_strings`: `content` (string, required), `format` (enum of the alias table), `filename` (string), `dedupe` (boolean), `multiline` (boolean), `maxResults` (integer 1..5000). Success: `{ ok, data: { strings, fileType }, diagnostics, meta: { tool, count, truncated } }` in `content[0].text` and `structuredContent`, `isError: false`. A refused argument is `isError: true` with the message; a refused document is `ok: false` with one `parsing` diagnostic whose message opens `Invalid <FORMAT>: `.

`N`: `bin` `string-le-mcp` → `server.js`; versions `package.json` = `mcp/package.json` = `server.json` (both fields) = 2.5.0.

`C`: the CLI (`cli.rs` `FLAGS`, grep-style exit codes 0/1/2, JSON Lines on stdout, diagnostics on stderr) and `string-le mcp` with two tools, `extract_strings` (shared, held equal) and `string_le_scan` (the crate's own).

### INV-10 Claims

Read from `README.md`, `mcp/README.md`, `crate/README.md`, the manifest description, the help document and the MCP tool description.

| Claim | Where | Backing |
|---|---|---|
| String values from JSON, JSONC, YAML, TOML, INI, CSV, TSV and `.env`, keys never | README | corpus cases per format; `characterization.test.ts`; `parsers.test.ts` |
| String literals from ten source languages | README | `source.test.ts`; corpus documents per language; `crate/tests/coverage_matrix.rs` |
| Everything else by the quoted-string scan, `fallback.multiline` spans lines | README | `fallback.test.ts`; corpus; `fallback.rs` |
| Line and column of each string where the reader knows it | README | `positions.test.ts`; corpus positions on the crate side |
| VS Code 1.101+ registers `extract_strings` with agent mode, nothing to install | README | unbacked at baseline: the mock had no `vscode.lm`; `string-le-features-4` |
| The server reads no files and makes no network calls; `check:mcp-bundle` fails the build on an import that could reach either | README | the gate refused only a non-builtin: `string-le-features-5` |
| `npx -y string-le-mcp` works from a clean install | README, `mcp/README.md` | `scripts/check-npm-package.js`; gate exit 0 |
| The two servers answer `extract_strings` identically | `mcp/README.md`, `crate/README.md` | parity, differential, definition; outside all three at baseline: `string-le-bugs-1` to `-6` and `-10` |
| Workspace report: distinct strings, how often, where; limits; what was not read and why | README | `extractWorkspace.test.ts`, `scan.test.ts`; a deleted file was reported as "not UTF-8 text": `string-le-errors-3` |
| The built-in exclude lists, exactly; the settings table defaults | README | `config.test.ts` |
| CLI exit codes 0/1/2 | README, `crate/README.md` | `crate/tests/contracts.rs` |
| Twelve languages, both halves covered, follows the display language | README | L10N-1 to L10N-3; no test read a string under another display language: `string-le-translations-4` |
| "CI fails if this section drifts" | README Testing section, generated | false: the coverage gate was dropped in `c5f12aa`; the sentence comes from the fleet-shared `scripts/coverage-readme.js`. Carried |
| No network access; telemetry is a local output channel | README | `grep -rnE 'fetch\(\|https?\.\|net\.\|request\(' src --include='*.ts' --exclude='*.test.ts'` → only `openExternal` URLs; `telemetry.ts` read |
| Error notifications redact home directories and credential-shaped fragments | README | `errors.test.ts`; since `d1ee21b` every command failure goes through `guard.ts` and `sanitizeErrorMessage` |
| One rating prompt, at most twice; Rate opens the listing installed from | README | `ratingPrompt.test.ts` (family file). At baseline it keyed Open VSX on a publisher `OffensiveEdge` that no listing carries (the Open VSX API answers "extension not found" for it and 2.5.0 under `nolindnaidoo`), so every Rate click opened the Marketplace page: `string-le-features-8`, fixed on the owner's decision |
| Help page: commands, formats, troubleshooting | help document | said YAML, TOML and INI were read by the quoted scan: `string-le-errors-7` |
| `mcp/README.md` argument table matches the tool schema | `mcp/README.md` | `src/mcp/readme.test.ts` (fleet-shared) |
| Tool description and argument descriptions equal across servers | `src/mcp/tools.ts` | `check-mcp-definition.ts` |

### INV-11 Tests to modules

| Module | Tests | Note |
|---|---|---|
| `extension.ts` | `commands.test.ts` activation, `lifecycle.test.ts` (new) | |
| `telemetry/telemetry.ts` | `telemetry.test.ts`, `lifecycle.test.ts` | |
| `config/config.ts`, `config/settings.ts` | `config.test.ts`, `readConfig.test.ts`, `commands.test.ts` | type-strict number read added (`string-le-bugs-7`) |
| `commands/extract.ts`, `commands/extractCsv.ts` | `extract.test.ts`, `commands.test.ts`, `largeOutput.test.ts` | delivery and announcement tests added (`-errors-1`, `-errors-2`, `-errors-5`) |
| `commands/extractWorkspace.ts`, `commands/workspaceShared.ts` | `extractWorkspace.test.ts` | |
| `commands/dedupe.ts`, `commands/sort.ts`, `commands/editorLines.ts`, `commands/postProcessHelper.ts` | `commands.test.ts`, `postProcessHelper.test.ts`, `editorLines.test.ts` (new) | the in-place tests asserted nothing at baseline (`string-le-features-2`) |
| `commands/help.ts` | `commands.test.ts` | the page's content is held to the engine since `ed2060a` |
| `commands/guard.ts` (new) | `extract.test.ts`, `extractWorkspace.test.ts`, `commands.test.ts` "a failure inside the command" | |
| `commands/toggleCsvStreaming.ts` | `commands.test.ts` | two presses at once since `3b5f941` |
| `ui/notifier.ts`, `ui/prompts.ts`, `ui/largeOutput.ts`, `ui/statusBar.ts` | `ui.test.ts` | the status bar tests asserted nothing at baseline (`string-le-features-1`) |
| `ui/ratingPrompt.ts`, `rating/*` | `ratingPrompt.test.ts`, `rating/*.test.ts` | family files |
| `utils/errors.ts`, `utils/text.ts`, `utils/positions.ts`, `utils/filename.ts` | `errors.test.ts`, `text.test.ts`, `positions.test.ts`, `filename.test.ts` | |
| `workspace/scan.ts`, `workspace/ignore.ts`, `workspace/defaults.ts` | `scan.test.ts`, `ignore.test.ts`, `config.test.ts` | |
| `mcp/transport.ts`, `mcp/envelope.ts`, `mcp/fileType.ts`, `mcp/tools.ts` | `mcp.test.ts`, `readme.test.ts`; both servers: the corpus and the three scripts | |
| `mcp/info.ts`, `mcp/server.ts` | none (0% lines) | entry points driven over stdio by `check-mcp-bundle.js` and `check-npm-package.js` |
| `mcp/provider.ts` | `provider.test.ts` (new) | the registration branch ran in no test at baseline (`string-le-features-4`) |
| `providers/codeActions.ts` | `codeActions.test.ts` | |
| `extraction/*` | `extract.test.ts`, `collect.test.ts`, `positions.test.ts`, `characterization.test.ts`, `formats/*.test.ts` | |
| `src/l10n.test.ts`, `src/races.test.ts`, `src/lifecycle.test.ts` | new gates | |
| crate `extract/*` | unit tests in each module, `corpus.rs`, `fuzz.rs` | |
| crate `mcp/mod.rs`, `mcp/extract.rs` | unit tests; the stdio loop driven with bytes since `b552bac` | |
| crate `cli.rs`, `scan.rs`, `walk.rs` | `tests/contracts.rs`, `hazards.rs`, `platform.rs`, `scenarios.rs`, `budget.rs`, `coverage_matrix.rs` | |

## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, every file under `src/commands/`, `src/mcp/provider.ts`, `src/providers/codeActions.ts`, `src/config/`, `src/ui/`, `test/integration/`, `scripts/e2e-vsix.js`, `scripts/check-mcp-bundle.js`, `.vscodeignore`, `src/mcp/*`, `crate/src/main.rs`, `crate/src/cli.rs`, `mcp/package.json`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | INV-3: eight `registerCommand` calls, eight manifest commands. `test/integration/extension.test.ts` asserts with `getCommands(true)` in the real host; `commands.test.ts` against the mock |
| FEAT-2 | E | pass | Real host (`bun run test:integration`, 11 passing at baseline and at close): extracts JSON into a results document, extracts unquoted YAML scalars, dedupes, scans a folder from disk. Mock: every command's effect is asserted in `extract.test.ts`, `extractWorkspace.test.ts`, `commands.test.ts`, `postProcessHelper.test.ts` |
| FEAT-3 | E | pass | `extractFolder` takes a `Uri` from the Explorer or asks from the palette (`extractWorkspace.test.ts`). No other command reads an argument |
| FEAT-4 | E | pass, read | `editor/context` for seven language ids, `explorer/context` for a folder; both context keys exist in VS Code 1.101. A menu cannot be driven headless; what a real display shows was not verified here. Seven of twenty-one language ids: observation, carried |
| FEAT-5 | E | n/a | No `keybindings` contribution |
| FEAT-6 | E | finding | 26 settings. Consumer tests exist for each value except: the status bar's visibility and suffix had tests that asserted only that something was subscribed (`string-le-features-1`); `safety.fileSizeWarnBytes` governed a warning that printed the threshold instead of the size (`string-le-errors-5`); every number setting read `''` and `null` as 0 (`string-le-bugs-7`) |
| FEAT-7 | E | pass | `config.test.ts` walks `contributes.configuration.properties` against `CONFIG_DEFAULTS`; 26 defaults equal |
| FEAT-8 | E | pass | Every setting is read at the start of each command through `readConfig()`; `telemetryEnabled` per event; `statusBar.enabled` and `csv.streamingEnabled` through a change listener (asserted since `e2aa6ea`) |
| FEAT-9 | E | pass, one driven | 20 `onLanguage:*` events. The integration host opens a JSON document and the extension activates; the other 19 are read in the manifest, not driven |
| FEAT-10 | E | pass | `unzip -l release/string-le-2.5.0.vsix`: 34 files, `dist/extension.js`, `dist/mcp-server.js`, `package.nls.json` + 12, `l10n/bundle.l10n.*.json` × 12, icon, README, CHANGELOG, LICENSE. `test:e2e-vsix` PASS at baseline and at close |
| FEAT-11 | E | pass | `bun run check:bundle` green; the script read: static require scan and a `require()` of the bundle with `vscode` stubbed |
| FEAT-12 | M | finding | Driven against both built servers with 58 hand-written cases (`probe/drive.js`): valid calls, schema violations (`maxResults: 0`, a fractional cap, an unknown format), prototype names as `format` and `filename`, dotenv filename spellings, lone quotes, repeated keys, comment-only JSONC, truncated JSON, deep JSON 600/1,200/200,000, deep TOML 100/20,000, deep YAML 300/100,000, a lone surrogate, a mixed TOML array, a big integer, a 64 MiB frame. Disagreements: `string-le-bugs-1` to `-6`, `-10`, `-11` |
| FEAT-13 | M C | pass | `check-extraction-parity.ts` (corpus), `check-differential.ts` seed 20251011 over 600 generated documents, `check-mcp-definition.ts`: exit 0 at baseline and at close. The hand-found disagreements lie outside what the generator produces: prototype-named formats, dotenv spellings, lone quotes, repeated INI keys, comment-only JSONC, an integral float cap, three parser tolerances |
| FEAT-14 | M | finding | `scripts/e2e-vsix.js` spawns the installed server as the provider builds it and asserts an answer. The registration under a host with the API ran in no test: `string-le-features-4`; `provider.test.ts` now reads the definition back |
| FEAT-15 | N | pass | `bun run check:npm-package` installs from the tarball and answers over stdio; `bin` `string-le-mcp` → `server.js`; version 2.5.0 in all three files (INV-9) |
| FEAT-16 | C | pass | `cli.rs` `FLAGS` read against `tests/contracts.rs` (21 tests, one per flag and exit code), `hazards.rs`, `platform.rs`, `scenarios.rs`. Over this repository: `string-le .` → exit 0, 16,794 strings in 219 files, 5 binary files skipped, 4 values unlocated; `string-le --no-ignore --hidden --values src` → exit 0, 4,211 strings in 105 files; `string-le --strict .` → exit 0 |
| FEAT-17 | all | finding | INV-10 above. Unbacked at baseline: the provider registration (`string-le-features-4`), the bundle gate's promise (`string-le-features-5`), the help page (`string-le-errors-7`), a translated string in a real host (`string-le-translations-4`); the "CI fails if this section drifts" sentence is false and fleet-shared, carried |
| FEAT-18 | all | finding | Inert or lying: the characterization header described three parsed formats as fallback formats (`string-le-features-6`); three test suites asserted nothing or claimed a path no input reaches (`string-le-features-1`, `-2`, `-3`); the crate's extractor module carried the sentence the policy job refuses, in a file type the job did not grep (`string-le-features-7`). Locale keys: none dead (`src/l10n.test.ts`). Scripts in `package.json`: every one a gate, a build step or a release-time writer |
| FEAT-19 | E | pass | `vitest.config.ts`: `coverage.thresholds`, `include: src/**/*.ts`, excludes tests, mocks, fixtures, snapshots and `src/i18n/**`. `tsc --noEmit` type-checks the tests. README generated section regenerated at close |
| FEAT-20 | E | n/a | BASE-8 found no skipped test |

## Step 3: Bugs

Re-read for this step: `src/extraction/**` with its tests and fixtures, `src/commands/*`, `src/utils/*`, `src/mcp/*`, `src/config/*`, every file under `crate/src/`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | Every extractor has a blank-document test on both sides. Both servers driven with `content: ""` and `"   \n\t"`: `ok: true`, `count: 0`, `fileType` named. A JSONC document that is all comment is not blank once trimmed and reached `JSON.parse` as whitespace: `string-le-bugs-5` |
| BUG-2 | E M | finding | `grep -rnE 'if \(![a-zA-Z_.]+\)\|\|\| '` sites read. `config.ts` `readNumber` coerced `''` and `null` to 0 (`string-le-bugs-7`). The crate's `unquote` required two characters, so a lone quote was a value (`string-le-bugs-3`) |
| BUG-3 | all | finding | `fileType.ts` extension slice (`lastIndexOf('.') + 1`) read `.env.local` as format `local` and a path's last segment through its directory (`string-le-bugs-2`); `editorLines.ts` split a trailing newline into an empty last line (`string-le-bugs-9`); `transport.ts` line split holds under every-offset splitting (RACE-12); the hand-written CSV reader tested at both ends of every cell boundary on both sides |
| BUG-4 | all | pass | Crate `hazards.rs` tree: BOM, CRLF, lone CR, no trailing newline, empty, blank, NUL, invalid UTF-8, UTF-16, a 1 MB line, 100,000 lines; `fuzz.rs` alphabet carries U+FEFF, U+2028, an astral scalar and a combining mark. Extension: `decodeText` refuses invalid UTF-8 (`scan.test.ts`); `editorLines.ts` reads CRLF and writes LF; `position.ts` UTF-16 columns |
| BUG-5 | E C | finding | `utils/text.ts` length sorts broke ties with a bare `localeCompare`, host-locale dependent (`string-le-bugs-8`); the crate kept every value of a repeated INI key where the extension keeps the last in place (`string-le-bugs-4`). The alphabetical modes use a collator pinned to `en`; the report orders by count then value; the engine keeps document order |
| BUG-6 | all | pass | The fallback's quoted-run patterns are used through `matchAll` (no shared `lastIndex`); the source scanner is hand-written, no regex; backtracking bounded by `fuzz.rs` with a per-input time bound, 20 s per target here and 60 s in CI, and by the differential's 600 documents |
| BUG-7 | E C | finding | `string-le-bugs-7` (`Number(...)` on a setting); `string-le-bugs-6` (the crate's `as_u64` had no answer for `1e21`, which the npm server reads as an integer). No `parseInt` in `src`; `readMaxResults` requires an integer |
| BUG-8 | E C | finding | `string-le-bugs-2`: a filename that arrives as a path, `src/.env.local`, lost its dotfile name to the directory on both sides; both resolvers now take the last segment whichever separator wrote it. Pass elsewhere: `labelOf` trailing slash, the report's backtick and pipe escaping, drive-letter case in `scan.test.ts` |
| BUG-9 | E | pass | Casts read: `transport.ts` after an object check; `tools.ts` type-checks every argument; `scan.ts` after a regex test; the mock's `as never` only in tests. No `: any`, no non-null `!` |
| BUG-10 | E | pass | Duplicate names: `readQuoted` in `csv.ts` and `fallback.ts` (different meaning, module-private); the four line helpers were already shared through `editorLines.ts`. Read both bodies of each |
| BUG-11 | E | finding | The help page's claims about three formats and its silence on ten languages (`string-le-errors-7`); the characterization header (`string-le-features-6`); `extract.ts`'s `openDoc` flag recorded an intent, not an outcome, so the branch after a failed open ran as if it had succeeded (`string-le-errors-1`) |
| BUG-12 | E | pass | Config, results and defaults are `Object.freeze`d; no site writes to a parameter or a module constant (read) |
| BUG-13 | E | finding | The large-file warning printed the threshold as if it were the size (`string-le-errors-5`); the help page contradicted the engine (`string-le-errors-7`); the crate's extractor module called the extension its reference implementation against its own SPEC (`string-le-features-7`) |
| BUG-14 | E | n/a | No preview of a sensitive value; error text is redacted by `sanitizeErrorMessage` |
| BUG-15 | M C | finding | Driven on both servers: prototype names disagree (`string-le-bugs-1`); `.env.local` disagrees (`-bugs-2`); a lone dotenv quote disagrees (`-bugs-3`); a repeated INI key disagrees (`-bugs-4`); comment-only JSONC disagrees (`-bugs-5`); `maxResults: 1e21` disagrees (`-bugs-6`); a duplicated YAML key, a mixed TOML array and a lone surrogate divide the parsers inside formats where both refuse the ordinary broken document, recorded and pinned (`-bugs-10`). JSON 600 deep: npm reads, crate refuses at 512; JSON 1,200 and 200,000 deep, TOML 100 and 20,000 deep: npm answers `ok: true` with the strings above the cut, the crate refuses; YAML 300 and 100,000 deep: both refuse. SPEC.md's "Nesting limits" called the half-read answer deliberate; carried at the first close and fixed on the owner's decision (`string-le-bugs-11`): a binary search per format on each server found the first refusing depth (crate JSON 513, TOML 81; npm YAML 99; the other side reads thousands), and both now refuse past 512, 80 and 98 with one message, reading a document at each bound |
| BUG-16 | C | pass | `cargo clippy --all-targets -- -D warnings` (pedantic); `dotenv.rs` `unquote` slices through `get(1..len - 1)` since `ed0bea2`; every other `[..]` is on an offset from `find`, `len_utf8` or `floor_to_boundary`; recursion is bounded by each parser's own depth guard; the deep documents above are answered, not panicked |
| BUG-17 | all | pass | Each invariant in `AGENTS.md` and `crate/AGENTS.md` names its test; the ones added by this pass name theirs |
| BUG-18 | E M | finding | `mcp/fileType.ts` `ALIASES` and `extraction/extract.ts` `EXTRACTORS` were object literals: `constructor` as a format answered an engine error on the npm server and `fallback` on the crate, and as a file type handed the document back as one String object (`string-le-bugs-1`). `mcp.test.ts` tries every prototype name as a format, a filename and an extension; the corpus pins one on both servers |

## Step 4: Errors

Re-read for this step: every INV-7 file, every command file, every file that calls a `vscode` API, `utils/errors.ts`, `ui/notifier.ts`, `src/__mocks__/vscode.ts`, `mcp/transport.ts`, `mcp/tools.ts`, `mcp/envelope.ts`; in the crate `scan.rs`, `walk.rs`, `cli.rs`, `main.rs`, `mcp/mod.rs`, `mcp/extract.rs`; `scripts/*`, `.github/workflows/*`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | E M C | finding | Every INV-7 row answered. `extract.ts` 94 → `string-le-errors-4`; 212 → `string-le-errors-1`; `extractCsv.ts` 148, 225 → `string-le-errors-2` (and a non-`Error` swallowed); `postProcessHelper.ts` 40, 74 → direct, untranslated (`string-le-translations-1`); `scan.ts` 235 → `string-le-errors-3`; crate `mod.rs` 38, 44 → `string-le-errors-8`. The rest by design, commented, or tested |
| ERR-2 | E M C | pass | A refused document answers `ok: false` with a named diagnostic on both servers for every parsed format (differential `checkRefusalsAgree`); a document one parser refuses and the other reads is now pinned in its direction rather than read as clean by the check (`string-le-bugs-10`). Crate: an unreadable file is a `skipped` diagnostic, never silence |
| ERR-3 | M C | pass | Driven: truncated JSON, YAML, TOML, CSV through both servers → `ok: false`, `parsing`/`error`, `Invalid <FORMAT>: ` prefix on both, tails differing as SPEC.md says |
| ERR-4 | E C | finding | `scan.ts` called a deleted file "not UTF-8 text" (`string-le-errors-3`); `extract.ts` called a rejected picker "Document is no longer valid" (`string-le-errors-4`); the large-file warning named the wrong number (`string-le-errors-5`) |
| ERR-5 | E | finding | `extract.ts` announced "Extracted N", wrote the telemetry event and counted a rating use after `openTextDocument` had rejected (`string-le-errors-1`); the CSV multi-column path announced "CSV opened" after every column failed (`string-le-errors-2`). `editor.edit` results are checked (`postProcessHelper.ts`); clipboard failures are warned |
| ERR-6 | E M | pass | `void respond(...).then(write)` cannot reject (`respond` catches everything); `void recordSuccess()` has its own try/catch; every other promise is awaited or returned |
| ERR-7 | E | finding | No command had an outer handler (`string-le-errors-4`). Driven after the fix: `openTextDocument` rejecting in a folder scan and in help, the file-type picker throwing in extract: one redacted error notification each, every command resolved |
| ERR-8 | E M | finding | `extractCsv.ts` 148 and 225 reported only an `instanceof Error`, so a thrown string vanished (fixed in `51ed888`/`59ca8fe`); `guard.ts` and `transport.ts` read `error instanceof Error ? error.message : String(error)` |
| ERR-9 | E C | pass | `grep console\.` in `src` → none. Scan shortfalls reach the report: too large, not text, could not be read (new), file limit, results limit, ignored. Crate: binary files counted on stderr, unreadable files as `skipped` diagnostics |
| ERR-10 | E | finding | Direct `show*Message` at baseline: `postProcessHelper.ts` three errors and `prompts.ts` one warning bypassed the notifier, so `notificationsLevel` did not govern them; both through the notifier since `00130cb`. The two modal dialogs and the rating prompt's toast are the documented bypasses |
| ERR-11 | E | pass | A dismissed file-type pick, column pick, sort pick, input box and large-output dialog each stop quietly (`commands.test.ts`, `ui.test.ts`, `largeOutput.test.ts`) |
| ERR-12 | E | finding | Hooks at baseline: `_setOpenDocumentError`, `_setEditResult`, `_setEditError`, a missing path for `fs.stat`/`fs.readFile`, `_cancelAfterProgress`. Added by this pass: disposal tracking for status bar items and output channels, `_setLmApi`, `_mcpProviders`, `_live()`, `asAbsolutePath`, the manifest version read from `package.json`. Still without a failure hook: `showTextDocument`, `withProgress`, `executeCommand`, `openExternal`; observation |
| ERR-13 | E | finding | `commands.test.ts` "help opens a markdown document describing real commands only" asserted that the page named no language, which pinned the omission (`string-le-errors-7`); `ui.test.ts` pinned the untranslated wording of an advisory and the direct routing of the out-of-range warning, both updated with the fixes |
| ERR-14 | M | finding | Driven with fifteen protocol-level frames (`probe/protocol.js`): the crate exited 2 on an invalid UTF-8 line and never answered the ping after it, dropped a non-JSON line and a request without a method without a word, answered a request lacking `jsonrpc` or carrying `1.0`, and answered a null-id request (`string-le-errors-8`); neither server refused a 64 MiB frame (`string-le-leaks-1`). After both fixes the fifteen frames answer identically from both servers. Nothing on stdout but protocol lines |
| ERR-15 | C | pass | `expect(...)` only on constant patterns and test scaffolding; `hazards.rs` asserts exit 0, 1 or 2 over its whole tree; the deep documents above are answered without a panic |
| ERR-16 | C | pass | `hazards.rs` and `scenarios.rs` cover an unreadable file, a FIFO, a directory named like a file, a long path; an unreadable file is named with the OS error |
| ERR-17 | N E | finding | `grep -rnE '\|\| true\|continue-on-error\|2>/dev/null' scripts .github/workflows`: `release-crate.yml` 95–99 silenced the registry probe's parse failure into "unpublished — safe to release" (`string-le-errors-6`); `ci-crate.yml` 188's `\|\| true` keeps a no-match grep alive and fails on any hit; `release.yml` counts VSIX files and fails unless exactly one. No `continue-on-error`; every `spawnSync` in `scripts/` checks `status` |
| ERR-18 | E | pass | Extract runs inside `withProgress`, which the host closes on every exit; the status bar flash is a timer that restores the idle text, and a flash after dispose no longer schedules one (`string-le-leaks-2`). No busy flag |

## Step 5: Memory leaks

Re-read for this step: `src/extension.ts`, every INV-5 file, every command and provider file, `mcp/transport.ts`, `mcp/server.ts`; crate `walk.rs`, `scan.rs`, `mcp/mod.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | INV-5: every disposable VS Code returns is pushed to `context.subscriptions` at creation; none is created per command run (`lifecycle.test.ts` "repeated runs do not grow") |
| LEAK-2 | E | pass | One `onDidChangeConfiguration` listener, pushed to subscriptions; `_live().configListeners` is 1 after fifty runs and 0 after deactivation |
| LEAK-3 | E M | finding | One `setTimeout` (`statusBar.ts` flash restore), cleared by the next flash and on dispose; a flash after dispose set a new one against the disposed item (`string-le-leaks-2`, guarded, held by `lifecycle.test.ts` "a flash after dispose schedules nothing") |
| LEAK-4 | E | pass | Nothing is created lazily and held: results and help open as documents the host owns |
| LEAK-5 | E | finding | No test called a `dispose` twice or checked what it released (`string-le-leaks-2`); `lifecycle.test.ts` "dispose is complete and safe to repeat" does, for the status bar and the channel |
| LEAK-6 | E | finding | No deactivation test (`string-le-leaks-2`). The mock tracks disposal; `lifecycle.test.ts` activates with agent mode's API present, runs all eight commands, disposes every subscription and asserts `_live()` is all zero |
| LEAK-7 | all | finding | `transport.ts` `buffer`: no maximum (`string-le-leaks-1`, fixed at 16 MiB on both servers). No caches. Crate: no statics but a test counter |
| LEAK-8 | E | pass | Long-lived closures hold the status bar item, the channel and the config; no document text or report outlives its command (read) |
| LEAK-9 | E | pass | The extension spawns nothing; the MCP server is spawned by the editor from the definition the provider returns |
| LEAK-10 | E | finding | No repeated-run test (`string-le-leaks-2`); `lifecycle.test.ts` "fifty extractions, fifty help commands" holds `_live()` equal after one and after fifty |
| LEAK-11 | M C | finding | `string-le-leaks-1`: the npm buffer had no maximum and the crate held a frame whole until its newline. Fixed: `MAX_FRAME_BYTES` 16 MiB on both, one parse error in the same words past it, the rest of the line dropped as it arrives, and the limit applied to a complete line too, since the newline can arrive in the chunk that takes the frame over |
| LEAK-12 | M | finding | Driven, built npm server, 3,000 `tools/call` over one session (a 200-string TypeScript document each): RSS 110 MB after 500, 164 after 1,000, 207 after 1,500, 247 after 2,000, 2,500 and 3,000 at baseline; 260 MB flat from 500 to 3,000 at close. Crate: 4 MB throughout. Newline-free input before the fix: npm 347 MB at 16 MiB, 980 at 32 MiB, 467 settled at 64 MiB, no output; crate 68 MB at 64 MiB, no output. After: npm 394–416 MB and one refusal line (V8 keeps the pages; the live set is bounded), crate 21 MB and one refusal line. The repo had no driver: `scripts/check-mcp-memory.js`, `bun run check:mcp-memory`, since `7c4e78a` |
| LEAK-13 | M | pass | Driven: stdin closed with nothing written → exit 0, no output; stdin closed mid-request → exit 0, no output, both servers |
| LEAK-14 | C | pass | `hazards.rs` 1 MB line and 100,000 lines; `budget.rs` 500 files inside 400 ms and a 6× linearity bound (gate `c-budget`); `walk.rs` yields files one at a time (read) |
| LEAK-15 | C | pass | `hazards.rs` and `scenarios.rs` (read; 9 and 3 cases); no gate run hung |
| LEAK-16 | C | pass | Reads are scoped `std::fs::read`; no temporary files in `src/`; every test tree removes itself in `Drop` |
| LEAK-17 | tests | pass | `bunx vitest run --pool=threads` three times and once with `--sequence.shuffle`: 473/473 each at close (424/424 at baseline). Real timers in tests: `mcp.test.ts` `settle()` (20 ms) and `rating/wiring.test.ts` (20 ms), both passed in every run; every fake-timer test restores real timers in `finally` |

## Step 6: Race conditions

Re-read for this step: every INV-6 file, `src/extension.ts`, `mcp/transport.ts`; crate `walk.rs`, `scan.rs`, `mcp/mod.rs`, `testing.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | finding | INV-6 rows: results never written back into the source document; the toggle's read-then-write (RACE-3); `scan.ts` listing-then-read (`string-le-errors-3`); the delivered-or-not flag read after the open (`string-le-errors-1`); `transport.ts` carries its id |
| RACE-2 | E | pass | No command writes text it read earlier back over the document: extract opens a new document; dedupe and sort in place read the lines and replace the full range with the only suspension being the edit itself (`sort.ts` reads after the quick pick). Held by `races.test.ts` "dedupe and sort in place: both edits land, each computed from the text it read" |
| RACE-3 | E | finding | No command had a concurrent-invocation test (`string-le-races-1`). Policy read from the code: every run is independent; the status bar is shared and the later run resets it. `races.test.ts` drives extract twice, a workspace scan beside a folder scan, dedupe beside sort, help beside settings; `commands.test.ts` presses the toggle twice at once and states what the mock can and cannot show |
| RACE-4 | E | pass | `transport.ts` `buffer` is read and written inside one synchronous `data` handler; the only read-then-write of shared state is the toggle, above |
| RACE-5 | E | pass | The rating ask is written before the toast (`ratingPrompt.test.ts`, family file) |
| RACE-6 | E | pass | `scanFiles` checks the token before every file (`scan.test.ts`); a cancelled scan delivers nothing |
| RACE-7 | E | pass | `readConfig()` once at the start of each command; `notifier` reads the level per message, deliberately |
| RACE-8 | E | pass | A flash after dispose is ignored (`string-le-leaks-2`); telemetry after dispose cannot occur because every emitting command is disposed first (`lifecycle.test.ts`) |
| RACE-9 | E | pass | `activate` is synchronous: telemetry, notifier, status bar, commands, code actions, settings, provider, one event |
| RACE-10 | E M | finding | The length sorts broke ties by the host's locale (`string-le-bugs-8`); the alphabetical modes and the report were already deterministic. Four unit runs byte-identical at close |
| RACE-11 | E C | finding | `string-le-errors-3` (fixed): a file gone between listing and read is counted as unreadable and named so. Crate: named with the OS error |
| RACE-12 | M C | pass | Driven against both built servers: one `tools/call` holding `café` and `naïve 🎯`, split at every one of its 163 byte offsets including inside the multi-byte characters: 163 of 163 parsed exactly once with the right answer, on both. `mcp.test.ts` holds one split and two-in-one-chunk in the harness; the crate's loop is driven in 8 KiB chunks by its unit tests |
| RACE-13 | M | pass | Handlers are pure functions over the arguments; `mcp.test.ts` "handles several requests in one chunk" answers ids in order; no module-level value is written by a handler |
| RACE-14 | M C | pass | Driven: stdin closed after a partial request → exit 0, nothing written, both servers |
| RACE-15 | C | pass | `grep -rnE 'rayon\|thread::\|tokio\|async fn\|Mutex\|RwLock\|Arc<\|static mut\|Atomic' crate/src` → only `testing.rs` 15, 17: an `AtomicUsize` counter for unique test directories |
| RACE-16 | C | pass | `platform.rs`: TZ set and unset produce one report; gates `c-platform`, `c-test-tz`, `c-test-notz` |
| RACE-17 | tests | pass | Three runs and a shuffled run: identical counts, no failure. No gate from BASE-5 failed once and then passed. The two real timers are the 20 ms `settle()` helpers |

## Step 7: Translations

Read for this step: `package.json`, `package.nls.json`, the 12 `src/i18n/package.nls.*.json`, `l10n/bundle.l10n.json`, the 12 `l10n/bundle.l10n.*.json` (every value), `test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n` scripts, every INV-8 file.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | `diff <(grep -oE '%[^%" ]+%' package.json …) <(jq -r 'keys[]' package.nls.json …)` → empty |
| L10N-2 | E | pass | Key parity loop over both mechanisms → no `DRIFT`; held by `test/integration/l10n.test.ts` and now `src/l10n.test.ts` |
| L10N-3 | E | pass | 12 locales in both mechanisms: de, es, fr, id, it, ja, ko, pt-br, ru, uk, vi, zh-cn; `bun run check:locales ../` at close |
| L10N-4 | E | pass, gate added | Script over every `l10n.t(` first argument at baseline: 53 distinct strings, 53 bundle keys, 0 missing, 0 dead. Nothing held it: `string-le-translations-2` adds `src/l10n.test.ts` |
| L10N-5 | E | finding | INV-8 classified: 26 strings never went through `l10n.t()`, at 16 call sites handing a literal straight to a notification, a flash, a dialog or a button (`string-le-translations-1`, fixed, with a gate rule). Never-translate, with reasons: the codicon text `$(quote) String-LE`; the output channel name `String-LE`; `String-LE` passed as `{0}` to the report title; the format names `JSON`, `YAML`, `CSV`, `TOML`, `INI`, `.env` in the file-type pick; the report's markdown structure; MCP, CLI and JSON-RPC text (machine-read); the help document's body (carried) |
| L10N-6 | E | pass | Every call site read: all inside a function body; `sort.ts` builds its labels per call and says why. `src/l10n.test.ts` refuses a top-level `const`/`let` that calls `l10n.t(` |
| L10N-7 | E | pass | Every key is a string literal; `src/l10n.test.ts` "every call hands l10n.t() a string literal" |
| L10N-8 | E | pass | VSIX listing: 13 `package.nls*.json`, 12 `l10n/bundle.l10n.*.json`; the English source bundle is deliberately not shipped. `ls package.nls*.json` at the root after `package` → only `package.nls.json` |
| L10N-9 | E | finding | At baseline no test showed a translated string in a non-English host; `test/integration/l10n.test.ts` says why the harness cannot call `vscode.l10n` itself. Fixed as `string-le-translations-4`: a warm-up launch installs and registers the German pack, a third launch runs in German, scans a folder and reads the German report the extension wrote; all three launches green on the first run, here and in CI |
| L10N-10 | E | pass | Placeholder loop → empty; held by both l10n tests |
| L10N-11 | E | pass | Runtime: fr `Occurrences`, id and pt-br `String`. Manifest: `manifest.command.category` and `manifest.settings.title` = `String-LE` in all 12. Nothing else identical |
| L10N-12 | E | pass | `String-LE`, `.gitignore`, `UTF-8`, `CSV`, `node_modules`, `**/fixtures/**` appear in every locale as in English; no codicon or URL in the bundles |
| L10N-13 | E | finding | Every value read in its place. Wrong: "Extraction" treated as a product name in the untrusted-workspace note in eight locales; ko "No active editor" with the word for a human editor, zh-cn "no user editing"; ja "expired" and ru "lost legal force" for "no longer valid"; ru telemetry "local network only"; de "Extract from all columns" as a noun; es "Dedupe/sort applied" as "classification" (`string-le-translations-3`, corrected) |
| L10N-14 | E | finding | uk "No strings found" was written in Russian ("Строк не знайдено") beside the Ukrainian wording of its sibling (`string-le-translations-3`); nothing else foreign; `check:locales` green at close |
| L10N-15 | E | pass | `{0} file(s)` forms: ru and uk use the colon form, de "Datei(en)", ja/ko/zh-cn count words; the 27 new strings follow the same shapes |
| L10N-16 | E | finding | pt-br used three words for string (sequências, cadeias, strings) across the manifest and the bundle; id, ru and uk mixed noun and verb forms across the command titles; the Z-to-A option was worded unlike A-to-Z in it, ko, pt-br, ru; fr and vi named CSV streaming two ways (`string-le-translations-3`, unified) |
| L10N-17 | E | pass | `grep -rnE "\.label ===\|=== '[A-Z][a-z]+"` → the CSV pick compares against the same translated `allLabel` it was built from; the dialogs compare a button against the translated value it was built from (since `00130cb`); the sort pick by the labels built per call |
| L10N-18 | E M C | pass | The markdown report and the help document are for a person; MCP envelopes, diagnostics and CLI JSON Lines are machine-read and English only. Clipboard copies carry the same text as the screen |
| L10N-19 | C M | pass | `grep -rn 'l10n\|gettext\|locale' crate/src` → none; the npm server imports no `vscode` and no catalogue (`check-mcp-bundle.js`). Neither surface produces localized text |

## Findings

Every fix is one commit on `fix/fleet-pass`, named by its finding id in the commit body. "Failed without fix" is the test's output with the fix absent, taken before the fix was written; the logs are in the pass's scratch `fail/` directory and the decisive line is quoted.

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| string-le-bugs-1 | bugs | `mcp/fileType.ts` held `ALIASES` as an object literal and `extraction/extract.ts` its `EXTRACTORS` table, so `constructor` and `__proto__` were hits: the npm server answered `isError` "e.trim is not a function" for a format the crate read as `fallback`, and the engine called `Object` on the document and handed it back whole | `format: "constructor"`, `filename: "__proto__"`, `filename: "a.constructor"` through both built servers (`probe/drive.js`) | `9ff262a` | `mcp.test.ts` "does not read a prototype key as a format", "answers a prototype-named format the way the crate does"; `extract.test.ts` "reads a prototype name as an unknown type, not as an extractor"; corpus case on both servers | `AssertionError: constructor: expected [Function Object] to be 'fallback'`; `expected 'foo "bar" baz' to deeply equal [ 'bar' ]` |
| string-le-bugs-2 | bugs | `resolveFormat` read `.env.local` by the text after its last dot and fell to the quoted-run scan, so a folder scan and the MCP `filename` missed an unquoted value the `.env` beside it read; a path-shaped filename lost a dotfile's name to its directory on both sides | `.env.local` with `NAME=plain value` through both servers: npm `fallback`, nothing; crate `env`, the value. `config/.env.local` on both: nothing | `e1fa466` | `mcp.test.ts` "reads every dotenv spelling as dotenv, and only those", "resolves a path by its last segment"; `extractWorkspace.test.ts` "reads a .env.local file as dotenv"; `format.rs` `a_path_resolves_by_its_last_segment`; two corpus cases | `.env.local: expected 'fallback' to be 'env'`; the report held "No strings found." where `\| \`plain value\` \| 1 \| 1 \|` was expected |
| string-le-bugs-3 | bugs | `dotenv.rs` `unquote` required two characters before stripping, so `A="` yielded `"` as a value; the extension yields nothing | `A="` and `A='` through both servers | `ed0bea2` | `dotenv.rs` `a_lone_quote_is_not_a_value`; corpus document `whitespace.env` gained the line | `thread 'extract::dotenv::tests::a_lone_quote_is_not_a_value' panicked`; corpus: `left: [..., "one", "two"] right: [..., "two"]` |
| string-le-bugs-4 | bugs | rust-ini kept every value of a repeated key; the `ini` package keeps the last, in the slot the key first appeared | `[a]\nk=1\nk=2` through both servers: crate `["1","2"]`, npm `["2"]` | `6b483bc` | `ini.rs` `a_repeated_key_keeps_its_last_value_where_it_first_appeared`; `strings.ini` corpus document and golden; SPEC.md rule | `left: ["first", "mid", "last"] right: ["last", "mid"]` |
| string-le-bugs-5 | bugs | A JSONC document that is all comment stripped to whitespace and `JSON.parse` refused it; the crate read it as empty | `// only a comment` as `jsonc` through both servers: npm `ok: false` "Unexpected end of JSON input", crate `ok: true` | `1f63abe`, corpus in `8799200` | `extract.test.ts` "reads a jsonc document holding only comments as empty, not broken"; corpus case on both servers | `expected [ …(2) ] to deeply equal []` (two parse errors); parity: `mcp extract "a jsonc document that is all comment is empty, not broken"` mismatched |
| string-le-bugs-6 | bugs | `maxResults: 1e21` is an integer to `Number.isInteger` and the npm server clamps it; `serde_json` hands the crate a float `as_u64` refuses | `maxResults: 1e21` through both servers | `e0c5192` (clippy lint folded in before push), corpus in `8799200` | `mcp/extract.rs` `a_cap_too_large_for_an_integer_is_clamped`; corpus case on both servers | `clamped: "maxResults must be a positive integer"` |
| string-le-bugs-7 | bugs | `config.ts` `readNumber` coerced with `Number(...)`: `''` and `null` read as 0 and were clamped to the floor, so the size guard became 1,000 bytes and the file limit 1 | `_setConfig('string-le.safety.fileSizeWarnBytes', '')` | `0f22268` | `readConfig.test.ts` "falls back to the default when the stored value is not a number" | `AssertionError: expected 1000 to be 1000000` |
| string-le-bugs-8 | bugs | The two length sorts broke a tie with a bare `localeCompare`, host-locale dependent, where the alphabetical modes use a collator pinned to `en` | `text.test.ts` | `962175b` | `text.test.ts` "breaks a length tie the same way on every machine" | `expected [ 'a', 'A', 'b', 'B', 'aa', 'bb' ] to deeply equal [ 'A', 'B', 'a', 'b', 'aa', 'bb' ]` (the first expectation; the pinned order follows the collator, then code unit) |
| string-le-bugs-9 | bugs | `editorLines.ts` split a document ending in a newline into an empty last line, and Sort ordered that empty string first: the sorted document began with a blank line and lost its terminator | the first assertion on what the in-place sort writes (`string-le-features-2`) | `dae86eb` | `editorLines.test.ts` (five tests); `postProcessHelper.test.ts` "sorts in place when configured" | `expected [ '\n"alpha"\n"beta"\n"beta"' ] to deeply equal [ '"alpha"\n"beta"\n"beta"\n' ]` |
| string-le-bugs-10 | bugs | Three documents divide the parsers inside formats where both refuse the ordinary broken document: js-yaml refuses a duplicated key saphyr reads; `@iarna/toml` refuses a mixed array the crate reads; `JSON.parse` reads a lone surrogate serde refuses. SPEC.md recorded only INI and the differential pinned only that, per format | `a: 1\na: "two"`, `a = ["x", 1]`, `{"a": "\ud800"}` through both servers (`probe/drive.js` cases 39, 40, 42) | `293ec08` | `check-differential.ts` `checkDivergencesHold` over the three pinned documents; SPEC.md "How strict a parser is" | test-gap: `drive-baseline.log` `[39] yaml dup key *** DISAGREE ***`, `[40] toml mixed array *** DISAGREE ***`, `[42] json lone surrogate *** DISAGREE ***`, with no record anywhere |
| string-le-bugs-11 | bugs | The parsers' depth limits differed between the sides: `JSON.parse` and `@iarna/toml` read thousands of levels and `collect.ts` stopped at 1,000 without a word, so the extension answered `ok: true` with the strings above the cut where jsonc-parser refused past 512 and the `toml` crate past 80; js-yaml refused past 98 levels of flow nesting where saphyr read 255 | `probe/depth.js`: a binary search per format on each built server for the first refusing depth | `495b64e` | `formats/nesting.ts` and `nesting.rs` (one scanner, two languages) with `nesting.test.ts`; `json.test.ts` and `parsers.test.ts` "refuses a document nested deeper than the bound, and reads one at the bound" per format and JSONC on the raw text; crate `a_document_nested_deeper_than_the_bound_is_refused` in `json.rs`, `toml.rs`, `yaml.rs`; four corpus cases on both servers; SPEC.md "Nesting limits, held equal" | `expected [ 'x' ] to deeply equal []` (513-deep JSON read on the extension); crate `left: Some("Invalid JSON: Maximum nesting depth exceeded on line 1 column 513") right: Some("Invalid JSON: nested deeper than 512 levels")`. After: both servers first refuse at 513, 81 and 99 with the shared message and read at 512, 80 and 98 |
| string-le-errors-1 | errors | `processAndOutputResults` reported a failed `openTextDocument` and then flashed "Extracted N", wrote the `extracted` event and counted a rating use; `openDoc` recorded the intent, not the outcome | `_setOpenDocumentError` in the mock | `51ed888` | `extract.test.ts` "does not announce a count when the results document could not be opened" | `expected [ 'flash:Extracted 2' ] to deeply equal []` |
| string-le-errors-2 | errors | `handleCsvMultiColumnExtraction` flashed "CSV opened (no auto-copy)", wrote the event and showed the no-copy note after every column document failed to open; the helpers returned nothing a caller could read | three columns with `_setOpenDocumentError` | `59ca8fe` | `extract.test.ts` "does not announce \"CSV opened\" when no column document could be opened" | `expected [ 'flash:CSV opened (no auto‑copy)' ] to deeply equal []` |
| string-le-errors-3 | errors | `scan.ts` counted a file whose `stat` or `readFile` threw as `notText`, and the report said it "is not UTF-8 text" | a listed `Uri` with no file behind it | `38a521f` | `scan.test.ts` "counts a file that could not be read apart from one that is not text"; `unreadNotes` "has a line for each thing left unread"; new string in 13 bundles | `expected { read: 1, tooLarge: +0, …(3) } to deeply equal { …(4) }` |
| string-le-errors-4 | errors | No command body had an outer handler: a rejection from `openTextDocument` or the file-type picker escaped as an unhandled rejection in the editor's words, home directory included; the extract command's catch labelled a rejected picker "Document is no longer valid" | `_setOpenDocumentError` for the scan and help commands; a throwing quick-pick responder for extract | `d1ee21b` | `extract.test.ts` "is reported once, in its own words, and the command resolves"; `extractWorkspace.test.ts` "reports a failure inside the command instead of rejecting"; `commands.test.ts` "help: a failure inside the command is reported"; `commands/guard.ts`; new string in 13 bundles | `promise rejected "Error: disk full at /Users/someone/out" instead of resolving`; `promise rejected "Error: no window"`; `expected 'Document is no longer valid' to contain 'the picker went away'` |
| string-le-errors-5 | errors | The large-file warning printed `config.fileSizeWarnBytes`, not the file's size, through a template literal no locale could translate | a 2,500-byte file with the threshold at 1,000 | `9ffef43` | `extract.test.ts` "names the size of the file, not the threshold", "is not shown for a file under the threshold"; new string in 13 bundles | `expected 'Large file detected (1000 bytes). Ext…' to contain '2500'` |
| string-le-errors-6 | errors | `release-crate.yml`: the crates.io probe silenced its parse (`2>/dev/null`) and turned a failed request into `{}`, so an HTML error page, a non-list JSON body and a failed request all read "unpublished — safe to release" | the step's own text with five fixed bodies (`probe/crates-probe.sh`) | `93a2595` | driven: HTML page, non-list JSON, listed, absent, never-published | before: HTML and non-list bodies exit 0 "0.4.2 is unpublished — safe to release"; after: both exit 1 "did not answer with a version list", the listed version exit 1, the other two proceed |
| string-le-errors-7 | errors | The help page said YAML, TOML and INI were read by the quoted scan and named no source language, no JSONC, no TSV, no positions, no folder scan; `commands.test.ts` asserted the page named no language | `commands.test.ts` | `ed2060a` | `commands.test.ts` "help opens a markdown document describing what the extension does" (every format and language held to the engine) | `JSONC: expected '# String-LE Help & Troubleshooting…' to contain 'JSONC'` |
| string-le-errors-8 | errors | `mcp/mod.rs` read stdin through `lines()` and exited 2 on an invalid UTF-8 line; dropped a non-JSON line and a request without a method silently; answered a request lacking `jsonrpc: "2.0"`; answered a null-id request; worded three refusals unlike the npm server | fifteen protocol frames through both servers (`probe/protocol.js`) | `b552bac` | `mod.rs` unit tests driving `serve_streams` with bytes: `an_invalid_utf8_line_does_not_end_the_server`, `an_invalid_byte_inside_a_string_is_replaced…`, `a_line_that_is_not_json_is_answered…`, `a_line_that_is_not_a_request_is_answered…`, `blank_lines_and_a_partial_frame_at_close_are_ignored`, `protocol_refusals_use_the_npm_servers_words` | `protocol-baseline.log`: `invalid utf-8 line then ping *** differs *** crate: exit 2 out=""`; `non-json line then ping *** differs ***` (dropped). After: 0 differs |
| string-le-leaks-1 | memory-leaks | Neither server capped a frame: 64 MiB with no newline held the npm server at 980 MB and the crate grew by 64 MB, no output from either | `probe/memory.js` 64 | `7c4e78a` | `mcp.test.ts` "refuses a frame over the limit and keeps serving", "…whose newline arrives in the same chunk"; `mod.rs` `a_frame_over_the_limit_is_refused_and_the_next_line_served`, `a_frame_at_the_limit_is_served`; `scripts/check-mcp-memory.js` | npm: `expected [ …(2) ] to deeply equal [ …(2) ]` ("Invalid JSON" where the frame refusal was expected); crate first cap: `left: … "Invalid JSON" right: … "Message exceeds the 16777216 byte frame limit"` (the newline arrived in the overflow chunk; the limit is now applied to the complete line too). RSS before/after under LEAK-12 |
| string-le-leaks-2 | memory-leaks | `flashStatusBar` wrote to the item and set a two-second timer after dispose; nothing counted what the extension keeps alive, the mock's items and channels had no-op `dispose` and no `vscode.lm` | `lifecycle.test.ts` | `a5ebdf3` | `lifecycle.test.ts` (five tests); mock disposal tracking, `_setLmApi`, `_live()` | `expected 1 to be +0` (a timer scheduled after dispose) |
| string-le-races-1 | race-conditions | No test started a command while another run of it was suspended | test-gap | `3b5f941` | `races.test.ts` (four tests); `commands.test.ts` "toggleStreaming: two presses at once are two toggles" | test-gap; the built servers were also driven at every one of 163 byte offsets, 163 correct each |
| string-le-features-1 | broken-features | The two status bar tests advanced a fake clock and asserted only that the context had subscriptions | test-gap | `e2aa6ea` | `ui.test.ts` five status bar tests reading the item's text and visibility | test-gap: `expect(context.subscriptions.length).toBeGreaterThan(0)` was the whole assertion |
| string-le-features-2 | broken-features | The in-place post-process tests ended with `expect(_shownMessages().length + 1).toBeGreaterThan(0)` | test-gap | `d7912a0` | `postProcessHelper.test.ts` two in-place tests asserting the replaced text and three failure tests | test-gap: the assertion was true of every outcome; the first real assertion found `string-le-bugs-9` |
| string-le-features-3 | broken-features | An INI test titled "reports a parse failure through onParseError" fed a document the `ini` package reads without a word and asserted only that an array came back | test-gap | `24e9379` | `parsers.test.ts` "refuses nothing: the documents other parsers reject are read, and onParseError is never called" | test-gap: `expect(Array.isArray(result)).toBe(true)`; the parser returned `["1","2","3"]` and no error for the "failing" document |
| string-le-features-4 | broken-features | The MCP provider's registration ran in no test; the mock had no `vscode.lm` | test-gap | `197ae70` | `provider.test.ts` "registers the bundled server with a host that has the API", "says nothing in a host without the API" | test-gap: `provider.ts` 37.5% lines at baseline, the registration branch unreached |
| string-le-features-5 | broken-features | The README says `check:mcp-bundle` fails the build on an import that could reach the filesystem or the network; the gate refused only a non-builtin | the gate against a copy of the bundle with `require("node:fs")` appended | `c7259e0` | the gate, driven both ways | old gate: `OK: dist/mcp-server.js is self-contained, 134 KB, and answered 1 tool(s) over stdio.` with `node:fs` required; new gate: `✗ the MCP bundle can reach the filesystem, the network or another process — requires: node:fs` |
| string-le-features-6 | broken-features | `characterization.test.ts`'s header said YAML, TOML and INI route to the fallback so unquoted values are missed | read | `b54a440` | the header | documentation |
| string-le-features-7 | broken-features | `crate/src/extract/mod.rs` opened with "The extension is the reference implementation" and "a difference is a regression", the sentence the crate's policy job refuses; the job grepped only Markdown, and `src/extraction/formats/source.ts` carried a second copy | the widened grep | `b5c1040` | `ci-crate.yml` policy grep over `*.md`, `*.rs`, `*.ts` | the widened grep hit `crate/src/extract/mod.rs:8` and `src/extraction/formats/source.ts:23` |
| string-le-translations-1 | translations | 26 runtime strings never went through `l10n.t()`: the status bar flashes, three advisories, the CSV column picker's labels and warning, the large-output dialog with notes and buttons, the many-documents dialog, three post-process errors, two streaming warnings, the per-column failure, the streaming suffix; four of them also bypassed the notifier | `probe/untranslated.mjs`; the new gate rule | `00130cb` | `src/l10n.test.ts` "hands no literal to the notifier, the status bar, a prompt or a dialog"; 26 keys in 13 bundles | the rule red on 16 sites: `extract.ts:159`, `extractCsv.ts:64, 100, 156, 272, 328`, `postProcessHelper.ts:90, 96, 103`, `largeOutput.ts:25, 39, 41`, `notifier.ts:36, 43, 50`, `prompts.ts:105` |
| string-le-translations-2 | translations | Nothing held the runtime bundle to the strings the code passes to `l10n.t()` | test-gap | `7e85956` | `src/l10n.test.ts` (six tests: both directions, literal keys, no module scope, twelve locales) | test-gap: 53 keys, none missing, none dead at baseline |
| string-le-translations-3 | translations | Catalogue values in parity and wrong: "Extraction" as a product name in eight locales; ko human editor, zh-cn "no user editing"; ja "expired", ru "lost legal force"; ru "local network only"; uk in Russian; pt-br three words for string; id, ru, uk mixed verb forms; Z-to-A worded unlike A-to-Z in four locales; fr and vi two names for streaming; de noun for a verb; es "classification" | every value read in its place | `e6f9678` | the corrected catalogues, key parity held by both l10n tests | semantic: no mechanical check can catch this class |
| string-le-features-8 | broken-features | `ui/ratingPrompt.ts` told the registries apart by the publisher in the installed id, keying Open VSX on `OffensiveEdge`; both registries list the extension under `nolindnaidoo`, so every Rate click opened the Marketplace review page and the Open VSX branch was unreachable; the AGENTS invariant described the same non-existent build | `curl https://open-vsx.org/api/nolindnaidoo/string-le` → 2.5.0; `…/offensiveedge/string-le` → "Extension not found" | `2ed9747` | `ratingPrompt.test.ts` "sends %s in %s to the registry it was installed from" (five hosts), "never asks a build with no listing: offensiveedge.example-le", "reads the host from the environment"; mock `env.appName` and `_setAppName` | `× sends nolindnaidoo.example-le in Cursor to the registry it was installed from` (Marketplace page where the Open VSX page was expected); `× never asks a build with no listing: offensiveedge.example-le` ("showInformationMessage" called once) |
| string-le-translations-4 | translations | No test showed a translated string in a non-English host | L10N-9 | `b2cc03a` | `test/locale/german-host.test.ts` "runs in German", "shows the runtime half in German: the workspace report", under the `german host` config; `test/locale-setup/german-pack.test.ts` under the warm-up config that launches first | test-gap; applied from the start with the warm-up launch the previous pass found necessary, so all three launches passed on their first run here and in CI (macOS, Ubuntu, Windows) |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| BUG-15, FEAT-12, fixed | The nesting divergence was carried at the first close and fixed on the owner's decision (`string-le-bugs-11`) | Done |
| INV-10, fixed | The README's generated Testing section ended "CI fails if this section drifts"; the coverage gate was dropped in `c5f12aa` and the sentence came from the fleet-shared `scripts/coverage-readme.js`. Fixed in the shared script and regenerated in all sixteen repos by the fleet sweep of 2026-10-30, after urls-le's pass carried it a second time | Done |
| INV-10, fixed | `ui/ratingPrompt.ts` keyed the Open VSX review page on publisher `offensiveedge` (`string-le-features-8`, fixed after the first close on the owner's decision: the host decides). The file is family-wide and held by hand | Copy the family file to the sibling repos as its own change |
| FEAT-4 | Menus and code actions cover seven of the twenty-one language ids the engine reads | A product decision |
| L10N-5 | The help document's body is English in every locale | A product decision: translate the page or state that it is English |
| ERR-14 | `initialize` echoes the client's requested protocol version on the npm server and always answers `2025-06-18` on the crate | A protocol decision; neither is the shared tool |
| RACE-3 | Two presses of the CSV streaming toggle before the first write lands may both read the old value on a real host; under the mock an update is visible to the next read at once | A host test with a slow `update`, or serialising the toggle |
| FEAT-4, FEAT-9 | Menus and 19 of 20 activation events were read, not driven | A real display, or a host test opening one document per language id |
| L10N-9 | The manifest half, the command titles, is shown by no test: the host does not localize the manifest of an extension loaded from a development path | A `--locale=de` run of the installed-VSIX test that reads a command title |
| BASE-5 | `cargo audit` not run locally; CI's `audit` job passed on the pull request | Install `cargo-audit` locally, or leave it to CI |
| CLOSE-5 | `letools-site` `check:registry` is red: "Run `bun run sync:registry` and commit the result"; the generated registry lags the crate versions of several repos, none changed by this pass | `sync:registry` after the release, as its own change |

Observations that are not findings: `showTextDocument`, `withProgress`, `executeCommand` and `openExternal` have no failure hook in the mock; `extract.ts` and `extractCsv.ts` each warn about dedupe under streaming from the same string in two places; the `zed/` directory holds only an ignored build tree.

## Step 8: Close

Read for this step: `git diff main...HEAD` in full, this record, `CHANGELOG.md`, `AGENTS.md`, `README.md`, `crate/CHANGELOG.md`, `crate/AGENTS.md`, `crate/SPEC.md`.

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | Every check in steps 0 to 7 has an answer above; the `unknown`-class items are in "Carried and unknown" and in the pull request |
| CLOSE-2 | pass | 34 findings fixed, each with its commit and test in the findings table; one defect candidate carried to a fleet change (the README sentence from a fleet-shared script) and the rest recorded as observations by the owner's decision. The nesting divergence and the Open VSX namespace were carried at the first close and fixed on the owner's decision in `495b64e` and `2ed9747` |
| CLOSE-3 | pass | The "Failed without fix" column quotes each test's output with the fix absent; logs under the pass's scratch `fail/` directory. Test-gap findings say so in that column |
| CLOSE-4 | pass | Every BASE-4 gate rerun on the release head `ddc06bc` (and on `cb2530f` and `dafa793` before it): 14 extension, MCP and npm gates, 21 crate gates, the integration suite and the installed VSIX, all exit 0. 486 unit tests in 40 files; integration 11 + 1 + 2; `string-le-2.5.0.vsix` PASS; versions 2.5.0 in all three files; `lint:commits` 39 conform; the version gate reads 2.5.1 in all three files; crate 251 unit tests, scenarios, hazards, platform, TZ runs, coverage matrix, fuzz 20 s × 4, budget 37.8 ms under 400 ms, llvm-cov floor met, parity, differential (600), definition. `cargo audit` not run here. One lapse during the pass: the chain that committed `string-le-bugs-4` to `-6` joined its gates and its commits as separate statements, so a red clippy (`single_match_else` in `mcp/extract.rs`) did not stop the commits; found when the next crate gate ran, fixed and folded into `e0c5192` with `--autosquash` before anything was pushed. Every later chain joins gate and commit with `&&` |
| CLOSE-5 | finding, outside the pass | From `letools-site` with the repos beside it: `check:fleet ../` → 27 shared files consistent across 16 extension repos; `check:locales ../` → every translated string in its own language; `check:doc-paths ../` → 792 references across 17 repos resolve. `check:registry` → red, "Run `bun run sync:registry` and commit the result", the generated registry lagging crate versions this pass did not change. The release commits move string-le to extension 2.5.1 and crate 0.4.3, so `sync:registry` follows the publish |
| CLOSE-6 | pass | `CHANGELOG.md` `## [2.5.1] - 2026-10-13`: one entry framed as a bug fix and hardening pass, one line per behaviour change (closed under its version in `9586dc4`); `crate/CHANGELOG.md` `## [0.4.3] - 2026-10-13` is the crate's half, with its crates.io footer link (closed in `ddc06bc`). No heading reads Unreleased. `AGENTS.md` Invariants: one entry per fixed class that could recur, naming its test; `crate/AGENTS.md` for the stdio loop and the frame cap; `crate/SPEC.md` for the INI rule and the three parser tolerances. `README.md` coverage section regenerated by `scripts/coverage-readme.js` from the final run (`dafa793`); `coverage:readme:check` green |
| CLOSE-7 | pass | Diff read in full: 39 commits, every one on the pass or its release, no refactor, no formatting churn beyond the files touched, no probe left behind (`crate/coverage.json` removed after each llvm-cov run). `git log main..HEAD --format='%ae'` → 39 × `13629544+nolindnaidoo@users.noreply.github.com`; `bun run lint:commits` → "39 commit(s) conform". Every finding commit's body names its id |
| CLOSE-8 | pass | Branch pushed, one pull request against `main`: https://github.com/nolindnaidoo/string-le/pull/53. Its body is the findings table (id, commit, what), the carried items and what was not verified, updated for `2ed9747`, `495b64e` and the release commits. No attribution of any kind. The branch ends in `9586dc4` (extension, npm server and registry entry at 2.5.1; README pin and changelog heading aligned) and `ddc06bc` (crate 0.4.3, lockfile and changelog heading). Merged on 2026-10-13 by fast-forwarding `main` to `ddc06bc` after CI went green on it, so every commit the record cites keeps its hash; tagged `v2.5.1` and `crate-v0.4.3` on that commit; `bun run package` from it produced `string-le-2.5.1.vsix` (34 files, 211.04 KB). Published from the repo locally on the owner's instruction, each registry its own step and each version confirmed unspent by its API first: Marketplace `nolindnaidoo.string-le` 2.5.1 (`vsce publish --packagePath`, "Published nolindnaidoo.string-le v2.5.1"); Open VSX `nolindnaidoo.string-le` 2.5.1 (`ovsx publish`, "Published nolindnaidoo.string-le v2.5.1"; the namespace confirmed as `nolindnaidoo` by the API, which answers "extension not found" for `offensiveedge`); npm `string-le-mcp` 2.5.1 (`npm publish ./mcp --access public --provenance=false` through a scratch npmrc holding only the token line, because the package asks for provenance and only a CI identity can produce it; "+ string-le-mcp@2.5.1"); crates.io `string-le` 0.4.3 (`cargo publish --locked`, "Published string-le v0.4.3", and the versions API lists 0.4.3 at once). MCP registry `io.github.nolindnaidoo/string-le` 2.5.1 (`mcp-publisher publish`, after the owner renewed the expired registry token with the interactive GitHub login; the registry lists 2.5.1 as latest). Verified by API after publishing: Open VSX serves 2.5.1 at its version endpoint, npm reports 2.5.1, crates.io lists 0.4.3, the MCP registry marks 2.5.1 latest; the Marketplace gallery still listed 2.5.0 minutes after `vsce` reported the publish done, which its own output says can take a few minutes |
| CLOSE-9 | pass | CI on `dafa793`: 31 jobs pass, `auto-merge` skipping (Dependabot only); the same 31 on `2ed9747` (features-8), on `cb2530f` (bugs-11) and on the release head `ddc06bc`, green on the first run each time. `CI on` macOS, Ubuntu and Windows; `test`, `hazards`, `platform`, `scenarios` on macos-15, ubuntu-24.04 and windows-2025; `coverage`, `coverage-matrix`, `fuzz`, `budget`, `differential`, `parity`, `msrv`, `policy`, `audit`, `Commit messages`, `Versions and registry identity`, `What changed` × 2, CodeQL × 3. Green on the first run; the German-host launches passed on all three operating systems |
| CLOSE-10 | pass | `fleet-pass/LEDGER.md` row written: `merged`, baseline `5554c397`, this record, pull request 53, 2026-10-13, 34 fixed, 1 carried. Record and ledger committed to `letools-site` on `fleet-pass/string-le` in the same change as the document additions under CLOSE-11 |
| CLOSE-11 | pass | Added in this `letools-site` change: `bugs.md` BUG-19 (a format resolved from a filename reads the dotfile and the last path segment first), BUG-20 (a line command keeps the document's terminator), BUG-21 (a document on which two parsers of one format disagree is pinned in its direction); `errors.md` ERR-19 (a stdio server decodes a frame it cannot read and keeps serving); `memory-leaks.md` LEAK-11 extended to the complete line; `broken-features.md` FEAT-21 (a gate refuses what the docs say it refuses, driven), FEAT-22 (a test's title names a path some input reaches), FEAT-23 (a policy grep covers every file type that can carry the sentence); `translations.md` L10N-5 extended with the mechanical rule; `close.md` CLOSE-4 extended with the chain and the stale-binary rules. No check names a tool repo |
