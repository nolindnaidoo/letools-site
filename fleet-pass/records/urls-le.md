# Fleet pass record: urls-le

Started from `records/TEMPLATE.md`. Evidence is pasted, not described; the
logs it names are in the pass scratchpad (`baseline/`, `final/`, `probes/`,
`fail/`) and the findings table names the commit and the test for each.

| | |
|---|---|
| Repo | urls-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `d6104d26` (`d6104d2672d925e0294ac639af53c6acf518a66a`) |
| Started | 2026-10-29 |
| Pull request | [nolindnaidoo/urls-le#60](https://github.com/nolindnaidoo/urls-le/pull/60) |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-cli,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; `git fetch` then `git status -sb` → `## main...origin/main` at `d6104d26` |
| BASE-2 | pass | `git config user.email` inside the repo → `13629544+nolindnaidoo@users.noreply.github.com` |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from `main`; `git rev-parse HEAD` → `d6104d2672d925e0294ac639af53c6acf518a66a` |
| BASE-4 | pass | 49 gates derived from the seven workflow files and the `package.json` scripts, written as `gates.sh` (table below); every script not in the table is listed under it with the reason |
| BASE-5 | see table | `gates.sh baseline` ran every command unpiped, each to its own log under `baseline/`, and recorded the exit code |
| BASE-6 | see findings | two red gates at baseline: `coverage:readme:check` (`urls-le-broken-features-1`) and the crate release preflight's package-list step (`urls-le-broken-features-2`); `cargo publish --dry-run` was red once because the coverage job had left `crate/coverage.json` in the tree, and green on a clean tree (`44b-cargo-publish-dry-run.log`) |
| BASE-7 | recorded | 77.74% statements, 67.83% branches, 84.79% functions, 79.29% lines. Under a floor or at 0% for a metric: `src/cli/main.ts` 0% (the entry point, driven by `check:cli-package`), `src/cli/ignoreRules.ts` 0% (driven by `check:cli-parity`), `src/extraction/formats/collectStrings.ts` 0% on every metric, `src/mcp/info.ts` and `src/mcp/server.ts` 0% lines (entry points, driven by `check:mcp-bundle`), `src/parsers/reference/generate.ts` 0% (a generator script), `src/mcp/provider.ts` 37.5% lines, `src/cli/mcp.ts` 47% lines / 36% branches, `src/cli/ioError.ts` 53% / 37%, `src/cli/scan.ts` 61% lines, `src/cli/walk.ts` 51% branches, `src/cli/args.ts` 37.5% functions, `src/parsers/text.ts` 62% lines / 18% branches, the TOML decoder, loader and parser 50–56% branches |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. Final is `gates.sh final` on `03e279c` (`final/results.txt`, 47 of 49 exit 0 and two reruns noted in their rows), with the 17 gates the last four commits touch rerun on `8357f66` (`final2/results.txt`, all exit 0). The crate chain runs inside
`crate/` on the toolchain `rust-toolchain.toml` pins, 1.98.1; bun is 1.3.14
here against CI's 1.3.13.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | 114 files; four biome infos (a `String.raw` note among them), none fails the gate.Rerun on the final commit: `final2/lint.log` exit 0 |
| `E` | `bun run typecheck` | exit 0 | exit 0 | covers `src/` and `vitest.config.ts`; `test/` is checked by `tsconfig.it.json` inside `test:integration`. Rerun on the final commit: `final2/typecheck.log` exit 0 |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | 36 files, 487 tests; 77.74 / 67.83 / 84.79 / 79.29.Rerun on the final commit: `final2/test-coverage.log` exit 0 |
| `E` | `bun run coverage:readme:check` | exit 1 | exit 0 | README says 475 cases across 35 files; the run has 487 across 36: `urls-le-broken-features-1`. Red in `final/05` before the README was regenerated (`95a91c7`); `final/05b` and `final2/` exit 0 |
| `E` | `bun run build` | exit 0 | exit 0 | Rerun on the final commit: `final2/build.log` exit 0 |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | Rerun on the final commit: `final2/check-bundle.log` exit 0 |
| `M` | `bun run build:mcp` | exit 0 | exit 0 | Rerun on the final commit: `final2/build-mcp.log` exit 0 |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | 103 KB under the 600 KB ceiling; one tool answered over stdio.Rerun on the final commit: `final2/check-mcp-bundle.log` exit 0 |
| `N` | `bun run build:npm` | exit 0 | exit 0 | |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | `urls-le-mcp@2.6.1` installs from a tarball and answers |
| `E` | `bun run package` | exit 0 | exit 0 | `release/urls-le-2.6.1.vsix`, 34 files; `clean:i18n` left no copied catalogue.Rerun on the final commit: `final2/package.log` exit 0 |
| `E` | `bun run test:integration` | exit 0 | exit 0 | 10 host tests.Rerun on the final commit: `final2/test-integration.log` exit 0 |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | installs the VSIX into a clean profile, extracts three URLs, spawns the MCP server.Rerun on the final commit: `final2/test-e2e-vsix.log` exit 0 |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | extension = npm server = `server.json` = 2.6.1; name and identifier agree |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline.Rerun on the final commit: `final2/lint-commits.log` exit 0 |
| `C N` | one-version job shell (`ci-crate.yml`) | exit 0 | exit 0 | `crate/Cargo.toml` = `cli/package.json` = 2.6.1 |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` | exit 0 | exit 0 | 122 unit, 2 corpus, 11 contracts, 3 budget, 7 hazards, 5 platform, 2 scenarios (the gated ones say by name they did not run) |
| `C` | `cargo build --locked` | exit 0 | exit 0 | |
| `C` | MSRV (`RUSTUP_TOOLCHAIN=1.88 cargo check --locked`) | exit 0 | exit 0 | |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 | |
| `C` | policy: no filesystem call in `extract/` | exit 0 | exit 0 | |
| `C` | policy: no doc holds the surfaces equal | exit 0 | exit 0 | |
| `C` | `cargo llvm-cov`, 70% floor per module in `extract/` | exit 0 | exit 0 | lowest module 89.13% (`formats.rs` in one of the two instrumented binaries) |
| `C` | `URLS_LE_SCENARIOS=1 cargo test --test scenarios` | exit 0 | exit 0 | 2 tests |
| `C` | `cargo test --test hazards` | exit 0 | exit 0 | 7 tests |
| `C` | `cargo test --test platform` | exit 0 | exit 0 | 5 tests |
| `C` | the whole suite with `TZ=UTC` | exit 0 | exit 0 | |
| `C` | the whole suite with `TZ` unset | exit 0 | exit 0 | |
| `C` | `cargo build --locked --release` | exit 0 | exit 0 | |
| `M C` | `scripts/differential.ts`, seed 20260812, 4000 cases | exit 0 | exit 0 | both servers identical |
| `M C` | `scripts/check-mcp-definition.ts` | exit 0 | exit 0 | `extract_urls` defined identically |
| `N` | `bun run build:cli` | exit 0 | exit 0 | Rerun on the final commit: `final2/build-cli.log` exit 0 |
| `N C` | `bun run check:cli-parity` | exit 0 | exit 0 | 73 commands and 53 MCP lines.Rerun on the final commit: `final2/check-cli-parity.log` exit 0 |
| `N C` | `bun run check:cli-pipes` | exit 0 | exit 0 | 3 closed-pipe cases, 18 malformed frames.Rerun on the final commit: `final2/check-cli-pipes.log` exit 0 |
| `C` | `URLS_LE_FUZZ_SECONDS=60` fuzz | exit 0 | exit 0 | seed 5859829985808023555 |
| `C` | `URLS_LE_BUDGET=1 --release` budget | exit 0 | exit 0 | 500 files in 23.5 ms against a 250 ms ceiling; 4× tree ratio 3.87 |
| `C` | `cargo test --test coverage_matrix` | exit 0 | exit 0 | 3 tests |
| `E M C` | `bun scripts/check-extraction-parity.ts` | exit 0 | exit 0 | every corpus case under the extension; both servers agree |
| `C` | crate package list (`release-crate.yml` preflight) | exit 1 | exit 0 | `MISSING fixtures/heuristics.json`, `MISSING fixtures/mcp-extract-paths.json`: `urls-le-broken-features-2` |
| `C` | `crate/CHANGELOG.md` carries the version | exit 0 | exit 0 | |
| `C` | `cargo publish --dry-run --locked` | exit 0 | exit 0 | green on a clean tree; red once behind the coverage job's `crate/coverage.json`. Red in `final/44` behind the coverage gate's `crate/coverage.json` (`b17a1a7` ignores it); `final/44c` on the committed tree exit 0 |
| `N` | `CHANGELOG.md` carries the version | exit 0 | exit 0 | |
| `N` | `bun run build:cli:prod` | exit 0 | exit 0 | |
| `N` | `bun run check:cli-package` | exit 0 | exit 0 | `url-le@2.6.1` packed, installed, scanned, served |
| `E` | `bun run benchmark` | exit 0 | exit 0 | writes the ignored `benchmark-results.json` |
| `E` | `python3 scripts/check-agent-files.py` | exit 0 | exit 0 | 6 agent files agree.Rerun on the final commit: `final2/git-status-after.log` exit 0 |
| `C` | `cargo audit` | not run here | not run here | not installed here; CI runs it |

Not run here, with the reason: CodeQL (`codeql.yml`) and the Dependabot
auto-merge need GitHub; the release preflights that read a registry or a tag
(`npm view`, the crates.io version probe, "HEAD is tagged") refuse a published
version by design and HEAD is not a release; the publish steps spend a
version; `clean` deletes recursively; `clean:i18n`, `copy:i18n`,
`vscode:prepublish`, `build:prod` and `build:mcp:prod` ran inside `package`;
`hooks:install` and `prepare` ran inside `install`; `watch` and `test:watch`
are interactive; `coverage:readme`, `perf:readme`, `readme` and `lint:fix`
write to the tree and are run only to fix a finding.

## Step 1: Inventory

### INV-1. The read manifest

`git ls-files -- src test scripts mcp crate/src crate/tests package.json server.json | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/' | xargs wc -l`
→ 30,150 lines in 167 files. Every row below was opened and read from its
first line to its last in this pass, with the checks of steps 2 to 7 beside
it, and INV-5 to INV-8 were written as each file went by. What the filter
dropped, and which step reads each: 11 fixtures under
`src/extraction/__fixtures__/` and the one snapshot (read in full beside
`characterization.test.ts`), 12 `src/i18n/` catalogues (read under step 7,
every value) and 4 images under `src/assets/` (binary, not text). Outside the
listed roots, read in full: the baseline scope, `README.md`, `crate/README.md`,
`mcp/README.md`, `cli/README.md`, `CHANGELOG.md`, `crate/CHANGELOG.md`,
`crate/Cargo.toml`, `crate/rust-toolchain.toml`, `crate/fixtures/README.md`,
the three corpus files and 19 corpus documents under `crate/fixtures/`,
`.vscodeignore`, `biome.json`, `tsconfig.json`, `tsconfig.it.json`,
`.githooks/commit-msg`, `.github/codeql-config.yml`, `.github/dependabot.yml`,
the six agent-file copies, `samples/` (3), `package.nls.json` and the 13
runtime bundles.

| Read | Lines | File |
|---|---|---|
| [x] | 359 | `crate/src/cli.rs` |
| [x] | 213 | `crate/src/extract/corpus.rs` |
| [x] | 330 | `crate/src/extract/format.rs` |
| [x] | 482 | `crate/src/extract/formats.rs` |
| [x] | 428 | `crate/src/extract/fuzz.rs` |
| [x] | 109 | `crate/src/extract/js.rs` |
| [x] | 173 | `crate/src/extract/mod.rs` |
| [x] | 202 | `crate/src/extract/position.rs` |
| [x] | 432 | `crate/src/extract/scanner.rs` |
| [x] | 12 | `crate/src/main.rs` |
| [x] | 270 | `crate/src/mcp/extract.rs` |
| [x] | 481 | `crate/src/mcp/mod.rs` |
| [x] | 361 | `crate/src/scan.rs` |
| [x] | 77 | `crate/src/testing.rs` |
| [x] | 363 | `crate/src/walk.rs` |
| [x] | 204 | `crate/tests/budget.rs` |
| [x] | 293 | `crate/tests/contracts.rs` |
| [x] | 247 | `crate/tests/coverage_matrix.rs` |
| [x] | 503 | `crate/tests/hazards.rs` |
| [x] | 271 | `crate/tests/platform.rs` |
| [x] | 100 | `crate/tests/scenarios.rs` |
| [x] | 183 | `mcp/README.md` |
| [x] | 51 | `mcp/package.json` |
| [x] | 337 | `package.json` |
| [x] | 102 | `scripts/benchmark.ts` |
| [x] | 57 | `scripts/build-cli.js` |
| [x] | 38 | `scripts/build-mcp.js` |
| [x] | 98 | `scripts/build-npm.js` |
| [x] | 135 | `scripts/check-agent-files.py` |
| [x] | 103 | `scripts/check-bundle.js` |
| [x] | 101 | `scripts/check-cli-package.js` |
| [x] | 503 | `scripts/check-cli-parity.ts` |
| [x] | 186 | `scripts/check-cli-pipes.ts` |
| [x] | 222 | `scripts/check-extraction-parity.ts` |
| [x] | 155 | `scripts/check-mcp-bundle.js` |
| [x] | 93 | `scripts/check-mcp-definition.ts` |
| [x] | 150 | `scripts/check-npm-package.js` |
| [x] | 182 | `scripts/commit-lint.js` |
| [x] | 181 | `scripts/coverage-readme.js` |
| [x] | 554 | `scripts/differential.ts` |
| [x] | 214 | `scripts/e2e-vsix.js` |
| [x] | 27 | `scripts/install-hooks.js` |
| [x] | 72 | `scripts/perf-readme.js` |
| [x] | 33 | `server.json` |
| [x] | 658 | `src/__mocks__/vscode.ts` |
| [x] | 62 | `src/agent-files.test.ts` |
| [x] | 94 | `src/cli/args.ts` |
| [x] | 337 | `src/cli/cli.test.ts` |
| [x] | 36 | `src/cli/frames.test.ts` |
| [x] | 58 | `src/cli/frames.ts` |
| [x] | 171 | `src/cli/ignoreRules.ts` |
| [x] | 144 | `src/cli/ioError.ts` |
| [x] | 35 | `src/cli/main.ts` |
| [x] | 319 | `src/cli/mcp.ts` |
| [x] | 174 | `src/cli/output.test.ts` |
| [x] | 77 | `src/cli/output.ts` |
| [x] | 116 | `src/cli/run.ts` |
| [x] | 184 | `src/cli/scan.ts` |
| [x] | 53 | `src/cli/usage.ts` |
| [x] | 328 | `src/cli/walk.ts` |
| [x] | 167 | `src/commands/cancellation.test.ts` |
| [x] | 407 | `src/commands/commands.test.ts` |
| [x] | 91 | `src/commands/dedupe.ts` |
| [x] | 18 | `src/commands/dependencies.ts` |
| [x] | 194 | `src/commands/extract.ts` |
| [x] | 195 | `src/commands/extractWorkspace.test.ts` |
| [x] | 245 | `src/commands/extractWorkspace.ts` |
| [x] | 81 | `src/commands/guard.test.ts` |
| [x] | 30 | `src/commands/guard.ts` |
| [x] | 71 | `src/commands/help.ts` |
| [x] | 26 | `src/commands/index.ts` |
| [x] | 115 | `src/commands/output.ts` |
| [x] | 272 | `src/commands/outputRoutes.test.ts` |
| [x] | 160 | `src/commands/sort.ts` |
| [x] | 133 | `src/commands/sortModes.test.ts` |
| [x] | 100 | `src/commands/workspaceShared.ts` |
| [x] | 137 | `src/config/config.test.ts` |
| [x] | 195 | `src/config/config.ts` |
| [x] | 22 | `src/config/settings.ts` |
| [x] | 32 | `src/extension.ts` |
| [x] | 52 | `src/extraction/characterization.test.ts` |
| [x] | 317 | `src/extraction/extract.edge.test.ts` |
| [x] | 237 | `src/extraction/extract.test.ts` |
| [x] | 245 | `src/extraction/extract.ts` |
| [x] | 18 | `src/extraction/formats/collectStrings.ts` |
| [x] | 11 | `src/extraction/formats/css.ts` |
| [x] | 235 | `src/extraction/formats/html.test.ts` |
| [x] | 33 | `src/extraction/formats/html.ts` |
| [x] | 135 | `src/extraction/formats/ini.test.ts` |
| [x] | 32 | `src/extraction/formats/ini.ts` |
| [x] | 362 | `src/extraction/formats/javascript.test.ts` |
| [x] | 11 | `src/extraction/formats/javascript.ts` |
| [x] | 37 | `src/extraction/formats/json.test.ts` |
| [x] | 121 | `src/extraction/formats/json.ts` |
| [x] | 252 | `src/extraction/formats/markdown.test.ts` |
| [x] | 48 | `src/extraction/formats/markdown.ts` |
| [x] | 12 | `src/extraction/formats/plaintext.ts` |
| [x] | 110 | `src/extraction/formats/properties.test.ts` |
| [x] | 20 | `src/extraction/formats/properties.ts` |
| [x] | 131 | `src/extraction/formats/toml.test.ts` |
| [x] | 33 | `src/extraction/formats/toml.ts` |
| [x] | 137 | `src/extraction/formats/xml.test.ts` |
| [x] | 12 | `src/extraction/formats/xml.ts` |
| [x] | 11 | `src/extraction/formats/yaml.ts` |
| [x] | 80 | `src/extraction/heuristics.test.ts` |
| [x] | 186 | `src/extraction/heuristics.ts` |
| [x] | 29 | `src/extraction/position.test.ts` |
| [x] | 42 | `src/extraction/position.ts` |
| [x] | 150 | `src/mcp/envelope.ts` |
| [x] | 125 | `src/mcp/fileType.ts` |
| [x] | 13 | `src/mcp/info.ts` |
| [x] | 383 | `src/mcp/mcp.test.ts` |
| [x] | 55 | `src/mcp/provider.ts` |
| [x] | 107 | `src/mcp/readme.test.ts` |
| [x] | 13 | `src/mcp/server.ts` |
| [x] | 141 | `src/mcp/tools.ts` |
| [x] | 293 | `src/mcp/transport.ts` |
| [x] | 131 | `src/parsers/csv.ts` |
| [x] | 232 | `src/parsers/ini.ts` |
| [x] | 510 | `src/parsers/jsonc.ts` |
| [x] | 173 | `src/parsers/parsers.test.ts` |
| [x] | 424 | `src/parsers/reference/Cargo.lock` |
| [x] | 16 | `src/parsers/reference/Cargo.toml` |
| [x] | 1 | `src/parsers/reference/answers.json` (518 KB of generated answers on one line; read as the data `parsers.test.ts` asserts against, beside `generate.ts` which writes it) |
| [x] | 433 | `src/parsers/reference/generate.ts` |
| [x] | 226 | `src/parsers/reference/src/main.rs` |
| [x] | 54 | `src/parsers/text.ts` |
| [x] | 177 | `src/parsers/toml/datetime.ts` |
| [x] | 651 | `src/parsers/toml/decoder.ts` |
| [x] | 456 | `src/parsers/toml/document.ts` |
| [x] | 54 | `src/parsers/toml/errors.ts` |
| [x] | 192 | `src/parsers/toml/lexer.ts` |
| [x] | 297 | `src/parsers/toml/load.ts` |
| [x] | 733 | `src/parsers/toml/parser.ts` |
| [x] | 255 | `src/parsers/yaml/load.ts` |
| [x] | 726 | `src/parsers/yaml/parser.ts` |
| [x] | 1765 | `src/parsers/yaml/scanner.ts` |
| [x] | 116 | `src/rating/policy.test.ts` |
| [x] | 84 | `src/rating/policy.ts` |
| [x] | 59 | `src/rating/wiring.test.ts` |
| [x] | 44 | `src/services/serviceFactory.ts` |
| [x] | 125 | `src/services/services.test.ts` |
| [x] | 54 | `src/telemetry/telemetry.ts` |
| [x] | 81 | `src/types.ts` |
| [x] | 29 | `src/ui/notifier.ts` |
| [x] | 317 | `src/ui/ratingPrompt.test.ts` |
| [x] | 179 | `src/ui/ratingPrompt.ts` |
| [x] | 54 | `src/ui/statusBar.ts` |
| [x] | 68 | `src/utils/clipboard.ts` |
| [x] | 35 | `src/utils/document.ts` |
| [x] | 32 | `src/utils/errors.test.ts` |
| [x] | 13 | `src/utils/errors.ts` |
| [x] | 59 | `src/utils/positions.test.ts` |
| [x] | 64 | `src/utils/positions.ts` |
| [x] | 93 | `src/utils/safety.test.ts` |
| [x] | 56 | `src/utils/safety.ts` |
| [x] | 228 | `src/workspace/defaults.ts` |
| [x] | 72 | `src/workspace/ignore.test.ts` |
| [x] | 156 | `src/workspace/ignore.ts` |
| [x] | 478 | `src/workspace/scan.test.ts` |
| [x] | 372 | `src/workspace/scan.ts` |
| [x] | 140 | `test/integration/extension.test.ts` |
| [x] | 183 | `test/integration/l10n.test.ts` |

`src/parsers/` is the transcription set `letools-site` holds byte-identical
across the repos that carry it. This repo's extraction uses `toml/` (through
`formats/toml.ts`) and nothing else from it: `csv.ts`, `ini.ts`, `jsonc.ts`
and `yaml/` are held here for the family and exercised by
`parsers.test.ts` against `reference/answers.json`. That is the directory's
contract, not dead code. `src/extraction/formats/collectStrings.ts` is this
repo's own and has no caller (INV-11, FEAT-18).

