# Fleet audit checklist

The review procedure for the tool repos. It lives here rather than in each repo
because it is one document, and sixteen copies of a checklist drift.

## The governing rule

**Review one tool properly, fix it, then move to the next.** Do not sweep a
codemod across the family and fix the fallout afterwards.

The scope of that rule is *behaviour*. A mechanical change a gate can verify —
propagating a config file, a workflow edit, a rule reworded in every
instruction file — is fine to apply fleet-wide in one pass, because
`check:fleet`, the per-repo suites and the agent-files gate all fail on a bad
copy. What must never be batched is a change to what the code *does*:
localization passes, extraction edits, error handling. Those produce
batch-shaped blind spots, and they pass typecheck and tests while doing it.

**Do not let your verification share a blind spot with your edit.** A
fleet-wide renumbering once matched only lines where the number and the keyword
appeared *together*, and was verified with the same filter — so eight files
where the phrase wrapped across two lines passed a check that could not see
them. Verify with a *different* query than the one that made the change: grep
the raw value with no qualifier and read the hits.

Why this matters: a codemod localizing `label:` properties silently broke seven
quick-pick selections in one repo (labels translated, identity comparisons
still testing English literals) and localized a `CodeAction`'s invisible
`command.title` while leaving the visible constructor argument in English. Both
passed typecheck, lint, 210 unit tests and 8 integration tests.

## Localization

1. **Translated label compared to an English literal.** `showQuickPick` returns
   the item and code matches it by `label === 'English'`. Localize the label
   and the match silently never fires. Bind the label to a const and compare
   that. Same for dialog buttons from `showWarningMessage`.
2. **Positional API arguments that are display strings.**
   `new vscode.CodeAction(title, kind)` — the constructor arg is what the
   lightbulb shows; `command.title` is not. Property-based codemods miss it.
3. **`l10n.t()` at module scope** resolves at require time, not activation.
   `scripts/check-bundle.js` rejects it. Build the value in a function.
4. **Never-translate values:** colour literals (`rgb(255, 0, 0)`, `#FF0000`),
   `WCAG AA`/`AAA`, extension ids, codicons `$(...)`, URLs, example patterns,
   format names (JSON/YAML/CSV), product names, and generated report or
   document content — that last one is an artifact users save, so changing it
   is an output change.
5. **Machine-translation context errors.** DeepL rendered `Index {0}` as 目次
   ("table of contents") for a CSV column ordinal, and `WCAG AA` as `WCAG AA级`
   in zh-cn while leaving `WCAG AAA` alone. Spot-check short, ambiguous strings.
9. **`validateInput` callback returns.** Input-box validation messages are
   returned from a callback, not assigned to a `prop:`, so property-based
   passes miss them entirely.
12. **`progress.report({ message })`** is a third missed channel. 35
   unlocalized progress messages were found across five repos *after* one had
   been declared finished — two of them in that same repo.
21. **Localization channels differ per repo — enumerate, do not assume.** One
   repo routes notifications through a hexagonal `UserInterface` port
   (`ui.showWarningMessage(...)`), so a pass built around the others'
   `notifier.*` API missed 24 strings. Before declaring a repo localized, grep
   for what *it* calls: notifier methods, any ui port, status-bar `tooltip =`,
   `progress.report({message})`, `validateInput` returns, and message-builder
   functions returning template literals.

## Correctness and honesty

6. **`return options as XOptions`** at the end of an incremental builder
   bypasses the compiler exactly where user input becomes config. These cluster
   in oversized command files.
13. **UI claims that contradict the module's own docstring.** One ReDoS
   detector documents that it "cannot prove a pattern safe" while its report
   told users "This pattern is safe to use". The README was correct and the
   product contradicted it. When a module honestly scopes itself, check every
   string that reports its result.
15. **Silent drops with `console.*` as the only record.** Extension-host logs
   are invisible to users. A loop that catches, logs and continues makes the
   user-visible count come up short with nothing to explain it. Surface the
   shortfall in the output.
16. **Truncation is not redaction.** A findings preview using
   `value.substring(0, 20)` is partial for a 40-char secret and the *whole*
   value for anything shorter, while the password detector matches from 8. Any
   fixed-length cut fully discloses everything below it, silently. Cap at a
   length **and** a fraction, and always mark the value elided. Check the
   surrounding "context" field too — it is usually the raw source line and
   contains the very thing being previewed.
