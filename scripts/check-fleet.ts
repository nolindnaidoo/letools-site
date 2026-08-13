#!/usr/bin/env bun
/**
 * Compare the shared config files across the extension repos.
 *
 * The family is hand-maintained copies by decision — there is no shared
 * workflow repo. That means a change has to be copied everywhere, and nothing
 * inside any single repo can tell you when a copy was missed. This has already
 * bitten three times: eight distinct biome.json, seven distinct
 * vitest.config.ts, ten distinct ci.yml.
 *
 * Run from a directory containing the checkouts, or let the workflow
 * clone them:
 *
 *   bun scripts/check-fleet.ts ../          # siblings of letools-site
 *   bun scripts/check-fleet.ts /tmp/fleet   # workflow's shallow clones
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const REPOS = [
  'colors-le',
  'dates-le',
  'envsync-le',
  'numbers-le',
  'paths-le',
  'regex-le',
  'scrape-le',
  'secrets-le',
  'string-le',
  'urls-le',
] as const

/**
 * Registry tools this check does not compare yet, and why.
 *
 * Every file in `SHARED` belongs to the TypeScript extension — the biome
 * config, the extension-host tsconfig, the workflow that builds and publishes
 * a VSIX. These repos hold only `crate/` so far, so none of those files exists
 * in them and comparing would report ten "missing in" lines that describe a
 * repo nobody has finished rather than a copy somebody missed.
 *
 * They join `REPOS` the day their extension lands. The test that pins this
 * list against the site registry is what makes that a failure rather than an
 * omission: a tool cannot be in one list and neither of the other two.
 */
export const EXTENSION_PENDING = [
  'i18n-le',
  'ids-le',
  'ips-le',
  'unicode-le',
  'units-le',
  'versions-le',
] as const

/** Files that must be byte-identical everywhere. */
export const SHARED = [
  'biome.json',
  'tsconfig.it.json',
  '.github/workflows/ci.yml',
  '.github/workflows/release.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/dependabot-auto-merge.yml',
  '.github/dependabot.yml',
  '.github/codeql-config.yml',
  'scripts/coverage-readme.js',
  'scripts/perf-readme.js',
] as const

/**
 * Files that are shared except for documented, deliberate exceptions.
 * Anything not listed here is a regression, not a decision.
 */
export const SHARED_WITH_EXCEPTIONS: Record<string, readonly string[]> = {
  // scrape-le uses the istanbul coverage provider, not v8.
  'vitest.config.ts': ['scrape-le'],
  // scrape-le adds "DOM" to lib for Playwright page-eval code.
  'tsconfig.json': ['scrape-le'],
}

/**
 * The file's content with the repo's own name written out.
 *
 * A shared file may still have to name the tool it sits in — release.yml
 * describes publishing `colors-le-mcp` from colors-le and `urls-le-mcp` from
 * urls-le. Hashing the raw bytes calls all ten of those drift, which is nine
 * false alarms and the fastest way to teach someone to ignore this check.
 * What must match is the shape, so the name is normalised away first.
 */
export function normalize(source: string, repo: string): string {
  return source.split(repo).join('<tool>')
}

export function hash(path: string, repo: string): string | null {
  if (!existsSync(path)) return null
  return createHash('sha1')
    .update(normalize(readFileSync(path, 'utf8'), repo))
    .digest('hex')
}

/** How one shared file looks across the fleet: its hash per repo, or null. */
export type Fingerprints = ReadonlyMap<string, string | null>

export function fingerprint(root: string, file: string): Fingerprints {
  return new Map(REPOS.map(repo => [repo, hash(join(root, repo, file), repo)]))
}

/**
 * The drift in one file, given its per-repo hashes.
 *
 * The majority group is canonical; anything else is drift unless it is a
 * documented exception. Split from the filesystem so the rule can be tested
 * without ten checkouts on disk — the reason this was never covered.
 */
export function problemsIn(
  file: string,
  prints: Fingerprints,
  allowed: readonly string[],
): readonly string[] {
  const problems: string[] = []
  const groups = new Map<string, string[]>()
  const missing: string[] = []

  for (const [repo, digest] of prints) {
    if (digest === null) {
      missing.push(repo)
      continue
    }
    groups.set(digest, [...(groups.get(digest) ?? []), repo])
  }

  if (missing.length > 0) problems.push(`${file}: missing in ${missing.join(', ')}`)
  if (groups.size <= 1) return problems

  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  const canonical = sorted[0]?.[1] ?? []
  for (const [, repos] of sorted.slice(1)) {
    const unexpected = repos.filter(repo => !allowed.includes(repo))
    if (unexpected.length === 0) continue
    problems.push(
      `${file}: ${unexpected.join(', ')} differ from the other ${canonical.length} ` +
        `(allowed exceptions: ${allowed.length > 0 ? allowed.join(', ') : 'none'})`,
    )
  }
  return problems
}

export function main(root: string = process.argv[2] ?? '..'): number {
  const problems: string[] = []
  for (const file of SHARED) problems.push(...problemsIn(file, fingerprint(root, file), []))
  for (const [file, allowed] of Object.entries(SHARED_WITH_EXCEPTIONS)) {
    problems.push(...problemsIn(file, fingerprint(root, file), allowed))
  }

  if (problems.length > 0) {
    process.stderr.write('Fleet drift detected:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      `\nThese files are meant to be identical across all ${REPOS.length} extension repos. ` +
        'Copy the canonical version across, or add a documented exception to ' +
        'scripts/check-fleet.ts if the difference is deliberate.\n',
    )
    return 1
  }

  const count = SHARED.length + Object.keys(SHARED_WITH_EXCEPTIONS).length
  process.stdout.write(
    `Fleet check passed: ${count} shared files consistent across ${REPOS.length} repos ` +
      `(${EXTENSION_PENDING.length} crate-only repos not compared — no extension in them yet).\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-fleet: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
