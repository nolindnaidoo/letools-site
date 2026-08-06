import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { factsFor, LOCALE_COUNT, TOOLS } from '../lib/tools'
import { BUDGETS, main as budgetMain, kb, walk } from './check-budget'
import { type Demo, main as demosMain, problemsWith, readDemos, sha1 } from './check-demos'
import { fingerprint, main as fleetMain, hash, problemsIn, REPOS, SHARED } from './check-fleet'
import { isMissing, main as linksMain, refsIn, scan } from './check-openvsx-links'
import { expectedPaths, orphans, resolves, main as routesMain } from './check-routes'
import { argsFor, destinationFor, FILTER, sourceFor } from './sync-demos'
import { main as registryMain, render, factsFor as repoFacts } from './sync-registry'

/**
 * The gate scripts. Run once and seen to print a tick, they prove the happy
 * path and nothing else — a budget that never fails and a drift check that
 * never detects drift look exactly like a passing build.
 *
 * None of these were testable before: each was a top-level script that ran on
 * import, so there was nothing to call. They now expose their rules as pure
 * functions, which is what these exercise.
 */

const scratch = mkdtempSync(join(tmpdir(), 'letools-scripts-'))
afterAll(() => rmSync(scratch, { recursive: true, force: true }))

function fakeBuild(files: Readonly<Record<string, number | string>>): string {
  const root = mkdtempSync(join(scratch, 'out-'))
  for (const [relative, content] of Object.entries(files)) {
    const full = join(root, relative)
    mkdirSync(join(full, '..'), { recursive: true })
    writeFileSync(full, typeof content === 'number' ? 'x'.repeat(content) : content)
  }
  return root
}

describe('check-budget', () => {
  it('formats bytes as kilobytes', () => {
    expect(kb(1024)).toBe('1.0 KB')
    expect(kb(1536)).toBe('1.5 KB')
  })

  it('walks nested directories', () => {
    expect([...walk(fakeBuild({ 'a.js': 10, 'n/b.css': 10, 'n/d/c.woff2': 10 }))]).toHaveLength(3)
  })

  it('passes under the ceilings', () => {
    expect(budgetMain(fakeBuild({ 'app.js': 100, 'app.css': 100 }))).toBe(0)
  })

  it('sums a class rather than checking the largest file', () => {
    // Files under the ceiling individually can blow it together — the failure
    // a per-file check would miss.
    const css = BUDGETS.find(budget => budget.label === 'CSS')
    const each = Math.ceil((css?.ceiling ?? 0) / 3)
    expect(
      budgetMain(fakeBuild({ 'a.css': each, 'b.css': each, 'c.css': each, 'd.css': each })),
    ).toBe(1)
  })

  it('reports misuse when there is no build', () => {
    expect(budgetMain(join(scratch, 'never-built'))).toBe(2)
  })
})

describe('check-demos', () => {
  const demo = (id: string, bytes: string): Demo => ({ id, sha1: sha1(bytes) })

  it('passes when every tool has its own demo', () => {
    expect(problemsWith(['a', 'b'], [demo('a', 'one'), demo('b', 'two')])).toEqual([])
  })

  it('catches the duplicate that shipped to a Marketplace listing', () => {
    // Colors-LE carried the Dates-LE recording. Identical bytes, two tools.
    const problems = problemsWith(['a', 'b'], [demo('a', 'same'), demo('b', 'same')])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('a and b ship the same demo')
  })

  it('catches a tool with no demo at all', () => {
    const problems = problemsWith(['a', 'b'], [demo('a', 'one')])
    expect(problems.some(problem => problem.includes('b: public/demos/b.gif is missing'))).toBe(
      true,
    )
  })

  it('catches a demo no tool claims', () => {
    const problems = problemsWith(['a'], [demo('a', 'one'), demo('ghost', 'two')])
    expect(problems.some(problem => problem.includes('ghost'))).toBe(true)
  })
})

