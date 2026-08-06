#!/usr/bin/env node
/**
 * Conventional-commit validator. One implementation, called by both the
 * `commit-msg` hook and CI, so the two can never disagree about what a valid
 * message is.
 *
 * Usage:
 *   commit-lint.js <path-to-message-file>   (hook)
 *   commit-lint.js --range <base> <head>    (CI)
 *
 * Every failure path prints what failed and what state the caller is now in.
 * This runs inside `git commit`, where an unhandled stack trace is both useless
 * and alarming — the person sees it mid-commit and cannot tell whether the
 * commit happened.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const TYPES = Object.freeze([
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
])

const MAX_SUBJECT = 72
const SUBJECT = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9._/-]+\\))?!?: .+$`)

const OK = 0
const REJECTED = 1
const MISUSED = 2

const USAGE = 'usage: commit-lint.js <message-file> | commit-lint.js --range <base> <head>'

/** Git writes merge subjects, not a person — they are exempt. */
function isMerge(subject) {
  return subject.startsWith('Merge ')
}

/** The problems with one subject line; empty when it is valid. */
function problems(subject) {
  if (isMerge(subject)) return []
  if (!subject) return ['is empty — a commit needs a subject line']

  const found = []
  if (!SUBJECT.test(subject)) {
    found.push(`must match "type(scope): summary" with type one of ${TYPES.join(', ')}`)
  }
  if (subject.length > MAX_SUBJECT) {
    found.push(`must be ${MAX_SUBJECT} characters or fewer (is ${subject.length})`)
  }
  if (subject.endsWith('.')) {
    found.push('must not end with a period')
  }
  return found
}

function fail(message) {
  process.stderr.write(`\ncommit-lint: ${message}\n\n`)
  return MISUSED
}

/** Subject lines for a git revision argument, or an error describing the failure. */
function subjectsFor(revisions) {
  try {
    const log = execFileSync('git', ['log', '--format=%s', ...revisions], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { subjects: log.split('\n').filter(Boolean) }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    return { error: `could not read commits at ${revisions.join(' ')}: ${detail}` }
  }
}

/** True when the object exists in this clone and is a commit. */
function hasCommit(sha) {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    // Not an error worth reporting: an unreachable base is the normal state
    // after a force push, and the caller decides what to do about it.
    return false
  }
}

/**
 * Subjects in `base..head`. Returns `{ subjects }` or `{ error }` — a git
 * failure is a value the caller reports, not an exception thrown past it.
 *
 * The base is not always reachable. GitHub sends an all-zero SHA for the first
 * push to a branch, and after a force push it sends the SHA that was just
 * overwritten — which no longer exists. Both cases mean "there is no range",
 * not "the check failed", so they fall back to validating the head commit
 * rather than erroring or silently passing on nothing.
 */
function subjectsInRange(base, head) {
  if (!base || /^0+$/.test(base)) return subjectsFor([head, '-1'])

  if (!hasCommit(base)) {
    process.stderr.write(
      `commit-lint: ${base.slice(0, 7)} is unreachable — history was rewritten. ` +
        'Checking the head commit only.\n',
    )
    return subjectsFor([head, '-1'])
  }

  return subjectsFor([`${base}..${head}`])
}

/** The subject from a git message file, or an error describing why not. */
function readSubject(path) {
  try {
    const message = readFileSync(path, 'utf8')
    // Git strips comment lines before writing the commit; ignore them here
    // so a commented-out template does not read as the subject.
    const firstLine = message.split('\n').find(line => line && !line.startsWith('#'))
    return { subject: firstLine ?? '' }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)
    return { error: `could not read the commit message at ${path}: ${detail}` }
  }
}

function report(subject, found) {
  process.stderr.write(`\n  ✗ ${subject || '(empty subject)'}\n`)
  for (const problem of found) process.stderr.write(`      ${problem}\n`)
}

function collect(argv) {
  if (argv[0] === '--range') {
    if (!argv[1] || !argv[2]) return { error: `--range needs a base and a head.\n${USAGE}` }
    return subjectsInRange(argv[1], argv[2])
  }

  if (!argv[0]) return { error: `no commit message file given.\n${USAGE}` }

  const read = readSubject(argv[0])
  if (read.error) return { error: read.error }
  return { subjects: [read.subject] }
}

function main(argv) {
  const collected = collect(argv)
  if (collected.error) return fail(collected.error)

  const subjects = collected.subjects ?? []
  if (subjects.length === 0) return OK

  let failed = 0
  for (const subject of subjects) {
    const found = problems(subject)
    if (found.length === 0) continue
    report(subject, found)
    failed += 1
  }

  if (failed === 0) return OK
  process.stderr.write(`\n  ${failed} commit message(s) rejected. Nothing was committed.\n\n`)
  return REJECTED
}

// The outermost boundary: anything that escapes the handlers above is a defect
// in this script, and it should say so rather than printing a bare stack.
try {
  process.exit(main(process.argv.slice(2)))
} catch (cause) {
  const detail = cause instanceof Error ? cause.stack : String(cause)
  process.stderr.write(`\ncommit-lint: unexpected failure — this is a bug.\n${detail}\n\n`)
  process.exit(MISUSED)
}
