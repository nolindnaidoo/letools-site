#!/usr/bin/env bun
/**
 * Every link to a Zed extensions pull request, checked against GitHub.
 *
 * A Zed submission is linked as "pending review" from the site registry, each
 * extension README and each npm README. All three submissions were closed
 * without merging, and the links stayed — six READMEs and three tool pages
 * telling readers a listing was on its way. Whether a pull request is open is
 * a fact about GitHub at a moment in time; this asks GitHub.
 *
 * Run: bun run check:zed-claims [root]
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOOLS } from '../lib/tools'
import { REPOS } from './check-fleet'

const PULL = /github\.com\/zed-industries\/extensions\/pull\/(\d+)/g

/** Every Zed pull request number a document links. */
export function linkedPulls(text: string): readonly number[] {
  return [...new Set([...text.matchAll(PULL)].map(match => Number(match[1])))]
}

async function state(pull: number): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/zed-industries/extensions/pulls/${pull}`,
    {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'letools-fleet-check' },
    },
  )
  if (!response.ok) throw new Error(`GitHub answered ${response.status} for pull ${pull}`)
  const body = (await response.json()) as { state: string; merged: boolean }
  return body.merged ? 'merged' : body.state
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  const root = process.argv[2] ?? '..'
  const claims = new Map<number, string[]>()
  const note = (pull: number, where: string) =>
    claims.set(pull, [...(claims.get(pull) ?? []), where])
  for (const tool of TOOLS)
    if (tool.zedPr !== undefined) note(tool.zedPr, `lib/tools.ts (${tool.id})`)
  for (const repo of REPOS) {
    for (const file of ['README.md', 'mcp/README.md']) {
      const path = join(root, repo, file)
      if (!existsSync(path)) continue
      for (const pull of linkedPulls(readFileSync(path, 'utf8'))) note(pull, `${repo}/${file}`)
    }
  }
  const stale: string[] = []
  for (const [pull, where] of claims) {
    const now = await state(pull)
    if (now !== 'open')
      stale.push(`zed-industries/extensions#${pull} is ${now}, linked from ${where.join(', ')}`)
  }
  if (stale.length > 0) {
    console.error(stale.join('\n'))
    process.exit(1)
  }
  console.log(`Every Zed pull request the family links (${claims.size}) is still open.`)
}
/* v8 ignore stop */
