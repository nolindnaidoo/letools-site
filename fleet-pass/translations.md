# Step 7: Translations

Missing, unloaded and incorrect translations. There are two separate
mechanisms and they fail independently, so a correctly translated command
palette says nothing about the runtime strings.

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

Read in full: `package.json`, `package.nls.json`, every
`src/i18n/package.nls.*.json`, `l10n/bundle.l10n.json`, every
`l10n/bundle.l10n.*.json`, `test/integration/l10n.test.ts`, `.vscodeignore`,
the `copy:i18n` and `clean:i18n` scripts, and every source file that appears
in the INV-8 table.

**Every value in every locale file is read.** That is each key times each
locale, for both mechanisms. A catalogue that was skimmed is `not done`.

| Mechanism | Source of truth | Translations | Loaded by |
|---|---|---|---|
| Manifest | `package.nls.json` | `src/i18n/package.nls.*.json`, copied to the root at prepublish | VS Code, replacing `%key%` in `package.json` |
| Runtime | `l10n/bundle.l10n.json` | `l10n/bundle.l10n.*.json` | `vscode.l10n.t()`, enabled by `"l10n"` in `package.json` |

## Checks: nothing is missing

**L10N-1. Every `%key%` in the manifest has an entry.** Across the whole
`package.json`, not only command titles.

```bash
diff <(grep -oE '%[^%" ]+%' package.json | tr -d '%' | sort -u) <(jq -r 'keys[]' package.nls.json | sort)
```

No output means the two sets are equal. A key only on the left reaches the
user as literal `%text%`. A key only on the right is dead.

**L10N-2. Every locale file has exactly the source's keys**, for both
mechanisms.

```bash
for f in src/i18n/package.nls.*.json; do
  diff <(jq -r 'keys[]' package.nls.json) <(jq -r 'keys[]' "$f") >/dev/null || echo "DRIFT $f"
done
for f in l10n/bundle.l10n.*.json; do
  diff <(jq -r 'keys[]' l10n/bundle.l10n.json) <(jq -r 'keys[]' "$f") >/dev/null || echo "DRIFT $f"
done
```

**L10N-3. The locale set is the family's.** List the locale codes present for
each mechanism. Both lists are equal to each other and to the count the site
derives. `bun run check:locales ../` from the site passes for this repo.

**L10N-4. Every runtime string in source is in the bundle, and the reverse.**
Extract every first argument to `l10n.t(` by reading each call, including
calls that wrap across lines, and compare the set with the bundle's keys. A
string in source and not in the bundle shows in English everywhere. A key in
the bundle and not in source is dead, or it is the old wording of a string that
was edited, which means the new wording is untranslated.

```bash
grep -rnE 'l10n\.t\(' src --include='*.ts' --exclude='*.test.ts'
jq -r 'keys[]' l10n/bundle.l10n.json
```

The search finds the call sites. The strings are taken from reading them.

**L10N-5. Every user-visible string is localized or deliberately not.** Each
row of INV-8 is one of: passed through `l10n.t()`, a manifest `%key%`, or on
the never-translate list below with the reason. The channels that property
searches miss are checked by name:
- positional constructor arguments that are display text, such as the title in
  `new vscode.CodeAction(title, kind)`
- `validateInput` callback returns
- `progress.report({ message })`
- status bar `text` and `tooltip`
- quick-pick `label`, `description`, `detail` and `placeHolder`
- dialog button labels
- strings returned by message-builder functions and template literals
- any UI port or wrapper this repo routes messages through

## Checks: what is there actually loads

**L10N-6. No `l10n.t()` at module scope.** It resolves when the module is
required, before the bundle is loaded, and stays English. Read every call
site's enclosing scope. `bun run check:bundle` rejects it, and the script is
read to confirm how.

**L10N-7. No template literals or concatenation inside `l10n.t()`.** The
lookup key is the literal string. An interpolated one never matches the bundle.
Values go in as positional `{0}` arguments.