### INV-2. Manifest contributions

`jq '.contributes | keys'` → `commands`, `configuration`, `menus`,
`mcpServerDefinitionProviders`. `activationEvents` → `onStartupFinished`;
`main` → `./dist/extension.js`; `l10n` → `./l10n`; `engines` → `vscode
^1.101.0`, `node >=20.0.0`; `capabilities` → `virtualWorkspaces` and
`untrustedWorkspaces` both `limited` with `%manifest.capability.untrusted-workspaces.desc%`.

| Contribution | Entry | Localized | Note |
|---|---|---|---|
| command | `urls-le.extractUrls` | `%manifest.command.extract.title%` | palette, editor context menu, status bar click |
| command | `urls-le.extractWorkspace` | `%manifest.command.extract-workspace.title%` | palette |
| command | `urls-le.extractFolder` | `%manifest.command.extract-folder.title%` | palette, Explorer context menu (the folder clicked is the argument) |
| command | `urls-le.postProcess.dedupe` | `%manifest.command.dedupe.title%` | palette |
| command | `urls-le.postProcess.sort` | `%manifest.command.sort.title%` | palette |
| command | `urls-le.openSettings` | `%manifest.command.settings.title%` | palette |
| command | `urls-le.help` | `%manifest.command.help.title%` | palette |
| menu | `editor/context` → `urls-le.extractUrls` | | `when: editorTextFocus`, group `1_modification@1` |
| menu | `explorer/context` → `urls-le.extractFolder` | | `when: explorerResourceIsFolder`, group `7_modification@1` |
| menu | `commandPalette` | | all seven commands, no `when` |
| keybindings | none | | |
| configuration | 20 properties under `urls-le.` | every description a `%key%` | listed under INV-4 with type and default |
| mcpServerDefinitionProviders | id `urls-le`, label `%manifest.mcp.label%` | | registered in `activate()` behind feature detection |
| activationEvents | `onStartupFinished` | | one event: the extension activates on every window, after startup |

