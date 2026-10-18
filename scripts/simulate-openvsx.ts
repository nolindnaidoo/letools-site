#!/usr/bin/env bun
/**
 * Predicts where a listing would rank in an Open VSX search before it is
 * published, so a name or keyword change is chosen by evidence rather than by
 * releasing it and waiting a day to see.
 *
 * The model is the query in openvsx `ElasticSearchService.createTextSearchQuery`
 * (unchanged from v1.2.0, which open-vsx.org runs, to master):
 *
 *   should: multi_match(name^5 displayName^5 tags^3 namespace^2 description), boost 5
 *           multi_match(name displayName namespace description), fuzziness AUTO, prefix 2
 *           prefix(displayName) boost 2, prefix(namespace)
 *   times the stored relevance from `RelevanceService`
 *
 * scored with BM25 over the whole catalog, so idf and average field length are
 * the index's own rather than guesses. It reranks each live top 60 with the
 * candidate listing swapped in. Calibrated on 146 live searches across 13
 * tools, it put our own rank within tolerance on 143 (`--calibrate` reruns
 * that check).
 *
 * Tags are what bit the first model: vsce appends one tag per `onLanguage:`
 * activation event, and Open VSX keeps the first 30, so `keywords` alone
 * overstates how much a keyword weighs.
 *
 *   bun scripts/simulate-openvsx.ts colors-le               live listing vs the sibling repo's
 *   bun scripts/simulate-openvsx.ts colors-le --candidate c.json
 *   bun scripts/simulate-openvsx.ts --calibrate [tool-id ...]
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { openVsxId, TOOLS } from '../lib/tools'
import { type Fetch, rankOf, SEARCH_TERMS, search } from './rank-openvsx'

export type Entry = Readonly<{
  namespace: string
  name: string
  displayName?: string | null
  description?: string | null
  tags?: readonly string[] | null
  downloadCount?: number | null
  averageRating?: number | null
  reviewCount?: number | null
  timestamp?: string | null
  verified?: boolean | null
  deprecated?: boolean | null
}>

export type Listing = Readonly<{
  displayName: string
  description: string
  keywords: readonly string[]
  activationEvents: readonly string[]
}>

const FIELDS = ['name', 'displayName', 'tags', 'namespace', 'description'] as const
type Field = (typeof FIELDS)[number]
type Fields = Readonly<Record<Field, readonly string[]>>
const WEIGHTS: Readonly<Record<Field, number>> = {
  name: 5,
  displayName: 5,
  tags: 3,
  namespace: 2,
  description: 1,
}
const FUZZY_FIELDS: readonly Field[] = ['name', 'displayName', 'namespace', 'description']
const K1 = 1.2
const B = 0.75
const MAX_EXPANSIONS = 50
/** Open VSX keeps this many of a version's tags. */
export const MAX_TAGS = 30
/** `RelevanceService` pads every rating with this many average reviews. */
const RATING_PADDING = 100
/** Earlier than any extension, so recency is a share of the registry's lifetime. */
const OLDEST = Date.parse('2019-06-01T00:00:00Z')

