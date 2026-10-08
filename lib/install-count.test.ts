import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  displayInstalls,
  INSTALL_FLOOR,
  measureInstalls,
  type PublishedExtension,
} from './install-count'

const EXTENSIONS: readonly PublishedExtension[] = [
  { id: 'a-le', publisher: 'pub', openVsxNamespace: 'pub' },
  { id: 'b-le', publisher: 'pub', openVsxNamespace: 'other' },
]

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
    expect(displayInstalls(133_056)).toBe('130,000+')
    expect(displayInstalls(139_999)).toBe('130,000+')
    expect(displayInstalls(140_000)).toBe('140,000+')
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
    expect(await measureInstalls(EXTENSIONS, registries({}))).toBe(100 + 20 + 3 + 1000 + 1000)
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
    await measureInstalls(EXTENSIONS, fetcher)
    expect(asked).toContain('https://open-vsx.org/api/pub/a-le')
    expect(asked).toContain('https://open-vsx.org/api/other/b-le')
    expect(marketplaceBody).toContain('"value":"pub.a-le"')
    expect(marketplaceBody).toContain('"value":"pub.b-le"')
  })

  it('counts a registry that is down as zero and reports it', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const down = registries({ marketplace: () => json({}, 503) })
    expect(await measureInstalls(EXTENSIONS, down)).toBe(2000)
    expect(logged).toHaveBeenCalledTimes(1)
  })

  it('counts one unreadable extension as zero without losing the rest', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const partial = registries({
      openVsx: url => (url.endsWith('/b-le') ? json({}, 404) : json({ downloadCount: 1000 })),
    })
    expect(await measureInstalls(EXTENSIONS, partial)).toBe(123 + 1000)
    expect(logged).toHaveBeenCalledTimes(1)
  })

  it('returns zero when nothing answers, which the display turns into the floor', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const dead = (async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    const measured = await measureInstalls(EXTENSIONS, dead)
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
    expect(await measureInstalls(EXTENSIONS, odd)).toBe(0)
  })
})