### INV-3. Registrations, both directions

| Registration | Where | Disposed by |
|---|---|---|
| `urls-le.extractUrls` | `commands/extract.ts:17`, `guarded(...)` | pushed to `context.subscriptions` |
| `urls-le.extractWorkspace`, `urls-le.extractFolder` | `commands/extractWorkspace.ts:41`, `:47`, `guarded(...)` | pushed |
| `urls-le.postProcess.dedupe` | `commands/dedupe.ts:12`, `guarded(...)` | pushed |
| `urls-le.postProcess.sort` | `commands/sort.ts:19`, `guarded(...)` | pushed |
| `urls-le.help` | `commands/help.ts:15`, `guarded(...)` | pushed |
| `urls-le.openSettings` | `config/settings.ts:10`, `guarded(...)` | pushed |
| status bar item and its configuration listener | `ui/statusBar.ts:17`, `:36` | the item pushed by `createStatusBar`, and the `StatusBar` wrapper that disposes it pushed again by `serviceFactory.ts:36`: the item is disposed twice at deactivation (LEAK-5) |
| telemetry output channel | `telemetry/telemetry.ts:23`, lazily on the first event with the setting on | the telemetry object pushed by `serviceFactory.ts:35` |
| MCP definition provider | `mcp/provider.ts:29` | pushed when `vscode.lm` has the API; skipped by name otherwise |

