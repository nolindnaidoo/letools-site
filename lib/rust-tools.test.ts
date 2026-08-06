import { describe, expect, it } from 'vitest'
import { RUST_TOOLS } from './rust-tools'

/**
 * The two Rust desktop tools, cross-linked with their own sites. Those sites
 * link back here, so a broken entry costs a backlink in both directions.
 * Taglines are each site's own, verbatim — never embellished here.
 */
describe('RUST_TOOLS', () => {
  it('lists both halves of the loop', () => {
    expect(RUST_TOOLS.map(tool => tool.id).sort()).toEqual(['pixelactions', 'pixelcoords'])
  })

  it('gives each one a site and a repo that parse', () => {
    for (const tool of RUST_TOOLS) {
      expect(() => new URL(tool.siteUrl), tool.id).not.toThrow()
      expect(() => new URL(tool.githubUrl), tool.id).not.toThrow()
      expect(tool.siteUrl.startsWith('https://'), tool.id).toBe(true)
      expect(tool.siteUrl.endsWith('/'), `${tool.id} has a trailing slash`).toBe(false)
    }
  })

  it('gives each one a distinct monogram and tagline', () => {
    const monograms = RUST_TOOLS.map(tool => tool.monogram)
    expect(new Set(monograms).size).toBe(monograms.length)
    for (const tool of RUST_TOOLS) {
      expect(tool.tagline.trim().length, `${tool.id} tagline`).toBeGreaterThan(10)
    }
  })

  it('is frozen, like the rest of the content layer', () => {
    expect(Object.isFrozen(RUST_TOOLS)).toBe(true)
  })
})
