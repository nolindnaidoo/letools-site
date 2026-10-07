# Step 1: Inventory

Build the lists that every later step is checked against. "Nothing was missed"
is only checkable when there is a written denominator, and this step writes it.

<!-- read-rule:start -->
> **Read rule.** Every file in this document's scope is opened and read from
> its first line to its last, during this pass, before any check below is
> answered. Nothing is answered from memory of this repo, from a sibling repo,
> from an earlier pass, from a summary, or from a comment, a test name, a
> README or an `AGENTS.md`. A search result locates code. It never replaces
> reading the file it points into. A check on a file that was not read in full
> during this pass is `not done`, never `pass`. Where the code and a run cannot
> settle a question, the answer is `unknown` plus what is needed to settle it.
> No guesses.
<!-- read-rule:end -->

## Scope

Every tracked source file on all four surfaces. This is the step where the
whole repo is read.

## Checks

**INV-1. The read manifest is generated, then every file on it is read.**

```bash
git ls-files -- src test scripts mcp crate/src crate/tests package.json server.json \
  | grep -vE '__fixtures__|__snapshots__|/assets/|^src/i18n/' \
  | xargs wc -l
```

Paste the output into the record. Tick a file only after reading it from line
one to the end in this pass. Translation catalogues are excluded here because
`translations.md` reads them. Fixtures and snapshots are read when the test
that owns them is read.

Any tracked file under those roots that the filter drops and no later step
reads is a hole. List what the filter removed and say which step covers each.

**INV-2. Manifest contributions.** From `package.json`, read directly:

```bash
jq '.contributes | keys' package.json
jq '.activationEvents, .main, .l10n, .engines' package.json
```

Write one table per contribution point that exists, with a row for every
entry: commands, menus (each `when` clause written out), keybindings,
configuration properties (type, default, enum), activation events, MCP server
definition providers, and any other key the first command prints. A key the
tables do not cover is a hole in this document. Add it.

**INV-3. Registrations, matched against INV-2 in both directions.**
For every command id in the manifest, the file and line that registers it. For
every `registerCommand` and `register*Provider` call in source, the manifest
entry that declares it. Unmatched rows on either side go to
`broken-features`.

```bash
grep -rnE 'register[A-Za-z]*\(' src --include='*.ts' --exclude='*.test.ts'
```

**INV-4. Settings and their consumers.**
For every configuration property: where it is read, its entry in the config
defaults, and every code path whose behaviour it changes. A property with no
consumer, and a config key read in source with no declaration, both go to
`broken-features`.

**INV-5. Resources with a lifetime.**
Every place the code creates something that must later be released. For each
row: what creates it, file and line, what releases it, and on which paths.

- `E`: status bar items, output channels, event listeners (`onDid*`),
  file-system watchers, timers and intervals, webviews, decorations,
  diagnostics collections, providers, child processes, browser instances,
  temporary files.
- `M`: stdin and stdout listeners, buffers that accumulate input, timers.
- `C`: open file handles, spawned threads, temporary directories.
- All: every module-level or static mutable value. Maps, arrays, caches,
  counters, memoised results, regular expressions with the `g` or `y` flag
  held outside a function.

```bash
grep -rnE 'create[A-Z][A-Za-z]*\(|onDid[A-Z]|setTimeout|setInterval|new Map|new Set|spawn|\.on\(' \
  src --include='*.ts' --exclude='*.test.ts'
grep -rnE '^(let|var) |^const [a-zA-Z_]+ = (new |\[|\{)' src --include='*.ts' --exclude='*.test.ts'
grep -rnE 'static |OnceLock|LazyLock|thread::|Mutex|RefCell|File::|tempfile' crate/src
```

These locate candidates. The table is filled from reading the files, and a
resource the searches did not find still belongs in it.

**INV-6. Suspension points.**
Every `await` in non-test extension and MCP source, by file and line, with the
function it sits in. For each: what state the function read before it and uses
after it. This table is the input to `race-conditions`.

```bash
grep -rnE '\bawait\b|\.then\(' src --include='*.ts' --exclude='*.test.ts'
```

**INV-7. Failure sites.**
Every `try`, `catch`, `.catch(`, `throw`, and promise that is neither awaited
nor caught. In the crate, every `unwrap`, `expect`, `panic!`, `unreachable!`,
`?` at a boundary and `process::exit`. This table is the input to `errors`.

```bash
grep -rnE '\b(try|catch|throw)\b|\.catch\(|\bvoid [a-z]' src --include='*.ts' --exclude='*.test.ts'
grep -rnE 'unwrap\(|expect\(|panic!|unreachable!|process::exit|std::process::exit' crate/src
```

**INV-8. User-visible strings, by channel.**
Every channel through which this repo puts text in front of a user, and every
string that goes through it. Enumerate the channels this repo actually uses.
They differ between repos, and a list assumed from a sibling has missed whole
classes before. Candidates: notifications, modal dialogs and their buttons,
quick-pick items and placeholders, input-box prompts and `validateInput`
returns, `progress.report({ message })`, status bar text and tooltips, output
channel lines, code action titles, hover and diagnostic messages, generated
report content, manifest titles and descriptions, CLI output, MCP tool
descriptions and error messages. This table is the input to `translations`.

**INV-9. Machine interfaces.**
- `M` and `C`: every MCP tool in each server, with its name, input schema and
  the shape of a success and a refusal.
- `C`: every CLI subcommand and flag, and every exit code with the condition
  that produces it.
- `N`: the `bin` entry, the files the package ships, and the three version
  fields that must agree (`package.json`, `mcp/package.json`, `server.json`).

**INV-10. Claims.**
Every sentence in `README.md`, `mcp/README.md`, `crate/README.md`, the
manifest `description` and the help command that states what the tool does,
refuses, supports or measures. One row each. `broken-features` matches every
row to a test or a run.

**INV-11. Tests, matched to what they cover.**
Every test file, the module it exercises, and for each non-test source file
the test file that covers it. A source file with no row is recorded as a
`test-gap` candidate for the step that owns that file's risk.

## Done when

Every file in INV-1 is ticked, and tables INV-2 to INV-11 exist in the record
with no row left blank.
