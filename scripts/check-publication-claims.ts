#!/usr/bin/env bun
/**
 * Prose that says a crate is unpublished, checked against crates.io.
 *
 * `check-crates.ts` already reconciles the site's `cratePublished` flag with the
 * registry — but only for tools in the site registry. The six crate-only repos
 * are not in it, so nothing ever asked the question about them, and every one
 * of them shipped a README telling readers `cargo install` would not work while
 * all six were live on crates.io. One of those READMEs was written *after* the
 * rule that availability is a fact about a registry at a moment in time, by
 * someone who then did not read the registry.
 *
 * A flag has a checker. Prose did not. This is the prose half.
 *
 * Run: bun run check:publication-claims [root]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Phrasings that assert a crate is NOT available.
 *
 * Deliberately narrow: this is looking for a claim a reader would act on, not
 * every sentence containing "publish". A release workflow that "refuses a
 * version the registry already carries" is describing a gate, not making a
 * claim about availability.
 */
export const CLAIMS = [
  /not on crates\.io/i,
  /not published to crates\.io/i,
  /once published/i,
  // "is unpublished", "Status: v0.1.0, unpublished" — an assertion about this
  // crate. NOT a bare `\bunpublished\b`: every extension repo's release notes
  // explain that "a merged extension pointing at an unpublished version is
  // broken", which is a general statement about npm ordering and matched ten
  // times on the first run. A gate with ten false positives is a gate people
  // learn to ignore.
  /\b(?:is|was|are|were|remains?)\s+(?:still\s+)?unpublished\b/i,
  /status[^\n]*\bunpublished\b/i,
  /^\s*[-*]?\s*\*{0,2}not published\b/i,
] as const

/**
 * Files that speak to a reader about availability. CHANGELOGs are excluded:
 * an entry recording that a claim was once wrong is history, and rewriting it
 * to match today is the drift this family refuses to ship.
 */
const DOCS = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'crate/README.md',
  'crate/AGENTS.md',
  'crate/CLAUDE.md',
]

export type Claim = Readonly<{ repo: string; file: string; line: number; text: string }>

/** Every unpublished-claim in one document. */
export function claimsIn(repo: string, file: string, source: string): readonly Claim[] {
  const found: Claim[] = []
  source.split('\n').forEach((text, index) => {
    if (!CLAIMS.some(pattern => pattern.test(text))) return
    found.push({ repo, file, line: index + 1, text: text.trim() })
  })
  return found
}

export async function publishedVersion(name: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://crates.io/api/v1/crates/${name}`, {
      headers: { 'user-agent': 'letools-site publication claim check' },
    })
    if (!response.ok) return undefined
    const body = (await response.json()) as { crate?: { max_stable_version?: string } }
    return body.crate?.max_stable_version
  } catch {
    // An outage says nothing about a claim; treat it as unknown, not absent.
    return undefined
  }
}

export async function main(root: string = process.argv[2] ?? '..'): Promise<number> {
  if (!existsSync(root)) {
    process.stderr.write(`check-publication-claims: ${root} does not exist\n`)
    return 1
  }
  const repos = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.endsWith('-le'))
    .map(entry => entry.name)
    .sort()

  const problems: string[] = []
  let checked = 0
  for (const repo of repos) {
    if (!existsSync(join(root, repo, 'crate/Cargo.toml'))) continue
    const live = await publishedVersion(repo)
    if (live === undefined) continue // unpublished, or the registry is unreachable
    checked += 1

    for (const doc of DOCS) {
      const path = join(root, repo, doc)
      if (!existsSync(path)) continue
      for (const claim of claimsIn(repo, doc, readFileSync(path, 'utf8'))) {
        problems.push(
          `${claim.repo}/${claim.file}:${claim.line} — v${live} is live: "${claim.text}"`,
        )
      }
    }
  }

  if (problems.length > 0) {
    process.stderr.write('Docs saying a published crate is not published:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      '\nAvailability is a fact about a registry at a moment in time. Read the\n' +
        'registry before writing it down — including when writing that it is not there.\n',
    )
    return 1
  }

  process.stdout.write(
    `Publication claims check passed: ${checked} published crate(s), no doc calls them unpublished.\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-publication-claims: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
