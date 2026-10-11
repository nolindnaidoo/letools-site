# Fleet pass record: paths-le

| | |
|---|---|
| Repo | paths-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `0cb6ef02dfdc8fcbf8d36ae01bbddd81850b8838` |
| Started | 2026-10-11 |
| Pull request | https://github.com/nolindnaidoo/paths-le/pull/51 |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; after `git fetch`, `git status -sb` → `## main...origin/main` |
| BASE-2 | pass | `git config user.email` → `13629544+nolindnaidoo@users.noreply.github.com` |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from main at `0cb6ef02` |
| BASE-4 | pass | Gate list below, derived from `ci.yml`, `ci-crate.yml`, `release.yml`, `release-crate.yml` and `package.json` scripts |
| BASE-5 | see table | Every command run once, unpiped, logged; exit codes below |
| BASE-6 | see findings | |
| BASE-7 | recorded | Per-file coverage below |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. Baseline is `0cb6ef02`; Final is `ba1d99f`, the last commit on the branch. The chain ran on `5aa9f99`, on `5e092fc` and on `ba1d99f`, every gate exit 0 each time. Extension gates at baseline ran with the crate chain building in parallel, so durations are not comparable to CI.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | 2 infos: biome.json schema older than CLI, `biome migrate` suggested. Informational |
| `E` | `bun run typecheck` | exit 0 | exit 0 | |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | 29 files, 424 tests. Statements 93.74, branches 87.11, functions 96.56, lines 94.73 |
| `E` | `bun run build` | exit 0 | exit 0 | |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | "self-contained (static scan + runtime load)" |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 | |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | "109 KB, answered 1 tool(s) over stdio" |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `paths-le-mcp@2.4.0` |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | installs from tarball, answers over stdio |
| `E` | `bun run package` | exit 0 | exit 0 | `release/paths-le-2.4.0.vsix` (34 files, 178.53 KB); `release/` also holds untracked 2.3.2 and 2.3.3 VSIXes from earlier runs |
| `E` | `bun run coverage:readme:check` | exit 0 | exit 0 | hand-run gate, not in CI |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits on the range at baseline |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | ext=npm=server.json=2.4.0; mcpName `io.github.nolindnaidoo/paths-le`; identifier `paths-le-mcp` |
| `E` | `bun run test:integration` | exit 0 | exit 0 | run after the crate chain, so the extension host is not timed against a cargo build |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | same |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` | exit 0 | exit 0 | |
| `C` | `cargo build --locked` | exit 0 | exit 0 | |
| `C` | `RUSTUP_TOOLCHAIN=1.88 cargo check --locked` | exit 0 | exit 0 | msrv job |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 | |
| `C` | policy: no `std::fs`/`File::open` in `crate/src/extract` | exit 0 | exit 0 | |
| `C` | policy: no doc holding the surfaces equal | exit 0 | exit 0 | grep over `*.md`, `node_modules` excluded locally |
| `C` | `PATHS_LE_SCENARIOS=1 cargo test --test scenarios -- --test-threads=1` | exit 0 | exit 0 | |
| `C` | `cargo test --locked --test hazards -- --nocapture` | exit 0 | exit 0 | |
| `C` | `cargo test --locked --test platform -- --nocapture` | exit 0 | exit 0 | |
| `C` | `TZ=UTC cargo test --locked` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` with `TZ` unset | exit 0 | exit 0 | |
| `C` | `cargo build --locked --release` | exit 0 | exit 0 | |
| `C` | `cargo test --locked --test coverage_matrix -- --nocapture` | exit 0 | exit 0 | |
| `C` | `PATHS_LE_FUZZ_SECONDS=20 cargo test --locked --release --bin paths-le fuzz:: -- --nocapture` | exit 0 | exit 0 | CI uses 60 s |
| `C` | `PATHS_LE_BUDGET=1 cargo test --locked --release --test budget -- --nocapture --test-threads=1` | exit 0 | exit 0 | |
| `C` | `cargo llvm-cov` + per-module 70% floor on `extract/` | exit 0 | exit 0 | |
| `C` | `cargo audit` | not run here | not run here | `cargo-audit` is not installed; CI runs it |
| `C` `M` | `bun scripts/check-extraction-parity.ts` | exit 0 | exit 0 | |
| `C` `M` | `bun scripts/check-extraction-differential.ts --seed 20250812 --count 900` | exit 0 | exit 0 | |
| `C` `M` | `bun scripts/check-mcp-definition.ts` | exit 0 | exit 0 | |
| `C` | `cargo package --list` corpus assertions, crates.io version probe, `cargo publish --dry-run` | not run here | not run here | release-only; the probe is a registry read |
| `E` `N` | `vsce publish`, `ovsx publish`, `npm publish`, `mcp-publisher` | not run here | not run here | publishing |
| `E` | `bun run benchmark`, `perf:readme`, `coverage:readme`, `readme` | not run here | not run here | generated-section writers, machine-specific, run at release |
| `E` | `clean`, `clean:i18n`, `copy:i18n`, `build:prod`, `build:mcp`, `watch`, `test:watch`, `lint:fix`, `vscode:prepublish`, `hooks:install`, `prepare` | run via `package` or not gates | run via `package` | `vscode:prepublish` ran inside `package` |

BASE-7, from `coverage/coverage-summary.json` (46 files). Floors are 70 lines,
70 functions, 60 branches, 70 statements.

| File | Lines | Statements | Functions | Branches |
|---|---|---|---|---|
| `src/mcp/info.ts` | 0 | 0 | 100 | 0 |
| `src/mcp/server.ts` | 0 | 0 | 100 | 100 |
| `src/mcp/provider.ts` | 37.5 | 37.5 | 33.33 | 50 |

Next lowest branch coverage, all above the floor: `config/config.ts` 63.63,
`commands/workspaceShared.ts` 68.75, `commands/extract.ts` 70,
`commands/output.ts` 72.22, `commands/sort.ts` 75, `ui/statusBar.ts` 75.

## Step 1: Inventory

Read manifest, from INV-1 (`git ls-files -- src test scripts mcp crate/src crate/tests package.json server.json | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/' | xargs wc -l`), 23,117 lines.
The filter dropped `src/assets/images/` (5, not source), `src/extraction/__fixtures__/` (10) and
`src/extraction/__snapshots__/` (1), read with `characterization.test.ts`, and `src/i18n/` (12), read in step 7.

| Read | Lines | File |
|---|---|---|
| [x] | 34 | src/extension.ts |
| [x] | 95 | src/types.ts |
| [x] | 41 | src/services/serviceFactory.ts |
| [x] | 29 | src/telemetry/telemetry.ts |
| [x] | 20 | src/config/settings.ts |
| [x] | 200 | src/config/config.ts |
| [x] | 26 | src/commands/index.ts |
| [x] | 258 | src/commands/extract.ts |
| [x] | 164 | src/commands/output.ts |
| [x] | 73 | src/commands/dedupe.ts |
| [x] | 105 | src/commands/sort.ts |
| [x] | 25 | src/commands/help.ts |
| [x] | 100 | src/commands/workspaceShared.ts |
| [x] | 271 | src/commands/extractWorkspace.ts |
| [x] | 31 | src/ui/notifier.ts |
| [x] | 50 | src/ui/statusBar.ts |
| [x] | 179 | src/ui/ratingPrompt.ts |
| [x] | 84 | src/rating/policy.ts |
| [x] | 247 | src/ui/webView.ts |
| [x] | 16 | src/utils/document.ts |
| [x] | 13 | src/utils/errors.ts |
| [x] | 64 | src/utils/positions.ts |
| [x] | 75 | src/utils/safety.ts |
| [x] | 176 | src/utils/pathResolver.ts |
| [x] | 228 | src/workspace/defaults.ts |
| [x] | 156 | src/workspace/ignore.ts |
| [x] | 344 | src/workspace/scan.ts |
| [x] | 13 | src/mcp/info.ts |
| [x] | 13 | src/mcp/server.ts |
| [x] | 55 | src/mcp/provider.ts |
| [x] | 249 | src/mcp/transport.ts |
| [x] | 138 | src/mcp/envelope.ts |
| [x] | 124 | src/mcp/fileType.ts |
| [x] | 120 | src/mcp/tools.ts |
| [x] | 134 | src/extraction/extract.ts |
| [x] | 82 | src/extraction/heuristics.ts |
| [x] | 42 | src/extraction/position.ts |
| [x] | 24 | src/extraction/formats/schemes.ts |
| [x] | 62 | src/extraction/formats/json.ts |
| [x] | 90 | src/extraction/formats/javascript.ts |
| [x] | 76 | src/extraction/formats/html.ts |
| [x] | 58 | src/extraction/formats/css.ts |
| [x] | 92 | src/extraction/formats/toml.ts |
| [x] | 106 | src/extraction/formats/yaml.ts |
| [x] | 80 | src/extraction/formats/dotenv.ts |
| [x] | 145 | src/extraction/formats/fallback.ts |
| [x] | 341 | src/extraction/formats/csv.ts |
| [x] | 51 | mcp/package.json |
| [x] | 33 | server.json |
| [x] | 197 | mcp/README.md |
| [x] | 392 | package.json |

Tests, scripts and crate, ticked as read:

