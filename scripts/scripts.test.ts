import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { ASSET_HASHES, ICONS } from '../lib/asset-hashes.generated'
import { crateFor, extensionPending, factsFor, LOCALE_COUNT, TOOLS } from '../lib/tools'
import { BUDGETS, main as budgetMain, kb, walk } from './check-budget'
import { main as cratesMain, publishedVersion, verdictFor } from './check-crates'
import { type Demo, main as demosMain, problemsWith, readDemos, sha1 } from './check-demos'
import {
  resolves as docPathResolves,
  main as docPathsMain,
  looksLikePath,
  pathsIn,
  target,
} from './check-doc-paths'
import {
  ALL_SHARED,
  CRATE_ONLY_SHARED,
  EXTENSION_PENDING,
  fingerprint,
  main as fleetMain,
  hash,
  normalize,
  problemsIn,
  REPOS,
  SHARED,
  SHARED_WITH_EXCEPTIONS,
} from './check-fleet'
import { isMissing, main as linksMain, refsIn, scan } from './check-openvsx-links'
import { claimsIn, main as claimsMain } from './check-publication-claims'
import { manifestVersions, pinsIn, main as pinsMain } from './check-quoted-versions'
import { missingFrom, main as pillarsMain } from './check-readme-pillars'
import { expectedPaths, orphans, resolves, main as routesMain } from './check-routes'
import { argsFor, destinationFor, FILTER, renderHashes, sourceFor } from './sync-demos'
import { main as readmesMain, regenerate, summarise } from './sync-readmes'
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

  it("writes the repo's own name out before comparing", () => {
    // release.yml names the package it publishes, so ten copies of one file
    // legitimately hold ten different strings. Comparing the shape is the
    // only way that file can be checked at all.
    expect(normalize('publish colors-le-mcp', 'colors-le')).toBe('publish <tool>-mcp')
    expect(normalize('publish urls-le-mcp', 'urls-le')).toBe('publish <tool>-mcp')
    expect(normalize('publish urls-le-mcp', 'colors-le')).toBe('publish urls-le-mcp')
  })

  it('accounts for every tool the site lists, once', () => {
    // The shared files belong to the TypeScript extension, so a repo that is
    // still only a crate has none of them and is deliberately not compared.
    // Pinning the two lists against the registry is what stops that becoming
    // a tool nobody checks: it has to be in exactly one of them.
    const covered = [...REPOS, ...EXTENSION_PENDING].sort()
    expect(covered).toEqual(TOOLS.map(tool => tool.id).sort())
    expect(new Set(covered).size).toBe(covered.length)
    expect(SHARED.length).toBeGreaterThan(5)
  })

  it('leaves a repo out of the comparison only while its extension is unwritten', () => {
    for (const id of EXTENSION_PENDING) {
      const tool = TOOLS.find(current => current.id === id)
      expect(tool, `${id} is not in the registry`).toBeDefined()
      if (tool === undefined) continue
      expect(extensionPending(tool), `${id} has an extension and belongs in REPOS`).toBe(true)
    }
  })
})

