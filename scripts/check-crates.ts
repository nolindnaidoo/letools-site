#!/usr/bin/env bun
/**
 * Verify the crate claims on this site against crates.io.
 *
 * The site links a crate only once `cratePublished` is true, and that flag is
 * hand-set — there is no way to derive the moment `cargo publish` returns. So
 * the flag can be wrong in both directions, and both are worth catching:
 *
 * - Claimed published, absent from crates.io: the page ships a link that 404s,
 *   which reads as a broken tool to the one visitor most likely to try it.
 *   That fails.
 * - Not claimed, but present: the publish landed and nobody flipped the flag,
 *   so the page still says "publishing shortly" about a crate people can
 *   already install. That reports, and does not fail a build.
 *
 * Unreachable registry passes: an outage says nothing about the claim.
 *
 * Run: bun run check:crates
 */
import { crateFor, TOOLS, type Tool } from '../lib/tools'

type Published = Readonly<{ version?: string; error?: string }>

export async function publishedVersion(name: string): Promise<Published> {
  try {
    const response = await fetch(`https://crates.io/api/v1/crates/${name}`, {
      headers: { 'user-agent': 'letools-site content check' },
    })
    if (!response.ok && response.status !== 404) {
      return { error: `crates.io answered ${response.status}` }
    }
    const body = (await response.json()) as {
      crate?: { max_stable_version?: string }
      errors?: unknown
    }
    return {
      ...(body.crate?.max_stable_version === undefined
        ? {}
        : { version: body.crate.max_stable_version }),
    }
  } catch (cause) {
    return { error: `crates.io unreachable: ${cause instanceof Error ? cause.message : cause}` }
  }
}

export type Verdict = Readonly<{ level: 'ok' | 'note' | 'fail'; message: string }>

/** The rule, split from the network so it can be tested. */
export function verdictFor(
  toolId: string,
  claimsPublished: boolean,
  published: Published,
): Verdict {
  if (published.error !== undefined) {
    return { level: 'note', message: `${toolId}: skipped — ${published.error}` }
  }
  const live = published.version !== undefined

  if (claimsPublished && !live) {
    return {
      level: 'fail',
      message: `${toolId}: the site links crates.io but the crate is not published`,
    }
  }
  if (!claimsPublished && live) {
    return {
      level: 'note',
      message: `${toolId}: published as v${published.version} — set cratePublished to true`,
    }
  }
  return {
    level: 'ok',
    message: claimsPublished
      ? `${toolId}: published, v${published.version}`
      : `${toolId}: not published yet, and the page does not claim otherwise`,
  }
}

export async function main(
  lookUp: (name: string) => Promise<Published> = publishedVersion,
  tools: readonly Tool[] = TOOLS,
): Promise<number> {
  const withCrates = tools.filter(tool => crateFor(tool) !== undefined)
  if (withCrates.length === 0) {
    process.stdout.write('No tools ship a crate.\n')
    return 0
  }

  let failed = 0
  for (const tool of withCrates) {
    const crate = crateFor(tool)
    if (crate === undefined) continue
    const verdict = verdictFor(tool.id, tool.cratePublished === true, await lookUp(crate.name))
    const mark = { ok: '  ✓', note: '  ~', fail: '  ✗' }[verdict.level]
    process.stdout.write(`${mark} ${verdict.message}\n`)
    if (verdict.level === 'fail') failed += 1
  }

  if (failed > 0) {
    process.stderr.write(
      `\ncheck-crates: ${failed} crate claim(s) the registry does not support.\n\n`,
    )
    return 1
  }
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(await main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\ncheck-crates: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
