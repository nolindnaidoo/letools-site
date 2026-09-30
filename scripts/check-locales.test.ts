import { describe, expect, it } from 'vitest'
import { findLocaleProblems } from './check-locales'

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