/** The standard analyzer, closely enough: Unicode word runs, lowercased, `.` `_` `'` kept inside one. */
export function tokenize(text: string | null | undefined): string[] {
  return (
    (text ?? '')
      .toLowerCase()
      .match(
        /[\p{L}\p{N}\p{M}]+(?:[._'][\p{L}\p{N}\p{M}]+)*|_+[\p{L}\p{N}\p{M}]+(?:_[\p{L}\p{N}\p{M}]+)*/gu,
      )
      ?.slice() ?? []
  )
}

/** The tags Open VSX indexes for a manifest: keywords, then one per `onLanguage:` event, first 30. */
export function indexedTags(
  keywords: readonly string[],
  activationEvents: readonly string[],
): string[] {
  const tags = [...keywords]
  for (const event of activationEvents) {
    const language = event.startsWith('onLanguage:') ? event.slice('onLanguage:'.length) : undefined
    if (language !== undefined && !tags.includes(language)) tags.push(language)
  }
  return tags.slice(0, MAX_TAGS)
}

/**
 * The field length BM25 sees. Lucene stores it in one byte (SmallFloat
 * intToByte4), exact below 24 and coarser above, and scores the decoded value.
 */
export function storedLength(length: number): number {
  if (length < 24) return length
  const value = length - 24
  const bits = value.toString(2).length
  if (bits < 4) return length
  const shift = bits - 4
  const encoded = ((value >> shift) & 0x07) | ((shift + 1) << 3)
  const decodedShift = (encoded >> 3) - 1
  return 24 + (((encoded & 0x07) | 0x08) << decodedShift)
}

/** Edits a fuzziness of AUTO allows for a term of this length. */
export function editsAllowed(term: string): number {
  return term.length <= 2 ? 0 : term.length <= 5 ? 1 : 2
}

export function levenshtein(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current.push(
        Math.min(
          (previous[j] as number) + 1,
          (current[j - 1] as number) + 1,
          (previous[j - 1] as number) + (a[i - 1] === b[j - 1] ? 0 : 1),
        ),
      )
    }
    previous = current
  }
  return previous[b.length] as number
}

function fieldsOf(entry: Entry): Fields {
  return {
    name: tokenize(entry.name),
    displayName: tokenize(entry.displayName),
    tags: (entry.tags ?? []).flatMap(tag => tokenize(tag)),
    namespace: tokenize(entry.namespace),
    description: tokenize(entry.description),
  }
}

const count = (tokens: readonly string[], term: string): number =>
  tokens.reduce((n, token) => n + (token === term ? 1 : 0), 0)

export class Model {
  private readonly docCount = new Map<Field, number>()
  private readonly avgdl = new Map<Field, number>()
  private readonly df = new Map<Field, Map<string, number>>()
  private readonly fuzzy = new Map<string, { boosts: Map<string, number>; blendedDf: number }>()
  private readonly downloadRefLog: number
  private readonly averageRating: number
  private readonly now: number

