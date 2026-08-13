#!/usr/bin/env bun
/**
 * Every file path named in a governing doc, checked against the tree.
 *
 * Two of the crate standards told the reader their MCP contract fixture was
 * `fixtures/mcp-extract-paths.json`. That is paths-le's fixture; the paragraph
 * had been copied and the tool name localised while the filename was not. The
 * file each named does not exist in its own repo, and nothing noticed, because
 * a doc is the one artefact in this family with no compiler and no test.
 *
 * Splitting the shared standard out of those files was the other candidate fix.
 * It was measured and rejected: 9.8% of crate/AGENTS.md is genuinely shared,
 * and the sections that drifted — "Hard rules", "Testing", "Layout" — are 15 or
 * 16 distinct bodies across 16 repos. The split would have moved the wrong 10%.
 *
 * Run: bun run check:doc-paths [root]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const DOCS = ['AGENTS.md', 'CLAUDE.md', 'crate/AGENTS.md', 'crate/CLAUDE.md'] as const

/**
 * SPEC.md is deliberately absent.
 *
 * A behaviour spec's job is to show inputs, and paths-le's is full of paths
 * that are examples rather than references — `src/app.ts`, `./gone.ts`,
 * `images/bg.png`. Checking them reports a defect for every case the spec was
 * written to describe, which is how a gate teaches people to ignore it.
 */
const EXTENSIONS = /\.(md|rs|ts|tsx|js|mjs|cjs|json|toml|yml|yaml|lock|txt|png|gif|jpg|vsix|sh|py)$/

/** Roots a reader would resolve a reference from, in a repo of this shape. */
const ROOTS = [
  '',
  'src',
  'src/extraction',
  'src/detectors',
  'src/mcp',
  'crate',
  'crate/src',
  'crate/tests',
] as const

export function looksLikePath(token: string): boolean {
  if (token.includes(' ')) return false
  if (token.startsWith('-')) return false
  if (/^[A-Z_]+$/.test(token)) return false
  // A scheme, a scoped npm name, a placeholder, a home-relative or absolute
  // path: none of these is a reference into this repository.
  if (/:\/\/|^@|…|<|>|\\|\?|^~|^\//.test(token)) return false
  // An extension list — `.js/.cjs/.mjs` — is prose about formats, not a path.
  if (token.split('/').every(part => part.startsWith('.') && !part.includes('.', 1))) return false
  if (/[{}[\]]/.test(token)) return false
  return EXTENSIONS.test(token) && token.includes('/')
}

/**
 * What to look for on disk.
 *
 * A glob is a real reference — `l10n/bundle.l10n.*.json` names a set that
 * exists — so its directory is checked instead of the literal string. That
 * still catches the mistake this gate is for: a wrong directory in a copied
 * paragraph fails, a wildcard does not.
 */
export function target(token: string): string {
  if (!token.includes('*')) return token
  return dirname(token)
}

/** Backticked tokens in a document, punctuation trimmed. */
export function pathsIn(source: string): readonly string[] {
  const seen = new Set<string>()
  for (const match of source.matchAll(/`([^`\n]+)`/g)) {
    const token = (match[1] ?? '').replace(/[.,;:]+$/, '')
    if (looksLikePath(token)) seen.add(token)
  }
  return [...seen]
}

/**
 * References that legitimately name a file in a *sibling* repo.
 *
 * Kept as a list rather than a rule. Falling back to "does any repo in the
 * fleet have this?" was tried and is worse than no check: the defect that
 * prompted this gate — secrets-le naming paths-le's
 * `fixtures/mcp-extract-paths.json` — resolves under that rule, because
 * paths-le really does have the file. The permissive version passed the exact
 * case it exists to catch.
 */
const CROSS_REPO: Readonly<Record<string, readonly string[]>> = {
  // unicode-le explains that its hook is POSIX shell *because* the extension
  // repos share a Node implementation. True, and not a file of its own.
  'scripts/commit-lint.js': ['unicode-le'],
}

/** Whether a reference resolves from where its document sits. */
export function resolves(token: string, root: string, repo: string, docDir: string): boolean {
  const wanted = target(token)
  if (CROSS_REPO[wanted]?.includes(repo) === true) return true
  for (const base of ROOTS) {
    if (existsSync(join(root, repo, base, wanted))) return true
  }
  if (existsSync(join(docDir, wanted))) return true
  // Relative to the directory the repos sit in: the fleet check lives at
  // `letools-site/scripts/check-fleet.ts`, and every repo names it that way.
  return existsSync(join(root, wanted))
}

export function main(root: string = process.argv[2] ?? '..'): number {
  if (!existsSync(root)) {
    process.stderr.write(`check-doc-paths: ${root} does not exist\n`)
    return 1
  }
  const repos = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.endsWith('-le'))
    .map(entry => entry.name)
    .sort()

  if (repos.length === 0) {
    process.stderr.write(`check-doc-paths: no *-le repos under ${root}\n`)
    return 1
  }

  const problems: string[] = []
  let checked = 0
  for (const repo of repos) {
    for (const doc of DOCS) {
      const path = join(root, repo, doc)
      if (!existsSync(path)) continue
      const source = readFileSync(path, 'utf8')
      for (const token of pathsIn(source)) {
        checked += 1
        if (resolves(token, root, repo, dirname(path))) continue
        problems.push(`${repo}/${doc}: \`${token}\` does not exist`)
      }
    }
  }

  if (problems.length > 0) {
    process.stderr.write('Documented paths that are not there:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      '\nA doc that names a file which is not there is how a copied paragraph ' +
        'survives: the tool name gets localised and the filename does not.\n',
    )
    return 1
  }

  process.stdout.write(
    `Doc paths check passed: ${checked} references across ${repos.length} repos all resolve.\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-doc-paths: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
