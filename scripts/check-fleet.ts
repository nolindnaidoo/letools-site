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

const REPOS = [
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
const SHARED = [
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
const SHARED_WITH_EXCEPTIONS: Record<string, readonly string[]> = {
  // scrape-le uses the istanbul coverage provider, not v8.
  'vitest.config.ts': ['scrape-le'],
  // scrape-le adds "DOM" to lib for Playwright page-eval code.
  'tsconfig.json': ['scrape-le'],
}

const root = process.argv[2] ?? '..'
const problems: string[] = []

function hash(p: string): string | null {
  return existsSync(p) ? createHash('sha1').update(readFileSync(p)).digest('hex') : null
}

function compare(file: string, allowed: readonly string[]): void {
  const groups = new Map<string, string[]>()
  const missing: string[] = []

  for (const repo of REPOS) {
    const h = hash(join(root, repo, file))
    if (h === null) {
      missing.push(repo)
      continue
    }
    groups.set(h, [...(groups.get(h) ?? []), repo])
  }

  if (missing.length > 0) {
    problems.push(`${file}: missing in ${missing.join(', ')}`)
  }
  if (groups.size <= 1) return

  // The majority group is canonical; anything else is drift unless allowed.
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  const canonical = sorted[0]?.[1] ?? []
  for (const [, repos] of sorted.slice(1)) {
    const unexpected = repos.filter(r => !allowed.includes(r))
    if (unexpected.length > 0) {
      problems.push(
        `${file}: ${unexpected.join(', ')} differ from the other ${canonical.length} ` +
          `(allowed exceptions: ${allowed.length > 0 ? allowed.join(', ') : 'none'})`,
      )
    }
  }
}

for (const file of SHARED) compare(file, [])
for (const [file, allowed] of Object.entries(SHARED_WITH_EXCEPTIONS)) {
  compare(file, allowed)
}

if (problems.length > 0) {
  console.error('Fleet drift detected:')
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    '\nThese files are meant to be identical across all ten repos. Copy the ' +
      'canonical version across, or add a documented exception to ' +
      'scripts/check-fleet.ts if the difference is deliberate.',
  )
  process.exit(1)
}

console.log(
  `Fleet check passed: ${SHARED.length + Object.keys(SHARED_WITH_EXCEPTIONS).length} shared files consistent across ${REPOS.length} repos.`,
)
