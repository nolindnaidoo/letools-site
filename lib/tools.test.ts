import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OPENVSX_NAMESPACE, PUBLISHER, SITE_URL } from './site'
import {
  CATEGORIES,
  crateFor,
  crateUrl,
  demoSrc,
  factsFor,
  findTool,
  githubUrl,
  iconSrc,
  installCommand,
  marketplaceUrl,
  mcpCommand,
  mcpRegistryUrl,
  mcpServerName,
  npmUrl,
  openVsxUrl,
  posterSrc,
  TOOLS,
  toolPath,
  zedPrUrl,
} from './tools'

/**
 * The registry is the single source the grid, the category tabs, the install
 * commands and every tool page render from. Nothing here was tested before, so
 * a duplicated id, a tool in a category no tab renders, or an MCP tool name
 * that drifted from its repo would all have shipped silently.
 *
 * These assert the invariants the site's markup depends on. Claims about the
 * *outside world* — that a package is published, that a version matches —
 * belong in the drift scripts, which reach the network.
 */

describe('the registry', () => {
  it('describes the whole family', () => {
    // Ten is a product fact the copy states out loud; a mismatch means the
    // site is claiming a family size it does not list.
    expect(TOOLS).toHaveLength(10)
  })

  it('gives every tool a unique id', () => {
    const ids = TOOLS.map(tool => tool.id)
    expect(new Set(ids).size, `duplicate id in ${ids.join(', ')}`).toBe(ids.length)
  })

  it('gives every tool a unique MCP tool name', () => {
    // Renaming one breaks every agent prompt that references it, and two tools
    // answering to the same name is worse: whichever loads last wins.
    const names = TOOLS.map(tool => tool.mcpTool)
    expect(new Set(names).size, `duplicate mcpTool in ${names.join(', ')}`).toBe(names.length)
  })

  it('puts every tool in a category the tabs actually render', () => {
    const known = new Set(CATEGORIES.map(category => category.id))
    for (const tool of TOOLS) {
      expect(known.has(tool.category), `${tool.id} is in unknown category ${tool.category}`).toBe(
        true,
      )
    }
  })

  it('leaves no category empty', () => {
    // An empty tab renders as a dead control.
    for (const category of CATEGORIES) {
      expect(
        TOOLS.some(tool => tool.category === category.id),
        `category ${category.id} has no tools`,
      ).toBe(true)
    }
  })

  it('uses ids that are safe in a URL and a registry id', () => {
    // The id is spliced into `/tools/<id>`, into `nolindnaidoo.<id>` for the
    // Marketplace, and into `OffensiveEdge.<id>` for Open VSX. Anything needing
    // escaping in one of those breaks a link nobody would test by hand.
    for (const tool of TOOLS) {
      expect(tool.id, `${tool.id} is not a clean slug`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(encodeURIComponent(tool.id)).toBe(tool.id)
    }
  })

  it('gives every tool the copy each page needs', () => {
    for (const tool of TOOLS) {
      expect(tool.name.trim(), `${tool.id} name`).not.toBe('')
      expect(tool.summary.trim().length, `${tool.id} summary is too thin`).toBeGreaterThan(20)
      expect(tool.overview.trim().length, `${tool.id} overview is too thin`).toBeGreaterThan(80)
      expect(tool.useCases.length, `${tool.id} has no use cases`).toBeGreaterThan(0)
      for (const useCase of tool.useCases) {
        expect(useCase.title.trim(), `${tool.id} use-case title`).not.toBe('')
        expect(useCase.detail.trim(), `${tool.id} use-case detail`).not.toBe('')
      }
    }
  })

  it('keeps summaries free of the hype the voice rules forbid', () => {
    // Copy comes from each tool's manifest and is never embellished here.
    const banned = /\b(blazing|revolutionary|game[- ]chang|effortless|magic|seamless)\b/i
    for (const tool of TOOLS) {
      expect(banned.test(tool.summary), `${tool.id} summary reads as marketing`).toBe(false)
      expect(banned.test(tool.overview), `${tool.id} overview reads as marketing`).toBe(false)
    }
  })

  it('points every Zed PR at a real pull-request number', () => {
    // The field exists to say "submitted, not merged" honestly. A zero or a
    // negative would render a link to nothing.
    for (const tool of TOOLS) {
      expect(Number.isInteger(tool.zedPr), `${tool.id} zedPr`).toBe(true)
      expect(tool.zedPr, `${tool.id} zedPr`).toBeGreaterThan(0)
    }
  })

  it('is frozen, so a render body cannot reshape a fact', () => {
    expect(Object.isFrozen(TOOLS)).toBe(true)
    expect(Object.isFrozen(CATEGORIES)).toBe(true)
  })
})

describe('the identity constants', () => {
  it('keeps the two registry namespaces distinct', () => {
    // VS Code resolves `nolindnaidoo.<id>`; Open VSX currently resolves
    // `OffensiveEdge.<id>`. Using one id for both fails for half the audience,
    // which is why they are separate constants rather than one.
    expect(OPENVSX_NAMESPACE).not.toBe(PUBLISHER)
  })

  it('exposes an origin the canonical tags can be built from', () => {
    expect(SITE_URL).toBe(new URL(SITE_URL).origin)
    expect(SITE_URL.endsWith('/')).toBe(false)
  })
})

/**
 * Every outbound link on the site is built by one of these. They are pure
 * string builders, which is exactly why they were never tested and exactly why
 * a wrong one is invisible: the link renders, looks plausible, and 404s only
 * for the visitor who clicks it.
 *
 * The two registry namespaces are the trap. VS Code resolves
 * `nolindnaidoo.<id>` and Open VSX currently resolves `OffensiveEdge.<id>`;
 * using one for both fails for half the audience.
 */
describe('the link builders', () => {
  const tool = TOOLS[0]
  if (tool === undefined) throw new Error('the registry is empty')

  it('keeps the tool page on this site', () => {
    expect(toolPath(tool)).toBe(`/tools/${tool.id}`)
  })

  it('uses the Marketplace publisher for the Marketplace', () => {
    expect(marketplaceUrl(tool)).toBe(
      `https://marketplace.visualstudio.com/items?itemName=${PUBLISHER}.${tool.id}`,
    )
  })

  it('uses the Open VSX namespace for Open VSX, not the publisher', () => {
    const url = openVsxUrl(tool)
    expect(url).toBe(`https://open-vsx.org/extension/${OPENVSX_NAMESPACE}/${tool.id}`)
    expect(url).not.toContain(`/${PUBLISHER}/`)
  })

  it('derives the MCP package and registry id from the tool id', () => {
    expect(npmUrl(tool)).toBe(`https://www.npmjs.com/package/${tool.id}-mcp`)
    expect(mcpServerName(tool)).toBe(`io.github.${PUBLISHER}/${tool.id}`)
    expect(mcpCommand(tool)).toBe(`npx -y ${tool.id}-mcp`)
  })

  it('builds an install command a user can paste', () => {
    expect(installCommand(tool)).toBe(`ext install ${PUBLISHER}.${tool.id}`)
  })

  it('points the Zed link at the pull request, not a listing', () => {
    // The extensions are submitted, not merged. Linking a listing that does
    // not exist would be the dishonest version of this.
    expect(zedPrUrl(tool)).toBe(`https://github.com/zed-industries/extensions/pull/${tool.zedPr}`)
  })

  it('builds asset paths that match what the repo ships', () => {
    expect(iconSrc(tool)).toBe(`/icons/${tool.id}.png`)
    // Demos and posters carry eight characters of their own hash, so that a
    // corrected image is a new URL rather than one hidden behind a week-long
    // cache. The icons do not change and are not fingerprinted.
    expect(demoSrc(tool)).toMatch(new RegExp(`^/demos/${tool.id}\\.[0-9a-f]{8}\\.gif$`))
    expect(posterSrc(tool)).toMatch(new RegExp(`^/posters/${tool.id}\\.[0-9a-f]{8}\\.jpg$`))
  })

  it('gives every tool a fingerprinted demo and poster that exist on disk', () => {
    for (const current of TOOLS) {
      for (const path of [demoSrc(current), posterSrc(current)]) {
        expect(
          statSync(resolve('public', path.replace(/^\//, '')), { throwIfNoEntry: false })?.isFile(),
          `${path} is referenced but not in public/`,
        ).toBe(true)
      }
    }
  })

  it('produces a parseable absolute URL for every off-site link, for every tool', () => {
    const builders = [marketplaceUrl, openVsxUrl, githubUrl, npmUrl, zedPrUrl, mcpRegistryUrl]
    for (const current of TOOLS) {
      for (const build of builders) {
        const url = build(current)
        expect(() => new URL(url), `${current.id}: ${url}`).not.toThrow()
        expect(url.startsWith('https://'), `${current.id}: ${url}`).toBe(true)
      }
    }
  })

  it('gives every tool a distinct page path and asset set', () => {
    const paths = TOOLS.map(toolPath)
    expect(new Set(paths).size).toBe(paths.length)
    const icons = TOOLS.map(iconSrc)
    expect(new Set(icons).size).toBe(icons.length)
  })
})

describe('findTool', () => {
  it('finds a tool by id', () => {
    const first = TOOLS[0]
    if (first === undefined) throw new Error('the registry is empty')
    expect(findTool(first.id)).toBe(first)
  })

  it('returns undefined for an unknown id rather than throwing', () => {
    // The dynamic route calls this with whatever is in the URL; a throw here
    // would be a 500 where a 404 is correct.
    expect(findTool('not-a-tool')).toBeUndefined()
  })
})

describe('factsFor', () => {
  it('returns the generated facts for every registered tool', () => {
    for (const tool of TOOLS) {
      const facts = factsFor(tool)
      expect(facts.version, tool.id).toMatch(/^\d+\.\d+\.\d+$/)
      expect(facts.commands.length, tool.id).toBeGreaterThan(0)
      for (const command of facts.commands) {
        // A title left as its NLS placeholder would render as
        // `%manifest.command.extract.title%` on the page.
        expect(command.title, command.id).not.toMatch(/^%.*%$/)
        expect(command.id.startsWith(tool.id), command.id).toBe(true)
      }
      expect(facts.mcpPackage, tool.id).toBe(`${tool.id}-mcp`)
      expect(facts.zedId, tool.id).toBe(tool.id)
    }
  })

  it('names the fix rather than returning undefined for an unknown tool', () => {
    // A tool added to the registry without re-running the sync would otherwise
    // render `undefined` into the page.
    const ghost = { ...TOOLS[0], id: 'ghost-le' } as (typeof TOOLS)[number]
    expect(() => factsFor(ghost)).toThrow(/sync:registry/)
  })
})

describe('the crate claims', () => {
  it('only claims publication where a crate exists', () => {
    for (const tool of TOOLS) {
      if (tool.cratePublished === undefined) continue
      expect(crateFor(tool), `${tool.id} claims a crate state but ships no crate`).toBeDefined()
    }
  })

  it('reads the crate name and version from the repo, not by hand', () => {
    const withCrate = TOOLS.filter(tool => crateFor(tool) !== undefined)
    expect(withCrate.length).toBeGreaterThan(0)
    for (const tool of withCrate) {
      const crate = crateFor(tool)
      expect(crate?.name, tool.id).toBe(tool.id)
      expect(crate?.version, tool.id).toMatch(/^\d+\.\d+\.\d+$/)
    }
  })

  it('builds a crates.io URL from the crate name', () => {
    expect(crateUrl('scrape-le')).toBe('https://crates.io/crates/scrape-le')
  })
})
