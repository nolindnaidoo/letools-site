# Fleet pass record: scrape-le

The fifth repo in the navigation's order and the third pass under the
read-once procedure: step 1 read every file on the manifest once with the
checks of steps 2 to 7 beside it, and the steps below answer from that read,
the inventory tables and the runs. Four surfaces: `E` the extension, `M` the
MCP server bundled in the extension and shipped on npm as `scrape-le-mcp`,
`N` the npm command line `scrape-le`, `C` the crate. The npm command line is
held to the crate byte for byte, so most `C` findings are `N` findings too.

| | |
|---|---|
| Repo | scrape-le |
| Branch | `fix/fleet-pass` |
| Baseline commit | `c377fe2462c296623bd1e08d8002a7470aeae0d7` |
| Started | 2026-10-25 |
| Pull request | [nolindnaidoo/scrape-le#59](https://github.com/nolindnaidoo/scrape-le/pull/59) |

## Step 0: Baseline

Scope read in full: `AGENTS.md`, `CLAUDE.md`, `crate/AGENTS.md`, `crate/CLAUDE.md`,
`crate/SPEC.md`, `package.json`, `vitest.config.ts`, `.vscode-test.mjs`,
`.github/workflows/{ci,ci-crate,codeql,dependabot-auto-merge,release,release-cli,release-crate}.yml`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` empty; `git status -sb` → `## main...origin/main` |
| BASE-2 | pass | `git config user.email` → `13629544+nolindnaidoo@users.noreply.github.com` inside the repo |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from main at `c377fe24` |
| BASE-4 | pass | Gate list below, derived from the seven workflow files and `package.json` scripts |
| BASE-5 | see table | One script (`gates.sh baseline`) ran every command unpiped, each to its own log, and recorded the exit code |
| BASE-6 | see findings | One red gate at baseline: `coverage:readme:check` (`scrape-le-broken-features-6`); `cargo audit` not run here |
| BASE-7 | recorded | 74.45% statements, 65.58% branches at baseline; per-file figures in `coverage/coverage-summary.json` |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` → no output; `grep -rnE '#\[ignore' crate/src crate/tests` → no output |

Gate results, one row per command from BASE-4. The crate chain runs inside
`crate/` on the toolchain `rust-toolchain.toml` pins, 1.98.1. Before the final
run the crate's artefacts were cleaned (`cargo clean -p scrape-le`) and rebuilt;
mid-pass a `cargo build` reported "Finished" and left a binary that answered
for the old code, so every binary driven as evidence was rebuilt after a clean.

| Surface | Command | Baseline | Final | Notes |
|---|---|---|---|---|
| `E` | `bun install --frozen-lockfile` | exit 0 | exit 0 |  |
| `E` | `bun run lint` | exit 0 | exit 0 | biome 2.5.15 against a 2.5.7 schema prints two deserialize notes and four `noUselessCatch` infos; neither fails the gate |
| `E` | `bun run typecheck` | exit 0 | exit 0 | covers `src/` and `vitest.config.ts`; `scripts/` is not type-checked (FEAT-19) |
| `E` | `bun run test:coverage` | exit 0 | exit 0 | baseline 37 files, 471 tests; statements 74.45, branches 65.58, functions 80.99, lines 77.61. Close 40 files, 525 tests; statements 76.09, branches 67.97, functions 82.75, lines 78.97 |
| `E` | `bun run build` | exit 0 | exit 0 |  |
| `E` | `bun run check:bundle` | exit 0 | exit 0 | static scan and runtime load of `dist/extension.js`; playwright-core is the allow-listed exception |
| `M` | `bun run build:mcp:prod` | exit 0 | exit 0 |  |
| `M` | `bun run check:mcp-bundle` | exit 0 | exit 0 | 8 KB, one tool answered over stdio |
| `N` | `bun run build:npm` | exit 0 | exit 0 | `scrape-le-mcp@2.5.4` |
| `N` | `bun run check:npm-package` | exit 0 | exit 0 |  |
| `E` | `bun run package` | exit 0 | exit 0 | `release/scrape-le-2.5.4.vsix`; `clean:i18n` left no copied catalogue |
| `E` | `bun run coverage:readme:check` | exit 1 | exit 0 | README said 465 cases across 36 files; the run had 471 across 37. `scrape-le-broken-features-6`. Red once more in the final run, on three tests added after the regeneration, and regenerated again (`4850b23`); exit 0 on the last commit |
| `E` | `bun run lint:commits` | exit 0 | exit 0 | 0 commits at baseline; 30 conform at close |
| `E` | `python3 scripts/check-agent-files.py` | exit 0 | exit 0 | also run by `src/agent-files.test.ts` |
| `E` | `bun run benchmark` | exit 0 | exit 0 | pure, no network |
| `E` | versions job shell (`ci.yml`) | exit 0 | exit 0 | extension = npm server = `server.json` = 2.5.4 |
| `C N` | one-version job shell (`ci-crate.yml`) | exit 0 | exit 0 | `crate/Cargo.toml` = `cli/package.json` = 2.5.4 |
| `C` | `cargo fmt --all --check` | exit 0 | exit 0 |  |
| `C` | `cargo clippy --all-targets --locked -- -D warnings` | exit 0 | exit 0 |  |
| `C` | `cargo test --locked` | exit 0 | exit 0 | 125 unit, 20 contracts, 18 hazards, 7 platform, 2 fuzz (1 s), 3 budget and 4 scenario tests skipped by their gates at baseline; 127 unit and 21 contracts at close |
| `C` | `cargo build --locked` | exit 0 | exit 0 |  |
| `C` | MSRV build (`rustup run 1.88`) | exit 0 | exit 0 |  |
| `C` | policy: no inline `#[allow(` | exit 0 | exit 0 |  |
| `C` | policy: no doc holds the surfaces equal | exit 0 | exit 0 |  |
| `C` | `cargo llvm-cov`, 70% floor on `detect/` | exit 0 | exit 0 |  |
| `M C` | `bun scripts/check-signature-parity.ts` | exit 0 | exit 0 | corpus against the extension |
| `M C` | `check-differential.ts`, seed 20260812, 600 cases | exit 0 | exit 0 | both servers agree on 600 generated robots.txt cases |
| `M C` | `check-mcp-definition.ts` | exit 0 | exit 0 | the shared tool defined identically |
| `N` | `bun run build:cli` | exit 0 | exit 0 |  |
| `N C` | `SCRAPE_LE_PARITY_RENDER=1 check:cli-parity` | exit 0 | exit 0 | 162 commands and 46 MCP requests at close (46 was 41 at baseline; three `urls`-shape requests and two more joined), rendered with Google Chrome; 161 s |
| `N C` | `check:cli-pipes` (`--mcp-only`) | exit 0 | exit 0 | 1 closed-pipe case and 18 malformed frames, both binaries alike. The command-line cases are skipped on purpose: they resolve a host and hit the network |
| `N` | `bun run build:cli:prod` | exit 0 | exit 0 |  |
| `N` | `bun run check:cli-package` | exit 0 | exit 0 | installs from the tarball, runs as `scrape-le` |
| `C` | `cargo audit` | not run here | not run here | not installed here; CI runs it |
| `C` | `SCRAPE_LE_SCENARIOS=1` scenario tests | exit 0 | exit 0 | 4 tests against a real Chromium, 20 s |
| `C` | `cargo test --test hazards` | exit 0 | exit 0 | 18 tests, no network |
| `C` | `cargo test --test platform` + TZ compare | exit 0 | exit 0 |  |
| `C` | TZ compare job shell | exit 0 | exit 0 |  |
| `C` | `SCRAPE_LE_FUZZ_SECONDS=60` fuzz | exit 0 | exit 0 | 26,882 generated documents at baseline and 27,041 at close, seed 0x5c2abe1e0b1d2026 |
| `C` | `SCRAPE_LE_BUDGET=1 --release` budget | exit 0 | exit 0 | three timing tests, 86 s |
| `C` | coverage matrix greps | exit 0 | exit 0 | 21 vendor signals through `check()`, 19 page signals across 5 vendors, 4 checks and 4 verdicts |
| `C` | crate package list | exit 0 | exit 0 | 5 signatures and 4 fixture files in the package |
| `C` | `cargo publish --dry-run` | exit 0 | exit 0 |  |
| `E` | `bun run test:integration` | exit 0 | exit 0 | 10 host tests at baseline; at close 10 in English, 1 installing the German language pack and 3 on the German host |
| `E` | `bun run test:e2e-vsix` | exit 0 | exit 0 | installs the built VSIX into a clean profile, runs the help flow, spawns the MCP server |

## Step 1: Inventory

Read manifest, from INV-1. Every row was read from its first line to its last
during this pass; 229 files, 35,161 lines. `.windsurfrules` and `GEMINI.md`
are byte-identical to `.clinerules`, which `check-agent-files.py` holds.

| Read | Lines | File |
|---|---|---|
| [x] | 40 | `.clinerules` |
| [x] | 45 | `.cursor/rules/project.mdc` |
| [x] | 40 | `.cursorrules` |
| [x] | 25 | `.github/codeql-config.yml` |
| [x] | 40 | `.github/copilot-instructions.md` |
| [x] | 41 | `.github/dependabot.yml` |
| [x] | 588 | `.github/workflows/ci-crate.yml` |
| [x] | 235 | `.github/workflows/ci.yml` |
| [x] | 59 | `.github/workflows/codeql.yml` |
| [x] | 123 | `.github/workflows/dependabot-auto-merge.yml` |
| [x] | 132 | `.github/workflows/release-cli.yml` |
| [x] | 140 | `.github/workflows/release-crate.yml` |
| [x] | 216 | `.github/workflows/release.yml` |
| [x] | 3 | `.mailmap` |
| [x] | 15 | `.vscode-test.mjs` |
| [x] | 40 | `.vscodeignore` |
| [x] | 40 | `.windsurfrules` |
| [x] | 369 | `AGENTS.md` |
| [x] | 596 | `CHANGELOG.md` |
| [x] | 90 | `CLAUDE.md` |
| [x] | 40 | `GEMINI.md` |
| [x] | 311 | `README.md` |
| [x] | 83 | `cli/README.md` |
| [x] | 46 | `cli/package.json` |
| [x] | 259 | `crate/AGENTS.md` |
| [x] | 445 | `crate/CHANGELOG.md` |
| [x] | 41 | `crate/CLAUDE.md` |
| [x] | 78 | `crate/Cargo.toml` |
| [x] | 21 | `crate/LICENSE` |
| [x] | 252 | `crate/README.md` |
| [x] | 599 | `crate/SPEC.md` |
| [x] | 113 | `crate/examples/spike.rs` |
| [x] | 30 | `crate/fixtures/README.md` |
| [x] | 90 | `crate/fixtures/antibot-headers.json` |
| [x] | 265 | `crate/fixtures/mcp-analyze-robots.json` |
| [x] | 7 | `crate/fixtures/robots/agent-specific.txt` |
| [x] | 313 | `crate/fixtures/robots/cases.json` |
| [x] | 2 | `crate/fixtures/robots/disallow-all.txt` |
| [x] | 9 | `crate/fixtures/robots/encoded.txt` |
| [x] | 13 | `crate/fixtures/robots/multi-group.txt` |
| [x] | 6 | `crate/fixtures/robots/simple.txt` |
| [x] | 8 | `crate/fixtures/robots/wildcards.txt` |
| [x] | 57 | `crate/fixtures/url.json` |
| [x] | 17 | `crate/signatures/README.md` |
| [x] | 18 | `crate/signatures/cloudflare.toml` |
| [x] | 15 | `crate/signatures/datadome.toml` |
| [x] | 6 | `crate/signatures/hcaptcha.toml` |
| [x] | 6 | `crate/signatures/perimeterx.toml` |
| [x] | 6 | `crate/signatures/recaptcha.toml` |
| [x] | 571 | `crate/src/batch.rs` |
| [x] | 93 | `crate/src/check_url.rs` |
| [x] | 591 | `crate/src/cli.rs` |
| [x] | 73 | `crate/src/detect/antibot.rs` |
| [x] | 194 | `crate/src/detect/auth.rs` |
| [x] | 841 | `crate/src/detect/check.rs` |
| [x] | 14 | `crate/src/detect/mod.rs` |
| [x] | 113 | `crate/src/detect/ratelimit.rs` |
| [x] | 107 | `crate/src/detect/report.rs` |
| [x] | 748 | `crate/src/detect/robots.rs` |
| [x] | 352 | `crate/src/detect/signatures.rs` |
| [x] | 346 | `crate/src/detect/url.rs` |
| [x] | 238 | `crate/src/fetch.rs` |
| [x] | 18 | `crate/src/main.rs` |
| [x] | 363 | `crate/src/mcp/analyze.rs` |
| [x] | 481 | `crate/src/mcp/mod.rs` |
| [x] | 584 | `crate/src/render.rs` |
| [x] | 220 | `crate/tests/budget.rs` |
| [x] | 592 | `crate/tests/contracts.rs` |
| [x] | 397 | `crate/tests/fuzz.rs` |
| [x] | 611 | `crate/tests/hazards.rs` |
| [x] | 266 | `crate/tests/platform.rs` |
| [x] | 233 | `crate/tests/scenarios.rs` |
| [x] | 35 | `l10n/bundle.l10n.de.json` |
| [x] | 35 | `l10n/bundle.l10n.es.json` |
| [x] | 35 | `l10n/bundle.l10n.fr.json` |
| [x] | 35 | `l10n/bundle.l10n.id.json` |
| [x] | 35 | `l10n/bundle.l10n.it.json` |
| [x] | 35 | `l10n/bundle.l10n.ja.json` |
| [x] | 34 | `l10n/bundle.l10n.json` |
| [x] | 35 | `l10n/bundle.l10n.ko.json` |
| [x] | 35 | `l10n/bundle.l10n.pt-br.json` |
| [x] | 35 | `l10n/bundle.l10n.ru.json` |
| [x] | 35 | `l10n/bundle.l10n.uk.json` |
| [x] | 35 | `l10n/bundle.l10n.vi.json` |
| [x] | 35 | `l10n/bundle.l10n.zh-cn.json` |
| [x] | 188 | `mcp/README.md` |
| [x] | 51 | `mcp/package.json` |
| [x] | 288 | `package.json` |
| [x] | 33 | `package.nls.json` |
| [x] | 5 | `samples/notes.md` |
| [x] | 16 | `samples/targets.md` |
| [x] | 120 | `scripts/benchmark.ts` |
| [x] | 57 | `scripts/build-cli.js` |
| [x] | 38 | `scripts/build-mcp.js` |
| [x] | 98 | `scripts/build-npm.js` |
| [x] | 135 | `scripts/check-agent-files.py` |
| [x] | 126 | `scripts/check-bundle.js` |
| [x] | 147 | `scripts/check-cli-package.js` |
| [x] | 757 | `scripts/check-cli-parity.ts` |
| [x] | 186 | `scripts/check-cli-pipes.ts` |
| [x] | 382 | `scripts/check-differential.ts` |
| [x] | 157 | `scripts/check-mcp-bundle.js` |
| [x] | 93 | `scripts/check-mcp-definition.ts` |
| [x] | 150 | `scripts/check-npm-package.js` |
| [x] | 213 | `scripts/check-signature-parity.ts` |
| [x] | 182 | `scripts/commit-lint.js` |
| [x] | 181 | `scripts/coverage-readme.js` |
| [x] | 223 | `scripts/e2e-vsix.js` |
| [x] | 27 | `scripts/install-hooks.js` |
| [x] | 72 | `scripts/perf-readme.js` |
| [x] | 33 | `server.json` |
| [x] | 418 | `src/__mocks__/vscode.ts` |
| [x] | 62 | `src/agent-files.test.ts` |
| [x] | 195 | `src/cli/batch.ts` |
| [x] | 152 | `src/cli/browser.ts` |
| [x] | 107 | `src/cli/checkUrl.ts` |
| [x] | 572 | `src/cli/cli.test.ts` |
| [x] | 127 | `src/cli/fetch.ts` |
| [x] | 36 | `src/cli/frames.test.ts` |
| [x] | 58 | `src/cli/frames.ts` |
| [x] | 367 | `src/cli/http.ts` |
| [x] | 334 | `src/cli/httpUri.ts` |
| [x] | 144 | `src/cli/ioError.ts` |
| [x] | 153 | `src/cli/json.ts` |
| [x] | 46 | `src/cli/main.ts` |
| [x] | 399 | `src/cli/mcp.ts` |
| [x] | 129 | `src/cli/netError.ts` |
| [x] | 138 | `src/cli/output.test.ts` |
| [x] | 77 | `src/cli/output.ts` |
| [x] | 560 | `src/cli/render.ts` |
| [x] | 472 | `src/cli/report.ts` |
| [x] | 171 | `src/cli/robots.ts` |
| [x] | 398 | `src/cli/run.ts` |
| [x] | 172 | `src/cli/signatures.ts` |
| [x] | 426 | `src/cli/toml.ts` |
| [x] | 117 | `src/cli/url.ts` |
| [x] | 53 | `src/cli/usage.ts` |
| [x] | 172 | `src/commands/check.test.ts` |
| [x] | 227 | `src/commands/check.ts` |
| [x] | 107 | `src/commands/checkSelection.test.ts` |
| [x] | 55 | `src/commands/checkSelection.ts` |
| [x] | 81 | `src/commands/guard.test.ts` |
| [x] | 30 | `src/commands/guard.ts` |
| [x] | 51 | `src/commands/help.test.ts` |
| [x] | 99 | `src/commands/help.ts` |
| [x] | 27 | `src/commands/index.ts` |
| [x] | 101 | `src/commands/setup.test.ts` |
| [x] | 81 | `src/commands/setup.ts` |
| [x] | 58 | `src/config/config.test.ts` |
| [x] | 115 | `src/config/config.ts` |
| [x] | 25 | `src/config/settings.ts` |
| [x] | 9 | `src/detectors/__fixtures__/antibot-headers.json` |
| [x] | 25 | `src/detectors/__fixtures__/ratelimit-headers.json` |
| [x] | 2 | `src/detectors/__fixtures__/robots-disallow-all.txt` |
| [x] | 13 | `src/detectors/__fixtures__/robots-multi-group.txt` |
| [x] | 6 | `src/detectors/__fixtures__/robots-simple.txt` |
| [x] | 8 | `src/detectors/__fixtures__/robots-wildcards.txt` |
| [x] | 485 | `src/detectors/__snapshots__/characterization.test.ts.snap` |
| [x] | 307 | `src/detectors/antibot.test.ts` |
| [x] | 96 | `src/detectors/antibot.ts` |
| [x] | 333 | `src/detectors/authentication.test.ts` |
| [x] | 223 | `src/detectors/authentication.ts` |
| [x] | 286 | `src/detectors/characterization.test.ts` |
| [x] | 174 | `src/detectors/failures.test.ts` |
| [x] | 102 | `src/detectors/heuristics.test.ts` |
| [x] | 182 | `src/detectors/heuristics.ts` |
| [x] | 252 | `src/detectors/index.test.ts` |
| [x] | 119 | `src/detectors/index.ts` |
| [x] | 122 | `src/detectors/pageEvaluate.test.ts` |
| [x] | 90 | `src/detectors/ratelimit.test.ts` |
| [x] | 71 | `src/detectors/ratelimit.ts` |
| [x] | 357 | `src/detectors/robotstxt.test.ts` |
| [x] | 334 | `src/detectors/robotstxt.ts` |
| [x] | 49 | `src/extension.test.ts` |
| [x] | 39 | `src/extension.ts` |
| [x] | 42 | `src/i18n/nls-parity.test.ts` |
| [x] | 33 | `src/i18n/package.nls.de.json` |
| [x] | 33 | `src/i18n/package.nls.es.json` |
| [x] | 33 | `src/i18n/package.nls.fr.json` |
| [x] | 33 | `src/i18n/package.nls.id.json` |
| [x] | 33 | `src/i18n/package.nls.it.json` |
| [x] | 33 | `src/i18n/package.nls.ja.json` |
| [x] | 33 | `src/i18n/package.nls.ko.json` |
| [x] | 33 | `src/i18n/package.nls.pt-br.json` |
| [x] | 33 | `src/i18n/package.nls.ru.json` |
| [x] | 33 | `src/i18n/package.nls.uk.json` |
| [x] | 33 | `src/i18n/package.nls.vi.json` |
| [x] | 33 | `src/i18n/package.nls.zh-cn.json` |
| [x] | 127 | `src/mcp/envelope.ts` |
| [x] | 13 | `src/mcp/info.ts` |
| [x] | 335 | `src/mcp/mcp.test.ts` |
| [x] | 55 | `src/mcp/provider.ts` |
| [x] | 107 | `src/mcp/readme.test.ts` |
| [x] | 13 | `src/mcp/server.ts` |
| [x] | 141 | `src/mcp/tools.ts` |
| [x] | 293 | `src/mcp/transport.ts` |
| [x] | 116 | `src/rating/policy.test.ts` |
| [x] | 84 | `src/rating/policy.ts` |
| [x] | 85 | `src/rating/wiring.test.ts` |
| [x] | 130 | `src/scraper/browser.test.ts` |
| [x] | 100 | `src/scraper/browser.ts` |
| [x] | 355 | `src/scraper/checker.test.ts` |
| [x] | 189 | `src/scraper/checker.ts` |
| [x] | 180 | `src/scraper/install.test.ts` |
| [x] | 200 | `src/scraper/install.ts` |
| [x] | 184 | `src/scraper/retry.test.ts` |
| [x] | 116 | `src/scraper/retry.ts` |
| [x] | 197 | `src/types.ts` |
| [x] | 70 | `src/ui/notifier.test.ts` |
| [x] | 31 | `src/ui/notifier.ts` |
| [x] | 123 | `src/ui/output.test.ts` |
| [x] | 285 | `src/ui/output.ts` |
| [x] | 317 | `src/ui/ratingPrompt.test.ts` |
| [x] | 179 | `src/ui/ratingPrompt.ts` |
| [x] | 68 | `src/ui/statusBar.test.ts` |
| [x] | 62 | `src/ui/statusBar.ts` |
| [x] | 15 | `src/utils/__fixtures__/url-inputs.txt` |
| [x] | 136 | `src/utils/__snapshots__/url.characterization.test.ts.snap` |
| [x] | 115 | `src/utils/errorHandling.test.ts` |
| [x] | 88 | `src/utils/errorHandling.ts` |
| [x] | 48 | `src/utils/url.characterization.test.ts` |
| [x] | 347 | `src/utils/url.security.test.ts` |
| [x] | 97 | `src/utils/url.test.ts` |
| [x] | 88 | `src/utils/url.ts` |
| [x] | 78 | `test/integration/extension.test.ts` |
| [x] | 176 | `test/integration/l10n.test.ts` |
| [x] | 12 | `tsconfig.it.json` |
| [x] | 24 | `tsconfig.json` |
| [x] | 57 | `vitest.config.ts` |

### INV-2. Manifest contributions

| Contribution | Entry | Localized | Note |
|---|---|---|---|
| command | `scrape-le.checkUrl` | `%manifest.command.check-url.title%` | palette, status bar click |
| command | `scrape-le.checkSelection` | `%manifest.command.check-selection.title%` | palette, editor context menu when `editorHasSelection` |
| command | `scrape-le.setup` | `%manifest.command.setup.title%` | |
| command | `scrape-le.openSettings` | `%manifest.command.settings.title%` | |
| command | `scrape-le.help` | `%manifest.command.help.title%` | |
| menu | `editor/context` → `scrape-le.checkSelection` | | `when: editorHasSelection`, a context key in the 1.101 floor |
| keybindings | none | | removed in 2.4.0 |
| configuration | 17 properties under `scrape-le.` | every title and description a `%key%` | listed under INV-4 |
| capabilities | `virtualWorkspaces: limited`, `untrustedWorkspaces: limited` | `%manifest.capability.*%` | both reused the untrusted-workspace description at baseline (`scrape-le-translations-3`) |
| activationEvents | none declared | | inferred from the five commands and the MCP provider by the host |
| mcpServerDefinitionProviders | id `scrape-le`, label `%manifest.mcp.label%` | | provider registered in `activate()` behind feature detection |
| l10n | `./l10n` | | twelve bundles beside the English source |

### INV-3. Registrations

| Registration | Where | Disposed by |
|---|---|---|
| 5 commands | `commands/index.ts` (4), `config/settings.ts` (1) | each pushed to `context.subscriptions` |
| status bar item and its config listener | `ui/statusBar.ts` | the wrapper pushed to `context.subscriptions` (the bare item, before `bc88ad5`) |
| output channel | `ui/output.ts`, lazily | `registerOutput(context)` (nothing, before `8ebd49d`) |
| MCP definition provider | `mcp/provider.ts` | pushed to `context.subscriptions` when `vscode.lm` has the API |

### INV-4. Settings and their consumers

| Setting | Consumer | Consumer test |
|---|---|---|
| `browser.timeout` | `checker.ts` `page.goto` timeout | `check.test.ts` passes it through; `checker.test.ts` |
| `browser.viewport.width/height` | `checker.ts` `newPage` | `checker.test.ts` |
| `browser.userAgent` | `checker.ts` `newPage` | `checker.test.ts` "applies the configured User-Agent" and the default |
| `retry.userAgents` | `check.ts` → `retryWithUserAgents` | `retry.test.ts` ×7 |
| `screenshot.enabled/path/format/quality` | `checker.ts` `captureScreenshot` | `checker.test.ts` png, jpeg+quality, disabled, and the failed write (`f654e77`) |
| `checkConsoleErrors` | `checker.ts` console and pageerror listeners | `checker.test.ts` enabled and disabled |
| `detections.antiBot/rateLimit/robotsTxt/authentication` | `detectors/index.ts` | `index.test.ts` all, some, none |
| `robotsTxt.agent` | `check.ts` → `runDetections` → `fetchRobotsTxt` | none at baseline (`scrape-le-broken-features-8`); `check.test.ts` and `index.test.ts` now |
| `notificationsLevel` | `ui/notifier.ts`, re-read per call | `notifier.test.ts`; `setup.test.ts` after `4ec76e2` |
| `statusBar.enabled` | `ui/statusBar.ts`, live listener | `statusBar.test.ts` |

`config.test.ts` holds `DEFAULT_CONFIG` to every manifest default (FEAT-7).

### INV-5. Resources with a lifetime

| Resource | Created | Released | Largest it can get |
|---|---|---|---|
| status bar item | `createStatusBar` at activation | deactivation, via the wrapper | one |
| config listener | `createStatusBar` | deactivation | one |
| idle reset timer | `statusBar.resetAfter` per check | the next `show` or `resetAfter`, or dispose | one pending (untracked and per check, before `cef1471`) |
| output channel | first log | deactivation (`8ebd49d`) | one |
| MCP provider | activation | deactivation | one |
| robots.txt fetch timer | `fetchRobotsTxt` per check | `finally` (skipped on rejection, before `735b5b4`) | one per check in flight |
| browser | `createBrowser` per check | `closeBrowser` in `finally` | one per check in flight |
| page | `newPage` per check | `page.close` in `finally` | one per browser |
| MCP server: tool table | `createResponder` | process end | the tool count |
| MCP server: input buffer | per frame | per frame, 16 MiB ceiling | 16 MiB plus the pending chunk |
| crate/npm: `RobotsCache` | per run | run end | one document per origin in the run |
| crate/npm: duplicate-URL map | per batch | batch end | one report per distinct URL |

### INV-6. Suspension points

| File | Awaits | What is read before and used after |
|---|---|---|
| `commands/check.ts` | input box, `ensureBrowserInstalled`, `createBrowser`, `checkPageScrapeability`, retries, `closeBrowser` | the URL (immutable), the configuration snapshot read once before the check (RACE-7 pass), the status bar (shared, last writer wins; RACE-3 below) |
| `commands/checkSelection.ts` | `executeCheck` | the selection text, read before the await and not reused after |
| `commands/setup.ts` | quick pick, `ensureBrowserInstalled`, `isBrowserAvailable` | nothing shared |
| `commands/help.ts` | `openTextDocument`, `showTextDocument` | nothing shared |
| `scraper/install.ts` | the prompt, the child process, `isBrowserAvailable`, clipboard, `openExternal` | nothing shared |
| `scraper/checker.ts` | `newPage`, `goto`, `waitForLoadState`, `title`, screenshot, detections, `page.close` | the page handle, closed in `finally` on every path |
| `ui/ratingPrompt.ts` | `globalState.update` before the toast, then the toast | the ask is written before the wait (RACE-5 pass) |

### INV-7. Failure sites

| Site | What arrives | What the user learns | Verdict |
|---|---|---|---|
| `antibot.ts` `readHeaders` / `runPageProbe` catch → `{}` | a headers read or evaluate that threw | "None detected" | `scrape-le-errors-2`: propagates now |
| `authentication.ts` three catches → false | an evaluate or `page.url()` that threw | "Not required" | `scrape-le-errors-2`: propagates now |
| `robotstxt.ts` `!response.ok` → absent | 403, 429, 5xx alike | "Not found", crawling allowed | `scrape-le-errors-1`: 5xx and a failed fetch are an assumed disallow |
| `robotstxt.ts` catch → rethrow | timeout, network | "check failed" with the message | now the assumed disallow with the reason |
| `checker.ts` `captureScreenshot` catch → `''` | a write or capture failure | nothing; no screenshot line | `scrape-le-errors-3`: the reason is in the report |
| `checker.ts` outer catch | navigation failure | `success: false` with the sanitized message | pass |
| `checker.ts` `page.close` catch | close failure | `console.error` | best effort, commented; the browser is still closed |
| `checker.ts` `waitForLoadState` catch | never idle | continues | commented as best effort; pass |
| `browser.ts` sandbox fallback and `isBrowserAvailable` | launch failure | the install prompt | pass |
| `install.ts` catches | child failure, a clipboard or browser refusal | an error toast | the clipboard and browser arms had no test (`scrape-le-errors-9`) |
| `retry.ts` catch | a retry that threw | listed as a failed attempt in the report | pass |
| `ratingPrompt.ts` catch | `globalState.update` failure | a line in the output channel | pass, `ratingPrompt.test.ts` |
| `guard.ts` catch | anything a command threw | one redacted, localized error | pass |
| `commands/check.ts` catch | anything the check threw | status bar + toast, classified and localized (`c01e025`) | pass |
| `url.ts` catches | `new URL` refusing | regex fallback / `null` | pass, `url.test.ts` |
| `mcp/transport.ts` catches | a tool that threw; bad JSON | `isError` result; `-32700` | pass |
| `ratelimit.ts` catches | `headers()`/`status()` throwing | rethrow; `null` status | pass |
| crate `fetch.rs` `classify` | ureq errors | exit 2 for DNS/timeout/bad URI, `blocked` for the rest | pass, `contracts.rs` |
| crate `render.rs` `capture_screenshot` `.ok()?` | capture or write failure | nothing | `scrape-le-errors-7` |
| crate `eprintln!` ×17 | a stderr write that fails | panic, exit 101 | `scrape-le-errors-8` |
| crate `mcp/mod.rs` `serve` | a frame that is not UTF-8 or not JSON | dropped without a word | `scrape-le-errors-5` |
| npm `cli/frames.ts` | the same | the same | `scrape-le-errors-5` |

### INV-8. User-visible strings, by channel

| Channel | Where | Mechanism at baseline | Now |
|---|---|---|---|
| notifications | `check.ts`, `checkSelection.ts`, `setup.ts`, `install.ts`, `guard.ts`, `ratingPrompt.ts` | mostly `l10n.t()`; `check.ts` ×3, `setup.ts` ×3, `install.ts` ×2 literal | all `l10n.t()` (`c01e025`, `4ec76e2`) |
| status bar text and tooltip | `check.ts`, `statusBar.ts` | literal ×7 | `l10n.t()`; `$(globe) Scrape-LE` kept as a codicon plus the product name |
| progress messages | `check.ts`, `install.ts` | `l10n.t()`; `Retrying as {0}...` with no bundle key | in the bundle |
| quick pick | `setup.ts` | labels literal with codicons, descriptions `l10n.t()` | unchanged: labels are codicon plus a short verb phrase, recorded as a deliberate carry (below) |
| input box | `check.ts` | `l10n.t()` for prompt and validators | |
| dialog buttons | `install.ts`, `ratingPrompt.ts` | `l10n.t()`, bound and compared by reference | |
| output channel report | `ui/output.ts` | English | carried: machine-pasted report, owner decision (below) |
| help document | `commands/help.ts` | English | carried with the report |
| manifest | `package.json` | `%key%` throughout | |
| MCP, CLI, crate | `src/mcp`, `src/cli`, `crate/` | English, machine-read | L10N-18/19: deliberately not localized |

### INV-9. Machine interfaces

| Interface | Shape | Held by |
|---|---|---|
| MCP tool `analyze_robots_txt` | `{content, path, agent?, maxResults?}` → `{ok, data, diagnostics, meta}` | `fixtures/mcp-analyze-robots.json` on both servers; `check-mcp-definition.ts` |
| MCP tools `scrape_le_check`, `scrape_le_doctor` (`N` `C`) | one URL or `urls`, `render`, `agent` | `check-cli-parity.ts` 46 requests; crate unit tests |
| JSON-RPC framing, three servers | newline-delimited, 16 MiB ceiling, parse errors in one wording | `mcp.test.ts`, `cli.test.ts`, crate `mcp::tests`, `check-cli-pipes.ts` |
| report JSON (`N` `C`) | `schema: 1`; `screenshot_error` joins as an optional field | `check-cli-parity.ts`, `contracts.rs` |
| exit codes (`N` `C`) | 0 clear, 1 not a yes, 2 malformed | `contracts.rs`, `cli.test.ts` |
| flags (`N` `C`) | `--input`, `--no-render`, `--agent`, `--signatures`, `--concurrency`, `--ignore-crawl-delay`, `doctor`, `mcp` | `usage.ts` ↔ parser test; parity |
| npm packages | `scrape-le-mcp` (bin `scrape-le-mcp`), `scrape-le` (bin `scrape-le`) | `check:npm-package`, `check:cli-package` |

### INV-10. Claims

| Claim | Where | Backed by | Verdict |
|---|---|---|---|
| five anti-bot vendors by header, script, DOM and global | README, help, manifest | corpus, coverage matrix, `heuristics.test.ts` | help named four (`scrape-le-broken-features-3`); the manifest named Perimeter81 (`scrape-le-translations-3`) |
| robots.txt per RFC 9309 with the configured agent | README, SPEC | `robotstxt.test.ts`, `cases.json`, differential | README's limitation said agent groups are ignored (`scrape-le-broken-features-1`) |
| 5 s network-idle settle | README | `checker.ts` | pass |
| screenshot per check, path in the report | README, help, SPEC | `checker.test.ts`; crate `scenarios.rs` | a failed write said nothing (`errors-3`, `errors-7`) |
| twelve languages, both halves | README | parity tests; `src/l10n.test.ts` now | 24 runtime strings were English everywhere (`translations-1`) |
| MCP server makes no network request | README, mcp README | `mcp.test.ts` "exposes nothing that reaches the network" | pass |
| one rating prompt, at most twice | README | `policy.test.ts`, `ratingPrompt.test.ts` | pass |
| exit codes 0/1/2 | README, SPEC, cli README | `contracts.rs`, `hazards.rs` | pass; a closed stderr pipe gave 101 (`errors-8`) |
| `texting_robots` underneath the parser | SPEC | nothing: not a dependency | `scrape-le-broken-features-2` |
| "The same run over a whole tree" | README install table | nothing: the tool checks URLs | `scrape-le-broken-features-1` |
| README Testing numbers | README | `coverage:readme:check` | stale at baseline (`broken-features-6`) |
| the three servers answer one frame alike | AGENTS (implied by `check:cli-pipes`) | the probe in `logs/probes/err19.log` | three behaviours (`errors-5`) |

### INV-11. Tests, matched

| Test file | Matches | Gap |
|---|---|---|
| `antibot.test.ts`, `authentication.test.ts` | the detectors | six tests pinned swallowed failures (ERR-13; `errors-2`) |
| `robotstxt.test.ts` | the parser and fetch | a title claiming a malformed path (`broken-features-7`); 5xx untested (`errors-1`) |
| `characterization.test.ts` + snapshots | detector output | a header listing four fixed bugs as current (`broken-features-7`) |
| `check.test.ts`, `checkSelection.test.ts` | the two check commands | no two-at-once case (`race-conditions-1`); no toast-with-findings case (`bugs-1`); order-dependent (`memory-leaks-1`) |
| `setup.test.ts`, `help.test.ts`, `guard.test.ts` | commands | setup's results bypassed the notifier (`errors-4`); no failing-document case (`errors-9`) |
| `install.test.ts` | the install flow | the clipboard and browser catch untested (`errors-9`) |
| `statusBar.test.ts`, `output.test.ts`, `notifier.test.ts` | UI | no reset-timer, no release tests (`race-conditions-1`, `memory-leaks-1`) |
| `extension.test.ts` | activation | no lifecycle test, no provider test (`memory-leaks-2`, `broken-features-5`) |
| `mcp.test.ts`, `cli.test.ts`, crate `mcp::tests` | the three servers | each tested its own words (`errors-5`) |
| `index.test.ts` | the orchestrator | a failure test asserting nothing (`broken-features-9`); no agent plumbing test (`broken-features-8`) |
| `l10n.test.ts` (integration), `nls-parity.test.ts` | catalogues | nothing held source to bundle (`translations-1`); no vendor-name check (`translations-3`) |
| crate `contracts.rs`, `hazards.rs`, `platform.rs` | exit codes, inputs | no closed-stderr case (`errors-8`) |
| crate `render.rs` tests | the name and the matrix | no failed-write case (`errors-7`) |

## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, `src/commands/*`,
`src/config/*`, `src/ui/*`, `src/mcp/*`, `test/integration/*`,
`scripts/e2e-vsix.js`, `.vscodeignore`, `crate/src/main.rs`, `crate/src/cli.rs`,
`mcp/package.json`, `cli/package.json`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | `extension.test.ts` "registers every command declared in the manifest"; `test/integration/extension.test.ts` with `getCommands(true)` |
| FEAT-2 | E | pass | checkUrl: `check.test.ts` asserts the checker call, the toast, the status bar, the channel; checkSelection: `checkSelection.test.ts`; setup: `setup.test.ts` ×7; openSettings: `extension.test.ts` asserts the built-in; help: `help.test.ts` and the host test reading the document. The host runs each once (`test/integration/extension.test.ts`, 10 tests) |
| FEAT-3 | E | pass | every command ignores its arguments; `lifecycle.test.ts` and the host invoke each with none, the context menu passes a URI to checkSelection which reads the editor instead |
| FEAT-4 | E | pass | one menu entry, `editor/context` when `editorHasSelection`, a context key in 1.101 |
| FEAT-5 | E | n/a | no keybindings since 2.4.0 |
| FEAT-6 | E | finding | every setting but one had a consumer test (INV-4); `robotsTxt.agent` did not: `scrape-le-broken-features-8` |
| FEAT-7 | E | pass | `config.test.ts` walks the manifest against `DEFAULT_CONFIG` |
| FEAT-8 | E | pass | `getConfiguration()` is read per check, per notification and per status-bar visibility change (live listener); `statusBar.test.ts` "follows the setting live"; the host `settings.test.ts` is absent here because no command reads a setting it keeps |
| FEAT-9 | E | pass | no `activationEvents`; the host infers them from the five commands and the provider; the host test activates by command |
| FEAT-10 | E | pass | `bun run package` lists `dist/extension.js`, `dist/mcp-server.js`, `node_modules/playwright-core/…`, `package.nls.*.json`, `l10n/bundle.l10n.*.json`, the icon; `test:e2e-vsix` drives the installed artefact |
| FEAT-11 | E | pass | `check-bundle.js` read: static require scan, runtime load with `vscode` stubbed, allow-list check |
| FEAT-12 | M | pass | `logs/probes/err19.log`: `analyze_robots_txt` answered a valid call (19), a schema violation (18, `isError`), a missing argument (17); the npm command line and the crate answered `scrape_le_check` and `scrape_le_doctor` the same way over loopback |
| FEAT-13 | M C | pass | `check-signature-parity.ts` (corpus), `check-differential.ts` (600 generated cases, both servers held open), `check-mcp-definition.ts` (schema), `check-cli-parity.ts` (162 commands, 46 requests, rendered) — each read; the differential generates outside the corpus |
| FEAT-14 | M | finding | `e2e-vsix.js` spawns the installed server as `provider.ts` builds it; no unit test drove the provider on either kind of host: `scrape-le-broken-features-5` |
| FEAT-15 | N | pass | `check:npm-package` and `check:cli-package` install from the tarballs; `bin`, `files`, versions agree |
| FEAT-16 | C | pass | every flag and exit code has a `contracts.rs` or `hazards.rs` test (INV-9); the binary was run over the loopback fixture servers and `logs/probes/` |
| FEAT-17 | all | finding | INV-10: `scrape-le-broken-features-1`, `-2`, `-3`, `-6`, `translations-3` |
| FEAT-18 | all | finding | `isRunningUnsandboxed` and `ConsoleMessage.timestamp` had no reader: `scrape-le-broken-features-4` |
| FEAT-19 | E | pass | `vitest.config.ts` uses `thresholds` (75/80/60/75), includes `src/**`, excludes tests, mocks, `src/cli/**` and `src/mcp/**` which have their own gates; `tsconfig.json` includes tests; README sections regenerated from a real run (`5723ae9`) |
| FEAT-20 | E | n/a | no skipped tests (BASE-8) |
| FEAT-21 | all | pass | `check-bundle.js` refuses a non-builtin require (read); `check-mcp-bundle.js` holds the 600 KB ceiling; `commit-lint.js` refuses a non-conventional subject (driven mid-pass: a malformed subject exits 1); `check-agent-files.py` refuses a drifted copy |
| FEAT-22 | all | finding | `robotstxt.test.ts` "should handle malformed robots.txt" and `index.test.ts` "should handle errors gracefully": `scrape-le-broken-features-7`, `-9` |
| FEAT-23 | all | pass | `policy-docs` greps `*.md` only; the forbidden sentences are about documents holding surfaces equal, and no source comment or test header carries one (`grep -rniE` over `src crate/src scripts` → none) |

## Step 3: Bugs

Re-read for this step: `src/detectors/*`, `src/scraper/*`, `src/utils/*`,
`src/ui/output.ts`, `src/commands/check.ts`, `src/mcp/tools.ts`,
`src/mcp/envelope.ts`, `src/cli/*`, `crate/src/**`, with their tests and
fixtures.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | empty content, empty path, empty URL, empty batch, empty signature file each have a test (`cases.json`, `url.json`, `hazards.rs`, `batch.rs`, `analyze.rs`) |
| BUG-2 | E | finding | `if (rt.crawlDelay)` hid a declared 0: `scrape-le-bugs-3`; the rest of the grep (`result.error \|\| 'Check failed'`, `config.robotsAgent \|\| undefined`) read against their domains, pass |
| BUG-3 | all | pass | `slice(0, 5)` for the disallowed list with "and N more"; `slice(0, -1)` on `$`; `extract_title` offsets tested with length-changing characters |
| BUG-4 | all | pass | BOM, CRLF, no trailing newline, lone CR, NUL, UTF-16 each in `hazards.rs` and `batch.rs`; `frames.test.ts` (both copies) |
| BUG-5 | all | pass | the only sort is `sort_unstable` on indices in a test; signature order is corpus order and part of parity |
| BUG-6 | all | pass | `url.ts` regexes timed on near-miss inputs of 2,000/4,000/8,000 characters: 0.48/0.82/1.64 ms, linear; no `g` pattern held across calls (`extract` is local) |
| BUG-7 | all | pass | `js_parse_float` ↔ `Number.parseFloat` pinned both ways; `jsNumber` saturates as `as i64` |
| BUG-8 | E | pass | screenshot path joined with `path.join`, absolute or workspace-relative; `convertUrlToFilename` tested |
| BUG-9 | E | pass | the casts are on `page.evaluate` results typed by the probe, and on the mock in tests |
| BUG-10 | E | finding | idle text and tooltip were duplicated in `check.ts` and `statusBar.ts`, folded into `scrape-le-race-conditions-1` |
| BUG-11 | all | finding | `scrape-le-broken-features-4` |
| BUG-12 | all | pass | every result is `Object.freeze`d; options are `readonly` |
| BUG-13 | E | finding | "reachable and scrapeable" over a report of blockers; "HTTP null"; a User-Agent naming 2.0: `scrape-le-bugs-1`, `-2`, `-4` |
| BUG-14 | all | n/a | no previews of sensitive values; the report quotes robots.txt rules, not secrets |
| BUG-15 | M C | finding | the probe fed both servers a `urls` entry of the wrong shape and both dropped it alike, agreement on a shared defect: `scrape-le-errors-6`. The 600-case differential and the 46-request parity run found no other disagreement |
| BUG-16 | C | pass | `overflow-checks = true` in release; `extract_title` uses `to_ascii_lowercase` for length; `try_from` on every cast; no recursion |
| BUG-17 | all | pass | each root invariant names its test; `crate/AGENTS.md` hard rules each named a test or a gate; the two added this pass (stderr, framing) name theirs |
| BUG-18 | M | pass | `byName` is a `Map`; `detected[signature.key]` is keyed by corpus keys, not caller text |
| BUG-19 | all | n/a | no format resolved from a filename |
| BUG-20 | all | n/a | no line command writes a document back |
| BUG-21 | M C | n/a | robots.txt has no refusing parser on either side; the differential pins agreement in both directions |

## Step 4: Errors

Re-read for this step: INV-7's files, every command, `src/__mocks__/vscode.ts`,
`src/mcp/transport.ts`, `src/mcp/tools.ts`, `src/cli/mcp.ts`, `src/cli/frames.ts`,
`crate/src/**`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | finding | INV-7: five catches read as clean (`errors-2`), one returned `''` (`errors-3`), one `.ok()?` (`errors-7`) |
| ERR-2 | E | finding | the entry points reached "None detected", "Not required" and "Not found, allowed" through failures: `scrape-le-errors-1`, `-2` |
| ERR-3 | M | pass | run, not read: `analyze_robots_txt` on garbage returns the empty rule set with `path` and `agent`, and a path without a slash carries a `robots` warning; RFC 9309 ignores a line without a directive, so the format has no malformed state (`broken-features-7` retitles the test) |
| ERR-4 | all | finding | "no URL was supplied" for `url: 7`; `Scrape-LE/2.0`: `scrape-le-errors-6`, `bugs-4` |
| ERR-5 | E | pass | `openExternal` and `clipboard.writeText` are awaited inside a try whose catch reports; `showTextDocument` is awaited under the guard; `executeCommand` for settings is awaited |
| ERR-6 | E | pass | the one `void` is `ratingPrompt.recordSuccess()`, which catches inside; `showManualInstallInstructions` chains `.then` with a catch |
| ERR-7 | E | pass | every handler is `guarded(...)`, held by `guard.test.ts` |
| ERR-8 | E | pass | `extractErrorMessage` narrows; `error instanceof Error ? … : l10n.t('Unknown error')` |
| ERR-9 | E N C | finding | the screenshot shortfall was in `console.error` or nowhere: `scrape-le-errors-3`, `-7` |
| ERR-10 | E | finding | `setup.ts` ×3 direct: `scrape-le-errors-4`; `install.ts` is the documented exception; `ratingPrompt.ts` bypasses on purpose (invariant) |
| ERR-11 | E | pass | a dismissed input box, quick pick or dialog returns quietly (`check.test.ts`, `setup.test.ts`, `install.test.ts`) |
| ERR-12 | E | finding | the mock could not fail the clipboard, the browser or the document: `scrape-le-errors-9` |
| ERR-13 | E | finding | six tests pinned swallowed failures, one asserted nothing: `errors-2`, `broken-features-9` |
| ERR-14 | M | finding | three servers, three wordings: `scrape-le-errors-5`. One deliberate divergence from this check stays: a wrong-typed tool argument is an `isError` result, not `-32602`, because `crate/SPEC.md` decides it ("a bad argument is a tool failure, not a protocol failure"); carried for the owner |
| ERR-15 | C | finding | a `eprintln!` on a closed stderr pipe is a panic: `scrape-le-errors-8`; the `expect`s left are on serialization of values the crate built |
| ERR-16 | N C | pass | `hazards.rs`: permission denied, symlink loop, FIFO, directory, long path, undecodable file each refused by name; the npm side matches by parity |
| ERR-17 | N E | pass | no `\|\| true`, no `continue-on-error`; the two `2>/dev/null` are in the policy grep shell with the exit code read |
| ERR-18 | E | pass | the status bar is set in `finally` after every way out; dismissed dialogs leave it idle |
| ERR-19 | M | finding | `logs/probes/err19.log`, 28 frames to three servers: `scrape-le-errors-5`; after the fix `err19-after.log` shows the same answers from all three |
| ERR-20 | N C | finding | added this pass: `scrape-le-errors-8` |

## Step 5: Memory leaks

Re-read for this step: `src/extension.ts`, INV-5's files, `src/mcp/transport.ts`,
`src/cli/frames.ts`, `src/cli/mcp.ts`, `crate/src/mcp/mod.rs`, `crate/src/batch.rs`,
`crate/src/fetch.rs`, `crate/src/render.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | finding | the output channel had no owner; the status bar's subscription held the bare item: `memory-leaks-1`, `memory-leaks-2` |
| LEAK-2 | E M | pass | one config listener, released by the subscription; the MCP server adds one `data` and one `drain` listener per process |
| LEAK-3 | E M | finding | the idle reset timer was untracked: `race-conditions-1`; the robots fetch timer skipped `clearTimeout` on rejection: `errors-1` |
| LEAK-4 | E | finding | `scrape-le-memory-leaks-1` |
| LEAK-5 | E | finding | dispose twice: `output.test.ts`, `lifecycle.test.ts`; the status bar's dispose did not run at deactivation: `memory-leaks-2` |
| LEAK-6 | E | finding | no lifecycle test: `scrape-le-memory-leaks-2` |
| LEAK-7 | all | pass | INV-5: every module-level value is bounded (one channel, one timer, the tool table); `RobotsCache` is one document per origin per run; the duplicate map one report per distinct URL |
| LEAK-8 | E | pass | the check result is logged and dropped; the rating prompt holds a count |
| LEAK-9 | E | pass | the browser and page are closed in `finally` on success, failure and throw (`checker.test.ts` "should close page even when…", `check.test.ts` "still closes the browser"); deactivation has no check in flight to close, which is the one path not driven |
| LEAK-10 | E | finding | no repeated-run test: `memory-leaks-2` ("fifty rounds of every command") |
| LEAK-11 | M N C | finding | the extension's server had the ceiling; the npm command line's and the crate's read a 16 MiB frame whole (`err19.log`, frame 20): `scrape-le-errors-5` |
| LEAK-12 | M N C | pass | `logs/probes/memory.log`, 3,000 `analyze_robots_txt` calls one in flight at a time: extension server 57→59 MB flat from 1,000; npm command line 66→76 MB flat from 2,500; crate 11 MB flat throughout |
| LEAK-13 | M N C | pass | `platform.rs` closes stdin at once and reads exit 0; the probe's servers all exited 0 when stdin closed |
| LEAK-14 | C | pass | `hazards.rs` 1 MiB line and 100,000 lines; `budget.rs` 500 documents and 2,000 rules inside their ceilings (`logs/baseline/budget.log`) |
| LEAK-15 | C | pass | symlink loop refused (`hazards.rs`); no traversal otherwise |
| LEAK-16 | C | pass | threads are scoped; the browser is dropped at the end of `render`; the screenshot file is the deliverable |
| LEAK-17 | tests | finding | the shuffled run failed on the shared channel: `memory-leaks-1`; three runs and a seeded shuffle green after |

## Step 6: Race conditions

Re-read for this step: INV-6's files, `src/extension.ts`, `src/ui/statusBar.ts`,
`src/ui/output.ts`, `src/mcp/transport.ts`, `crate/src/batch.rs`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | pass | INV-6: nothing read before an await is reused after it except the URL, which is immutable |
| RACE-2 | E | n/a | no command writes a document |
| RACE-3 | E | finding | two checks at once, driven with a hand-resolved checker: the first's timer reset the second's status: `scrape-le-race-conditions-1`. Policy: both run, the item shows the latest event, one reset pends at most |
| RACE-4 | E | pass | the module-level channel and the timer each have one writer path, no await between read and write |
| RACE-5 | E | pass | the rating ask is written to `globalState` before the toast is awaited (`ratingPrompt.test.ts`) |
| RACE-6 | E | n/a | `cancellable: false`; no token |
| RACE-7 | E | pass | `getConfiguration()` is read once per check before any await |
| RACE-8 | E | finding | the reset timer ran after deactivation: `race-conditions-1`, `memory-leaks-2` |
| RACE-9 | E | pass | `activate` registers the channel release, the status bar (bound to `scrape-le.checkUrl`, registered next), the commands, then the provider |
| RACE-10 | E | pass | the report lists detections in a fixed order; the crate streams reports with an `index` by design |
| RACE-11 | E C | n/a | no file listing then read; the screenshot directory is created before the write |
| RACE-12 | M | pass | `mcp.test.ts` splits a request across chunks and sends two in one; `frames.test.ts` splits inside a frame; the crate reads in 8 KiB chunks in its tests |
| RACE-13 | M | pass | each reply carries its own id; the extension's handlers are stateless; the crate's and npm's serve one request at a time in order |
| RACE-14 | M | pass | `platform.rs` closes stdin at once; the npm server ends the loop on end-of-stream with nothing partial written |
| RACE-15 | C | pass | `batch.rs` scoped threads over a queue and a `Mutex`ed map; replies go through one channel to one writer; `same_host_urls_never_run_concurrently` |
| RACE-16 | C | pass | `platform.rs` TZ compare and the `tz-compare` gate; hash maps are never iterated into output |
| RACE-17 | tests | finding | three runs green, the shuffled run red on `check.test.ts` (seed 1792990054363): `memory-leaks-1`; green after. Real timers: none in the suite; the fake-timer tests are the status bar's |
| RACE-18 | E | n/a | no watcher, no debounce |

## Step 7: Translations

Read in full: `package.json`, `package.nls.json`, twelve `src/i18n/package.nls.*.json`,
`l10n/bundle.l10n.json`, twelve `l10n/bundle.l10n.*.json`,
`test/integration/l10n.test.ts`, `.vscodeignore`, the `copy:i18n` and `clean:i18n`
scripts. Every value in every locale was read: 33 runtime keys and 31 manifest
keys per locale at baseline, 56 and 32 at close.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-1 | E | pass | the diff of `%key%` against `package.nls.json` is empty; `nls-parity.test.ts` holds it |
| L10N-2 | E | pass | both loops print no DRIFT; `nls-parity.test.ts` and `l10n.test.ts` hold both mechanisms |
| L10N-3 | E | pass | twelve locales in both; `check:locales ../` from the site |
| L10N-4 | E | finding | `Retrying as {0}...` in source, not in the bundle: `scrape-le-translations-1`; `src/l10n.test.ts` now holds the two sets equal |
| L10N-5 | E | finding | 24 literals handed to the status bar, the notifier, a progress report or a dialog: `scrape-le-translations-1`. Deliberately not translated: `$(globe) Scrape-LE`, `HTTP {n}`, `robots.txt`, the setup quick pick's three codicon labels, and the output-channel report and help document (carried) |
| L10N-6 | E | pass | no call at module scope (`src/l10n.test.ts` "never calls l10n.t() at module scope"); the status bar's idle tooltip moved inside the function |
| L10N-7 | E | pass | every call hands a literal (`src/l10n.test.ts`) |
| L10N-8 | E | pass | the VSIX listing carries 12 `package.nls.*.json` and 12 `l10n/bundle.l10n.*.json`; `clean:i18n` left none in the tree |
| L10N-9 | E | finding | no host ran in any locale but English: `scrape-le-translations-2` adds the German launches; the runtime-string half is carried (below) |
| L10N-10 | E | pass | every locale's placeholders equal the source's (script in the pass log; the integration test holds it) |
| L10N-11 | E | pass | no value identical to English in any runtime bundle; in the manifest, `Scrape-LE` (the category) only |
| L10N-12 | E | pass | codicons, `Chromium`, `Scrape-LE`, `robots.txt`, `User-agent: *`, `X-RateLimit-*`, `PNG`/`JPEG`, `VS Code` intact in every locale (grep per token) |
| L10N-13 | E | finding | 38 values did not fit their place: `scrape-le-translations-3` (the list is in the CHANGELOG entry and the commit) |
| L10N-14 | E | finding | Korean `크롬ium` half transliterated; Indonesian `Kompresi lossy`; Ukrainian `настройка`: in `translations-3` |
| L10N-15 | E | pass | `{0} console error(s)` read in each locale for 0, 1 and many; Japanese, Korean and Chinese carry no plural |
| L10N-16 | E | finding | Korean `크로미움`/`Chromium`, Indonesian `peramban`/`browser` mixed within one locale: in `translations-3` |
| L10N-17 | E | pass | dialog labels bound and compared by reference (`install.ts`); the setup quick pick compares `action`, not `label` |
| L10N-18 | all | pass | the output-channel report, the MCP replies, the CLI output and the crate are English and stable across locales; the repo documents the first as the thing users paste |
| L10N-19 | C M | pass | the crate, the npm command line and both MCP servers produce no localized text (`grep -rn l10n src/cli src/mcp crate/src` → none) |

## Findings

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| scrape-le-broken-features-1 | broken-features | README: agent groups "ignored" with the `robotsTxt.agent` setting live; that setting missing from the table; `## Detections` glued to a paragraph; "over a whole tree" | read against `package.json` and the code | `8dc109b` | none: documentation; `check:doc-paths` from the site | n/a |
| scrape-le-broken-features-2 | broken-features | SPEC named `texting_robots`, never a dependency; `mcp.rs` for `mcp/`; an example finding nothing emits and no `robots` object; crate AGENTS named `mcp.rs` | read against `Cargo.toml` and `check.rs` | `e14892e` | none: documentation; `policy-docs` and `check-agent-files.py` | n/a |
| scrape-le-broken-features-3 | broken-features | help page listed four of five vendors and an unpinned install command | read against the corpus and `install.ts` | `486a20b` | `help.test.ts` "names every vendor in the corpus and the pinned install command" | `expected … to contain 'PerimeterX'` |
| scrape-le-broken-features-4 | broken-features | `isRunningUnsandboxed` and `ConsoleMessage.timestamp` had no reader | `fail/broken-features-4.log` (grep) | `980370c` | removed; the suite, typecheck and parity green | n/a |
| scrape-le-broken-features-5 | broken-features | the MCP provider ran in no unit test on either kind of host; the mock had no `lm` | read | `df46341` | `provider.test.ts` ×2 | test-gap |
| scrape-le-broken-features-6 | broken-features | README testing section stale; `coverage:readme:check` red at baseline | the gate's output | `5723ae9`, `4850b23` | `coverage:readme:check` | exit 1 |
| scrape-le-broken-features-7 | broken-features | "should handle malformed robots.txt" asserted a "safe default when parsing fails" on a parser with no failing path; the goldens' header listed four fixed bugs as current | read | `7fd5042` | `robotstxt.test.ts` "reads a file with no directives as an empty rule set" | retitled; passes on the same code |
| scrape-le-broken-features-8 | broken-features | `robotsTxt.agent` had no consumer test | INV-4 | `a7ae5fc` | `check.test.ts` "passes the configured robots.txt agent", `index.test.ts` "evaluates robots.txt as the configured agent" | test-gap |
| scrape-le-broken-features-9 | broken-features | `index.test.ts` "should handle errors gracefully" asserted only that a result came back | read | `680fd4b` | "records every detection whose probe threw" | test-gap |
| scrape-le-bugs-1 | bugs | "✓ Page is reachable and scrapeable" shown over anti-bot, auth, robots and 403 findings | `fail/bugs-1.log` | `ade1b43` | `check.test.ts` "names what the detections found…", "says nothing was found only when…" | `expected '✓ Page is reachable and scrapeable' to contain 'nothing found would block a scraper'` |
| scrape-le-bugs-2 | bugs | "HTTP null" in the tooltip, "Status Code: null" in the report | `fail/bugs-2.log` | `e54e932` | `check.test.ts`, `output.test.ts` | `expected 'Example - HTTP null' to be 'Example'` |
| scrape-le-bugs-3 | bugs | `Crawl-delay: 0` left out of the report | `fail/bugs-3.log` | `ab96953` | `output.test.ts` "prints a declared Crawl-delay of 0" | `expected … to contain 'Crawl Delay: 0s'` |
| scrape-le-bugs-4 | bugs | robots.txt User-Agent `Scrape-LE/2.0`, two minors stale | `fail/bugs-4.log` | `05e50ff` | `robotstxt.test.ts` "identifies itself without a version" | `expected 'Scrape-LE/2.0 (VS Code Extension)' to be …` |
| scrape-le-errors-1 | errors | a 5xx, timeout or network failure on robots.txt read as "Not found", crawling allowed, against RFC 9309 §2.3.1.4 and the other two surfaces | `fail/errors-1.log` | `735b5b4` | `robotstxt.test.ts` 403, 503, failed fetch; `output.test.ts`; goldens | `expected true to be false` ×2, the channel text |
| scrape-le-errors-2 | errors | anti-bot and authentication probes that threw read as "None detected" / "Not required" | `fail/errors-2.log` | `5194a0b` | six tests titled "cannot run" in `antibot.test.ts`, `authentication.test.ts` | `promise resolved … instead of rejecting` ×6 |
| scrape-le-errors-3 | errors | a screenshot that could not be written left no line and said nothing (`E`) | `fail/errors-3.log` | `f654e77` | `checker.test.ts`, `output.test.ts` | `expected '' to be undefined`, the channel text |
| scrape-le-errors-4 | errors | Setup Browser's results bypassed the notifier | `fail/errors-4.log` | `4ec76e2` | `setup.test.ts` "reports its results through the notifier" | `expected [ … ] to have a length of +0 but got 2` |
| scrape-le-errors-5 | errors | three servers, three behaviours on a malformed frame; no frame limit on two | `logs/probes/err19.log`; `fail/errors-5.log` (17 tests) | `fae127b` | `mcp.test.ts`, `cli.test.ts`, `frames.test.ts`, crate `mcp::tests` ×8, `check:cli-pipes` | 17 red, `frames(...) is not a function` |
| scrape-le-errors-6 | errors | a `urls` entry of the wrong shape dropped, `url: 7` "not supplied", on both command-line surfaces | `err19.log` frames 24, 25; `fail/errors-6.log` | `dc1eb8b` | crate `a_wrong_shaped_url_entry_is_named_not_dropped`; `cli.test.ts`; parity +3 requests | `expected … to contain '"text":"entry 1 of urls is not a string"'` |
| scrape-le-errors-7 | errors | a screenshot that could not be written said nothing (`N` `C`) | `fail/errors-7.log` | `35cb695`, `4cd3f55` | crate `a_screenshot_that_cannot_be_written_says_why`, `…is_said_on_stderr`; `cli.test.ts` "says why a screenshot could not be written" | `missing field screenshot_error`; `expected … to contain '  shot    could not be written…'` |
| scrape-le-errors-8 | errors | `eprintln!` on a closed stderr pipe panicked: exit 101 | `fail/errors-8.log`; the pipe checker's `big` cases | `c068bed` | `contracts.rs` `a_closed_stderr_is_survived_not_a_panic` | `left: Some(101) right: Some(2)` |
| scrape-le-errors-9 | errors | the mock could not fail the clipboard, the browser or the document; three catches untested | `fail/errors-9.log` | `4d9e9b8` | `install.test.ts` ×3, `help.test.ts` ×1 | `_setClipboardError is not a function` ×3 |
| scrape-le-memory-leaks-1 | memory-leaks | the output channel had no owner; the suite depended on its order | `fail/memory-leaks-1.log`, the seeded shuffle | `8ebd49d` | `output.test.ts` "output channel lifetime"; the seeded shuffle | 6 red, then 5 red shuffled |
| scrape-le-memory-leaks-2 | memory-leaks | no test disposed everything and asserted; the status bar's reset survived deactivation | `fail/memory-leaks-2.log` | `bc88ad5` | `lifecycle.test.ts` ×3 | `expected 1 to be +0` (a timer alive after deactivation) |
| scrape-le-race-conditions-1 | race-conditions | a check started in another's cooldown was reset under it; the timer outlived deactivation | `fail/race-conditions-1.log` | `cef1471` | `statusBar.test.ts` "the idle reset" ×4; `check.test.ts` two-at-once | `expected '$(globe) Scrape-LE' to contain 'Reachable (77ms)'` |
| scrape-le-translations-1 | translations | 24 runtime strings English in every locale; one source string with no key | `fail/translations-1.log` | `c01e025` | `src/l10n.test.ts` ×7 | 3 red: 13 missing, 1 dead, 1 literal |
| scrape-le-translations-2 | translations | no host ran in any locale but English | read | `84606f7` | `test/locale/german-host.test.ts` ×3, `test/locale-setup/…` ×1 | test-gap |
| scrape-le-translations-3 | translations | 38 catalogue values did not fit their place; Perimeter81 in all thirteen manifest catalogues; the virtual-workspace capability reused the untrusted-workspace text | `fail/translations-3.log` | `58c3aec` | `nls-parity.test.ts` "names every vendor the signatures detect"; the corrected catalogues | `expected … to contain 'PerimeterX'` |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| L10N-9, the runtime half | a German host shows activation, the commands and the bundle's path, but no runtime string: the extension writes no document and returns no value that carries one | a command that returns its result, or a localized help document, by the owner's choice |
| L10N-5 / L10N-18, the report | the output-channel report and the help document are English in every locale | an owner decision: the report is what users paste into issues, and localizing it is 50 strings by twelve |
| ERR-14, wrong-typed arguments | `maxResults: "5"` and `agent: 7` are `isError` results, not `-32602`, on all three servers, as `crate/SPEC.md` decides; the fleet check reads the MCP specification the other way | an owner decision, then the same change on both servers and the fixture |
| ERR-14, `additionalProperties: false` | all three servers accept an argument the schema does not declare | an owner decision on refusing unknown arguments |
| `check:cli-pipes`, the command-line cases | the gate runs `--mcp-only` because the `big` cases resolve a host; run by hand, the rust and node summaries differ on a closed stdout during a rendered DNS failure (rust prints the render fallback and the DNS failure, node prints the pipe refusal) | a loopback variant of those cases in the shared script |
| `ensureBrowserInstalled` | every check launches and closes a browser to see that one exists, then launches the one it uses | letting the check's own launch answer, with the install prompt on its failure |
| authentication by 403 | the report says "Required" with no `type`; 403 is not always a login wall | an owner decision on wording |
| `cli-parity` on CI | the rendered parity run is timing-sensitive on the runners: red once here on a `wait_until_navigated` timeout for `/redirect-login` (crate side), and three times on `main` in the ten days before on whether a favicon 404 lands in `console_errors`; each green on a rerun | a settle in the fixture server (serve a favicon) and a navigation wait that tolerates a redirect's second event, as their own change |
| CLOSE-5, `check:fleet` | `src/cli/output.ts` drifts: envsync-le's `stdout` returns the stream's boolean for backpressure (nolindnaidoo/envsync-le#58), the other 15 return nothing. Red on the site's `main` before this pass | the backpressure change copied to the fifteen as its own fleet change, or an exception in `check-fleet.ts` |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | every check above has an answer; no `not done`, no `unknown` |
| CLOSE-2 | pass | 28 findings fixed with commit and test; 9 items carried above |
| CLOSE-3 | pass | `fail/*.log` for every fix; the test-gap rows say so |
| CLOSE-4 | pass | the Final column above, from `gates.sh final` after `cargo clean -p scrape-le` on `680fd4b`, then `coverage:readme:check` and `lint:commits` again on `4850b23` |
| CLOSE-5 | see note | from `letools-site`: `check:locales ../` (every string in its own language across 16), `check:doc-paths ../` (941 references resolve), `check:registry` and `verify` green. `check:fleet ../` is red on `src/cli/output.ts`, envsync-le differing from the other 15: its `stdout` answers the stream's own boolean since nolindnaidoo/envsync-le#58 (write backpressure). Red on the site's `main` before this branch and not scrape-le's; carried below |
| CLOSE-6 | pass | CHANGELOG lines for every behaviour change in both changelogs; invariants in both AGENTS files; README regenerated by its script |
| CLOSE-7 | pass | `git log main..HEAD --format='%ae %s'`: 30 commits, all the noreply address; `lint:commits` 30 conform; the diff holds no probe, log or scratch file |
| CLOSE-8 | pass | [nolindnaidoo/scrape-le#59](https://github.com/nolindnaidoo/scrape-le/pull/59): the findings table, the carried list, what was verified; no attribution |
| CLOSE-9 | pass | Every check on the pull request green at `4cd3f55`: `ci.yml` on three operating systems, `ci-crate.yml` test, hazards, platform, scenarios and cli-parity on three, budget, fuzz, msrv, coverage, differential, parity, commit messages, one version, versions and registry identity, audit, CodeQL. The first run was red twice: the Windows unit leg on the new screenshot test, which pinned the Unix wording of a missing directory (`4cd3f55` holds the shape instead), and cli-parity on macOS, where the crate's `wait_until_navigated` on `/redirect-login` timed out under the runner and fell back to HTTP evidence while the npm side rendered; green on the rerun with no change, and carried below |
| CLOSE-10 | pass | the ledger row and this record in one `letools-site` change |
| CLOSE-11 | pass | `errors.md` gains ERR-20 and an ERR-3 sentence; `memory-leaks.md` LEAK-1, `translations.md` L10N-9 and `broken-features.md` FEAT-17 each gain a sentence; the hunt table is unchanged, every hunt check having found something here; "Six passes" |
