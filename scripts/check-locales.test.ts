import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { checkRoot, findLocaleProblems } from './check-locales'

const english = { title: 'Open Settings', brand: 'Colors-LE', count: '{0} dates' }

describe('findLocaleProblems', () => {
  it('flags a phrase left in English and a catalogue copied from another', () => {
    const problems = findLocaleProblems('x', english, {
      it: { title: 'Buka Pengaturan', brand: 'Colors-LE', count: '{0} date' },
      id: { title: 'Buka Pengaturan', brand: 'Colors-LE', count: '{0} tanggal' },
      de: { title: 'Open settings', brand: 'Colors-LE', count: '{0} Daten' },
    })
    expect(problems.map(p => `${p.file} ${p.problem}`).sort()).toEqual([
      'x.de still English',
      'x.id identical to it',
    ])
  })

  it('allows a brand, a cognate, and languages that share words', () => {
    expect(
      findLocaleProblems('x', english, {
        fr: { title: 'Ouvrir les paramètres', brand: 'Colors-LE', count: '{0} dates' },
        es: { title: 'Abrir configuración', brand: 'Colors-LE', count: '{0} fechas' },
        'pt-br': { title: 'Abrir configuración', brand: 'Colors-LE', count: '{0} datas' },
      }),
    ).toEqual([])
  })
})

describe('findLocaleProblems edges', () => {
  it('uses the key as the English of a runtime bundle, and ignores short or icon-only matches', () => {
    expect(
      findLocaleProblems('x', undefined, {
        de: { 'Sort by length': 'Sort by length', '$(link) URLs-LE': '$(link) URLs-LE', OK: 'OK' },
        fr: {
          'Sort by length': 'Trier par longueur',
          '$(link) URLs-LE': '$(link) URLs-LE',
          OK: 'OK',
        },
      }).map(p => `${p.file} ${p.problem}`),
    ).toEqual(['x.de still English'])
  })

  it('allows two locales to reorder the English names, and nothing more', () => {
    const names = { mongo: 'MongoDB ObjectIds', flake: 'Snowflake IDs' }
    expect(
      findLocaleProblems('x', names, {
        fr: { mongo: 'ObjectId MongoDB', flake: 'Identifiants Snowflake' },
        id: { mongo: 'ObjectId MongoDB', flake: 'ID Snowflake' },
        vi: { mongo: 'ObjectId của MongoDB', flake: 'ID Snowflake' },
        de: { mongo: 'MongoDB-Kennungen', flake: 'Snowflake-Kennungen' },
        it: { mongo: 'Identificatori MongoDB', flake: 'Snowflake-Kennungen' },
      }).map(p => `${p.file} ${p.key} ${p.problem}`),
    ).toEqual(['x.de flake identical to it'])
  })

  it('reads a locale missing a key as no match rather than a copy', () => {
    expect(
      findLocaleProblems('x', english, {
        ru: { title: 'Открыть настройки' },
        uk: { title: 'Відкрити налаштування', count: '{0} дати' },
      }),
    ).toEqual([])
  })
})

describe('checkRoot', () => {
  const root = mkdtempSync(join(tmpdir(), 'check-locales-'))
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  const write = (path: string, value: unknown) => {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), JSON.stringify(value))
  }
  write('good/package.nls.json', { title: 'Open Settings' })
  write('good/src/i18n/package.nls.de.json', { title: 'Einstellungen öffnen' })
  write('good/l10n/bundle.l10n.de.json', { 'Sort by length': 'Nach Länge sortieren' })
  write('good/l10n/notes.txt.json', {})
  write('bad/package.nls.json', { title: 'Open Settings' })
  write('bad/src/i18n/package.nls.it.json', { title: 'Buka Pengaturan' })
  write('bad/src/i18n/package.nls.id.json', { title: 'Buka Pengaturan' })
  write('bad/l10n/bundle.l10n.fr.json', { 'Sort by length': 'Sort by length' })

  it('reads both catalogues of every repo it is given', () => {
    expect(checkRoot(root, ['good'])).toEqual([])
    expect(
      checkRoot(root, ['bad'])
        .map(p => `${p.file} ${p.problem}`)
        .sort(),
    ).toEqual([
      'bad/l10n/bundle.l10n.fr still English',
      'bad/src/i18n/package.nls.id identical to it',
    ])
  })
})