18. **Catch-and-return-a-default is a false negative.** Four detectors in one
   repo caught any error and returned a "nothing found" result, so a crashed
   check read identically to a clean one. One returned `allowsCrawling: true`
   on fetch failure, and its test called this the "safe default" while it was
   the least safe answer available. Look for `catch { return createDefaultX() }`.
   Inner best-effort catches (one signal among several) are legitimate; only
   top-level detector entry points matter.
22. **`(error as Error).message` is a lie the compiler accepts.** A parser
   throwing a string or plain object produces "Failed to parse JSON: undefined".
   Grep every repo for `as Error` and for quick-pick `value as SomeUnion` —
   both are casts sitting exactly where untrusted input enters typed code. Fix
   at the source, not the call site.
26. **Discarded return values that mean "it didn't work".**
   `vscode.workspace.applyEdit` returns false for a rejected edit — a read-only
   document, or one changed underneath the command. Two repos threw it away and
   then announced "Sorted 12 items" over an untouched document. Grep
   `await vscode.workspace.applyEdit` and check every caller uses the result.
   One file per repo usually gets it right, which is what makes the others look
   normal.

**A refused document must come back with a named diagnostic**, never an empty
result and an empty `diagnostics` array. Zero findings plus zero diagnostics
reads as "this file is clean" for a file that was never read — the silent miss
the whole family exists to prevent, and worse than a false positive because
nothing prompts anyone to look. The established shape:

```json
{"code": "parse-error", "message": "Failed to parse CSV: quoted field is never closed", "severity": "error"}
```

Codes disagree across repos (`parse-error` vs `parsing`) and reconciling them
is a cross-repo change nobody has made — mirror the repo's own local convention
first, then the nearest sibling, and do not add a third spelling. The message
should name *which* malformation occurred. A well-formed document stays silent
with `diagnostics: []`. **Check this by running the MCP server on a malformed
document, not by reading the code** — one repo looked correct and was the
outlier, because its reader returned an empty vec and the extension had
`catch { return [] }`, so a file holding real data reported clean. It survived
because every test asserted on well-formed input.

**Bug-for-bug parity is not automatically right.** Where two frontends agree
only because both reproduce an upstream parser's quirk, they are both wrong and
the corpus cannot see it. Parity means the shared MCP tool answers identically;
it does not mean copying a defect.

## Duplication

7. **Duplicate implementations of the same maths** in two modules with
   different type vocabularies. One repo had two `rgbToHsl`. Equivalent today
   is a divergence risk, not a pass.
10. **Copy-pasted helpers across command files.** One repo had two `rgbToHsl`,
   three `parseColorToHSL`, three `hexToHSL` and three valid-colour predicates,
   with comments recording the chain. Grep for repeated `function` names across
   `commands/` and `analysis/`. **Prove equivalence before merging** — compare
   outputs over the real input domain, do not eyeball it.
14. **Same name, same signature, different semantics.** One repo had two
   `formatDuration(ms: number): string` — one for date spans, one for elapsed
   time — and the report used the elapsed-time one for date spans, so a year of
   dates read "8760.00h". A name grep finds these, but only reading both bodies
   tells you whether it is duplication or a collision. Check which one each
   *call site* needs.
24. **A security predicate duplicated across parsers is the worst duplicate.**
   One repo's pseudo-scheme guard — from a real CodeQL
   `js/incomplete-url-scheme-check` finding — existed twice, once per format,
   each commented as a copy of the other. Adding a scheme to one would
   reintroduce the bug in the other format only, and the extractors are tested
   separately so nothing would catch it. Define once, and test the properties
   the original finding was about (case-insensitivity, leading whitespace).
25. **A notifier that claims to be the single channel, bypassed.** One repo's
   notifier documents that all notifications route through it so the
   `notificationsLevel` setting actually governs them — while three commands
   called `vscode.window.show*Message` directly, so a user who chose `silent`
   was notified anyway. Grep
   `vscode.window.show(Information|Warning|Error)Message` and check each hit
   against the notifier's claim. Modal dialogs awaiting a choice are
   legitimately direct: they are interaction, not notification.

## Structure and coverage

8. **Coverage weighted wrong.** `providers/codeActions.ts` at 0% branch while
   extraction sits at 92%. Check per-file, not the headline. A provider built
   inline inside its `register*` function is unreachable from a test —
   registration hands it to VS Code and nothing gives it back. Export a factory.
11. **Oversized command files hide the above.** Splitting prompting and types
   into sibling modules (839 → 549, 732 → 437) also stops untested prompt code
   hiding behind well-tested logic — one file's measured coverage rose from
   79.9% to 87.7% purely from being measured separately.
