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
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../lib/tools'

// import.meta.dir is Bun-only and does not typecheck; this is the portable form.
const DEMOS = fileURLToPath(new URL('../public/demos', import.meta.url))

const problems: string[] = []
const byHash = new Map<string, string[]>()

const present = new Set(
  readdirSync(DEMOS)
    .filter(f => f.endsWith('.gif'))
    .map(f => f.replace(/\.gif$/, '')),
)

for (const tool of TOOLS) {
  if (!present.has(tool.id)) {
    problems.push(`${tool.id}: public/demos/${tool.id}.gif is missing`)
    continue
  }
  const hash = createHash('sha1')
    .update(readFileSync(join(DEMOS, `${tool.id}.gif`)))
    .digest('hex')
  byHash.set(hash, [...(byHash.get(hash) ?? []), tool.id])
}

for (const [hash, ids] of byHash) {
  if (ids.length > 1) {
    problems.push(
      `${ids.join(' and ')} ship the same demo (sha1 ${hash.slice(0, 12)}) — ` +
        'at most one of them can be correct',
    )
  }
}

// A demo present in public/demos but not in the registry is dead weight.
for (const id of present) {
  if (!TOOLS.some(t => t.id === id)) {
    problems.push(`public/demos/${id}.gif has no matching tool in lib/tools.ts`)
  }
}

if (problems.length > 0) {
  console.error('Demo check failed:')
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nSee nolindnaidoo/colors-le#3.')
  process.exit(1)
}

console.log(`Demo check passed: ${TOOLS.length} tools, all distinct.`)
