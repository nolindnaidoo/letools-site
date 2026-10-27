# Fleet pass record: numbers-le

Started from `records/TEMPLATE.md`. Evidence is pasted, not described; the
logs it names are in the pass scratchpad (`logs/baseline/`, `logs/final/`,
`logs/probes/`, `fail/`) and the findings table names the commit and the
test for each.

| | |
|---|---|
| Repo | numbers-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `7aece032` (`7aece03250dd58a2451aeaf597a6363e4777225a`) |
| Started | 2026-10-26 |
| Pull request | [nolindnaidoo/numbers-le#64](https://github.com/nolindnaidoo/numbers-le/pull/64) |
| Carried items closed | 2026-10-27, on the owner's instruction: the seven rows the first close carried, each a finding below |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-cli,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; `git status -sb` → `## main...origin/main` at `7aece032` |
| BASE-2 | pass | `git config user.email` inside the repo → `13629544+nolindnaidoo@users.noreply.github.com`; no repo-local override |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from `main` at `7aece032` |
| BASE-4 | pass | 48 gates derived from the seven workflow files and `package.json` scripts, written as `gates.sh` (table below) |
| BASE-5 | see table | `gates.sh baseline` ran every command unpiped, each to its own log under `logs/baseline/`, and recorded the exit code |
| BASE-6 | see findings | one red gate at baseline: `coverage:readme:check` (`numbers-le-broken-features-1`); `cargo audit` not run here |
| BASE-7 | recorded | 79.11% statements, 70.78% branches, 85.93% functions, 80.73% lines. Under the floors or at 0% for a metric: `src/cli/main.ts` 0% (the entry point, driven by `check:cli-package`), `src/mcp/info.ts` and `src/mcp/server.ts` 0% lines (entry points, driven by `check:mcp-bundle`), `src/parsers/reference/generate.ts` 0% (a script), `src/cli/ignoreRules.ts` 43% lines / 22% branches, `src/cli/ioError.ts` 50% / 35%, `src/cli/mcp.ts` 60% / 59%, `src/cli/scan.ts` 50% lines, `src/mcp/provider.ts` 37.5% lines, `src/parsers/text.ts` 62% lines, the TOML decoder, loader and parser 51–58% branches, `src/cli/args.ts` 50% functions, `src/cli/walk.ts` 53% branches, `src/ui/statusBar.ts` 66% functions. The `src/cli/` figures are backed by `check:cli-parity` (60 commands, 56 MCP lines) rather than by the unit suite |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. The crate chain runs inside
`crate/` on the toolchain `rust-toolchain.toml` pins, 1.98.1. Mid-pass a
`cargo build` left a binary that answered for the old `maxResults` reader, so
the crate's artefacts were cleaned (`cargo clean -p numbers-le`) and rebuilt
before the parity runs that followed; the final run rebuilt both profiles.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 | |
| `E` | `bun run lint` | exit 0 | exit 0 | biome 2.5.15 against a 2.5.7 schema prints two deserialize notes; neither fails the gate |
| `E` | `bun run typecheck` | exit 0 | exit 0 | covers `src/` and `vitest.config.ts`; `test/` is checked by `tsconfig.it.json` in `test:integration` |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | baseline 34 files, 470 tests; 79.11 / 70.78 / 85.93 / 80.73. First close 37 files, 518 tests; after the carried items 525 tests, 81.24 / 72.38 / 89.20 / 82.72 |
| `E` | `bun run build` | exit 0 | exit 0 | |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | static scan and runtime load of `dist/extension.js` |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 | |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | under the 600 KB ceiling; one tool answered over stdio |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `numbers-le-mcp` |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 | |
| `E` | `bun run package` | exit 0 | exit 0 | `release/numbers-le-2.7.1.vsix`; `clean:i18n` left no copied catalogue |
| `E` | `bun run coverage:readme:check` | exit 1 | exit 0 | README said 460 cases across 33 files; the run had 470 across 34: `numbers-le-broken-features-1`. Regenerated three times (`9d6a78e`, `8550495`, `3bc4f79`), the last after the carried items |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline; every commit conforms at close |
| `E` | `python3 scripts/check-agent-files.py` | exit 0 | exit 0 | |
| `E` | `bun run benchmark` | exit 0 | exit 0 | pure |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | extension = npm server = `server.json` = 2.7.1 |
| `C N` | one-version job shell (`ci-crate.yml`) | exit 0 | exit 0 | `crate/Cargo.toml` = `cli/package.json` = 2.7.1 |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 | |
| `C` | `cargo clippy --all-targets -- -D warnings` | exit 0 | exit 0 | |
| `C` | `cargo test --locked` | exit 0 | exit 0 | baseline 225 unit, 2 corpus, 19 contracts, 3 budget, 8 hazards, 6 platform, 3 scenarios (the gated ones skipped by name); close 240 unit, 20 contracts, 9 hazards |
| `C` | `cargo build --locked` | exit 0 | exit 0 | |
| `C` | MSRV check (`RUSTUP_TOOLCHAIN=1.88 cargo check`) | exit 0 | exit 0 | |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 | |
| `C` | policy: `extract/` has no filesystem call | exit 0 | exit 0 | |
| `C` | policy: no doc holds the surfaces equal | exit 0 | exit 0 | |
| `C` | `cargo llvm-cov`, 70% floor on `extract/` | exit 0 | exit 0 | every module ≥ 92% at baseline |
| `E M C` | `bun scripts/check-extraction-parity.ts` | exit 0 | exit 0 | the corpus under the extension and both servers; 24 shared-tool cases at close, 18 at baseline; a refusal's `-32602` code held beside its words |
| `C` | `cargo build --locked --release` | exit 0 | exit 0 | |
| `E C` | `differential-extraction.ts`, seed 20260812 | exit 0 | exit 0 | 2,585 generated documents, both sides agree |
| `M C` | `check-mcp-definition.ts` | exit 0 | exit 0 | `extract_numbers` defined identically |
| `N` | `bun run build:cli` | exit 0 | exit 0 | |
| `N C` | `bun run check:cli-parity` | exit 0 | exit 0 | 60 commands and 61 MCP lines at close (50 at baseline: four `maxResults` spellings, two scan refusals and five wrong-typed or undeclared arguments joined) |
| `N C` | `bun run check:cli-pipes` | exit 0 | exit 0 | 3 closed-pipe cases and 18 malformed frames, both binaries alike |
| `N` | `bun run build:cli:prod` | exit 0 | exit 0 | |
| `N` | `bun run check:cli-package` | exit 0 | exit 0 | installs from the tarball, runs as `numbers-le` |
| `C` | `cargo audit` | not run here | not run here | not installed here; CI runs it |
| `C` | `NUMBERS_LE_SCENARIOS=1` scenario tests | exit 0 | exit 0 | 3 tests: 150,000 values, a 50,000-declaration line, 20,000 unlocatable values |
| `C` | `cargo test --test hazards` | exit 0 | exit 0 | 8 tests at baseline, 9 at close (the FIFO, `numbers-le-errors-7`) |
| `C` | `cargo test --test platform` with `TZ=UTC` | exit 0 | exit 0 | |
| `C` | `cargo test --test platform` with no `TZ` | exit 0 | exit 0 | |
| `C` | `NUMBERS_LE_FUZZ=60` fuzz | exit 0 | exit 0 | 319 s at baseline |
| `C` | `NUMBERS_LE_BUDGET=1 --release` budget | exit 0 | exit 0 | 500 files inside the 210 ms ceiling; four trees under the 6× allowance |
| `C` | coverage matrix (`cargo test --test coverage_matrix`) | exit 0 | exit 0 | 43 aliases and 12 unknown extensions each produce a report line; 18 offered formats each have a corpus document |
| `C` | crate package list | exit 0 | exit 0 | corpus present in the tarball; no agent file in it |
| `C` | both changelogs carry the version | exit 0 | exit 0 | |
| `C` | `cargo publish --dry-run` | exit 0 | exit 0 | |
| `E` | `bun run test:integration` | exit 0 | exit 0 | 9 host tests at baseline; at close 9 in English, 1 installing the German language pack and 4 on the German host, one reading the help document back in German |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | installs the built VSIX into a clean profile, drives it, spawns the MCP server |

## Step 1: Inventory

Read manifest, from INV-1. Every row was read from its first line to its last
during this pass; 170 files, 34,354 lines. The filter dropped 47 tracked
files under the listed roots: 22 corpus documents under `crate/fixtures/documents/`
(read in full, beside `crate/fixtures/extraction.json` which names them),
9 under `src/extraction/__fixtures__/` and the one snapshot (read in full,
beside `characterization.test.ts`), 12 `src/i18n/` catalogues (read under
step 7, every value), and 3 images under `src/assets/` (binary, not text).
Outside those roots, read in full: the baseline scope above, `CHANGELOG.md`,
`crate/CHANGELOG.md`, `README.md`, `crate/README.md`, `mcp/README.md`,
`cli/README.md`, `crate/Cargo.toml`, `crate/rust-toolchain.toml`, `.vscodeignore`,
`biome.json`, `tsconfig.json`, `tsconfig.it.json`, `.githooks/commit-msg`,
`.github/codeql-config.yml`, `.github/dependabot.yml`, the four agent-file
copies that `check-agent-files.py` holds identical, `samples/` (3), the 13
runtime bundles and `package.nls.json`.

| Read | Lines | File |
|---|---|---|
| [x] | 82 | `cli/README.md` |
| [x] | 49 | `cli/package.json` |
| [x] | 718 | `crate/fixtures/extraction.json` |
| [x] | 867 | `crate/fixtures/mcp-extract-numbers.json` |
| [x] | 473 | `crate/src/cli.rs` |
| [x] | 230 | `crate/src/extract/corpus.rs` |
| [x] | 176 | `crate/src/extract/csv.rs` |
| [x] | 107 | `crate/src/extract/dotenv.rs` |
| [x] | 115 | `crate/src/extract/fallback.rs` |
| [x] | 373 | `crate/src/extract/format.rs` |
| [x] | 125 | `crate/src/extract/ini.rs` |
| [x] | 98 | `crate/src/extract/js.rs` |
| [x] | 209 | `crate/src/extract/json.rs` |
| [x] | 182 | `crate/src/extract/locate.rs` |
| [x] | 101 | `crate/src/extract/mod.rs` |
| [x] | 303 | `crate/src/extract/policy.rs` |
| [x] | 180 | `crate/src/extract/position.rs` |
| [x] | 199 | `crate/src/extract/render.rs` |
| [x] | 576 | `crate/src/extract/source.rs` |
| [x] | 126 | `crate/src/extract/toml.rs` |
| [x] | 105 | `crate/src/extract/yaml.rs` |
| [x] | 350 | `crate/src/fuzz.rs` |
| [x] | 14 | `crate/src/main.rs` |
| [x] | 444 | `crate/src/mcp/extract.rs` |
| [x] | 929 | `crate/src/mcp/mod.rs` |
| [x] | 589 | `crate/src/scan.rs` |
| [x] | 67 | `crate/src/testing.rs` |
| [x] | 308 | `crate/src/walk.rs` |
| [x] | 235 | `crate/tests/budget.rs` |
| [x] | 431 | `crate/tests/contracts.rs` |
| [x] | 267 | `crate/tests/coverage_matrix.rs` |
| [x] | 496 | `crate/tests/hazards.rs` |
| [x] | 315 | `crate/tests/platform.rs` |
| [x] | 105 | `crate/tests/scenarios.rs` |
| [x] | 186 | `mcp/README.md` |
| [x] | 51 | `mcp/package.json` |
| [x] | 304 | `package.json` |
| [x] | 100 | `scripts/benchmark.ts` |
| [x] | 57 | `scripts/build-cli.js` |
| [x] | 38 | `scripts/build-mcp.js` |
| [x] | 98 | `scripts/build-npm.js` |
| [x] | 135 | `scripts/check-agent-files.py` |
| [x] | 103 | `scripts/check-bundle.js` |
| [x] | 105 | `scripts/check-cli-package.js` |
| [x] | 490 | `scripts/check-cli-parity.ts` |
| [x] | 186 | `scripts/check-cli-pipes.ts` |
| [x] | 208 | `scripts/check-extraction-parity.ts` |
| [x] | 163 | `scripts/check-mcp-bundle.js` |
| [x] | 93 | `scripts/check-mcp-definition.ts` |
| [x] | 163 | `scripts/check-npm-package.js` |
| [x] | 182 | `scripts/commit-lint.js` |
| [x] | 181 | `scripts/coverage-readme.js` |
| [x] | 657 | `scripts/differential-extraction.ts` |
| [x] | 217 | `scripts/e2e-vsix.js` |
| [x] | 27 | `scripts/install-hooks.js` |
| [x] | 72 | `scripts/perf-readme.js` |
| [x] | 33 | `server.json` |
| [x] | 628 | `src/__mocks__/vscode.ts` |
| [x] | 62 | `src/agent-files.test.ts` |
| [x] | 87 | `src/cli/args.ts` |
| [x] | 431 | `src/cli/cli.test.ts` |
| [x] | 9 | `src/cli/format.ts` |
| [x] | 114 | `src/cli/frames.test.ts` |
| [x] | 106 | `src/cli/frames.ts` |
| [x] | 171 | `src/cli/ignoreRules.ts` |
| [x] | 144 | `src/cli/ioError.ts` |
| [x] | 150 | `src/cli/locate.ts` |
| [x] | 41 | `src/cli/main.ts` |
| [x] | 385 | `src/cli/mcp.ts` |
| [x] | 138 | `src/cli/output.test.ts` |
| [x] | 77 | `src/cli/output.ts` |
| [x] | 167 | `src/cli/run.ts` |
| [x] | 194 | `src/cli/scan.ts` |
| [x] | 58 | `src/cli/usage.ts` |
| [x] | 255 | `src/cli/walk.ts` |
| [x] | 436 | `src/commands/commands.test.ts` |
| [x] | 70 | `src/commands/dedupe.ts` |
| [x] | 549 | `src/commands/extract.test.ts` |
| [x] | 347 | `src/commands/extract.ts` |
| [x] | 166 | `src/commands/extractCsv.ts` |
| [x] | 81 | `src/commands/guard.test.ts` |
| [x] | 30 | `src/commands/guard.ts` |
| [x] | 89 | `src/commands/help.test.ts` |
| [x] | 273 | `src/commands/help.ts` |
| [x] | 40 | `src/commands/index.ts` |
| [x] | 116 | `src/commands/largeOutput.test.ts` |
| [x] | 225 | `src/commands/postProcess.test.ts` |
| [x] | 119 | `src/commands/postProcessShared.ts` |
| [x] | 88 | `src/commands/sort.ts` |
| [x] | 113 | `src/config/config.test.ts` |
| [x] | 168 | `src/config/config.ts` |
| [x] | 24 | `src/config/settings.ts` |
| [x] | 39 | `src/extension.ts` |
| [x] | 64 | `src/extraction/characterization.test.ts` |
| [x] | 96 | `src/extraction/extract.ts` |
| [x] | 324 | `src/extraction/formats/csv.test.ts` |
| [x] | 35 | `src/extraction/formats/csv.ts` |
| [x] | 138 | `src/extraction/formats/env.test.ts` |
| [x] | 49 | `src/extraction/formats/env.ts` |
| [x] | 423 | `src/extraction/formats/formats.security.test.ts` |
| [x] | 137 | `src/extraction/formats/ini.test.ts` |
| [x] | 28 | `src/extraction/formats/ini.ts` |
| [x] | 162 | `src/extraction/formats/json.test.ts` |
| [x] | 70 | `src/extraction/formats/json.ts` |
| [x] | 201 | `src/extraction/formats/source.test.ts` |
| [x] | 405 | `src/extraction/formats/source.ts` |
| [x] | 155 | `src/extraction/formats/toml.test.ts` |
| [x] | 34 | `src/extraction/formats/toml.ts` |
| [x] | 55 | `src/extraction/formats/typed.ts` |
| [x] | 141 | `src/extraction/formats/yaml.test.ts` |
| [x] | 36 | `src/extraction/formats/yaml.ts` |
| [x] | 129 | `src/extraction/heuristics.test.ts` |
| [x] | 138 | `src/extraction/heuristics.ts` |
| [x] | 43 | `src/extraction/positions.test.ts` |
| [x] | 73 | `src/extraction/positions.ts` |
| [x] | 146 | `src/l10n.test.ts` |
| [x] | 137 | `src/mcp/envelope.ts` |
| [x] | 149 | `src/mcp/fileType.ts` |
| [x] | 13 | `src/mcp/info.ts` |
| [x] | 554 | `src/mcp/mcp.test.ts` |
| [x] | 55 | `src/mcp/provider.ts` |
| [x] | 107 | `src/mcp/readme.test.ts` |
| [x] | 13 | `src/mcp/server.ts` |
| [x] | 132 | `src/mcp/tools.ts` |
| [x] | 314 | `src/mcp/transport.ts` |
| [x] | 131 | `src/parsers/csv.ts` |
| [x] | 232 | `src/parsers/ini.ts` |
| [x] | 510 | `src/parsers/jsonc.ts` |
| [x] | 173 | `src/parsers/parsers.test.ts` |
| [x] | 424 | `src/parsers/reference/Cargo.lock` |
| [x] | 16 | `src/parsers/reference/Cargo.toml` |
| [x] | 1 | `src/parsers/reference/answers.json` |
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
| [x] | 57 | `src/rating/wiring.test.ts` |
| [x] | 31 | `src/telemetry/telemetry.test.ts` |
| [x] | 34 | `src/telemetry/telemetry.ts` |
| [x] | 99 | `src/types.ts` |
| [x] | 46 | `src/ui/largeOutput.test.ts` |
| [x] | 56 | `src/ui/largeOutput.ts` |
| [x] | 35 | `src/ui/notifier.ts` |
| [x] | 103 | `src/ui/prompts.test.ts` |
| [x] | 172 | `src/ui/prompts.ts` |
| [x] | 317 | `src/ui/ratingPrompt.test.ts` |
| [x] | 179 | `src/ui/ratingPrompt.ts` |
| [x] | 66 | `src/ui/statusBar.ts` |
| [x] | 130 | `src/ui/ui.test.ts` |
| [x] | 50 | `src/utils/errors.test.ts` |
| [x] | 26 | `src/utils/errors.ts` |
| [x] | 59 | `src/utils/positions.test.ts` |
| [x] | 64 | `src/utils/positions.ts` |
| [x] | 170 | `src/utils/sort.test.ts` |
| [x] | 55 | `src/utils/sort.ts` |
| [x] | 101 | `test/integration/extension.test.ts` |
| [x] | 183 | `test/integration/l10n.test.ts` |
| [x] | 22 | `test/locale-setup/german-language-pack.test.ts` |
| [x] | 54 | `test/locale/german-host.test.ts` |

### INV-2. Manifest contributions

| Contribution | Entry | Localized | Note |
|---|---|---|---|
| command | `numbers-le.extractNumbers` | `%manifest.command.extract.title%` | palette, editor context menu, status bar click |
| command | `numbers-le.postProcess.dedupe` | `%manifest.command.dedupe.title%` | palette |
| command | `numbers-le.postProcess.sort` | `%manifest.command.sort.title%` | palette |
| command | `numbers-le.openSettings` | `%manifest.command.settings.title%` | palette |
| command | `numbers-le.help` | `%manifest.command.help.title%` | palette |
| menu | `editor/context` → `numbers-le.extractNumbers` | | `when: editorLangId =~ /^(json\|jsonc\|yaml\|csv\|toml\|ini\|dotenv\|env)$/`, group `1_modification@1`; the fourteen source languages the extension activates on get the palette only (an owner decision, below) |
| menu | `commandPalette` | | all five commands, no `when` |
| keybindings | none | | |
| configuration | 16 properties under `numbers-le.` | every description a `%key%` | listed under INV-4 |
| capabilities | `untrustedWorkspaces: limited` | `%manifest.capability.untrusted-workspaces.desc%` | |
| activationEvents | 22 `onLanguage:` events | | the eight config formats and the fourteen source languages |
| mcpServerDefinitionProviders | id `numbers-le`, label `%manifest.mcp.label%` | | provider registered in `activate()` behind feature detection |
| main / l10n / engines | `./dist/extension.js` / `./l10n` / `vscode ^1.101.0`, `node >=20` | | twelve bundles beside the English source |

### INV-3. Registrations

| Registration | Where | Disposed by |
|---|---|---|
| 5 commands | `commands/index.ts` (3), `config/settings.ts` (1), `commands/help.ts` (1), each inside `guarded(...)` | each pushed to `context.subscriptions` |
| status bar item, its config listener, its flash timer | `ui/statusBar.ts` | the item, the listener and a timer release each pushed to `context.subscriptions` |
| telemetry output channel | `telemetry/telemetry.ts`, lazily on the first event with the setting on | the telemetry object pushed to `context.subscriptions` |
| MCP definition provider | `mcp/provider.ts` | pushed to `context.subscriptions` when `vscode.lm` has the API; skipped by name otherwise |

### INV-4. Settings and their consumers

| Setting | Consumer | Consumer test at close |
|---|---|---|
| `clipboardIncludesPositions` | `extract.ts` `positioned(...)` for the clipboard | none at baseline (`numbers-le-broken-features-5`); `extract.test.ts` "clipboardIncludesPositions puts each line and column on the clipboard" |
| `copyToClipboardEnabled` | `extract.ts` | `extract.test.ts`, `commands.test.ts`, `largeOutput.test.ts` |
| `dedupeEnabled`, `sortEnabled`, `sortMode` | `extract.ts`, `extractCsv.ts` | `extract.test.ts` "post-processing settings", `commands.test.ts` |
| `notificationsLevel` | `ui/notifier.ts`, re-read per call | `ui.test.ts` three levels |
| `openResultsSideBySide` | `extract.ts` `getShowDocumentOptions`, `postProcessShared.ts` | `extract.test.ts` "result placement" |
| `postProcess.openInNewFile` | `postProcessShared.ts` `writeResult` | `commands.test.ts` in place and new document |
| `safety.enabled`, `safety.fileSizeWarnBytes`, `safety.largeOutputLinesThreshold` | `extract.ts`, `extractCsv.ts` | `extract.test.ts` "safety file-size gate", "large-output prompt" |
| `safety.manyDocumentsThreshold` | `extractCsv.ts` | none at baseline (`numbers-le-broken-features-5`); `extract.test.ts` "safety.manyDocumentsThreshold asks before…" |
| `showParseErrors` | `extract.ts` | `commands.test.ts` |
| `showPositions` | `extract.ts` | `commands.test.ts`, `extract.test.ts` |
| `statusBar.enabled` | `ui/statusBar.ts`, live listener | `ui.test.ts` "shows by default and hides when disabled" |
| `telemetryEnabled` | `telemetry/telemetry.ts` | `telemetry.test.ts` |

`config.test.ts` walks `contributes.configuration` against `CONFIG_DEFAULTS` and refuses an undeclared key (FEAT-7).

### INV-5. Resources with a lifetime

| Resource | Created | Released | Largest it can get |
|---|---|---|---|
| status bar item | `createStatusBar` at activation | deactivation | one |
| config listener | `createStatusBar` | deactivation | one |
| flash timer | `flash` per call | the next flash, or the timer release at deactivation | one pending |
| telemetry channel | first event with the setting on | deactivation | one |
| MCP provider | activation, where `vscode.lm` exists | deactivation | one |
| rating state | `globalState`, written before each ask | persists by design | one record |
| `TEXT_NUMBER_RE` (`g`, module level) | module load | never | used only through `matchAll`, which clones it (BUG-6) |
| extension MCP server: tool table, input buffer | `createResponder`; per frame | process end; per frame, 16 MiB ceiling | one tool; 16 MiB plus the pending chunk |
| npm command line / crate | per run: the walk's file list, its link count, per-file reports, the MCP loop's frame | run end; per frame, 16 MiB ceiling at close (none at baseline: `numbers-le-errors-5`) | the tree's file count; 16 MiB |
| crate `testing.rs` `COUNTER` | tests only | | |

### INV-6. Suspension points

| File | Awaits | What is read before and used after |
|---|---|---|
| `commands/extract.ts` | the CSV prompts, `withProgress`, `fs.stat`, `openTextDocument`, `showTextDocument`, `clipboard.writeText`, the large-output dialog | the document, its text and file type, read once before the prompts; the result goes to a new document or the clipboard, so a text that changed meanwhile yields a stale result, never a damaged document (RACE-1); the configuration snapshot read once inside the progress (RACE-7); the token checked after each await (RACE-6) |
| `commands/extractCsv.ts` | `confirmManyDocuments`, `openTextDocument` and `showTextDocument` per column | the rows, read before; the token checked per column |
| `commands/dedupe.ts`, `commands/sort.ts` | the sort quick pick (sort only), `writeResult` | the text, read before the pick, written back in place: `numbers-le-race-conditions-2`; the version is now compared |
| `commands/postProcessShared.ts` | `openTextDocument`, `showTextDocument`, `editor.edit` | the result and the version it was computed from |
| `commands/help.ts`, `config/settings.ts` | open and show; `executeCommand` | nothing shared |
| `ui/prompts.ts`, `ui/largeOutput.ts` | quick pick, input box, modal warnings | nothing shared |
| `ui/ratingPrompt.ts` | `globalState.update` before the toast, then the toast, then `openExternal` | the ask is written before the wait (RACE-5) |
| `commands/guard.ts`, `commands/index.ts` | the command body | nothing shared |
| `mcp/transport.ts` | the tool handler; the `drain` event | nothing shared; handlers are pure |
| `cli/*` | the crate's surface: stdin, the frames, the replies | one request at a time, in order |

### INV-7. Failure sites

| Site | What arrives | What the user learns | Verdict |
|---|---|---|---|
| `extract.ts` `validateAndPrepareExtraction` try | a document the host closed; and, at baseline, the file-type quick pick | "Document is no longer valid" | the pick was inside it: `numbers-le-errors-2` |
| `extract.ts` `fs.stat` catch | an untitled document, nothing to stat | nothing; the size warning is skipped | commented and tested now (`numbers-le-errors-6`) |
| `extract.ts` open/show catch | a refused document | "Could not open results", and at baseline `Extracted N` beside it | `numbers-le-errors-1` |
| `extract.ts` clipboard catch | a refused write | "Could not copy to clipboard" | pass; tested now |
| `extractCsv.ts` per-column catch | a refused document | "Could not open results", and at baseline "CSV opened" after every refusal | `numbers-le-errors-1` |
| `guard.ts` catch | anything a command threw | one redacted, localized error | pass; `guard.test.ts` |
| `ratingPrompt.ts` catch | `globalState.update` failing | a line in the output channel | pass; `ratingPrompt.test.ts` |
| `utils/errors.ts` `errorMessage` | a thrown value of any type | its text | no caller at baseline (`numbers-le-broken-features-6`) |
| `extraction/formats/json.ts` ×2, `parsers/ini.ts` ×2, `parsers/toml/*` ×3, `parsers/yaml/*` ×2 | a document the parser refuses | a `parse-error` diagnostic with the parser's message | pass; the corpus and the differential |
| `mcp/transport.ts` ×3 | a tool that threw; bad JSON; a frame over the limit | `isError`; `-32700` | pass |
| `cli/mcp.ts`, `cli/frames.ts`, `cli/run.ts` ×2, `cli/scan.ts` ×2, `cli/walk.ts` ×2, `cli/ioError.ts` ×2, `cli/ignoreRules.ts` | the crate's surface: a tool that threw, a frame that is not JSON, an unreadable path, a parse failure, an ignore file that will not read | the crate's words, held by parity | the frame was dropped: `numbers-le-errors-5` |
| crate `mcp/mod.rs` `serve` | a frame that is not UTF-8 or not JSON | dropped without a word | `numbers-le-errors-5` |
| crate `walk.rs`, npm `walk.ts` | a FIFO, a socket, a device; a symbolic link | dropped without a word | `numbers-le-errors-7`; the link counted, `numbers-le-errors-8` |
| crate `mcp/mod.rs`, npm `cli/mcp.ts` | a wrong-typed optional argument; an argument the schema does not declare | read as absent; accepted | `numbers-le-errors-9` |
| crate `mcp/mod.rs`, npm `cli/mcp.ts` | a report with a `skipped` diagnostic, in the scan tool's envelope | `ok: true`, `diagnostics: []` | `numbers-le-bugs-6` |
| npm `cli/output.ts` | the stream answering that the pipe is full | nothing | `numbers-le-errors-10` |
| crate `expect` ×74 across 10 files | serialization of values the crate built, test helpers, constant patterns, a cursor already peeked, `try_from` on bounds the branch proves | nothing: none reachable from input | pass (ERR-15); the fuzz and hazard suites agree |

### INV-8. User-visible strings, by channel

| Channel | Where | Mechanism at baseline | Now |
|---|---|---|---|
| notifications | every command, `guard.ts`, `postProcessShared.ts`, `ratingPrompt.ts` | mostly `l10n.t()`; `extract.ts` ×1, `postProcessShared.ts` ×1, `dedupe.ts` ×3, `sort.ts` ×1 literal or template | all `l10n.t()` (`bc6826e`) |
| status bar text and tooltip | `extract.ts`, `extractCsv.ts`, `statusBar.ts` | tooltip `l10n.t()`; four flashes literal | all `l10n.t()`; `$(symbol-number) Numbers-LE` kept as a codicon plus the product name |
| progress title | `extract.ts` | `l10n.t()` | |
| quick picks | `prompts.ts`, `sort.ts` | labels and placeholders `l10n.t()`; the file-type pick's format names are never-translate | the column pick carries its index (`5976ff7`) |
| input box and its validator | `prompts.ts` | `l10n.t()` | |
| modal dialogs and their buttons | `largeOutput.ts`, `ratingPrompt.ts` | `l10n.t()`, bound and compared by reference | |
| help document | `commands/help.ts` | English | every sentence `l10n.t()`, 88 keys (`numbers-le-translations-5`); the German host reads it back |
| output channel | `telemetry.ts` | English, machine-shaped | L10N-18: a log a user pastes |
| manifest | `package.json` | `%key%` throughout | |
| MCP, CLI, crate | `src/mcp`, `src/cli`, `crate/` | English, machine-read | L10N-18/19: deliberately not localized |

### INV-9. Machine interfaces

| Interface | Shape | Held by |
|---|---|---|
| MCP tool `extract_numbers` (`M` `N` `C`) | `{content, format?, filename?, dedupe?, maxResults?}` → `{ok, data: {numbers, fileType}, diagnostics, meta}` | `crate/fixtures/mcp-extract-numbers.json` on all three (21 cases at close); `check-mcp-definition.ts` |
| MCP tool `numbers_le_scan` (`N` `C`) | `path` or `paths`, `format?`, `dedupe?`, `hidden?`, `ignored?`, `additionalProperties: false` → reports, `numbers`, `binaryFiles`, `symbolicLinks`, diagnostics naming each skipped file | `check-cli-parity.ts` 61 lines; crate `mcp::tests` |
| JSON-RPC framing, three servers | newline-delimited, 16 MiB ceiling, parse errors in one wording; a schema violation `-32602` in one wording, a run-time failure `isError` | `mcp.test.ts`, `cli.test.ts`, `frames.test.ts`, crate `mcp::tests`, `check-cli-pipes.ts` (`numbers-le-errors-5`); the corpus and `check-cli-parity.ts` (`numbers-le-errors-9`) |
| report JSON Lines (`N` `C`) | `{file, format, numbers[{value, notation, line?, column?}], diagnostics, summary}` | `check-cli-parity.ts`, `contracts.rs`, `hazards.rs` |
| exit codes (`N` `C`) | 0 numbers, 1 none, 2 malformed question; `--strict` 2 on any unread input; stderr counts binary files skipped and links not followed | `contracts.rs`, `hazards.rs`, `cli.test.ts` |
| flags (`N` `C`) | `--dedupe`, `--format`, `--values`, `--strict`, `--stdin`, `--hidden`, `--no-ignore`, `mcp`, `--version`, `--help` | `usage.ts` ↔ `FLAGS` test; parity |
| npm packages | `numbers-le-mcp` (bin `numbers-le-mcp`), `numbers-le` (bin `numbers-le`) | `check:npm-package`, `check:cli-package`; the versions job holds `package.json`, `mcp/package.json`, `server.json`, `cli/package.json` and `crate/Cargo.toml` to 2.7.1 |

### INV-10. Claims

| Claim | Where | Backed by | Verdict |
|---|---|---|---|
| JSON, JSONC, YAML, CSV, TSV, TOML, INI, dotenv parsed; twelve source languages read for their literals; anything else a text scan | README, crate README, `--help`, help document | the corpus (22 documents), `coverage_matrix.rs`, `check-extraction-parity.ts` | `--help` said a `.ts` falls back to the text scan (`numbers-le-broken-features-2`); the help document named six formats and claimed CSV streaming (`-4`) |
| every setting, with its default | README table, help document | `config.test.ts`; `help.test.ts` now | the help document had `openResultsSideBySide` off and six settings missing (`-4`) |
| the three servers answer one frame alike | `crate/AGENTS.md`, `check:cli-pipes` | the probe in `logs/probes/shared-*.out` | three behaviours (`numbers-le-errors-5`) |
| the shared tool answers identically on both servers | `CLAUDE.md`, crate SPEC | the corpus; `check-extraction-parity.ts` | `maxResults: 2.0`, `.env.local` and `٣5` answered differently (`numbers-le-bugs-3`, `-4`, `-5`) |
| exit codes 0/1/2, grep's convention | README, crate README, `--help` | `contracts.rs`, `hazards.rs` | pass |
| an unreadable input is named, never dropped; a binary file is counted | crate README, `crate/AGENTS.md` | `hazards.rs` | a FIFO was dropped (`numbers-le-errors-7`) |
| positions where the source says exactly where a number is | README, `crate/SPEC.md` | `positions.test.ts`, `locate.ts` tests, the corpus | pass |
| twelve languages, both halves | README | the parity tests; `src/l10n.test.ts` now | eleven runtime strings were English everywhere (`numbers-le-translations-2`); 155 values did not fit (`-4`) |
| one rating prompt, at most twice | README | `policy.test.ts`, `ratingPrompt.test.ts` | pass |
| README Testing numbers | README | `coverage:readme:check` | stale at baseline (`numbers-le-broken-features-1`) |
| numbers are printed as JavaScript prints them | README, `--help`, SPEC | `extraction.json` `rendering`, `render.rs` | pass |

### INV-11. Tests, matched

| Test file | Matches | Gap |
|---|---|---|
| `commands.test.ts`, `extract.test.ts`, `postProcess.test.ts`, `largeOutput.test.ts` | the commands | no trailing-newline case (`bugs-1`); no refused-document, refused-edit or stat-failure case (`errors-1`, `-6`); no two-at-once case (`race-conditions-1`); no stale-document case (`-2`); two settings never changed (`broken-features-5`) |
| `help.test.ts` (new) | the help document | none existed: the document was held by nothing (`broken-features-4`) |
| `prompts.test.ts`, `ui.test.ts` | prompts, notifier, status bar | no non-Latin header (`bugs-2`); no translated label (`translations-1`); the status bar tests asserted nothing (`broken-features-3`) |
| `formats.*.test.ts`, `heuristics.test.ts`, `positions.test.ts`, `characterization.test.ts` | the engine | two tests accepted any answer (`broken-features-3`); no Unicode-digit case (`bugs-5`) |
| `mcp.test.ts`, `cli.test.ts`, `frames.test.ts`, crate `mcp::tests` | the three servers | each tested its own words (`errors-5`); the dotenv family untested (`bugs-4`); a non-string path entry untested (`errors-4`); a wrong-typed optional argument untested (`errors-9`); the scan envelope's diagnostics untested on an unreadable file (`bugs-6`) |
| `config.test.ts` | defaults against the manifest | |
| `l10n.test.ts` (integration), `src/l10n.test.ts` (new) | catalogues; source against bundle | nothing held source to bundle (`translations-2`) |
| `lifecycle.test.ts` (new) | activation to deactivation | none existed (`memory-leaks-1`) |
| `test/locale/`, `test/locale-setup/` (new) | a German host | none existed (`translations-3`) |
| crate `contracts.rs`, `hazards.rs`, `platform.rs`, `coverage_matrix.rs`, `budget.rs`, `scenarios.rs` | exit codes, inputs, platforms, formats, time | the FIFO case asserted survival only (`errors-7`) |
| `sort.test.ts` | dedupe and sort | tested a function nothing called (`broken-features-6`) |
| `output.test.ts` (fleet copy) | the stdout and stderr wrapper | nothing asserted the backpressure answer (`errors-10`) |

## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, `src/commands/*`,
`src/config/*`, `src/ui/*`, `src/mcp/*`, `test/integration/*`,
`scripts/e2e-vsix.js`, `.vscodeignore`, `crate/src/main.rs`, `crate/src/cli.rs`,
`mcp/package.json`, `cli/package.json`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | `test/integration/extension.test.ts` "registers every declared command" with `getCommands(true)`; `lifecycle.test.ts` reads five registered |
| FEAT-2 | E | pass | the host runs extract on a JSON file and reads the results document, dedupe into a new document, and the MCP provider's definition (`extension.test.ts`); sort, openSettings and help against the mock with their effects (`commands.test.ts`, `help.test.ts`); the installed VSIX drives help and the server (`e2e-vsix.js`) |
| FEAT-3 | E | pass | every handler is `guarded(async () => …)` and ignores its arguments; the context menu's URI and the status bar's none both reach the same body |
| FEAT-4 | E | pass | one entry, `editor/context` when `editorLangId` matches the eight config formats; `=~` is a context-key operator in the 1.101 floor. The fourteen source languages have the palette only: an owner decision (below) |
| FEAT-5 | E | n/a | no keybindings |
| FEAT-6 | E | finding | every setting had a consumer; two had no consumer test: `numbers-le-broken-features-5` |
| FEAT-7 | E | pass | `config.test.ts` "covers every declared setting" walks the manifest against `CONFIG_DEFAULTS` |
| FEAT-8 | E | pass | `readConfig()` is called per command run, per notification and per status-bar visibility change through a live listener (`ui.test.ts` "shows by default and hides when disabled") |
| FEAT-9 | E | pass | 22 `onLanguage` events; the host test activates by command and the e2e drives the installed artefact |
| FEAT-10 | E | pass | `logs/baseline/package.log` lists `dist/extension.js`, `dist/mcp-server.js`, 12 `package.nls.*.json`, 13 `l10n/bundle.l10n*.json`, the icon; `test:e2e-vsix` drives the installed artefact |
| FEAT-11 | E | pass | `check-bundle.js` read: static require scan, runtime load with `vscode` stubbed |
| FEAT-12 | M N C | pass | `logs/probes/shared-{M,N,C}.out`, 27 frames to the three servers: a valid call, a schema violation (`content` missing → `isError`), a malformed document (`{` → `parse-error` diagnostic) each in the documented shape |
| FEAT-13 | M C | finding | the scripts read: `check-extraction-parity.ts` (the corpus), `differential-extraction.ts` (2,585 generated documents), `check-mcp-definition.ts` (the schema), `check-cli-parity.ts` (the crate's two tools and the command line). The differential generates outside the corpus; the probe found three disagreements the corpus never produced: `numbers-le-bugs-3`, `-4`, `-5` |
| FEAT-14 | M | pass | `e2e-vsix.js` spawns the installed server as `provider.ts` builds it (`ELECTRON_RUN_AS_NODE=1`); `extension.test.ts` "offers its MCP server to agent mode" reads the definition; `lifecycle.test.ts` activates on a host without `vscode.lm` |
| FEAT-15 | N | pass | `check:npm-package` and `check:cli-package` install from the tarballs; `bin`, `files` and the versions agree |
| FEAT-16 | C | pass | every flag and exit code has a `contracts.rs` or `hazards.rs` test (INV-9); the binary over this repository: `23305 numbers in 258 files, 9 binary files skipped, 4 values could not be located`, exit 0 (`logs/probes/real-repo.err`) |
| FEAT-17 | all | finding | INV-10: `numbers-le-broken-features-1`, `-2`, `-4` |
| FEAT-18 | all | finding | `filterNumber` and `errorMessage` had no caller in `src/`: `numbers-le-broken-features-6`. Settings all consumed (INV-4), commands all registered (INV-3), every bundle key called (`src/l10n.test.ts`), every `package.json` script a gate, a build step or a release-time writer |
| FEAT-19 | E | pass | `vitest.config.ts` uses `thresholds` (70/70/60/70), includes `src/**`, excludes tests and mocks; `tsconfig.json` includes tests; the README section regenerated from a real run (`8550495`) |
| FEAT-20 | E | n/a | no skipped tests (BASE-8) |
| FEAT-21 | all | pass | `check-bundle.js` refuses a non-builtin require (read); `check-mcp-bundle.js` holds the 600 KB ceiling; `commit-lint.js` driven with `Fixed stuff` → exit 1, "must start with one of feat, fix, …"; `check-agent-files.py` refuses a drifted copy |
| FEAT-22 | all | finding | `formats.security.test.ts` "should handle malformed CSV/INI gracefully" accepted any answer; `ui.test.ts`'s two status bar tests asserted nothing: `numbers-le-broken-features-3` |
| FEAT-23 | all | pass | `policy-docs` greps `*.md`; `grep -rniE` of its three sentences over `src crate/src scripts test` → none |

## Step 3: Bugs

Re-read for this step: `src/extraction/**`, `src/parsers/**`, `src/utils/*`,
`src/commands/*`, `src/mcp/tools.ts`, `src/mcp/envelope.ts`, `src/mcp/fileType.ts`,
`src/cli/*`, `crate/src/**`, with their tests and fixtures.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | empty content, whitespace only, an empty list and a single value each answered on all three servers (`shared.jsonl` #19–#21: a parse error for JSON, an empty result for YAML and text); `hazards.rs` "an empty file", "a file of only whitespace" |
| BUG-2 | E | finding | `Number('')` is 0: a trailing newline joined the numbers: `numbers-le-bugs-1`. The rest of the grep read against their domains: `result.errors[0]?.message \|\| …` falls back on an empty message by design; `name \|\| l10n.t('(Column {0})')` on an empty header cell is the point |
| BUG-3 | all | pass | `slice(0, maxResults)` with `truncated` read beside it; `positionIndex` bisects on line starts and is tested at the first and last offset (`positions.test.ts`); the crate's `locate.rs` cursor is tested at both ends of a run |
| BUG-4 | all | finding | BOM, CRLF, lone CR, no trailing newline, NUL, UTF-16 each in `hazards.rs`; `frames.test.ts`; columns after an astral character on both sides. A digit from another script split a run on the extension and not the crate: `numbers-le-bugs-5`; an ASCII-only header test: `numbers-le-bugs-2` |
| BUG-5 | all | pass | the only sorts are numeric comparators (`utils/sort.ts`) and the walk's path order, which the npm side implements as Rust compares (`walk.ts` `comparePaths`), held by parity |
| BUG-6 | all | pass | `TEXT_NUMBER_RE` on near-miss text of 100,000 / 200,000 / 400,000 characters: 1.9 / 2.0 / 4.3 ms (`1e` repeated) and 0.3 / 0.5 / 0.9 ms (`+.` repeated), linear; the `g` pattern is used through `matchAll` only; the crate's `scenarios.rs` holds a 50,000-declaration line |
| BUG-7 | all | finding | `Number('')` (`bugs-1`); `maxResults` as `2.0`, `1e3`, `1E20` read three ways (`numbers-le-bugs-3`); `render.rs` ↔ `Number::toString` pinned both ways by the corpus `rendering` cases |
| BUG-8 | all | pass | `detectFileType` takes the basename on both separators; `.env.local` and `app.env` resolved differently on the extension (`numbers-le-bugs-4`, fixed); the crate's `platform.rs` holds `/` in every reported path on Windows |
| BUG-9 | E | pass | the casts in `src/` are on the mock, on `Record<string, unknown>` narrowing after an `Object.hasOwn` check (`cli/mcp.ts`), on `ALIASES[format] as FileType` after a `has` check, and on sorted tuples; none sits on untrusted input without a check |
| BUG-10 | all | finding | two file-type resolvers (`extraction/extract.ts`, `mcp/fileType.ts`) and a third table in `cli/format.ts`: `numbers-le-bugs-4` folds them into one; `readMaxResults` in two files reads one rule now (`bugs-3`); the fifteen duplicated names the grep lists are the crate-mirroring `cli/` functions beside the extension's, held equal by parity |
| BUG-11 | N C | finding | `scan.ts` and `scan.rs` carried an `isIncomplete` / incomplete branch on a severity no reader produces, mirrored by parity; the same severity fed the scan tool's envelope filter, so a locked file left `ok: true` and empty `diagnostics`: `numbers-le-bugs-6` |
| BUG-12 | all | pass | every result is `Object.freeze`d; options are `readonly`; `onValues` copies |
| BUG-13 | E | pass | every sentence shown about a result was read against what the module establishes: the counts are the final lists, "Positions are not available for this file type" is reachable only for the five formats that place none (the JSON "disagreement" branch cannot fire: the extractor and the span scan agree on every document that parses, `fail/` probe), and the three false successes are under ERR-5 |
| BUG-14 | all | n/a | no previews of sensitive values |
| BUG-15 | M N C | finding | the probe (`logs/probes/shared.jsonl`) fed all three servers the edges: `maxResults` as `2.0`, `1e3`, `1E20`, `1e400`; `.env.local` by filename; `٣5`; `..json`; `constructor`; a BOM before each format; a repeated key; an unknown argument; `format: 7`; `dedupe: "yes"`. Three disagreements: `numbers-le-bugs-3`, `-4`, `-5`. Agreement on a shared defect: a `paths` entry of the wrong shape dropped by both command-line servers (`numbers-le-errors-4`), a wrong-typed optional argument read as absent and an undeclared one accepted by all three (`numbers-le-errors-9`) |
| BUG-16 | C | pass | no `as` cast that truncates (`try_from` throughout, `usize` from `u64` clamped at the ceiling); `str` sliced on char boundaries from the lexer's own indices; the fuzz and the 1 MiB-line hazard hold it |
| BUG-17 | all | pass | each root invariant names its test; `crate/AGENTS.md` hard rules each name a test or a gate; the six added this pass name theirs |
| BUG-18 | M | pass | `ALIASES` is a `Map`; `constructor` and `__proto__` tried through format, filename and extension (`mcp.test.ts`), and through the probe on all three servers (#16, #17) |
| BUG-19 | all | finding | `.env.local` → `local` on two resolvers: `numbers-le-bugs-4`; every shape driven on all three servers (`shared.jsonl` #4–#7, #26) and in `mcp.test.ts` with the exclusions |
| BUG-20 | E | finding | `numbers-le-bugs-1`: a trailing newline, CRLF and a blank line inside, for dedupe and sort |
| BUG-21 | M C | pass | `differential-extraction.ts` pins 2,585 generated documents in both directions with the seed; the corpus pins a repeated key (both report every token), a JSONC trailing comma, a mixed TOML array and an unclosed array |

## Step 4: Errors

Re-read for this step: INV-7's files, every command, `src/__mocks__/vscode.ts`,
`src/mcp/transport.ts`, `src/mcp/tools.ts`, `src/cli/mcp.ts`, `src/cli/frames.ts`,
`src/cli/walk.ts`, `crate/src/**`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | finding | INV-7: one empty catch with no comment and no test (the stat, `numbers-le-errors-6`), two catches guarding on `instanceof Error` that let a string through as silence (`errors-1`), one try that mislabelled what it caught (`errors-2`) |
| ERR-2 | E N C | pass | "No numbers found" is reached only from a successful extraction with an empty list; a parse failure reports the parser's message (or nothing, under `showParseErrors: false`, which the setting documents); a walk whose every input failed exits 1 with every file named `skipped` on stderr and in the JSON, and 2 under `--strict` |
| ERR-3 | M | pass | run, not read: `{` and `` on all three servers → `{"severity":"error","code":"parse-error","message":"Failed to parse JSON: …"}` (`shared-*.out` #9, #19); the crate's `scan.rs` `skipped` for an undecodable file |
| ERR-4 | all | finding | "Document is no longer valid" for a torn-down quick pick: `numbers-le-errors-2`; "no file or directory was supplied" for `path: 7`: `numbers-le-errors-4` |
| ERR-5 | E | finding | `openTextDocument`/`showTextDocument` refused and `Extracted N` flashed, the extraction logged and the rating prompt counted; "CSV opened" after every column refused: `numbers-le-errors-1`. `editor.edit` resolving false is read (`writeResult`), and now tested (`errors-6`); `executeCommand` for settings is awaited under the guard |
| ERR-6 | E | pass | the one `void` is `ratingPrompt.recordSuccess()`, which catches inside; no `.then` without a catch |
| ERR-7 | E | pass | every handler is `guarded(...)`, held by `guard.test.ts` reading the source |
| ERR-8 | E | finding | two `instanceof Error` guards swallowed a thrown string (`errors-1`); `errorMessage` existed for this and had no caller (`broken-features-6`) |
| ERR-9 | E N C | finding | a `paths` entry of the wrong shape vanished from the scan: `numbers-le-errors-4`; a FIFO vanished from the walk: `numbers-le-errors-7`; a symbolic link was passed over uncounted: `numbers-le-errors-8`; a skipped file was missing from the scan envelope's diagnostics: `numbers-le-bugs-6`; the binary-file count and the unlocated count are on stderr and in the envelope (pass) |
| ERR-10 | E | pass | the three direct `showWarningMessage` calls are modal dialogs awaiting a choice (`largeOutput.ts` ×2) and the column-index warning that returns a value the user then sees applied (`prompts.ts`); `ratingPrompt.ts` bypasses on purpose, as its comment says |
| ERR-11 | E | pass | a dismissed file-type pick, column pick, index box, sort pick or dialog returns quietly (`extract.test.ts`, `prompts.test.ts`, `commands.test.ts` "does nothing when the quick pick is dismissed") |
| ERR-12 | E | finding | the mock could not fail `openTextDocument`, `showTextDocument`, `clipboard.writeText`, `editor.edit` or `fs.stat`, and had no bundle for `l10n.t`: `numbers-le-errors-1`, `-6`, `translations-1` add `_failOpenTextDocument`, `_failShowTextDocument`, `_failClipboardWrite`, `_refuseEdits`, `_failFsStat`, `_translate` |
| ERR-13 | E | finding | two tests accepted any answer: `numbers-le-broken-features-3` |
| ERR-14 | M | finding | three servers, three wordings for an unknown method, an unknown tool and a nameless call: `numbers-le-errors-5`. A wrong-typed tool argument was an `isError` result, a wrong-typed optional one was read as absent, and `additionalProperties: false` sat unenforced: `numbers-le-errors-9`, on the owner's decision; a schema violation is `-32602` on all three servers now and a path that is not there stays `isError` |
| ERR-15 | C | pass | the 74 `expect`/`panic!` sites read (INV-7): serialization of values the crate built, test helpers, constant patterns, `try_from` on bounds the branch proves, a `chars.next()` after `peek`; none reachable from input, and the 319 s fuzz and the hazard suite agree |
| ERR-16 | N C | finding | permission denied, a symlink loop, a directory under a file's extension, a long path and an undecodable file each named (`hazards.rs`); a FIFO vanished: `numbers-le-errors-7`; a symbolic link, never followed by design, was passed over without a line: counted now, `numbers-le-errors-8` |
| ERR-17 | N E | pass | no `\|\| true`, no `continue-on-error`; the three `2>/dev/null` are in shells whose exit code is read |
| ERR-18 | E | pass | the only indicator is `withProgress`, which ends on every path, and the prompts happen before it |
| ERR-19 | M | finding | `logs/probes/shared-*.out` and the 18 frames of `check:cli-pipes`: the extension's server echoed the client's version and answered a null id; the other two dropped a non-JSON and a non-UTF-8 frame and held a frame of any size: `numbers-le-errors-5` |
| ERR-20 | N C | pass | `check:cli-pipes` drives stdout and stderr closed on 3 cases, both binaries alike (`logs/baseline/cli-pipes.log`) |

## Step 5: Memory leaks

Re-read for this step: `src/extension.ts`, INV-5's files, `src/mcp/transport.ts`,
`src/cli/frames.ts`, `src/cli/mcp.ts`, `crate/src/mcp/mod.rs`, `crate/src/walk.rs`,
`crate/src/scan.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | pass | the item, its listener and a timer release are each pushed to `context.subscriptions` by `createStatusBar`; the telemetry object that owns the channel is pushed by `activate`; the provider by `registerMcpProvider` |
| LEAK-2 | E M | pass | one config listener, released by the subscription; the MCP server adds one `data` and one `drain` listener per process |
| LEAK-3 | E M | pass | the flash timer is cleared when rescheduled and by the release at deactivation (`ui.test.ts` "a second flash replaces…", "disposing the subscriptions clears…"); the npm MCP loop sets no timer |
| LEAK-4 | E | pass | the telemetry channel is created on first use and disposed by the telemetry object registered up front, created or not |
| LEAK-5 | E | pass | `lifecycle.test.ts` disposes every subscription twice; `telemetry.test.ts` disposes before and after a channel exists |
| LEAK-6 | E | finding | no test disposed everything and asserted: `numbers-le-memory-leaks-1` (test-gap; nothing leaked) |
| LEAK-7 | all | pass | INV-5: every module-level value is bounded; the npm walk and scan hold one tree's reports for one run |
| LEAK-8 | E | pass | the results text goes to the new document and is dropped; the rating prompt holds a count |
| LEAK-9 | E | n/a | no child process, browser or stream in the extension; the MCP server is spawned and owned by the host |
| LEAK-10 | E | finding | no repeated-run test: `numbers-le-memory-leaks-1` ("fifty rounds of every command") |
| LEAK-11 | M N C | finding | the extension's server had the ceiling; the npm command line's and the crate's read a frame of any size: `numbers-le-errors-5`; all three now refuse one byte over with the newline in the same chunk, far over with it many chunks later, and serve one exactly at the limit |
| LEAK-12 | M N C | pass | `logs/probes/memory.log`, 3,000 `extract_numbers` calls one in flight at a time: extension server 58→60 MB flat from 1,000; npm command line 63→74 MB flat from 1,500; crate 3 MB flat throughout |
| LEAK-13 | M N C | pass | `platform.rs` closes stdin at once; the probe's three servers each exited 0 within a second of stdin closing (`memory.log`) |
| LEAK-14 | C | pass | `hazards.rs` 1 MiB line and 100,000 lines; `scenarios.rs` 150,000 values; `budget.rs` 500 and 2,000 files inside their ceilings (`logs/baseline/budget.log`) |
| LEAK-15 | C | pass | a symlink loop terminates (`hazards.rs` `a_symlink_loop_terminates`); `follow_links(false)` on both sides |
| LEAK-16 | C | pass | files are read whole and dropped; no threads; temporary trees are the tests' and removed in `Drop` |
| LEAK-17 | tests | pass | three runs and a shuffled run green at baseline and at close (`logs/probes/`, RACE-17); mock state reset in `beforeEach`; fake timers restored in `afterEach` |

## Step 6: Race conditions

Re-read for this step: INV-6's files, `src/extension.ts`, `src/ui/statusBar.ts`,
`src/ui/ratingPrompt.ts`, `src/mcp/transport.ts`, `src/cli/mcp.ts`, `crate/src/mcp/mod.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | pass | INV-6: extract's text goes to a new document or the clipboard, so a text that changed during a prompt yields a stale result, never a damaged document; the configuration is one snapshot per run |
| RACE-2 | E | finding | sort replaced the whole document with a result computed before its picker: `numbers-le-race-conditions-2`; the version is compared now, for dedupe too |
| RACE-3 | E | finding | no two-at-once case: `numbers-le-race-conditions-1` (test-gap). Policy: both run independently; the status bar shows the later flash; each opens its own document and reports its own count |
| RACE-4 | E | pass | the only module-level mutable values are the flash timer and the lazy channel, each with one writer path and no await between read and write |
| RACE-5 | E | pass | `ratingPrompt.ts` writes the ask to `globalState` before awaiting the toast (`ratingPrompt.test.ts`) |
| RACE-6 | E | pass | the token is checked after each await in `extract.ts` and per column in `extractCsv.ts`; a cancelled run delivers nothing |
| RACE-7 | E | pass | `readConfig()` once inside the progress, used throughout; the notifier and the status bar re-read on purpose, per message |
| RACE-8 | E | pass | the timer is cleared at deactivation and `flash` is unreachable after the commands are disposed (`lifecycle.test.ts`) |
| RACE-9 | E | pass | `activate` creates the telemetry, the notifier and the status bar (bound to `numbers-le.extractNumbers`, registered next), then the commands, then the provider |
| RACE-10 | E N C | pass | the walk sorts and dedupes its file list on both sides; extraction order is document order |
| RACE-11 | N C | pass | a file removed or locked between the listing and the read is a `skipped` report with the io error (`hazards.rs` `a_permission_denied_file…`); the npm side matches by parity |
| RACE-12 | M | pass | `mcp.test.ts` splits a request across chunks and sends two in one; `frames.test.ts` splits inside a frame; the crate reads in 8 KiB chunks in its loop tests |
| RACE-13 | M | pass | each reply carries its own id; the extension's handlers are pure; the npm and crate loops serve one request at a time in order |
| RACE-14 | M | pass | `platform.rs` closes stdin at once; the npm loop ends on end-of-stream with a partial frame dropped, which `frames.test.ts` holds |
| RACE-15 | C | pass | `grep -rnE 'rayon\|thread::\|tokio\|async fn\|Mutex\|RwLock\|Arc<\|static mut\|Atomic' crate/src` → `testing.rs` `COUNTER` only, a test helper |
| RACE-16 | C | pass | `platform.rs` TZ compare and the two platform gates; the walk sorts; hash maps are never iterated into output |
| RACE-17 | tests | pass | three runs green (470 each at baseline), `--sequence.shuffle` green; the real timers in tests are the output tests' bounded waits and the servers' settle; the fake-timer tests are the status bar's and the lifecycle's |
| RACE-18 | E | n/a | no watcher, no debounce |

## Step 7: Translations

Read in full: `package.json`, `package.nls.json`, twelve `src/i18n/package.nls.*.json`,
`l10n/bundle.l10n.json`, twelve `l10n/bundle.l10n.*.json`,
`test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n`
scripts. Every value in every locale was read: 46 runtime keys and 33 manifest
keys per locale at baseline, 57 and 33 at close.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | the diff of `%key%` against `package.nls.json` is empty; `test/integration/l10n.test.ts` walks the whole `contributes` tree |
| L10N-2 | E | pass | both loops print no DRIFT; the integration test holds both mechanisms, `src/l10n.test.ts` the runtime one |
| L10N-3 | E | pass | twelve locales in both; `check:locales ../` from the site |
| L10N-4 | E | pass at baseline | every `l10n.t()` string was in the bundle and every key called; `src/l10n.test.ts` holds it now, and refused the ten new keys until their calls existed (`fail/translations-2.log`) |
| L10N-5 | E | finding | eleven literals handed to the status bar, the notifier or a `writeResult` message: `numbers-le-translations-2`; the help document English in every locale: `numbers-le-translations-5`. Deliberately not translated: `$(symbol-number) Numbers-LE`, the file-type pick's format names, format names and setting keys inside the help document, and the telemetry log |
| L10N-6 | E | pass | no call at module scope (`src/l10n.test.ts` "never calls l10n.t() at module scope") |
| L10N-7 | E | pass | every call hands a literal (`src/l10n.test.ts`) |
| L10N-8 | E | pass | the VSIX listing carries 12 `package.nls.*.json` and 13 `l10n/bundle.l10n*.json`; `clean:i18n` left none in the tree |
| L10N-9 | E | finding | no host ran in any locale but English: `numbers-le-translations-3` adds the German launches; the runtime-string half: `numbers-le-translations-5` localizes the help document and the German host reads `# Numbers-LE Hilfe & Dokumentation` back. A manifest string cannot be read back through the API; the catalogue parity test is that half |
| L10N-10 | E | pass | every locale's placeholders equal the source's (the script in the pass log, before and after `translations-4`) |
| L10N-11 | E | pass | runtime: `Index {0}` in de and fr, the same word in both; manifest: `Numbers-LE` (the category) in all twelve, and in zh-cn only after `translations-4` restored it |
| L10N-12 | E | finding | zh-cn translated the product name in the category and the settings title; es translated it in the tooltip: in `numbers-le-translations-4`. Codicons, `CSV`, `JSON`, `VS Code`, `Numbers-LE` elsewhere intact |
| L10N-13 | E | finding | 155 values did not fit their place: `numbers-le-translations-4` (the classes are in the CHANGELOG entry; the list is the commit) |
| L10N-14 | E | finding | `Run Numbers-LE: …` kept English `Run` in all twelve; es ended its sort options with full stops: in `translations-4` |
| L10N-15 | E | pass | `Extracted {0}`, `Removed {0} duplicates ({1} …)`, `Sorted {0} numbers` read in each locale for 1 and many; the CJK locales carry no plural; `{0} documents` likewise |
| L10N-16 | E | finding | "number" was `Nummer`/`numéro`/`番号`/`번호`/`номер`/`nomor` in the bundle beside `Zahl`/`nombre`/`数値`/`숫자`/`число`/`angka` in the manifest: in `translations-4` |
| L10N-17 | E | finding | `findColumnIndex` compared the picked label to the English `(Column N)`: `numbers-le-translations-1`; dialog labels are bound and compared by reference; the sort pick returns its `value` |
| L10N-18 | all | pass | the results document, the clipboard, the MCP replies, the CLI output and the telemetry log are English and stable across locales; the repo documents the report surfaces as machine-read. The help document is prose for a person and is localized (`translations-5`) |
| L10N-19 | C M | pass | the crate, the npm command line and both MCP servers produce no localized text (`grep -rn l10n src/cli src/mcp crate/src` → none) |

## Findings

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| numbers-le-broken-features-1 | broken-features | README testing section stale; `coverage:readme:check` red at baseline | the gate's output | `9d6a78e`, `8550495` | `coverage:readme:check` | exit 1 |
| numbers-le-broken-features-2 | broken-features | `--help` said a `.ts` or `.sql` file falls back to the text scan; since 0.2.0 a source file is read by its language | read against `crate/src/extract/source.rs` and `contracts.rs` | `498441f` | none: documentation held byte-identical across the two command lines by `check:cli-parity` | n/a |
| numbers-le-broken-features-3 | broken-features | two security tests accepted any answer; two status bar tests asserted nothing | read; `fail/broken-features-3.log` | `a775b7f` | `formats.security.test.ts` "refuses a CSV whose quoted field never closes", "refuses an INI…"; `ui.test.ts` ×5 | retitled and asserting; pass on the same code (test-gap) |
| numbers-le-broken-features-4 | broken-features | the help document claimed CSV streaming, said side-by-side defaults off, repeated a step, named six formats, left six settings out | `fail/broken-features-4.log` | `1468d86` | `help.test.ts` ×3 | `expected { … } to deeply equal { … }` (sixteen settings against ten); `expected … not to match /stream/i` |
| numbers-le-broken-features-5 | broken-features | `clipboardIncludesPositions` and `safety.manyDocumentsThreshold` had no consumer test | INV-4 | `5751d5f` | `extract.test.ts` "settings whose consumer had no test" ×3 | test-gap |
| numbers-le-broken-features-6 | broken-features | `filterNumber` and `errorMessage` exported with no caller in `src/` | the export scan in the pass log | `1756e4f` | removed; `guard.ts` calls `errorMessage`; the suite, typecheck and build green | n/a |
| numbers-le-bugs-1 | bugs | dedupe and sort read the empty last line of a document ending in a newline, a blank line and a CRLF ending as the number 0 | `logs/probes/trailing.log`; `fail/bugs-1.log` | `5b27d9c` | `commands.test.ts` "does not read a trailing newline…", "does not sort a trailing newline in…" | `expected '1\n2\n0' to be '1\n2'`; `'0\n1\n2\n3'` |
| numbers-le-bugs-2 | bugs | a CSV header in a non-Latin script read as data | `fail/bugs-2.log` | `952e3f1` | `prompts.test.ts` "reads a header written in a non-Latin script as a header" | `expected { csvHasHeader: false, … }` |
| numbers-le-bugs-3 | bugs | `maxResults` as `2.0`, `1e3`, `1E20` read three ways by the three servers | `shared-*.out` #1–#3; `fail/bugs-3.log` | `0d09263` | `mcp.test.ts`, `cli.test.ts`, crate `an_integer_valued_float_is_a_cap…`; corpus case; parity +4 lines | `isError maxResults must be a positive integer` where two numbers were due |
| numbers-le-bugs-4 | bugs | `.env.local` resolved as `local` on the extension and its server; three resolvers | `shared-*.out` #4; `fail/bugs-4.log` | `936ef2b` | `mcp.test.ts` ×3, `postProcess.test.ts` ×1; corpus case | 3 red: `expected 'unknown' to be 'env'` |
| numbers-le-bugs-5 | bugs | the text scan read `٣5` as 5; the crate read nothing | `shared-*.out` #8; `fail/bugs-5.log` | `75120c9` | `heuristics.test.ts`, `positions.test.ts`; corpus case | `expected [5, 7] to deeply equal [7]`; the parity script red on the new case |
| numbers-le-errors-1 | errors | a refused results document still flashed `Extracted N`, logged and counted; "CSV opened" after every column refused; nothing said when no column held a number; a thrown string swallowed | `fail/errors-1.log` | `2b5fbb0` | `extract.test.ts` "results that never reach the user" ×6 | 4 red: `expected [ 'Extracted 3' ] to deeply equal []`, … |
| numbers-le-errors-2 | errors | a torn-down file-type pick reported as "Document is no longer valid" | `fail/errors-2.log` | `70c39c1` | `extract.test.ts` "reports a type prompt the host threw out of as what it was" | `expected [ 'Document is no longer valid' ] …` |
| numbers-le-errors-4 | errors | a `paths` entry of the wrong shape dropped by both command-line servers; `path: 7` "not supplied" | `logs/probes/scan.jsonl` #3; `fail/errors-4.log` | `042cc86` | `cli.test.ts`, crate `a_path_entry_that_is_not_a_string…`; parity +2 lines | `a: No such file or directory` where `entry 1 of paths is not a string` was due |
| numbers-le-errors-5 | errors | three servers, three behaviours on a malformed frame; no frame limit on two | `shared-*.out`; `check:cli-pipes`; `fail/errors-5.log` (18 tests) | `7a097e4` | `mcp.test.ts`, `cli.test.ts`, `frames.test.ts`, crate `mcp::tests` ×10, `check:cli-pipes` | 18 red |
| numbers-le-errors-6 | errors | the mock could not refuse an edit or fail a stat; the "Failed to update the editor content" path and the stat guard never ran | read | `643a3c3` | `commands.test.ts` "reports an edit the host refused…", `extract.test.ts` "extracts it, skipping the size warning" | test-gap |
| numbers-le-errors-7 | errors | a FIFO in a tree vanished from the report; one named outright answered "0 numbers in 0 files" | `logs/probes/fifo-*.out`, `walk-*.out`; `fail/errors-7.log` | `feae58e` | crate `hazards.rs` `a_fifo_is_named_rather_than_opened_or_dropped`; `cli.test.ts` "names a FIFO…" | `the fifo is named rather than dropped` (panic); `expected [] to deeply equal [ { path, reason } ]` |
| numbers-le-memory-leaks-1 | memory-leaks | no test disposed everything and asserted; no repeated-run test | read | `89f6579` | `lifecycle.test.ts` ×2 | test-gap; both held on the first run |
| numbers-le-race-conditions-1 | race-conditions | no two-at-once case | read | `93c8ad0` | `commands.test.ts` "two invocations at once" ×2 | test-gap |
| numbers-le-race-conditions-2 | race-conditions | sort in place overwrote an edit made while its picker was open | `fail/race-conditions-2.log` | `014f003` | `commands.test.ts` "writes nothing in place when the document changed while the pick was open" | `expected '1\n2\n3' to be '3\n1\n2\n9'` |
| numbers-le-translations-1 | translations | picking an unnamed column by its translated label fell to all columns; two equal headers picked the first | `fail/translations-1.log` | `5976ff7` | `prompts.test.ts` ×2 | 2 red: `expected { csvHasHeader: true, selectAllColumns: true } …` |
| numbers-le-translations-2 | translations | eleven strings English in every locale | `fail/translations-2.log` | `bc6826e` | `src/l10n.test.ts` ×7 | 2 red: 10 dead keys, 11 literals |
| numbers-le-translations-3 | translations | no host ran in any locale but English | read | `7d39ed3` | `test/locale/german-host.test.ts` ×3, `test/locale-setup/…` ×1 | test-gap |
| numbers-le-translations-4 | translations | 155 catalogue values did not fit their place | the catalogue read | `1aba67a` | the corrected catalogues; the placeholder script before and after; `src/l10n.test.ts` key parity | n/a (a wrong value's test is the corrected catalogue) |
| numbers-le-bugs-6 | bugs | a dead "incomplete" exit arm on both command lines, and the scan tool's envelope silent on a file it could not read, both on a severity no report carries | `fail/bugs-6.log` | `895a4c5` | crate `the_scan_tool_names_an_unreadable_file_in_its_diagnostics`; `cli.test.ts` "names an unreadable file in the envelope diagnostics" | `left: Null right: "unreadable"`; `expected [] to deeply equal [ { code: 'unreadable', … } ]` |
| numbers-le-errors-8 | errors | a symbolic link met in a walk was passed over without a line on both command lines | `fail/errors-8.log` | `1bd4d02` | crate `walk.rs` `a_symbolic_link_is_counted_and_never_followed`, `contracts.rs` `a_symbolic_link_is_counted_not_followed_and_not_silent`, `mcp::tests` `the_scan_tool_counts_a_symbolic_link…`; `cli.test.ts` ×3; the link in the parity tree | `no field symlinks on type walk::Walked`; 2 red |
| numbers-le-errors-9 | errors | a schema violation was an `isError` result, a wrong-typed optional argument was read as absent, `additionalProperties: false` was unenforced, on all three servers | `logs/probes/shared-*.out` #22–#24, #27 | `9f3965a` | `mcp.test.ts` "refuses an argument that does not fit the schema…", `cli.test.ts` ×2, crate `an_argument_that_does_not_fit_the_schema_is_a_protocol_error`, `a_path_that_is_not_there_is_a_tool_failure…`; three corpus cases; parity +5 lines | the probe: `ok=true ft=unknown` for `format: 7` on all three |
| numbers-le-errors-10 | errors | the npm command line's stdout wrapper answered nothing where the stream answers whether the pipe is full; envsync-le's copy answered it and the fleet check held the other fifteen as drifted | `fail/errors-10.log` | `feae58e`… `feaeb37` | `output.test.ts` "answers false when the pipe is full…", "answers false once stdout has failed…"; the same test in every fleet repo | 2 red: `expected undefined to be true` |
| numbers-le-translations-5 | translations | the help document was English in every locale, and no runtime string had been shown in a real host in another language | read; the German host | `ff28262` | `test/locale/german-host.test.ts` "writes the help document in German"; `src/l10n.test.ts` on the 88 keys | the guard: 88 strings not in the bundle until the keys existed; the host test is a test-gap |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
The first close carried eight rows. On the owner's instruction, seven were closed on 2026-10-27, each as a finding above: `numbers-le-translations-5` (the help document and the runtime half of the German host), `numbers-le-errors-9` (wrong-typed arguments and `additionalProperties`), `numbers-le-bugs-6` (the incomplete branch), `numbers-le-errors-8` (symbolic links) and `numbers-le-errors-10` (the fleet's `output.ts`).

| Id or check | What is open | What would settle it |
|---|---|---|
| FEAT-4, the context menu | `editor/context` offers Extract on the eight config formats; the fourteen source languages the extension activates on get the palette only | an owner decision on the menu's `when` clause |
| CLOSE-5, `check:fleet` | closed on 2026-10-27: `src/cli/output.ts` matches envsync-le's here, and the same two files went to the other fourteen repos in fifteen pull requests (one per repo, envsync-le's carrying the test alone), all merged by squash: colors-le#64, dates-le#59, i18n-le#41, ids-le#42, ips-le#40, paths-le#69, regex-le#58, scrape-le#60, secrets-le#60, string-le#66, unicode-le#47, units-le#47, urls-le#58, versions-le#41, envsync-le#61. scrape-le's Windows `cli-parity` leg was red on the first run, on the console render the scrape-le record already carries as a runner flake, and green on the rerun with no change. `check:fleet ../` on the sixteen mains: 30 shared files consistent | nothing; kept here as the row the first close carried |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | every check above has an answer; no `not done`, no `unknown` |
| CLOSE-2 | pass | 29 findings fixed with commit and test; 1 item carried above, an owner decision on the context menu |
| CLOSE-3 | pass | `fail/*.log` for every fix; the test-gap rows say so |
| CLOSE-4 | pass | the Final column above, from `gates.sh final` on `8550495` and `gates.sh final2` on `3bc4f79` after the carried items, every gate exit 0 but `cargo audit`, not run here |
| CLOSE-5 | see note | from `letools-site`: `check:locales ../` (every string in its own language across 16), `check:doc-paths ../` (953 references resolve), `check:registry` (17 tools) green. `check:fleet ../` is red on `src/cli/output.ts`, envsync-le differing from the other 15, as it was before this pass and on the site's `main`; numbers-le's own `transport.ts`, `frames.ts` and `frames.test.ts` are listed as its own copies in `check-fleet.ts` in this change and report no drift |
| CLOSE-6 | pass | CHANGELOG lines for every behaviour change in both changelogs; invariants in `AGENTS.md`; the README section regenerated by its script |
| CLOSE-7 | pass | `git log main..HEAD --format='%ae %s'`: 31 commits, all the noreply address; `lint:commits` conforms; the diff holds no probe, log or scratch file |
| CLOSE-8 | pass | [nolindnaidoo/numbers-le#64](https://github.com/nolindnaidoo/numbers-le/pull/64): the findings table, the carried list, what was verified; no attribution |
| CLOSE-9 | pass | merged by squash as `89c332d` on 2026-10-27, after every check on the pull request was green on the first run at `8550495`, and again on the first run at `3bc4f79` with the carried items closed: `ci.yml` on three operating systems with the versions and registry identity; `ci-crate.yml` test, hazards, platform, scenarios and cli-parity on three, budget, fuzz (6 m 22 s), msrv, coverage, differential, parity, coverage-matrix, policy, one version, commit messages and audit; CodeQL on actions and TypeScript. 35 passed, the Dependabot auto-merge skipped as it is on every non-Dependabot branch |
| CLOSE-10 | pass | the ledger row and this record in one `letools-site` change |
| CLOSE-11 | pass | `bugs.md` BUG-4 gains the digit-and-letter sentence (a digit from another script beside ASCII digits; a `[A-Za-z]` header test); BUG-13 leaves the hunt, having passed here, in `bugs.md` and the README table; "Seven passes". The carried items added no class: each was already a check |
