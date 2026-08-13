#!/usr/bin/env bun
/**
 * Fail if any two tools ship the same demo GIF, or if a tool is missing one.
 *
 * This repo is the only place all ten demos sit together, so it is the only
 * place the duplicate is visible. Colors-LE shipped the Dates-LE demo from its
 * first commit through to a published Marketplace listing precisely because
 * nothing ever compared them.
 *
 * Run with `bun run check:demos`.
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoSrc, TOOLS } from '../lib/tools'

// import.meta.dir is Bun-only and does not typecheck; this is the portable form.
const DEMOS = fileURLToPath(new URL('../public/demos', import.meta.url))
const POSTERS = fileURLToPath(new URL('../public/posters', import.meta.url))

/** A demo file keyed by tool id, with the bytes it contains. */
export type Demo = Readonly<{ id: string; sha1: string }>

export function sha1(bytes: Uint8Array | string): string {
  return createHash('sha1').update(bytes).digest('hex')
}

/** Reads `public/demos`, hashing each GIF. Split out so the rules can be tested. */
export function readDemos(directory: string, extension = '.gif'): readonly Demo[] {
  return readdirSync(directory)
    .filter(file => file.endsWith(extension))
    .map(file => ({
      // `colors-le.9999de44.gif` -> `colors-le`. The hash is part of the URL,
      // not part of the identity.
      id: file.slice(0, -extension.length).replace(/\.[0-9a-f]{8}$/, ''),
      sha1: sha1(readFileSync(join(directory, file))),
    }))
}

/**
 * The three ways this can be wrong, in one place: a tool with no demo, two
 * tools sharing one, and a demo no tool claims.
 */
export function problemsWith(
  toolIds: readonly string[],
  demos: readonly Demo[],
): readonly string[] {
  const problems: string[] = []
  const byId = new Map(demos.map(demo => [demo.id, demo]))

  for (const id of toolIds) {
    if (!byId.has(id)) problems.push(`${id}: public/demos/${id}.gif is missing`)
  }

  const byHash = new Map<string, string[]>()
  for (const id of toolIds) {
    const demo = byId.get(id)
    if (demo === undefined) continue
    byHash.set(demo.sha1, [...(byHash.get(demo.sha1) ?? []), id])
  }
  for (const [hash, ids] of byHash) {
    if (ids.length < 2) continue
    problems.push(
      `${ids.join(' and ')} ship the same demo (sha1 ${hash.slice(0, 12)}) — ` +
        'at most one of them can be correct',
    )
  }

  // A demo present in public/demos but not in the registry is dead weight.
  const known = new Set(toolIds)
  for (const demo of demos) {
    if (!known.has(demo.id)) {
      problems.push(`public/demos/${demo.id}.gif has no matching tool in lib/tools.ts`)
    }
  }

  return problems
}

export function main(directory: string = DEMOS, posters: string = POSTERS): number {
  // Only the tools that have a recording. A tool whose extension is still to
  // be written has no editor screen to record, so "missing" would describe the
  // whole point rather than a mistake — its page shows the captured terminal
  // run instead. The duplicate check, which is why this script exists, still
  // covers every recording that does exist.
  const toolIds = TOOLS.filter(tool => demoSrc(tool) !== undefined).map(tool => tool.id)
  const problems = [...problemsWith(toolIds, readDemos(directory))]

  // The posters are checked too. They were not, and two of them were the same
  // file: the Colors-LE card showed the Dates-LE screenshot on every visit,
  // for as long as the site has existed. The demo check found the duplicate
  // one directory over and never looked here.
  if (existsSync(posters)) {
    for (const problem of problemsWith(toolIds, readDemos(posters, '.jpg'))) {
      problems.push(problem.replace('public/demos/', 'public/posters/').replace('.gif', '.jpg'))
    }
  }

  if (problems.length > 0) {
    process.stderr.write('Demo check failed:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write('\nSee nolindnaidoo/colors-le#3.\n')
    return 1
  }

  process.stdout.write(
    `Demo check passed: ${toolIds.length} tools, demos and posters all distinct.\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-demos: unexpected failure — this is a bug.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
