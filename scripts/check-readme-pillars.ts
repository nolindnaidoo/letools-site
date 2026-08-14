#!/usr/bin/env bun
/**
 * The sections every README in the family must carry.
 *
 * Sixteen repositories built at three different times drifted into sixteen
 * different front doors: none of the ten had an `## Install` at all — install
 * was something a reader inferred from a badge — two crate pages had no
 * `## License`, three had no flag reference, and fourteen had no route out to
 * SPEC.md or the changelog. Every one of those was invisible because nothing
 * had ever asked the question.
 *
 * **Presence, not order, and not content.** Each tool's middle is its own —
 * "It refuses rather than guesses" belongs to ids-le and "Matched by colour,
 * not by spelling" to colors-le, and a check that flattened those would be a
 * tax on writing the next one. This asks only that a reader can find the four
 * things every reader needs.
 *
 * Run: bun run check:readme-pillars [root]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { EXTENSION_PENDING, REPOS } from './check-fleet'

/**
 * A pillar is satisfied by any heading starting with one of its names, so
 * `## Install` and `## Installation` both answer for install, and a tool is
 * free to say `## Options` or `## Commands and flags`.
 */
export type Pillar = Readonly<{ what: string; headings: readonly string[] }>

export const PILLARS: readonly Pillar[] = [
  { what: 'how to install it', headings: ['Install'] },
  { what: 'what the flags are', headings: ['Options', 'Commands', 'Settings'] },
  { what: 'where the rest of the docs are', headings: ['Documentation'] },
  { what: 'the licence', headings: ['License', 'Licence'] },
  { what: 'the rest of the family', headings: ['More from the LE family'] },
]

/** Every `## ` heading in a document, in order. */
export function headingsIn(source: string): readonly string[] {
  return source
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.slice(3).trim())
}

export function missingFrom(source: string): readonly Pillar[] {
  const headings = headingsIn(source)
  return PILLARS.filter(
    pillar => !pillar.headings.some(name => headings.some(heading => heading.startsWith(name))),
  )
}

export function main(root: string = process.argv[2] ?? '..'): number {
  if (!existsSync(root)) {
    process.stderr.write(`check-readme-pillars: ${root} does not exist\n`)
    return 1
  }
  const repos = [...REPOS, ...EXTENSION_PENDING].sort()

  const problems: string[] = []
  let checked = 0
  for (const repo of repos) {
    for (const rel of ['README.md', 'crate/README.md']) {
      const path = join(root, repo, rel)
      if (!existsSync(path)) continue
      checked += 1
      for (const pillar of missingFrom(readFileSync(path, 'utf8'))) {
        problems.push(
          `${repo}/${rel} — no section says ${pillar.what} (expected ## ${pillar.headings[0]})`,
        )
      }
    }
  }

  if (problems.length > 0) {
    process.stderr.write('READMEs missing a pillar every reader needs:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      "\nThe middle of a README is the tool's own. These five are not:\n" +
        'install it, run it, read further, the licence, the family.\n',
    )
    return 1
  }

  process.stdout.write(`README pillars check passed: ${checked} README(s) carry all five.\n`)
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-readme-pillars: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