| Read | Lines | File |
|---|---|---|
| [x] | 600 | src/__mocks__/vscode.ts |
| [x] | 288 | src/commands/commands.test.ts |
| [x] | 278 | src/commands/extract.test.ts |
| [x] | 192 | src/commands/extractWorkspace.test.ts |
| [x] | 115 | src/config/config.test.ts |
| [x] | 77 | src/extraction/characterization.test.ts |
| [x] | 829 | src/extraction/__snapshots__/characterization.test.ts.snap |
| [x] | 10 files | src/extraction/__fixtures__/* (byte-identical to the ten corpus documents of the same name, `cmp`) |
| [x] | 166 | src/extraction/formats/css.test.ts |
| [x] | 282 | src/extraction/formats/csv.test.ts |
| [x] | 125 | src/extraction/formats/dotenv.test.ts |
| [x] | 124 | src/extraction/formats/fallback.test.ts |
| [x] | 216 | src/extraction/formats/html.test.ts |
| [x] | 138 | src/extraction/formats/javascript.test.ts |
| [x] | 169 | src/extraction/formats/json.test.ts |
| [x] | 45 | src/extraction/formats/schemes.test.ts |
| [x] | 110 | src/extraction/formats/toml.test.ts |
| [x] | 92 | src/extraction/formats/yaml.test.ts |
| [x] | 69 | src/extraction/heuristics.test.ts |
| [x] | 37 | src/extraction/position.test.ts |
| [x] | 398 | src/mcp/mcp.test.ts |
| [x] | 107 | src/mcp/readme.test.ts |
| [x] | 116 | src/rating/policy.test.ts |
| [x] | 141 | src/services/services.test.ts |
| [x] | 281 | src/ui/ratingPrompt.test.ts |
| [x] | 36 | src/utils/errors.test.ts |
| [x] | 131 | src/utils/pathResolver.test.ts |
| [x] | 59 | src/utils/positions.test.ts |
| [x] | 76 | src/utils/safety.test.ts |
| [x] | 72 | src/workspace/ignore.test.ts |
| [x] | 434 | src/workspace/scan.test.ts |
| [x] | 129 | test/integration/extension.test.ts |
| [x] | 183 | test/integration/l10n.test.ts |
| [x] | 127 | scripts/benchmark.ts |
| [x] | 38 | scripts/build-mcp.js |
| [x] | 98 | scripts/build-npm.js |
| [x] | 135 | scripts/check-agent-files.py |
| [x] | 103 | scripts/check-bundle.js |
| [x] | 606 | scripts/check-extraction-differential.ts |
| [x] | 189 | scripts/check-extraction-parity.ts |
| [x] | 152 | scripts/check-mcp-bundle.js |
| [x] | 93 | scripts/check-mcp-definition.ts |
| [x] | 153 | scripts/check-npm-package.js |
| [x] | 182 | scripts/commit-lint.js |
| [x] | 181 | scripts/coverage-readme.js |
| [x] | 207 | scripts/e2e-vsix.js |
| [x] | 27 | scripts/install-hooks.js |
| [x] | 72 | scripts/perf-readme.js |
| [x] | 23 | crate/src/main.rs |
| [x] | 547 | crate/src/cli.rs |
| [x] | 607 | crate/src/audit.rs |
| [x] | 303 | crate/src/walk.rs |
| [x] | 952 | crate/src/resolve.rs |
| [x] | 72 | crate/src/testing.rs |
| [x] | 515 | crate/src/mcp/mod.rs |
| [x] | 262 | crate/src/mcp/extract.rs |
| [x] | 308 | crate/src/extract/mod.rs |
| [x] | 267 | crate/src/extract/heuristics.rs |
| [x] | 191 | crate/src/extract/position.rs |
| [x] | 65 | crate/src/extract/schemes.rs |
| [x] | 127 | crate/src/extract/js.rs |
| [x] | 344 | crate/src/extract/format.rs |
| [x] | 182 | crate/src/extract/json.rs |
| [x] | 246 | crate/src/extract/javascript.rs |
| [x] | 176 | crate/src/extract/html.rs |
| [x] | 161 | crate/src/extract/css.rs |
| [x] | 202 | crate/src/extract/toml.rs |
| [x] | 223 | crate/src/extract/yaml.rs |
| [x] | 235 | crate/src/extract/dotenv.rs |
| [x] | 334 | crate/src/extract/fallback.rs |
| [x] | 649 | crate/src/extract/csv.rs |
| [x] | 226 | crate/src/extract/corpus.rs |
| [x] | 317 | crate/src/extract/fuzz.rs |
| [x] | 523 | crate/tests/contracts.rs |
| [x] | 209 | crate/tests/scenarios.rs |
| [x] | 531 | crate/tests/hazards.rs |
| [x] | 285 | crate/tests/platform.rs |
| [x] | 262 | crate/tests/coverage_matrix.rs |
| [x] | 241 | crate/tests/budget.rs |
| [x] | 765 | crate/fixtures/extraction.json |
| [x] | 298 | crate/fixtures/heuristics.json |
| [x] | 782 | crate/fixtures/mcp-extract-paths.json |
| [x] | 80 | crate/fixtures/README.md |
| [x] | 14 files | crate/fixtures/documents/* |
| [x] | 44 × 13 | l10n/bundle.l10n.json and the 12 locale bundles, every value (step 7) |
| [x] | 39 × 13 | package.nls.json and the 12 locale catalogues, every value (step 7) |
| [x] | | README.md, mcp/README.md, crate/README.md, CHANGELOG.md (head), crate/CHANGELOG.md (head), crate/SPEC.md, AGENTS.md, CLAUDE.md, crate/AGENTS.md, crate/CLAUDE.md, .vscodeignore, biome.json, tsconfig*.json, .vscode/*, .github/codeql-config.yml, .github/dependabot.yml, the six agent-instruction files |

Also read but outside INV-1's filter: `.vscode-test.mjs`, `vitest.config.ts`, `.githooks/commit-msg`, `server.json`, `rust-toolchain.toml`, `crate/Cargo.toml`.

### INV-2 Manifest contributions

`contributes` keys: `commands`, `menus`, `configuration`, `mcpServerDefinitionProviders`. `main`: `./dist/extension.js`. `l10n`: `./l10n`. `engines.vscode`: `^1.101.0`.

Commands (7): `paths-le.extractPaths`, `paths-le.extractWorkspace`, `paths-le.extractFolder`, `paths-le.postProcess.dedupe`, `paths-le.postProcess.sort`, `paths-le.openSettings`, `paths-le.help`. Every title and the category are `%key%` placeholders; L10N-1 shows the key sets equal.

Menus: `editor/context` → `extractPaths` when `editorTextFocus`, group `1_modification@1`. `explorer/context` → `extractFolder` when `explorerResourceIsFolder`, group `7_modification@1`. `commandPalette` → all seven, no `when`. Both context keys exist in VS Code 1.101.

Keybindings: none. Activation events: 28 `onLanguage:*` entries (csv, toml, dotenv, env, javascript, javascriptreact, typescript, typescriptreact, json, jsonc, html, css, scss, less, yaml, markdown, xml, python, go, rust, java, shellscript, sql, dockerfile, makefile, ini, properties, plaintext).

MCP server definition providers: id `paths-le`, label `%manifest.mcp.label%`.

Configuration (21 properties):

| Property | Type | Default | Consumer |
|---|---|---|---|
| `clipboardIncludesPositions` | boolean | false | `commands/output.ts` 36, `workspaceShared.ts` 70 |
| `copyToClipboardEnabled` | boolean | false | `output.ts` 35, `workspaceShared.ts` 67 |
| `notificationsLevel` | enum all/important/silent | silent | `ui/notifier.ts` 18, 23; `ratingPrompt.ts` 142 (inspect) |
| `postProcess.openInNewFile` | boolean | true | `output.ts` 45 |
| `openResultsSideBySide` | boolean | true | `output.ts` 39, `workspaceShared.ts` 88 |
| `safety.enabled` | boolean | true | `utils/safety.ts` 19, `workspaceShared.ts` 26 |
| `safety.fileSizeWarnBytes` | number ≥1000 | 1000000 | `safety.ts` 25, `workspaceShared.ts` 27 |
| `safety.largeOutputLinesThreshold` | number ≥100 | 50000 | `safety.ts` 52 only, into `warnings`, which no caller reads. **No observable effect.** See `paths-le-features-1` |
| `showPositions` | boolean | false | `output.ts` 33, `workspaceShared.ts` 83 |
| `statusBar.enabled` | boolean | true | `ui/statusBar.ts` 23, 33 |
| `telemetryEnabled` | boolean | false | `telemetry/telemetry.ts` 13, read once at activation. See `paths-le-features-2` |
| `resolution.resolveSymlinks` | boolean | false | `commands/extract.ts` 64, 229 |
| `resolution.resolveWorkspaceRelative` | boolean | false | `extract.ts` 65, 231 |
| `workspace.scanExcludes` | string[] | [] | `workspaceShared.ts` 21 → `scan.ts` |
| `workspace.scanMaxFiles` | number ≥1 | 5000 | `workspaceShared.ts` 25 |
| `workspace.scanMaxResults` | number ≥1 | 10000 | `extractWorkspace.ts` 117, 124 |
| `workspace.scanPatterns` | string[] | ["**/*"] | `workspaceShared.ts` 20 |
| `workspace.scanRespectGitignore` | boolean | true | `workspaceShared.ts` 29 |
| `workspace.scanAlwaysInclude` | string[] | [] | `workspaceShared.ts` 24 |
| `workspace.scanSkipBinaryFiles` | boolean | true | `workspaceShared.ts` 23 |
| `workspace.scanUseDefaultExcludes` | boolean | true | `workspaceShared.ts` 22 |

Config keys read in source and not declared: none (`config.ts` reads exactly the 21 above; `rating.state` and `paths-le.canonicalWarningShown` go through `globalState`, not configuration).

### INV-3 Registrations

| Command | Registered at |
|---|---|
| `paths-le.extractPaths` | `commands/extract.ts` 26 |
| `paths-le.extractWorkspace` | `commands/extractWorkspace.ts` 46 |
| `paths-le.extractFolder` | `extractWorkspace.ts` 51 |
| `paths-le.postProcess.dedupe` | `commands/dedupe.ts` 10 |
| `paths-le.postProcess.sort` | `commands/sort.ts` 17 |
| `paths-le.openSettings` | `config/settings.ts` 8 |
| `paths-le.help` | `commands/help.ts` 17 |
| provider `paths-le` | `mcp/provider.ts` 29 (`lm.registerMcpServerDefinitionProvider`, feature-detected) |

Seven `registerCommand` calls, seven manifest commands, no unmatched row either way. `test/integration/extension.test.ts` asserts it with `getCommands(true)`.

### INV-5 Resources with a lifetime

| Resource | Created | Released |
|---|---|---|
| Output channel `Paths-LE Telemetry` | `telemetry.ts` 14, at activation when enabled | `telemetry.dispose` via `context.subscriptions` (`serviceFactory.ts` 33) |
| Status bar item | `statusBar.ts` 13 | pushed to subscriptions at 20 |
| `onDidChangeConfiguration` listener | `statusBar.ts` 32 | pushed to subscriptions at 31 |
| Help webview panel | `webView.ts` 30, lazily on first `show` | `panel.dispose` from `webView.dispose`, pushed to subscriptions in `help.ts` 24; `onDidDispose` clears the reference |
| MCP provider disposable | `provider.ts` 29 | subscriptions at 36 |
| 7 command disposables | each `register*` | subscriptions |
| `resolvedPathCache` (module Map) | `pathResolver.ts` 11 | FIFO eviction at 1000 entries (`setCachedPath`) |
| MCP `buffer` string | `transport.ts` 205, per `serve` | consumed per newline; **no maximum**. See `paths-le-leaks-1` |
| `stdin` `data` listener | `transport.ts` 212 | process lifetime |
| Per-call Maps and Sets | `scan.ts`, `extractWorkspace.ts`, `positions.ts`, extractors | function scope |

No timers, intervals, watchers, child processes or `g`-flag regexes used without a `lastIndex` reset (`javascript.ts` 48, `html.ts` 22, `css.ts` 24, 39 reset before each loop).

### INV-6 Suspension points

55 `await`s in non-test source, listed by `grep -rnE '\bawait\b|\.then\('`. The ones that read state before and use it after:

| Site | Reads before | Uses after |
|---|---|---|
| `extract.ts` 46 (`extractPaths`) | `document.getText()`, `languageId` | the text's paths; later `displayResults` edits `document` in replace mode. See RACE-2 |
| `extract.ts` 69 (canonical warning dialog, can wait indefinitely) | same document | same |
| `extract.ts` 80 (`resolvePathsIfNeeded`) | `config` snapshot | config snapshot (coherent) |
| `output.ts` 112 (`applyEdit`) | `fullDocumentRange(document)` computed at call time | result checked |
| `sort.ts` 26 (quick pick, can wait) | `editor` | `editor.document` read after the pick (re-read, safe) |
| `extractWorkspace.ts` 87, 94 | `config`, `limits` snapshot | snapshot throughout (RACE-7 ok); `token` checked per file |
| `ratingPrompt.ts` 101, 108 | memento value | written before the toast (RACE-5 ok) |
| `scan.ts` 229, 234 | listing | per-file read; a file gone between listing and read is counted as `notText`. See `paths-le-errors-3` |
| `transport.ts` 244 | nothing shared | response carries its own id |