describe('check-routes', () => {
  it('expects the home page plus one page per tool', () => {
    expect(expectedPaths(['a', 'b'])).toEqual(['/', '/tools/a', '/tools/b'])
  })

  it('prefers a directory index and falls back to the flat file', () => {
    // A Next export emits `tools/a.html`; other generators emit an index.
    const withIndex = (file: string) => file === 'tools/a/index.html'
    expect(resolves('/tools/a', withIndex)).toBe('tools/a/index.html')
    const withFlat = (file: string) => file === 'tools/a.html'
    expect(resolves('/tools/a', withFlat)).toBe('tools/a.html')
  })

  it('reports a 404 when neither shape exists', () => {
    expect(resolves('/tools/gone', () => false)).toBeUndefined()
    expect(resolves('/', () => false)).toBeUndefined()
  })

  it('passes when every registry path has a file behind it', () => {
    // Built from the real registry, so adding a tool without a page fails here.
    const files: Record<string, string> = { 'index.html': 'home' }
    for (const tool of TOOLS) files[`tools/${tool.id}.html`] = 'x'
    expect(routesMain(fakeBuild(files))).toBe(0)
  })

  it('fails when a registry entry has no page', () => {
    expect(routesMain(fakeBuild({ 'index.html': 'home' }))).toBe(1)
  })

  it('reports misuse when there is no build', () => {
    expect(routesMain(join(scratch, 'never-built'))).toBe(2)
  })

  it('flags a built page the registry does not point at', () => {
    // A page with no registry entry ships with no nav link, no sitemap line
    // and no e2e coverage — as broken as one that 404s, and quieter.
    const build = fakeBuild({ 'index.html': 'home', 'stray.html': 'x' })
    expect(orphans(build, ['/'])).toEqual(['stray.html'])
  })

  it('does not flag the framework error pages as orphans', () => {
    const build = fakeBuild({ 'index.html': 'h', '404.html': 'x', '_not-found.html': 'x' })
    expect(orphans(build, ['/'])).toEqual([])
  })
})

describe('check-fleet', () => {
  const prints = (entries: Record<string, string | null>) => new Map(Object.entries(entries))

  it('passes when every repo has the same file', () => {
    expect(problemsIn('ci.yml', prints({ a: 'h1', b: 'h1', c: 'h1' }), [])).toEqual([])
  })

  it('reports the minority as drift against the majority', () => {
    const problems = problemsIn('ci.yml', prints({ a: 'h1', b: 'h1', c: 'other' }), [])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('c differ from the other 2')
  })

  it('accepts a documented exception', () => {
    // scrape-le legitimately differs; an undocumented one is a regression.
    expect(problemsIn('vitest.config.ts', prints({ a: 'h1', b: 'h1', c: 'x' }), ['c'])).toEqual([])
  })

  it('reports a file missing from a repo', () => {
    const problems = problemsIn('ci.yml', prints({ a: 'h1', b: null }), [])
    expect(problems.some(problem => problem.includes('missing in b'))).toBe(true)
  })

  it('covers the whole family and the files that must match', () => {
    expect(REPOS).toHaveLength(10)
    expect(SHARED.length).toBeGreaterThan(5)
  })
})

describe('check-openvsx-links', () => {
  it('extracts namespace and name from a link', () => {
    expect(refsIn('see https://open-vsx.org/extension/OffensiveEdge/paths-le now')).toEqual([
      'OffensiveEdge/paths-le',
    ])
  })

  it('stops at an HTML attribute delimiter', () => {
    // In built HTML the link is followed by a quote. Capturing it produced a
    // bogus "does not exist" for an extension that was perfectly fine.
    expect(refsIn('<a href="https://open-vsx.org/extension/OffensiveEdge/urls-le">')).toEqual([
      'OffensiveEdge/urls-le',
    ])
  })

  it('treats an error body as missing, even though the API returns 200', () => {
    // This is the whole reason the script exists: open-vsx.org answers 200 for
    // an extension that does not exist and renders the failure client-side.
    expect(isMissing({ error: 'not found' })).toBe(true)
    expect(isMissing({})).toBe(true)
    expect(isMissing({ version: '1.0.0' })).toBe(false)
  })

  it('finds links in markdown and built HTML, and ignores other files', () => {
    const root = fakeBuild({
      'README.md': 'https://open-vsx.org/extension/OffensiveEdge/a',
      'out/index.html': '<a href="https://open-vsx.org/extension/OffensiveEdge/b">',
      'notes.txt': 'https://open-vsx.org/extension/OffensiveEdge/ignored',
    })
    expect([...scan(root).keys()].sort()).toEqual(['OffensiveEdge/a', 'OffensiveEdge/b'])
  })

  it('reports misuse without a directory', async () => {
    await expect(linksMain(undefined, async () => ({}))).resolves.toBe(2)
  })

  it('passes when there is nothing to check', async () => {
    await expect(linksMain(fakeBuild({ 'a.txt': 'x' }), async () => ({}))).resolves.toBe(0)
  })

  it('fails on a dead link and passes on a live one', async () => {
    const root = fakeBuild({ 'README.md': 'https://open-vsx.org/extension/OffensiveEdge/a' })
    await expect(linksMain(root, async () => ({ error: 'gone' }))).resolves.toBe(1)
    await expect(linksMain(root, async () => ({ version: '2.2.3' }))).resolves.toBe(0)
  })
})