  constructor(
    readonly catalog: ReadonlyMap<string, Entry>,
    now: number = Date.now(),
  ) {
    const all = [...catalog.values()].map(fieldsOf)
    for (const field of FIELDS) {
      const present = all.map(fields => fields[field]).filter(tokens => tokens.length > 0)
      const df = new Map<string, number>()
      for (const tokens of present) for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1)
      this.docCount.set(field, present.length)
      this.avgdl.set(
        field,
        present.reduce((n, tokens) => n + tokens.length, 0) / Math.max(1, present.length),
      )
      this.df.set(field, df)
    }
    const entries = [...catalog.values()]
    this.downloadRefLog = Math.log1p(Math.max(1, ...entries.map(e => e.downloadCount ?? 0)))
    let stars = 0
    let reviews = 0
    for (const e of entries) {
      if (e.reviewCount && e.averageRating != null) {
        stars += e.averageRating * e.reviewCount
        reviews += e.reviewCount
      }
    }
    this.averageRating = reviews > 0 ? stars / reviews : 4
    this.now = now
  }

  relevance(entry: Entry): number {
    const clamp = (v: number) => Math.max(0, Math.min(1, v))
    const reviews = entry.reviewCount ?? 0
    const rating =
      ((entry.averageRating ?? 0) * reviews + this.averageRating * RATING_PADDING) /
      (reviews + RATING_PADDING) /
      5
    const downloads = Math.log1p(entry.downloadCount ?? 0) / this.downloadRefLog
    const when = entry.timestamp ? Date.parse(entry.timestamp) : OLDEST
    const recency = (when - OLDEST) / (this.now - OLDEST)
    let r = clamp(rating) + clamp(downloads) + clamp(recency)
    if (!entry.verified) r *= 0.5
    if (entry.deprecated) r *= 0.5
    return r
  }

  private idf(field: Field, df: number): number {
    const n = this.docCount.get(field) ?? 0
    return Math.log(1 + (n - df + 0.5) / (df + 0.5))
  }

  /** Lucene 8+ BM25, which dropped the (k1 + 1) numerator. */
  private tfNorm(tf: number, field: Field, length: number): number {
    return tf / (tf + K1 * (1 - B + (B * storedLength(length)) / (this.avgdl.get(field) ?? 1)))
  }

  /** What a fuzzy query for `term` rewrites to in `field`: each index term's boost, and one blended df. */
  private expansions(field: Field, term: string) {
    const key = `${field}\u0000${term}`
    const cached = this.fuzzy.get(key)
    if (cached) return cached
    const cap = editsAllowed(term)
    const found: { boost: number; df: number; token: string }[] = []
    for (const [token, df] of this.df.get(field) ?? []) {
      if (token.slice(0, 2) !== term.slice(0, 2) || Math.abs(token.length - term.length) > cap)
        continue
      const edits = levenshtein(term, token, cap)
      if (edits <= cap)
        found.push({ boost: 1 - edits / Math.min(term.length, token.length), df, token })
    }
    found.sort((a, b) => b.boost - a.boost || (a.token < b.token ? -1 : 1))
    const kept = found.slice(0, MAX_EXPANSIONS)
    const result = {
      boosts: new Map(kept.map(x => [x.token, x.boost])),
      blendedDf: Math.max(1, ...kept.map(x => x.df)),
    }
    this.fuzzy.set(key, result)
    return result
  }

  score(entry: Entry, query: string): number {
    const f = fieldsOf(entry)
    const terms = tokenize(query)
    let exact = 0
    for (const field of FIELDS) {
      const tokens = f[field]
      let s = 0
      for (const t of terms) {
        const tf = count(tokens, t)
        if (tf > 0)
          s +=
            this.idf(field, this.df.get(field)?.get(t) ?? 1) * this.tfNorm(tf, field, tokens.length)
      }
      exact = Math.max(exact, WEIGHTS[field] * s)
    }
    let fuzzy = 0
    for (const field of FUZZY_FIELDS) {
      const tokens = f[field]
      let s = 0
      for (const t of terms) {
        const { boosts, blendedDf } = this.expansions(field, t)
        let best = 0
        for (const token of new Set(tokens)) {
          const boost = boosts.get(token)
          if (boost === undefined) continue
          best = Math.max(
            best,
            boost *
              this.idf(field, blendedDf) *
              this.tfNorm(count(tokens, token), field, tokens.length),
          )
        }
        s += best
      }
      fuzzy = Math.max(fuzzy, s)
    }
    const prefix = query.trim().toLowerCase()
    const pre =
      (f.displayName.some(t => t.startsWith(prefix)) ? 2 : 0) +
      (f.namespace.some(t => t.startsWith(prefix)) ? 1 : 0)
    return (5 * exact + fuzzy + pre) * this.relevance(entry)
  }

  /** 1-based rank of `target` among `pool`, with `override` laid over its live entry. */
  rank(pool: readonly string[], query: string, target: string, override?: Partial<Entry>): number {
    const ids = pool.includes(target) ? pool : [...pool, target]
    const scored: [number, string][] = []
    for (const id of ids) {
      const entry = this.catalog.get(id)
      if (!entry) continue
      scored.push([
        this.score(id === target && override ? { ...entry, ...override } : entry, query),
        id,
      ])
    }
    scored.sort((a, b) => b[0] - a[0] || (a[1] < b[1] ? -1 : 1))
    return scored.findIndex(([, id]) => id === target) + 1
  }
}

/** A manifest as Open VSX would index it. */
export function asEntry(listing: Listing): Partial<Entry> {
  return {
    displayName: listing.displayName,
    description: listing.description,
    tags: indexedTags(listing.keywords, listing.activationEvents),
  }
}