### INV-7 Failure sites

| Site | What arrives | What happens |
|---|---|---|
| `ignore.ts` 101 | `new RegExp` throwing on a pattern this translator produced | rule dropped silently; inert in practice since every branch escapes |
| `scan.ts` 159 | `fs.readFile` on a `.gitignore` | swallowed with a comment; covers ancestors that have none, also covers an unreadable one under the root |
| `scan.ts` 178 | `fs.stat` on `.git` | false, by design |
| `scan.ts` 195 | `TextDecoder` fatal | undefined, by design |
| `scan.ts` 226 | `fs.stat`/`fs.readFile` on a listed file | counted as `notText` and reported as "not UTF-8 text". See `paths-le-errors-3` |
| `pathResolver.ts` 60, 88, 126, 150 | any | falls back to the path as written; by design, commented |
| `envelope.ts` 117, 135 | caller argument | thrown to `callTool`, returned as `isError` |
| `ratingPrompt.ts` 92 | any | reported to telemetry, commented |
| `output.ts` 132 | clipboard | warning shown, commented |
| `workspaceShared.ts` 68 | clipboard | warning shown |
| `transport.ts` 97, 104, 114, 141, 224 | protocol | JSON-RPC errors or `isError` results |
| `toml.ts` 18, `yaml.ts` 25 | parser throwing on a malformed document | **returned `[]` with no diagnostic** at baseline; a named refusal since `faf189b` (`paths-le-bugs-5`) |
| `output.ts` 163, `workspaceShared.ts` 94 | `void recordSuccess()` | its own try/catch inside |
| no outer handler on any command body | a rejection from `openTextDocument`, `showTextDocument`, `findFiles`, `withProgress` | VS Code reports it in its own words. See `paths-le-errors-5` |

### INV-8 User-visible channels

Notifications through `notifier` (info/warning/error), two direct dialogs (`extract.ts` 154 security warning with three buttons, `ratingPrompt.ts` 67 with three buttons), one quick pick (`sort.ts` with 4 labels and a placeholder), one open dialog (`workspaceShared.ts` 51, `openLabel`), progress notification (`extractWorkspace.ts` 83 title, 101 message), status bar text and tooltip (`statusBar.ts` 18, 41), webview title and HTML (`webView.ts` 32, 61-245), generated markdown report (`extractWorkspace.ts` 206-271), results document (bare paths), manifest titles and descriptions (`package.nls.json`), MCP tool description and argument descriptions (`tools.ts`), MCP error messages (`envelope.ts`, `transport.ts`), CLI output (crate).

Strings per channel are classified under step 7.

### INV-9 Machine interfaces

`M` (npm server `dist/mcp-server.js`): one tool, `extract_paths` — `content` (string, required), `format` (enum of 11), `filename` (string), `dedupe` (boolean, default false), `maxResults` (integer 1..5000, default 500), `additionalProperties: false`. Success: `{ ok, data: { paths: [{value,type,line,column}], fileType }, diagnostics, meta: { tool, count, truncated } }` inside `content[0].text` and `structuredContent`, `isError: false`. Refusal: a thrown handler error becomes `content[0].text` = message, `isError: true`; a refused document becomes `ok: false` with one `parsing` diagnostic of severity `error`.

`N`: `bin` `paths-le-mcp` → `server.js`; `files` `server.js`, `README.md`, `LICENSE`; versions `package.json` 2.4.0 = `mcp/package.json` 2.4.0 = `server.json` 2.4.0 (both fields).

`C`: read under the crate rows below.

### INV-10 Claims

Read from `README.md`, `mcp/README.md`, `crate/README.md`, the manifest description, the help webview and the MCP tool description. Each row names the test or the run that backs it (FEAT-17).

| Claim | Where | Backing |
|---|---|---|
| Every path in the document lands in a new editor; deduplicate and sort from there | README "What it does" | `extract.test.ts` "extracts paths from a plain document"; `commands.test.ts` dedupe and sort |
| Local imports from JS/TS including multi-line statements; package names filtered out | README | `javascript.test.ts`; corpus `paths.js` (multi-line import, `react` and `node:fs` absent) |
| Every `src`, `href`, `srcset`, `url()`, `@import` in HTML/CSS | README | `html.test.ts`, `css.test.ts`; corpus `paths.html`, `paths.css` |
| Path-like values from JSON/JSONC, YAML, TOML, CSV, `.env` | README | corpus cases for each; `characterization.test.ts` |
| Python, Go, Markdown, XML, a Dockerfile by text scan | README | corpus `paths.py`, `paths.md`; `crate/tests/coverage_matrix.rs` opens twelve unknown extensions and a `Dockerfile` |
| VS Code 1.101+ registers `extract_paths` with agent mode, nothing to install | README | `provider.ts` read (feature-detected); `scripts/e2e-vsix.js` spawns the installed server as the provider does and asserts an answer (gate `test:e2e-vsix`). The provider's registration under a host that has the API is not asserted by a test: see `paths-le-features-4` |
| Returns every path classified as file/relative/absolute/url with 1-based line and column, reported as written | README, `mcp/README.md` | `mcp.test.ts`; `crate/fixtures/mcp-extract-paths.json` against both servers (`check-extraction-parity.ts`, `cargo test`) |
| The server reads no files and makes no network requests | README, `mcp/README.md` | `scripts/check-mcp-bundle.js` (read: refuses any non-builtin require, holds the size ceiling, completes a handshake); gate exit 0 |
| `npx -y paths-le-mcp` works from a clean install; `tools/list` prints `extract_paths` | README, `mcp/README.md` | `scripts/check-npm-package.js` installs the tarball and answers over stdio; gate exit 0 |
| Columns count UTF-16 code units | `mcp/README.md` | corpus `unicode.json`; `corpus.rs` "the_unicode_case_pins_utf16_columns"; `dotenv.rs` "columns_count_utf16_units_not_bytes" |
| The two servers answer identically | `mcp/README.md`, `crate/README.md` | `check-extraction-parity.ts`, `check-extraction-differential.ts` (900 generated documents), `check-mcp-definition.ts`; outside both: `paths-le-bugs-1` (fixed), `paths-le-bugs-7` (carried) |
| A workspace report lists distinct paths, most used first, with how often and where; a refused file is listed with its reason | README | `extractWorkspace.test.ts` "lists each distinct path once…", "names a file its format reader refused…", "prints the report the README shows as its sample" |
| A scan reports each path as written whatever the `resolution` settings say | README | code read: `extractWorkspace.ts` never calls the resolver. No test held it: `paths-le-features-4` |
| It stops at 5,000 files or 10,000 listed occurrences; the report ends with a line per thing left out | README | `config.test.ts` "the README states the scan limits the code uses"; `extractWorkspace.test.ts` "stops at the results limit…"; `scan.test.ts` `unreadNotes` |
| The built-in exclude lists, exactly | README | `config.test.ts` "the README lists the folders a scan skips" |
| Three switches, `scanExcludes`, `scanAlwaysInclude` | README | `scan.test.ts` "what a scan leaves out" |
| CLI: exit 0 clear, 1 findings, 2 malformed question; verdicts ok/symlinked/non-canonical/missing/escapes-root/unresolved | README, `crate/README.md` | `crate/tests/contracts.rs`, one test per exit code and verdict |
| Positions: exact for JS/TS, JSON, HTML, CSS, text scan; located in source for TOML/YAML; row/cell for CSV | README | corpus positions; `toml.rs`/`yaml.rs` "repeated_values_land_on_successive_occurrences", "an_unlocatable_value_falls_back…"; `csv.rs` "positions_are_cell_coordinates" |
| Version strings and IPs never paths; `data:`/`javascript:` excluded; bare domains not paths, `docs.rs` is | README | `crate/fixtures/heuristics.json` (`1.8.1`, `192.168.1.1`, `example.com`, `docs.rs`); `schemes.test.ts` |
| Text scan claims bare `name.ext` only in quotes; `os.path` is not a file | README | `fallback.rs` "an_attribute_access_is_not_a_file_but_a_quoted_name_is"; corpus `paths.py` |
| No command is bound to a key by default | README | `package.json` has no `keybindings` (INV-2) |
| Settings table defaults | README | `config.test.ts` parity over every declared setting |
| `safety.largeOutputLinesThreshold`: "Warn above this line count" | README, manifest | unbacked at baseline: `paths-le-features-1`, now `extract.test.ts` "shows the large-output warning the setting promises" |
| Twelve languages, both halves covered, follows the display language | README | L10N-2, L10N-3; `src/l10n.test.ts`; shown in a real host: `test/locale/german-host.test.ts` reads the German workspace report from a `--locale=de` host (`paths-le-translations-4`, fixed) |
| No network access; telemetry is a local output channel | README | `grep -rnE 'fetch\(|https?\.|net\.|request\(' src --include='*.ts' --exclude='*.test.ts'` → only `openExternal` URLs; `telemetry.ts` read |
| Canonical resolution is opt-in and warned before first use | README | `extract.test.ts` "asks before resolving canonically the first time", "does not ask again once acknowledged" |
| Error notifications redact home directories and credential-shaped fragments | README | `errors.test.ts`; `guard.ts` routes every command failure through `sanitizeErrorMessage` |
| One rating prompt, at most twice, Rate opens the listing installed from | README | `rating/policy.test.ts`, `ui/ratingPrompt.test.ts` |
| `mcp/README.md` argument table matches the tool schema | `mcp/README.md` | `src/mcp/readme.test.ts` (held byte-identical across the family) |
| Help page: formats, commands, troubleshooting | webview | unbacked at baseline: `paths-le-features-3`, now `ui/webView.test.ts` |
| Tool description and argument descriptions | `src/mcp/tools.ts` | `check-mcp-definition.ts` holds them equal to the crate's |

### INV-11 Tests to modules

| Module | Tests | Note |
|---|---|---|
| `extension.ts` | `extract.test.ts` "activation", `services.test.ts` | |
| `services/serviceFactory.ts` | `services.test.ts` | |
| `telemetry/telemetry.ts` | `services.test.ts` "telemetry" | runtime toggle added this pass |
| `config/config.ts`, `config/settings.ts` | `config.test.ts`, `services.test.ts` | type-strict number read added this pass |
| `commands/extract.ts`, `commands/output.ts` | `extract.test.ts`, `commands.test.ts` | |
| `commands/extractWorkspace.ts`, `commands/workspaceShared.ts` | `extractWorkspace.test.ts` | |
| `commands/dedupe.ts`, `commands/sort.ts` | `commands.test.ts` | |
| `commands/help.ts`, `ui/webView.ts` | `services.test.ts`, `ui/webView.test.ts` (new) | |
| `commands/guard.ts` (new) | `extract.test.ts`, `extractWorkspace.test.ts`, `commands.test.ts` "a failure inside the command" | |
| `ui/notifier.ts`, `ui/statusBar.ts` | `services.test.ts` | the status bar tests asserted nothing at baseline: `paths-le-features-4` |
| `ui/ratingPrompt.ts`, `rating/policy.ts` | `ratingPrompt.test.ts`, `policy.test.ts` | family files |
| `utils/errors.ts`, `utils/positions.ts`, `utils/document.ts`, `utils/safety.ts`, `utils/pathResolver.ts` | `errors.test.ts`, `positions.test.ts`, (via commands), `safety.test.ts`, `pathResolver.test.ts` | |
| `workspace/scan.ts`, `workspace/ignore.ts`, `workspace/defaults.ts` | `scan.test.ts`, `ignore.test.ts`, `config.test.ts` | |
| `mcp/transport.ts`, `mcp/envelope.ts`, `mcp/fileType.ts`, `mcp/tools.ts` | `mcp.test.ts`, `readme.test.ts`; both servers: the corpus and the three scripts | |
| `mcp/info.ts`, `mcp/server.ts` | none (0% lines) | entry points driven by `check-mcp-bundle.js` and `check-npm-package.js` over stdio |
| `mcp/provider.ts` | activation tests reach the no-API branch (37.5%) | the registration branch runs only in a real host; see `paths-le-features-4` |
| `extraction/*` | `formats/*.test.ts`, `heuristics.test.ts`, `position.test.ts`, `characterization.test.ts`; corpus on both sides | |
| `crate/src/*` | unit tests beside each module; `crate/tests/*` against the built binary | |

## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, every file under `src/commands/`, `src/mcp/provider.ts`, `src/config/`, `src/ui/`, `test/integration/`, `scripts/e2e-vsix.js`, `.vscodeignore`, `src/mcp/*`, `crate/src/main.rs`, `crate/src/cli.rs`, `mcp/package.json`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | INV-3: seven `registerCommand` calls, seven manifest commands. `test/integration/extension.test.ts` asserts with `getCommands(true)` in the real host; `extract.test.ts` "activation" and `services.test.ts` assert against the mock |
| FEAT-2 | E | pass | Real host (`bun run test:integration`, 10 passing at baseline and at close): `extension.test.ts` executes `extractPaths` over a fixture document and asserts the opened document's text, runs dedupe and sort and asserts the edited text, and `openSettings`. Mock: every command's effect is asserted in `extract.test.ts`, `extractWorkspace.test.ts`, `commands.test.ts`, `services.test.ts` |
| FEAT-3 | E | pass | `extractFolder` takes a `Uri` from the Explorer or nothing from the palette: `extractWorkspace.test.ts` "scans only the folder it is handed" and "asks for a folder from the palette". No other command reads an argument |
| FEAT-4 | E | pass | `editor/context` when `editorTextFocus`, `explorer/context` when `explorerResourceIsFolder`, both context keys documented for VS Code 1.101 (the floor). A menu cannot be driven headless; what a real display shows was not verified here |
| FEAT-5 | E | n/a | No `keybindings` contribution; README says so |
| FEAT-6 | E | finding | 21 settings. Consumer tests exist for each value in `commands.test.ts`, `extract.test.ts`, `extractWorkspace.test.ts`, `scan.test.ts`, `safety.test.ts`, `services.test.ts`, except: `safety.largeOutputLinesThreshold` had no observable effect (`paths-le-features-1`); `statusBar.enabled` and the status bar's progress text had tests that asserted nothing, `workspace.scanPatterns` was tested only at its default, and the new-file output route had no test (`paths-le-features-4`) |
| FEAT-7 | E | pass | `config.test.ts` "covers every declared setting" walks `contributes.configuration.properties` and fails on a property missing from `KEY_MAP`; 21 defaults equal |
| FEAT-8 | E | finding | `telemetryEnabled` read once at activation (`paths-le-features-2`). `statusBar.enabled` has a change listener (asserted now). Every other setting is read at the start of each command through `getConfiguration()` |
| FEAT-9 | E | pass, one driven | 28 `onLanguage:*` events. The integration host opens a document and the extension activates; the other 27 are read in the manifest, not driven, and a host that opens no matching document leaves the commands in the palette with activation on first use |
| FEAT-10 | E | pass | `unzip -l release/paths-le-2.4.0.vsix`: 34 files, `dist/extension.js`, `dist/mcp-server.js`, `package.nls.json` + 12, `l10n/bundle.l10n.*.json` × 12, `src/assets/images/icon.png`, README, CHANGELOG, LICENSE. Every path the source resolves at runtime is present; `test:e2e-vsix` PASS at baseline and at close |
| FEAT-11 | E | pass | `bun run check:bundle` → "self-contained (static scan + runtime load)"; the script read: static require scan and a `require()` of the bundle with `vscode` stubbed |
| FEAT-12 | M | finding | Driven against both built servers: a valid call (corpus), a schema violation (`maxResults: 0` → `isError`, "maxResults must be a positive integer"), a malformed CSV (refused, named, both). Also driven: `filename: "constructor"` and `format: "__proto__"` (`paths-le-bugs-1`), malformed TOML and YAML (`paths-le-bugs-5`), truncated JSON (`paths-le-bugs-7`), 200,000-deep JSON and 20,000-deep TOML (`paths-le-bugs-8`), empty and blank content (both `ok`, `count: 0`) |
| FEAT-13 | M C | pass | `check-extraction-parity.ts` (corpus against the extension), `check-extraction-differential.ts --seed 20250812 --count 900` (generated documents against both servers), `check-mcp-definition.ts` (tool definitions equal), all exit 0 at baseline and at close. The parity script compares only the corpus; the differential reaches outside it. The disagreements found by hand are outside what the generator produces: prototype-named formats, truncated JSON, deep nesting |
| FEAT-14 | M | pass | `scripts/e2e-vsix.js` spawns the installed server with `process.execPath`, `dist/mcp-server.js` and `ELECTRON_RUN_AS_NODE=1`, as `provider.ts` builds it, and asserts an answer. The provider on a host without the API returns before registering (`services.test.ts` "says nothing on a host without the API"); on a host with it, the definition is read back (`paths-le-features-4`) |
| FEAT-15 | N | pass | `bun run check:npm-package` installs from the tarball and answers over stdio; `bin` `paths-le-mcp` → `server.js`, `files` `server.js`, `README.md`, `LICENSE`, version 2.4.0 in `package.json`, `mcp/package.json`, `server.json` (INV-9) |
| FEAT-16 | C | finding | `contracts.rs`: `--strict`, `--no-resolve`, `--root`, `--deny-symlinks`, `--format`, `--stdin`, exit 0/1/2, bare filename, stdout/stderr split; `scenarios.rs`: `--follow-symlinks`; `hazards.rs`: `--hidden`. `--no-ignore` had no test (`paths-le-features-5`). Over this repository: `paths-le .` → exit 1, 9,224 paths in 216 files, 2,982 findings (fixture files hold deliberately missing paths), 6 binary files skipped; `paths-le --no-ignore --hidden --no-resolve src` → exit 0, 103 files |
| FEAT-17 | all | finding | INV-10 above. Unbacked at baseline: the large-output warning (`paths-le-features-1`), the help page (`paths-le-features-3`), a scan never resolving (`paths-le-features-4`), a translated string shown in a real host (`paths-le-translations-4`, carried) |
| FEAT-18 | all | finding | Settings: `paths-le-features-1`. Locale keys: none dead (`src/l10n.test.ts`). Scripts in `package.json`: every one is a gate, a build step, or a release-time writer named in `AGENTS.md` (`benchmark`, `perf:readme`, `coverage:readme`, `readme`). Exported functions with no caller outside their module: `showSuccessMessage` (`output.ts`), `isValidNotificationLevel` (`config.ts`); exports with no behaviour, left as observations |
| FEAT-19 | E | pass | `vitest.config.ts`: `coverage.thresholds`, `include: src/**/*.ts`, excludes only tests, mocks, fixtures, snapshots, `src/i18n/**` (catalogues) and `types.ts`. `tsc --noEmit -p tsconfig.json` type-checks the tests (it caught a test error during this pass). README generated sections regenerated by `scripts/coverage-readme.js` at close |
| FEAT-20 | E | n/a | BASE-8 found no skipped test |

## Step 3: Bugs

Re-read for this step: `src/extraction/**` with its tests and fixtures, `src/commands/*`, `src/utils/*`, `src/mcp/*`, every file under `crate/src/`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | Every extractor has a blank-document test on both sides (`a_blank_document_yields_nothing`, the `*.test.ts` twins). Both servers driven with `content: ""`, `"   \n\t"` and a one-character CSV: `ok: true`, `count: 0`, `fileType` named |
| BUG-2 | E M | finding | `grep -rnE 'if \(![a-zA-Z_.]+\)\|\|\| '` → 52 sites read. `config.ts` `readNumber` coerced `''` and `null` to 0 (`paths-le-bugs-6`). The rest guard objects, undefined or booleans |
| BUG-3 | all | pass | `fileType.ts` extension slice (`lastIndexOf('.') + 1`, dotfile handled first), `scan.ts` `labelOf` (`slice(base.length + 1)`, trailing-slash test), `transport.ts` line split (split-chunk tests), `normalizePath` root case, the hand-written CSV reader (`csv.test.ts` 282 lines, `csv.rs` 649 lines, both ends of every cell boundary) |
| BUG-4 | all | pass | Crate `hazards.rs` content tree: BOM, CRLF, lone CR, no trailing newline, empty, blank, NUL, invalid UTF-8, UTF-16, astral before the value, a 1 MB line, 100,000 lines; `csv.rs` BOM and U+00A0/U+FEFF tests; `dotenv.rs` CRLF and UTF-16 columns; corpus `unicode.json`; `fuzz.rs` alphabet carries U+FEFF, U+0085, U+2028, an astral scalar and a combining mark. Extension: `decodeText` refuses invalid UTF-8 (`scan.test.ts`), `position.test.ts` UTF-16 columns |
| BUG-5 | E | finding | grep above: `sort.ts` used bare `localeCompare` (`paths-le-bugs-4`); `scan.ts` and `extractWorkspace.ts` use the plain comparison and say why; `javascript.ts`/`css.ts` sort by position; `ignore.ts` by base length (deliberate: nearer file wins). First-match order in `resolveFormat` (format, whole name, extension) is tested on both sides |
| BUG-6 | all | pass | Module-level `g` patterns reset `lastIndex` before each loop (`javascript.ts` 48, `html.ts` 22, `css.ts` 24 and 39; read). Backtracking: `fuzz.rs` `extraction_never_panics_and_stays_inside_the_document` with a 2 s per-input bound and repetition mutations, 20 s per target here, 60 s in CI; the differential's 900 documents. Patterns are ASCII, no `u` flag needed. Duplicates under BUG-10 |
| BUG-7 | E | finding | `paths-le-bugs-6`. No `parseInt` in `src`. `readMaxResults` requires an integer (`mcp.test.ts`). Columns are UTF-16 counts; machine output is `JSON.stringify` |
| BUG-8 | E | finding | `paths-le-bugs-2` (URL scheme and drive letter rewritten), `paths-le-bugs-3` (folder from `process.cwd()`). Pass elsewhere: drive-letter case (`scan.test.ts` "knows a Windows folder whichever case…"), trailing slash (`labelOf`), spaces (corpus "avatar with space"), backticks and pipes escaped in the report (`code()`), non-`file` scheme skips `realpath` (`isVirtualWorkspace`) |
| BUG-9 | E | pass | grep above: `policy.ts` 45 (`globalState` read, narrowed field by field after), `transport.ts` 81 (after an object check) and 121 (`arguments`, every field type-checked in `tools.ts`), `scan.ts` `path[1] as string` after a regex test. No `: any`, no non-null `!` |
| BUG-10 | E | pass | Duplicate names: `walk`, `createLocator`, `claim` in `toml.ts` and `yaml.ts` (the same locator design, documented on both sides of the crate as deliberate twins); `readQuoted` in `csv.ts` and `fallback.ts` (different meaning, module-private, every call site inside its own module). Read both bodies of each |
| BUG-11 | E | finding | `extract.ts` `fallbackCount` branch announced a failure nothing had (`paths-le-errors-2`); `safety.ts` `warnings` computed and never read (`paths-le-features-1`) |
| BUG-12 | E | pass | Config, results and defaults are `Object.freeze`d; no site writes to a parameter or a module constant (read) |
| BUG-13 | E | finding | "Canonical resolution failed" contradicted the resolver, which never fails (`paths-le-errors-2`); the help page contradicted the engine (`paths-le-features-3`). `safety.ts`'s "Safety checks passed" messages are never shown |
| BUG-14 | E | n/a | No preview of a sensitive value; error text is redacted by `sanitizeErrorMessage` |
| BUG-15 | M C | finding | Driven on both servers: `constructor`/`__proto__` disagree (`paths-le-bugs-1`, fixed); malformed TOML and YAML agree on an empty `ok` answer (`paths-le-bugs-5`, fixed); truncated JSON `{"a": "./x.ts", "b": ` disagrees, npm 1 path, crate 0 (`paths-le-bugs-7`, fixed); 200,000-deep JSON and 20,000-deep TOML disagree, npm `isError` "Maximum call stack size exceeded", crate `ok` with no paths (`paths-le-bugs-8`, fixed); 100,000-deep flow YAML agrees (both empty) |
| BUG-16 | C | pass | `cargo clippy --all-targets -- -D warnings` (pedantic, per `crate/AGENTS.md`); `as` casts: `dotenv.rs` `index_of` ports JavaScript's `-1` arithmetic with `.max(0)` and says so, `fuzz.rs` bounded; slicing: every `[..]` is on an offset from `find`, `len_utf8` or `floor_to_boundary`, and the fuzz target catches a mid-character slice (it found one before this pass, per its own comment); recursion: deep documents above are answered, not panicked, on the crate side |
| BUG-17 | all | pass | Each invariant in `AGENTS.md` names its test; the ones added by this pass name theirs (`docs` commit) |