describe('sync-demos', () => {
  it('reads each tool repo beside this one and writes into public/demos', () => {
    expect(sourceFor('colors-le')).toContain('colors-le/src/assets/images/demo.gif')
    expect(destinationFor('colors-le')).toContain('public/demos/colors-le.gif')
  })

  it('encodes every demo with a per-clip palette at one width', () => {
    // Re-encoding against the global 256-colour palette bands badly on editor
    // screenshots, and a demo encoded differently from its neighbours shows.
    expect(FILTER).toContain('palettegen')
    expect(FILTER).toContain('paletteuse')
    expect(FILTER).toContain('scale=800')
  })

  it('passes ffmpeg the source, the filter and the destination', () => {
    const args = argsFor('/in.gif', '/out.gif')
    expect(args).toContain('/in.gif')
    expect(args).toContain('/out.gif')
    expect(args).toContain(FILTER)
    // Overwrite without prompting, or the script hangs waiting on stdin.
    expect(args[0]).toBe('-y')
  })
})

describe('the filesystem readers', () => {
  it('hashes each GIF it finds and ignores everything else', () => {
    const root = fakeBuild({ 'a.gif': 'one', 'b.gif': 'two', 'notes.txt': 'x' })
    const demos = readDemos(root)
    expect(demos.map(demo => demo.id).sort()).toEqual(['a', 'b'])
    expect(demos.find(demo => demo.id === 'a')?.sha1).toBe(sha1('one'))
  })

  it('reports the real demos as distinct, which is the live invariant', () => {
    // Not a fixture: this is `public/demos` as it ships.
    expect(demosMain()).toBe(0)
  })

  it('hashes a file that exists and returns null for one that does not', () => {
    const root = fakeBuild({ 'ci.yml': 'shared' })
    expect(hash(join(root, 'ci.yml'))).toBe(sha1('shared'))
    expect(hash(join(root, 'absent.yml'))).toBeNull()
  })

  it('fingerprints one file across every repo in the family', () => {
    const prints = fingerprint(join(scratch, 'no-fleet-here'), 'biome.json')
    expect(prints.size).toBe(REPOS.length)
    // Nothing on disk, so every repo reads as missing rather than throwing.
    expect([...prints.values()].every(digest => digest === null)).toBe(true)
  })
})

describe('the failure paths', () => {
  it('check-fleet reports every repo missing when nothing is checked out', () => {
    expect(fleetMain(join(scratch, 'no-fleet-here'))).toBe(1)
  })

  it('check-fleet passes when the fleet agrees', () => {
    const root = mkdtempSync(join(scratch, 'fleet-'))
    for (const repo of REPOS) {
      for (const file of [...SHARED, 'vitest.config.ts', 'tsconfig.json']) {
        const full = join(root, repo, file)
        mkdirSync(join(full, '..'), { recursive: true })
        writeFileSync(full, `shared ${file}`)
      }
    }
    expect(fleetMain(root)).toBe(0)
  })

  it('check-routes fails on a page the registry does not claim', () => {
    const files: Record<string, string> = { 'index.html': 'home', 'stray.html': 'x' }
    for (const tool of TOOLS) files[`tools/${tool.id}.html`] = 'x'
    expect(routesMain(fakeBuild(files))).toBe(1)
  })

  it('check-demos fails when public/demos is wrong', () => {
    // Points the reader at a directory holding two identical demos.
    const root = fakeBuild({ 'colors-le.gif': 'same', 'dates-le.gif': 'same' })
    expect(demosMain(root)).toBe(1)
  })
})

