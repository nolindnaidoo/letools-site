import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  displayInstalls,
  INSTALL_FLOOR,
  measureInstalls,
  measureRegistries,
  NPM_EPOCH,
  npmWindows,
  type PublishedExtension,
} from './install-count'

const EXTENSIONS: readonly PublishedExtension[] = [
  { id: 'a-le', publisher: 'pub', openVsxNamespace: 'pub' },
  { id: 'b-le', publisher: 'pub', openVsxNamespace: 'other' },
]

/** The two extension registries alone, as every test before npm and crates were counted. */
const ONLY_EXTENSIONS = { extensions: EXTENSIONS, npmPackages: [], crates: [] }

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

const MARKETPLACE = {
  results: [
    {
      extensions: [
        {
          statistics: [
            { statisticName: 'install', value: 100 },
            { statisticName: 'downloadCount', value: 20 },
            { statisticName: 'averagerating', value: 5 },
          ],
        },
        { statistics: [{ statisticName: 'install', value: 3 }] },
      ],
    },
  ],
}

/** A stand-in for both registries, so no test reaches a real one. */
function registries(answers: {
  marketplace?: () => Response
  openVsx?: (url: string) => Response
}): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('marketplace.visualstudio.com')) {
      return (answers.marketplace ?? (() => json(MARKETPLACE)))()
    }
    return (answers.openVsx ?? (() => json({ downloadCount: 1000 })))(url)
  }) as typeof fetch
}

afterEach(() => vi.restoreAllMocks())

describe('displayInstalls', () => {
  it('rounds down to the ten thousand', () => {
    expect(displayInstalls(169_068)).toBe('160,000+')
    expect(displayInstalls(169_999)).toBe('160,000+')
    expect(displayInstalls(170_000)).toBe('170,000+')
    expect(displayInstalls(1_204_999)).toBe('1,200,000+')
  })

  it('never shows less than the floor', () => {
    const floor = `${INSTALL_FLOOR.toLocaleString('en-US')}+`
    expect(displayInstalls(0)).toBe(floor)
    expect(displayInstalls(INSTALL_FLOOR - 1)).toBe(floor)
    expect(displayInstalls(Number.NaN)).toBe(floor)
  })

  it('keeps the floor on a ten thousand, so the fallback is a figure the page could show', () => {
    expect(INSTALL_FLOOR % 10_000).toBe(0)
  })
})

describe('measureInstalls', () => {
  it('adds Open VSX downloads to Marketplace installs and web downloads', async () => {
    expect(await measureInstalls(ONLY_EXTENSIONS, registries({}))).toBe(100 + 20 + 3 + 1000 + 1000)
  })

  it('asks each registry for the extension under the name it is published as', async () => {
    const asked: string[] = []
    let marketplaceBody = ''
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      asked.push(url)
      if (!url.includes('marketplace')) return json({ downloadCount: 1 })
      marketplaceBody = String(init?.body)
      return json(MARKETPLACE)
    }) as typeof fetch
    await measureInstalls(ONLY_EXTENSIONS, fetcher)
    expect(asked).toContain('https://open-vsx.org/api/pub/a-le')
    expect(asked).toContain('https://open-vsx.org/api/other/b-le')
    expect(marketplaceBody).toContain('"value":"pub.a-le"')
    expect(marketplaceBody).toContain('"value":"pub.b-le"')
  })

  it('counts a registry that is down as zero and reports it', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const down = registries({ marketplace: () => json({}, 503) })
    expect(await measureInstalls(ONLY_EXTENSIONS, down)).toBe(2000)
    expect(logged).toHaveBeenCalledTimes(1)
  })

  it('counts one unreadable extension as zero without losing the rest', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const partial = registries({
      openVsx: url => (url.endsWith('/b-le') ? json({}, 404) : json({ downloadCount: 1000 })),
    })
    expect(await measureInstalls(ONLY_EXTENSIONS, partial)).toBe(123 + 1000)
    expect(logged).toHaveBeenCalledTimes(1)
  })

  it('returns zero when nothing answers, which the display turns into the floor', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const dead = (async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    const measured = await measureInstalls(ONLY_EXTENSIONS, dead)
    expect(measured).toBe(0)
    expect(displayInstalls(measured)).toBe(`${INSTALL_FLOOR.toLocaleString('en-US')}+`)
  })

  it('ignores a count that is not a number', async () => {
    const odd = registries({
      marketplace: () =>
        json({
          results: [
            { extensions: [{ statistics: [{ statisticName: 'install', value: 'many' }] }] },
          ],
        }),
      openVsx: () => json({ downloadCount: null }),
    })
    expect(await measureInstalls(ONLY_EXTENSIONS, odd)).toBe(0)
  })
})

describe('measureRegistries', () => {
  it('keeps the Open VSX figure for each extension beside the sum', async () => {
    expect(await measureRegistries(ONLY_EXTENSIONS, registries({}))).toEqual({
      total: 100 + 20 + 3 + 1000 + 1000,
      bySource: { marketplace: 123, openVsx: 2000, npm: 0, crates: 0 },
      openVsxDownloads: { 'a-le': 1000, 'b-le': 1000 },
    })
  })

  it('leaves out an extension Open VSX would not answer for, and never guesses zero', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('marketplace')) return json(MARKETPLACE)
      return url.endsWith('/a-le') ? json({}, 503) : json({ downloadCount: 7 })
    }) as typeof fetch
    expect((await measureRegistries(ONLY_EXTENSIONS, fetcher)).openVsxDownloads).toEqual({
      'b-le': 7,
    })
    expect(logged).toHaveBeenCalledTimes(1)
    logged.mockRestore()
  })
})