## Step 4: Errors

Re-read for this step: every INV-7 file, every command file, every file that calls a `vscode` API, `utils/errors.ts`, `ui/notifier.ts`, `src/__mocks__/vscode.ts`, `mcp/transport.ts`, `mcp/tools.ts`, `mcp/envelope.ts`; in the crate `audit.rs`, `walk.rs`, `resolve.rs`, `cli.rs`, `main.rs`, `mcp/mod.rs`, `mcp/extract.rs`; `scripts/*`, `.github/workflows/*`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | E M C | finding | Every INV-7 row answered. `ignore.ts` 101 inert (every branch escapes; comment). `scan.ts` 159 swallows a `.gitignore` that cannot be read: a rule set that is incomplete, with the effect of reading more files, not fewer; observation. `scan.ts` 178, 195 by design. `scan.ts` 226 → `paths-le-errors-3`. `pathResolver.ts` four catches fall back to the path as written, commented, the behaviour the README documents. `envelope.ts` → `isError`. `ratingPrompt.ts` 92 → telemetry, commented. `output.ts` 132, `workspaceShared.ts` 68 → warning shown, tested. `transport.ts` → protocol errors, tested. `toml.ts` 18, `yaml.ts` 25 → `paths-le-bugs-5`. New `guard.ts` → error shown, tested. Crate: every `Err` reaches a diagnostic or an exit code (`contracts.rs`) |
| ERR-2 | E M C | finding | Entry points traced: a malformed CSV refuses (both sides, tested); a malformed TOML, YAML or JSON arrived at the same empty `ok` answer as a clean document (`paths-le-bugs-5`, `-7`, `-8`, fixed as one shared contract change in `faf189b` and `a117df6`). Crate: an unreadable file is a `skipped` diagnostic, never silence (`hazards.rs`, `contracts.rs`) |
| ERR-3 | M C | finding | Driven, both servers: `"name,size\n/etc/passwd,1\n` as CSV → `ok: false`, `parsing`/`error`, "Invalid CSV: quoted field is never closed (row 1, cell 1)". TOML `secret = "/etc/passwd"\nbroken = [\n` and YAML `secret: /etc/passwd\nbad: [unclosed\n` → `ok: true`, no paths, no diagnostics at baseline; after `faf189b` both answer `ok: false` with "Invalid TOML: the document does not parse" and "Invalid YAML: the document does not parse" (`paths-le-bugs-5`) |
| ERR-4 | E C | finding | `scan.ts` called a deleted file "not UTF-8 text" (`paths-le-errors-3`); `extract.ts` called an unchanged path a failure (`paths-le-errors-2`). Crate: a mode-000 file → `{"severity":"info","code":"skipped","message":"Permission denied (os error 13)"}` (driven), "not UTF-8 text" only for a decode failure (`contracts.rs`) |
| ERR-5 | E | pass | `applyEdit` checked at all three sites, tested with `_setApplyEditResult(false)`. `showTextDocument` result unused (void); its rejection reaches the guard. `clipboard.writeText` in try/catch, warning shown, tested. `openExternal` awaited; its `false` is not read (Learn More may silently not open; observation). `executeCommand` awaited, rejection guarded. `workspace.fs.*` caught and counted |
| ERR-6 | E M | pass | `void respond(...).then(write)` in `transport.ts`: `respond` catches everything and returns a response, so the chain cannot reject; `void recordSuccess()` has its own try/catch; no `async` event handler. Every other promise is awaited or returned |
| ERR-7 | E | finding | No command had an outer handler (`paths-le-errors-5`). Driven after the fix: `openTextDocument` rejecting in `extractPaths` and `extractWorkspace`, `applyEdit` rejecting in dedupe and sort, each one error notification, the command resolved, the status bar idle |
| ERR-8 | E M | pass | `error instanceof Error ? error.message : String(error)` in `guard.ts`, `transport.ts`, `output.ts`, `workspaceShared.ts`; `(error as { code?: unknown })?.code` type-checked; `firstError.message ?? 'Unknown error'` |
| ERR-9 | E C | pass | `grep console\.` in `src` → none. Scan shortfalls reach the report: too large, not text, unreadable, file limit, results limit, ignored. Crate: binary files counted on stderr, unreadable files as `skipped` diagnostics |
| ERR-10 | E | pass | Direct `show*Message`: `extract.ts` 173 (a three-button dialog awaiting a choice), `ratingPrompt.ts` 67 (documented bypass: honours only a level the user set). Everything else goes through `notifier` |
| ERR-11 | E | pass | Dismissed quick pick (`commands.test.ts` "does nothing when the quick pick is dismissed"), dismissed dialog (`extract.test.ts` "stops when the dialog is dismissed"), cancelled folder dialog (`extractWorkspace.test.ts`) each stop quietly |
| ERR-12 | E | finding | Hooks at baseline: `_setApplyEditResult`, `_setClipboardError`, a missing path for `fs.stat`/`fs.readFile`. Added by this pass: `_setOpenTextDocumentError`, `_setApplyEditError`, `_statusBarItems`, `_outputChannels`, `_webviewPanels`, `_setLmApi`, a path-prefix `getWorkspaceFolder`, document `version`, disposal tracking and `_live()`. Still without a failure hook: `showTextDocument`, `findFiles`, `withProgress`, `executeCommand`, `openExternal`; observation |
| ERR-13 | E | pass | Tests titled for errors and defaults read: `pathResolver.test.ts` "falls back to the input for a path that does not exist" pins documented behaviour; none pinned a defect fixed here. `commands.test.ts` asserts the English dedupe toast, which the localized template reproduces |
| ERR-14 | M | finding | Malformed JSON, not a request, unknown method, unknown tool, missing argument: `mcp.test.ts`, and driven on both servers. Oversized: no error of any kind at baseline (`paths-le-leaks-1`); now a parse error naming the limit. stdout carries only protocol lines (driven: stdin closed with nothing → exit 0, empty stdout) |
| ERR-15 | C | pass | `expect(...)` only on constant patterns and test scaffolding; `unwrap_or`/`map_or` elsewhere; `hazards.rs` asserts exit 0, 1 or 2 and never a signal over its whole tree; 200,000-deep JSON, 20,000-deep TOML, 100,000-deep YAML answered without a panic (driven) |
| ERR-16 | C | pass | `hazards.rs`: mode-000 file (named, strict exit 2), symlink loop, FIFO never opened, directory named like a file, path over 260 characters; `scenarios.rs`: unreadable directory exits 2 and names it. A file removed between listing and read takes the same `Err` path as mode-000 and is named with the OS error (driven above) |
| ERR-17 | N E | finding | `grep -rnE '\|\| true\|continue-on-error\|2>/dev/null' scripts .github/workflows`: `release.yml` 106 counts VSIX files and fails unless exactly one (fail-closed); `ci-crate.yml` 188 `\|\| true` keeps a no-match grep alive and fails on any hit (fail-closed); `release-crate.yml` 94–99 silenced a parse failure into "unpublished" (`paths-le-errors-4`, fixed). No `continue-on-error`; every `spawnSync` in `scripts/` checks `status` (read) |

## Step 5: Memory leaks

