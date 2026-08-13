import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Every major assistant looks for its own instruction file, so the repository
 * carries one for each — and they must stay the same document. The rule they
 * all restate is that they are thin pointers to AGENTS.md and must never grow
 * a second copy of the standard; the way that rule actually breaks is someone
 * editing one file and not the others.
 *
 * The `*-le` family keeps its shared configs identical by hand and says so in
 * its docs. This is the same invariant with a gate instead of a convention.
 *
 * What is compared is the document, not the bytes. A mirror that sits in a
 * subdirectory has to reach AGENTS.md from where it actually is, so its
 * relative links carry a `../` per level. Demanding raw equality is what made
 * both nested mirrors here link to a file that does not exist beside them —
 * the gate held two broken links in place for as long as it existed.
 */

const CANONICAL = '.cursorrules'

/** Each mirror, and how many directories below the repo root it sits. */
const MIRRORS = [
  { path: '.windsurfrules', depth: 0 },
  { path: '.clinerules', depth: 0 },
  { path: 'GEMINI.md', depth: 0 },
  { path: '.cursor/rules/project.mdc', depth: 2 },
  { path: '.github/copilot-instructions.md', depth: 1 },
] as const

/** The document with its relative links written back to root-relative form. */
function atRoot(source: string, depth: number): string {
  if (depth === 0) return source
  return source.split(`](${'../'.repeat(depth)}`).join('](')
}

/** Relative link targets in a file, ignoring URLs and bare anchors. */
function linksIn(source: string): string[] {
  return [...source.matchAll(/\]\(([^)]+)\)/g)]
    .map(match => match[1] ?? '')
    .filter(target => !/^(https?:|#|\/)/.test(target))
}

describe('agent instruction files', () => {
  const canonical = readFileSync(CANONICAL, 'utf8')

  it.each(MIRRORS)('$path is the same document as the canonical file', mirror => {
    const source = readFileSync(mirror.path, 'utf8')
    expect(atRoot(source, mirror.depth), `${mirror.path} has drifted from ${CANONICAL}`).toBe(
      canonical,
    )
  })

  it.each([{ path: CANONICAL, depth: 0 }, ...MIRRORS])(
    '$path reaches every file it links to',
    file => {
      // The half byte-equality cannot see: a mirror can match the canonical
      // file exactly and still point at nothing, which is the defect this
      // replaces. Targets resolve from the file's own directory, which is the
      // only place a reader — or a link in GitHub's UI — resolves them from.
      const here = dirname(file.path)
      for (const target of linksIn(readFileSync(file.path, 'utf8'))) {
        expect(
          existsSync(join(here, target)),
          `${file.path} links ${target}, which is not there`,
        ).toBe(true)
      }
    },
  )

  it('routes to AGENTS.md rather than restating the standard', () => {
    expect(canonical).toContain('AGENTS.md')
    // A backstop against the router growing into a second copy of the
    // standard, not a target. One number across all sixteen tool repos and
    // this one: it used to be 40 here, 50 in the extension repos and nothing
    // in the six crate-only ones, four of which had grown past 50 unnoticed.
    expect(canonical.split('\n').length).toBeLessThan(70)
  })

  it('names the verification command that actually exists', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<
      string,
      string
    >
    const named = canonical.match(/bun run [a-z0-9:]+/g) ?? []
    expect(named.length).toBeGreaterThan(0)
    for (const command of named) {
      expect(scripts, `${command} is referenced but not defined`).toHaveProperty(
        command.replace('bun run ', ''),
      )
    }
  })
})
