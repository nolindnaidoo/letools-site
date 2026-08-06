#!/usr/bin/env bun
/**
 * Verify every open-vsx.org extension link actually resolves.
 *
 * A generic link checker cannot do this. open-vsx.org is a single-page app: it
 * returns HTTP 200 for
 *   https://open-vsx.org/extension/nolindnaidoo/paths-le
 * even though that extension does not exist, and renders "Extension not found"
 * client-side. Only the API tells the truth:
 *   https://open-vsx.org/api/nolindnaidoo/paths-le  ->  {"error": "..."}
 *
 * Every Open VSX link in the family currently points at the OffensiveEdge
 * namespace, because the nolindnaidoo namespace is empty pending
 * EclipseFdn/open-vsx.org#12345. When that rename lands these all move, and
 * this is what proves the move was complete.
 *
 *   bun scripts/check-openvsx-links.ts <dir-of-markdown>
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `/extension/<namespace>/<name>` with an optional trailing segment.
 *
 * The character class excludes HTML attribute delimiters as well as markdown
 * ones: in built HTML the link is followed by a quote, and capturing it
 * produces a bogus "does not exist" for an extension that is perfectly fine.
 */
export const LINK = /open-vsx\.org\/extension\/([^/\s)"'<>]+)\/([^/\s)#"'<>]+)/g

/** Every `namespace/name` referenced by one document. */
export function refsIn(text: string): readonly string[] {
  return [...text.matchAll(LINK)].map(match => `${match[1]}/${match[2]}`)
}

/**
 * Markdown for the READMEs, HTML for the built site — the same links appear in
 * both and both are published surfaces.
 */
export function scan(root: string): ReadonlyMap<string, Set<string>> {
  const found = new Map<string, Set<string>>()

  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) {
        // Build output nests deeply; skip asset dirs that cannot contain links.
        if (entry.name === '_next' || entry.name === 'node_modules') continue
        walk(path)
        continue
      }
      if (!/\.(md|html)$/.test(entry.name)) continue
      for (const ref of refsIn(readFileSync(path, 'utf8'))) {
        found.set(ref, (found.get(ref) ?? new Set()).add(entry.name))
      }
    }
  }

  walk(root)
  return found
}

/** What the Open VSX API says about one extension. */
export type ApiResult = Readonly<{ error?: string; version?: string }>

/** The API returns 200 with an `error` body for a missing extension. */
export function isMissing(body: ApiResult): boolean {
  return body.error !== undefined || body.version === undefined
}

export async function lookUp(ref: string): Promise<ApiResult> {
  const response = await fetch(`https://open-vsx.org/api/${ref}`, {
    headers: { 'user-agent': 'le-tools-link-check' },
  })
  return (await response.json()) as ApiResult
}

export async function main(
  root: string | undefined = process.argv[2],
  fetchOne: (ref: string) => Promise<ApiResult> = lookUp,
): Promise<number> {
  if (root === undefined) {
    process.stderr.write('usage: check-openvsx-links.ts <dir-of-markdown>\n')
    return 2
  }

  const found = scan(root)
  if (found.size === 0) {
    process.stdout.write('No open-vsx.org extension links found.\n')
    return 0
  }

  const problems: string[] = []
  for (const [ref, files] of found) {
    const body = await fetchOne(ref)
    if (isMissing(body)) {
      problems.push(`${ref} does not exist on Open VSX (referenced by ${[...files].join(', ')})`)
      continue
    }
    process.stdout.write(`  ok  ${ref} v${body.version}\n`)
  }

  if (problems.length > 0) {
    process.stderr.write('\nDead Open VSX links:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      '\nThese return HTTP 200 in a browser and in any generic link checker — ' +
        'the page renders "Extension not found" client-side. Only the API reveals it.\n',
    )
    return 1
  }

  process.stdout.write(`\nAll ${found.size} Open VSX links resolve.\n`)
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-openvsx-links: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
