#!/usr/bin/env bun
/**
 * Rebuild `public/demos/` from each tool repo's canonical demo.
 *
 * `src/assets/images/demo.gif` is the demo each tool's README embeds, so it is
 * the one users see on the Marketplace listing and on GitHub. This site should
 * show the same recording, and until now the copies were made by hand — which
 * is how Colors-LE ended up shipping the Dates-LE demo, and how every copy here
 * drifted a release behind the source.
 *
 * The recordings are wider than the card, so each is scaled to a fixed width
 * with a per-clip palette. A GIF re-encoded against the global 256-colour
 * palette bands badly on editor screenshots, which are mostly flat syntax
 * colours over a dark background — `palettegen`/`paletteuse` is what keeps
 * them legible.
 *
 * Requires ffmpeg. Run: bun run sync:demos
 */
import { existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../lib/tools'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEMOS = resolve(ROOT, 'public/demos')
const POSTERS = resolve(ROOT, 'public/posters')
/** The extension repos are checked out beside this one. */
const FLEET = resolve(ROOT, '..')

/** The card renders at 800px; anything wider is bytes nobody sees. */
const WIDTH = 800

export function sourceFor(toolId: string): string {
  return resolve(FLEET, toolId, 'src/assets/images/demo.gif')
}

export function destinationFor(toolId: string): string {
  return resolve(DEMOS, `${toolId}.gif`)
}

/**
 * The still shown before the demo plays, and under reduced motion.
 *
 * These were generated once by hand and never again. Two of them were the same
 * file — the Colors-LE card showed the Dates-LE screenshot on every visit,
 * which is the duplicate-demo bug a directory over, and the demo check never
 * looked here. Deriving the poster from the demo means it cannot disagree with
 * the clip it stands in for.
 */
export function posterFor(toolId: string): string {
  return resolve(POSTERS, `${toolId}.jpg`)
}

/** First frame of the clip, at the width the card renders. */
export function posterArgsFor(source: string, destination: string): readonly string[] {
  return [
    '-y',
    '-loglevel',
    'error',
    '-i',
    source,
    '-frames:v',
    '1',
    '-vf',
    `scale=${WIDTH}:-1:flags=lanczos`,
    '-q:v',
    '4',
    destination,
  ]
}

/**
 * The ffmpeg filter chain, as one string. Kept here rather than inline so the
 * encode is one decision in one place — a demo re-encoded with different
 * settings than its neighbours is visible on the grid.
 */
export const FILTER =
  `scale=${WIDTH}:-1:flags=lanczos,split[s0][s1];` +
  '[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3'

export function argsFor(source: string, destination: string): readonly string[] {
  return ['-y', '-loglevel', 'error', '-i', source, '-vf', FILTER, destination]
}

export async function main(): Promise<number> {
  const missing = TOOLS.filter(tool => !existsSync(sourceFor(tool.id)))
  if (missing.length > 0) {
    process.stderr.write(
      `\nsync-demos: no source demo for ${missing.map(t => t.id).join(', ')}.\n` +
        `Expected each tool repo checked out beside this one, at ${FLEET}.\n\n`,
    )
    return 2
  }

  let total = 0
  for (const tool of TOOLS) {
    const destination = destinationFor(tool.id)
    const result = Bun.spawnSync(['ffmpeg', ...argsFor(sourceFor(tool.id), destination)])

    if (result.exitCode !== 0) {
      process.stderr.write(
        `\nsync-demos: ffmpeg failed for ${tool.id}.\n${result.stderr.toString()}\n`,
      )
      return 1
    }

    const poster = posterFor(tool.id)
    const posterResult = Bun.spawnSync(['ffmpeg', ...posterArgsFor(sourceFor(tool.id), poster)])
    if (posterResult.exitCode !== 0) {
      process.stderr.write(
        `\nsync-demos: ffmpeg failed on the poster for ${tool.id}.\n${posterResult.stderr.toString()}\n`,
      )
      return 1
    }

    const bytes = statSync(destination).size + statSync(poster).size
    total += bytes
    process.stdout.write(`  ${tool.id.padEnd(12)} ${(bytes / 1024).toFixed(0).padStart(5)} KB\n`)
  }

  process.stdout.write(
    `\nSynced ${TOOLS.length} demos and posters, ${(total / 1024 / 1024).toFixed(1)} MB.\n`,
  )
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\nsync-demos: unexpected failure — this is a bug.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
