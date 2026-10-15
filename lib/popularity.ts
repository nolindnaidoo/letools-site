import { reportError } from './error'

/**
 * The order a list of tools is shown in where the order is ours to choose:
 * most downloaded on Open VSX first, behind the one tool that always leads.
 *
 * `next.config.ts` reads the counts once per build and passes them in, so the
 * order follows the registry without an edit. The floor below is what a build
 * that could not reach Open VSX falls back to. A download counter only goes
 * up, so a figure measured once stays a true lower bound, and the higher of
 * the two is used for each tool.
 */

/** Always first, whatever the counts say. The owner's call, not a measurement. */
export const LEADS = 'decisionlint'

/**
 * Open VSX downloads per extension, measured 2026-10-12.
 *
 * DecisionLint has no row: its listing is new on 2026-10-14, the 1,712 its
 * predecessor JevLint-LE had stayed with that listing, and a floor is only
 * true for the listing it was measured on. Absent reads as zero, and it leads
 * through `LEADS` whatever its count.
 */
export const DOWNLOADS_FLOOR: Readonly<Record<string, number>> = Object.freeze({
  'paths-le': 22_536,
  'string-le': 22_137,
  'envsync-le': 18_661,
  'scrape-le': 14_304,
  'numbers-le': 13_800,
  'urls-le': 13_459,
  'colors-le': 7_277,
  'dates-le': 6_885,
  'secrets-le': 3_722,
  'regex-le': 3_712,
  'i18n-le': 758,
  'unicode-le': 750,
  'ids-le': 734,
  'ips-le': 718,
  'versions-le': 676,
  'units-le': 646,
})

type Counts = Readonly<Record<string, unknown>>

/** What the build measured, or nothing when it is absent or not a map of counts. */
export function parseMeasured(raw: string | undefined): Counts {
  if (raw === undefined || raw === '') return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Counts)
      : {}
  } catch (error) {
    reportError(error, { source: 'popularity' })
    return {}
  }
}

const MEASURED = parseMeasured(process.env.LETOOLS_OPENVSX_DOWNLOADS)

export function downloadsOf(id: string, measured: Counts = MEASURED): number {
  const fresh = measured[id]
  const floor = DOWNLOADS_FLOOR[id] ?? 0
  return typeof fresh === 'number' && Number.isFinite(fresh) ? Math.max(fresh, floor) : floor
}

/** Most downloaded first, `LEADS` ahead of all of them. Ties keep the order they came in. */
export function byDownloads<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  measured: Counts = MEASURED,
): readonly T[] {
  const rank = (item: T) =>
    idOf(item) === LEADS ? Number.POSITIVE_INFINITY : downloadsOf(idOf(item), measured)
  return [...items].sort((a, b) => (rank(a) === rank(b) ? 0 : rank(b) > rank(a) ? 1 : -1))
}