describe('check-doc-paths', () => {
  it('takes a real reference and rejects prose that only looks like one', () => {
    expect(looksLikePath('fixtures/mcp-detect-secrets.json')).toBe(true)
    expect(looksLikePath('crate/src/detect/mod.rs')).toBe(true)
    // Prose, schemes, placeholders and absolute paths are not references here.
    expect(looksLikePath('if/else')).toBe(false)
    expect(looksLikePath('America/New_York')).toBe(false)
    expect(looksLikePath('postgres://10.0.0.5:5432/app')).toBe(false)
    expect(looksLikePath('~/dev/rust/pixelcoords-site/AGENTS.md')).toBe(false)
    expect(looksLikePath('/robots.txt')).toBe(false)
    expect(looksLikePath('.js/.cjs/.mjs/.ts')).toBe(false)
    expect(looksLikePath('@heroui/react')).toBe(false)
  })

  it('checks a glob by its directory', () => {
    // `l10n/bundle.l10n.*.json` names a set that exists. Checking the literal
    // string reports every wildcard in the fleet; checking the directory still
    // catches a wrong directory in a copied paragraph.
    expect(target('l10n/bundle.l10n.*.json')).toBe('l10n')
    expect(target('crate/src/detect/mod.rs')).toBe('crate/src/detect/mod.rs')
  })

  it('reads backticked references and ignores the rest of the prose', () => {
    const found = pathsIn('see `crate/src/detect/mod.rs` and `if/else`, plus plain text')
    expect(found).toEqual(['crate/src/detect/mod.rs'])
  })

  it('does not accept a sibling repo as the home of a reference', () => {
    // The defect this exists for: secrets-le named paths-le's contract
    // fixture. A "does any repo have this?" fallback was tried and passed the
    // exact case, because paths-le really does have the file.
    const root = mkdtempSync(join(scratch, 'docpaths-'))
    mkdirSync(join(root, 'paths-le/crate/fixtures'), { recursive: true })
    writeFileSync(join(root, 'paths-le/crate/fixtures/mcp-extract-paths.json'), '{}')
    mkdirSync(join(root, 'secrets-le/crate'), { recursive: true })
    expect(
      docPathResolves(
        'fixtures/mcp-extract-paths.json',
        root,
        'secrets-le',
        join(root, 'secrets-le/crate'),
      ),
    ).toBe(false)
    expect(
      docPathResolves(
        'fixtures/mcp-extract-paths.json',
        root,
        'paths-le',
        join(root, 'paths-le/crate'),
      ),
    ).toBe(true)
  })

  it('reports every repo missing when nothing is checked out', () => {
    expect(docPathsMain(join(scratch, 'no-fleet-here'))).toBe(1)
  })

  const fakeDocs = (doc: string, extra?: string) => {
    const root = mkdtempSync(join(scratch, 'docs-'))
    mkdirSync(join(root, 'demo-le'), { recursive: true })
    writeFileSync(join(root, 'demo-le', 'AGENTS.md'), doc)
    if (extra !== undefined) {
      const full = join(root, 'demo-le', extra)
      mkdirSync(join(full, '..'), { recursive: true })
      writeFileSync(full, 'x')
    }
    return root
  }

  it('fails on a reference to a file that is not there', () => {
    expect(docPathsMain(fakeDocs('see `crate/fixtures/nope.json`'))).toBe(1)
  })

  it('passes when the reference resolves', () => {
    expect(docPathsMain(fakeDocs('see `notes/real.md`', 'notes/real.md'))).toBe(0)
  })

  it('reports misuse when the directory holds no tool repos', () => {
    expect(docPathsMain(mkdtempSync(join(scratch, 'empty-')))).toBe(1)
  })
})

describe('sync-readmes', () => {
  it('reports a repo that is not checked out rather than passing over it', () => {
    const outcome = regenerate(join(scratch, 'not-here'))
    expect(outcome.ok).toBe(false)
    expect(outcome.detail).toBe('not checked out')
  })

  it('surfaces the actionable last line when a regeneration fails', () => {
    const dir = mkdtempSync(join(scratch, 'sync-fail-'))
    const outcome = regenerate(dir, () => ({
      status: 1,
      stderr: 'a wall of test output\n\ncoverage/test-results.json not found\n\n',
    }))
    expect(outcome.ok).toBe(false)
    expect(outcome.detail).toBe('coverage/test-results.json not found')
  })

  it('runs every repo and fails the run when one of them does', () => {
    // Injected rather than spawned: the point is the reporting, and a real
    // regeneration here would run ten coverage suites.
    expect(readmesMain(join(scratch, 'nowhere'), () => ({ status: 0, stderr: '' }))).toBe(1)
  })

  it('fails the run when any repo failed', () => {
    // A regeneration that reported success over a repo it never wrote is the
    // failure this whole family is built against.
    expect(summarise([{ repo: 'a', ok: true, detail: 'regenerated' }])).toBe(0)
    expect(
      summarise([
        { repo: 'a', ok: true, detail: 'regenerated' },
        { repo: 'b', ok: false, detail: 'exit 1' },
      ]),
    ).toBe(1)
  })
})

