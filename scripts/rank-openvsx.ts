#!/usr/bin/env bun
/**
 * Where each extension ranks in an Open VSX search, for the terms someone
 * looking for it would type.
 *
 * Ranks come from the same API and sort the site's search box uses. Open VSX
 * scores a match in `name` and `displayName` at five times one in the
 * description and `tags` at three, then multiplies by a relevance built from
 * rating, downloads and recency. So a listing whose name holds the searched
 * word as a whole token beats a far more downloaded one whose name does not:
 * "EnvSync-LE" tokenizes to `envsync` and `le`, and ranked 25th for "env".
 *
 * This is a report, not a gate. A rank is a fact about the registry at one
 * moment, and other publishers move it.
 *
 *   bun scripts/rank-openvsx.ts                     every tool, its own terms
 *   bun scripts/rank-openvsx.ts envsync-le paths-le some tools
 *   bun scripts/rank-openvsx.ts envsync-le --query "env sync" --query dotenv
 */
import { openVsxId, TOOLS } from '../lib/tools'

/**
 * What someone looking for each tool would type. Short phrases, the way people
 * search a marketplace, not the way the README describes the tool.
 */
export const SEARCH_TERMS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  'string-le': [
    'string',
    'strings',
    'extract strings',
    'string extractor',
    'i18n strings',
    'json strings',
  ],
  'numbers-le': [
    'number',
    'numbers',
    'magic numbers',
    'magic number',
    'hardcoded numbers',
    'extract numbers',
    'numeric',
    'number extractor',
  ],
  'paths-le': [
    'path',
    'paths',
    'file path',
    'file paths',
    'broken paths',
    'path checker',
    'missing files',
    'import paths',
    'extract paths',
    'dead paths',
    'path validator',
  ],
  'colors-le': [
    'color',
    'colors',
    'color palette',
    'palette',
    'hex color',
    'hex colors',
    'css colors',
    'extract colors',
    'color checker',
    'design tokens',
    'color audit',
    'tailwind colors',
    'color extractor',
  ],
  'urls-le': [
    'url',
    'urls',
    'link',
    'links',
    'url extractor',
    'extract urls',
    'find urls',
    'link extractor',
    'endpoints',
    'list urls',
    'url list',
  ],
  'dates-le': [
    'date',
    'dates',
    'timestamp',
    'timestamps',
    'unix timestamp',
    'epoch',
    'iso 8601',
    'date parser',
    'extract dates',
    'datetime',
    'timezone',
    'epoch converter',
  ],
  'units-le': [
    'unit',
    'units',
    'quantity',
    'quantities',
    'duration',
    'durations',
    'bytes',
    'unit conversion',
    'unit converter',
    'extract units',
    'percentages',
  ],
  'ids-le': [
    'uuid',
    'guid',
    'ulid',
    'nanoid',
    'objectid',
    'snowflake',
    'uuid decoder',
    'ids',
    'identifiers',
    'extract uuid',
    'snowflake id',
  ],
  'ips-le': ['ip', 'ip address', 'ips', 'cidr', 'extract ip', 'mac address'],
  'regex-le': ['regex', 'redos', 'regex checker', 'catastrophic backtracking', 'regex lint'],
  'scrape-le': [
    'scrape',
    'scraper',
    'scraping',
    'web scraping',
    'crawler',
    'scrapeable',
    'anti-bot',
    'robots.txt',
    'cloudflare',
    'bot detection',
  ],
  'versions-le': [
    'version',
    'versions',
    'dependency',
    'dependencies',
    'dependency versions',
    'version mismatch',
    'version conflict',
    'semver',
    'package versions',
    'monorepo',
  ],
  'i18n-le': [
    'i18n',
    'translation',
    'translations',
    'localization',
    'l10n',
    'missing translations',
    'i18n lint',
    'i18next',
    'locale',
    'translation checker',
    'i18n checker',
  ],
  decisionlint: ['jev', 'luna', 'luna lint', 'jev lint', 'decision model', 'decisions api'],
  'secrets-le': [
    'secret',
    'secrets',
    'secret scanner',
    'credentials',
    'api key',
    'api keys',
    'hardcoded secrets',
    'leaked secrets',
    'password',
    'secret detection',
    'credential scanner',
    'leak',
  ],
  'envsync-le': [
    'env',
    'dotenv',
    '.env',
    'env sync',
    'env check',
    'env checker',
    'env compare',
    'env diff',
    'dotenv sync',
    'dotenv check',
    'env missing keys',
    'missing env',
    'env example',
    'env vars',
    'environment variables',
  ],
  'unicode-le': [
    'unicode',
    'invisible characters',
    'zero width',
    'homoglyph',
    'homoglyphs',
    'bidi',
    'trojan source',
    'hidden characters',
    'confusables',
    'non-breaking space',
    'invisible',
  ],
})

