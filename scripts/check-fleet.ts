#!/usr/bin/env bun
/**
 * Compare the shared config files across all ten extension repos.
 *
 * The family is ten hand-maintained copies by decision — there is no shared
 * workflow repo. That means a change has to be copied nine times, and nothing
 * inside any single repo can tell you when a copy was missed. This has already
 * bitten three times: eight distinct biome.json, seven distinct
 * vitest.config.ts, ten distinct ci.yml.
 *
 * Run from a directory containing all ten checkouts, or let the workflow
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

export function hash(path: string): string | null {
  return existsSync(path) ? createHash('sha1').update(readFileSync(path)).digest('hex') : null
}

/** How one shared file looks across the fleet: its hash per repo, or null. */
export type Fingerprints = ReadonlyMap<string, string | null>

export function fingerprint(root: string, file: string): Fingerprints {
  return new Map(REPOS.map(repo => [repo, hash(join(root, repo, file))]))
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
      '\nThese files are meant to be identical across all ten repos. Copy the ' +
        'canonical version across, or add a documented exception to ' +
        'scripts/check-fleet.ts if the difference is deliberate.\n',
    )
    return 1
  }

  const count = SHARED.length + Object.keys(SHARED_WITH_EXCEPTIONS).length
  process.stdout.write(
    `Fleet check passed: ${count} shared files consistent across ${REPOS.length} repos.\n`,
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