describe('check-publication-claims', () => {
  it('catches a doc telling readers a live crate is not installable', () => {
    const found = claimsIn('unicode-le', 'README.md', '## Install\n\n**Not on crates.io yet.**\n')
    expect(found).toHaveLength(1)
    expect(found[0]?.line).toBe(3)
  })

  it('ignores a general statement about publishing order', () => {
    // Every extension repo's release notes say "a merged extension pointing at
    // an unpublished version is broken for everyone who installs it". That is
    // npm ordering advice, not a claim about this crate — and a bare
    // /unpublished/ matched it in ten repos on the first run.
    const generic =
      'npm must be published before any Zed PR merges — a merged extension ' +
      'pointing at an unpublished version is broken for everyone.'
    expect(claimsIn('colors-le', 'AGENTS.md', generic)).toEqual([])
  })

  it('reads an assertion about this crate, in either phrasing', () => {
    expect(claimsIn('a', 'README.md', '0.1.0 is unpublished')).toHaveLength(1)
    expect(claimsIn('a', 'AGENTS.md', '**Status: v0.1.0, unpublished.**')).toHaveLength(1)
    expect(claimsIn('a', 'README.md', 'cargo install a  # once published')).toHaveLength(1)
  })

  const fakeRepo = (claim: string) => {
    const root = mkdtempSync(join(scratch, 'pubclaims-'))
    const crate = join(root, 'demo-le', 'crate')
    mkdirSync(crate, { recursive: true })
    writeFileSync(join(crate, 'Cargo.toml'), 'name = "demo-le"')
    writeFileSync(join(root, 'demo-le', 'README.md'), claim)
    return root
  }

  it('fails when a live crate is called unpublished', async () => {
    const root = fakeRepo('## Install\n\n**Not on crates.io yet.**\n')
    expect(await claimsMain(root, async () => '0.1.0')).toBe(1)
  })

  it('passes when the docs match the registry', async () => {
    const root = fakeRepo('## Install\n\n`cargo install demo-le`\n')
    expect(await claimsMain(root, async () => '0.1.0')).toBe(0)
  })

  it('says nothing about a crate that really is unpublished', async () => {
    // The claim is true here, and an unreachable registry looks the same. An
    // outage must not turn an accurate doc into a failure.
    const root = fakeRepo('## Install\n\n**Not on crates.io yet.**\n')
    expect(await claimsMain(root, async () => undefined)).toBe(0)
  })

  it('reports misuse when the root does not exist', async () => {
    expect(await claimsMain(join(scratch, 'no-fleet-here'), async () => '0.1.0')).toBe(1)
  })

  it('reads a claim that wraps across two lines', () => {
    // These documents hard-wrap near 72 characters, so the claim that shipped
    // in four repositories was split — "once it is published; until" on one
    // line and "then it builds from `crate/`" on the next. A per-line scan saw
    // two innocent halves and this gate reported green over five live claims.
    const wrapped =
      'Install it with `cargo install colors-le` once it is published; until\n' +
      'then it builds from `crate/`. The spec lives beside it.\n'
    const found = claimsIn('colors-le', 'README.md', wrapped)
    expect(found).toHaveLength(1)
    expect(found[0]?.line).toBe(1)
  })

  it('catches the hedge on an install row', () => {
    expect(
      claimsIn(
        'string-le',
        'crate/README.md',
        '| `cargo install string-le` | *(publishing shortly)* |',
      ),
    ).toHaveLength(1)
  })

  it('does not run a bounded pattern past the line it was written for', () => {
    // Flattening the newlines is what lets a wrapped claim match. It also
    // turns any unbounded `[^\n]*` into "the rest of the file" — which fired
    // on an ASCII architecture diagram the first time this was written.
    const diagram =
      'statusBar -> registerCommands()\ncommands/  one file per command\n' +
      'extraction/  dispatcher\nui/  notifier, statusBar\n'
    expect(claimsIn('numbers-le', 'AGENTS.md', diagram)).toEqual([])
  })
})