17. **Check the fleet for a missing sibling test.** One repo's `activate` was
   the only entry point at 0% coverage; the other nine cover it from
   `services/services.test.ts`. Compare test *files* across repos, not just
   coverage percentages — an absent file reads as "nothing to report".
19. **Existing tests can pin the defect.** Three tests in one repo asserted the
   error-swallowing behaviour, one as a characterization snapshot. When a fix
   breaks tests named "handles errors gracefully", read them before assuming
   the fix is wrong, and update the golden in the same commit.
23. **A branch whose arms return the same value is inert**, and usually drags a
   cast with it. One repo tested `ENOENT`/`EACCES`/`EPERM` and returned the
   same fallback either way, needing an `as NodeJS.ErrnoException` purely to
   run a condition with no effect. Check whether anything downstream
   compensates before deleting, then remove branch and cast together.

## Mocks

**Check mock fidelity before trusting coverage.** Every repo's
`src/__mocks__/vscode.ts` originally hardcoded the success path: `applyEdit`
returned `true`, `openTextDocument` never threw, `clipboard.writeText` never
rejected, progress tokens were permanently `false`. Any product code ignoring a
failure signal looked fully tested while its failure arm had never executed.
That single gap hid one bug class fleet-wide — **a command announcing a result
it never delivered**.

The hooks that exist now: `_setApplyEditResult`, `_setOpenDocumentError`,
`_setClipboardError`, `_setEditResult`, `_setEditError`, `_cancelAfterProgress`.
A path with no way to fail in the mock is an untested path regardless of the
coverage percentage.

**Never report a defect from reading alone.** Drive it — a probe test, or the
real extension host. A claimed bug in this fleet (`Range(0, 0, lineCount, 0)`
"drops the final line") turned out to be false when actually run: VS Code
clamps the out-of-range position. Every new negative test must be shown to fail
with the product fix stashed, or it is proving nothing.

## Per-repo

20. **Browser hardening (scrape-le only).** It launched with `--no-sandbox
   --disable-setuid-sandbox` unconditionally while loading arbitrary
   user-supplied URLs. Sandboxed launch first, opt-out only as fallback.
   `validateUrl` correctly restricts to http/https — keep it that way.

## Inherited template defects

The family was generated from one template around Aug 2025, and that template's
`.cursorrules` codified the broken patterns, so every repo inherited them. The
first repo was rehabilitated in July 2026; check any repo that has not had a
pass for:

1. VSIX excluding `node_modules` with **no bundler**, so the extension cannot
   activate at all ("Cannot find module 'vscode-nls'").
2. Runtime `vscode-nls` localization that never loads — `nls.config()` called
   without `__filename`, no `vscode-nls-dev` bundles. Manifest `%key%`
   translations do work, which is what makes this look fine.
3. Large blocks of declared settings with zero consumers.
4. Settings export/import/reset commands registered but missing from
   `contributes.commands`, and broken anyway.
5. Writes to undeclared `_internal.*` config keys, which VS Code rejects. Use
   `globalState`.
6. Vitest coverage `threshold` (inert) instead of `thresholds`.
7. `tsconfig` excluding tests from typecheck.
8. Fabricated README test and coverage tables, and stale `docs/` trees.
9. `resourceExtname in .ext` when-clauses that never match.

## Launching a VS Code dev host

`--user-data-dir` must be a **short** path, such as `/tmp/le-rec`. VS Code
creates its main IPC socket inside that directory named
`<major.minor>-main.sock`, and Unix domain socket paths are capped at 104
characters by the OS — so a long path makes `listen()` fail with `EINVAL` and
VS Code exits during startup with **no window and no visible error**. A session
scratchpad path is already too long before you add anything to it. This
overrides the usual "temp files go in the scratchpad" habit; it is a hard OS
constraint. Workspace and folder arguments have no such limit.

The failure is version-sensitive, because the socket name changes length
between releases, so it presents as "it worked yesterday, the update broke it."
To see the real error, run the executable directly — `open -na` and the `code`
shim both swallow stderr:

```
"/Applications/Visual Studio Code.app/Contents/MacOS/Code" \
  --user-data-dir=/tmp/le-rec --new-window <folder> 2>&1 | head
```

The executable is `Code`, not `Electron`.

## Finally

**Verify every scripted replacement actually applied.** A `str.replace` that
silently matches nothing looks identical to success. Two edits were lost to
tab-depth mismatches before an `assert old in s` caught it.
