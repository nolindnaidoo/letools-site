import { describe, expect, it } from 'vitest'
import {
  asEntry,
  type Entry,
  editsAllowed,
  indexedTags,
  levenshtein,
  MAX_TAGS,
  Model,
  main,
  near,
  parseArgs,
  readListing,
  type Sources,
  storedLength,
  tokenize,
} from './simulate-openvsx'

const NOW = Date.parse('2026-10-18T00:00:00Z')

function entry(id: string, fields: Partial<Entry> = {}): Entry {
  const [namespace, name] = id.split('.') as [string, string]
  return {
    namespace,
    name,
    displayName: name,
    description: '',
    tags: [],
    downloadCount: 1000,
    timestamp: '2026-10-01T00:00:00Z',
    verified: true,
    ...fields,
  }
}

/** Filler so idf and average length behave as they do in a real catalog. */
function catalogWith(...entries: Entry[]): Map<string, Entry> {
  const all = new Map<string, Entry>()
  for (let i = 0; i < 200; i++) {
    all.set(
      `pad.filler-${i}`,
      entry(`pad.filler-${i}`, {
        displayName: `Filler Tool ${i}`,
        description: 'does other things',
        tags: ['other'],
      }),
    )
  }
  for (const e of entries) all.set(`${e.namespace}.${e.name}`, e)
  return all
}

describe('tokenize', () => {
  it('splits on punctuation and lowercases, as the standard analyzer does', () => {
    expect(tokenize('EnvSync-LE: .env Sync & Dotenv Checker')).toEqual([
      'envsync',
      'le',
      'env',
      'sync',
      'dotenv',
      'checker',
    ])
  })

  it('keeps a dotted or apostrophed run as one token', () => {
    expect(tokenize("robots.txt and it's")).toEqual(['robots.txt', 'and', "it's"])
  })

  it('treats a missing field as empty', () => {
    expect(tokenize(undefined)).toEqual([])
    expect(tokenize(null)).toEqual([])
  })
})

describe('indexedTags', () => {
  it('appends one tag per onLanguage event after the keywords, as vsce does', () => {
    expect(
      indexedTags(['color'], ['onLanguage:css', 'onStartupFinished', 'onLanguage:html']),
    ).toEqual(['color', 'css', 'html'])
  })

  it('does not repeat a language that is already a keyword', () => {
    expect(indexedTags(['css'], ['onLanguage:css'])).toEqual(['css'])
  })

  it('keeps only the first 30, as Open VSX does', () => {
    const events = Array.from({ length: 40 }, (_, i) => `onLanguage:lang${i}`)
    const tags = indexedTags(['a', 'b'], events)
    expect(tags).toHaveLength(MAX_TAGS)
    expect(tags.slice(0, 3)).toEqual(['a', 'b', 'lang0'])
  })
})

describe('storedLength', () => {
  it('is exact below 24 and follows Lucene SmallFloat above', () => {
    expect([0, 5, 23, 24, 40, 47, 48, 60, 100].map(storedLength)).toEqual([
      0, 5, 23, 24, 40, 46, 48, 60, 96,
    ])
  })
})

describe('fuzzy helpers', () => {
  it('allows the edits AUTO allows', () => {
    expect(['ab', 'abc', 'abcde', 'abcdef'].map(editsAllowed)).toEqual([0, 1, 1, 2])
  })

  it('measures edits and stops past the cap', () => {
    expect(levenshtein('color', 'colors', 1)).toBe(1)
    expect(levenshtein('kitten', 'sitting', 3)).toBe(3)
    expect(levenshtein('a', 'abcd', 1)).toBe(2)
  })
})

describe('Model', () => {
  it('ranks a short name holding the searched word above a long one', () => {
    const catalog = catalogWith(
      entry('a.short', { displayName: 'Color Tool' }),
      entry('b.long', { displayName: 'Brand: Color Palette Checker And Extractor' }),
    )
    const model = new Model(catalog, NOW)
    expect(model.rank(['a.short', 'b.long'], 'color', 'b.long')).toBe(2)
  })

  it('weighs a keyword less when language tags dilute it', () => {
    const catalog = catalogWith(
      entry('a.rival', { displayName: 'Rival', tags: ['scanner', 'x'] }),
      entry('b.mine', { displayName: 'Mine', tags: ['scanner', 'y'] }),
    )
    const model = new Model(catalog, NOW)
    const pool = ['a.rival', 'b.mine']
    const clean = asEntry({
      displayName: 'Mine',
      description: '',
      keywords: ['scanner'],
      activationEvents: [],
    })
    const diluted = asEntry({
      displayName: 'Mine',
      description: '',
      keywords: ['scanner'],
      activationEvents: Array.from({ length: 20 }, (_, i) => `onLanguage:l${i}`),
    })
    expect(model.rank(pool, 'scanner', 'b.mine', { ...clean, downloadCount: 2000 })).toBe(1)
    expect(model.rank(pool, 'scanner', 'b.mine', { ...diluted, downloadCount: 2000 })).toBe(2)
  })

  it('matches a near miss through the fuzzy clause', () => {
    const catalog = catalogWith(entry('a.colors', { displayName: 'Colors' }))
    const model = new Model(catalog, NOW)
    expect(model.score(entry('a.colors', { displayName: 'Colors' }), 'color')).toBeGreaterThan(0)
    expect(model.score(entry('a.colors', { displayName: 'Colors' }), 'zzzzz')).toBe(0)
  })

  it('multiplies by relevance: unverified and deprecated each halve it', () => {
    const model = new Model(catalogWith(entry('big.one', { downloadCount: 10_000_000 })), NOW)
    const base = model.relevance(entry('a.x'))
    expect(model.relevance(entry('a.x', { verified: false }))).toBeCloseTo(base / 2)
    expect(model.relevance(entry('a.x', { deprecated: true }))).toBeCloseTo(base / 2)
    expect(model.relevance(entry('a.x', { downloadCount: 1_000_000 }))).toBeGreaterThan(base)
    expect(model.relevance(entry('a.x', { timestamp: null }))).toBeLessThan(base)
  })

  it('pads a rating toward the catalog average', () => {
    const catalog = catalogWith(entry('a.rated', { averageRating: 3, reviewCount: 10 }))
    const model = new Model(catalog, NOW)
    const one = model.relevance(entry('b.x', { averageRating: 5, reviewCount: 1 }))
    const many = model.relevance(entry('b.x', { averageRating: 5, reviewCount: 1000 }))
    expect(many).toBeGreaterThan(one)
  })

  it('adds the target to the pool when it is not in the live top results', () => {
    const catalog = catalogWith(
      entry('a.rival', { displayName: 'Hex' }),
      entry('b.mine', { displayName: 'Hex Mine' }),
    )
    const model = new Model(catalog, NOW)
    expect(model.rank(['a.rival', 'gone.missing'], 'hex', 'b.mine')).toBe(2)
  })
})

