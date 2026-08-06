import { describe, expect, it } from 'vitest'
import { buildIndex, score, search } from './search'
import { TOOLS } from './tools'

const index = buildIndex(TOOLS)

describe('buildIndex', () => {
  it('indexes every tool, its MCP tool, and each of its commands', () => {
    const tools = index.filter(entry => entry.kind === 'tool')
    const mcp = index.filter(entry => entry.kind === 'mcp')
    expect(tools).toHaveLength(TOOLS.length)
    expect(mcp).toHaveLength(TOOLS.length)
    expect(index.filter(entry => entry.kind === 'command').length).toBeGreaterThan(TOOLS.length)
  })

  it('points every entry at a real page', () => {
    const paths = new Set(TOOLS.map(tool => `/tools/${tool.id}`))
    for (const entry of index) {
      const [path] = entry.href.split('#')
      expect(paths.has(path ?? ''), entry.href).toBe(true)
    }
  })

  it('is frozen, like the rest of the content layer', () => {
    expect(Object.isFrozen(index)).toBe(true)
  })
})

describe('score', () => {
  const entry = buildIndex(TOOLS).find(item => item.kind === 'tool')
  if (entry === undefined) throw new Error('no tool entries')

  it('scores an exact label above a prefix above a substring', () => {
    const exact = score(entry, entry.label)
    const prefix = score(entry, entry.label.slice(0, 3))
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(0)
  })

  it('ignores an empty or whitespace query rather than matching everything', () => {
    expect(score(entry, '')).toBe(0)
    expect(score(entry, '   ')).toBe(0)
  })

  it('treats a regex metacharacter as text, not a pattern', () => {
    // A query of `(` must not throw out of `new RegExp`.
    expect(() => score(entry, '(')).not.toThrow()
    expect(() => score(entry, '.*')).not.toThrow()
    expect(score(entry, '.*')).toBe(0)
  })
})

describe('search', () => {
  it('finds a tool by its name', () => {
    const [top] = search(index, 'colors')
    expect(top?.label.toLowerCase()).toContain('colors')
  })

  it('finds a tool by the MCP tool name an agent would call', () => {
    // The reason the MCP surface is indexed: someone reading an agent trace
    // has the tool name and nothing else.
    const results = search(index, 'extract_strings')
    expect(results[0]?.kind).toBe('mcp')
    expect(results[0]?.href).toContain('/tools/string-le')
  })

  it('finds a command by a word inside its title', () => {
    const results = search(index, 'deduplicate')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(result => result.kind === 'command')).toBe(true)
  })

  it('returns nothing for a query that matches nothing', () => {
    expect(search(index, 'kubernetes')).toEqual([])
  })

  it('is not fuzzy — scattered letters do not match', () => {
    // A fuzzy matcher turns "csv" into a match for "Colors-LE" via c…s…v and
    // a list that returns everything is the same as no search.
    for (const result of search(index, 'csv')) {
      expect(result.haystack).toContain('csv')
    }
  })

  it('caps the result list', () => {
    expect(search(index, 'e', 5).length).toBeLessThanOrEqual(5)
  })

  it('puts the tool above its own commands when both match', () => {
    const results = search(index, 'colors')
    const tool = results.findIndex(result => result.kind === 'tool')
    const command = results.findIndex(result => result.kind === 'command')
    if (tool !== -1 && command !== -1) expect(tool).toBeLessThan(command)
  })
})