/** A tool's listing from its package.json, resolving a `%key%` display name through package.nls.json. */
export async function readListing(
  repo: string,
  read = (p: string) => readFile(p, 'utf8'),
): Promise<Listing> {
  const pkg = JSON.parse(await read(join(repo, 'package.json'))) as Record<string, unknown>
  let displayName = String(pkg.displayName ?? '')
  const key = /^%(.+)%$/.exec(displayName)?.[1]
  if (key !== undefined) {
    const nls = JSON.parse(await read(join(repo, 'package.nls.json'))) as Record<string, string>
    displayName = nls[key] ?? displayName
  }
  return {
    displayName,
    description: String(pkg.description ?? ''),
    keywords: (pkg.keywords as string[] | undefined) ?? [],
    activationEvents: (pkg.activationEvents as string[] | undefined) ?? [],
  }
}

/** Where `cached` keeps what it downloads; node_modules is ignored and disposable. */
const CACHE_DIR = 'node_modules/.cache/simulate-openvsx'
const DAY = 24 * 60 * 60 * 1000

async function cached<T>(name: string, refresh: boolean, load: () => Promise<T>): Promise<T> {
  const path = join(CACHE_DIR, name)
  if (!refresh) {
    const info = await stat(path).catch(() => undefined)
    if (info && Date.now() - info.mtimeMs < DAY)
      return JSON.parse(await readFile(path, 'utf8')) as T
  }
  const value = await load()
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(path, JSON.stringify(value))
  return value
}

const HEADERS = { 'user-agent': 'le-tools-rank-check' }

/** Every indexed extension, from the v2 query endpoint, which unlike search returns tags. */
export async function fetchCatalog(): Promise<Record<string, Entry>> {
  const page = async (offset: number) => {
    const response = await fetch(`https://open-vsx.org/api/v2/-/query?size=100&offset=${offset}`, {
      headers: HEADERS,
    })
    if (!response.ok)
      throw new Error(`Open VSX query at offset ${offset} answered ${response.status}`)
    return (await response.json()) as { totalSize: number; extensions: Entry[] }
  }
  const first = await page(0)
  const catalog: Record<string, Entry> = {}
  const add = (e: Entry) => {
    catalog[`${e.namespace}.${e.name}`.toLowerCase()] ??= e
  }
  first.extensions.forEach(add)
  const offsets = []
  for (let o = 100; o < first.totalSize; o += 100) offsets.push(o)
  for (let i = 0; i < offsets.length; i += 6) {
    for (const p of await Promise.all(offsets.slice(i, i + 6).map(page))) p.extensions.forEach(add)
  }
  return catalog
}

/** The live top 60 for a query, as ids: the pool the model reranks. */
export async function fetchPool(query: string, fetchPage: Fetch = search): Promise<string[]> {
  const page = await fetchPage(query, 0)
  return page.extensions.slice(0, 60).map(hit => `${hit.namespace}.${hit.name}`.toLowerCase())
}

export type Sources = Readonly<{
  catalog: () => Promise<Record<string, Entry>>
  pool: (query: string) => Promise<string[]>
  live: (id: string, query: string) => Promise<number | undefined>
  listing: (toolId: string) => Promise<Listing>
  candidate: (path: string) => Promise<Partial<Listing>>
}>

export function defaultSources(refresh: boolean): Sources {
  return {
    catalog: () => cached('catalog.json', refresh, fetchCatalog),
    pool: query =>
      cached(`pool-${encodeURIComponent(query)}.json`, refresh, () => fetchPool(query)),
    live: async (id, query) => (await rankOf(id, query)).rank,
    listing: toolId => readListing(join('..', toolId)),
    candidate: async path => JSON.parse(await readFile(path, 'utf8')) as Partial<Listing>,
  }
}

export type Args = Readonly<{
  ids: readonly string[]
  candidate: string | undefined
  calibrate: boolean
  refresh: boolean
}>

