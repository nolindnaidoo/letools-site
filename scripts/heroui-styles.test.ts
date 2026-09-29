import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * app/globals.css imports HeroUI's component styles one by one instead of the
 * whole package, because the full import carries ~80 components this site
 * never mounts. The cost of scoping is that the list can fall behind: a new
 * component, or one HeroUI renders internally (tabs renders scroll-shadow),
 * ships unstyled with every other gate green. That miss happened once while
 * the list was being written. This derives the list from what the code
 * imports and fails when the stylesheet disagrees.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIRS = ['app', 'components', 'features', 'ui', 'lib']
const REACT_COMPONENTS = join(ROOT, 'node_modules/@heroui/react/dist/components')
const STYLE_COMPONENTS = join(ROOT, 'node_modules/@heroui/styles/dist/components')

/** The first capture group of every match. */
function captures(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].flatMap(([, group]) => (group === undefined ? [] : [group]))
}

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [path] : []
  })
}

function importedComponents(): { scoped: Set<string>; bare: string[] } {
  const scoped = new Set<string>()
  const bare: string[] = []
  for (const file of SOURCE_DIRS.flatMap(dir => sourceFiles(join(ROOT, dir)))) {
    const text = readFileSync(file, 'utf8')
    for (const name of captures(text, /from '@heroui\/react\/([a-z-]+)'/g)) scoped.add(name)
    if (/from '@heroui\/react'/.test(text)) bare.push(file)
  }
  return { scoped, bare }
}

/** Every component a set of components renders, following HeroUI's own imports. */
function closure(roots: Iterable<string>): Set<string> {
  const seen = new Set<string>()
  const stack = [...roots]
  while (stack.length > 0) {
    const name = stack.pop() as string
    const dir = join(REACT_COMPONENTS, name)
    if (seen.has(name) || !existsSync(dir)) continue
    seen.add(name)
    for (const file of readdirSync(dir).filter(f => f.endsWith('.js'))) {
      const text = readFileSync(join(dir, file), 'utf8')
      stack.push(...captures(text, /['"]\.\.\/([a-z-]+)(?:\/[^'"]*)?['"]/g))
    }
  }
  return seen
}

function stylesheetOrder(): string[] {
  const index = readFileSync(join(STYLE_COMPONENTS, 'index.css'), 'utf8')
  return captures(index, /@import "\.\/([a-z-]+)\.css"/g)
}

function globalsImports(): string[] {
  const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8')
  return captures(css, /@import "@heroui\/styles\/components\/([a-z-]+)\.css"/g)
}

describe('HeroUI component styles', () => {
  const { scoped, bare } = importedComponents()

  it('are imported per component, so the rendered set is knowable', () => {
    // A root import could pull in any component, which the scoped stylesheet
    // cannot follow.
    expect(bare, 'import from @heroui/react/<component>, not the package root').toEqual([])
    expect(scoped.size).toBeGreaterThan(0)
  })

  it('cover every component the site renders, and nothing else', () => {
    const available = new Set(stylesheetOrder())
    const needed = [...closure(scoped)].filter(name => available.has(name)).sort()
    expect([...globalsImports()].sort()).toEqual(needed)
  })

  it("keep HeroUI's own import order", () => {
    const order = stylesheetOrder()
    const imported = globalsImports()
    expect(imported).toEqual([...imported].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
  })
})