describe('check-quoted-versions', () => {
  it('reads an exact pin of a package this repo publishes', () => {
    const found = pinsIn('README.md', 'pin it — `colors-le-mcp@2.2.1`.', ['colors-le-mcp'])
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ pkg: 'colors-le-mcp', quoted: '2.2.1', line: 1 })
  })

  it('ignores anything that is not one of this repo own packages', () => {
    // `actions/checkout@v4` and an email address are both @-shaped and neither
    // is a claim about this repository's release.
    expect(pinsIn('ci.yml', 'uses: actions/checkout@4.1.1', ['colors-le'])).toEqual([])
  })

  it('ignores a range, which says nothing that can rot', () => {
    expect(pinsIn('README.md', 'colors-le-mcp@^2.2', ['colors-le-mcp'])).toEqual([])
  })

  const fakeRepo = (readme: string, version: string) => {
    const root = mkdtempSync(join(scratch, 'pins-'))
    const repo = join(root, 'demo-le')
    mkdirSync(join(repo, 'mcp'), { recursive: true })
    writeFileSync(join(repo, 'package.json'), JSON.stringify({ name: 'demo-le', version }))
    writeFileSync(join(repo, 'mcp/package.json'), JSON.stringify({ name: 'demo-le-mcp', version }))
    writeFileSync(join(repo, 'README.md'), readme)
    return root
  }

  it('fails on a pin the manifest disagrees with', async () => {
    expect(await pinsMain(fakeRepo('use `demo-le-mcp@1.0.0`', '2.0.0'))).toBe(1)
  })

  it('passes when the pin matches', async () => {
    expect(await pinsMain(fakeRepo('use `demo-le-mcp@2.0.0`', '2.0.0'))).toBe(0)
  })

  it('reports misuse when the root does not exist', async () => {
    expect(await pinsMain(join(scratch, 'no-fleet-here'))).toBe(1)
  })

  it('reads the crate version too, and skips a repo with no manifest at all', () => {
    const root = mkdtempSync(join(scratch, 'pins-'))
    const repo = join(root, 'demo-le')
    mkdirSync(join(repo, 'crate'), { recursive: true })
    writeFileSync(
      join(repo, 'crate/Cargo.toml'),
      '[package]\nname = "demo-le"\nversion = "0.4.2"\n',
    )
    expect(manifestVersions(root, 'demo-le').get('demo-le')).toBe('0.4.2')
    expect(manifestVersions(root, 'absent-le').size).toBe(0)
  })

  it('passes a tree with no pins in it', async () => {
    const root = mkdtempSync(join(scratch, 'pins-'))
    const repo = join(root, 'demo-le')
    mkdirSync(repo, { recursive: true })
    writeFileSync(join(repo, 'package.json'), JSON.stringify({ name: 'demo-le', version: '1.0.0' }))
    writeFileSync(join(repo, 'README.md'), 'no versions written down here')
    expect(await pinsMain(root)).toBe(0)
  })
})