const PAGE = 100
/** Past three pages a rank is no longer a result anyone scrolls to. */
export const DEPTH = 300

type Hit = Readonly<{ namespace: string; name: string; displayName?: string }>
export type Page = Readonly<{ totalSize: number; extensions: readonly Hit[] }>
export type Fetch = (query: string, offset: number) => Promise<Page>

export async function search(query: string, offset: number): Promise<Page> {
  const params = new URLSearchParams({
    query,
    size: String(PAGE),
    offset: String(offset),
    sortBy: 'relevance',
    sortOrder: 'desc',
  })
  const response = await fetch(`https://open-vsx.org/api/-/search?${params}`, {
    headers: { 'user-agent': 'le-tools-rank-check' },
  })
  if (!response.ok) throw new Error(`Open VSX search for "${query}" answered ${response.status}`)
  return (await response.json()) as Page
}

export type Rank = Readonly<{
  query: string
  /** 1-based, or undefined when the extension is not within DEPTH. */
  rank: number | undefined
  total: number
  leaders: readonly string[]
}>

/** Compared case-insensitively, as Open VSX resolves an id. */
export async function rankOf(id: string, query: string, fetchPage: Fetch = search): Promise<Rank> {
  const wanted = id.toLowerCase()
  let leaders: readonly string[] = []
  let total = 0
  for (let offset = 0; offset < DEPTH; offset += PAGE) {
    const page = await fetchPage(query, offset)
    total = page.totalSize
    if (offset === 0) leaders = page.extensions.slice(0, 3).map(hit => hit.displayName ?? hit.name)
    const index = page.extensions.findIndex(
      hit => `${hit.namespace}.${hit.name}`.toLowerCase() === wanted,
    )
    if (index !== -1) return { query, rank: offset + index + 1, total, leaders }
    if (page.extensions.length < PAGE) break
  }
  return { query, rank: undefined, total, leaders }
}

export function formatRank(result: Rank): string {
  const rank = result.rank === undefined ? `>${DEPTH}` : String(result.rank)
  return `  ${rank.padStart(5)}  ${JSON.stringify(result.query).padEnd(28)} of ${String(result.total).padEnd(5)} top: ${result.leaders.join(', ')}`
}

export type Args = Readonly<{ ids: readonly string[]; queries: readonly string[] }>

export function parseArgs(argv: readonly string[]): Args | string {
  const ids: string[] = []
  const queries: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string
    if (arg === '--query') {
      const query = argv[++i]
      if (query === undefined || query.trim() === '') return '--query needs a search phrase'
      queries.push(query)
      continue
    }
    if (arg.startsWith('-')) return `unknown option ${arg}`
    if (!TOOLS.some(tool => tool.id === arg)) return `unknown tool ${arg}`
    ids.push(arg)
  }
  if (queries.length > 0 && ids.length === 0) return '--query needs at least one tool id'
  return { ids, queries }
}

export async function main(
  argv: readonly string[] = process.argv.slice(2),
  fetchPage: Fetch = search,
  write: (line: string) => void = line => process.stdout.write(`${line}\n`),
): Promise<number> {
  const args = parseArgs(argv)
  if (typeof args === 'string') {
    process.stderr.write(
      `rank-openvsx: ${args}\nusage: rank-openvsx.ts [tool-id ...] [--query <phrase> ...]\n`,
    )
    return 2
  }
  const tools = args.ids.length === 0 ? TOOLS : TOOLS.filter(tool => args.ids.includes(tool.id))
  for (const tool of tools) {
    const id = openVsxId(tool)
    write(`${tool.name}  (${id})`)
    for (const query of args.queries.length > 0 ? args.queries : (SEARCH_TERMS[tool.id] ?? [])) {
      write(formatRank(await rankOf(id, query, fetchPage)))
    }
  }
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\nrank-openvsx: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
