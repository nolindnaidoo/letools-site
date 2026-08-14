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
 *
 * Claims that read the same however the prose is wrapped. Matched against the
 * document with newlines flattened, so every quantifier here is bounded — an
 * unbounded `[^\n]*` stops meaning "the rest of the line" the moment the
 * newlines are gone, and matches the rest of the file instead. That is not
 * hypothetical: it fired on an ASCII architecture diagram the first time.
 */
const WRAPPED = [
  /not on crates\.io/i,
  /not published to crates\.io/i,
  // `once published` did not match `once it is published`, which is what four
  // repositories actually said — so this gate reported "no doc calls them
  // unpublished" while five live claims sat under it. A literal phrase is the
  // wrong shape for prose somebody will rewrite; allow the words in between.
  /once\b[^.]{0,20}\bpublished\b/i,
  /publishing shortly/i,
  /until then it builds/i,
  // "is unpublished" — an assertion about this crate. NOT a bare
  // `\bunpublished\b`: every extension repo's release notes explain that "a
  // merged extension pointing at an unpublished version is broken", which is a
  // general statement about npm ordering and matched ten times on the first
  // run. A gate with ten false positives is a gate people learn to ignore.
  /\b(?:is|was|are|were|remains?)\s+(?:still\s+)?unpublished\b/i,
  // Bounded rather than `[^\n]*`: the newlines are gone by the time this
  // runs. A dot has to be allowed through — "Status: v0.1.0, unpublished"
  // carries two of them in the version alone.
  /\bstatus\b.{0,40}?\bunpublished\b/i,
] as const

/** Claims that mean something only at the start of a line. */
const ANCHORED = [/^\s*[-*]?\s*\*{0,2}not published\b/i] as const

export const CLAIMS = [...WRAPPED, ...ANCHORED] as const

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

/**
 * Every unpublished-claim in one document.
 *
 * Matched against the document with newlines flattened to spaces, not line by
 * line. Every one of these files is hard-wrapped near 72 characters, so "once
 * it is published; until / then it builds from `crate/`" is one claim split
 * across two lines — and a per-line scan sees two halves of a sentence, each
 * innocent. The offset is mapped back to a line number so the report still
 * points at somewhere a person can open.
 */
export function claimsIn(repo: string, file: string, source: string): readonly Claim[] {
  // One character in, one character out, so an index into `flat` is an index
  // into `source`. Replacing the newline with a space rather than deleting it
  // also keeps words on either side of a wrap from fusing.
  const flat = source.replace(/\n/g, ' ')
  const found: Claim[] = []
  const seen = new Set<number>()

  const add = (line: number, text: string) => {
    if (seen.has(line)) return
    seen.add(line)
    found.push({ repo, file, line, text: text.trim() })
  }

  for (const pattern of WRAPPED) {
    for (const match of flat.matchAll(new RegExp(pattern.source, `${pattern.flags}g`))) {
      add(source.slice(0, match.index ?? 0).split('\n').length, match[0])
    }
  }
  source.split('\n').forEach((text, index) => {
    if (ANCHORED.some(pattern => pattern.test(text))) add(index + 1, text)
  })

  return found.sort((a, b) => a.line - b.line)
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

export async function main(
  root: string = process.argv[2] ?? '..',
  lookUp: (name: string) => Promise<string | undefined> = publishedVersion,
): Promise<number> {
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
    const live = await lookUp(repo)
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
