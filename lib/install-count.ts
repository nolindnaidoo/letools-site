import { reportError } from './error'

/**
 * The lowest figure the site will ever show.
 *
 * Measured 2026-10-08: 125,509 Open VSX downloads + 7,547 Marketplace
 * acquisitions (installs plus web downloads) = 133,056. Both counters only go
 * up, so a number measured once stays a true lower bound. It is what the page
 * shows when a build cannot reach either registry, and it is why a partial
 * answer can never lower the figure.
 */
export const INSTALL_FLOOR = 130_000

const STEP = 10_000
const TIMEOUT_MS = 10_000
const MARKETPLACE_QUERY = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'
/** Marketplace filter type for an exact `publisher.name` match. */
const BY_EXTENSION_NAME = 7
/** Marketplace query flag that includes the statistics block. */
const INCLUDE_STATISTICS = 256
/** Installs and web downloads are separate counters, and an acquisition is either. */
const ACQUISITIONS = ['install', 'downloadCount'] as const

export type PublishedExtension = Readonly<{
  id: string
  publisher: string
  openVsxNamespace: string
}>

type Fetcher = typeof fetch

/** `133056` reads as `130,000+`: rounded down, so the page never overstates. */
export function displayInstalls(measured: number): string {
  const known = Number.isFinite(measured) ? Math.max(measured, INSTALL_FLOOR) : INSTALL_FLOOR
  return `${(Math.floor(known / STEP) * STEP).toLocaleString('en-US')}+`
}

async function readJson(fetcher: Fetcher, url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetcher(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.json()
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

async function openVsxDownloads(fetcher: Fetcher, extension: PublishedExtension): Promise<number> {
  const body = (await readJson(
    fetcher,
    `https://open-vsx.org/api/${extension.openVsxNamespace}/${extension.id}`,
  )) as { downloadCount?: unknown }
  return count(body.downloadCount)
}

type MarketplaceAnswer = {
  results?: readonly {
    extensions?: readonly {
      statistics?: readonly { statisticName?: string; value?: unknown }[]
    }[]
  }[]
}

async function marketplaceAcquisitions(
  fetcher: Fetcher,
  extensions: readonly PublishedExtension[],
): Promise<number> {
  const criteria = extensions.map(extension => ({
    filterType: BY_EXTENSION_NAME,
    value: `${extension.publisher}.${extension.id}`,
  }))
  const body = (await readJson(fetcher, MARKETPLACE_QUERY, {
    method: 'POST',
    headers: {
      Accept: 'application/json;api-version=3.0-preview.1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters: [{ criteria, pageSize: extensions.length }],
      flags: INCLUDE_STATISTICS,
    }),
  })) as MarketplaceAnswer
  const statistics = (body.results ?? [])
    .flatMap(result => result.extensions ?? [])
    .flatMap(extension => extension.statistics ?? [])
  return statistics
    .filter(statistic => ACQUISITIONS.some(name => name === statistic.statisticName))
    .reduce((total, statistic) => total + count(statistic.value), 0)
}

export type Measured = Readonly<{
  /** Open VSX downloads plus Marketplace acquisitions, across every extension. */
  installs: number
  /** Open VSX downloads by extension id. An extension that could not be read is absent. */
  openVsxDownloads: Readonly<Record<string, number>>
}>

/**
 * What the two public registries say about the published extensions: the sum
 * the page shows, and the Open VSX figure for each, which orders them.
 *
 * A source that cannot be read counts as zero and is reported. The sum is then
 * short, which `displayInstalls` absorbs by never going under the floor, so an
 * outage costs freshness and never a build.
 */
export async function measureRegistries(
  extensions: readonly PublishedExtension[],
  fetcher: Fetcher = fetch,
): Promise<Measured> {
  const answers = await Promise.allSettled([
    marketplaceAcquisitions(fetcher, extensions),
    ...extensions.map(extension => openVsxDownloads(fetcher, extension)),
  ])
  const [marketplace, ...downloads] = answers.map(answer => {
    if (answer.status === 'fulfilled') return answer.value
    reportError(answer.reason, { source: 'install-count' })
    return undefined
  })
  const read = extensions.flatMap((extension, index) => {
    const value = downloads[index]
    return value === undefined ? [] : [[extension.id, value] as const]
  })
  return {
    installs: read.reduce((total, [, value]) => total + value, marketplace ?? 0),
    openVsxDownloads: Object.fromEntries(read),
  }
}

/** The sum alone, for a caller that orders nothing. */
export async function measureInstalls(
  extensions: readonly PublishedExtension[],
  fetcher: Fetcher = fetch,
): Promise<number> {
  return (await measureRegistries(extensions, fetcher)).installs
}