Re-read for this step: `src/extension.ts`, every INV-5 file, every command and provider file, `mcp/transport.ts`, `mcp/server.ts`; crate `walk.rs`, `audit.rs`, `mcp/mod.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | INV-5: every disposable VS Code returns is pushed to `context.subscriptions` at creation; none is created per command run (`src/lifecycle.test.ts` "repeated runs do not grow") |
| LEAK-2 | E | pass | One `onDidChangeConfiguration` listener, pushed to subscriptions; the panel's `onDidDispose` ends with the panel. `_live().configListeners` is 1 after fifty runs and 0 after deactivation |
| LEAK-3 | E M | n/a | `grep setTimeout\|setInterval src` (non-test) → none |
| LEAK-4 | E | pass | The help panel and, now, the telemetry channel are created on first use and released by `webView.dispose`/`telemetry.dispose`, both pushed to subscriptions at activation; `lifecycle.test.ts` "help panel, whether or not it was ever opened" |
| LEAK-5 | E | finding | No test called a `dispose` twice or checked what it released (`paths-le-leaks-2`); `lifecycle.test.ts` "dispose is complete and safe to repeat" now does, for the status bar, the channel and the panel |
| LEAK-6 | E | finding | No deactivation test (`paths-le-leaks-2`). The mock now tracks disposal; `lifecycle.test.ts` activates with agent mode's API present, runs all seven commands, disposes every subscription and asserts `_live()` is all zero |
| LEAK-7 | all | finding | `resolvedPathCache`: adds on resolve, FIFO eviction at 1,000 (read). `transport.ts` `buffer`: no maximum (`paths-le-leaks-1`, fixed at 16 MiB). Crate: no statics but a test counter |
| LEAK-8 | E | pass | Long-lived closures hold the status bar item, the channel, the panel reference and the config; no document text, report or tree outlives its command (read) |
| LEAK-9 | E | pass | The extension spawns nothing; the MCP server is spawned by the editor from the definition the provider returns, and ends with the editor's session |
| LEAK-10 | E | finding | No repeated-run test (`paths-le-leaks-2`); `lifecycle.test.ts` "fifty extractions, fifty help commands" holds `_live()` equal after one and after fifty |
| LEAK-11 | M | finding | `paths-le-leaks-1`: the buffer had no maximum. Fixed: `MAX_FRAME_BYTES`, a parse error past it, the rest of the line dropped |
| LEAK-12 | M | finding | Driven, built server, 3,000 `tools/call` over one session (200-import TypeScript document each): RSS 279 MB after 500, 480 MB after 1,000, 480 MB after 1,500, 2,000, 2,500 and 3,000: flat. Newline-free input before the fix: 433 MB at 16 MiB, 737 MB at 64 MiB and climbing; after: 470 MB at 64 MiB, 465 MB at 128 MiB. The repo had no driver (`paths-le-leaks-3`): `scripts/check-mcp-memory.js` now |
| LEAK-13 | M | pass | Driven: stdin closed with nothing written → exit 0, no output; stdin closed mid-request → exit 0, no output |
| LEAK-14 | C | pass | `hazards.rs` 1 MB line and 100,000 lines; `budget.rs` 501 files, 3,000 paths, 3 s ceiling and a 6× linearity bound (both run, gate `c-budget`); `walk.rs` yields files one at a time (read) |
| LEAK-15 | C | pass | `scenarios.rs` "a_symlink_loop_is_answered_not_hung" (verdict `missing`); `hazards.rs` two-step cycle resolved, not spun |
| LEAK-16 | C | pass | Reads are scoped `std::fs::read`; no temporary files in `src/`; every test `Tree` removes itself in `Drop` and re-opens permissions first |
| LEAK-17 | tests | pass | `bun run test` three times and `vitest run --pool=threads --sequence.shuffle`: 424/424 each (baseline), 455/455 at close. One real timer in tests: `mcp.test.ts` `settle()` (20 ms) flushes the serve harness; it passed in every run |

## Step 6: Race conditions

Re-read for this step: every INV-6 file, `src/extension.ts`, `utils/pathResolver.ts`, `mcp/transport.ts`; crate `walk.rs`, `audit.rs`, `testing.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | finding | INV-6 rows: `extract.ts` reads the text before three awaits and the replace route wrote it back unchecked (`paths-le-races-1`); the config snapshot is coherent; `sort.ts` re-reads the document after the pick; `extractWorkspace.ts` snapshots config and limits and checks the token per file; `ratingPrompt.ts` writes before the toast; `scan.ts` 229, 234 → `paths-le-errors-3`; `transport.ts` carries its id |
| RACE-2 | E | finding | `paths-le-races-1`: the replace route now compares `document.version` with the version read and refuses with an error. Reproduced with a controlled interleaving: the dialog responder advances the version before answering Continue |
| RACE-3 | E | finding | No command had a concurrent-invocation test (`paths-le-races-2`). Policy read from the code: every command runs independently; shared state is the status bar text, which the second run resets while the first still runs, and the canonical-warning flag, which two first runs may both prompt for. `races.test.ts` drives each command twice at once |
| RACE-4 | E | pass | `resolvedPathCache`: read, await, write of the same value (a lost update writes what was already there). `transport.ts` `buffer`: read and written inside one synchronous `data` handler |
| RACE-5 | E | pass | The rating ask is written before the toast (`ratingPrompt.test.ts`, invariant). The canonical-warning flag is written after the dialog on purpose: a window closed with the dialog open never answered it |
| RACE-6 | E | pass | `scanFiles` checks the token before every file (`scan.test.ts` "reports a cancel and reads no further"); a cancelled scan delivers nothing (`extractWorkspace.ts` 129) |
| RACE-7 | E | pass | `getConfiguration()` once at the start of each command; `notifier` reads the level per message, deliberately |
| RACE-8 | E | pass | `onDidDispose` clears the panel reference; telemetry after dispose cannot occur because every command that emits is disposed first (`lifecycle.test.ts`) |
| RACE-9 | E | pass | `activate` is synchronous: services, commands, settings, provider, one event. The status bar item is bound to `paths-le.extractPaths` three statements before the command registers, inside one tick |
| RACE-10 | E M | pass | `listFiles` sorts by path, `distinct` by count then value, both plain comparisons; MCP paths in document order (`javascript.ts`/`css.ts` sort by position). Four unit runs byte-identical |
| RACE-11 | E C | finding | `paths-le-errors-3` (fixed): a file gone between listing and read is counted as unreadable and named so. Crate: named with the OS error (ERR-16) |
| RACE-12 | M | pass | Driven against the built server: one `tools/call` holding `café` and `naïve`, split at every one of its 157 byte offsets including inside both multi-byte characters: 157 of 157 parsed exactly once with the right answer. `mcp.test.ts` holds one split and every-character splits in the harness (`paths-le-races-2`) |
| RACE-13 | M | pass | Handlers are pure functions over the arguments; `mcp.test.ts` "handles several requests in one chunk" answers ids `[3, 4]` in order; no module-level value is written by a handler |
| RACE-14 | M | pass | Driven: stdin closed after `{"jsonrpc":"2.0","id":9,"method":"ping"` (no newline) → exit 0, nothing written |
| RACE-15 | C | pass | `grep -rnE 'rayon\|thread::\|tokio\|async fn\|Mutex\|RwLock\|Arc<\|static mut\|Atomic' crate/src` → only `testing.rs` 15, 17: an `AtomicUsize` counter for unique test directories. No parallelism |
| RACE-16 | C | pass | `platform.rs`: TZ set, unset and Pacific/Kiritimati produce one report; case-folding filesystem reports a file once; separators forward on every platform (gates `c-platform`, `c-test-tz`, `c-test-notz`) |
| RACE-17 | tests | pass | Three runs and a shuffled threaded run: identical counts, no failure. No gate from BASE-5 failed once and then passed. The one real timer is `mcp.test.ts` `settle()` |

## Step 7: Translations

