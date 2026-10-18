import { describe, expect, it } from 'vitest'
import { TOOLS } from '../lib/tools'
import {
  DEPTH,
  type Fetch,
  formatRank,
  main,
  type Page,
  parseArgs,
  rankOf,
  SEARCH_TERMS,
} from './rank-openvsx'

/** A registry of `total` results where the wanted id, if any, sits at `at` (1-based). */
function registry(
  total: number,
  at?: number,
  id = 'nolindnaidoo.envsync-le',
): Fetch & { calls: number } {
  const [namespace, name] = id.split('.') as [string, string]
  const fake = async (_query: string, offset: number): Promise<Page> => {
    fake.calls++
    const extensions = []
    for (let i = offset; i < Math.min(offset + 100, total); i++) {
      extensions.push(
        i + 1 === at
          ? { namespace, name }
          : { namespace: 'other', name: `ext-${i}`, displayName: `Ext ${i}` },
      )
    }
    return { totalSize: total, extensions }
  }
  fake.calls = 0
  return fake
}

describe('rank-openvsx', () => {
  it('has search terms for every tool in the registry, and none for a tool that is not', () => {
    // A tool added to the registry without terms would be skipped silently.
    expect(Object.keys(SEARCH_TERMS).sort()).toEqual(TOOLS.map(tool => tool.id).sort())
    for (const terms of Object.values(SEARCH_TERMS)) expect(terms.length).toBeGreaterThan(0)
  })

  it('finds a rank on a later page', async () => {
    const fake = registry(250, 142)
    expect((await rankOf('nolindnaidoo.envsync-le', 'env', fake)).rank).toBe(142)
    expect(fake.calls).toBe(2)
  })

  it('matches the id case-insensitively, as Open VSX resolves it', async () => {
    expect((await rankOf('NolinDNaidoo.EnvSync-LE', 'env', registry(10, 3))).rank).toBe(3)
  })

  it('does not count a different namespace with the same name', async () => {
    expect(
      (await rankOf('nolindnaidoo.envsync-le', 'env', registry(10, 3, 'someone.envsync-le'))).rank,
    ).toBeUndefined()
  })

  it('stops at the last page rather than asking for empty ones', async () => {
    const fake = registry(40)
    expect((await rankOf('nolindnaidoo.envsync-le', 'env', fake)).rank).toBeUndefined()
    expect(fake.calls).toBe(1)
  })

  it('gives up past the depth and says so', async () => {
    const fake = registry(1000, 900)
    const result = await rankOf('nolindnaidoo.envsync-le', 'env', fake)
    expect(result.rank).toBeUndefined()
    expect(fake.calls).toBe(DEPTH / 100)
    expect(formatRank(result)).toContain(`>${DEPTH}`)
  })

  it('reports the first three results as the leaders', async () => {
    expect((await rankOf('nolindnaidoo.envsync-le', 'env', registry(10, 1))).leaders).toEqual([
      'envsync-le',
      'Ext 1',
      'Ext 2',
    ])
  })

  it('refuses an unknown tool, an unknown option, and a query with no tool', () => {
    expect(parseArgs(['nope-le'])).toBe('unknown tool nope-le')
    expect(parseArgs(['--json'])).toBe('unknown option --json')
    expect(parseArgs(['--query', 'env'])).toBe('--query needs at least one tool id')
    expect(parseArgs(['envsync-le', '--query'])).toBe('--query needs a search phrase')
    expect(parseArgs(['envsync-le', '--query', 'env sync'])).toEqual({
      ids: ['envsync-le'],
      queries: ['env sync'],
    })
  })

  it('runs the given queries instead of the tool terms', async () => {
    const lines: string[] = []
    const code = await main(['envsync-le', '--query', 'env sync'], registry(10, 2), line =>
      lines.push(line),
    )
    expect(code).toBe(0)
    expect(lines).toHaveLength(2)
    expect(lines[1]).toMatch(/^\s+2 {2}"env sync"/)
  })

  it('exits 2 on bad arguments without searching', async () => {
    const fake = registry(10)
    expect(await main(['nope-le'], fake, () => {})).toBe(2)
    expect(fake.calls).toBe(0)
  })
})