describe('sync-registry', () => {
  it('counts translated bundles and excludes the English source', () => {
    // `bundle.l10n.json` is the source, not a translation. Counting it gave 13
    // where the tools ship 12, which is the sort of off-by-one that reaches
    // copy and stays there.
    const repo = fakeBuild({
      'package.json': JSON.stringify({
        version: '2.2.3',
        contributes: {
          commands: [
            { command: 'x-le.run', title: '%manifest.command.run.title%' },
            { command: 'x-le.other', title: 'Already English' },
          ],
        },
      }),
      'package.nls.json': JSON.stringify({ 'manifest.command.run.title': 'Run It' }),
      'mcp/package.json': JSON.stringify({ name: 'x-le-mcp' }),
      'zed/extension.toml': 'id = "x-le"\nname = "X-LE"\n',
      'l10n/bundle.l10n.json': '{}',
      'l10n/bundle.l10n.de.json': '{}',
      'l10n/bundle.l10n.pt-br.json': '{}',
    })
    const facts = repoFacts(repo)
    expect(facts).toEqual({
      version: '2.2.3',
      commands: [
        // Resolved through package.nls.json; the raw manifest title is a
        // placeholder and rendering it would print `%manifest.…%` on the page.
        { id: 'x-le.run', title: 'Run It' },
        { id: 'x-le.other', title: 'Already English' },
      ],
      locales: 2,
      mcpPackage: 'x-le-mcp',
      zedId: 'x-le',
    })
  })

  it('handles a command with no title, and one whose key is not in the catalog', () => {
    // A missing NLS key must fall back to the raw title rather than render
    // `undefined`; a command with no title at all must not crash the sync.
    const repo = fakeBuild({
      'package.json': JSON.stringify({
        version: '1.0.0',
        contributes: {
          commands: [
            { command: 'q-le.untitled' },
            { command: 'q-le.orphan', title: '%manifest.command.missing.title%' },
          ],
        },
      }),
      'package.nls.json': '{}',
      'mcp/package.json': JSON.stringify({ name: 'q-le-mcp' }),
      'zed/extension.toml': 'id = "q-le"\n',
      'l10n/bundle.l10n.json': '{}',
    })
    expect(repoFacts(repo).commands).toEqual([
      { id: 'q-le.untitled', title: '' },
      { id: 'q-le.orphan', title: '%manifest.command.missing.title%' },
    ])
  })

  it('treats a manifest with no commands as zero, not a crash', () => {
    const repo = fakeBuild({
      'package.json': JSON.stringify({ version: '1.0.0' }),
      'package.nls.json': '{}',
      'mcp/package.json': JSON.stringify({ name: 'y-le-mcp' }),
      'zed/extension.toml': 'id = "y-le"\n',
      'l10n/bundle.l10n.json': '{}',
    })
    expect(repoFacts(repo).commands).toEqual([])
    expect(repoFacts(repo).locales).toBe(0)
  })

  it('refuses a Zed manifest with no id rather than emitting undefined', () => {
    const repo = fakeBuild({
      'package.json': JSON.stringify({ version: '1.0.0' }),
      'package.nls.json': '{}',
      'mcp/package.json': JSON.stringify({ name: 'z-le-mcp' }),
      'zed/extension.toml': 'name = "Z-LE"\n',
      'l10n/bundle.l10n.json': '{}',
    })
    expect(() => repoFacts(repo)).toThrow(/no id/)
  })

  it('renders a file that declares its own provenance', () => {
    const rendered = render(
      new Map([
        [
          'a-le',
          {
            version: '1.2.3',
            commands: [{ id: 'a-le.run', title: 'Run' }],
            locales: 12,
            mcpPackage: 'a-le-mcp',
            zedId: 'a-le',
          },
        ],
      ]),
    )
    expect(rendered).toContain('do not edit')
    expect(rendered).toContain("version: '1.2.3'")
    expect(rendered).toContain('"id":"a-le.run","title":"Run"')
    expect(rendered).toContain('Object.freeze')
  })
})

describe('the derived registry facts', () => {
  it('gives every tool in the registry a generated entry', () => {
    for (const tool of TOOLS) {
      expect(() => factsFor(tool), tool.id).not.toThrow()
    }
  })

  it('skips rather than fails when the fleet is not checked out', () => {
    // CI and a Vercel build have no sibling repos. Refusing there would fail
    // every build for a condition that is normal off a dev machine.
    expect(registryMain(true, join(scratch, 'no-fleet'))).toBe(0)
  })

  it('reports misuse when asked to write without the fleet', () => {
    expect(registryMain(false, join(scratch, 'no-fleet'))).toBe(2)
  })

  it('writes the generated file when asked to sync', () => {
    const output = join(mkdtempSync(join(scratch, 'gen-')), 'facts.ts')
    expect(registryMain(false, resolve('..'), output)).toBe(0)
    expect(readFileSync(output, 'utf8')).toContain('do not edit')
  })

  it('fails the check when the committed file is stale', () => {
    const output = join(mkdtempSync(join(scratch, 'stale-')), 'facts.ts')
    writeFileSync(output, '// not what the repos say\n')
    expect(registryMain(true, resolve('..'), output)).toBe(1)
  })

  it('agrees with the committed generated file', () => {
    // The gate that catches a hand-edit of the generated file, or a repo that
    // moved on without a re-sync.
    expect(registryMain(true)).toBe(0)
  })

  it('exposes one locale count for the whole family', () => {
    expect(LOCALE_COUNT).toBeGreaterThan(0)
    for (const tool of TOOLS) expect(factsFor(tool).locales).toBe(LOCALE_COUNT)
  })
})
