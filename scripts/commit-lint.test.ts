import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * This script gates every commit in the repository and is the densest logic in
 * it — two input modes, four exit paths, and a base SHA that is routinely
 * unreachable. It was previously verified by hand exactly once, which is not
 * verification.
 *
 * Exit codes: 0 accepted, 1 rejected, 2 misused.
 */

const SCRIPT = 'scripts/commit-lint.js'
const scratch = mkdtempSync(join(tmpdir(), 'commit-lint-'))

afterAll(() => rmSync(scratch, { recursive: true, force: true }))

/**
 * Runs the validator, returning its exit code and stderr.
 *
 * spawnSync rather than execFileSync: the unreachable-base path exits 0 *and*
 * writes a warning, and execFileSync only surfaces stderr when it throws.
 */
function run(args: readonly string[]): { code: number; stderr: string } {
  const result = spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' })
  return { code: result.status ?? -1, stderr: result.stderr ?? '' }
}

/** Writes a message file and validates it the way the hook does. */
function check(message: string): { code: number; stderr: string } {
  const path = join(scratch, `msg-${Buffer.from(message).toString('hex').slice(0, 16)}`)
  writeFileSync(path, message)
  return run([path])
}

describe('accepted subjects', () => {
  it.each([
    'feat: add a thing',
    'fix(content): correct the install count',
    'docs: explain the budget',
    'refactor!: drop the legacy path',
    'chore(deps): bump biome',
  ])('%s', subject => {
    expect(check(subject).code).toBe(0)
  })

  it('exempts merge subjects, which git writes rather than a person', () => {
    expect(check('Merge branch main into feature').code).toBe(0)
  })

  it('ignores comment lines the way git does', () => {
    expect(check('# a template comment\nfeat: the real subject').code).toBe(0)
  })
})

describe('rejected subjects', () => {
  it.each([
    ['no type prefix', 'added a thing'],
    ['unknown type', 'wip: still going'],
    ['trailing period', 'feat: add a thing.'],
    ['no summary', 'feat:'],
    ['empty message', '# only a comment'],
  ])('%s', (_label, subject) => {
    expect(check(subject).code).toBe(1)
  })

  it('rejects a subject over 100 characters', () => {
    expect(check(`feat: ${'x'.repeat(110)}`).code).toBe(1)
  })

  it('accepts a subject at exactly 100 characters', () => {
    const subject = `feat: ${'x'.repeat(100 - 'feat: '.length)}`
    expect(subject).toHaveLength(100)
    expect(check(subject).code).toBe(0)
  })

  it('says nothing was committed, so the state is unambiguous', () => {
    expect(check('nope').stderr).toContain('Nothing was committed')
  })
})

describe('range mode', () => {
  it('accepts a range whose commits are all valid', () => {
    expect(run(['--range', 'HEAD', 'HEAD']).code).toBe(0)
  })

  it('falls back to the head commit when the base is unreachable', () => {
    // GitHub sends the overwritten SHA as event.before after a force push.
    // This exact input took CI down once.
    const result = run(['--range', '1'.repeat(40), 'HEAD'])
    expect(result.code).toBe(0)
    expect(result.stderr).toContain('history was rewritten')
  })

  it('falls back for the all-zero base of a first push', () => {
    expect(run(['--range', '0'.repeat(40), 'HEAD']).code).toBe(0)
  })

  it('reports a genuinely broken revision rather than passing', () => {
    const result = run(['--range', 'HEAD', 'not-a-real-ref'])
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('could not read commits')
  })
})

describe('misuse', () => {
  it('names the usage when given no arguments', () => {
    const result = run([])
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('usage:')
  })

  it('names the usage when --range is incomplete', () => {
    const result = run(['--range', 'HEAD'])
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('--range needs a base and a head')
  })

  it('reports an unreadable message file rather than throwing a stack', () => {
    const result = run([join(scratch, 'does-not-exist')])
    expect(result.code).toBe(2)
    expect(result.stderr).toContain('could not read the commit message')
    expect(result.stderr).not.toContain('at Object.')
  })
})