describe('check-readme-pillars', () => {
  const full = [
    '# tool',
    '## What it does',
    '## Install',
    '## Options',
    '## Documentation',
    '## More from the LE family',
    '## License',
  ].join('\n\n')

  it('passes a README carrying all five', () => {
    expect(missingFrom(full)).toEqual([])
  })

  it('names the pillar a README is missing', () => {
    const missing = missingFrom(full.replace('## Install\n\n', ''))
    expect(missing).toHaveLength(1)
    expect(missing[0]?.what).toBe('how to install it')
  })

  it('accepts any of the headings a pillar allows', () => {
    // The extension repos answer the flag question with Commands and
    // Settings; the crates answer it with Options. Both are the same pillar.
    expect(missingFrom(full.replace('## Options', '## Commands'))).toEqual([])
    expect(missingFrom(full.replace('## Options', '## Settings'))).toEqual([])
  })

  it('leaves the middle of a README alone', () => {
    // Every tool's differentiator is its own — a check that flattened those
    // would be a tax on writing the next one.
    const opinionated = `${full}\n\n## It refuses rather than guesses\n\n## Four dimensions`
    expect(missingFrom(opinionated)).toEqual([])
  })

  it('reports misuse when the root does not exist', () => {
    expect(pillarsMain(join(scratch, 'no-fleet-here'))).toBe(1)
  })

  it('skips a README that is not checked out rather than failing on it', () => {
    // The crate-only six have no `src/`, and a partial checkout has no repo at
    // all. Absent is not the same as missing a pillar.
    const root = mkdtempSync(join(scratch, 'pillars-'))
    expect(pillarsMain(root)).toBe(0)
  })

  it('fails a repo whose README is short a pillar', () => {
    const root = mkdtempSync(join(scratch, 'pillars-'))
    mkdirSync(join(root, 'colors-le'), { recursive: true })
    writeFileSync(join(root, 'colors-le', 'README.md'), '# colors-le\n\n## Install\n')
    expect(pillarsMain(root)).toBe(1)
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

  it('stops at a backslash-escaped quote in a serialized payload', () => {
    // The same URL appears twice in a built page: once in an href ending at a
    // plain quote, and once inside a JS string in the framework's payload
    // where the quote is escaped. Capturing the backslash reported six of ten
    // links dead while every one resolved.
    expect(
      refsIn(String.raw`{"href":"https://open-vsx.org/extension/OffensiveEdge/colors-le\",`),
    ).toEqual(['OffensiveEdge/colors-le'])
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

  it('emits the file exactly as it is committed', () => {
    // The renderer and the committed file are two copies of one shape, and
    // they drifted: the renderer emitted its own indentation, biome formatted
    // the file to another, and every sync left a lint error behind correct
    // output. Byte equality is what stops either side moving alone — if this
    // fails, `sync:demos` and `lint` now disagree again.
    const rendered = renderHashes(new Map(Object.entries(ASSET_HASHES)), ICONS)
    const committed = join(import.meta.dirname, '../lib/asset-hashes.generated.ts')
    expect(rendered).toBe(readFileSync(committed, 'utf8'))
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
    expect(hash(join(root, 'ci.yml'), 'colors-le')).toBe(sha1('shared'))
    expect(hash(join(root, 'absent.yml'), 'colors-le')).toBeNull()
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
    // Derived from the lists rather than named here. Spelling the files out
    // meant adding one to SHARED made this test fail as "missing everywhere",
    // which reads as a broken check rather than an out-of-date fixture.
    const plant = (repos: readonly string[], files: readonly string[]) => {
      for (const repo of repos) {
        for (const file of files) {
          const full = join(root, repo, file)
          mkdirSync(join(full, '..'), { recursive: true })
          writeFileSync(full, `shared ${file}`)
        }
      }
    }
    plant(REPOS, [...SHARED, ...Object.keys(SHARED_WITH_EXCEPTIONS)])
    // The crate-only repos share a different set with each other, and are not
    // compared against the ten — a Rust codeql config and a TypeScript one are
    // not the same document.
    plant(EXTENSION_PENDING, CRATE_ONLY_SHARED)
    // And a third set belongs to every repo in the family.
    plant([...REPOS, ...EXTENSION_PENDING], ALL_SHARED)
    expect(fleetMain(root)).toBe(0)
  })

  it('catches a file that differs between the two generations', () => {
    // The gap that let one rule be implemented twice — a vitest file in the
    // ten, a Python heredoc in the six — and diverge unnoticed: each group was
    // internally consistent, and nothing compared them to each other.
    const root = mkdtempSync(join(scratch, 'all-shared-'))
    const write = (repo: string, file: string, content: string) => {
      const full = join(root, repo, file)
      mkdirSync(join(full, '..'), { recursive: true })
      writeFileSync(full, content)
    }
    for (const repo of REPOS) {
      for (const file of [...SHARED, ...Object.keys(SHARED_WITH_EXCEPTIONS)]) {
        write(repo, file, `shared ${file}`)
      }
      for (const file of ALL_SHARED) write(repo, file, `shared ${file}`)
    }
    for (const repo of EXTENSION_PENDING) {
      for (const file of CRATE_ONLY_SHARED) write(repo, file, `shared ${file}`)
      // Internally consistent across the six, and different from the ten.
      for (const file of ALL_SHARED) write(repo, file, 'the other generation')
    }
    expect(fleetMain(root)).toBe(1)
  })

  it('check-fleet catches drift among the crate-only repos', () => {
    // The gap that let two of them assert opposite things about this very
    // list: uncompared, both claims survived because neither was checkable.
    const root = mkdtempSync(join(scratch, 'crate-fleet-'))
    for (const repo of REPOS) {
      for (const file of [...SHARED, ...Object.keys(SHARED_WITH_EXCEPTIONS)]) {
        const full = join(root, repo, file)
        mkdirSync(join(full, '..'), { recursive: true })
        writeFileSync(full, `shared ${file}`)
      }
    }
    for (const [index, repo] of EXTENSION_PENDING.entries()) {
      for (const file of CRATE_ONLY_SHARED) {
        const full = join(root, repo, file)
        mkdirSync(join(full, '..'), { recursive: true })
        writeFileSync(full, index === 0 ? 'drifted' : `shared ${file}`)
      }
    }
    expect(fleetMain(root)).toBe(1)
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

  it('reads a repo that holds only a crate, rather than refusing it', () => {
    // The newest tools land the crate first, so for a while the repo has no
    // manifest, no l10n/, no mcp/ and no zed/. Every one of those used to be
    // read unconditionally, and each threw.
    const repo = fakeBuild({
      'crate/Cargo.toml': 'name = "c-le"\nversion = "0.1.0"\n',
    })
    expect(repoFacts(repo)).toEqual({ commands: [], crate: { name: 'c-le', version: '0.1.0' } })
  })

  it('emits an absent fact as an absent field, never as a placeholder', () => {
    const rendered = render(new Map([['c-le', { commands: [] }]]))
    expect(rendered).toContain("'c-le': { commands: [] },")
    expect(rendered).not.toContain('undefined')
    expect(rendered).not.toContain("version: ''")
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

  /**
   * A stand-in fleet. These used to point at `..`, which passes on a dev
   * machine and fails everywhere else — the Vercel build has no sibling
   * checkouts, so the tests asserted the skip path while claiming to assert
   * the real one.
   */
  function fakeFleet(): string {
    const root = mkdtempSync(join(scratch, 'fleet-repos-'))
    for (const tool of TOOLS) {
      const files: Record<string, string> = {
        'package.json': JSON.stringify({
          version: '9.9.9',
          contributes: { commands: [{ command: `${tool.id}.run`, title: 'Run' }] },
        }),
        'package.nls.json': '{}',
        'mcp/package.json': JSON.stringify({ name: `${tool.id}-mcp` }),
        'zed/extension.toml': `id = "${tool.id}"\n`,
        'l10n/bundle.l10n.json': '{}',
        'l10n/bundle.l10n.de.json': '{}',
      }
      for (const [relative, content] of Object.entries(files)) {
        const full = join(root, tool.id, relative)
        mkdirSync(join(full, '..'), { recursive: true })
        writeFileSync(full, content)
      }
    }
    return root
  }

  it('writes the generated file when asked to sync', () => {
    const output = join(mkdtempSync(join(scratch, 'gen-')), 'facts.ts')
    expect(registryMain(false, fakeFleet(), output)).toBe(0)
    const written = readFileSync(output, 'utf8')
    expect(written).toContain('do not edit')
    expect(written).toContain("version: '9.9.9'")
  })

  it('fails the check when the committed file is stale', () => {
    const output = join(mkdtempSync(join(scratch, 'stale-')), 'facts.ts')
    writeFileSync(output, '// not what the repos say\n')
    expect(registryMain(true, fakeFleet(), output)).toBe(1)
  })

  it('passes the check when the file matches the repos', () => {
    // Sync, then check the very file that sync produced. This covers the
    // matching path without needing the real repos on disk — the version that
    // did depend on them left this branch uncovered wherever they are absent,
    // which is every build image.
    const fleet = fakeFleet()
    const output = join(mkdtempSync(join(scratch, 'match-')), 'facts.ts')
    expect(registryMain(false, fleet, output)).toBe(0)
    expect(registryMain(true, fleet, output)).toBe(0)
  })

  it('agrees with the committed generated file', () => {
    // The gate that catches a hand-edit of the generated file, or a repo that
    // moved on without a re-sync.
    expect(registryMain(true)).toBe(0)
  })

  it('exposes one locale count across every shipped extension', () => {
    expect(LOCALE_COUNT).toBeGreaterThan(0)
    for (const tool of TOOLS) {
      // A tool whose extension is unwritten has no l10n/ to count. Reading it
      // as a zero would break the invariant and put "0 languages" on the page.
      expect(factsFor(tool).locales, tool.id).toBe(
        extensionPending(tool) ? undefined : LOCALE_COUNT,
      )
    }
  })
})

describe('check-crates', () => {
  it('fails when the site links a crate that is not published', () => {
    // The one visitor most likely to click this is a Rust user, and a 404
    // reads as a broken tool.
    const verdict = verdictFor('scrape-le', true, {})
    expect(verdict.level).toBe('fail')
    expect(verdict.message).toContain('not published')
  })

  it('reports, without failing, when the publish landed and the flag did not', () => {
    const verdict = verdictFor('scrape-le', false, { version: '0.1.0' })
    expect(verdict.level).toBe('note')
    expect(verdict.message).toContain('cratePublished')
  })

  it('is content either way when the claim matches the registry', () => {
    expect(verdictFor('scrape-le', true, { version: '0.1.0' }).level).toBe('ok')
    expect(verdictFor('scrape-le', false, {}).level).toBe('ok')
  })

  it('does not fail a build because crates.io is down', () => {
    // An outage says nothing about whether the claim is honest.
    expect(verdictFor('scrape-le', true, { error: 'crates.io unreachable' }).level).toBe('note')
  })

  it('passes when every claim matches, using a stubbed registry', async () => {
    // scrape-le is published, so a registry that reports it is the match.
    await expect(cratesMain(async () => ({ version: '0.1.0' }))).resolves.toBe(0)
  })

  it('exits non-zero when the site links a crate the registry does not have', async () => {
    // scrape-le claims unpublished today, so force the opposite: this is the
    // run that must stop a dead crates.io link from ever shipping.
    const claiming = TOOLS.map(tool =>
      crateFor(tool) === undefined ? tool : { ...tool, cratePublished: true },
    )
    await expect(cratesMain(async () => ({}), claiming)).resolves.toBe(1)
  })

  it('says so when no tool ships a crate, rather than passing silently', async () => {
    await expect(cratesMain(async () => ({}), [])).resolves.toBe(0)
  })

  it('reads the published version from crates.io', async () => {
    const stub = vi.fn(
      async () =>
        new Response(JSON.stringify({ crate: { max_stable_version: '0.1.0' } })) as Response,
    )
    vi.stubGlobal('fetch', stub)
    await expect(publishedVersion('scrape-le')).resolves.toEqual({ version: '0.1.0' })
    vi.unstubAllGlobals()
  })

  it('treats an absent crate as unpublished, not an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ errors: [] }), { status: 404 })),
    )
    await expect(publishedVersion('nope-le')).resolves.toEqual({})
    vi.unstubAllGlobals()
  })

  it('reports a bad status and an unreachable host as errors, not absence', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 })),
    )
    expect((await publishedVersion('scrape-le')).error).toContain('503')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('offline'))),
    )
    expect((await publishedVersion('scrape-le')).error).toContain('unreachable')
    vi.unstubAllGlobals()
  })
})
