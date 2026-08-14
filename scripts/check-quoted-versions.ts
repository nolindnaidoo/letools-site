#!/usr/bin/env bun
/**
 * Every `<package>@<version>` written in prose, checked against the manifest.
 *
 * All ten extension READMEs told the reader to pin `<tool>-le-mcp@2.2.1` while
 * the published package was 2.3.0 — one wrong number copied nine times, aged
 * two releases, and no gate looked at it. A version in prose is the half of a
 * release that nothing bumps.
 *
 * Only exact pins are checked. A range (`^2.2`, `>=2`) is a deliberate
 * looseness and says nothing that can rot.
 *
 * Run: bun run check:quoted-versions [root]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Documents that speak to a reader. */
const DOCS = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'crate/README.md',
  'crate/AGENTS.md',
  'crate/CLAUDE.md',
]

export type Pin = Readonly<{ file: string; line: number; pkg: string; quoted: string }>

/**
 * `name@1.2.3` where the name is one this repository publishes.
 *
 * Anchored on the package names rather than on anything `@`-shaped, so an
 * email address, a scoped npm name and `actions/checkout@v4` are all invisible
 * to it — none of them is a claim about this repository's own release.
 */
export function pinsIn(file: string, source: string, names: readonly string[]): readonly Pin[] {
  const found: Pin[] = []
  const pattern = new RegExp(
    `\\b(${names.map(escapeRegex).join('|')})@(\\d+\\.\\d+\\.\\d+)\\b`,
    'g',
  )
  source.split('\n').forEach((text, index) => {
    for (const match of text.matchAll(pattern)) {
      found.push({ file, line: index + 1, pkg: match[1] as string, quoted: match[2] as string })
    }
  })
  return found
}

/** Not named `escape`: that shadows the global, and biome fails the build on it. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The version each of this repo's own packages currently carries. */
export function manifestVersions(root: string, repo: string): ReadonlyMap<string, string> {
  const versions = new Map<string, string>()
  for (const [manifest, name] of [
    ['package.json', repo],
    ['mcp/package.json', `${repo}-mcp`],
  ] as const) {
    const path = join(root, repo, manifest)
    if (!existsSync(path)) continue
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as { name?: string; version?: string }
    if (parsed.version) versions.set(parsed.name ?? name, parsed.version)
  }
  const cargo = join(root, repo, 'crate/Cargo.toml')
  if (existsSync(cargo)) {
    const version = /^version = "([^"]+)"/m.exec(readFileSync(cargo, 'utf8'))
    if (version) versions.set(repo, version[1] as string)
  }
  return versions
}

export async function main(root: string = process.argv[2] ?? '..'): Promise<number> {
  if (!existsSync(root)) {
    process.stderr.write(`check-quoted-versions: ${root} does not exist\n`)
    return 1
  }
  const repos = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.endsWith('-le'))
    .map(entry => entry.name)
    .sort()

  const problems: string[] = []
  let checked = 0
  for (const repo of repos) {
    const versions = manifestVersions(root, repo)
    if (versions.size === 0) continue
    const names = [...versions.keys()]
    for (const doc of DOCS) {
      const path = join(root, repo, doc)
      if (!existsSync(path)) continue
      for (const pin of pinsIn(`${repo}/${doc}`, readFileSync(path, 'utf8'), names)) {
        checked += 1
        const actual = versions.get(pin.pkg)
        if (actual !== undefined && actual !== pin.quoted) {
          problems.push(
            `${pin.file}:${pin.line} — pins ${pin.pkg}@${pin.quoted}, manifest says ${actual}`,
          )
        }
      }
    }
  }

  if (problems.length > 0) {
    process.stderr.write('Docs pinning a version their manifest disagrees with:\n')
    for (const problem of problems) process.stderr.write(`  ${problem}\n`)
    process.stderr.write(
      '\nA version written in prose is the half of a release that nothing bumps.\n' +
        'Update it in the release commit, or write a range instead of a pin.\n',
    )
    return 1
  }

  process.stdout.write(
    `Quoted versions check passed: ${checked} exact pin(s) match their manifest.\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-quoted-versions: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
