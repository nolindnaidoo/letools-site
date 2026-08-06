import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Every major assistant looks for its own instruction file, so the repository
 * carries one for each — and they must stay byte-identical. The rule they all
 * restate is that they are thin pointers to AGENTS.md and must never grow a
 * second copy of the standard; the way that rule actually breaks is someone
 * editing one file and not the other five.
 *
 * The `*-le` family keeps its shared configs identical by hand and says so in
 * its docs. This is the same invariant with a gate instead of a convention.
 */

const CANONICAL = '.cursorrules'

const MIRRORS = [
  '.windsurfrules',
  '.clinerules',
  'GEMINI.md',
  '.cursor/rules/project.mdc',
  '.github/copilot-instructions.md',
] as const

describe('agent instruction files', () => {
  const canonical = readFileSync(CANONICAL, 'utf8')

  it.each(MIRRORS)('%s is identical to the canonical file', mirror => {
    expect(readFileSync(mirror, 'utf8'), `${mirror} has drifted from ${CANONICAL}`).toBe(canonical)
  })

  it('routes to AGENTS.md rather than restating the standard', () => {
    expect(canonical).toContain('AGENTS.md')
    // A pointer that grows past a screen has stopped being a pointer.
    expect(canonical.split('\n').length).toBeLessThan(40)
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
