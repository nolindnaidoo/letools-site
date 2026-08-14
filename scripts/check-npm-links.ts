#!/usr/bin/env bun
/**
 * Verify every npmjs.com package link actually resolves.
 *
 * A generic link checker cannot do this either, for the opposite reason to
 * Open VSX. npmjs.com answers 403 to automated clients — every one of them,
 * browser user-agent or not — so a status-code checker reports ten dead links
 * for ten packages that are all published and fine. The registry is the source
 * that owns the fact and answers it plainly:
 *   https://registry.npmjs.org/colors-le-mcp  ->  200 with a packument
 *   https://registry.npmjs.org/nope-le-mcp    ->  404
 *
 * This is the same shape as `check-openvsx-links.ts`: exclude the host from
 * lychee, ask the API instead. A gate that cannot tell "blocked" from "broken"
 * is worse than no gate, because it goes red weekly until nobody reads it.
 *
 *   bun scripts/check-npm-links.ts <dir-of-markdown>
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `/package/<name>`, scoped or not, with an optional trailing segment such as
 * `/v/1.2.3`.
 *
 * The character class carries the same exclusions as the Open VSX pattern, the
 * backslash included: the built site serializes these URLs inside JavaScript
 * strings where the closing quote is escaped, so the raw text reads
 * `…/colors-le-mcp\",` and a pattern that swallows the backslash reports a live
 * package as dead.
 */
export const LINK = /npmjs\.com\/package\/((?:@[^/\s)"'<>\\]+\/)?[^/\s)#"'<>\\]+)/g

/** Every package name referenced by one document. */
export function refsIn(text: string): readonly string[] {
  return [...text.matchAll(LINK)].map(match => `${match[1]}`)
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

/** What the registry says about one package. */
export type ApiResult = Readonly<{ missing: boolean; version?: string; unreachable?: string }>

/**
 * A 404 is a real answer — the package is not there. Anything else that is not
 * a 200 is the registry having a bad day, which says nothing about the link, so
 * it is reported and passed rather than failed. Same rule the content-drift
 * gate runs on: an outage is not evidence of dishonesty.
 */
export async function lookUp(ref: string): Promise<ApiResult> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${ref}`, {
      headers: { 'user-agent': 'le-tools-link-check' },
    })
    if (response.status === 404) return { missing: true }
    if (!response.ok) return { missing: false, unreachable: `HTTP ${response.status}` }
    const body = (await response.json()) as { 'dist-tags'?: { latest?: string } }
    const latest = body['dist-tags']?.latest
    // Built conditionally rather than with `version: latest`: under
    // `exactOptionalPropertyTypes` an explicit undefined is not an absent key.
    return latest === undefined ? { missing: false } : { missing: false, version: latest }
  } catch (cause) {
    return { missing: false, unreachable: cause instanceof Error ? cause.message : String(cause) }
  }
}

export async function main(
  root: string | undefined = process.argv[2],
  fetchOne: (ref: string) => Promise<ApiResult> = lookUp,
): Promise<number> {
  if (root === undefined) {
    process.stderr.write('usage: check-npm-links.ts <dir-of-markdown>\n')
    return 2
  }

  const found = scan(root)
  if (found.size === 0) {
    process.stdout.write('No npmjs.com package links found.\n')
    return 0
  }

  const problems: string[] = []
  const skipped: string[] = []
  for (const [ref, files] of found) {
    const body = await fetchOne(ref)
    if (body.missing) {
      problems.push(`${ref} is not published on npm (referenced by ${[...files].join(', ')})`)
      continue
    }
    if (body.unreachable !== undefined) {
      skipped.push(`${ref} — ${body.unreachable}`)
      continue
    }
    process.stdout.write(`  ok  ${ref}${body.version === undefined ? '' : ` v${body.version}`}\n`)
  }

  for (const skip of skipped) process.stdout.write(`  ~   skipped: ${skip}\n`)

  if (problems.length > 0) {
    process.stderr.write('\nDead npm links:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      '\nnpmjs.com answers 403 to every automated client, so a generic link ' +
        'checker cannot see this — the registry API is what tells the truth.\n',
    )
    return 1
  }

  process.stdout.write(`\nAll ${found.size - skipped.length} npm links resolve.\n`)
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-npm-links: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
