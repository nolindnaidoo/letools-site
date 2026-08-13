#!/usr/bin/env bun
/**
 * Fails the build when the shipped payload grows past its ceiling.
 *
 * The whole argument for this site is that it is small — a static poster
 * arguing for a careful tool undermines itself by being slow. Nothing enforces
 * that on its own: a component that pulls in a date library costs nothing
 * visible in review and shows up only as a slower page on a phone.
 *
 * The ceilings are a floor to ratchet DOWN, never raised to make a build pass.
 * Raising one needs a written reason in the commit body.
 *
 * Run: bun run budget   (after bun run build)
 */
import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BUILD = resolve(ROOT, 'out')

const KB = 1024

/**
 * Measured 2026-08-12 against the current build: js 865 KB, css 418 KB,
 * html 1421 KB across seventeen pages, fonts 143 KB, and 7.6 MB of demos.
 *
 * The HTML ceiling moved from 750 KB to 950 KB across two steps: the tool
 * pages gained the command list and the distribution channels, and the home
 * page gained the thesis section, the MCP generator and the palette trigger.
 * It then moved to 1560 KB when the family went from ten tools to sixteen —
 * six new pages, and six more sibling cards on each of the other eleven, so
 * the class grows faster than the page count does.
 *
 * **Set this from the deployed number, not a local build.** The same commit
 * measures ~823 KB locally and ~885 KB in the build image — about 5 KB per
 * page — so a ceiling tuned locally passes here and fails the deploy, which
 * happened. Every other class matches; only HTML differs. At nineteen HTML
 * files that delta is ~95 KB, which puts this build near 1516 KB deployed;
 * 1560 is that plus the usual sliver. **If the deploy fails on HTML, take the
 * number from the build log rather than adding another round guess.**
 *
 * Raising any ceiling needs the reason in the commit body. That is the only
 * way these move up.
 *
 * The ceilings sit just above today's numbers rather than at a comfortable
 * round figure. That is the whole point of a budget: it should fail the first
 * time something grows, not absorb a doubling in silence. This site is React
 * and HeroUI by decision, so the floor is a component library plus a framework
 * runtime — the budget guards the delta on top of that, not the choice itself.
 *
 * The GIFs are hover demos: content, not per-page payload. They get a ceiling
 * so the directory cannot balloon unnoticed, not because they load eagerly.
 */
const BUDGETS = Object.freeze([
  { label: 'client JS', match: (p: string) => p.endsWith('.js'), ceiling: 900 * KB },
  { label: 'CSS', match: (p: string) => p.endsWith('.css'), ceiling: 430 * KB },
  { label: 'HTML', match: (p: string) => p.endsWith('.html'), ceiling: 1_560 * KB },
  { label: 'fonts', match: (p: string) => p.endsWith('.woff2'), ceiling: 160 * KB },
  { label: 'demo GIFs', match: (p: string) => p.endsWith('.gif'), ceiling: 8_600 * KB },
])

export function* walk(directory: string): Generator<string> {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
      continue
    }
    yield full
  }
}

export function kb(bytes: number): string {
  return `${(bytes / KB).toFixed(1)} KB`
}

export { BUDGETS }

export function main(root: string = BUILD): number {
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    process.stderr.write('\ncheck-budget: no dist/ directory — run `bun run build` first.\n\n')
    return 2
  }

  const files = [...walk(root)]
  let over = 0

  for (const budget of BUDGETS) {
    const matched = files.filter(file => budget.match(file))
    const total = matched.reduce((sum, file) => sum + statSync(file).size, 0)
    const share = Math.round((total / budget.ceiling) * 100)

    process.stdout.write(
      `  ${total > budget.ceiling ? '✗' : '✓'} ${budget.label.padEnd(10)} ${kb(total).padStart(9)} / ${kb(budget.ceiling).padStart(9)}  (${share}%, ${matched.length} file${matched.length === 1 ? '' : 's'})\n`,
    )

    if (total <= budget.ceiling) continue
    over += 1
  }

  if (over === 0) return 0

  process.stderr.write(
    `\ncheck-budget: ${over} budget(s) exceeded. Reduce the payload, or raise the ceiling in this file with the reason in your commit body.\n\n`,
  )
  return 1
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-budget: unexpected failure — this is a bug.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
