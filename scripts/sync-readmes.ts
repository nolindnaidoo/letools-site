#!/usr/bin/env bun
/**
 * Regenerate the generated README section in every extension repo.
 *
 * The Testing block in each README is written from a real coverage run, and CI
 * fails when it drifts. That is right, and the cost is that ONE shared change
 * invalidates all ten at once: adding a single test file to the fleet turned
 * `coverage:readme:check` red in every repo, each needing its own two-step
 * round-trip. Ten regenerations for one file.
 *
 * This is that step, once. It shells out to each repo's own `readme` script
 * rather than reimplementing it, so there is one definition of how the block
 * is produced and this cannot drift from it.
 *
 * Only the ten carry a generated README; the crate-only six have no coverage
 * block to write.
 *
 * Run: bun run sync:readmes [root]
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { REPOS } from './check-fleet'

export type Outcome = Readonly<{ repo: string; ok: boolean; detail: string }>

/** Run one repo's own regeneration. Split out so the reporting is testable. */
export function regenerate(
  dir: string,
  run: (dir: string) => { status: number | null; stderr: string } = spawn,
): Outcome {
  /* v8 ignore next -- the default is exercised only by the real entry point */
  const repo = dir.split('/').pop() ?? dir
  if (!existsSync(dir)) return { repo, ok: false, detail: 'not checked out' }
  const result = run(dir)
  if (result.status === 0) return { repo, ok: true, detail: 'regenerated' }
  // The last non-empty line is the actionable one; the rest is a test log.
  const lines = result.stderr.split('\n').filter(line => line.trim() !== '')
  return { repo, ok: false, detail: lines[lines.length - 1] ?? `exit ${result.status}` }
}

function spawn(dir: string): { status: number | null; stderr: string } {
  const result = spawnSync('bun', ['run', 'readme'], { cwd: dir, encoding: 'utf8' })
  return { status: result.status, stderr: result.stderr ?? '' }
}

export function summarise(outcomes: readonly Outcome[]): number {
  const failed = outcomes.filter(outcome => !outcome.ok)
  for (const outcome of outcomes) {
    process.stdout.write(
      `  ${outcome.ok ? '✓' : '✗'} ${outcome.repo.padEnd(12)} ${outcome.detail}\n`,
    )
  }
  if (failed.length === 0) {
    process.stdout.write(`\n${outcomes.length} README testing sections regenerated.\n`)
    return 0
  }
  process.stderr.write(`\n${failed.length} repo(s) did not regenerate. Nothing was committed.\n`)
  return 1
}

export function main(
  root: string = process.argv[2] ?? '..',
  run?: (dir: string) => { status: number | null; stderr: string },
): number {
  process.stdout.write(`Regenerating the Testing section in ${REPOS.length} repos:\n`)
  return summarise(REPOS.map(repo => regenerate(join(root, repo), run)))
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\nsync-readmes: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
