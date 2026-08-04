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

const dir = process.argv[2]
if (dir === undefined) {
  console.error('usage: check-openvsx-links.ts <dir-of-markdown>')
  process.exit(2)
}

// /extension/<namespace>/<name>  with an optional trailing segment (/reviews).
// The character class has to exclude HTML attribute delimiters as well as
// markdown ones — in built HTML the link is followed by a quote, and capturing
// it produces a bogus "does not exist" for an extension that is perfectly fine.
const LINK = /open-vsx\.org\/extension\/([^/\s)"'<>]+)\/([^/\s)#"'<>]+)/g

const found = new Map<string, Set<string>>()

// Markdown for the READMEs, HTML for the built site — the same links appear in
// both and both are published surfaces.
function scan(current: string, label: string): void {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const p = join(current, entry.name)
    if (entry.isDirectory()) {
      // Build output nests deeply; skip asset dirs that cannot contain links.
      if (entry.name === '_next' || entry.name === 'node_modules') continue
      scan(p, label)
      continue
    }
    if (!/\.(md|html)$/.test(entry.name)) continue
    for (const m of readFileSync(p, 'utf8').matchAll(LINK)) {
      const key = `${m[1]}/${m[2]}`
      found.set(key, (found.get(key) ?? new Set()).add(entry.name))
    }
  }
}

scan(dir, dir)

if (found.size === 0) {
  console.log('No open-vsx.org extension links found.')
  process.exit(0)
}

const problems: string[] = []

for (const [ref, files] of found) {
  const res = await fetch(`https://open-vsx.org/api/${ref}`, {
    headers: { 'User-Agent': 'le-tools-link-check' },
  })
  const body = (await res.json()) as { error?: string; version?: string }

  if (body.error !== undefined || body.version === undefined) {
    problems.push(`${ref} does not exist on Open VSX (referenced by ${[...files].join(', ')})`)
  } else {
    console.log(`  ok  ${ref} v${body.version}`)
  }
}

if (problems.length > 0) {
  console.error('\nDead Open VSX links:')
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    '\nThese return HTTP 200 in a browser and in any generic link checker — ' +
      'the page renders "Extension not found" client-side. Only the API reveals it.',
  )
  process.exit(1)
}

console.log(`\nAll ${found.size} Open VSX links resolve.`)
