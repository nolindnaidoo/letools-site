import { reportError } from './error'

/**
 * The lowest figure the site will ever show.
 *
 * Measured 2026-10-13: 132,539 Open VSX downloads + 8,235 Marketplace
 * acquisitions (installs plus web downloads) + 26,451 npm downloads + 1,843
 * crates.io downloads = 169,068. Three of the four only go up. The
 * Marketplace's read 5 lower on a second build minutes later, so the floor is
 * the ten thousand below the sum and not the sum: a bound with room in it. It
 * is what the page shows when a build cannot reach a registry, and it is why
 * a partial answer can never lower the figure.
 *
 * The names here say "install" from when the figure was the two extension
 * registries alone. The page says "downloads", which is what all four count.
 */
export const INSTALL_FLOOR = 160_000

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

/** `169068` reads as `160,000+`: rounded down, so the page never overstates. */
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

/**
 * npm has no all-time counter, only a sum over a range of days. A range that
 * starts before the family's first package was published (2026-08-05) is all
 * of them, so the sum from here is cumulative and only goes up, like the
 * other three counters. A weekly figure would rise and fall.
 */
export const NPM_EPOCH = '2026-08-01'
/** The longest range npm answers for several packages at once. */
const NPM_WINDOW_DAYS = 365
/** The most packages npm answers for in one request. */
const NPM_BULK_SIZE = 128
const DAY_MS = 86_400_000

const day = (date: Date) => date.toISOString().slice(0, 10)

/**
 * The epoch to today as back-to-back ranges npm will answer for. One range
 * until August 2027 and two after it: asked as a single range, the request is
 * refused outright, and clipped to the last year it would quietly lose its
 * oldest days and the total would start to fall.
 */
export function npmWindows(
  today: Date,
  epoch: string = NPM_EPOCH,
): readonly (readonly [string, string])[] {
  const last = Date.parse(`${day(today)}T00:00:00Z`)
  const windows: (readonly [string, string])[] = []
  for (let start = Date.parse(`${epoch}T00:00:00Z`); start <= last; ) {
    const end = Math.min(start + (NPM_WINDOW_DAYS - 1) * DAY_MS, last)
    windows.push([day(new Date(start)), day(new Date(end))])
    start = end + DAY_MS
  }
  return windows
}

function chunks<T>(items: readonly T[], size: number): readonly (readonly T[])[] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  )
}

/** npm answers one package flat and several keyed by name, with `null` for one it does not know. */
function npmSum(body: unknown, packages: readonly string[]): number {
  const answer = body as { downloads?: unknown } & Record<string, { downloads?: unknown } | null>
  if (packages.length === 1) return count(answer.downloads)
  return packages.reduce((total, name) => total + count(answer[name]?.downloads), 0)
}

async function npmDownloads(
  fetcher: Fetcher,
  packages: readonly string[],
  today: Date,
): Promise<number> {
  // A scoped name cannot share a request, so each is asked for alone.
  const scoped = packages.filter(name => name.startsWith('@')).map(name => [name])
  const groups = [
    ...chunks(
      packages.filter(name => !name.startsWith('@')),
      NPM_BULK_SIZE,
    ),
    ...scoped,
  ]
  const sums = await Promise.all(
    npmWindows(today).flatMap(([start, end]) =>
      groups.map(async group =>
        npmSum(
          await readJson(
            fetcher,
            `https://api.npmjs.org/downloads/point/${start}:${end}/${group.join(',')}`,
          ),
          group,
        ),
      ),
    ),
  )
  return sums.reduce((total, sum) => total + sum, 0)
}

async function crateDownloads(fetcher: Fetcher, name: string): Promise<number> {
  // crates.io turns away a request with no user agent.
  const body = (await readJson(fetcher, `https://crates.io/api/v1/crates/${name}`, {
    headers: { 'user-agent': 'letools-site build' },
  })) as { crate?: { downloads?: unknown } }
  return count(body.crate?.downloads)
}

/** Everything the family ships that a registry counts. Read from `lib/tools.ts`, so a new tool is counted without an edit here. */
export type Counted = Readonly<{
  extensions: readonly PublishedExtension[]
  /** Every npm package: the MCP servers and the command lines. */
  npmPackages: readonly string[]
  /** The crates that are on crates.io. */
  crates: readonly string[]
}>

export const SOURCES = ['marketplace', 'openVsx', 'npm', 'crates'] as const
export type Source = (typeof SOURCES)[number]

export type Measured = Readonly<{
  /** Every source added up. A source that could not be read adds nothing. */
  total: number
  /** What each registry answered, for the build log. */
  bySource: Readonly<Record<Source, number>>
  /** Open VSX downloads by extension id. An extension that could not be read is absent. */
  openVsxDownloads: Readonly<Record<string, number>>
}>

/**
 * What the public registries say about everything the family ships: the sum
 * the page shows, and the Open VSX figure for each extension, which orders
 * them.
 *
 * Four registries and no fifth for MCP. The MCP registry lists servers and
 * counts nothing, and a server is fetched from npm or built into a crate, so
 * its use is already in those two.
 *
 * Nothing is counted twice: an extension, an npm package and a crate are
 * three downloads of three things, and the two extension registries serve
 * different editors.
 *
 * A source that cannot be read counts as zero and is reported. The sum is then
 * short, which `displayInstalls` absorbs by never going under the floor, so an
 * outage costs freshness and never a build.
 */
export async function measureRegistries(
  counted: Counted,
  fetcher: Fetcher = fetch,
  today: Date = new Date(),
): Promise<Measured> {
  const { extensions, npmPackages, crates } = counted
  const asked: readonly { source: Source; id?: string; answer: Promise<number> }[] = [
    { source: 'marketplace', answer: marketplaceAcquisitions(fetcher, extensions) },
    ...extensions.map(extension => ({
      source: 'openVsx' as const,
      id: extension.id,
      answer: openVsxDownloads(fetcher, extension),
    })),
    // No packages is no request: npm answers an empty list with an error.
    ...(npmPackages.length === 0
      ? []
      : [{ source: 'npm' as const, answer: npmDownloads(fetcher, npmPackages, today) }]),
    ...crates.map(name => ({ source: 'crates' as const, answer: crateDownloads(fetcher, name) })),
  ]
  const answers = await Promise.allSettled(asked.map(one => one.answer))
  const read = asked.flatMap((one, index) => {
    const answer = answers[index]
    if (answer?.status === 'fulfilled') return [{ ...one, value: answer.value }]
    reportError(answer?.reason, { source: 'install-count' })
    return []
  })
  const sumOf = (source: Source) =>
    read.filter(one => one.source === source).reduce((total, one) => total + one.value, 0)
  const bySource = Object.fromEntries(SOURCES.map(source => [source, sumOf(source)])) as Record<
    Source,
    number
  >
  return {
    total: SOURCES.reduce((total, source) => total + bySource[source], 0),
    bySource,
    openVsxDownloads: Object.fromEntries(
      read.flatMap(one => (one.source === 'openVsx' && one.id ? [[one.id, one.value]] : [])),
    ),
  }
}

/** The sum alone, for a caller that orders nothing. */
export async function measureInstalls(
  counted: Counted,
  fetcher: Fetcher = fetch,
  today: Date = new Date(),
): Promise<number> {
  return (await measureRegistries(counted, fetcher, today)).total
}