describe('npmWindows', () => {
  it('is one range from the epoch while that is a year or less', () => {
    expect(npmWindows(new Date('2026-10-13T15:00:00Z'))).toEqual([[NPM_EPOCH, '2026-10-13']])
    expect(npmWindows(new Date('2027-07-31T00:00:00Z'))).toEqual([[NPM_EPOCH, '2027-07-31']])
  })

  it('splits into back-to-back ranges once the epoch is over a year ago', () => {
    // 365 days each, counting both ends, with no day shared and none skipped.
    expect(npmWindows(new Date('2027-08-01T00:00:00Z'))).toEqual([
      ['2026-08-01', '2027-07-31'],
      ['2027-08-01', '2027-08-01'],
    ])
    expect(npmWindows(new Date('2028-09-15T00:00:00Z'))).toEqual([
      ['2026-08-01', '2027-07-31'],
      ['2027-08-01', '2028-07-30'],
      ['2028-07-31', '2028-09-15'],
    ])
  })

  it('never asks for a range npm would refuse', () => {
    for (const [start, end] of npmWindows(new Date('2031-01-01T00:00:00Z'))) {
      const days = (Date.parse(end) - Date.parse(start)) / 86_400_000 + 1
      expect(days).toBeLessThanOrEqual(365)
    }
  })
})

describe('npm and crates.io', () => {
  const EVERYTHING = {
    extensions: EXTENSIONS,
    npmPackages: ['a-le-mcp', 'b-le-mcp', 'b-le'],
    crates: ['a-le', 'b-le'],
  }

  /** All four registries. npm answers 10 per package per range asked, crates.io 500 a crate. */
  const all = (asked: string[] = [], agents: (string | null)[] = []) =>
    (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      asked.push(url)
      if (url.includes('marketplace.visualstudio.com')) return json(MARKETPLACE)
      if (url.includes('api.npmjs.org')) {
        const names = (url.split('/').at(-1) ?? '').split(',')
        return names.length === 1
          ? json({ downloads: 10, package: names[0] })
          : json(Object.fromEntries(names.map(name => [name, { downloads: 10 }])))
      }
      if (url.includes('crates.io')) {
        agents.push(new Headers(init?.headers).get('user-agent'))
        return json({ crate: { downloads: 500 } })
      }
      return json({ downloadCount: 1000 })
    }) as typeof fetch

  it('adds every registry into one total and keeps what each said', async () => {
    const measured = await measureRegistries(EVERYTHING, all(), new Date('2026-10-13T00:00:00Z'))
    expect(measured.bySource).toEqual({ marketplace: 123, openVsx: 2000, npm: 30, crates: 1000 })
    expect(measured.total).toBe(123 + 2000 + 30 + 1000)
  })

  it('asks npm for every package in one request, from the epoch to today', async () => {
    const asked: string[] = []
    await measureRegistries(EVERYTHING, all(asked), new Date('2026-10-13T00:00:00Z'))
    expect(asked.filter(url => url.includes('npmjs'))).toEqual([
      `https://api.npmjs.org/downloads/point/${NPM_EPOCH}:2026-10-13/a-le-mcp,b-le-mcp,b-le`,
    ])
  })

  it('asks npm once per range and adds them when the epoch is over a year ago', async () => {
    const asked: string[] = []
    const measured = await measureRegistries(
      EVERYTHING,
      all(asked),
      new Date('2027-09-01T00:00:00Z'),
    )
    expect(asked.filter(url => url.includes('npmjs'))).toHaveLength(2)
    expect(measured.bySource.npm).toBe(60)
  })

  it('asks for a scoped package on its own, since npm will not batch one', async () => {
    const asked: string[] = []
    const scoped = { ...EVERYTHING, npmPackages: ['a-le-mcp', 'b-le-mcp', '@pub/c-le'] }
    const measured = await measureRegistries(scoped, all(asked), new Date('2026-10-13T00:00:00Z'))
    expect(asked.filter(url => url.includes('npmjs')).map(url => url.split('/').at(-1))).toEqual([
      'a-le-mcp,b-le-mcp',
      'c-le',
    ])
    expect(measured.bySource.npm).toBe(30)
  })

  it('counts a package npm does not know as nothing', async () => {
    const fetcher = (async (input: RequestInfo | URL) =>
      String(input).includes('npmjs')
        ? json({ 'a-le-mcp': { downloads: 7 }, 'b-le-mcp': null, 'b-le': null })
        : json({})) as typeof fetch
    const measured = await measureRegistries(
      { ...EVERYTHING, extensions: [], crates: [] },
      fetcher,
      new Date('2026-10-13T00:00:00Z'),
    )
    expect(measured.bySource.npm).toBe(7)
  })

  it('names itself to crates.io, which turns away a request that does not', async () => {
    const agents: (string | null)[] = []
    await measureRegistries(EVERYTHING, all([], agents), new Date('2026-10-13T00:00:00Z'))
    expect(agents).toEqual(['letools-site build', 'letools-site build'])
  })

  it('counts a registry that is down as zero, reports it and keeps the rest', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const working = all()
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('npmjs') ? json({}, 503) : working(input, init)) as typeof fetch
    const measured = await measureRegistries(EVERYTHING, fetcher, new Date('2026-10-13T00:00:00Z'))
    expect(measured.bySource).toEqual({ marketplace: 123, openVsx: 2000, npm: 0, crates: 1000 })
    expect(logged).toHaveBeenCalledTimes(1)
  })

  it('asks npm nothing when there are no packages', async () => {
    const asked: string[] = []
    await measureRegistries(ONLY_EXTENSIONS, all(asked))
    expect(asked.some(url => url.includes('npmjs') || url.includes('crates.io'))).toBe(false)
  })
})
