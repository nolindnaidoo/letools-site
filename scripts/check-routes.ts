#!/usr/bin/env bun
/**
 * Fails the build when a page in the registry would not resolve when served.
 *
 * The sibling site pixelcoords.dev shipped with four of five pages returning
 * 404 while every other gate was green: the build emitted `vs/pixelsnap.html`,
 * the preview server resolved an extensionless request to it, and the deployed
 * host did not. Nothing related the build's output shape to the host's routing
 * rules, so nothing noticed.
 *
 * Next's static export emits `out/tools/<id>.html` and a sibling
 * `out/tools/<id>/` holding only RSC payloads — no `index.html`. Vercel
 * resolves `/tools/<id>` to the `.html` file because it recognises a Next
 * export. That is a real dependency on the host, so it is asserted here rather
 * than assumed.
 *
 * Run: bun run routes   (after bun run build)
 */
import { readdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../lib/tools'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BUILD = resolve(ROOT, 'out')

/** Every path the site is expected to serve, from the registry. */
export function expectedPaths(toolIds: readonly string[]): readonly string[] {
  return ['/', ...toolIds.map(id => `/tools/${id}`)]
}

/** The file a static host serves for a request path, or undefined for a 404. */
export function resolves(path: string, exists: (file: string) => boolean): string | undefined {
  if (path === '/') return exists('index.html') ? 'index.html' : undefined
  const bare = path.replace(/^\//, '')
  // A directory index wins where one exists; otherwise the flat `.html` file,
  // which is what a Next export produces and what Vercel serves.
  for (const candidate of [`${bare}/index.html`, `${bare}.html`]) {
    if (exists(candidate)) return candidate
  }
  return undefined
}

function fileExists(build: string): (file: string) => boolean {
  return file => statSync(resolve(build, file), { throwIfNoEntry: false })?.isFile() === true
}

/** Page files in the build that the registry does not account for. */
export function orphans(build: string, expected: readonly string[]): readonly string[] {
  const claimed = new Set<string>()
  for (const path of expected) {
    const file = resolves(path, fileExists(build))
    if (file !== undefined) claimed.add(file)
  }

  const found: string[] = []
  const walk = (directory: string, prefix: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`
      if (entry.isDirectory()) {
        walk(resolve(directory, entry.name), relative)
        continue
      }
      if (!entry.name.endsWith('.html')) continue
      // Next emits these for its own error and not-found routing; they are
      // framework output rather than pages the registry should know about.
      if (/^(404|500|_not-found)\.html$/.test(relative)) continue
      if (!claimed.has(relative)) found.push(relative)
    }
  }
  walk(build, '')
  return found.sort()
}

export function main(build: string = BUILD): number {
  if (!statSync(build, { throwIfNoEntry: false })?.isDirectory()) {
    process.stderr.write(`\ncheck-routes: no build at ${build}. Run \`bun run build\` first.\n\n`)
    return 2
  }

  const expected = expectedPaths(TOOLS.map(tool => tool.id))
  const exists = fileExists(build)
  let failed = 0

  for (const path of expected) {
    const file = resolves(path, exists)
    if (file === undefined) {
      process.stdout.write(`  ✗ ${path.padEnd(28)} 404 — nothing serves this path\n`)
      failed += 1
      continue
    }
    process.stdout.write(`  ✓ ${path.padEnd(28)} ${file}\n`)
  }

  // A page the registry forgot is as broken as one that 404s: it ships with no
  // nav entry, no sitemap line, and no e2e coverage.
  const unclaimed = orphans(build, expected)
  for (const file of unclaimed) {
    process.stdout.write(`  ! ${file} is built but no registry entry points at it\n`)
    failed += 1
  }

  if (failed === 0) {
    process.stdout.write(`\nRoutes: all ${expected.length} registry paths resolve, no orphans.\n`)
    return 0
  }

  process.stderr.write(`\ncheck-routes: ${failed} problem(s).\n\n`)
  return 1
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-routes: unexpected failure — this is a bug.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