export function parseArgs(argv: readonly string[]): Args | string {
  const ids: string[] = []
  let candidate: string | undefined
  let calibrate = false
  let refresh = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string
    if (arg === '--candidate') {
      candidate = argv[++i]
      if (candidate === undefined) return '--candidate needs a JSON file'
    } else if (arg === '--calibrate') calibrate = true
    else if (arg === '--refresh') refresh = true
    else if (arg.startsWith('-')) return `unknown option ${arg}`
    else if (!TOOLS.some(tool => tool.id === arg)) return `unknown tool ${arg}`
    else ids.push(arg)
  }
  if (candidate !== undefined && ids.length !== 1) return '--candidate needs exactly one tool id'
  if (!calibrate && ids.length === 0) return 'name a tool id, or pass --calibrate'
  return { ids, candidate, calibrate, refresh }
}

const DEPTH_CAP = 61

/** Within tolerance: two places, or a quarter of the live rank, whichever is wider. */
export function near(live: number, predicted: number): boolean {
  return Math.abs(live - predicted) <= Math.max(2, live * 0.25)
}

export async function main(
  argv: readonly string[] = process.argv.slice(2),
  sources?: Sources,
  write: (line: string) => void = line => process.stdout.write(`${line}\n`),
): Promise<number> {
  const args = parseArgs(argv)
  if (typeof args === 'string') {
    process.stderr.write(
      `simulate-openvsx: ${args}\nusage: simulate-openvsx.ts <tool-id> [--candidate file.json] | --calibrate [tool-id ...] [--refresh]\n`,
    )
    return 2
  }
  const src = sources ?? defaultSources(args.refresh)
  const catalog = new Map(Object.entries(await src.catalog()))
  const model = new Model(catalog)
  const tools = TOOLS.filter(tool => (args.ids.length === 0 ? true : args.ids.includes(tool.id)))

  if (args.calibrate) {
    let within = 0
    let total = 0
    let logError = 0
    for (const tool of tools) {
      const id = openVsxId(tool).toLowerCase()
      if (!catalog.has(id)) continue
      for (const query of SEARCH_TERMS[tool.id] ?? []) {
        const live = Math.min((await src.live(id, query)) ?? DEPTH_CAP, DEPTH_CAP)
        const predicted = Math.min(model.rank(await src.pool(query), query, id), DEPTH_CAP)
        total++
        logError += Math.abs(Math.log(live) - Math.log(predicted))
        if (near(live, predicted)) within++
        else
          write(
            `  miss  ${tool.id.padEnd(12)} ${JSON.stringify(query).padEnd(24)} live ${live}  model ${predicted}`,
          )
      }
    }
    write(
      `within tolerance ${within}/${total}  mean |log error| ${(logError / Math.max(1, total)).toFixed(3)}`,
    )
    return 0
  }

  for (const tool of tools) {
    const id = openVsxId(tool).toLowerCase()
    const repo = await src.listing(tool.id)
    const options: [string, Partial<Entry> | undefined][] = [
      ['live', undefined],
      ['repo', asEntry(repo)],
    ]
    if (args.candidate !== undefined) {
      options.push(['candidate', asEntry({ ...repo, ...(await src.candidate(args.candidate)) })])
    }
    write(`${tool.name}  (${id})`)
    for (const [label, o] of options.slice(1)) write(`  ${label}: ${(o as Entry).displayName}`)
    write(`  ${''.padEnd(24)}${options.map(([label]) => label.padStart(10)).join('')}`)
    const sums = options.map(() => 0)
    for (const query of SEARCH_TERMS[tool.id] ?? []) {
      const pool = await src.pool(query)
      const ranks = options.map(([, o]) => model.rank(pool, query, id, o))
      ranks.forEach((r, i) => {
        sums[i] = (sums[i] as number) + r
      })
      write(`  ${query.padEnd(24)}${ranks.map(r => String(r).padStart(10)).join('')}`)
    }
    write(`  ${'sum of ranks'.padEnd(24)}${sums.map(s => String(s).padStart(10)).join('')}`)
  }
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\nsimulate-openvsx: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
