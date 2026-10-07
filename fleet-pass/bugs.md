# Step 3: Bugs

Code that runs without complaint and produces the wrong answer. The feature
works, the tests are green, and the output is incorrect for some input.

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

Re-read in full: every non-test file that computes a result. That is the
engine directory (`src/detect/` or `src/extraction/`), analysis, conversion
and report modules, the command files that orchestrate them, the MCP tool
handlers, and every file under `crate/src/`. Read each file's tests and
fixtures beside it, to learn what inputs were never tried.

For each function, write down the input domain before judging the body:
what types, what ranges, what a caller can actually pass. Most checks below are
that domain's edges.

## Checks

**BUG-1. Empty and minimal input.** For every public function and every MCP
tool: empty string, whitespace only, a single character, a single element, an
empty collection. Each has a test and returns a defined result.

**BUG-2. Legitimate falsy values.** Every truthiness test (`if (!x)`,
`x || default`, `x ? a : b`) is read against its domain. Where `0`, `''`,
`false` or `NaN` is a valid value, the test must be explicit. A threshold of
`0` and an empty string meaning "cleared" have both shipped as defects here.

```bash
grep -rnE 'if \(![a-zA-Z_.]+\)|\|\| ' src --include='*.ts' --exclude='*.test.ts'
```

**BUG-3. Boundaries and off-by-one.** Every `slice`, `substring`, `substr`,
index arithmetic, range construction, loop bound and length comparison. State
whether each bound is inclusive and test the element on each side of it.

**BUG-4. Text encoding and line shape.** A byte-order mark, CRLF line endings,
a file with no trailing newline, a lone `\r`, tabs, characters outside the
Basic Multilingual Plane, combining characters, and text that is not valid
UTF-8. Positions and columns reported to the user are checked against a
document containing each.

**BUG-5. Ordering.** Every `sort`, `localeCompare`, comparator and
"first match wins" loop. A bare `sort()` orders by UTF-16 code unit and
`localeCompare` orders by the machine's locale, so output differs between
machines and from the crate. Where the repo names a comparison function to
use, every sort uses it.

```bash
grep -rnE '\.sort\(|localeCompare|toLocale[A-Z]' src --include='*.ts' --exclude='*.test.ts'
```

**BUG-6. Regular expressions.** Read every pattern.
- A pattern with the `g` or `y` flag held outside the function keeps
  `lastIndex` between calls and skips matches on the second call.
- Nested or overlapping quantifiers are tested with a long non-matching input
  for catastrophic backtracking.
- Anchors, case sensitivity and the `u` flag match what the format requires.
- The same pattern defined in two places is BUG-10.

**BUG-7. Number handling.** `parseInt` without a radix or on text with a
trailing suffix, `Number('')` being `0`, float comparison, integers above
`Number.MAX_SAFE_INTEGER`, negative zero, and locale-dependent formatting in
anything a machine reads back.

**BUG-8. Paths.** Separators on Windows, a trailing slash, a root path, a path
containing spaces or characters that are special in globs, case-folding
filesystems, and URIs whose scheme is not `file`. Any path derived by string
slicing is tested with each.

**BUG-9. Casts where untrusted input enters typed code.** Every `as` cast,
non-null `!`, and `any` is read. One sitting on user input, parsed JSON, a
quick-pick result or a command argument is replaced by a check, or justified in
a comment that names why the value cannot be anything else.

```bash
grep -rnE '\bas [A-Z][A-Za-z.]*\b|\bas unknown\b|[a-zA-Z_\])]!\.|: any\b' src --include='*.ts' --exclude='*.test.ts'
```

**BUG-10. Duplicated logic.** List every function name defined more than once
and every pattern or constant that appears twice.

```bash
grep -rhoE '^(export )?(async )?function [a-zA-Z0-9_]+' src --include='*.ts' --exclude='*.test.ts' \
  | awk '{print $NF}' | sort | uniq -d
```

For each pair, read both bodies. Either they are meant to be one, and
equivalence is proven by comparing outputs over the real input domain before
merging, or they share a name and differ in meaning, and every call site is
checked for which one it needs. A duplicated security predicate is the worst
case, because adding a rule to one copy reopens the hole in the other.

**BUG-11. Dead and inert branches.** A branch whose arms return the same value,
a condition that can never be true, a parameter that is never read, an option
accepted and ignored. Check whether anything downstream compensates before
removing. If it might, raise it.

**BUG-12. Mutation of shared values.** A parameter, a config object, a default,
or a module-level constant that some path mutates. Frozen objects make this
throw in strict mode and fail silently otherwise.

**BUG-13. Output that contradicts the module.** Every sentence the tool shows a
user about a result is read against what the module's own documentation says it
can establish. A detector documented as unable to prove safety must never
print that something is safe.

**BUG-14. Disclosure in previews.** Any truncated preview of a sensitive value
is checked for inputs shorter than the cut, which a fixed-length cut discloses
whole. Check the surrounding context field as well, since it is usually the raw
line.

**BUG-15 (`M` `C`). Agreement outside the corpus.** Where the extension and the
crate implement the same engine, feed both the edge inputs from BUG-1 to BUG-8
and compare. Agreement on a shared defect is still a defect. Parity means both
are right, not that both copy the same quirk.

**BUG-16 (`C`). Arithmetic and indexing in Rust.** Integer overflow in release
builds, slicing a `str` at a byte offset that is not a character boundary,
indexing that can panic, `as` casts that truncate, and recursion with no depth
limit on attacker-shaped input.

**BUG-17. The documented invariants hold.** Each item under the repo's
"Invariants" and "Hard rules" headings is a claim. For each, name the test
that fails if it is broken. An invariant with no such test is a `test-gap`
finding.

## Done when

Every file in scope is ticked as read, each check has an answer per surface
with evidence, and every wrong result has a failing test and a finding id.