Seven ids in the manifest, seven `registerCommand` calls, each naming one of
them (`grep -rnoE "'urls-le\.[a-zA-Z-]+'" src` → the seven, plus the status
bar's `item.command`). `test/integration/extension.test.ts` "registers every
declared command" asserts all seven in the host; `services.test.ts` "activate
registers every declared command" lists five (FEAT-1).

### INV-4. Settings and their consumers

`config.test.ts` walks `contributes.configuration.properties` against
`CONFIG_DEFAULTS` through `KEY_MAP` and refuses an undeclared or unmapped key
(FEAT-7), and stores `''`, `null`, `true` and text in a number setting.

| Setting (type, default) | Consumer | Consumer test |
|---|---|---|
| `clipboardIncludesPositions` (boolean, false) | `commands/extract.ts:119`, `commands/workspaceShared.ts:70` | `commands.test.ts` "copies each URL with its position only when the clipboard setting says so"; `extractWorkspace.test.ts` "places every occurrence when positions are on, and decides the copy separately" |
| `copyToClipboardEnabled` (boolean, false) | `extract.ts:122`, `workspaceShared.ts:67` | `commands.test.ts`, `outputRoutes.test.ts` "clipboard copy", `extractWorkspace.test.ts` |
| `dedupeEnabled` (boolean, false) | `extract.ts:154` | `commands.test.ts` "dedupes results when dedupeEnabled is set", "keeps the first position…" |
| `notificationsLevel` (string, `silent`; `all`/`important`/`silent`) | `ui/notifier.ts`, re-read per call; `ui/ratingPrompt.ts:143` through `inspect` | `services.test.ts` three levels; `ratingPrompt.test.ts` |
| `postProcess.openInNewFile` (boolean, true) | `commands/output.ts:36`, the Extract route only; Dedupe and Sort write in place and never read it | `commands.test.ts` "opens in a new file when side-by-side is off", `outputRoutes.test.ts`. The manifest description says "Open post-processed content in a new editor" (FEAT-17) |
| `openResultsSideBySide` (boolean, true) | `output.ts:32`, `workspaceShared.ts:88` | `commands.test.ts`, `outputRoutes.test.ts` "output routes" |
| `safety.enabled` (boolean, true) | `utils/safety.ts:20`; `workspaceShared.ts:26` (the scan's size limit) | `outputRoutes.test.ts` "safety guardrails"; `scan.test.ts` `maxFileBytes` |
| `safety.fileSizeWarnBytes` (number, 1,000,000, floor 1,000) | `safety.ts:27`, `workspaceShared.ts:27` | `commands.test.ts` "refuses files over the safety size threshold" |
| `safety.largeOutputLinesThreshold` (number, 50,000, floor 100) | `safety.ts:41` | `outputRoutes.test.ts` "surfaces a large-file warning before extracting" |
| `showPositions` (boolean, false) | `extract.ts:112`, `workspaceShared.ts:83` | `commands.test.ts`, `extractWorkspace.test.ts` |
| `statusBar.enabled` (boolean, true) | `ui/statusBar.ts:27`, live listener | `services.test.ts` "reacts to statusBar.enabled config changes" asserts nothing (FEAT-22) |
| `telemetryEnabled` (boolean, false) | `telemetry/telemetry.ts:17` | `services.test.ts` "writes to the output channel when enabled" asserts nothing (FEAT-22) |
| `workspace.scanAlwaysInclude` (array, `[]`) | `workspaceShared.ts:24` → `workspace/scan.ts:119` | `extractWorkspace.test.ts` "reads what a switch would skip"; `scan.test.ts` |
| `workspace.scanExcludes` (array, `[]`) | `scan.ts:82` through `excludeGlobs` | `scan.test.ts` "adds the user's own excludes" |
| `workspace.scanMaxFiles` (number, 5,000, floor 1) | `scan.ts:134` | `scan.test.ts` "says when more files matched than the limit" |
| `workspace.scanMaxResults` (number, 10,000, floor 1) | `commands/extractWorkspace.ts:103`, `:110` | `extractWorkspace.test.ts` "stops at the results limit" |
| `workspace.scanPatterns` (array, `["**/*"]`) | `scan.ts:99` | `scan.test.ts` "reads only the files the patterns name" |
| `workspace.scanRespectGitignore` (boolean, true) | `scan.ts:96` | `scan.test.ts` "leaves out what .gitignore leaves out" |
| `workspace.scanSkipBinaryFiles` (boolean, true) | `scan.ts:85` through `excludeGlobs` | `scan.test.ts` "reads the built-in list when it is switched off, and binaries when that is" |
| `workspace.scanUseDefaultExcludes` (boolean, true) | `scan.ts:84` | the same test |

Every declared setting has a consumer; no key is read in source without a
declaration (`getConfiguration('urls-le')` is called in `config.ts` alone,
and `ratingPrompt.ts` inspects `notificationsLevel` by the same name).

### INV-5. Resources with a lifetime

| Resource | Created | Released | Largest it can get |
|---|---|---|---|
| status bar item | `createStatusBar` at activation | deactivation, twice (the item and the wrapper are both subscriptions) | one |
| configuration listener | `createStatusBar` | deactivation | one |
| telemetry channel | first event with the setting on | deactivation, created or not | one |
| MCP provider | activation, where `vscode.lm` exists | deactivation | one |
| rating state | `globalState`, written before each ask | persists by design | one record |
| `PATTERNS` (five `dg` regexes, `heuristics.ts:33`), `COMMENT_PATTERN` (`g`, `html.ts:10`) | module load | never | `lastIndex` is reset before each scan and the scan is synchronous (BUG-6) |
| per scan: `claimed` Set, `cursors` Map (`heuristics.ts`), `fenced` Set (`markdown.ts`), `held` Map (`positions.ts`) | per call | per call | the document's matches |
| workspace scan: `seen` and `wanted` Sets, `found` Map, `createIgnore`'s `directories` Map | per run | run end | the tree's files and directories, capped by `scanMaxFiles` and `scanMaxResults` |
| extension MCP server: tool table, `buffer`, `discarding` (`transport.ts`) | `createResponder`; per frame | process end; per frame, 16 MiB ceiling | one tool; 16 MiB plus the pending chunk |
| npm command line: `pending` Buffer (`cli/frames.ts:31`), the walk's targets, the reports | per frame; per run | per frame with no ceiling (LEAK-11); run end | unbounded; the tree's file count |
| crate: `serve`'s `lines()` (`mcp/mod.rs:36`), `DELIMS` and `PATTERNS` `LazyLock` (`scanner.rs`), `COUNTER` (`testing.rs`, tests only) | per frame with no ceiling (LEAK-11); first use | process end | unbounded; constants |
| `cli/output.ts` stream `error` listeners, `main.ts` `process.stdout.once('error')` | once per process | process end | one each |

### INV-6. Suspension points

| File | Awaits | What is read before and used after |
|---|---|---|
| `commands/extract.ts` | `withProgress` (54), `extractUrls` (85, an `async` body with no await), `displayResults` (111), `copyResultsToClipboard` (118) | the document and the configuration snapshot, read before the progress; `document.getText()` at 86 and the in-place route's `applyEdit` have only microtasks between them, so a keystroke cannot interleave (RACE-1, RACE-2); the token is checked after each await (RACE-6) |
| `commands/dedupe.ts` | `replaceDocumentContent` (47) | the text, read at 42 with no prompt before the edit |
| `commands/sort.ts` | the sort quick pick (35), `replaceDocumentContent` (92) | the editor, captured before the pick; the text is read after it (86), so no stale read (RACE-2) |
| `commands/extractWorkspace.ts` | `withProgress` (76), `listFiles` (83), `scanFiles` (89), `deliver` (123) | the configuration snapshot before the progress; `workspaceFolders` read inside `listFiles`; a cancelled scan returns before delivering (RACE-6) |
| `commands/workspaceShared.ts` | `showOpenDialog` (51), `clipboard.writeText` (69), `openTextDocument` (82), `showTextDocument` (86) | nothing shared |
| `commands/output.ts` | `openTextDocument`, `showTextDocument`, `replaceDocumentContent` | the content computed before; the token checked first on each route |
| `commands/help.ts`, `config/settings.ts` | open and show; `executeCommand` | nothing shared |
| `ui/ratingPrompt.ts` | `state.update` before the toast (111), the toast (70), `openExternal` (86), `settleStored` | the ask is written before the wait (RACE-5) |
| `commands/guard.ts`, `utils/clipboard.ts`, `utils/document.ts` | the command body; `writeText`; `applyEdit` | nothing shared |
| `workspace/scan.ts` | `findFiles` ×3, `fs.readFile` ×2, `fs.stat` ×2 | the limits, read before; the token per file |
| `mcp/transport.ts`, `mcp/tools.ts` | the tool handler (127, 183), `respond().then` (282); `extractUrls` (69) | nothing shared; handlers are pure |
| `cli/frames.ts`, `cli/main.ts`, `cli/mcp.ts`, `cli/run.ts`, `cli/scan.ts` | the crate's surface: stdin, the frames, each request in order, the tree, each file | one request at a time, in order |

### INV-7. Failure sites

| Site | What arrives | What the user learns | Verdict |
|---|---|---|---|
| `extract.ts:61` try | anything the extraction or a route threw | "Failed to extract URLs: {0}", `extract-error` logged, the status bar reset in `finally` | pass; `outputRoutes.test.ts` "reports an unexpected failure" |
| `extract.ts:171`, `:173`, `:187`; `dedupe.ts:88`; `sort.ts:157`; `workspaceShared.ts:73`; `clipboard.ts:23` | a thrown value that is not an `Error`, or a result with no message | `'Unknown error'`, `'Unknown error occurred'`, `'Unknown clipboard error'`: English literals, six copies (L10N-5, BUG-10) | finding |
| `dedupe.ts:28`, `sort.ts:42` try | anything `performDedupe`/`performSort` threw | "Deduplication failed: {0}" / "Sorting failed: {0}" | pass |
| `sort.ts:135` catch | a line `new URL()` refuses | sorted by its own text | pass, by design |
| `output.ts:50`, `:75`, `:98` catches | a refused document or edit | "Failed to open results…" / "Failed to replace document content: {0}"; `false` returned so no count follows | pass; `outputRoutes.test.ts` |
| `guard.ts:18` catch | anything a command threw past its own handler | one redacted, localized error | pass; `guard.test.ts` |
| `workspaceShared.ts:68` catch | a refused clipboard write | "Could not copy the report to the clipboard: {0}" | pass |
| `clipboard.ts:63` catch | a refused clipboard write | "Failed to copy to clipboard: {0}", or the permission literal | pass for the arm; the literal is L10N-5 |
| `ratingPrompt.ts:95` catch | `globalState.update` or the toast failing | a `rating-prompt-failed` event | pass; `ratingPrompt.test.ts` |
| `telemetry.ts:49` catch | properties `JSON.stringify` refuses | `[serialization error]` in the log | pass |
| `workspace/scan.ts:165`, `:184`, `:201`, `:240` catches | a `.gitignore` that is not there; a `.git` that is not there; bytes that are not UTF-8; a file gone or refused | skipped; `false`; `undefined`; `unreadable++`, each counted into the report's notes | pass; `scan.test.ts` |
| `workspace/ignore.ts:101` catch | a pattern that is not a valid expression | the rule is dropped | pass: git matches nothing on it either |
| `extraction/extract.ts:97` catch | a parser that threw | a `parsing` warning carrying the parser's message | pass (ERR-3) |
| `extraction/heuristics.ts:177` catch | a value `new URL()` refuses | no `domain`/`path` | pass, pinned by the corpus |
| `mcp/envelope.ts:112`, `:130`; `mcp/tools.ts:64` throws | a bad `maxResults`, a missing `content`, no format | `isError` with the message | finding: a schema violation is a tool result, not `-32602` (ERR-14) |
| `mcp/transport.ts:109`, `:116` throws; `:126`, `:153`, `:262` catches | no tool name, an unknown tool; a tool that threw; a malformed line | `-32602`; `isError`; `-32700` "Invalid JSON" | pass; `respond().then` (282) never rejects: its body is wrapped |
| `cli/args.ts:41`, `:48`, `:51`, `:88` throws; `cli/run.ts:40` catch | a bad flag, stdin with files, no input, no format | `urls-le: <message>` on stderr, exit 2 | pass; `cli.test.ts`, `contracts.rs` |
| `cli/run.ts:82` catch, `cli/ioError.ts:35` | stdin that is not UTF-8 | "could not read stdin: stream did not contain valid UTF-8" | pass |
| `cli/ioError.ts:121` catch | a parent that cannot be stat'ed | `false`, which picks "path not found" wording on Windows | pass |
| `cli/ignoreRules.ts:125` catch | an ignore file that cannot be read | no rules, as the crate does | pass |
| `cli/frames.ts:17`, `:45` catches | a line that is not JSON; bytes that are not UTF-8 | dropped without a word | finding (ERR-19) |
| `cli/mcp.ts:66`, `:189`, `:198`, `:237`, `:285`, `:290` throws; `:173` catch | the tool missing (constant); no content, no format, a bad cap, no path, an empty list | `isError` with the message; `paths: [3]` reads "the list of paths was empty" | finding: a schema violation is `isError` (ERR-14); a wrong-shaped entry is mislabelled (ERR-4) |
| `cli/scan.ts:66`, `:72` catches | a file that cannot be read; bytes that are not UTF-8 | a `skipped` report line naming the reason | pass |
| `cli/walk.ts:96`, `:144`, `:215` catches | a named input that is not there; a directory that cannot be read; a link that cannot be stat'ed | exit 2 naming it; an `unreadable` target; an `unreadable` target | pass; `cli.test.ts` |
| crate `cli.rs:95` `eprintln!`, `:81`, `:85` `println!` | a refusal with stderr closed; `--help`/`--version` with stdout closed | a panic, exit 101 | finding candidate (ERR-20) |
| crate `walk.rs:114` | a FIFO, a socket, a device, a symbolic link in a walk | dropped without a word | finding (ERR-16, ERR-9) |
| crate `mcp/mod.rs:42`, `:50` | a frame that is not UTF-8; one that is not JSON | dropped without a word | finding (ERR-19) |
| crate `expect`/`panic!` ×52 across 10 files | serialization of values the crate built, test helpers, constant patterns, test fixtures | nothing: none reachable from input | pass (ERR-15); the fuzz and hazard suites agree |

### INV-8. User-visible strings, by channel

| Channel | Where | Mechanism |
|---|---|---|
| notifications | every command, `guard.ts`, `output.ts`, `clipboard.ts`, `safety.ts`, `workspaceShared.ts` | `l10n.t()`, except the six fallback literals above and `'Clipboard access denied. Extracted URLs but could not copy to clipboard.'` (`clipboard.ts:29`) |
| progress title and message | `extract.ts:57` "Extracting URLs...", `extractWorkspace.ts:79`, `:96` | `l10n.t()`; "Extracting URLs..." is not in the bundle (L10N-4) |
| status bar text and tooltip | `ui/statusBar.ts` | `l10n.t()` |
| quick pick labels and placeholder | `commands/sort.ts` | `l10n.t()`; the pick returns its `value`, never its label (L10N-17) |
| open dialog button | `workspaceShared.ts:56` "Scan Folder" | `l10n.t()` |
| modal buttons | `ui/ratingPrompt.ts` | `l10n.t()`, bound and compared by reference |
| the workspace report | `extractWorkspace.ts`, `workspace/scan.ts` `unreadNotes` | `l10n.t()` throughout: prose for a person, localized by design; the dedupe summary joins two sentences with `. ` (`dedupe.ts:62`) |
| the help document | `commands/help.ts` | English in every locale (L10N-5, L10N-9) |
| output channel | `telemetry.ts`: the channel name `URLs-LE Telemetry` and `[time] event {json}` lines | English, machine-shaped: a log a user pastes (L10N-18) |
| manifest | `package.json` | `%key%` throughout, 34 keys |
| MCP replies, CLI stdout and stderr, the crate | `src/mcp`, `src/cli`, `crate/` | English, machine-read; the three servers' refusals differ in words (ERR-14, ERR-19) |

### INV-9. Machine interfaces

| Interface | Shape | Held by |
|---|---|---|
| MCP tool `extract_urls` (`M` `N` `C`) | `{content, format?, filename?, dedupe?, maxResults?}`, `additionalProperties: false` declared → `{ok, data: {urls[{value, protocol, line?, column?}], fileType}, diagnostics, meta}` | `crate/fixtures/mcp-extract-urls.json` (23 cases) on all three: `check-extraction-parity.ts`, `check-cli-parity.ts`, `mcp/extract.rs`; `check-mcp-definition.ts`; `differential.ts` (seed 20260812, 4,000 generated cases) |
| MCP tool `urls_le_scan` (`N` `C`) | `path` or `paths`, `dedupe?`, `hidden?`, `ignored?`, no `additionalProperties` → `{reports, urls}`, one `unreadable` diagnostic per skipped report | `check-cli-parity.ts` (53 MCP lines); crate `mcp::tests`; `cli.test.ts` |
| JSON-RPC framing, three servers | newline-delimited; the extension's server: 16 MiB ceiling, `-32700` on a bad line; the npm command line and the crate: no ceiling, a bad line dropped | `mcp.test.ts`, `frames.test.ts`, `cli.test.ts`, crate `mcp::tests`; `check:cli-pipes` holds the two command lines to each other over 18 malformed frames |
| report JSON Lines (`N` `C`) | `{file, format, urls[{value, protocol, domain, path, line?, column?, context}], diagnostics[{severity, code, message}], summary{urls}}`, `/` separators | `check-cli-parity.ts` (73 commands), `contracts.rs`, `hazards.rs`, `platform.rs`, `cli.test.ts` |
| exit codes (`N` `C`) | 0 URLs, 1 none, 2 malformed question; `--strict` 2 on any skipped report; stderr `file:line:col  url` lines and `N URLs in M files` | `contracts.rs`, `hazards.rs`, `scan.rs` tests, `cli.test.ts` |
| flags (`N` `C`) | `--dedupe`, `--format`, `--stdin`, `--strict`, `--follow-symlinks`, `--hidden`, `--no-ignore`, `mcp`, `--version`/`-V`, `--help`/`-h` | `usage.ts` ↔ `FLAGS` test, `cli.rs` tests, parity |
| npm packages | `urls-le-mcp` (bin `urls-le-mcp`, the extension's server), `url-le` (bin `urls-le`, the crate's surface) | `check:npm-package`, `check:cli-package`; `package.json`, `mcp/package.json`, `server.json`, `cli/package.json` and `crate/Cargo.toml` at 2.6.1 (the two versions jobs) |

### INV-10. Claims

| Claim | Where | Backed by | Verdict |
|---|---|---|---|
| eleven formats know what to exclude; every other document is scanned whole; nothing is refused for its name | README, crate README, `--help`, SPEC, the tool description | the corpus (19 documents), `coverage_matrix.rs`, `check-extraction-parity.ts`, `extract.rs` tests | pass |
| Markdown excludes fenced code blocks and inline code | README, crate README, cli README, SPEC, the tool description | `markdown.test.ts`, the corpus | a `~~~` fence is not excluded on either side (BUG-15, FEAT-17) |
| HTML comments, JSON non-strings, Properties and INI comment lines, TOML non-values excluded; CSS, JS/TS, YAML, XML scanned whole | README table, SPEC table | the format tests, the corpus | pass |
| protocols `http`, `https`, `ftp`, `file`, `mailto` (needs `@`), `tel`; no `ws`, `ssh`, bare domains, IPv6, relative links | README, SPEC | the corpus `scan` cases, `heuristics.test.ts` | pass |
| positions are real line and column; TOML forward-located, approximate for repeats; columns are UTF-16 units | README, cli README, SPEC | `position.test.ts`, `positions.test.ts`, `position.rs`, the corpus `A` case | pass |
| a URL ends at whitespace or a delimiter; trailing `.`/`,` kept | README, crate README, SPEC | the corpus `scan` cases | pass |
| seven commands, no default keybinding | README | `extension.test.ts`; the manifest has no `keybindings` | pass |
| twenty settings with their defaults | README table | `config.test.ts`; the table's 20 rows against the manifest by script → equal | pass |
| the folder scan: distinct URLs most-used first, 5,000 files, 10,000 occurrences, a line per thing left out, the built-in lists | README | `extractWorkspace.test.ts` (the README sample is held by "prints the report the README shows"), `scan.test.ts`, `config.test.ts` (the two lists against `defaults.ts`) | pass |
| twelve languages, both halves | README | the integration parity tests | "Extracting URLs..." is English in every locale (L10N-4) |
| no network; the MCP server reads no files; redaction; one rating prompt, at most twice | README, mcp README | `check:mcp-bundle`, `mcp::tests` "needs no filesystem", `errors.test.ts`, `policy.test.ts`, `ratingPrompt.test.ts` | pass |
| README Testing numbers | README | `coverage:readme:check` | stale (`urls-le-broken-features-1`) |
| "CI fails if this section drifts" | README Testing section, from the fleet-shared `coverage-readme.js` | `grep coverage:readme .github/workflows/*.yml` → nothing; AGENTS.md says CI does not check it | the sentence is false in every repo that carries the script (FEAT-17) |
| `--strict` and `--follow-symlinks` among the options | `--help`, cli README | `cli.rs` and `usage.ts` tests | the crate README's Options block omits `--strict`; SPEC's usage block omits `--strict` and `--follow-symlinks` (FEAT-17) |
| files that are not text, or cannot be opened, are named on stderr and carried as `skipped`; nothing silently vanishes | `--help`, crate README, SPEC, cli README | `hazards.rs`, `scan.rs` tests | a FIFO and a symbolic link in a walk vanish without a line (ERR-16) |
| exit codes follow grep | README, crate README, cli README, SPEC, `--help` | `contracts.rs`, `cli.test.ts` | pass |
| the two command lines are byte-identical | README, cli README, SPEC | `check:cli-parity`, `check:cli-pipes` | pass on what they drive; a refusal with stderr closed is not driven (ERR-20) |
| both servers answer `extract_urls` identically | README, mcp README, crate README, SPEC | the corpus, `differential.ts` | pass on the corpus and the generator; `maxResults: 5.0` and `1e3` outside both (BUG-15) |
| `.gitignore`, `.ignore` and hidden files respected; links descended only with `--follow-symlinks` | cli README, crate README | `walk.rs` tests, `cli.test.ts`, `ignoreRules.ts` reads `.ignore` | pass |
| thirteen format names, the same thirteen the extension accepts | crate README | `aliases.json` parity, `SUPPORTED_FORMATS` | pass |
| "No URLs found? Check the file's language mode matches a supported format" | help document | the extension scans every language | false since every language was read (FEAT-17) |
| the npm README: "Nine more like it", "Twelve Rust tools", "The ten LE crates" | mcp README | nothing: the counts are from an earlier family; sixteen tools ship a crate | stale counts (FEAT-17) |
| `postProcess.openInNewFile`: "Open post-processed content in a new editor" | the manifest description, 13 catalogues | nothing: Dedupe and Sort write in place and never read it (INV-4) | false (FEAT-17) |
| `echo … | npx -y urls-le-mcp` prints the tool list and exits | README, mcp README | LEAK-13: the server exits when stdin closes | run under step 5 |
| MSRV 1.88, Node 20 | crate README, manifest | the `msrv` job, `engines` | pass |

### INV-11. Tests, matched

| Test file | Matches | Gap |
|---|---|---|
| `commands.test.ts`, `outputRoutes.test.ts`, `cancellation.test.ts`, `sortModes.test.ts` | the five single-document commands and their routes | no trailing-newline or CRLF case for Dedupe and Sort (BUG-20); the five sort-mode tests assert only that something was shown (FEAT-22); no two-at-once case (RACE-3) |
| `extractWorkspace.test.ts`, `scan.test.ts`, `ignore.test.ts` | the folder and workspace commands, the scanner, the ignore rules | no case where the results cap lands inside the last file (ERR-9); no comma or brace inside one exclude pattern (BUG-8) |
| `services.test.ts`, `guard.test.ts`, `errors.test.ts` | activation, the notifier, the guard, redaction | the two status bar tests and the telemetry test assert nothing (FEAT-22); the command list names five of seven (FEAT-1); no lifecycle test disposes everything (LEAK-6) and none repeats a command (LEAK-10) |
| `config.test.ts`, `safety.test.ts`, `positions.test.ts` | defaults against the manifest, the size and line guards, positions on lines | |
| `extract.test.ts`, `extract.edge.test.ts`, `characterization.test.ts`, `heuristics.test.ts`, `position.test.ts`, the nine `formats/*.test.ts` | the engine | "should handle malformed JSON/YAML gracefully" accept any answer (FEAT-22) |
| `mcp.test.ts`, `readme.test.ts` | the extension's server, the npm README | a schema violation is asserted as `isError` (ERR-14); no non-string `paths` entry (n/a here); no `maxResults: 5.0` (BUG-15) |
| `cli.test.ts`, `frames.test.ts`, `output.test.ts` | the npm command line, its framing, its streams | the framing's drop of a bad frame is pinned (ERR-19); no FIFO or symlink case (ERR-16) |
| `parsers.test.ts` | the five transcriptions against `answers.json` | |
| `rating/policy.test.ts`, `rating/wiring.test.ts`, `ui/ratingPrompt.test.ts` | the rating policy, its wiring, its prompt | |
| `agent-files.test.ts` | the six agent files | |
| `test/integration/extension.test.ts`, `test/integration/l10n.test.ts` | the host: every command, Extract, Dedupe, the folder scan, the provider; the catalogues | no host in any locale but English (L10N-9) |
| crate `contracts.rs`, `hazards.rs`, `platform.rs`, `coverage_matrix.rs`, `budget.rs`, `scenarios.rs`; the unit tests in `cli.rs`, `scan.rs`, `walk.rs`, `mcp/`, `extract/` | exit codes, inputs, platforms, formats, time, the servers | `links_pipes_and_loops_are_survived` asserts a link is absent and a FIFO survived, which pins the silent drop (ERR-16); no malformed-frame case on the crate's server (ERR-19) |

Source files with no test of their own: `collectStrings.ts` (no caller),
`cli/main.ts`, `mcp/server.ts`, `mcp/info.ts` (entry points, driven by
`check:cli-package`, `check:mcp-bundle`, `e2e-vsix.js`), `cli/ignoreRules.ts`
(driven by `check:cli-parity` over a real tree), `cli/usage.ts` (held by
`cli.test.ts` "usage"), `workspace/defaults.ts` (held by `scan.test.ts` and
`config.test.ts`), `commands/help.ts` (one test that it opens; nothing holds
its text to the manifest: FEAT-17), `commands/index.ts`, `commands/dependencies.ts`,
`services/serviceFactory.ts`, `telemetry/telemetry.ts` (asserted by nothing:
FEAT-22), `ui/notifier.ts`, `ui/statusBar.ts` (asserted by nothing: FEAT-22),
`utils/clipboard.ts`, `utils/document.ts` (through the commands), `types.ts`.

## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, `src/commands/*`,
`src/config/*`, `src/ui/*`, `src/mcp/*`, `src/cli/*`, `test/integration/*`,
`scripts/e2e-vsix.js`, `scripts/check-*.{js,ts}`, `.vscodeignore`,
`crate/src/main.rs`, `crate/src/cli.rs`, `crate/src/mcp/*`, `mcp/package.json`,
`cli/package.json`, every README and `crate/SPEC.md`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | finding | `services.test.ts` named five of the seven commands and the host test repeated the seven by hand: `urls-le-broken-features-4`. Both read `contributes.commands` now; the unit test refuses a registration the manifest does not declare |
| FEAT-2 | E | pass | the host runs Extract on a Markdown document and reads the results document, Dedupe in place, Extract Folder from disk with its report (`extension.test.ts`); Sort, Open Settings and Help against the mock with their effects (`sortModes.test.ts`, `services.test.ts`, `help.test.ts`) |
| FEAT-3 | E | pass | every handler is `guarded(async () => …)`; Extract Folder takes the Explorer's `Uri` or asks through the open dialog, both driven (`extractWorkspace.test.ts` "asks for a folder from the palette…") |
| FEAT-4 | E | pass | two entries, `editor/context` when `editorTextFocus` and `explorer/context` when `explorerResourceIsFolder` (INV-2), read; no host test asserts a menu's placement, carried below |
| FEAT-5 | E | n/a | no keybindings |
| FEAT-6 | E | pass | INV-4: all twenty settings have a consumer, each read per run; the routes they pick are driven in `commands.test.ts`, `extractWorkspace.test.ts` and `services.test.ts` |
| FEAT-7 | E | pass | `config.test.ts` "covers every declared setting" walks the manifest against `CONFIG_DEFAULTS` |
| FEAT-8 | E | pass | `getConfiguration()` is called per command run and per notification; the status bar follows `statusBar.enabled` through a live listener, both directions (`services.test.ts`) |
| FEAT-9 | E | pass | `onStartupFinished`; the host test activates and `test:e2e-vsix` drives the installed artefact |
| FEAT-10 | E | pass | `baseline/12-package.log`: 34 files, `dist/extension.js`, `dist/mcp-server.js`, 12 `package.nls.*.json`, 13 `l10n/bundle.l10n*.json`; `test:e2e-vsix` installs it into a clean profile |
| FEAT-11 | E | pass | `check-bundle.js` read: static require scan, runtime load with `vscode` stubbed |
| FEAT-12 | M N C | finding | `probes/shared-{M,N,C}-baseline.out`, 43 frames to the three servers: one handshake answered two ways, a null id answered by two, a malformed frame answered by one and dropped by two, a schema violation an `isError` result on all three and a wrong-typed optional argument read as absent: `urls-le-errors-2`, `-3`, `urls-le-leaks-1`. `probes/shared-*-after.out` is not kept separately: `check-cli-parity.ts` now sends every one of those frames to N and C and `mcp.test.ts` to M |
| FEAT-13 | M C | finding | the scripts read: `check-extraction-parity.ts` (corpus, 30 cases at close), `differential.ts` (4,000 generated documents), `check-mcp-definition.ts`, `check-cli-parity.ts`. They agreed on one defect: a `~~~` fence was text on both sides: `urls-le-broken-features-6` |
| FEAT-14 | M | pass | `e2e-vsix.js` spawns the installed server as `provider.ts` builds it; `extension.test.ts` "offers its MCP server to agent mode" reads the definition; `lifecycle.test.ts` activates on a host without `vscode.lm` |
| FEAT-15 | N | pass | `check:npm-package` and `check:cli-package` install from the tarballs and serve |
| FEAT-16 | C | pass | every flag and exit code has a `contracts.rs` or `hazards.rs` test (INV-9); the binary over this repository: `1992 URLs in 264 files`, exit 0 (`probes/real-repo.err`) |
| FEAT-17 | all | finding | INV-10: the README's generated numbers (`-1`), the crate README's and SPEC's option blocks (`-7`), the npm README's family counts (`-8`), the help document's language-mode line (`-9`), the `postProcess.openInNewFile` description in thirteen catalogues (`-10`). One claim stays false and is carried: the generated section's own sentence "CI fails if this section drifts", written by the fleet-shared `scripts/coverage-readme.js`; no workflow runs `coverage:readme:check` |
| FEAT-18 | all | finding | `src/extraction/formats/collectStrings.ts` had no caller and 0% on every metric: `urls-le-broken-features-5`. Every setting consumed (INV-4), every command registered (INV-3), every bundle key called (`src/l10n.test.ts` at close), every `package.json` script a gate or listed under the gate table. `readUtf8File` in the fleet-shared `src/cli/ioError.ts` is called by colors-le alone, carried |
| FEAT-19 | E | pass | `vitest.config.ts` thresholds 70/70/60/70, `src/**` included, tests and mocks excluded; the README section regenerated from the final coverage run (`95a91c7`) |
| FEAT-20 | E | n/a | no skipped tests (BASE-8) |
| FEAT-21 | all | pass | `commit-lint.js` refused `fixup! …` on the commit-msg hook ("must start with one of feat, fix, …"); `check-mcp-bundle.js` refuses a server that crashes on a closed pipe (`fail/errors-6-m.log`); `check-agent-files.py` holds the six agent files; the crate preflight refuses a missing corpus file (`fail/`-less: the gate itself was red, `baseline/42-crate-package-list.log`) |
| FEAT-22 | all | finding | eleven tests accepted any answer: two status bar tests and the telemetry test asserted nothing, five sort-mode tests asserted that something was shown, the INI test that an array came back, two "malformed … gracefully" tests that `success` was a boolean: `urls-le-broken-features-3` |
| FEAT-23 | all | pass | `policy-docs` greps `*.md`; `grep -rniE` of its three sentences over `src crate/src scripts test` → none |

## Step 3: Bugs

Re-read for this step: `src/extraction/*`, `src/commands/*`, `src/utils/*`,
`src/workspace/*`, `src/cli/*`, `crate/src/*`, `crate/fixtures/*`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | empty, whitespace-only and no-URL documents in `extract.edge.test.ts`; an empty document through Dedupe and Sort stays empty (`commands.test.ts`); `paths: []` refused by name on N and C; the parity tree carries `empty.md` and `none.md` |
| BUG-2 | all | pass | every `\|\|` and `!x` in `src/` read (grep in the step log): `result.errors[0]?.message \|\| …` falls back on an empty message by design; `format \|\| filename ? FALLBACK : null` treats an empty name as absent, which the corpus pins ("an empty format is not a name") |
| BUG-3 | all | pass | `maxResults` 1 and 5,000 clamp, 10 MB measured in UTF-8 bytes exactly, 50,000 URLs cap, `MAX_FRAME_BYTES` exactly at the limit served on all three (`frames.test.ts`, the crate's `a_frame_at_the_limit_is_served`, `mcp.test.ts`) |
| BUG-4 | all | finding | BOM, CRLF, NUL, latin-1 and UTF-16 in the parity tree and `hazards.rs`; a BOM-led frame refused alike on all three; Dedupe and Sort lost a document's trailing newline and wrote bare newlines to a CRLF document: `urls-le-bugs-1` |
| BUG-5 | all | pass | both walks sort by path component (`check-cli-parity.ts` holds the order); the workspace report orders by occurrences then value with a plain comparison; Sort keeps the written order between equal lengths (`sortModes.test.ts`) |
| BUG-6 | E M C | pass | `probes/regex.ts`: the scanner over 100k–400k characters in 0.2–0.8 ms, linear; the crate's fuzz ran 60 s (`final/38-fuzz.log`) |
| BUG-7 | M N C | finding | a cap written as `1E20` was refused by N and C and clamped by M; `2.0` and `1e3` the same; JSON Schema's `integer` is any whole number: part of `urls-le-errors-3` |
| BUG-8 | N C | pass | report paths use `/` on every platform; `ünïcode.md`, `with spaces`, a dotted directory and a 260-character path in the parity tree and `hazards.rs` |
| BUG-9 | all | pass | every `as` cast in `src/` read: `transport.ts` casts behind `isRequest`, `cli/mcp.ts` reads through `field()`, `rating/policy.ts` validates each field after the cast |
| BUG-10 | all | finding | six catch arms spelt three English fallbacks for a thrown value that is not an Error: `urls-le-l10n-1`. `extractNonEmptyLines` in `dedupe.ts` and `sort.ts` is two copies of four lines, left; the npm server's envelope and cap reader mirror the crate's by design |
| BUG-11 | all | finding | `collectStrings.ts` dead (`urls-le-broken-features-5`); the scan's `stoppedEarly` was false when the cap landed inside the last file, so its note never fired there: `urls-le-errors-1` |
| BUG-12 | E | pass | every result array and object is frozen (`extract.edge.test.ts` "Immutability"); `CONFIG_DEFAULTS` frozen; no module-level mutable state in `src/` outside the mock |
| BUG-13 | E | finding | the help document told a user who found no URLs to check the language mode, after every language had been scanned whole: `urls-le-broken-features-9` |
| BUG-14 | E | pass | `sanitizeErrorMessage` redacts home directories and credential-shaped fragments; the guard routes every thrown value through it (`guard.test.ts`) |
| BUG-15 | M N C | finding | a wrong-typed optional argument was read as absent or false on all three, and an argument the schema does not declare was accepted: `urls-le-errors-3` |
| BUG-17 | all | pass | every invariant in `AGENTS.md` re-read against the code; the one that had stopped being true, "the transport is one copy across the family", is rewritten (`03e279c`) |
| BUG-18 | all | pass | `Object.hasOwn` in `fileType.ts` and `cli/mcp.ts`; `SWITCHES` in `args.ts` is a frozen object literal and `--constructor`, `--__proto__` and `--toString` are "not an option" on both binaries (probe in the step log); the `ioError.ts` tables are keyed by OS error codes, not caller text |
| BUG-20 | E | finding | a trailing newline, CRLF, a blank line inside and an empty document, for Dedupe and Sort: `urls-le-bugs-1` |

## Step 4: Errors

Re-read for this step: INV-7's files, `src/commands/guard.ts`, `src/commands/output.ts`,
`src/utils/clipboard.ts`, `src/mcp/transport.ts`, `src/cli/mcp.ts`, `src/cli/frames.ts`,
`src/cli/main.ts`, `src/cli/output.ts`, `src/cli/walk.ts`, `crate/src/mcp/mod.rs`,
`crate/src/cli.rs`, `crate/src/walk.rs`, `scripts/check-cli-pipes.ts`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | pass | INV-7: every `catch` names what it swallows; the output routes report through the notifier; a thrown value that is not an Error is described through one helper now |
| ERR-2 | all | pass | `coverage:readme:check` was red at baseline and said why; a file the scan could not read is counted apart from one that is not text; `ok` is driven by error diagnostics, not by an empty result |
| ERR-3 | M N C | finding | an entry of `paths` that is not a string vanished without a word on N and C; a FIFO vanished from a walk: `urls-le-errors-3`, `-4` |
| ERR-4 | E N C | finding | "The rest of the files were not read" when none remained (`urls-le-errors-1`, own note); "Not a directory" for a FIFO named outright on N (`urls-le-errors-4`) |
| ERR-5 | E | pass | `applyEdit`'s result is checked before any count is announced; a rejected edit is an error (`commands.test.ts`, `sortModes.test.ts`) |
| ERR-6 | E M | pass | `void respond(parsed).then(…)` in the transport: `respond` catches everything and answers an error reply; `void deps.ratingPrompt.recordSuccess()` is deliberate and documented; biome's lint runs |
| ERR-7 | E | pass | every command body runs inside `guard.ts`; `guard.test.ts` reads the source for a `registerCommand` whose handler is not `guarded(...)` |
| ERR-8 | E | finding | six `error instanceof Error ? error.message : '…'` arms, one helper now, and `src/l10n.test.ts` refuses the shape: `urls-le-l10n-1` |
| ERR-9 | E N C | finding | the results limit reached inside the last file dropped URLs without a note (`urls-le-errors-1`); a FIFO or a link in a walk was passed over without a word (`urls-le-errors-4`) |
| ERR-10 | E | pass | every notification goes through the notifier (`guard.ts`, INV-8); the one literal handed to it is through the bundle now (`urls-le-l10n-1`) |
| ERR-11 | E | pass | a cancel between the extraction and the output route leaves `displayResults` a no-op and announces nothing (`extract.ts`, `_cancelAfterProgress` in `commands.test.ts`); a cancelled scan writes no report |
| ERR-12 | E | pass | the mock refuses an edit (`_setApplyEditResult`, `_setApplyEditError`), fails to open a document (`_setOpenDocumentError`), fails the clipboard (`_setClipboardError`), cancels after progress (`_cancelAfterProgress`); every `catch` in INV-7 is reached by one |
| ERR-13 | all | finding | `commands.test.ts` pinned "Extracted 1 URLs" three times (`urls-le-l10n-6`); the npm server's test pinned a scan naming nothing as an `isError` result (`urls-le-errors-3`); the eleven vacuous tests (`urls-le-broken-features-3`) |
| ERR-14 | M | finding | the extension's server echoed the client's protocol version, replied to an `initialize` with no id, answered `notifications/initialized` sent with an id with silence, read a BOM-led frame as a request and answered a schema violation as the tool's failure: `urls-le-errors-2`, `-3` |
| ERR-15 | C | finding | fuzz 60 s and every hazard survived; `--help`, `--version` and a refusal panicked, exit 101, on a closed pipe: `urls-le-errors-5` |
| ERR-16 | N M C | finding | a FIFO, a socket or a device and a link not followed were silences on both walks: `urls-le-errors-4`. A locked directory and a locked file were already named (`check-cli-parity.ts` builds both) |
| ERR-17 | N E | pass | the `\|\| true` in `ci-crate.yml`'s policy grep and the `2>/dev/null` in `release-cli.yml`'s tag probe are each guarded by a test of the captured value; `release-crate.yml`'s preflight failed loudly, on a corpus file this repo never had (`urls-le-broken-features-2`) |
| ERR-18 | E | pass | `hideProgress()` runs in the `finally` of the progress callback (`extract.ts:65`) |
| ERR-19 | M | finding | the extension's server already answered a frame it could not read; the npm command line's and the crate's dropped it, and read a null id as a request: `urls-le-leaks-1` |
| ERR-20 | N C | finding | `probes/pipes.out`: the crate's `--help` and `--version` with stdout closed exit 101 with a stack trace, a refusal with stderr closed exit 101; the extension's server with stdout closed died on an unhandled EPIPE: `urls-le-errors-5`. `probes/pipes-after.out`: every case exit 2 on every surface, one line or none |

## Step 5: Memory leaks

Re-read for this step: `src/extension.ts`, `src/services/*`, `src/ui/statusBar.ts`,
`src/telemetry/telemetry.ts`, `src/mcp/transport.ts`, `src/cli/frames.ts`,
`src/cli/mcp.ts`, `crate/src/mcp/mod.rs`, `crate/src/walk.rs`, `crate/src/scan.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | INV-5: the status bar item and its listener are pushed by `createStatusBar`, the wrapper and the telemetry by the factory, seven commands by `registerCommands`; `lifecycle.test.ts` reads zero live items, channels, listeners and commands after disposal. The item is disposed twice, once by itself and once through its wrapper, which is harmless |
| LEAK-2 | E M | pass | one configuration listener, released by its subscription (`_configListenerCount` → 0); the server adds one `data` and one `drain` listener per process |
| LEAK-3 | E M | n/a | no timer in `src/` (grep); `vi.getTimerCount()` is 0 after every command in `lifecycle.test.ts` |
| LEAK-4 | E | pass | the telemetry channel is created on the first event and released by `dispose` (`services.test.ts` reads `disposed`) |
| LEAK-5 | E | pass | `lifecycle.test.ts` disposes every subscription twice |
| LEAK-6 | E | pass | `lifecycle.test.ts` "deactivation releases every command, listener, item, channel and timer" |
| LEAK-7 | all | pass | no module-level collection in `src/` grows per run; the rating prompt's state lives in `globalState` |
| LEAK-8 | E | pass | results are handed to the host as a document or an edit and not kept; the engine's result is frozen and dropped with the run |
| LEAK-9 | E | pass | the extension spawns nothing; the host launches the MCP server from the definition, and `e2e-vsix.js` ends the one it spawns |
| LEAK-10 | E | pass | `lifecycle.test.ts`: fifty rounds of every command leave the counts where one round left them, 11 subscriptions |
| LEAK-11 | M N C | finding | `probes/frames-baseline.out`: M refused a 16 MiB+1 line; N answered it as a request and held a 40 MiB unterminated line at 2,636 MB resident; C held it at 63 MB and answered. `probes/frames-after.out`: all three refuse the line, serve the next, and hold nothing past the limit: `urls-le-leaks-1`. N's resident size is still high on the way to the limit (1,148 MB, transient garbage from concatenating chunks), carried |
| LEAK-12 | M N C | pass | `probes/memory-baseline.out`, 3,000 `extract_urls` calls one at a time: M 53 → 85 MB and flat from 2,500; N 53 → 112 MB and flat from 1,000; C 7 MB throughout. `probes/memory-m-baseline.out`: M flat at 85 MB through 8,000 |
| LEAK-13 | M N C | pass | all three exit 0 within 4 ms of stdin closing (same logs) |
| LEAK-14 | C | pass | a document over 10 MB is refused by name; a frame over 16 MiB is refused and the rest of the line dropped as it arrives (the crate's `a_frame_over_the_limit…` test, `fail/errors-4-n.log` for the npm side) |
| LEAK-15 | C | pass | a symlink loop under `--follow-symlinks` is reported, not followed (`hazards.rs`); without the flag no link is followed |
| LEAK-16 | C | pass | no temporary file is written; every `Tree` in the tests removes itself |
| LEAK-17 | tests | pass | `_resetMockState` in every `beforeEach`; fake timers restored; `probes/race-17.log`: three runs and a shuffled run, 532 tests each |

## Step 6: Race conditions

Re-read for this step: INV-6's files, `src/commands/extract.ts`, `src/commands/sort.ts`,
`src/commands/dedupe.ts`, `src/commands/output.ts`, `src/commands/extractWorkspace.ts`,
`src/workspace/scan.ts`, `src/mcp/transport.ts`, `src/cli/frames.ts`,
`crate/src/mcp/mod.rs`, `crate/src/walk.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | pass | Sort reads the document after the quick pick resolves, not before; Dedupe reads and writes with no suspension between; Extract reads inside the progress callback |
| RACE-2 | E | pass | the in-place route reads `getText()` and applies the edit inside one host callback with only microtask gaps between them (`extractUrls` awaits nothing outside the process); the edit covers the whole document as it is at write time |
| RACE-3 | E | pass | `commands.test.ts` "two invocations at once": two Extracts open two results documents and announce two counts; a Dedupe and a Sort started together each write their own document |
| RACE-4 | E | pass | nothing is shared between two runs but the status bar text, whose later write wins |
| RACE-5 | E | pass | the rating prompt writes `globalState` before the toast is awaited (`ratingPrompt.test.ts`) |
| RACE-6 | E | pass | the token is read before the extraction, after it, before each output route and before the clipboard write (`extract.ts`, `output.ts`); `_cancelAfterProgress` drives the gap |
| RACE-7 | E | pass | `getConfiguration()` is read once at the top of a run and carried through it |
| RACE-8 | E | pass | the host disposes `context.subscriptions` only after the extension host stops dispatching commands; a disposed status bar item ignores a later `text` write. Reasoned, not driven, carried |
| RACE-9 | E | pass | one `activate`, services built before commands are registered |
| RACE-10 | E | pass | the workspace report orders by occurrences then value with a plain comparison, never `localeCompare`; both walks sort by component |
| RACE-11 | E C | pass | a file deleted or locked between the listing and the read is counted as unreadable by the scan (`scan.test.ts`) and reported as `skipped` by both command lines (`check-cli-parity.ts` builds `locked.md`) |
| RACE-12 | M N C | pass | a frame split across chunks is reassembled on M (`mcp.test.ts`), N (`frames.test.ts`) and C (`drive()` feeds 8 KiB chunks) |
| RACE-13 | M | pass | each request is answered by a pure function over its own arguments; replies may interleave and each carries its id |
| RACE-14 | M N C | pass | a partial frame at close is dropped on all three; stdin closing mid-session exits 0 |
| RACE-15 | C | pass | single-threaded: `WalkBuilder::build()`, not `build_parallel()` |
| RACE-16 | C | pass | `collect` sorts and dedupes; the whole suite under `TZ=UTC` and `TZ` unset (`final/30`, `final/31`) |
| RACE-17 | tests | pass | `probes/race-17.log`: three runs and a shuffled run, 532 tests each |
| RACE-18 | E | n/a | nothing is debounced |

## Step 7: Translations

Read in full: `package.json`, `package.nls.json`, twelve `src/i18n/package.nls.*.json`,
`l10n/bundle.l10n.json`, twelve `l10n/bundle.l10n.*.json`,
`test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n`
scripts. Every value in every locale was read: 53 runtime keys and 34 manifest
keys per locale at baseline, 92 and 34 at close.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | `test/integration/l10n.test.ts` walks the whole `contributes` tree for `%key%` entries |
| L10N-2 | E | pass | the integration test holds the twelve catalogues to the source keys; `src/l10n.test.ts` holds the twelve bundles to the English keys |
| L10N-3 | E | pass | de, es, fr, id, it, ja, ko, pt-br, ru, uk, vi, zh-cn, both mechanisms |
| L10N-4 | E | finding | `'Extracting URLs...'`, the progress title, was passed to `l10n.t()` and never put in the bundle, English in every language: `urls-le-l10n-4`, with the guard that reads the source against the bundle both ways |
| L10N-5 | E | finding | three English fallbacks and a literal handed to the notifier (`urls-le-l10n-1`); the help document one English template (`urls-le-l10n-3`) |
| L10N-6 | E | pass | `src/l10n.test.ts` "never calls l10n.t() at module scope"; `statusBar.ts`'s `idleText` is an arrow called per use |
| L10N-7 | E | pass | `src/l10n.test.ts` "every call hands l10n.t() a string literal" |
| L10N-8 | E | pass | the VSIX carries 12 manifest catalogues and 13 bundles (FEAT-10) |
| L10N-9 | E | finding | nothing showed either mechanism loading in a real host: `urls-le-l10n-5`, two launch configs; the host in German reads the help document back as `# URLs-LE Hilfe` with `**URLs extrahieren**` in its command list (`probes/host-tests-german.log`) |
| L10N-10 | E | pass | the integration test and `src/l10n.test.ts` both compare placeholder sets per key per locale |
| L10N-11 | E | pass | `URL` is untranslated in all twelve (never translated); `Occurrences` in French is the French word; `manifest.command.category` is the product name |
| L10N-12 | E | finding | three bundles rewrote the product name inside the status bar text ("URL-LE: Listo", "URL-адреса-LE", "URL-адреси-LE") and eight manifest catalogues named it "URL-LE": `urls-le-l10n-2`, with the check that reads every value for it |
| L10N-13 | E | finding | six bundles carried "$(link) URLs-LE" for "URLs-LE: Ready", the text of a version that showed an icon and no word (`urls-le-l10n-2`); all twelve translations of "Removed {0} duplicate URLs ({1} remaining)" read {0} as the place the duplicates were removed from, and the Japanese and Chinese "Sorted {0} URLs ({1})" read the order's name as a second count (`probes/count-strings.out`): `urls-le-l10n-6` |
| L10N-14 | E | finding | "GitHub Issues" was English in Japanese, Vietnamese and Chinese, which `check:locales` refuses: `3549c10` under `urls-le-l10n-2` |
| L10N-15 | E | finding | "Extracted 1 URLs", "Sorted 1 URLs", "Removed 1 duplicate URLs", pinned by three tests: `urls-le-l10n-6`, the `URL(s)` form the workspace report already used |
| L10N-16 | E | pass | within each locale the status bar, the progress title and the help document use one verb for extracting; the command titles in the help document are the manifest catalogue's, held equal by `help.test.ts` |
| L10N-17 | E | pass | Sort picks its order by `value`, never by the translated label (`sortModes.test.ts`); nothing in `src/` compares a translated string to an English literal |
| L10N-18 | N M C | pass | `src/cli/` and `src/mcp/` call no `l10n`; the JSON Lines and every MCP reply are English on every host; the workspace report is a document for a person and is translated |

## Findings

One commit per finding on `fix/fleet-pass`, each named in its message. "Failed
without fix" is the log under `fail/`, or the probe under `probes/` where the
reproduction was a process rather than a test.

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| `urls-le-broken-features-1` | broken-features | The README's generated Testing section said 475 cases across 35 files at 77.59% statements; the suite had 487 across 36, and 532 across 39 at 80.30% at close | `bun run coverage:readme:check` → exit 1 (`baseline/05`, `final/05`) | `95a91c7` | `coverage:readme:check` | exit 1; `final/05b` exit 0 |
| `urls-le-broken-features-2` | broken-features | `release-crate.yml`'s preflight required `fixtures/heuristics.json` and `fixtures/mcp-extract-paths.json`, another tool's corpus; every dispatch of the crate release would have failed before it checked anything, and none had run | the step's script → exit 1, two `MISSING` lines (`baseline/42`) | `8b69c23` | the gate | exit 1; `final/42` exit 0 |
| `urls-le-broken-features-3` | broken-features | Eleven tests accepted any answer: two status bar tests and the telemetry test asserted nothing, five sort-mode tests that something was shown, the INI test that an array came back, two "malformed … gracefully" tests that `success` was a boolean | read; `probes/feat22.out` shows what the malformed documents answer | `fbc86b3` | `services.test.ts` (status bar, telemetry), `sortModes.test.ts`, `extract.edge.test.ts` | the old assertions pass on any code; the new ones read the item, the channel, the written document and the exact result |
| `urls-le-broken-features-4` | broken-features | `services.test.ts` named five of the seven commands; the host test repeated the seven by hand | read | `1a071de` | `services.test.ts` "registers every command the manifest declares, and no other"; `extension.test.ts` | an eighth command declared without a registration passed both |
| `urls-le-broken-features-5` | broken-features | `src/extraction/formats/collectStrings.ts` had no caller since 2.6.0 and 0% on every metric | `grep -rlw collectStrings src scripts` → the file alone | `85f1635` | none: the file is gone; `typecheck` and `build` hold it | n/a |
| `urls-le-broken-features-6` | broken-features | A Markdown block fenced with `~~~` was text on both sides, so a URL inside it was extracted by every surface while the README says fenced blocks are excluded | `probes/feat22.out`, `probes/feat22-crate.out` | `d7f8e86` | `markdown.test.ts` "excludes a block fenced with tildes"; the crate's `a_tilde_fenced_block_is_excluded_from_markdown`; the corpus document; the parity tree | `fail/broken-features-6-ts.log`, `fail/broken-features-6-crate.log` |
| `urls-le-broken-features-7` | broken-features | The crate README's Options block left out `--strict`; the SPEC's usage block left out `--strict` and `--follow-symlinks` | read against `FLAGS` | `4a6ee7f` | the crate's `the_readme_and_the_spec_name_every_flag` | `fail/broken-features-7.log` |
| `urls-le-broken-features-8` | broken-features | The npm README said "Nine more like it", "Twelve Rust tools" and "ten LE crates" of a sixteen-tool family | read against `letools-site/lib/tools.ts` | `c0b7fa8` | `readme.test.ts` (fleet-shared) still passes; the counts are prose | n/a |
| `urls-le-broken-features-9` | broken-features | The help document told a user who found no URLs to check the language mode, after every language had been scanned whole; it named "Help" where the palette shows "Help & Troubleshooting" | read against `extract.ts` and the manifest | `534195e` | `help.test.ts` | `fail/broken-features-9.log` |
| `urls-le-broken-features-10` | broken-features | `postProcess.openInNewFile` was described as "Open post-processed content in a new editor" in thirteen catalogues; Dedupe and Sort never read it, Extract's results route does | read against `output.ts` | `b726987` | none: a description; `config.test.ts` holds the default | n/a |
| `urls-le-bugs-1` | bugs | Dedupe and Sort joined the lines with a bare newline and nothing after the last, so a document ending in a newline lost it on every run and a CRLF document was handed bare newlines | `commands.test.ts` "a line command keeps the document's terminator" | `a7cd853` | the same five tests; `document.ts` | `fail/bugs-1.log` |
| `urls-le-errors-1` | errors | A folder or workspace scan that reached the results limit inside the last file dropped the URLs after it with no note | `extractWorkspace.test.ts` "says when the results limit was reached inside the last file" | `3a60178` | the same | `fail/errors-1.log` |
| `urls-le-errors-2` | errors | The extension's MCP server echoed the client's protocol version with `listChanged: false`, replied to an `initialize` with no id or a null one, answered `notifications/initialized` sent with an id with silence, and read a BOM-led frame as a request, each unlike the crate's server; it never paused reading while the pipe to a slow client was full | `probes/shared-M-baseline.out` | `c6ba862` | `mcp.test.ts` protocol and loop tests, "a client that reads slowly" | `fail/errors-2.log` |
| `urls-le-errors-3` | errors | All three servers answered a schema violation as the tool's own failure and read a wrong-typed optional argument as absent (`format: 7` scanned as plain, `dedupe: "yes"` and `hidden: "yes"` false, an entry of `paths` that is not a string dropped, an undeclared argument accepted); N refused a cap written as `1E20` where M clamped it | `probes/shared-{M,N,C}-baseline.out` | `f10791d` | `mcp.test.ts`, `cli.test.ts` (three tests), the crate's `a_wrong_typed_or_undeclared_argument_is_a_protocol_error` and `a_cap_written_as_an_exponent…`; five corpus cases with the code; `check-cli-parity.ts` lines | `fail/errors-3-{m,n,c}.log` |
| `urls-le-errors-4` | errors | Both walks passed over a FIFO, a socket or a device without a word; the crate answered one named outright as an empty directory and the npm command line as "Not a directory"; both passed over every link not followed without a word | `probes/fifo.out` | `df3d975` | `cli.test.ts` (four tests), the crate's `a_symbolic_link_is_counted_not_followed_and_not_silent` and the FIFO cases in `links_pipes_and_loops_are_survived` | `fail/errors-5-n.log`, `fail/errors-5-c.log` (the contracts test; the hazards case is the probe) |
| `urls-le-errors-5` | errors | The extension's server died on an unhandled EPIPE with a stack trace when the client closed the pipe; the crate's `--help`, `--version` and refusals panicked, exit 101, on a closed stdout or stderr | `probes/pipes.out` | `f0cb0ac` | `check-mcp-bundle.js` closes the pipe; the crate's `a_closed_pipe_is_refused_in_the_npm_command_lines_words` | `fail/errors-6-m.log`; `probes/pipes.out` for the crate (the test's first draft did not compile against the old binary); `probes/pipes-after.out` |
| `urls-le-leaks-1` | leaks | The npm command line's server and the crate's dropped a frame that was not JSON, not UTF-8 or not a request, answered a null id, refused an unknown method or tool in their own words, and held a frame until its newline with no ceiling: N held 40 MiB unterminated at 2.6 GB resident and answered a 16 MiB line as a request | `probes/frames-baseline.out`, `probes/shared-{N,C}-baseline.out` | `d4ec8f7` | `frames.test.ts` (nine tests), `cli.test.ts` (three), the crate's eight loop tests | `fail/errors-4-n.log`; `probes/frames-after.out` |
| `urls-le-l10n-1` | translations | Six catch arms spelt three English fallbacks for a thrown value that is not an Error; the denied-clipboard warning was a literal handed to the notifier | `src/l10n.test.ts` at baseline | `1ad5753` | `src/l10n.test.ts` "falls back to no English literal…", "hands no literal to a notification…" | `fail/l10n-guard.log` |
| `urls-le-l10n-2` | translations | Six bundles carried "$(link) URLs-LE" for "URLs-LE: Ready", three rewrote the product name inside it, eight manifest catalogues named the product "URL-LE"; "GitHub Issues" was English in three | the catalogue read (`fail/l10n-guard.log`, the bundle and manifest rows); `check:locales ../` | `1514648`, `3549c10` | `src/l10n.test.ts` "every translated value keeps what the English value carries"; `check:locales` | `fail/l10n-guard.log` |
| `urls-le-l10n-3` | translations | The help document was one English template literal | read; `probes/host-tests-german.log` at close is the proof the other way | `95a28e0` | `help.test.ts` "in every language"; `test/locale/german-host.test.ts` | the German host read `# URLs-LE Help` before; `# URLs-LE Hilfe` after |
| `urls-le-l10n-4` | translations | `'Extracting URLs...'` was passed to `l10n.t()` and never put in the bundle | `src/l10n.test.ts` at baseline | `39b834c` | `src/l10n.test.ts` "every string passed to l10n.t() is in the bundle" | `fail/l10n-guard.log` |
| `urls-le-l10n-5` | translations | Nothing showed either localization mechanism loading in a real host | the integration test's own header says why it cannot | `ad5757a` | `test/locale-setup/`, `test/locale/`, two launch configs | not a failing test: a host that had never been asked; `probes/host-tests-german.log` |
| `urls-le-l10n-6` | translations | "Extracted 1 URLs", "Sorted 1 URLs", "Removed 1 duplicate URLs"; all twelve translations of the dedupe summary read its count as a place, and the Japanese and Chinese sort summaries read the order's name as a count | `probes/count-strings.out`; three tests pinned the English | `8357f66` | `commands.test.ts`, `sortModes.test.ts` read the summaries; `src/l10n.test.ts` holds the keys | the pinned expectations |

Two commits carry no finding: `22cda0f` adds the lifecycle and two-at-once
tests, which pass as the code stands (LEAK-6, LEAK-10, RACE-3), and `03e279c`
writes the invariants above into `AGENTS.md`. `b17a1a7` ignores
`crate/coverage.json`, which the coverage gate writes and which turned the
publish dry run red on the same tree (`final/44`, green on the committed tree
in `final/44c`).

## Carried and unknown

The first close carried seven rows. On the owner's instruction, two were
closed on 2026-10-30 by a sweep across the fleet rather than by this pass:
the README sentence, fixed once in the shared `scripts/coverage-readme.js`
and regenerated in all sixteen repos (`7ac8bb2` here), and the npm frame
reader's transient copies, fixed in the shared `src/cli/frames.ts`
(`cbbd5c0` here, 975 MB resident after a 16 MiB line before, 82 MB after).
The same sweep carried this repository's `src/mcp/transport.ts`,
`src/cli/frames.ts` and `src/cli/frames.test.ts` to the other fifteen and
emptied the fleet check's exception lists for them, so a later pass cannot
re-find what this one fixed in those files.

| Id or check | What is open | What would settle it |
|---|---|---|
| FEAT-18, `readUtf8File` | exported by the fleet-shared `src/cli/ioError.ts` and called by colors-le alone | a fleet decision: move it to colors-le or leave the shared file whole |
| FEAT-4, the context menus | `editor/context` and `explorer/context` are read from the manifest; no host test asserts where a menu entry appears | a host test that reads the menus, if the API ever exposes them |
| RACE-8 | a status bar text write after dispose is reasoned safe from the host's ordering, not driven | a host test that deactivates while a command runs |
| CLOSE-5, `check:locales ../` | red on numbers-le's main: "GitHub Issues" in its Japanese, Vietnamese and Chinese bundles, the same three this pass fixed here | three values in numbers-le |
| `cargo audit` | not installed here; CI runs it | the pull request's `ci-crate.yml` run |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | every check in steps 0 to 7 has an answer above; no `not done`, no `unknown` |
| CLOSE-2 | pass | 23 findings fixed with commit and test; 7 rows carried above at the first close, 5 after the sweep of 2026-10-30, each with what would settle it |
| CLOSE-3 | pass | `fail/*.log` for every fix that a test could show failing; the two whose reproduction was a process name the probe log |
| CLOSE-4 | pass | the Final column above: 47 of 49 gates exit 0 on `03e279c`, the two red ones green after the README regeneration and the ignore rule (`final/05b`, `final/44c`), and the 17 gates the last commits touch exit 0 on `8357f66` (`final2/`); `cargo audit` runs in CI only |
| CLOSE-5 | see carried | from `letools-site`: `check:fleet ../` green with this repo on the exception lists for `src/mcp/transport.ts`, `src/cli/frames.ts` and `src/cli/frames.test.ts` (`fe7c827`); `check:doc-paths ../` green (955 references); `check:registry` green after the facts for the four earlier releases were synced (`e7ee664`); `check:locales ../` red on numbers-le's three "GitHub Issues" values alone, carried |
| CLOSE-6 | pass | a line in `CHANGELOG.md` or `crate/CHANGELOG.md` for every behaviour change; the invariants in `AGENTS.md` (`03e279c`); the README's generated section by its script; the crate README and SPEC for the walk and the flags |
| CLOSE-7 | pass | `git log origin/main..HEAD --format='%ae'`: 28 commits, every one `13629544+nolindnaidoo@users.noreply.github.com`; `lint:commits` conforms (`final2/lint-commits.log`); no attribution line anywhere; the diff holds no probe, log or scratch file (`git status --porcelain` empty, `final2/git-status-after.log`) |
| CLOSE-8 | pass | [nolindnaidoo/urls-le#60](https://github.com/nolindnaidoo/urls-le/pull/60): the findings table, the carried list, what was verified; no attribution |
| CLOSE-9 | see note | the pull request's checks at `8357f66`: 35 pass, 1 skipped (`auto-merge`, Dependabot's), none failed: `ci.yml` on three operating systems with the versions gate and the commit lint, `ci-crate.yml` with cli-parity and hazards on three operating systems, coverage, differential, fuzz, budget, msrv, audit, coverage-matrix, CodeQL. Merging and releasing are a separate authorization; the pull request is open and mergeable |
| CLOSE-10 | pass | the ledger row and this record in one `letools-site` change on `fleet-pass/urls-le` |
| CLOSE-11 | pass | `translations.md` L10N-12 gains the reverse case, an icon in a locale where the English value has none, which six bundles carried here; L10N-13 already named a count read as a name and a label read as a count, both found here; `README.md` counts eight passes |