describe('readListing', () => {
  const files: Record<string, string> = {
    'r/package.json': JSON.stringify({
      displayName: '%ext.name%',
      description: 'd',
      keywords: ['k'],
      activationEvents: ['onLanguage:css'],
    }),
    'r/package.nls.json': JSON.stringify({ 'ext.name': 'Secrets-LE: Scanner' }),
    'p/package.json': JSON.stringify({ displayName: 'Plain' }),
  }
  const read = async (p: string) => files[p] as string

  it('resolves a localized display name through package.nls.json', async () => {
    expect(await readListing('r', read)).toEqual({
      displayName: 'Secrets-LE: Scanner',
      description: 'd',
      keywords: ['k'],
      activationEvents: ['onLanguage:css'],
    })
  })

  it('reads a plain manifest with no keywords or events', async () => {
    expect(await readListing('p', read)).toEqual({
      displayName: 'Plain',
      description: '',
      keywords: [],
      activationEvents: [],
    })
  })
})

describe('parseArgs', () => {
  it('takes tools, a candidate, calibrate and refresh', () => {
    expect(parseArgs(['colors-le', '--candidate', 'c.json', '--refresh'])).toEqual({
      ids: ['colors-le'],
      candidate: 'c.json',
      calibrate: false,
      refresh: true,
    })
    expect(parseArgs(['--calibrate'])).toMatchObject({ ids: [], calibrate: true })
  })

  it('refuses what it cannot answer', () => {
    expect(parseArgs([])).toBe('name a tool id, or pass --calibrate')
    expect(parseArgs(['nope-le'])).toBe('unknown tool nope-le')
    expect(parseArgs(['--bogus'])).toBe('unknown option --bogus')
    expect(parseArgs(['colors-le', '--candidate'])).toBe('--candidate needs a JSON file')
    expect(parseArgs(['colors-le', 'paths-le', '--candidate', 'c.json'])).toBe(
      '--candidate needs exactly one tool id',
    )
  })
})

describe('near', () => {
  it('allows two places or a quarter of the live rank', () => {
    expect(near(1, 3)).toBe(true)
    expect(near(1, 4)).toBe(false)
    expect(near(40, 50)).toBe(true)
    expect(near(40, 51)).toBe(false)
  })
})

describe('main', () => {
  const mine = entry('nolindnaidoo.colors-le', {
    displayName: 'Colors-LE: Color Palette Checker',
    tags: ['color'],
  })
  const rival = entry('other.hex-editor', { displayName: 'Hex Editor', downloadCount: 100_000 })
  const sources: Sources = {
    catalog: async () => Object.fromEntries(catalogWith(mine, rival)),
    pool: async () => ['other.hex-editor', 'nolindnaidoo.colors-le'],
    live: async () => 2,
    listing: async () => ({
      displayName: 'Colors-LE: Hex Color Extractor',
      description: '',
      keywords: ['color'],
      activationEvents: [],
    }),
    candidate: async () => ({ displayName: 'Colors-LE: Hex Color' }),
  }

  it('compares the live listing, the repo and a candidate', async () => {
    const lines: string[] = []
    expect(await main(['colors-le', '--candidate', 'c.json'], sources, l => lines.push(l))).toBe(0)
    expect(lines[0]).toBe('Colors-LE  (nolindnaidoo.colors-le)')
    expect(lines).toContain('  repo: Colors-LE: Hex Color Extractor')
    expect(lines).toContain('  candidate: Colors-LE: Hex Color')
    const hex = lines.find(l => l.trimStart().startsWith('hex color ')) as string
    expect(hex.trim().split(/\s+/).slice(-3)).toEqual(['2', '1', '1'])
    expect(lines.at(-1)).toMatch(/^ {2}sum of ranks/)
  })

  it('reports calibration misses and the overall fit', async () => {
    const lines: string[] = []
    expect(
      await main(['--calibrate', 'colors-le'], { ...sources, live: async () => 40 }, l =>
        lines.push(l),
      ),
    ).toBe(0)
    expect(lines.some(l => l.startsWith('  miss  colors-le'))).toBe(true)
    expect(lines.at(-1)).toMatch(/^within tolerance \d+\/\d+ {2}mean \|log error\| \d\.\d{3}$/)
  })

  it('exits 2 on bad arguments', async () => {
    expect(await main(['--bogus'], sources, () => {})).toBe(2)
  })
})
