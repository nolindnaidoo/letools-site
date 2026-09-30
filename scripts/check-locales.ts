#!/usr/bin/env bun
/**
 * Every translated string, checked for being in the language its file says.
 *
 * dates-le shipped an Italian catalogue that was Indonesian — eighteen of its
 * twenty-six manifest strings and eleven runtime ones, copied from the `id`
 * file — and string-le shipped two sort labels in English in ten locales. Both
 * passed the key-parity test, because the keys were all there; nothing looked
 * at the values.
 *
 * Two rules, for the manifest catalogues (`src/i18n/package.nls.*.json`) and
 * the runtime bundles (`l10n/bundle.l10n.*.json`) of every extension:
 *
 * - **Not English.** A value equal to its English source, ignoring case, is
 *   untranslated when the source is a phrase of two or more words once
 *   brands (`Colors-LE`), format tokens (`YYYY-MM-DD`) and placeholders are
 *   gone. A single word may be a cognate — "dates" is French too.
 * - **Not another locale's.** A value identical in two locales, and not the
 *   English, was copied from one into the other. Languages that genuinely
 *   share words are allowed a match: Spanish and Portuguese, Spanish and
 *   Italian, Russian and Ukrainian, Japanese and Chinese.
 *
 * Run: bun run check:locales [root]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPOS } from './check-fleet'

export type Catalogue = Readonly<Record<string, string>>

export type Finding = Readonly<{
  file: string
  key: string
  value: string
  problem: string
}>

/** Pairs of languages whose translations legitimately coincide. */
const RELATED = new Set(['es/pt-br', 'es/it', 'ru/uk', 'ja/zh-cn'])

/** Enough letters that two languages producing them by chance is not plausible. */
const MIN_COPIED_LETTERS = 8

/** Letters, in any script, once icons, brands, tokens and placeholders are gone. */
function letterCount(value: string): number {
  const stripped = value
    .replace(/\$\([a-z-]+\)/g, ' ')
    .replace(/\{\d+\}/g, ' ')
    .replace(/\b[A-Za-z]+-LE\b/g, ' ')
  return (stripped.match(/\p{L}/gu) ?? []).length
}

/** What is left of a value once brands, tokens and placeholders are gone. */
function translatableWords(value: string): string {
  return (
    value
      .replace(/\{\d+\}/g, ' ')
      .replace(/\b[A-Za-z]+-LE\b/gi, ' ')
      .replace(/\b[YMDHhmsS]+(?:[-/:.][YMDHhmsS]+)+\b/g, ' ')
      .replace(/[^A-Za-z]+/g, ' ')
      .trim()
      .split(' ')
      // An acronym (WCAG, RGB) is the same in every language.
      .filter(word => word.length >= 3 && word !== word.toUpperCase())
      .join(' ')
  )
}

export function findLocaleProblems(
  label: string,
  english: Catalogue | undefined,
  locales: Readonly<Record<string, Catalogue>>,
): readonly Finding[] {
  const found: Finding[] = []
  const names = Object.keys(locales).sort()
  const sourceOf = (key: string) => english?.[key] ?? key

  for (const locale of names) {
    const catalogue = locales[locale] as Catalogue
    for (const [key, value] of Object.entries(catalogue)) {
      const source = sourceOf(key)
      // Two words at least: one alone may be a cognate — "dates" is French
      // and "Index" German — while a phrase left in English is not.
      const words = translatableWords(source).split(' ').filter(Boolean)
      if (value.toLowerCase() === source.toLowerCase() && words.length >= 2) {
        found.push({ file: `${label}.${locale}`, key, value, problem: 'still English' })
      }
    }
  }

  for (let i = 0; i < names.length; i++) {
    for (const other of names.slice(i + 1)) {
      const locale = names[i] as string
      if (RELATED.has(`${locale}/${other}`)) continue
      const a = locales[locale] as Catalogue
      const b = locales[other] as Catalogue
      for (const [key, value] of Object.entries(a)) {
        if (value !== b[key] || letterCount(value) < MIN_COPIED_LETTERS) continue
        if (value.toLowerCase() === sourceOf(key).toLowerCase()) continue
        found.push({
          file: `${label}.${locale}`,
          key,
          value,
          problem: `identical to ${other}`,
        })
      }
    }
  }
  return found
}

function readLocales(dir: string, prefix: string): Record<string, Catalogue> {
  if (!existsSync(dir)) return {}
  const out: Record<string, Catalogue> = {}
  for (const file of readdirSync(dir)) {
    const match = new RegExp(`^${prefix.replace(/\./g, '\\.')}\\.([a-z-]+)\\.json$`).exec(file)
    if (match?.[1]) out[match[1]] = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  }
  return out
}

if (import.meta.main) {
  const root = process.argv[2] ?? '..'
  const problems: Finding[] = []
  for (const repo of REPOS) {
    const base = join(root, repo)
    const manifestEnglish = JSON.parse(readFileSync(join(base, 'package.nls.json'), 'utf8'))
    problems.push(
      ...findLocaleProblems(
        `${repo}/src/i18n/package.nls`,
        manifestEnglish,
        readLocales(join(base, 'src/i18n'), 'package.nls'),
      ),
      ...findLocaleProblems(
        `${repo}/l10n/bundle.l10n`,
        undefined,
        readLocales(join(base, 'l10n'), 'bundle.l10n'),
      ),
    )
  }
  if (problems.length > 0) {
    for (const p of problems) {
      console.error(
        `${p.file}: ${p.problem}: ${JSON.stringify(p.key)} = ${JSON.stringify(p.value)}`,
      )
    }
    console.error(`\n${problems.length} string(s) are not in their file's language.`)
    process.exit(1)
  }
  console.log(`Every translated string across ${REPOS.length} extensions is in its own language.`)
}
