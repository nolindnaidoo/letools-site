import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { REPOS } from './check-fleet'

const DIR = join(import.meta.dirname, '..', 'fleet-pass')
const read = (name: string) => readFileSync(join(DIR, name), 'utf8')

const README = read('README.md')
/** Every document that carries checks. The ledger holds state, not procedure. */
const STEPS = readdirSync(DIR).filter(
  name => name.endsWith('.md') && name !== 'README.md' && name !== 'LEDGER.md',
)

function readRule(source: string): string | undefined {
  return source.match(/<!-- read-rule:start -->\n([\s\S]*?)\n<!-- read-rule:end -->/)?.[1]
}

describe('fleet pass documents', () => {
  it('finds the step documents', () => {
    expect(STEPS.length).toBeGreaterThan(0)
    expect(readRule(README)).toBeDefined()
  })

  it.each(STEPS)('%s carries the read rule verbatim', name => {
    expect(readRule(read(name))).toBe(readRule(README))
  })

  it.each(STEPS)('%s is in the order table', name => {
    expect(README).toContain(`](${name})`)
  })

  it('has no order row for a document that does not exist', () => {
    const linked = [...README.matchAll(/\]\(([a-z-]+\.md)\)/g)].map(match => match[1])
    expect(linked.filter(name => !STEPS.includes(name ?? ''))).toEqual([])
  })

  it('has exactly one ledger row per fleet repo', () => {
    const rows = [...read('LEDGER.md').matchAll(/^\| ([a-z0-9]+-le) \|/gm)].map(match => match[1])
    expect([...rows].sort()).toEqual([...REPOS].sort())
  })
})