Read for this step: `package.json`, `package.nls.json`, the 12 `src/i18n/package.nls.*.json`, `l10n/bundle.l10n.json`, the 12 `l10n/bundle.l10n.*.json` (every value), `test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n` scripts, every INV-8 file.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | `diff <(grep -oE '%[^%" ]+%' package.json …) <(jq -r 'keys[]' package.nls.json …)` → empty |
| L10N-2 | E | pass | Key parity loop over both mechanisms → no `DRIFT`; held by `test/integration/l10n.test.ts` and now `src/l10n.test.ts` |
| L10N-3 | E | pass | 12 locales in both mechanisms: de, es, fr, id, it, ja, ko, pt-br, ru, uk, vi, zh-cn; `bun run check:locales ../` at close |
| L10N-4 | E | finding | Script over every `l10n.t(` first argument: 46 strings in source, 42 bundle keys, 4 missing, 0 dead (`paths-le-translations-1`, fixed, with the gate `src/l10n.test.ts`) |
| L10N-5 | E | finding | INV-8 classified: eight strings never went through `l10n.t()` (`paths-le-translations-2`, fixed). Never-translate, with reasons: codicon `$(file-directory) Paths-LE` and `$(loading~spin)`; the output channel name `Paths-LE Telemetry`; `Paths-LE` passed as `{0}` to the report title; the generated report's markdown structure; MCP, CLI and JSON-RPC text (machine-read); the help page's body (carried, `paths-le-translations-4` note) |
| L10N-6 | E | finding | Every call site read: all inside a function body (`statusBar.ts` 18 inside `createStatusBar`). `scripts/check-bundle.js` in this repo has no module-scope rule, unlike the sample repo's; the bundle gate now refuses a top-level `const`/`let` that calls `l10n.t(` (`paths-le-translations-3`) |
| L10N-7 | E | pass | Every key is a string literal; `src/l10n.test.ts` "every call hands l10n.t() a string literal" |
| L10N-8 | E | pass | VSIX listing: 13 `package.nls*.json`, 12 `l10n/bundle.l10n.*.json` (the English source bundle is deliberately not shipped, `.vscodeignore` says why). `ls package.nls*.json` at the root → only `package.nls.json`: `clean:i18n` left nothing |
| L10N-9 | E | finding | At baseline no test showed a translated string in a non-English host; `test/integration/l10n.test.ts` explains why the harness cannot call `vscode.l10n` itself (it is scoped to the calling extension, so the runner's call resolves against its own empty bundle). Fixed as `paths-le-translations-4`: a second test-cli config launches the host with `--locale=de` and the German language pack installed into its profile, runs the folder scan and reads the German report the extension wrote (`f73d445`; a warm-up launch registers the pack first, since a fresh profile applies it only from its second launch, `48892f0`) |
| L10N-10 | E | pass | Placeholder loop → empty; held by both l10n tests |
| L10N-11 | E | pass | Runtime: fr `Occurrences` (the same word in French). Manifest: `manifest.command.category` = `Paths-LE` in all 12 (product name). Nothing else identical |
| L10N-12 | E | pass | `.gitignore`, `UTF-8` and `Paths-LE` appear in every locale the same number of times as in English (1, 1, 3); no codicon or URL in the bundles |
| L10N-13 | E | finding | Every value read in its place. Wrong: "Extracted {0} paths from document" rendered the count as a name in de, es, fr, id, it, ja, pt-br, ru, uk, vi, zh-cn; "Sorted {0} paths ({1})" rendered the sort order as a count in ja, ko, zh-cn and had the wrong noun case in ru; ja "Continue" read as "read more" (`paths-le-translations-5`, corrected). `unknown` for none: every value was judged |
| L10N-14 | E | pass | No English fragment and no foreign-locale value found by reading; `check:locales` at close |
| L10N-15 | E | pass | `{0} file(s)` forms: ru and uk use the colon form ("Прочитано файлов: {0}"), de "Datei(en)", ja/ko/zh-cn count words; the eight new strings follow the same shapes |
| L10N-16 | E | pass | Manifest and runtime agree within each locale on "Pfade"/"rutas"/"chemins"/"jalur"/"percorsi"/"パス"/"경로"/"caminhos"/"пути"/"шляхи"/"đường dẫn"/"路径"; ja dedupe title "重複排除" against runtime "重複を除去" is the same term in two forms |
| L10N-17 | E | pass | `grep -rnE "\.label ===\|=== '[A-Z][a-z]+"` → none. Dialog answers compared to bound labels (`extract.ts`, `ratingPrompt.ts`); the sort pick by `.value` |
| L10N-18 | E M C | pass | The repo's rule (read from `extractWorkspace.ts`, `tools.ts`, the crate): the markdown report is for a person and is localized through `l10n.t()`; MCP envelopes, diagnostics messages and CLI JSON Lines are machine-read and English only. Clipboard copies carry the same text as the screen |
| L10N-19 | C M | pass | `grep -rn 'l10n\|gettext\|locale' crate/src` → none; the npm server imports no `vscode` and no catalogue (`check-mcp-bundle.js`). Neither surface produces localized text, so L10N-2 to L10N-16 do not apply to them |

## Findings

Every fix is one commit on `fix/fleet-pass`, named by its finding id in the commit body. "Failed without fix" is the test's output with the fix absent, taken before the fix was written; the logs are in the pass's scratch directory and the decisive line is quoted.

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| paths-le-bugs-1 | bugs | `mcp/fileType.ts` looked `ALIASES[name]` up on a plain object, so a `filename` or `format` that is an `Object.prototype` name resolved to a function or the prototype. `filename: "constructor"` made the npm server drop `fileType`; `format: "__proto__"` answered `fileType: {}`; the crate answered `unknown` for both | `printf '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"extract_paths","arguments":{"content":"x = \"./a.txt\"","filename":"constructor"}}}\n' \| node dist/mcp-server.js` → no `fileType`; same to `paths-le mcp` → `"fileType":"unknown"` | `56bb67c` | `mcp.test.ts` "does not read a prototype key as a format" | `AssertionError: expected [Function Object] to be 'unknown'` |
| paths-le-bugs-2 | bugs | With `resolution.resolveWorkspaceRelative` on, `normalizePath` collapsed a URL's `//` and `path.resolve(workspace, value)` nested it under the folder: `https://example.com/a/b` → `/workspace/https:/example.com/a/b`. A drive-letter path met the same fate on POSIX | `pathResolver.test.ts` | `9048caa` | `pathResolver.test.ts` "leaves a URL as written, whatever the resolution settings", "does not nest a drive-letter path under the workspace" | `expected '/workspace/https:/example.com/a/b' to be 'https://example.com/a/b'`; `expected '/workspace/C:/Temp/x.txt' to be 'C:/Temp/x.txt'` |
| paths-le-bugs-3 | bugs | `getWorkspaceFolderForPath` resolved a relative value against `process.cwd()` of the extension host and asked which folder holds that; in a multi-root workspace nothing did, and workspace-relative resolution silently did nothing | `extract.test.ts`: two folders, document in `/second/app.json` | `59f2608`, test spelled for Windows in `6da17a7` | `extract.test.ts` "resolves against the folder the document is in" | `expected './src/index.ts' to be '/second/src/index.ts'` |
| paths-le-bugs-4 | bugs | `sort.ts` ordered with a bare `localeCompare`, so "Alphabetical" followed the host's locale and differed from the scan report, which uses the plain comparison and says why | `commands.test.ts` | `8bb4128` | `commands.test.ts` "orders alphabetically by code unit, the same on every machine" | `expected 'a\nA\nb\nB' to be 'A\nB\na\nb'` |
| paths-le-bugs-5 | bugs | A malformed TOML or YAML document holding a path answers `ok: true`, no paths, no diagnostics, from both servers; only CSV refuses. The repo's own invariant names this class as the one the tool exists to prevent | TOML `secret = "/etc/passwd"\nbroken = [\n`, YAML `secret: /etc/passwd\nbad: [unclosed\n` through both servers → `{"ok":true,"data":{"paths":[]},"diagnostics":[]}` | `faf189b` | `toml.test.ts`, `yaml.test.ts` "refuses a document that does not parse, and says why"; `mcp.test.ts` "names a parser-backed document its reader refused"; crate `toml.rs`, `yaml.rs` `a_document_that_does_not_parse_is_refused_and_named`; `contracts.rs` `a_malformed_yaml_or_toml_exits_two_and_names_why`; corpus cases for TOML and YAML | `expected [] to deeply equal { Object (refusal) }`; crate contract against the old reader: `assertion left == right failed, left: 0, right: 2` (the exit code) |
| paths-le-bugs-6 | bugs | `config.ts` `readNumber` coerced with `Number(...)`; `''` and `null` read as 0 and clamped to the floor, so the size guard became 1,000 bytes | `_setConfig('paths-le.safety.fileSizeWarnBytes', '')` | `bc4d8e5` | `config.test.ts` "falls back to the default when the stored value is not a number" | `AssertionError: expected 1000 to be 1000000` |
| paths-le-bugs-7 | bugs | A JSON document cut off mid-value disagrees between the servers: npm's `jsonc-parser` recovers a partial tree and answers 1 path, the crate's parser gives up and answers 0; both `ok`, neither names the malformation | `{"a": "./x.ts", "b": ` as `json` through both servers | `faf189b` | `json.test.ts` "refuses a document cut off mid-value"; crate `json.rs` `a_document_that_does_not_parse_is_refused_and_named`; corpus "a json document cut off mid-value refuses rather than reading what parsed"; `mcp.test.ts` as above | `expected [ { value: './x.ts', …(3) } ] to deeply equal { Object (refusal) }` |
| paths-le-bugs-8 | bugs | A document nested deeper than a call stack disagrees: 200,000-deep JSON and 20,000-deep TOML make the npm server answer `isError` "Maximum call stack size exceeded" (and the extension command would show that text), while the crate answers `ok` with no paths. Neither names the document as unreadable | `python3 -c "print('['*200000 + '\"./x.ts\"' + ']'*200000)"` as `json`; `'a = ' + '{ b = '*20000 + '"./x.ts"' + ' }'*20000` as `toml` | `a117df6` | `nesting.test.ts` (the scanner, mirrored in `nesting.rs`); `json.test.ts`, `toml.test.ts`, `yaml.test.ts` "refuses a document nested deeper than the bound", which also reads one at the bound; crate `a_document_nested_deeper_than_the_bound_is_refused` in each reader; corpus "a json document nested deeper than the bound refuses rather than overflowing". Bounds measured by driving both servers: JSON 512, TOML 80, YAML 96 | `expected { Object (paths) } to deeply equal { Object (refusal) }` |
| paths-le-errors-1 | errors | The status bar spinner went up before the security dialog and came down only on the successful path; a dismissed dialog, Disable and Continue, Learn More, or a throw in the output step left it spinning | `extract.test.ts` with the real `createStatusBar` | `f63d50f` | `extract.test.ts` "the status bar is reset however the command ends" (three cases) | `expected '$(loading~spin) ⚠️ Resolving canonica…' to be '$(file-directory) Paths-LE'` |
| paths-le-errors-2 | errors | "⚠️ Canonical resolution failed, using original paths" was shown whenever no path changed, which is also what happens when every path was already canonical or is a URL; the resolver never fails | `extract.test.ts`: `{"a": "/etc/hosts", "b": "https://example.com/x"}` with resolution on | `cedb8b1` | `extract.test.ts` "does not report a failure when every path was already canonical" | `expected [ Array(1) ] to deeply equal []` |
| paths-le-errors-3 | errors | `scan.ts` counted a file whose `stat` or `readFile` threw (gone after listing, permission denied) as `notText`, and the report said it "is not UTF-8 text" | `scanFiles` over a listed `Uri` with no file behind it | `51bde70` | `scan.test.ts` "counts a file that could not be read apart from one that is not text"; `unreadNotes` "has a line for each thing left unread" | `expected { read: 1, tooLarge: +0, …(3) } to deeply equal { …(4) }` |
| paths-le-errors-4 | errors | `release-crate.yml`: the crates.io probe silenced its JSON parse (`2>/dev/null`) and piped it into the same `grep` as a real answer, so a body that was not JSON printed "unpublished — safe to release" and the publish ran | The step body with `body='<!doctype html>'` → "0.3.5 is unpublished — safe to release", exit 0 | `44ed440` | Driven: the step body with five fixed answers (HTML page, non-list JSON, listed, absent, never-published) | before: HTML body exit 0 "safe to release"; after: exit 1 "did not answer with a version list" |
| paths-le-errors-5 | errors | No command body had an outer handler; a rejection from `openTextDocument`, `applyEdit`, `findFiles` or `withProgress` escaped as an unhandled rejection the editor reported in its own words, raw message and home directory included | `_setOpenTextDocumentError`, `_setApplyEditError` (mock hooks added) | `bb7b43f` | `extract.test.ts` "a failure inside the command"; `extractWorkspace.test.ts` "reports a failure inside the command instead of rejecting"; `commands.test.ts` "post-process: a failure inside the command" | `Error: disk full at /Users/someone/out` (the command rejected); `Error: the editor is read-only right now` |
| paths-le-features-1 | broken-features | `safety.largeOutputLinesThreshold` ("Warn above this line count") changed nothing a user could see: `safety.ts` put the warning in `warnings`, which `extract.ts` never read | `extract.test.ts`: 151-line JSON with the threshold at 100 | `a44bae6` | `extract.test.ts` "shows the large-output warning the setting promises" | `expected [] to have a length of 1 but got +0` |
| paths-le-features-2 | broken-features | `telemetryEnabled` was read once in `createTelemetry` at activation; changing it took effect only after a reload, and the description does not say so | `services.test.ts` | `c63b9e1` | `services.test.ts` "follows the setting while running, without a reload" | `expected [] to have a length of 1 but got +0` |
| paths-le-features-3 | broken-features | The help page listed seven file types, omitted YAML, TSV and the text scan, and told a user with no results to "check if the file type is supported" | `ui/webView.test.ts` | `af16861` | `ui/webView.test.ts` (three tests) | `tsv: expected '…<html lang="en">…' to match /\bTSV\b/`; `to match /text scan/i`; `not to match /file type is supported/i` |
| paths-le-features-4 | broken-features | Tests that asserted nothing or were missing: the status bar's visibility and progress text, `workspace.scanPatterns` at any value but its default, the new-file and side-by-side output routes, the README's promise that a scan never resolves, and the MCP provider's registration on a host with the API | test-gap | `debd512` | `services.test.ts` statusBar and "mcp provider"; `scan.test.ts` "reads only the files the patterns name"; `extract.test.ts` "where the results go"; `extractWorkspace.test.ts` "reports each path as written, whatever the resolution settings say" | test-gap: the behaviour was right and untested; the mock gained `_setLmApi`, `_statusBarItems`, `asAbsolutePath` and records the definition the provider builds |
| paths-le-features-5 | broken-features | `--no-ignore` was the one CLI flag no test drove | test-gap | `7d03122` | `crate/tests/contracts.rs` "no_ignore_reads_what_gitignore_leaves_out" | test-gap: the flag worked and nothing held it |
| paths-le-leaks-1 | memory-leaks | `transport.ts` `serve` appended every chunk to `buffer` until a newline with no maximum; an oversized message produced no error | 64 MiB of `y` with no newline into `dist/mcp-server.js`: RSS 737 MB (16 MiB: 433 MB), no output | `9aebe9f` | `mcp.test.ts` "refuses a line over the frame limit and keeps serving" | `expected undefined to be -32700` |
| paths-le-leaks-2 | memory-leaks | No test called `dispose` twice, deactivated and looked for what was left, or ran a command many times and compared what was alive | test-gap | `01e0a10` | `src/lifecycle.test.ts` (five tests); mock disposal tracking and `_live()` | test-gap: nothing leaked; nothing held it |
| paths-le-leaks-3 | memory-leaks | The repo had no driver that samples the server's memory across many calls | test-gap | `53be8e2` | `scripts/check-mcp-memory.js`, `bun run check:mcp-memory` (hand-run) | 3,000 calls: 279 MB at 500, 480 MB from 1,000 to 3,000, flat |
| paths-le-races-1 | race-conditions | In replace mode the paths were computed from the text read at the start and written over the whole document after the security dialog and the resolver; typing during the dialog was discarded under "Extracted N paths from document" | `extract.test.ts`: the dialog responder advances `document.version` before answering Continue | `d72cacf` | `extract.test.ts` "does not replace text it did not read", "replaces when nothing changed" | `expected [ WorkspaceEdit{ …(1) } ] to have a length of +0 but got 1` |
| paths-le-races-2 | race-conditions | No command had a concurrent-invocation test, and the stdio loop had one split-chunk test | test-gap | `841fa0a` | `src/races.test.ts` (four tests); `mcp.test.ts` "reassembles a request split at every character boundary", "…inside a multi-byte character" | test-gap; the built server was also driven at every one of 157 byte offsets, 157 correct |
| paths-le-translations-1 | translations | Four `l10n.t()` strings were in no bundle and showed in English everywhere: the three "the edit was rejected" errors and the clipboard warning | script over `l10n.t(` first arguments vs bundle keys: 46 vs 42 | `482c02b`, moved out of `src/i18n/` in `5e092fc`, pattern flag in `ba1d99f` | `src/l10n.test.ts` "every string passed to l10n.t() is in the bundle" | `expected [ …(4) ] to deeply equal []` |
| paths-le-translations-2 | translations | Eight user-visible strings never went through `l10n.t()`: the dedupe toast (a template literal plus a suffix), two status bar messages, the size refusal and two safety warnings, the help panel title | read; the gate run with the catalogue ahead of the source | `ece8ba7` | `src/l10n.test.ts` "every key in the bundle is passed to l10n.t() somewhere" | `expected [ 'Extracting paths...', …(7) ] to deeply equal []` |
| paths-le-translations-3 | translations | Nothing refused an `l10n.t()` call at module scope; this repo's `check-bundle.js`, unlike the sample repo's, has no such rule | test-gap | `b35183c` | `src/l10n.test.ts` "never calls l10n.t() at module scope" | `× never calls l10n.t() at module scope` with a probe module holding `const PROBE = vscode.l10n.t('probe')` |
| paths-le-translations-4 | translations | No test shows a translated string in a non-English host; `test/integration/l10n.test.ts` documents why the harness cannot (`vscode.l10n` is scoped to the calling extension) | L10N-9 | `f73d445`, and `48892f0` for a fresh profile | `test/locale/german-host.test.ts` "runs in German", "shows the runtime half in German: the workspace report", under the `german host` config in `.vscode-test.mjs` (`--locale=de`, `MS-CEINTL.vscode-language-pack-de` installed into the test profile); `test/locale-setup/german-pack.test.ts` "is installed into the test profile" under the `german language pack` config that launches first, because a pack's registration is written by the first launch that finds it installed and read by the next | Without the pack the host reported `en` and the report read "# Paths-LE workspace report": `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal`. On a fresh profile, which every CI run is, the same two assertions failed on the first launch even with the pack installed: CI on `29701b5` (macOS and Ubuntu), and two fresh local profiles (`fail/translations-4-fresh-profile.log`); with the warm-up launch first, both pass. The manifest half, the command titles, is not shown: the host does not localize the manifest of an extension loaded from a development path, and the test says so |
| paths-le-translations-5 | translations | Wrong values: "Extracted {0} paths from document" rendered the count as a name in de, es, fr, id, it, ja, pt-br, ru, uk, vi, zh-cn ("{0}-Pfade", "las rutas de «{0}»", "Extraí os caminhos {0}"); "Sorted {0} paths ({1})" rendered the sort order as a count in ja, ko, zh-cn and declined the noun wrongly in ru; ja "Continue" read "続きを読む" (read more) | every value read in its place | `17b4650` | The corrected catalogues; the before/after values are in the scratch log `translations-5-before.json` | semantic: no mechanical check can catch this class |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| FEAT-4, FEAT-9 | Menus and 27 of 28 activation events were read, not driven; a menu cannot be driven headless | A real display, or a host test that opens one document per language id and asserts `isActive` |
| Observation | What the parsers accept differs in two known places, recorded in `crate/SPEC.md`: `@iarna/toml` (TOML 0.5) refuses a mixed-type array that `toml` (1.0) reads; `js-yaml` refuses a duplicate key, a complex key and an invalid `!!binary` payload that `saphyr` reads. A document in one of those shapes is refused by the extension and read by the crate | A parser upgrade on the extension side, or a corpus case per shape once both parsers agree |
| Observation | The manifest half of localization, the command titles, is shown by no test: the host does not localize the manifest of an extension loaded from a development path. The German catalogue's presence in the VSIX is held by the packaging gate and its keys by the parity tests | A `--locale=de` run of the installed-VSIX test that reads a command title |
| Observation | `ui/ratingPrompt.ts` keys the Open VSX review page on publisher `offensiveedge` (AGENTS.md says the Open VSX build publishes under that name) while the README and the crate README link Open VSX under `nolindnaidoo`. Family-wide file, outside this pass | The owner says which Open VSX namespace is current, then the family file or the READMEs follow |
| Observation | `scan.ts` says it is the same in every extension of the family; `letools-site/scripts/check-fleet.ts` does not hold it, so `paths-le-errors-3` is not copied anywhere by a gate | Add `src/workspace/scan.ts` to the fleet check once the siblings carry the same file, or drop the sentence |
| Observation | `ci-crate.yml`'s policy grep reads `*.md` line by line; `crate/SPEC.md` 308–309 carries the forbidden sentence wrapped across two lines and is not caught. The sentence is scoped to extraction, the sanctioned scope | Grep with the lines joined, or leave it: the sentence is true where it stands |
| Observation | `scan.ts` 159 swallows a `.gitignore` under the root that cannot be read, so the rule set is incomplete and more files are scanned; `openExternal`'s `false` is not read, so Learn More may silently not open; `showTextDocument`, `findFiles`, `withProgress`, `executeCommand` and `openExternal` have no failure hook in the mock; `showSuccessMessage` and `isValidNotificationLevel` are exported with no caller outside their module | None required; recorded for the owner |

Observations that are not findings:

- `ci-crate.yml` policy job greps `*.md` for "difference is a regression" line by line; `crate/SPEC.md` 308-309 carries that sentence wrapped across two lines and is not caught. The sentence is scoped to extraction, which is the sanctioned parity scope.
- `ui/ratingPrompt.ts` keys the Open VSX review page on publisher `offensiveedge`; this extension publishes to Open VSX under `nolindnaidoo` (badges in `mcp/README.md`), so an Open VSX install is sent to the Marketplace page. Family-wide file, outside this pass.
- `scan.ts` says it is the same in every extension of the family; `letools-site/scripts/check-fleet.ts` does not hold it, so a fix here is not copied by the gate.

## Step 8: Close

Read for this step: `git diff main...HEAD` in full, this record, `CHANGELOG.md`, `AGENTS.md`, `README.md`, `crate/CHANGELOG.md`, `crate/AGENTS.md`, `crate/README.md`.

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | Every check in steps 0 to 7 has an answer above; no `not done`. The `unknown`-class items are in "Carried and unknown" and in the pull request |
| CLOSE-2 | pass | 25 findings fixed, each with its commit and test in the findings table; none carried. `bugs-5`, `-7`, `-8` and `translations-4` were carried at the first close and fixed on the owner's decision in `faf189b`, `a117df6`, `f73d445` and `48892f0` |
| CLOSE-3 | pass | The "Failed without fix" column quotes each test's output with the fix absent; logs under the pass's scratch `fail/` directory. Test-gap findings say so in that column |
| CLOSE-4 | pass | Every BASE-4 gate rerun on `48892f0` (and on `29701b5`, `ba1d99f`, `5aa9f99` and `5e092fc` before it): 38 commands, 38 exit 0 each time. 484 unit tests in 34 files; integration 10 passing, 1 in the language-pack launch and 2 in the German host; installed VSIX PASS; `lint:commits` 33 conform; crate tests, scenarios, hazards, platform, TZ runs, coverage matrix, fuzz 20 s × 4 targets, budget 393 ms under a 3 s ceiling and 3.94× under the 6× bound, llvm-cov floor met by every `extract/` module, parity, differential (900 calls) and definition all green. `cargo audit` not run here, as at baseline
| CLOSE-5 | finding, outside the pass | From `letools-site` with the repos beside it: `check:fleet ../` → 27 shared files consistent across 16 repos; `check:locales ../` → every translated string in its own language; `check:doc-paths ../` → 777 references resolve. `check:registry` → red, "Run `bun run sync:registry` and commit the result": `lib/tool-facts.generated.ts` lags the crate versions of twelve repos (paths-le's own `0.3.4` → `0.3.5` among them), none changed by this pass. Left for the owner rather than regenerated inside a pass about one repo |
| CLOSE-6 | pass | `CHANGELOG.md` Unreleased: one entry, framed as a bug fix and hardening pass that ships in one release, one line per behaviour change (`5aa9f99`, `29701b5`). `AGENTS.md` Invariants: one entry per fixed class that could recur, naming its test; the refusal invariant names every reader that refuses and the nesting bound; Toolchain names the memory driver. `README.md` coverage section regenerated by `scripts/coverage-readme.js` from the run (95.53% statements, 484 cases, 34 files); `coverage:readme:check` green. `crate/CHANGELOG.md` has an Unreleased entry for the crate's half of the two shared refusals, and `crate/SPEC.md` carries the two rules beside the CSV one, with the measured bounds |
| CLOSE-7 | pass | Diff read in full: 33 commits, every one on the pass, no refactor, no formatting churn beyond the files touched, no probe left behind (the stray `l10n.test.ts` the packaging step copied to the root was found by the gate rerun and the test moved, `5e092fc`). `git log main..HEAD --format='%ae %s'` → 33 × `13629544+nolindnaidoo@users.noreply.github.com`; `bun run lint:commits` → "33 commit(s) conform". Every commit body names its finding id |
| CLOSE-8 | pass | Branch pushed, one pull request against `main`: https://github.com/nolindnaidoo/paths-le/pull/51. Its body is the findings table (id, step, what, commit, test), including the four items carried at the first close and fixed since, and the open observations. No attribution of any kind. Nothing merged, tagged or published
| CLOSE-9 | pass | CI on `48892f0`: 31 jobs pass, `auto-merge` skipped (it acts on Dependabot only). On `29701b5` before it, `CI on macos-latest` and `CI on ubuntu-latest` failed both German-host tests: a fresh profile applies a language pack only from the launch after the one that finds it installed, and CI launches once; fixed in `48892f0`, reproduced and shown fixed on two fresh local profiles. On `ba1d99f`, 31 jobs pass. `CI on` macOS, Ubuntu and Windows; `test`, `hazards`, `platform`, `scenarios` on macos-15, ubuntu-24.04 and windows-2025; `coverage`, `coverage-matrix`, `fuzz`, `budget`, `differential`, `parity`, `msrv`, `policy`, `audit` (the gate not run locally), `Commit messages`, `Versions and registry identity`, CodeQL. The first head, `5e092fc`, failed one job: `CI on windows-latest`, on the multi-root test asserting a POSIX-spelled path (`expected 'D:\second\src\index.ts' to be '/second/src/index.ts'`); fixed in `6da17a7`, every job green on the second run
| CLOSE-10 | pass | `fleet-pass/LEDGER.md` row written: `pull request open`, baseline `0cb6ef02`, this record, pull request 51, 2026-10-11, 25 fixed, 0 carried. Record and ledger committed to `letools-site` on `fleet-pass/paths-le` in the same change as the document additions under CLOSE-11
| CLOSE-11 | pass | Added in this `letools-site` change: `bugs.md` BUG-18 (caller-supplied text as a property name on a plain object) and BUG-15 widened to truncated and deeply nested documents; `errors.md` ERR-18 (a progress indicator reset on every way out); `translations.md` L10N-6 reworded for a repo whose bundle check has no module-scope rule, L10N-13 extended to a placeholder's meaning. No check names a tool repo |
