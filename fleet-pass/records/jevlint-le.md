# Fleet pass record: jevlint-le

| | |
|---|---|
| Repo | `jevlint-le` |
| Branch | `fix/fleet-pass` |
| Baseline commit | `84dc063cf576f57bfacad3e18432dfd5b8537c20` |
| Started | 2026-10-13 |
| Pull request | [nolindnaidoo/jevlint-le#30](https://github.com/nolindnaidoo/jevlint-le/pull/30) |

This repo is in `OUTSIDE_FLEET`, not `REPOS`. It has no crate (`C`) surface
and no translations, both by decision (AGENTS.md, "Not done"). Surfaces present:
`E` extension, `M` MCP server (`src/cli/mcp.ts`, shipped in `dist/cli.js` and as
`jevlint-le-mcp`), `N` two npm packages (`npm/`, `mcp/`), and a command line
(`src/cli/`) that this record treats under `N` and `M`. The `C` checks are `n/a`
with that reason and are not repeated per row.

## Step 0: Baseline

Files read in full for this step: `AGENTS.md`, `CLAUDE.md`, `package.json`,
`vitest.config.ts`, `.vscode-test.mjs`, `.github/workflows/ci.yml`,
`.github/workflows/release.yml`, `.github/workflows/codeql.yml`,
`.github/workflows/dependabot-auto-merge.yml`, `.github/workflows/jev-release.yml`.
There is no `crate/`.

| Check | Answer | Evidence |
|---|---|---|
| BASE-1 | pass | `git status --porcelain` printed nothing. `git status -sb` printed `## main...origin/main`. |
| BASE-2 | pass | `git config user.email` inside the repo printed `13629544+nolindnaidoo@users.noreply.github.com`. |
| BASE-3 | pass | `git switch -c fix/fleet-pass` from `main`. `git rev-parse HEAD` = `84dc063cf576f57bfacad3e18432dfd5b8537c20`. |
| BASE-4 | pass | Gate list below is every `run:` step in the five workflows plus every `package.json` script. |
| BASE-5 | pass | Every row below has an exit code. No failures. |
| BASE-6 | pass | No failures at baseline, so no finding from this step. |
| BASE-7 | pass | Per-file table below. |
| BASE-8 | pass | `grep -rnE '\b(it\|test\|describe)\.(skip\|todo\|only)\b\|\bxit\(\|\bxdescribe\(' src test` printed nothing (exit 1). No `crate/`. |

Gate results, one row per command from BASE-4. `Baseline` is the exit code on
`84dc063` before any code was read. Final is `105c152`, the branch head: the release commit `66e275d` (`chore(release): 0.8.1`) followed by one test fix made after CI (`test(docs): take a file's name with the platform's separator`). The whole list was run by one script on each of the two heads, each gate unpiped into its own log (`scratchpad/gates-final/`, `scratchpad/gates-final-2/`), and every gate was exit 0 both times.

| Surface | Command | Source | Baseline | Final | Notes |
|---|---|---|---|---|---|
| all | `bun install --frozen-lockfile` | ci.yml, release.yml | 0 | 0 | 340 installs, no changes |
| E | `bun run lint` | ci.yml, release.yml | 0 | 0 | 97 files at baseline, 104 at the release head |
| E | `bun run typecheck` | ci.yml, release.yml | 0 | 0 | |
| E M N | `bun run test:coverage` | ci.yml, release.yml | 0 | 0 | Baseline 29 files, 825 tests; stmts 93.86, branches 89.26, funcs 93.91, lines 95.97. Final 33 files, 911 tests; 94.32, 89.32, 94.86, 96.43 |
| E | `bun run build` | ci.yml | 0 | 0 | dist/extension.js 223.5kb, dist/cli.js 255.7kb at baseline; 227.2kb and 262.5kb at the release head |
| N M | `bun run test:cli` | ci.yml, release.yml | 0 | 0 | `COMMAND-LINE TEST: PASS`. Linux-only in CI, ran here on macOS |
| E | `bun run package` | ci.yml, release.yml | 0 | 0 | `release/jevlint-le-0.8.0.vsix` (13 files, 130.72 KB) at baseline; `jevlint-le-0.8.1.vsix` (13 files, 133.73 KB) at the release head. `release/` also held six older VSIXs from earlier local builds, gitignored |
| E | `bun run test:integration` | ci.yml, release.yml | 0 | 0 | 21 passing (11s) at baseline, 21 passing (12s) at the release head, on VS Code 1.141.0 |
| E | `bun run test:e2e-vsix` | ci.yml, release.yml | 0 | 0 | `INSTALLED-VSIX TEST: PASS` for `jevlint-le-0.8.0.vsix` at baseline and `jevlint-le-0.8.1.vsix` at the release head. Linux-only in CI, ran here on macOS |
| all | `node scripts/commit-lint.js --range …` (`bun run lint:commits`) | ci.yml | 0 | 0 | `0 commit(s) conform` at baseline, `21 commit(s) conform` at the release head, `22` at the branch head |
| N M | versions job shell script (ci.yml `Versions and registry identity agree`) | ci.yml | 0 | 0 | ext=npm=mcp=server.json (both fields)=0.8.0 at baseline, 0.8.1 at the release head; mcpName `io.github.nolindnaidoo/jevlint-le`, identifier `jevlint-le-mcp` |
| all | changelog heading `## <version> — YYYY-MM-DD` | release.yml preflight | 0 | 0 | `3:## 0.8.0 — 2026-10-12` at baseline, `3:## 0.8.1 — 2026-10-14` at the release head |
| N | `npm view <pkg>@<version> version` republish refusal | release.yml npm job | n/a | | Both `jevlint-le@0.8.0` and `jevlint-le-mcp@0.8.0` are published, so the CI step would refuse. Correct for a released version, not a defect |
| all | `bun run check:jev-release` | jev-release.yml | 0 | 0 | `jev-latest points to the version this repo declares.` One network read of the vendor models page |
| all | `bun run docs:rules` then `git status --porcelain docs/` | package.json | 0 | 0 | 37 pages, no diff |
| all | `bun run validate -- --dry-run` | package.json, AGENTS.md | 0 | 0 | `Dry run: 122 calls would be made. Nothing was sent.` |
| E | `bun run build:prod` | via `package` | 0 | 0 | |
| N | `bun run build:npm` | via `test:cli` | 0 | 0 | |
| all | `bun run prepare` / `hooks:install` | via `bun install` | 0 | 0 | |
| — | `bun run lint:fix`, `bun run cli`, `bun run test:watch`, `bun run test` | package.json | not run here | | `lint:fix` mutates, `cli` is `build:npm` plus a run, `test:watch` is interactive, `test` is `test:coverage` without the report |
| — | `bun run validate` without `--dry-run` | package.json | not run here | | Sends to TypeSafe with a key. Metered |
| — | `actions/dependency-review-action` | ci.yml | not run here | | GitHub-hosted action, PR only |
| — | `vsce publish`, `ovsx publish`, `npm publish`, `mcp-publisher` | release.yml | not run here | | Publishing. Not part of a pass |
| — | CodeQL analyze (javascript-typescript, actions) | codeql.yml | not run here | | GitHub-hosted |
| — | dependabot-auto-merge steps | dependabot-auto-merge.yml | not run here | | Needs a Dependabot PR and `GITHUB_TOKEN` |
| — | Windows and the Linux `xvfb-run` legs | ci.yml | not run here | | macOS only here. CI on the pull request covers them |

BASE-7, from `coverage/coverage-summary.json`. Floors are
`vitest.config.ts` thresholds: lines 75, functions 80, branches 60, statements 75.

| File | Below floor or zero |
|---|---|
| `src/lib.ts` | 0% lines, functions, statements |
| `src/cli/main.ts` | 0% on every metric |
| `src/cli/mcpMain.ts` | 0% on every metric |
| `src/extraction/embedded.ts` | functions 77.77 |
| `src/extraction/goReader.ts` | functions 66.66 |
| `src/services/projectConfigs.ts` | functions 75 |
| `src/ui/notifier.ts` | functions 75 |

The three 0% files are process entry points that `scripts/e2e-cli.js` runs as
processes outside vitest. Inputs to steps 2 and 4.

## Step 1: Inventory


Files read in full for this step, beyond those in Step 0: every file in the
manifest below, plus `README.md`, `SPEC.md`, `CHANGELOG.md`, `mcp/README.md`,
`npm/README.md`, `docs/rules/README.md`, `.cursorrules`, `.clinerules`,
`.windsurfrules`, `GEMINI.md`, `.cursor/rules/project.mdc`,
`.github/copilot-instructions.md`, `.editorconfig`, `.gitattributes`,
`.githooks/commit-msg`, `.github/codeql-config.yml`, `.github/dependabot.yml`,
`LICENSE`, `.gitignore`, `.vscodeignore`, `biome.json`, `tsconfig.json`,
`tsconfig.it.json`, `.vscode/launch.json`, `.vscode/tasks.json`, `action.yml`,
`.pre-commit-hooks.yaml`, `schemas/*.json`, `snippets/*.json`, `samples/*`
(every file, `samples/bun.lock` included), `assets/demo/*`,
`assets/demo-cli.tape`, and every file under `fixtures/` (the four README files,
`rule-examples.json`, `corpus/*.json`, `public-sample*/labels.json`,
`public-sample-3/reviews.json`, `validation/*.json`), read entry by entry with
`jq -c '.[]'` where a file is one JSON array.

Not read line by line: `bun.lock` (893 lines, generated; held by
`bun install --frozen-lockfile` at BASE-4), `assets/demo.gif` and
`assets/demo-cli.gif` (binary), and the 36 pages `docs/rules/JEV*.md`, which
`bun run docs:rules` regenerates from `src/docs/rulePages.ts` and
`fixtures/rule-examples.json` with an empty diff at BASE-4, and which
`src/docs/rulePages.test.ts` holds to that generator. The generator, the
fixture and the test were read in full.

### INV-1 read manifest

`git ls-files -- src test scripts mcp npm package.json server.json | grep -vE
'__fixtures__|__snapshots__|/assets/|^src/i18n/' | xargs wc -l`. The filter
dropped nothing: this repo has none of those directories. `npm/` is added to
the roots because this repo ships a second package from it.

| Read | Lines | File |
|---|---|---|
| [x] | 123 | mcp/README.md |
| [x] | 58 | mcp/package.json |
| [x] | 161 | npm/README.md |
| [x] | 63 | npm/package.json |
| [x] | 297 | package.json |
| [x] | 49 | scripts/build-npm.js |
| [x] | 16 | scripts/build-rule-docs.ts |
| [x] | 195 | scripts/calibrate-reviews.ts |
| [x] | 135 | scripts/check-agent-files.py |
| [x] | 20 | scripts/check-jev-release.ts |
| [x] | 182 | scripts/commit-lint.js |
| [x] | 182 | scripts/draw-public-sample.ts |
| [x] | 196 | scripts/e2e-cli.js |
| [x] | 211 | scripts/e2e-vsix.js |
| [x] | 27 | scripts/install-hooks.js |
| [x] | 139 | scripts/record-editor-demo.mjs |
| [x] | 90 | scripts/score-public-sample.ts |
| [x] | 256 | scripts/validate-defects.ts |
| [x] | 33 | server.json |
| [x] | 396 | src/__mocks__/vscode.ts |
| [x] | 62 | src/agent-files.test.ts |
| [x] | 271 | src/cli/args.ts |
| [x] | 1916 | src/cli/cli.test.ts |
| [x] | 88 | src/cli/dotenv.test.ts |
| [x] | 61 | src/cli/dotenv.ts |
| [x] | 102 | src/cli/files.ts |
| [x] | 452 | src/cli/format.ts |
| [x] | 159 | src/cli/jev.ts |
| [x] | 81 | src/cli/main.ts |
| [x] | 985 | src/cli/mcp.ts |
| [x] | 73 | src/cli/mcpMain.ts |
| [x] | 57 | src/cli/reader-failure.test.ts |
| [x] | 498 | src/cli/run.ts |
| [x] | 202 | src/commands/index.ts |
| [x] | 319 | src/commands/jev.ts |
| [x] | 224 | src/commands/probe.ts |
| [x] | 140 | src/config/config.ts |
| [x] | 77 | src/config/installed.test.ts |
| [x] | 58 | src/config/installed.ts |
| [x] | 187 | src/config/projectConfig.test.ts |
| [x] | 233 | src/config/projectConfig.ts |
| [x] | 93 | src/docs/rulePages.test.ts |
| [x] | 196 | src/docs/rulePages.ts |
| [x] | 1735 | src/extension.test.ts |
| [x] | 166 | src/extension.ts |
| [x] | 185 | src/extraction/bindings.test.ts |
| [x] | 261 | src/extraction/bindings.ts |
| [x] | 262 | src/extraction/braceReader.test.ts |
| [x] | 494 | src/extraction/braceReader.ts |
| [x] | 49 | src/extraction/cursor.ts |
| [x] | 209 | src/extraction/dialects.test.ts |
| [x] | 69 | src/extraction/embedded.ts |
| [x] | 165 | src/extraction/functions.ts |
| [x] | 141 | src/extraction/goReader.ts |
| [x] | 69 | src/extraction/goTokens.ts |
| [x] | 79 | src/extraction/lexKit.ts |
| [x] | 304 | src/extraction/pythonReader.test.ts |
| [x] | 604 | src/extraction/pythonReader.ts |
| [x] | 153 | src/extraction/pythonTokens.ts |
| [x] | 148 | src/extraction/reader.test.ts |
| [x] | 443 | src/extraction/reader.ts |
| [x] | 549 | src/extraction/requests.ts |
| [x] | 236 | src/extraction/rustReader.ts |
| [x] | 88 | src/extraction/rustTokens.ts |
| [x] | 94 | src/extraction/slots.ts |
| [x] | 250 | src/extraction/tokens.ts |
| [x] | 129 | src/extraction/wrappers.test.ts |
| [x] | 162 | src/extraction/wrappers.ts |
| [x] | 178 | src/jev/client.test.ts |
| [x] | 171 | src/jev/client.ts |
| [x] | 55 | src/jev/literal.ts |
| [x] | 52 | src/jev/pin.test.ts |
| [x] | 153 | src/jev/probe.test.ts |
| [x] | 272 | src/jev/probe.ts |
| [x] | 150 | src/jev/provider.test.ts |
| [x] | 133 | src/jev/provider.ts |
| [x] | 57 | src/jev/released.test.ts |
| [x] | 52 | src/jev/released.ts |
| [x] | 338 | src/jev/review.ts |
| [x] | 384 | src/jev/reviews.test.ts |
| [x] | 389 | src/jev/reviews.ts |
| [x] | 32 | src/lib.ts |
| [x] | 439 | src/lint/checks.ts |
| [x] | 94 | src/lint/corpus.test.ts |
| [x] | 70 | src/lint/finding.ts |
| [x] | 250 | src/lint/fix.ts |
| [x] | 86 | src/lint/fixAll.test.ts |
| [x] | 63 | src/lint/fixAll.ts |
| [x] | 206 | src/lint/lexicon.ts |
| [x] | 49 | src/lint/limits.ts |
| [x] | 1000 | src/lint/lint.test.ts |
| [x] | 327 | src/lint/lint.ts |
| [x] | 245 | src/lint/optionChecks.ts |
| [x] | 47 | src/lint/rules.test.ts |
| [x] | 338 | src/lint/rules.ts |
| [x] | 120 | src/lint/suppress.ts |
| [x] | 60 | src/lint/validation.test.ts |
| [x] | 347 | src/lint/wording.test.ts |
| [x] | 299 | src/lint/wordingChecks.ts |
| [x] | 39 | src/services/diskDocument.test.ts |
| [x] | 56 | src/services/diskDocument.ts |
| [x] | 121 | src/services/engines.ts |
| [x] | 28 | src/services/installedCopies.ts |
| [x] | 79 | src/services/linter-failure.test.ts |
| [x] | 174 | src/services/linter.ts |
| [x] | 25 | src/services/loadModule.test.ts |
| [x] | 13 | src/services/loadModule.ts |
| [x] | 40 | src/services/mcpProvider.ts |
| [x] | 71 | src/services/projectConfigs.ts |
| [x] | 135 | src/services/reviewer.ts |
| [x] | 229 | src/types.ts |
| [x] | 167 | src/ui/codeActions.ts |
| [x] | 49 | src/ui/diagnostics.ts |
| [x] | 50 | src/ui/notifier.ts |
| [x] | 59 | src/ui/statusBar.ts |
| [x] | 415 | test/integration/extension.test.ts |
| | 24613 | total |

### INV-2 manifest contributions

`jq '.contributes | keys'` = `commands`, `configuration`, `jsonValidation`,
`mcpServerDefinitionProviders`, `menus`, `snippets`. No `keybindings`, no
`l10n`, no `languages`, no `views`. `main` = `./dist/extension.js`.
`engines.vscode` = `^1.101.0`, `engines.node` = `>=20.0.0`. `activationEvents`:
`onLanguage:` for json, jsonc, javascript, javascriptreact, typescript,
typescriptreact, python, rust, go (nine, equal to the linter service's
`LANGUAGES` and to the one `when` clause below).

Commands (eight, category `JevLint-LE`, none with `enablement`):

| Id | Title |
|---|---|
| `jevlint-le.lintFile` | Lint Jev Questions in This File |
| `jevlint-le.lintWorkspace` | Lint Jev Questions in the Workspace |
| `jevlint-le.openSettings` | Open Settings |
| `jevlint-le.checkWithJev` | Check This File with Jev (uses your API key) |
| `jevlint-le.setApiKey` | Set TypeSafe API Key |
| `jevlint-le.setOpenAIApiKey` | Set OpenAI API Key |
| `jevlint-le.clearApiKey` | Clear API Keys |
| `jevlint-le.probeQuestion` | Probe the Jev Question at the Cursor (uses your API key) |

Menus: `editor/context` only, three entries (`lintFile`, `checkWithJev`,
`probeQuestion`, groups `jevlint-le@1..3`), all with the same `when`:
`editorLangId =~ /^(json|jsonc|javascript|javascriptreact|typescript|typescriptreact|python|rust|go)$/`.
`editorLangId` exists at the `^1.101.0` floor. Keybindings: none declared.

Configuration (thirteen properties):

| Property | Type | Default | Enum / scope |
|---|---|---|---|
| `jevlint-le.rules` | object | `{}` | |
| `jevlint-le.fallbackOptions` | array | 21 words, `other` first | |
| `jevlint-le.ignore` | array | `[]` | |
| `jevlint-le.include` | string | `**/*.{json,jsonc,js,jsx,mjs,cjs,ts,tsx,mts,cts,py,rs,go}` | |
| `jevlint-le.exclude` | string | `**/{node_modules,dist,out,build,coverage,.git}/**` | |
| `jevlint-le.maxFileSizeBytes` | number | `1000000` | |
| `jevlint-le.jev.model` | string | `jev-1.13.0` | |
| `jevlint-le.jev.maxCalls` | number | `25` | |
| `jevlint-le.jev.sendState` | boolean | `false` | |
| `jevlint-le.jev.confirm` | boolean | `false` | |
| `jevlint-le.jev.apiKey` | string | `""` | scope `application`, `ignoreSync` |
| `jevlint-le.jev.openaiApiKey` | string | `""` | scope `application`, `ignoreSync` |
| `jevlint-le.notificationsLevel` | string | `important` | `all`, `important`, `silent` |

Other points: `mcpServerDefinitionProviders` = `[{ id: jevlint-le, label:
JevLint-LE }]`; `jsonValidation` = `*.jev.json` → `./schemas/request.schema.json`,
`jevlint-le.json` → `./schemas/config.schema.json`; `snippets` = six language
entries over `./snippets/json.json` and `./snippets/js.json`.

### INV-3 registrations against the manifest

| Manifest id | Registered at |
|---|---|
| `jevlint-le.lintFile` | `src/commands/index.ts:196` |
| `jevlint-le.lintWorkspace` | `src/commands/index.ts:197` |
| `jevlint-le.openSettings` | `src/commands/index.ts:200` |
| `jevlint-le.checkWithJev` | `src/commands/jev.ts:306` |
| `jevlint-le.setApiKey` | `src/commands/jev.ts:309` |
| `jevlint-le.setOpenAIApiKey` | `src/commands/jev.ts:312` |
| `jevlint-le.clearApiKey` | `src/commands/jev.ts:315` |
| `jevlint-le.probeQuestion` | `src/commands/probe.ts:217` |
| `mcpServerDefinitionProviders[0].id` = `jevlint-le` | `src/services/mcpProvider.ts:37` (`MCP_PROVIDER_ID`) |

Other `register*` calls, none of which has or needs a manifest entry:
`registerCodeActionsProvider` (`src/extension.ts:136`, selector = the nine
languages) and `registerTextDocumentContentProvider` for the
`jevlint-le-probe` scheme (`src/commands/probe.ts:218`). Eight declared, eight
registered, both directions matched. `src/extension.test.ts:120` holds it and
`test/integration/extension.test.ts:161` asserts it with
`vscode.commands.getCommands(true)` in the real host.

### INV-4 settings and their consumers

Read once in `getConfiguration()` (`src/config/config.ts:105`) into a frozen
snapshot. Every declared property has a consumer; no undeclared key is read.

| Property | Read at | Changes behaviour in |
|---|---|---|
| `rules` | `config.ts:109` | `lint/lint.ts:259` severity; `jev/review.ts:115,295` which Jev checks run; replaced wholesale by a `jevlint-le.json` (`extension.ts:41`) |
| `fallbackOptions` | `config.ts:110` | `lint/lint.ts:287-288`, JEV004 and the name its fix inserts |
| `ignore` | `config.ts:114` | `lint/lint.ts:300`, `jev/review.ts:331` |
| `include` | `config.ts:117` | `commands/index.ts:137` `findFiles` |
| `exclude` | `config.ts:118` | `commands/index.ts:137` |
| `maxFileSizeBytes` | `config.ts:119` | `services/linter.ts:88` (open documents), `commands/index.ts:71` (workspace run, by `stat` size) |
| `notificationsLevel` | `config.ts:116` | `ui/notifier.ts:25,31` |
| `jev.model` | `config.ts:124` | `commands/jev.ts:177,196` provider; `services/reviewer.ts:67` plan and run; `commands/probe.ts:78,113,138` |
| `jev.maxCalls` | `config.ts:128` | `services/reviewer.ts:67` |
| `jev.sendState` | `config.ts:133` | `services/reviewer.ts:67` |
| `jev.confirm` | `config.ts:135` | `commands/jev.ts:229`, `commands/probe.ts:140` |
| `jev.apiKey` | `config.ts:136` | `commands/jev.ts:164` (`typedKey`, ahead of the keychain) |
| `jev.openaiApiKey` | `config.ts:137` | `commands/jev.ts:165` |

Defaults: `CONFIG_DEFAULTS` (`config.ts:35`) is held to the manifest by
`src/extension.test.ts:70-80`, which walks every manifest property. The comment
at `config.ts:34` says `config.test.ts` holds the two together; no such file
exists (see FEAT-17).

### INV-5 resources with a lifetime

| Surface | Created at | What | Released by |
|---|---|---|---|
| E | `ui/statusBar.ts:30` | status bar item | `statusBar.dispose` → `extension.ts:120` subscriptions |
| E | `services/projectConfigs.ts:39,45-47` | file-system watcher and its three listeners | `projectConfigs.dispose` → `extension.ts:121`; `loader.parsed` Map cleared on every change, bounded by the number of settings files |
| E | `services/linter.ts:64-68` | diagnostic collection; `results`, `timers`, `problems` Maps; `kept` Set | `clear` on close (`forget`), `reset` before a workspace run, `dispose` → `extension.ts:118`. `kept` entries live until the next workspace run by design |
| E | `services/linter.ts:143` | debounce `setTimeout` per document | cleared on reschedule (`:140`), on close (`:72`), on dispose (`:168`) |
| E | `services/reviewer.ts:57,61,85,87` | diagnostic collection; `flights` Map; one `AbortController` and one `abort` listener per run | `finally` at `:95-98` removes both; `dispose` → `extension.ts:119` |
| E | `services/engines.ts:65` | `loaded` Map, one entry per `path@version` of a project copy | never evicted; bounded by distinct installed copies |
| E | `services/installedCopies.ts:15` | `known` Map, one entry per folder of every linted file, refreshed after 10 s | never evicted (LEAK-7 candidate) |
| E | `services/mcpProvider.ts:37` | MCP server definition provider | `extension.ts:115` subscriptions |
| E | `commands/*.ts` eight `registerCommand`, `extension.ts:136` code action provider, `probe.ts:218` content provider | disposables | `extension.ts:122-140` subscriptions |
| E | `commands/probe.ts:181,183` | module-level `reports` Map (bounded to 20 by `KEPT_REPORTS`) and `changed` `EventEmitter` | the emitter is never disposed (LEAK-1 candidate) |
| E | `commands/index.ts:120` | module-level `workspaceRun` flag | reset in `finally` |
| E | `extension.ts:141-159` | six `onDid*` listeners | subscriptions |
| E | `commands/jev.ts:246`, `commands/probe.ts:155` | one `AbortController` per paid run, aborted by the progress token | garbage once the run returns |
| E M | `jev/client.ts:89-92,128-131` | per request: `AbortController`, `TIMEOUT_MS` timer, `abort` listener on the caller's signal | `finally` clears the timer and removes the listener |
| E M | `jev/client.ts:139-146` | `pause`: one `abort` listener per retry wait | removed in `done`; the `wait` timer itself runs to its end after an abort (harmless, resolves a settled promise) |
| M | `cli/mcpMain.ts:60`, `cli/main.ts:64` | `readline` interface over stdin | closed when stdin ends; no maximum line length (LEAK-11 candidate) |
| M | `cli/mcpMain.ts:48`, `cli/main.ts:52` | one `process.stdout.on('error')` | per process |
| M | `cli/mcpMain.ts:43` via `cli/mcp.ts:630,702` | `process.once('SIGINT', …)` and an `AbortController` per `check_with_jev` or `probe_question` call that reaches the network | never removed (LEAK-2 candidate) |
| all | `lint/lexicon.ts:14,22,30` `g` regexes; `lint/suppress.ts:27,28`; `config/projectConfig.ts:98`; `extraction/*Tokens.ts` `y` regexes; `extraction/rustTokens.ts:18` `g` | module-level stateful regexes | `g` ones are used only with `match`/`matchAll`/`replace`, which reset `lastIndex`; `y` ones set `lastIndex` before every `exec` (BUG-6 pass) |
| all | `extraction/reader.ts:56` `CONTEXTS` WeakMap; `extraction/braceReader.ts:126` `custom` WeakSet | weak | collected with their keys |

### INV-6 suspension points

| File:line | Function | Read before, used after | Note |
|---|---|---|---|
| `ui/notifier.ts:20,45` | `show`, `offer` | nothing | fire and forget by design, rejection swallowed (window gone) |
| `cli/main.ts:27,75` | `stdin`, top level | nothing | |
| `cli/run.ts:219` | `gather` | `name` from flags | flags are immutable |
| `cli/run.ts:371,374,477` | `run`, `runWithJev` | `options`, `io` | immutable per run |
| `cli/jev.ts:135` | `runJev` loop | `plan.shares`, `totals` | one run, no shared state |
| `cli/mcp.ts:624,705` | `checkWithJevTool`, `probeQuestionTool` | `ready.plan`, `found.key`, `provider` | computed from the call's own input |
| `cli/mcp.ts:898,908,971` | `attempt`, `callTool`, `answer` | `id`, `method` | per request |
| `cli/mcp.ts:980,982` | `serve` | the line | requests are answered one at a time, in order (RACE-13 pass by construction) |
| `jev/client.ts:97,107,163,166,168` | `attempt`, `ask` | `cut.signal`, `deps.signal` | signal checked after each wait |
| `jev/review.ts:312` | `runReview` loop | `job`, `network.signal` | signal checked before and after |
| `commands/index.ts:70,72` | `documentFor` | open-document lookup, then `stat`, then `readFile` | a file removed between `stat` and `readFile` throws into `lintOne`'s `catch` at `:165` and is counted as failed (RACE-11 pass) |
| `commands/index.ts:81` | `lintOne` | `deps.getConfiguration()` re-read inside `documentFor` per file | size threshold could differ between files if changed mid-run; safe when stale (one more or fewer file skipped and counted) |
| `commands/index.ts:129,137,150,165,188` | `lintWorkspace`, `lintEveryFile`, `openSettings` | `config` read once at `:136` for `include`/`exclude`; `workspaceRun` set before the first await | |
| `commands/probe.ts:88` | `runProbe` loop | `signal`, `model` read at `:78` after the modal | RACE-7 candidate: `model` is read from the configuration again here |
| `commands/probe.ts:128,141,148,174,204-207` | `probeQuestion`, `showReport` | `provider` from one configuration read at `:113`; `config` read again at `:134` after `await findKey` | RACE-7 candidate |
| `commands/jev.ts:181` | `findKey` | `provider` | `typedKey` reads configuration again before the await |
| `commands/jev.ts:208,232,239` | `checkWithJev` | `provider` from `:196`; `config` read again at `:228`; `reviewer.plan`/`review` read `jev.model`, `sendState`, `maxCalls` again at `services/reviewer.ts:67` | RACE-7 candidate: three reads across two awaits |
| `commands/jev.ts:265,274,287` | `setApiKey`, `clearApiKey` | `provider` fixed by the command | |
| `services/reviewer.ts:90` | `review` | `flight` registered before the await; `overtaken` read after | designed: an edit marks the flight overtaken |

### INV-7 failure sites

| File:line | Construct | Classified in Step 4 as |
|---|---|---|
| `extension.ts:104-111` | `try/catch` in `fixedText` | ERR-1 |
| `ui/notifier.ts:20,45` | `.then(undefined, () => {})` | ERR-1, ERR-6 |
| `config/installed.ts:18-25` | `try/catch` in `manifestIn` → undefined | ERR-1 |
| `config/projectConfig.ts:73-77` | `JSON.parse` catch → sentence | ERR-1 |
| `config/projectConfig.ts:199-203` | `readOr` catch → undefined → `UNREADABLE` sentence | ERR-1, ERR-4 |
| `cli/main.ts:53`, `cli/mcpMain.ts:49` | `throw` unless `EPIPE` | ERR-1 |
| `cli/main.ts:78-81`, `cli/mcpMain.ts:70-73` | top-level `.catch` → stderr, exit 2 | ERR-1 |
| `cli/mcpMain.ts:36-38` | `never()` throws on write or stdin | ERR-1 |
| `cli/files.ts:51-62` | `attempt` catch → `unread` | ERR-1, ERR-16 |
| `cli/run.ts:156-160` | `readOrNothing` catch → undefined | ERR-1 |
| `cli/run.ts:191-195` | file read catch → `unread` | ERR-1 |
| `cli/run.ts:251-255` | write catch → sentence, exit 2 | ERR-1 |
| `cli/run.ts:266-270` | `attemptFix` catch → file left as is | ERR-1 |
| `cli/run.ts:307-311` | `lintSources` catch → `failed` | ERR-1, ERR-2 |
| `cli/mcp.ts:894-902` | `attempt` catch → failed call | ERR-1, ERR-14 |
| `cli/mcp.ts:953-957` | `JSON.parse` catch → -32700 | ERR-14 |
| `cli/mcp.ts:970-975` | handler catch → -32603 | ERR-14 |
| `jev/client.ts:107-111` | `response.json().catch` | ERR-1 |
| `jev/client.ts:117-127` | `.catch` → `network` failure | ERR-1, ERR-8 |
| `jev/client.ts:145` | `void deps.wait(ms).then(done, done)` | ERR-6 |
| `commands/index.ts:128-132` | `try/finally` resets `workspaceRun` | ERR-18 |
| `commands/index.ts:165-167` | `.catch` → `tally.failed` | ERR-1, ERR-9 |
| `services/linter.ts:112-126` | `try/catch` → problem shown | ERR-1 |
| `services/engines.ts:74-79` | `try/catch` → `undefined` → named fallback | ERR-1 |
| `lint/lint.ts:275-279` | `throw` on an unknown syntax | ERR-4 (library boundary) |
| `src/__mocks__/vscode.ts:167,206,328,391` | mock failure hooks | ERR-12 |

### INV-8 user-visible strings, by channel

No `l10n`, no `package.nls.json`, no `vscode.l10n.t` anywhere (`grep -rn
"l10n" src package.json` is empty). Every string is English, by decision
(AGENTS.md "Not done"). The channels this repo actually uses:

| Channel | Where the strings come from |
|---|---|
| Notifications (`result`, `caution`, `blocked`, `offer`) | `ui/notifier.ts:24-50`; callers `commands/index.ts:41,46,51,124,176,181,184`, `commands/jev.ts:76-89,193,205,216,223,253,258,261,279,282,296,299`, `commands/probe.ts:105,115,125,161,168,177`. Message builders: `commands/index.ts:19-24` `SKIP_REASONS`, `:103-117` `describe`; `commands/jev.ts:50-66` `failureMessage`, `:97-130` `heldBack`/`describe`, `:156-159` `locked`/`noKey`; `services/linter.ts:121`; `services/engines.ts:85-117` notes |
| Modal dialogs and their buttons | `commands/jev.ts:135-154` `ask` (`Send`), `commands/probe.ts:141-145` (`Send`); offer buttons `Manage Workspace Trust` (`jev.ts:69`), `Set API Key` (`jev.ts:72`) |
| Input box | `commands/jev.ts:265-271` title and prompt |
| Progress titles and reports | `commands/index.ts:153,169`, `commands/jev.ts:242`, `commands/probe.ts:151` |
| Status bar text and tooltip | `ui/statusBar.ts:46-54`, `summarize` at `:23`; notes from `services/engines.ts` |
| Diagnostics (hover, Problems panel) | every `message` in `lint/checks.ts`, `lint/optionChecks.ts`, `lint/wordingChecks.ts`, `lint/lint.ts:234-246`, reworded per dialect by `lint/finding.ts:35-41`; Jev findings from `jev/reviews.ts` messages via `jev/review.ts:145-204` |
| Code action titles | `ui/codeActions.ts:20,119,126`; fix titles from `lint/fix.ts:54,105,133,146,179,220,245` |
| Generated report | `jev/probe.ts:237-266` Markdown |
| Manifest | `package.json` command titles, setting descriptions, `description` |
| CLI output | `cli/format.ts` (stylish, compact, json, github, sarif, junit; `summarize` `:93`, `describeJev` `:136`), `cli/run.ts` `unusable` sentences and `shortfall`, `cli/args.ts` help and flag errors |
| MCP | `cli/mcp.ts` tool titles, descriptions, `INSTRUCTIONS` (`:876`), every `fail(...)` sentence, protocol error messages (`:956,960,963,967`) |
| Rule pages | `docs/rulePages.ts` → `docs/rules/*.md` and `explain_rule` |

### INV-9 machine interfaces

MCP tools (`src/cli/mcp.ts:732-873`), all answering `content[0].text` plus
`structuredContent` equal to it, `isError` on failure; schemas at the lines named:

| Tool | Required | Optional | Output schema | Sends |
|---|---|---|---|---|
| `lint_text` | `text` string | `filename` string, `rules` object | `REPORT_SCHEMA` (`:274`) | nothing |
| `lint_paths` | `paths` string[] minItems 1 | `rules` | `REPORT_SCHEMA` | nothing |
| `fix_text` | `text` | `filename`, `rules` | `FIXED_SCHEMA` (`:279`) | nothing |
| `list_rules` | | | `RULE_LIST_SCHEMA` (`:360`) | nothing |
| `explain_rule` | `code` string | | `RULE_PAGE_SCHEMA` (`:374`) | nothing |
| `plan_jev` | | `text`, `filename`, `paths`, `rules`, `model`, `maxCalls` integer ≥ 1, `sendState` boolean | `REPORT_SCHEMA` with `totals.jev` | nothing |
| `check_with_jev` | | same as `plan_jev` | `CHECKED_SCHEMA` (`:296`) | the questions, with the key from `TYPESAFE_API_KEY`/`OPENAI_API_KEY` or `.env.local`/`.env` |
| `probe_question` | `text` | `filename`, `questionId`, `model` | `PROBED_SCHEMA` (`:309`) | about a dozen requests to TypeSafe |

Methods (`:917-942`): `initialize`, `ping`, `tools/list`, `tools/call`.
Protocol versions offered: `2025-06-18`, `2025-03-26`, `2024-11-05`.
Protocol errors: -32700 `Invalid JSON`, -32600 `Not a request`, -32601
`Unknown method: …`, -32603 the thrown message. A refused tool call is
`isError: true` with the sentence as text.

Command line (`src/cli/args.ts:74-192`): `--format <stylish|compact|json|github|sarif|junit>`
(`-f`), `--rule <CODE=level>`, `--config <file>` (`-c`), `--max-warnings <n>`,
`--stdin-filename <path>`, `--fix`, `--quiet`, `--jev`, `--jev-plan`,
`--jev-model <id>`, `--jev-max-calls <n>`, `--jev-send-state`, `--color`,
`--no-color`, `--mcp`, `--no-error-on-unmatched-pattern`, `--help` (`-h`),
`--version` (`-v`). Exit codes (`src/cli/run.ts:52`): 0 `passed`, 1 `failed`
(an error finding, or warnings over `--max-warnings`), 2 `unusable` (bad
flag, missing path, a named file of an unread type, nothing to read, an
unusable settings file, a write that failed under `--fix`, a Jev run that
failed, was stopped or needed more than the call limit).

npm: `npm/package.json` `jevlint-le` 0.8.0, `bin.jevlint-le` = `cli.js`,
`main` = `lib.js`, `files` = `cli.js`, `lib.js`, `README.md`, `LICENSE`.
`mcp/package.json` `jevlint-le-mcp` 0.8.0, `bin.jevlint-le-mcp` = `server.js`,
`files` = `server.js`, `README.md`, `LICENSE`, `mcpName`
`io.github.nolindnaidoo/jevlint-le`. `server.json` 0.8.0, one npm package
`jevlint-le-mcp` 0.8.0, stdio. `package.json` 0.8.0. The four agree (BASE-4
versions step). Library (`src/lib.ts`): `api` = 1, `syntaxes`, `rules`,
`lint`, `fix`.

### INV-10 claims

One row per testable sentence. `C` numbers are referenced by FEAT-17.

| Id | Where | Claim |
|---|---|---|
| C1 | README:3-7, package.json description | Lints Jev and OpenAI Decisions questions in JSON and code; linting makes no API calls and needs no key; one optional command asks the model with the user's key |
| C2 | README:24 | Lints as you type in JSON, JavaScript, TypeScript, Python, Rust and Go |
| C3 | README:25-26 | Fixes on the lightbulb for mechanical mistakes, and a way to silence a finding |
| C4 | README:27-28 | The same rules in CI from a command line and for agents from an MCP server; one settings file covers all three |
| C5 | README:29-31 | TypeSafe's and OpenAI's shapes and the AI SDK's `decide()` are read into the same rules |
| C6 | README:32-35 | Two optional paid commands: ask the model about problems, and re-send a question with its layout changed |
| C7 | README:37-58 | The example request yields JEV001 on `jev-latest`, JEV004 on `team`, JEV102 on `late` |
| C8 | README:66-103 | The rule table: code, name, default, meaning, 36 rows |
| C9 | README:105 | Each finding links to its own page with a flagged and a clean example, fix and silence guidance, linking on to TypeSafe's docs |
| C10 | README:109-126 | Where it looks: JSON/JSONC bodies; object literals and inline requests in JS/TS and the AI SDK; SDK helper calls; Python dicts, classes and request calls; Rust `json!`, named structs and variants, constructors; Go maps and structs; JSON pasted in a string; `.jev.json` files; `jev/ask` rules in an oxlint config |
| C11 | README:128-157 | OpenAI's Decisions API read from 0.5.0; what is checked, held back (JEV002, JEV003, JEV001), reported in OpenAI's field names, the reshape fix is Jev-only; Luna asked with `gpt-6-luna`; measured on Jev, not Luna |
| C12 | README:161-163 | Rules JEV301 to JEV312 run only under Check This File with Jev or `--jev` |
| C13 | README:169-181 | Two ways to give a key per vendor; `jev.apiKey` user settings only, out of Settings Sync; the probe asks Jev only |
| C14 | README:185-188 | One request per question and one more per request body, about 800 input tokens each, roughly three thousandths of a cent per question at TypeSafe, a hundredth at OpenAI |
| C15 | README:189-193 | Only questions are sent unless `jev.sendState`; with it on two more checks run |
| C16 | README:194-196 | A runtime-built question is not sent; at most `jev.maxCalls` requests (25) |
| C17 | README:197-198 | Disabled in an untrusted workspace |
| C18 | README:199-202 | Findings disappear on edit; editing or closing stops the check; each finding shows the probability |
| C19 | README:204-206 | `jev.confirm` shows count, tokens and cost and waits; off by default |
| C20 | README:210-234 | `jevlint-le.json`: `rules`, `fallbackOptions`, `ignore`, `exclude`; glob semantics; nearest file wins; replaces editor settings; unreadable file stops linting and says why; unknown key is an error; lightbulb writes disable comments; strict JSON silenced with `ignore` |
| C21 | README:243-264 | Project-installed copy is used by the editor; status bar `project <version>`; falls back with `project has <version>` when untrusted, older than 0.3.0, fails to load or does not read the type; paid commands always run the extension's own code |
| C22 | README:269-299 | CLI usage; exit 0/1/2 and what produces 2; the option table; summary names unread questions, skipped files, unread folders; linked folders not followed; no network unless `--jev` |
| C23 | README:303-331 | GitHub action `nolindnaidoo/jevlint-le@v0.5.2`; SARIF upload; JUnit only an error fails; pre-commit `rev: v0.5.2` |
| C24 | README:335-354 | `--jev` details: `TYPESAFE_API_KEY` only; runtime questions never sent; state not sent unless asked; limit is for the run; a run over the limit, a rejected key, a failure or a stop exits 2 |
| C25 | README:358-401 | MCP: eight tools and what each does; key sources and never from an argument; structured content; none writes a file; listed on the MCP registry |
| C26 | README:405-419 | Probe: three repeats then layout changes, report opens, needs state, five or six requests; nothing else uses the network |
| C27 | README:423-444 | What it will not tell you; four rules off; two removed in 0.4.0; JEV004 fires on 9 of 11 of TypeSafe's examples |
| C28 | README:448-459 | Suppression comments and JEV010 |
| C29 | README:463-480 | `--fix` and fix on save apply only safe fixes; fallback and pin never written for you |
| C30 | README:485-511 | No default keybindings; every command bindable; the command table |
| C31 | README:515-529 | The settings table |
| C32 | README:533-540 | Development commands |
| C33 | mcp/README:18-25 | The engine behind the extension "as five tools"; linting needs no key and no network; nothing writes a file; two tools ask the model with your key |
| C34 | mcp/README:29-81 | Install lines; `npx jevlint-le --mcp` is the same server; the printf smoke test |
| C35 | mcp/README:85-102 | Tool table (eight); first six read-only and offline; two marked open-world, not idempotent; `lint_paths` and `check_with_jev` read only under their paths; a `jevlint-le.json` applies and `rules` overrides it |
| C36 | mcp/README:106-119 | Key order: environment, `.env.local`, `.env`; never a tool argument; no answer carries a key; fails before sending with none; listed on the MCP registry |
| C37 | npm/README:3-16 | What the package is; the MCP server behind `--mcp`; `jevlint-le-mcp` for hosts; no key or network unless `--jev` |
| C38 | npm/README:20-76 | CLI usage, exit codes, option table, `--jev` details (key from `TYPESAFE_API_KEY` or `OPENAI_API_KEY` with Luna) |
| C39 | npm/README:80-83 | The editor lints with the installed copy; needs 0.3.0 or newer and a trusted workspace |
| C40 | npm/README:87-101 | `jevlint-le.json` keys; nearest file, no higher than the run directory |
| C41 | npm/README:105-138 | MCP section: eight tools; first six send nothing; key sources; registry listing |
| C42 | npm/README:142-156 | Library: `lint` and `fix` pure; options; third argument one of `syntaxes`, "any other value throws, naming those four"; `rules`; `api` |
| C43 | npm/README:160-161 | "The MCP server never calls Jev. The probe … is in the VS Code extension" |
| C44 | SPEC:3, AGENTS:15 | "Status: released as 0.2.0 on 2026-10-05" |
| C45 | SPEC:122 | "JEV001 has no automatic fix" |
| C46 | SPEC:212-226 | The settings table (twelve rows, `include` default "JSON, JS and TS globs") |
| C47 | SPEC:1147-1151 | The site registry declares "no MCP registry listing" |
| C48 | AGENTS:78 | `mcp.ts` is "five read-only tools" |
| C49 | `--help` | The help text's usage, flag lines and exit status sentence |
| C50 | AGENTS "Invariants" | 90 invariant items, each a claim (walked at BUG-17) |

### INV-11 tests, matched to what they cover

Direct imports, from `grep "from '…'"` over every test file:

| Test file | Exercises |
|---|---|
| `src/agent-files.test.ts` | the six agent-instruction files, byte for byte |
| `src/cli/cli.test.ts` | `cli/args`, `cli/files`, `cli/run` (and through it `format`, `jev`, `mcp`, `dotenv`), `docs/rulePages`, `jev/client`, `lint/lint`, `lint/rules`; also holds `action.yml`, `.pre-commit-hooks.yaml`, the readme option tables, `include` to `EXTENSIONS` |
| `src/cli/dotenv.test.ts` | `cli/dotenv`, `cli/files` |
| `src/cli/reader-failure.test.ts` | `cli/run` with `lint/lint` mocked to throw |
| `src/config/installed.test.ts` | `config/installed` |
| `src/config/projectConfig.test.ts` | `config/projectConfig` |
| `src/docs/rulePages.test.ts` | `docs/rulePages`, `lint/rules`, the pages on disk |
| `src/extension.test.ts` | `extension`, `commands/*`, `config/config`, `services/linter`, `services/mcpProvider`, `cli/run` (parity), and through activation `services/*`, `ui/*` |
| `src/extraction/bindings.test.ts`, `braceReader.test.ts`, `dialects.test.ts`, `pythonReader.test.ts`, `wrappers.test.ts` | through `lint/lint`: `extraction/bindings`, `braceReader`, `rustReader`, `goReader`, `pythonReader`, `wrappers`, `functions`, `slots`, `embedded`, the four lexers |
| `src/extraction/reader.test.ts` | `extraction/reader`, `extraction/tokens` |
| `src/jev/client.test.ts` | `jev/client` |
| `src/jev/pin.test.ts` | `jev/review` `DEFAULT_MODEL` against the manifest, both readmes and SPEC |
| `src/jev/probe.test.ts` | `jev/probe` |
| `src/jev/provider.test.ts` | `jev/provider`, `jev/client`, `jev/reviews`, `lint/limits` |
| `src/jev/released.test.ts` | `jev/released` |
| `src/jev/reviews.test.ts` | `jev/reviews`, `jev/literal`, `jev/client`, `lint/lint`, `lint/rules` |
| `src/lint/corpus.test.ts`, `validation.test.ts`, `wording.test.ts`, `lint.test.ts`, `fixAll.test.ts`, `rules.test.ts` | `lint/*` (checks, optionChecks, wordingChecks, lexicon, fix, fixAll, suppress, finding, limits, rules), the corpus and validation fixtures, README and SPEC rule tables |
| `src/services/diskDocument.test.ts` | `services/diskDocument`, `services/linter` |
| `src/services/linter-failure.test.ts` | `services/linter` with `lint/lint` mocked to throw |
| `src/services/loadModule.test.ts` | `services/loadModule` |
| `test/integration/extension.test.ts` | the real host over `samples/` |
| `scripts/e2e-cli.js` | `cli/main`, `cli/mcpMain` as processes, both npm tarballs, the library's exported names |
| `scripts/e2e-vsix.js` | the installed VSIX |

Coverage at baseline (lines): 0% for `src/cli/main.ts`, `src/cli/mcpMain.ts`,
`src/lib.ts`, which only `scripts/e2e-cli.js` runs, outside vitest; every
other non-test file is between 88% and 100%. Test-gap candidates carried to
the steps that own them: `cli/mcpMain.ts` `stopSignal` (Step 5),
`services/installedCopies.ts` eviction (Step 5), `commands/probe.ts`
re-entrancy (Step 6), `extension.ts` deactivation (Step 5, LEAK-6).


## Step 2: Broken features

Re-read for this step: `package.json`, `src/extension.ts`, `src/commands/*.ts`,
`src/services/mcpProvider.ts`, `src/config/config.ts`, `src/cli/args.ts`,
`src/cli/run.ts`, `src/cli/mcp.ts`, `src/lib.ts`, `scripts/e2e-cli.js`,
`scripts/e2e-vsix.js`, `test/integration/extension.test.ts`, `vitest.config.ts`,
`tsconfig.json`, `action.yml`, `.pre-commit-hooks.yaml`, the three READMEs,
`SPEC.md` and `AGENTS.md`. Surfaces: `E` extension, `M` MCP server, `N` npm
package and command line. `C` is n/a throughout: no crate.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| FEAT-1 | E | pass | INV-3: eight declared, eight registered, both directions. `extension.test.ts` "registers every command the manifest declares, and no other" walks the manifest; `test/integration/extension.test.ts` asserts it in the real host with `vscode.commands.getCommands(true)` |
| FEAT-2 | E | pass | `test/integration/extension.test.ts`, 21 cases on VS Code 1.141.0 over `samples/`: each command executed and its effect read back (diagnostics for the lint commands, the executed settings id, the input box and keychain for the key commands, the refusal sentences for the paid commands without a key or state) |
| FEAT-3 | E | pass | Every handler is registered as `() => body(deps)` and reads nothing from its arguments (`commands/index.ts:196-205`, `commands/jev.ts:305-325`, `commands/probe.ts:245`), so the palette, the context menu (which passes a uri) and a keybinding reach the same path. The menu path is driven in the real host |
| FEAT-4 | E | pass | One `when` clause on three entries, `editorLangId =~ /^(json\|jsonc\|javascript\|javascriptreact\|typescript\|typescriptreact\|python\|rust\|go)$/`; `extension.test.ts` "shows in exactly the languages the linter reads" holds the list to `LANGUAGES`. `editorLangId` exists at the `^1.101.0` floor |
| FEAT-5 | E | n/a | No keybindings declared; README "Keybindings" says none and that every command is bindable |
| FEAT-6 | E | pass | One consumer test per setting (INV-4): `rules` (`extension.test.ts` severity and the project file replacing it), `fallbackOptions` (JEV004 name tests), `ignore` (drop tests), `maxFileSizeBytes` (over-limit document skipped, workspace file skipped as too large), `notificationsLevel` at `all`, `important`, `silent` and an unknown value ("how much it says"), `jev.model` (Jev and Luna runs), `jev.maxCalls` (over the limit not sent), `jev.sendState` (state sent only when on), `jev.confirm` (asks first, sends nothing on no), `jev.apiKey` and `jev.openaiApiKey` (typed key ahead of the keychain). `include`/`exclude` reach `findFiles`, which the unit mock does not glob; their consumer test is the real-host workspace run over `samples/`, and `cli.test.ts` holds `include` to `EXTENSIONS` |
| FEAT-7 | E | pass | `extension.test.ts:70-80` walks every manifest property and compares `CONFIG_DEFAULTS`; a new property with no default fails it |
| FEAT-8 | E | pass | `getConfiguration()` is a fresh read on every call (`config.ts:105`); `extension.ts:141-159` re-lints open files on `onDidChangeConfiguration` and `reviewer.clear` drops Jev findings ("drops what Jev said when the settings it was filtered by change"). No setting says a reload is needed |
| FEAT-9 | E | pass | Nine `onLanguage:` events equal `LANGUAGES` and the menu clause (read). The real host activates on the `samples/` files. No test opens a file of another language and asserts no activation; observation, not a finding, since the commands are palette-reachable only after activation by design |
| FEAT-10 | E | pass | `unzip -l release/jevlint-le-0.8.0.vsix`: 13 files, `dist/extension.js`, `dist/cli.js` (the server the provider starts, `mcpProvider.ts` → `asAbsolutePath('dist/cli.js')`), `schemas/*.json`, `snippets/*.json`, icon, README, CHANGELOG, LICENSE. Every path the source resolves at runtime is present. `test:e2e-vsix` PASS at baseline and at close |
| FEAT-11 | E | n/a | No `check:bundle` script in this repo. esbuild `--bundle` with only `vscode` external; `test:e2e-vsix` loads the installed bundle in a real host, which is the same evidence |
| FEAT-12 | M | pass | `cli.test.ts` drives each of the eight tools over `serve()`: a valid call, a schema-violating call (now the `-32602` table), and a malformed document (a question built at runtime → `JEV000` and `unreadable: 1`; a broken settings file → failed call). `scripts/e2e-cli.js` drives the built server over real stdio: `initialize`, `tools/list`, `lint_text`, the refusal without a key, from both tarballs |
| FEAT-13 | M C | n/a | One implementation |
| FEAT-14 | M | pass | `mcpProvider.ts` spawns the editor's Node on `dist/cli.js --mcp`; `extension.test.ts` "starts the shipped command line as a server, under the editor as Node", "ships the bundle it points at", "is skipped without complaint in an editor that has no agent mode" |
| FEAT-15 | N | pass | `scripts/e2e-cli.js` runs `npm pack --dry-run --json` in `npm/` and asserts the tarball holds exactly `LICENSE`, `README.md`, `cli.js`, `lib.js`, `package.json` at the root's version, runs the built `npm/cli.js` and `mcp/server.js` as processes, and loads `lib.js` by the manifest's `main`; `COMMAND-LINE TEST: PASS` at baseline and at close. The tarball is not installed into a temp dir; observation |
| FEAT-16 | N | pass | Every flag in INV-9 is driven in `cli.test.ts` (`--format` × 6, `--rule`, `--config`, `--max-warnings`, `--stdin-filename`, `--fix`, `--quiet`, `--jev`, `--jev-plan`, `--jev-model`, `--jev-max-calls`, `--jev-send-state`, `--color`/`--no-color`, `--mcp`, `--no-error-on-unmatched-pattern`, `--help`, `--version`) and each exit code is produced; `test:cli` runs the built bundle over `samples/`, a real tree |
| FEAT-17 | all | finding | `jevlint-le-features-1`: nine sentences had drifted (C33 "five tools", C43 "never calls Jev", C44 0.2.0 status, C45 JEV001 "no automatic fix", C46 `include` default and the missing `openaiApiKey` row, C47 "no MCP registry listing", C23 `@v0.5.2` pins, `config.ts:34` naming `config.test.ts`). Fixed in `e830dff`; `src/docs/claims.test.ts` holds each class. Every other INV-10 row was matched to a test or a run (C7 `lint.test.ts`, C8 `rules.test.ts`, C14 `probe.test.ts` token counts, C21 `extension.test.ts` project copy, C22/C24 `cli.test.ts`, C25/C35/C36 `cli.test.ts` and `dotenv.test.ts`, C26 `probe.test.ts`, C27 `validation.test.ts`, C28 `lint.test.ts` suppression, C29 `fixAll.test.ts`, C31 now `claims.test.ts`, C42 `scripts/e2e-cli.js`) |
| FEAT-18 | all | pass | Every setting has a consumer (INV-4); every command a registration (INV-3); every `package.json` script is a gate, a build step or a hook installer (INV-9). Exports with no caller outside their module: none found in the read; `BOM` and `TOOL_NAMES`, added by this pass, have callers. `findKey`'s unused default parameter was removed in `4e7eaf6` |
| FEAT-19 | E | pass | `vitest.config.ts`: `coverage.thresholds` set, `include: ['src/**']`, excludes only tests and `__mocks__`. `tsconfig.json` includes the test files, which is how `bun run typecheck` caught a test's union narrowing during this pass. No generated README sections in this repo (the rule pages under `docs/rules/` are generated and held by `rulePages.test.ts`) |
| FEAT-20 | E | pass | BASE-8: no skipped test; `grep -rnE '\.(skip\|only)\(\|it\.todo' src test` is empty |
| FEAT-21 | all | pass | Gates the documents describe, read against their scripts: `commit-lint.js` refuses a subject outside the conventional set (read; the `commit-msg` hook ran on every commit of this branch), the release preflight refuses an undated changelog heading (`release.yml:66-72`), the versions step refuses a mismatch (`ci.yml:125-150`), `check-agent-files.py` refuses a drifted agent file (`agent-files.test.ts`). Driven: `claims.test.ts` against the stale documents produced four failures (recorded under `jevlint-le-features-1`) |
| FEAT-22 | all | pass | Every test titled for a failure, a refusal or an error feeds an input that takes that path (read with the module under test). One asserted less than it could: `reader-failure.test.ts` checked the sentence and not the exit code, which hid `jevlint-le-errors-3`; it now holds the exit code and the server's answer |
| FEAT-23 | all | n/a | No CI job greps the documents for a forbidden claim; the only document gate is byte equality of the agent files |

## Step 3: Bugs

Re-read for this step: everything under `src/lint/`, `src/extraction/`,
`src/config/`, `src/cli/`, `src/services/diskDocument.ts`,
`src/services/engines.ts`, `src/services/installedCopies.ts`,
`src/jev/provider.ts`, `src/jev/client.ts`, `src/ui/codeActions.ts`, and the
grep outputs named below.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| BUG-1 | all | pass | `lint.test.ts` "returns early on a file that cannot hold a question", `{}`, a lone `type` field; `cli.test.ts` no paths → `.`, empty stdin, `--max-warnings 0`; MCP `lint_text` with `''` lints to zero findings, `lint_paths` with `[]` is now `-32602` ("must have at least 1 entry"), `explain_rule` with `''` → `Unknown rule` |
| BUG-2 | all | pass | `grep -rnE 'if \(![a-zA-Z_.]+\)\|\|\| ' src --include='*.ts' --exclude='*.test.ts'`, mock excluded: 266 sites read with their domains. Valid falsy values are explicit where they occur: `--max-warnings 0` (`args.ts`, tested), `maxCalls` has a floor of 1 by schema and by `readNumber`, `questionCount === 0` hides the status bar by design, `fallbackOptions: []` makes every Choice fail JEV004 (`extension.test.ts`), `unreadableCount` `0` prints no suffix. `params.arguments ?? {}` in `mcp.ts` was read against `null` and `''`, now refused as not an object (`af8853d`) |
| BUG-3 | all | pass | `KEPT_REPORTS` slice (`probe.ts`) keeps exactly 20; `MAX_FILE_SIZE_BYTES` tested at 1,000,001 (`cli.test.ts`) and at the editor's threshold; `MAX_LINE_BYTES` tested exactly at the limit and one byte over (`lines.test.ts`, added); `locate` in `format.ts` tested at line starts and ends (`diskDocument.test.ts`); `syntaxForPath` at `lastIndexOf('.') === -1` |
| BUG-4 | N M E | finding | `jevlint-le-bugs-5`: a byte order mark counted as column 1 on every reader from disk (CLI, `lint_paths`, workspace run); fixed `b3c7cba`. CRLF: `diskDocument.test.ts` positions over `ab\ncd\r\nef`; tokens treat `\r\n` in strings (`tokens.ts:25-36`). No trailing newline: `cli.test.ts` default-format tests. Non-BMP: columns are UTF-16 units, as VS Code counts them, in both the CLI and the editor; consistent, noted. Invalid UTF-8: Node decodes with U+FFFD and the file lints; `lines.ts` decodes a frame only once whole (`lines.test.ts` "decode a character split across two chunks whole") |
| BUG-5 | all | pass | `grep -rnE '\.sort\(\|localeCompare\|toLocale[A-Z]' src`: `files.ts` `walk` sorts names with the default comparator (code unit, same on every machine); findings are ordered by span start in `lint.ts`; `toLocaleString('en-US')` in `jev.ts` for the token count display only. No `localeCompare` |
| BUG-6 | all | finding | `jevlint-le-bugs-4`: `asked()`/`negatesTwice()` `[^.?!]*\?` and two `opener[^stops]*closer` lexicon patterns were O(n²): 25 KB → 8.5 s, 50 KB → 36 s, 100 KB → 153 s (`scratchpad/quadratic.ts`); fixed `df98e6a`. `g`/`y`-flag patterns at module level (`lexicon.ts`, `suppress.ts`, `projectConfig.ts`, `*Tokens.ts`) are used only with `match`/`matchAll`/`replace`, or set `lastIndex` before every `exec` (read) |
| BUG-7 | N | pass | `args.ts` parses `--max-warnings` and `--jev-max-calls` with `Number()` and refuses non-integers and, for the limit, zero (`cli.test.ts` flag validation); `readNumber` in `config.ts` refuses non-numbers and clamps; no `parseInt` without a radix (`grep -rn parseInt src` is empty) |
| BUG-8 | E N | pass | `installed.test.ts` "reads Windows paths as they are written"; `projectConfig.test.ts` `parent`/`under` with both separators and a root; URIs whose scheme is not `file` skip the project lookup (`installedCopies.ts:18`) and the settings file; `walk` joins with `path.join`; glob specials are the user's `include`/`exclude` and are passed to `findFiles` unchanged |
| BUG-9 | all | pass | `grep -rnE '\bas [A-Z]\|\bas unknown\|: any\b' src --exclude='*.test.ts'`, mock excluded: 92 sites, most of them `as const` and casts of this code's own literals. The casts on untrusted input in `mcp.ts` (`parsed as Json`, `input as Json`) are now behind `isRecord` and the schema check (`af8853d`); `tool.inputSchema as InputSchema` names the file's own literals and says so in a comment; `asLibrary` in `engines.ts` checks every field before the cast; `diskDocument` casts a shape the linter reads |
| BUG-10 | all | finding | The grep lists 34 names defined in more than one module; each pair was read. Two were one function in two places: `stat` and `stopSignal` in `main.ts` and `mcpMain.ts`, merged into `cli/process.ts` by `c6264c6` and `67b3420` (inside `jevlint-le-errors-4` and `jevlint-le-leaks-2`). `version` is still defined in both entry points, a one-line manifest read. `lineStarts` exists in `format.ts` (1-based) and `diskDocument.ts` (0-based) with different contracts; `plural` is a one-liner in four modules. The rest share a name and differ in meaning (`describe`, `report`, `summarize`, `attempt`, `ask`, `asked`, …). Observations, no finding of their own |
| BUG-11 | all | pass | `findKey`'s default parameter re-read the configuration and no caller used it (removed in `4e7eaf6`). No arm-equal branches; every option accepted is consumed (INV-4, INV-9) |
| BUG-12 | all | pass | Every table and default is `Object.freeze`d or a `ReadonlyMap`; `CONFIG_DEFAULTS` frozen; tallies and plans are per call. No module-level value is mutated by a command but `workspaceRun`, `probing`, `known`, `loaded` (INV-5), each with one writer |
| BUG-13 | N | finding | `jevlint-le-bugs-6`: the shortfall said "Jev answered" after a run against Luna; fixed `ba55d27`. Every other user sentence read against the module: `JEV000` says "not read", never "clean"; the status bar hides on zero questions rather than saying "clean"; the probe says "No report was made, because part of one would mislead" |
| BUG-14 | all | n/a | No sensitive value is previewed. Keys never appear in output: `cli.test.ts` `not.toContain('sk-test')`, `extension.test.ts` messages read for the key |
| BUG-15 | M C | n/a | One implementation |
| BUG-16 | C | n/a | No crate |
| BUG-17 | all | finding | Ninety invariant items walked, each matched to a test. One did not hold: "every fallback but none installed is named in the status bar" (`jevlint-le-bugs-7`, an unreadable manifest fell back silently; fixed `9b2744a`). Test gaps closed by this pass with a new invariant each: prototype names (`lint.test.ts`), `-32602` vs `isError` (`cli.test.ts`), bounded request lines (`lines.test.ts`), a command that throws (`extension.test.ts`), one probe at a time, settings read once, byte order mark, size limit on the server's text. No invariant remains without a named test |
| BUG-18 | all | finding | `grep -rnE '\b[A-Z_]+\[[a-zA-Z_.()]+\]' src --exclude='*.test.ts'`: 52 lookups on 27 tables, each read for where its key comes from. Three findings: `jevlint-le-bugs-1` (`NOUL_KEY_FIXES`, `TYPE_ALIASES`, the readers' keyword tables, `CLASS_TYPES`, the Rust and Go `FIELD_ALIASES`, `LEVEL_ALIASES`, `COMMENTS`; `6004b59`), `jevlint-le-bugs-2` (`EXTENSIONS`, `LANGUAGE_IDS`, `LANGUAGE_BY_EXTENSION`, `syntax in TRIGGERS`; `ea28548`), `jevlint-le-bugs-3` (`METHODS`; `40b2b39`). The 40 lookups left as objects are keyed by this code's own values: a rule code already checked against `RULE_CODES`, a severity, a dialect, a syntax, a provider id, a response status, a token kind, an escape letter |
| BUG-19 | N M | pass | `syntaxForPath` reads only the text after the last dot: `.env` → `env`, not read; `.json` (a dotfile) → read, by decision; `noext` → undefined; `a.constructor` → undefined (`lint.test.ts` "are resolved from the extension alone, and from no inherited name"). The walk and the server use the one resolver |
| BUG-20 | N | n/a | No command reads a document as lines and writes it back; `--fix` writes the whole text with its terminators untouched (`fixAll.test.ts`) |
| BUG-21 | M C | n/a | One parser per format |

## Step 4: Errors

Re-read for this step: every `catch`, `.then(undefined, …)`, `void` and
`throw` site from INV-7 (25 `catch` sites outside the mock), `src/cli/mcp.ts`
end to end, `src/cli/lines.ts` (new), `src/cli/files.ts`, `src/cli/run.ts`,
`src/commands/*.ts`, `src/ui/notifier.ts`, `src/jev/client.ts`,
`src/services/linter.ts`, `scripts/*.js`, `.github/workflows/*.yml`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| ERR-1 | all | pass | INV-7 classifies all 25 `catch` sites and the two `.then(undefined, () => {})` in `notifier.ts`. Each returns a named value the caller reads (`unread`, `failed`, `undefined` → a sentence, `-32700`, `isError`) or has a comment naming why it is ignorable (the window gone). None is empty and unexplained |
| ERR-2 | N M | finding | `jevlint-le-errors-3`: with every named file failing inside the linter, `run()` printed "0 findings in 0 files" and exited 0, and `lint_paths` answered an ordinary report; fixed `1770a0c`. Every other "nothing found" path traced: the editor's `lintDocument` catch shows the problem and `Jev not linted`; one failed file beside linted ones is named and the run goes on; `JEV000` carries the unread count before suppression |
| ERR-3 | all | pass | Driven over the server, not read: a question built at runtime → `JEV000` with `totals.unreadable: 1` (`cli.test.ts`, the MCP server, Python body); a file of a type it does not read → `Not a file type jevlint-le reads: x.constructor` (`scratchpad/mcp-drive.mjs`, now a test); an unusable settings file → the file and reason as a failed call. One spelling (`JEV000`) throughout |
| ERR-4 | all | pass | Each failure sentence read against its causes: `Not a file type`, `Not a regular file` (new), `No such file or directory`, `could not be read`, `over the size limit`, `is not JSON`/`has no version`/`could not be read` for a manifest (new), the six vendor failure kinds. One label is wider than its cause: a file the linter itself failed on is listed under "could not be read" on the command line and under `unread` on the server, though the file was read. Observation, pinned by the repo's own `reader-failure.test.ts` sentence, left for the owner |
| ERR-5 | E | pass | The grep lists six sites. `showReport` reads the preview's and the fallback's results and says so when neither opened ("still tells the user what a probe found when the report cannot be opened"); `secrets.store`/`delete` results decide the message; `workspace.fs.stat`/`readFile` throw into `lintOne`'s catch and count; `openSettings` awaits `executeCommand`; `offer`'s `executeCommand` is the button's action. No `applyEdit`: fixes are `WorkspaceEdit`s the editor applies |
| ERR-6 | all | pass | `void` sites: `notifier.show` and `offer` (a toast's promise settles when it closes, comment), `client.pause` (`wait().then(done, done)`, resolves a settled promise). Async handlers: every command body now runs under `guarded` (`a81fefc`), whose rejection path is the user's message; `onDid*` listeners call synchronous scheduling |
| ERR-7 | E | finding | `jevlint-le-errors-5`: no handler around any command body; a throw was an unhandled rejection and the command did nothing visible. Reproduced with a document whose `getText` throws under three commands. Fixed `a81fefc` |
| ERR-8 | all | pass | Four `catch (error\|thrown)` sites; each narrows with `instanceof Error` and falls back to `String()` (`mcp.ts` `reason`, `guard.ts`, `linter.ts:118`). No `as Error`. `client.ts` builds `network` details from `String(error)` |
| ERR-9 | all | pass | No `console.*` in `src`. Every skip is counted and named: CLI `skipped`/`unread`/`failed`, editor tally `tooLarge`/`failed`/`misconfigured` in the summary, Jev `heldBack` in the confirmation and the result |
| ERR-10 | E | pass | Six direct `show*Message` calls: four inside `notifier.ts` (the channel itself and `offer`'s button), two modals awaiting the user's answer (`jev.ts:247`, `probe.ts:146`). `extension.test.ts` "sends every notification through the notifier, so the setting governs them all" |
| ERR-11 | E | pass | A dismissed modal returns quietly (`answer !== SEND` → return; "sends nothing on no"); a dismissed input box returns quietly (`if (!key) return`); a cancelled progress is reported as a count, the repo's stated policy, since the run spent money |
| ERR-12 | E | finding | Hooks at baseline: `secretsError`, `showDocumentError`, `cancel`, `answer`, a missing document for `fs.stat`/`fs.readFile`, `trusted`. Added by this pass: `onModal` (acts while a modal is open), emitter disposal tracking (`_state.emitters`), a throwing `getText` by assignment. Without a hook: `withProgress`, `executeCommand`, `findFiles`, `showInputBox` failure. Recorded under `jevlint-le-races-1` and `jevlint-le-leaks-3`, whose tests needed the new hooks; the rest is an observation |
| ERR-13 | all | finding | Two tests pinned a defect: `cli.test.ts` "reports %s as a failed call" held `isError` for an unknown tool and four argument shapes (moved to the `-32602` table in `af8853d`, `jevlint-le-errors-1`); `reader-failure.test.ts` asserted the sentence and not the exit code (`1770a0c`, `jevlint-le-errors-3`) |
| ERR-14 | M | finding | `jevlint-le-errors-1` (unknown tool, missing or misshapen argument → `-32602`, `af8853d`), `jevlint-le-errors-2` (no or wrong `jsonrpc` → `-32600`, `5b34a79`), `jevlint-le-bugs-3` (prototype-named method → `-32601`, `40b2b39`), `jevlint-le-leaks-1` (oversized line → `-32600` by length, `3c01b60`). Invalid JSON → `-32700` with id `null`; every error carries the request's id; stdout carries protocol frames only (`io.out` is called in `serve` alone; `e2e-cli.js` parses every stdout line) |
| ERR-19 | M | pass | After the fixes: invalid bytes decode to U+FFFD and fail `JSON.parse` → `-32700`, next line served ("answers JSON that is not a request, and goes on serving"); a character split across chunks decodes whole (`lines.test.ts`); no method → `-32600`; no, wrong or non-string version → `-32600` (three cases); `id: null` echoed as `null`. One server, so one set of words |
| ERR-15 | C | n/a | No crate |
| ERR-16 | N M | finding | `jevlint-le-errors-4`: a FIFO under a `.json` name was `kind: 'file'` and `readFileSync` blocked for ever, in a walk and when named; fixed `c6264c6`, driven on a real `mkfifo` in `e2e-cli.js`. Permission denied → named ("lints the rest when a file cannot be read"); a linked folder is not followed and a named one is read; a directory where a file was expected is walked; a file removed between stat and read → `unread`. A path over the platform limit takes the same `catch`; not driven, observation |
| ERR-18 | E | pass | The only indicators are `withProgress` notifications, which close when the promise settles on every path, now including a throw (`guarded`), and the status bar, set per result with no busy state. `workspaceRun` and `probing` reset in `finally` |
| ERR-17 | N E | pass | `grep -rnE '\|\| true\|continue-on-error\|2>/dev/null' scripts .github/workflows`: one hit, `release.yml:122` counts VSIX files with `2>/dev/null` on `ls` and fails unless exactly one (fail-closed, read). Every `spawnSync` in `scripts/` checks `status` or asserts on output (read: `e2e-cli.js`, `e2e-vsix.js`, `build-npm.js`, `commit-lint.js`, `install-hooks.js`) |

## Step 5: Memory leaks

Re-read for this step: every row of INV-5, `src/extension.ts`,
`src/services/*.ts`, `src/commands/probe.ts`, `src/cli/mcpMain.ts`,
`src/cli/main.ts`, `src/cli/mcp.ts` (the paid tools), `src/jev/client.ts`,
`vitest.config.ts`, every `beforeEach`/`afterEach` in the tests.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| LEAK-1 | E | finding | `jevlint-le-leaks-3`: the probe report page's `EventEmitter` was made at import and never disposed, so it outlived a deactivation; fixed `9872025`, now made at registration and returned among the disposables. Every other disposable in INV-5 is pushed to `context.subscriptions` or released per call (the reviewer's abort listener in `finally`; the per-run `AbortController` is garbage once the run returns) |
| LEAK-2 | E M | finding | `jevlint-le-leaks-2`: each `check_with_jev` or `probe_question` call that reached the network added a `process.once('SIGINT')` listener that nothing removed; fixed `67b3420`, one listener re-armed after it fires, shared with the command line in `cli/process.ts`. Editor: six `onDid*` listeners in subscriptions; the watcher's three listeners disposed with `projectConfigs`; `client.ts` removes its `abort` listeners in `finally` |
| LEAK-3 | E M | pass | `linter.ts` clears the debounce timer on reschedule (`:140`), on close (`:72`) and on dispose (`:168`); `client.ts` clears `TIMEOUT_MS` in `finally`; `pause`'s wait timer runs out after an abort and resolves a settled promise, touching nothing (read) |
| LEAK-4 | E | pass | Nothing is created lazily but the probe report page, now made up front and disposed (`jevlint-le-leaks-3`); the status bar item and the diagnostic collections are made at activation |
| LEAK-5 | E | pass | `linter`, `reviewer`, `projectConfigs` and `statusBar` each release what INV-5 lists for them (read); each is idempotent by construction (`Map.clear`, `item.dispose`, `collection.dispose`). No test calls one twice; the mock's `disposable()` is a no-op, so such a test would check nothing until the mock tracks more. Observation |
| LEAK-6 | E | pass | `extension.test.ts` "is made with the extension and disposed with it, report page included" (added) disposes every subscription and checks the mock's emitter ledger. The mock tracks emitters only; status bar items, collections, listeners and timers are not counted. Extending the mock further is an observation, since no uncounted resource was found leaking by reading |
| LEAK-7 | all | finding | `jevlint-le-leaks-4`: `installedCopies.known` grew by one entry per folder of every linted file for the life of the window; fixed `5e7c66d`, capped at 512 with expired entries evicted first. Bounded by construction: `engines.loaded` (one per distinct copy and version), `probe` reports (20), `linter.kept` (the workspace's files, reset each run), `reviewer.flights` (emptied in `finally`). The server keeps nothing per request (`serve` holds the line only) |
| LEAK-8 | E | pass | A workspace run holds a `diskDocument` only while it is linted ("reads workspace files from disk, and opens none of them in the editor"); `linter.results` holds findings, not text, and is cleared on close; the probe keeps Markdown reports, twenty at most |
| LEAK-9 | E | pass | The one child process is the MCP server, spawned and owned by the editor from the provider's definition (`mcpProvider.ts`); nothing else spawns, opens a browser or streams |
| LEAK-10 | E | pass | Repeated runs refuse to overlap ("does not start a second Jev check", "runs one probe at a time", "refuses a second workspace run") and own no per-run disposable but the `AbortController`. No counting test over many runs, because the mock counts only emitters; observation, with LEAK-6 |
| LEAK-11 | M | finding | `jevlint-le-leaks-1`: `readline` held a line until its newline, with no maximum; fixed `3c01b60`, `cli/lines.ts` bounds a line at 16 MiB, drops the rest as it arrives and answers `-32600` with the length. Driven in `lines.test.ts`: one byte over with the newline in that chunk, far over with the newline many chunks later, exactly at the limit. `jevlint-le-leaks-5`: a `text` argument had no size limit while files and stdin had one; fixed `89ce008`. Nothing accumulates per request |
| LEAK-12 | M | pass | `scratchpad/mcp-drive.mjs`, scenario D: thousands of `lint_text` calls over one session against the built server with RSS sampled along the way; the samples levelled off after warm-up and did not climb. No driver in the repo; `test-gap` observation |
| LEAK-13 | M | pass | Closing stdin ends the process: `e2e-cli.js` and `mcp-drive.mjs` write requests, close stdin and read the exit; nothing keeps the loop alive (`serve` returns when `lines()` ends, no timers armed outside a call) |
| LEAK-14 | C | n/a | No crate |
| LEAK-15 | C | n/a | No crate |
| LEAK-16 | C | n/a | No crate |
| LEAK-17 | tests | pass | `_reset()` in `beforeEach` clears every `_state` field, including the fields this pass added (`onModal`, `emitters`); `vi.useFakeTimers()` in `beforeEach` with `vi.useRealTimers()` in `afterEach`; `vi.unstubAllGlobals()` after each fetch stub; `installedCopies.test.ts` restores real timers in `afterEach`. Three runs and a shuffled run green at baseline; the full suite green on every commit |

## Step 6: Race conditions

Re-read for this step: every row of INV-6, `src/commands/*.ts`,
`src/services/reviewer.ts`, `src/services/linter.ts`, `src/extension.ts`,
`src/cli/mcp.ts` `serve`, `src/cli/lines.ts`, `src/jev/client.ts`,
`src/jev/review.ts`, `src/jev/probe.ts`.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| RACE-1 | E | finding | INV-6 walked. One stale read mattered: the configuration re-read after the key lookup and the confirmation (`jevlint-le-races-1`, recorded under RACE-7). `reviewer.review` reads `document.getText()` before its await and marks the flight overtaken on edit or close ("shows nothing from Jev about text that was edited during the run"); `documentFor` re-reads the open document list per file; `lintEveryFile` reads `include`/`exclude` once before its first await |
| RACE-2 | E | pass | No command writes a computed edit back after an await: fixes are `WorkspaceEdit`s the editor applies against the current version; fix on save runs synchronously on the document being saved (`extension.ts:104-111`); the Jev check adds diagnostics, dropped on the next edit |
| RACE-3 | E | finding | `jevlint-le-races-2`: the probe had no guard, so two invocations paid twice and raced for the report page; fixed `1516f0e`, the second is refused. Policies elsewhere: the Jev check refuses a second run on the same file (`reviewer.running`); the workspace run refuses a second (`workspaceRun`); `lintFile` is synchronous; `openSettings` is idempotent; a second `showInputBox` dismisses the first in the editor, each store independent |
| RACE-4 | E | pass | `workspaceRun` and `probing` are set before the first await and reset in `finally`; `flights` is set before the await and deleted in `finally`; `known` and `loaded` are written synchronously; nothing does read, await, then write on shared state |
| RACE-5 | E | n/a | No `globalState` or `workspaceState` |
| RACE-6 | E | pass | `runProbe` checks `signal.aborted` before each request and after the reply (`probe.ts:87,93,98`); `runReview` checks before and after each request; a cancelled run shows nothing and says the count ("says a Jev check was cancelled, and how much of it ran", "shows no probe report for a probe that was cancelled part way") |
| RACE-7 | E | finding | `jevlint-le-races-1`: `checkWithJev` read `jev.model` three times across two awaits (the key's vendor, the reviewer's plan, the run) and the probe twice around its modal; a model switched while the modal was on screen sent the TypeSafe key to OpenAI. Reproduced with the new `onModal` hook. Fixed `4e7eaf6`: one read before the first await, handed to the key lookup, the plan, the confirmation and the run; the reviewer reads no configuration |
| RACE-8 | E | pass | `linter.dispose` clears timers; `reviewer.dispose` aborts every flight; a continuation after that returns `stale`/`failed` into `caution`/`blocked`, which swallow a gone window; the probe emitter is now disposed with the extension so nothing fires on it afterwards |
| RACE-9 | E | pass | `activate` builds the services (`extension.ts:41-75`), registers the provider, commands and status bar (`:115-140`), then the listeners (`:141-159`), and lints the open documents last. The status bar's command is `openSettings`, registered before the bar first shows |
| RACE-10 | E N | pass | CLI: `walk` sorts directory names and findings are ordered by span. Editor: a workspace run produces per-file diagnostics and a summary of counts, so order does not reach the user. Two runs over `samples/` produce identical output (`test:cli`) |
| RACE-11 | E N | pass | `documentFor` stats then reads; a file gone in between throws into `lintOne`'s catch and is counted as failed. CLI: `attempt` names a file that vanished between the listing and the read as `unread` |
| RACE-12 | M | pass | `lines.test.ts` (added): one message across chunk boundaries at arbitrary offsets, two messages in one chunk, a multi-byte character split across chunks, each parsed once. Before the fix, `readline` did the same; `mcp-drive.mjs` scenarios A and B drove it at baseline |
| RACE-13 | M | pass | `serve` answers one line at a time (`for await`, each reply awaited before the next line), so handlers never overlap; each reply is built from its own request's id and params. `mcp-drive.mjs` scenario C sent several requests before reading and every reply carried its own id |
| RACE-14 | M | pass | `mcp-drive.mjs` scenario F closed stdin with a request in flight: the reply was written whole and the process exited 0. `e2e-cli.js` closes stdin after its frames and reads the exit |
| RACE-15 | C | n/a | No crate |
| RACE-16 | C | n/a | No crate |
| RACE-17 | tests | pass | Three runs and a shuffled run green at baseline; the suite green on all 21 commits. 11 timer or clock sites in tests: fake timers under `vi.useFakeTimers`, `performance.now()` bounds in `wording.test.ts` (2 s against sub-100 ms runs), `Date.now()` in `installedCopies.test.ts` under fake timers |

## Step 7: Translations

No `l10n` or `package.nls.json`, no `vscode.l10n.t`, no locale files
(`grep -rn l10n src package.json` is empty; INV-8). AGENTS.md "Not done" states
English only, by decision. Every check in `translations.md` is `n/a`, with
this grep as the evidence.

| Check | Surface | Answer | Evidence |
|---|---|---|---|
| L10N-* | all | n/a | No translation mechanism; English only by decision |

## Findings

Every fix is one commit on `fix/fleet-pass`, named by its finding id here.
"Failed without fix" is the test's output with the fix absent, taken before
the fix was written; the decisive line is quoted.

| Id | Step | What is wrong | Reproduction | Fix commit | Test | Failed without fix |
|---|---|---|---|---|---|---|
| jevlint-le-features-1 | features | Nine documented claims had drifted from the code (FEAT-17): "five tools" twice, "the MCP server never calls Jev", status "released as 0.2.0", "JEV001 has no automatic fix", `include` default "JSON, JS and TS" twice, the SPEC settings table without `jev.openaiApiKey`, "no MCP registry listing", `@v0.5.2` pins, a comment naming `config.test.ts` | Read against `tools/list`, the manifest and `src/lint/fix.ts` | `e830dff` | `src/docs/claims.test.ts` (8 cases) | `expected [ 'jevlint-le.exclude', …(11) ] to deeply equal [ …(12) ]`; `to contain 'as eight tools an agent can call'`; `expected '0.5.2' to be '0.8.0'`; `src/config/config.ts names config.test.ts: expected [...] to include 'config.test.ts'` |
| jevlint-le-bugs-1 | bugs | Eight lookup tables indexed with document text were object literals, so `constructor`, `toString`, `valueOf`, `hasOwnProperty` and `__proto__` answered with `Object.prototype`'s member. A Noul criteria key `constructor` got a safe fix renaming it to `function Object() { [native code] }`, written by `--fix`, fix on save and `fix_text`; a question typed `valueOf` threw in the reader and the file was counted unread | `{"criteria":{"constructor":"…"}}` through `lintText`; `{"type":"valueOf"}`; `scratchpad/lib-bug18.ts` | `6004b59` | `lint.test.ts` "text that names a property of Object.prototype" (15 cases) | `"text": "\"function Object() { [native code] }\""` offered as a safe fix; `expected [] to deeply equal [ 'JEV000' ]` |
| jevlint-le-bugs-2 | bugs | `EXTENSIONS`, `LANGUAGE_IDS`, `LANGUAGE_BY_EXTENSION` were object literals and the syntax guard used `in`: `jevlint-le a.constructor` read the file, failed inside the linter and exited 0 with "1 path could not be read"; `lint_text` with `filename: x.constructor` answered `unread`; `lib.lint(text, opts, 'constructor')` threw a TypeError instead of the sentence naming the four syntaxes | `jevlint-le a.constructor`; `scratchpad/mcp-drive.mjs`; `scratchpad/lib-bug18.ts` | `ea28548` | `lint.test.ts` "the file types the tool reads" (3); `cli.test.ts` "a file whose extension names a property of Object.prototype" (3); `diskDocument.test.ts` | `constructor: expected [Function Object] to be undefined`; `expected +0 to be 2`; `got 'TRIGGERS[syntax].test is not a functi…'` |
| jevlint-le-bugs-3 | bugs | `METHODS` was an object literal: method `constructor` reached `Object` and echoed the params as a result, `toString` answered `"[object Undefined]"`, `valueOf`/`hasOwnProperty`/`__proto__` answered `-32603` | `{"jsonrpc":"2.0","id":1,"method":"constructor","params":{"x":1}}` | `40b2b39` | `cli.test.ts` "answers a method named %s as unknown, like any other" (5) | `+ "result": { "x": 1 }`; `+ "result": "[object Undefined]"`; `-32603 "handler is not a function"` |
| jevlint-le-bugs-4 | bugs | Three wording patterns were quadratic in the instruction's length: `[^.?!]*\?` in `asked()`/`negatesTwice()`, and `before…TIME_ANCHOR`, `within…window` in the lexicon. 25 KB → 8.5 s, 50 KB → 36 s, 100 KB → 153 s, on every keystroke and holding every other server request | `scratchpad/quadratic.ts`, `scratchpad/before.ts`; a 1 MB `lint_text` hung the server over 60 s | `df98e6a` | `wording.test.ts` "a long instruction is read in one pass" (4) | `expected 147170.33 to be less than 2000`; `438598.52`; `401926.01`; `76591.84` |
| jevlint-le-bugs-5 | bugs | A byte order mark counted as column 1 on every reader from disk: the command line, `lint_paths` and the editor's workspace run, so a first-line finding sat one column right of the same file open in the editor | `printf '\xEF\xBB\xBF{…}' > a.json; jevlint-le --format compact a.json` → `1:91` against `1:90` | `b3c7cba` | `cli.test.ts` "a file that begins with a byte order mark" (3); `extension.test.ts` "reads a file from disk at the columns the editor shows" | `expected 'a.json:1:91  error  JEV006 …' to be 'a.json:1:90  error  JEV006 …'`; `expected Range{…} to deeply equal Range{…}` |
| jevlint-le-bugs-6 | bugs | `shortfall` said "Jev answered N of M requests" after a `--jev` run against OpenAI, while the report above said Luna | `--jev --jev-model gpt-6-luna` with a 401 | `ba55d27` | `cli.test.ts` "names Luna, not Jev, when a run against OpenAI falls short" | `expected 'jevlint-le: Sending 2 requests to Ope…' to contain 'OpenAI rejected the API key (401). Lu…'` |
| jevlint-le-bugs-7 | bugs | A project copy whose `package.json` could not be read, was not JSON or had no version was reported as no copy; the editor linted with its own silently, against the invariant that every fallback but "none installed" is named | `node_modules/jevlint-le/package.json` holding `{` | `9b2744a` | `installed.test.ts` (4); `extension.test.ts` "names a copy whose manifest cannot be read, and lints with its own" | `expected '$(checklist) Jev 1' to be '$(checklist) Jev 1 · project copy unr…'`; `expected undefined to deeply equal { …(2) }` |
| jevlint-le-errors-1 | errors | An unknown tool, a call with no name, arguments that were not an object, a required argument left out and an argument of the wrong type all came back as `isError` results; the protocol makes each a `-32602` error, and a host counts the two differently | `tools/call` with `name: lint_everything`; with no `params`; `lint_text` with `text: 5` | `af8853d` | `cli.test.ts` "refuses %s as invalid params, before any tool runs" (14) | `Tests  14 failed \| 146 skipped (160)`, every row answering a result where an error was expected |
| jevlint-le-errors-2 | errors | A frame with no `jsonrpc` member, or with `"1.0"` or `2`, was served as a request | `{"id":11,"method":"ping"}` → `{"result":{}}` | `5b34a79` | `cli.test.ts` "refuses a frame with %s and goes on serving" (3) | `+ "result": {}` where `-32600` was expected |
| jevlint-le-errors-3 | errors | When every named file failed inside the linter, the command line printed "0 findings (0 errors, 0 warnings) in 0 files", named them as unread and exited 0; `lint_paths` answered an ordinary report | `reader-failure.test.ts` with one file; `scratchpad/mcp-drive.mjs` | `1770a0c` | `reader-failure.test.ts` "fails the run when it was the only file", "is a failed call on the server when it was the only file" | `expected +0 to be 2`; `expected false to be true` |
| jevlint-le-errors-4 | errors | `stat` reported a FIFO, socket or device as `kind: 'file'`, and `readFileSync` on a pipe with no writer blocked for ever: the command line never exited and the server answered nothing more | `mkfifo pipe.json; jevlint-le pipe.json` (hangs) | `c6264c6` | `cli.test.ts` "names a path that is not a regular file, and never opens it", "refuses a named path that is not a regular file"; `e2e-cli.js` on a real `mkfifo` | `expected [ 'locked/q.json', …(2) ] to not include 'src/pipe.json'`; `expected +0 to be 2` |
| jevlint-le-errors-5 | errors | No command body had a handler for a throw; the editor logged the rejection and the command did nothing visible | A document whose `getText` throws, under `lintFile`, `checkWithJev`, `probeQuestion` | `a81fefc` | `extension.test.ts` "a command whose body throws … says so, instead of doing nothing" (3) | `Error: the document is gone` (the rejection reached the test) |
| jevlint-le-leaks-1 | leaks | `readline` held a request line in memory until its newline, with no stated maximum; one frame with no newline could grow until the process died | `scratchpad/mcp-drive.mjs` scenario E: 1, 8 and 32 MB single lines, no reply within 60 s | `3c01b60` | `lines.test.ts` (7); `cli.test.ts` "refuses a request line over the size limit and goes on serving" | `Error: Cannot find module './lines'`; `TypeError: line.trim is not a function` |
| jevlint-le-leaks-2 | leaks | Every `check_with_jev` or `probe_question` call that reached the network added a `process.once('SIGINT')` listener and an `AbortController`; nothing removed them | Read `mcp.ts:630,702` with `mcpMain.ts` `stopSignal` | `67b3420` | `process.test.ts` "listens for the interrupt once, however many calls ask for it", "aborts on the interrupt, and arms again for the next call" | `TypeError: createStopSignal is not a function` |
| jevlint-le-leaks-3 | leaks | The probe report page's `EventEmitter` was created at module load and never disposed, outliving deactivation | Read `probe.ts:183`; the disposal test | `9872025` | `extension.test.ts` "is made with the extension and disposed with it, report page included" | `expected [] to have a length of 1 but got +0` |
| jevlint-le-leaks-4 | leaks | `installedCopies.known` kept one entry per folder of every linted file for the life of the window; a workspace run over a large tree added every folder and nothing evicted | Read `installedCopies.ts:15-27` | `5e7c66d` | `installedCopies.test.ts` "remembers at most 512 folders, and lets the one asked about longest ago leave first" | `expected 1542 to be greater than 1542` |
| jevlint-le-leaks-5 | leaks | A `text` argument to `lint_text`, `fix_text`, `plan_jev`, `check_with_jev` or `probe_question` had no size limit, while files and standard input are held to 1,000,000 bytes | `lint_text` with 1,000,001 bytes of instructions | `89ce008` | `cli.test.ts` "is held to the size limit files are held to, by %s" (4) | `expected false to be true` (`isError`); the probe answered `'A probe sends the question against it…'` |
| jevlint-le-races-1 | races | `checkWithJev` read `jev.model` for the key's vendor, again inside the reviewer for the plan, and again for the run, across two awaits; the probe read it before and after its modal. A model switched while the confirmation was on screen sent the TypeSafe key to OpenAI | `extension.test.ts` with the new `onModal` hook switching the model | `4e7eaf6` | `extension.test.ts` "keeps to the vendor and model it started with when the setting changes mid-run", "keeps to the model it started with when the setting changes mid-run" | `expected 'https://api.openai.com/v1/decisions' to contain 'api.typesafe.ai'`; `expected "vi.fn()" to be called 5 times, but got 1 times` |
| jevlint-le-races-2 | races | The probe had no reentrancy guard: a second invocation while one was sending paid for a second set of answers and raced for the report page | Two `probeQuestion` runs with the first held at its first request | `1516f0e` | `extension.test.ts` "runs one probe at a time" | `× runs one probe at a time 30003ms` (both probes hung on the shared reply, the test timed out) |

## Carried and unknown

| Id or check | What is open | What would settle it |
|---|---|---|
| jevlint-le-carried-1 | `config.ts` `readRules` drops a rule entry with an unknown code from the editor settings silently, while `jevlint-le.json` refuses an unknown key with the file named. A typo in `jevlint-le.rules` turns a rule back on with no word. Surfaced, not patched: the lenient path may be relied on | The owner's choice between refusing (status bar `Jev not linted` naming the key) and keeping the editor lenient |
| jevlint-le-carried-2 | `provider.ts` TYPESAFE `fromBody` accepts any record as `answers`, so a 200 with `{ "answers": {} }` reads as a clean check with zero findings, against "A reply is a Jev reply or it is a failure" | The owner's choice: require every asked question id in the reply, or accept a partial reply as partial |
| FEAT-17 (C25, C36, C41, SPEC:872) | The MCP registry listing `io.github.nolindnaidoo/jevlint-le` could not be read from this machine: the registry host timed out twice. The site's `tools.test.ts` records it listed on 2026-10-10 at 0.6.0 | `curl 'https://registry.modelcontextprotocol.io/v0/servers?search=jevlint'` from a machine that reaches it |
| Observations | ERR-4: "could not be read" also covers a file the linter failed on. ERR-12: no mock hook for `withProgress`, `executeCommand`, `findFiles`. LEAK-5/LEAK-10: no repeat-dispose or growth-count test, the mock counts emitters only. LEAK-12: no RSS driver in the repo. BUG-10: `version()` in both entry points, `lineStarts` in two bases, `plural` in four modules. FEAT-9: no test opens a non-matching file and asserts no activation. FEAT-15: the npm tarball is listed, not installed | Each is a test-gap or wording item for the owner; none changes behaviour |

## Step 8: Close

| Check | Answer | Evidence |
|---|---|---|
| CLOSE-1 | pass | Every check in Steps 0 to 7 has an answer above; no `not done`, no blank row; one `unknown` (the registry listing), listed in the pull request |
| CLOSE-2 | pass | 20 findings fixed, each with commit and test above; 2 carried with the owner's decision named; observations listed |
| CLOSE-3 | pass | The "Failed without fix" column quotes each test's output with the fix absent, taken before the fix was written |
| CLOSE-4 | pass | The Step 0 table's Final column: every gate exit 0 on the release head `66e275d` and again on the branch head `105c152`, run by one script each time after the last commit, each gate unpiped into its own log. Nothing red that was green at baseline. The npm republish row stays n/a: 0.8.1 is unpublished, so the CI step would pass it |
| CLOSE-5 | pass | From `letools-site` with the repos beside it: `check:fleet ../` exit 0 ("27 shared files consistent across 16 extension repos"), `check:locales ../` exit 0, `check:doc-paths ../` exit 0 ("796 references across 17 repos all resolve"), `check:registry` exit 1 until `bun run sync:registry` regenerated `lib/tool-facts.generated.ts` for 0.8.1 (one line), then exit 0; the regenerated file is in the `letools-site` change for this pass, as the precedent passes did for their version bumps |
| CLOSE-6 | pass | `CHANGELOG.md` `## 0.8.1 — 2026-10-14` covers every behaviour change; AGENTS.md gains an invariant naming its test for each class fixed (prototype-name lookups, `-32602` against `isError`, bounded request lines, a command that throws, one probe at a time, settings read once, byte order mark, size limit on the server's text, every fallback named); `docs/rules/` regenerated with no diff |
| CLOSE-7 | pass | `git log main..HEAD --format='%ae %s'`: 22 commits, every author `13629544+nolindnaidoo@users.noreply.github.com`, every subject conventional (`bun run lint:commits`: "22 commit(s) conform"). `git diff --name-only main..HEAD`: 57 files, all under `src/`, `scripts/`, the two package directories, the documents and the manifests; no scratch file, no probe test, no debug output. The scratch drivers live in the pass's scratch directory, outside the repo |
| CLOSE-8 | pass | Branch pushed; one pull request against `main`, [nolindnaidoo/jevlint-le#30](https://github.com/nolindnaidoo/jevlint-le/pull/30). Its body is the findings table (id, step, what was wrong, commit, test), the open unknown, the two carried items and the observations, the gate results, and the sentence that publishing is not part of it. No attribution. Nothing merged, tagged or published |
| CLOSE-9 | pass | First run, on `66e275d`: nine of ten checks green and `CI on windows-latest` red in "Unit tests with coverage". The cause was this pass's own test: `claims.test.ts` "names only test files that exist" cut each path at its last `/`, and the walk joins with the platform's separator, so on Windows no name matched (`src\config\config.ts names extension.test.ts: expected [ 'src\agent-files.test.ts', …(103) ] to include 'extension.test.ts'`). The BUG-8 class, in a test the pass wrote; fixed with `basename` in `105c152`. Rerun on `105c152`: `CI on ubuntu-latest`, `CI on macos-latest`, `CI on windows-latest`, `Versions and registry identity`, `Commit messages`, `What changed`, `CodeQL`, `Analyze actions`, `Analyze javascript-typescript` all green; `auto-merge` skipped, as it is for every branch that is not Dependabot's. The gates marked Linux-only at baseline ran green there |
| CLOSE-10 | pass | `fleet-pass/LEDGER.md` gains the `jevlint-le` row: baseline `84dc063c`, this record, pull request #30, 2026-10-14, 20 fixed, 2 carried. The record is committed to `letools-site` in the same change, on the branch `fleet-pass/jevlint-le`, with `scripts/fleet-pass.test.ts` extended to hold one row for every repo in `OUTSIDE_FLEET` as well as `REPOS` (shown failing before the row existed: `expected [ 'colors-le', 'dates-le', …(14) ] to deeply equal [ …(15) ]`), and `lib/tool-facts.generated.ts` regenerated for 0.8.1 so `check:registry` passes |
| CLOSE-11 | pass | Checks added in that same change, none naming a tool repo: BUG-6, a pattern that scans from every start position to the end of a stretch is quadratic with no nesting, timed at two lengths; ERR-2, a run whose every input failed inside the tool is a failed run and not nothing found; ERR-14, an unknown tool and misshapen arguments are `-32602`, held in a table apart from `isError` results; ERR-16 widened to `N` and `M`, a path that is not a regular file told apart by its kind before it is opened and driven on a real `mkfifo`; LEAK-2 widened to `M`, a process listener added per request; LEAK-11, every entry that takes text held to the one size limit; RACE-7, driven by a mock hook that changes a setting while a modal is on screen, reading which vendor received the request |