**L10N-8. The shipped VSIX contains every catalogue.**

```bash
bun run package && unzip -l release/*.vsix | grep -E 'nls|l10n'
```

Both sets, every locale. Then confirm `clean:i18n` left no copied catalogue in
the working tree.

**L10N-9. A translated string is shown in a real host.** An integration test
launches the host in a non-English locale and asserts one manifest string and
one runtime string in that language. If no such test exists, that is a
`test-gap` finding. Parity of files does not show that either mechanism loads.

## Checks: what loads is correct

**L10N-10. Placeholders survive.** For every key, each locale's value contains
the same set of `{n}` placeholders as the source.

```bash
for f in l10n/bundle.l10n.*.json; do
  jq -r 'to_entries[] | select(([.key | scan("\\{[0-9]+\\}")] | sort) != ([.value | scan("\\{[0-9]+\\}")] | sort)) | .key' "$f" \
    | sed "s|^|$f: |"
done
```

**L10N-11. Untranslated values are each accounted for.** List every value
identical to the English source.

```bash
for f in l10n/bundle.l10n.*.json; do
  jq -r 'to_entries[] | select(.key == .value) | .key' "$f" | sed "s|^|$f: |"
done
for f in src/i18n/package.nls.*.json; do
  jq -r --slurpfile en package.nls.json 'to_entries[] | select(.value == $en[0][.key]) | .key' "$f" | sed "s|^|$f: |"
done
```

Each hit is a product name or other never-translate value, or it is a missing
translation.

**L10N-12. Never-translate values are intact in every locale.** Product and
extension names, command ids, setting keys, codicons `$(...)`, URLs, file
names, format names (JSON, YAML, CSV), standards and levels (`WCAG AA`,
`AAA`), colour and code literals, and example patterns. Search each locale for
each such token from the source and confirm it is unchanged.

**L10N-13. Each value means the right thing in its place.** For every key,
find where the string is shown, then read each locale's value with that context
in mind. Short and ambiguous strings are where machine translation fails: a
column ordinal `Index` rendered as "table of contents", a verb rendered as a
noun, a button rendered as a sentence. Record every value that does not fit its
context, with the key, the locale, the value and the reason.

What cannot be judged with confidence in a given language is recorded as
`unknown` for that key and locale. It is not passed.

**L10N-14. Each value is in its own language and script.** No English left in
part of a sentence, no value from another locale's file, no mixed scripts.
`check:locales` covers the mechanical part, and reading every value covers the
rest.

**L10N-15. Plurals and counts read correctly.** Strings such as `{0} item(s)`
are read in each locale for zero, one and many.

**L10N-16. Consistency within a locale.** The same source term is translated
the same way across the manifest and the runtime bundle in one locale, so a
command's title and the message it produces use the same word.

## Checks: localization did not break behaviour

**L10N-17. No translated label is compared to an English literal.** Every
quick-pick and dialog result is matched by identity, a bound constant or a
non-display field, never `label === 'English text'`. Localizing the label
makes that comparison silently never fire.

```bash
grep -rnE "\.label ===|=== '[A-Z][a-z]+|showQuickPick|show(Warning|Information|Error)Message" \
  src --include='*.ts' --exclude='*.test.ts'
```

**L10N-18. Machine-read output is not localized.** Generated reports,
clipboard content, MCP responses, CLI output and anything a user saves or
another program parses stay stable across locales, unless the repo documents
otherwise. State what the repo's rule is from its own documents and code, then
check each output against it.

**L10N-19 (`C` `M`). The non-extension surfaces are stated.** Record whether
the crate, CLI and MCP servers produce localized text. If they do not, that is
the answer and the evidence is the search that shows it. If they do, checks
L10N-2 to L10N-16 apply to them.

## Done when

Every catalogue is ticked as read in full, every row of INV-8 is classified,
and every missing, unloaded or wrong value has a finding id. A wrong value's
"test" is the corrected catalogue plus, where the defect was mechanical, the
check that would have caught it.
