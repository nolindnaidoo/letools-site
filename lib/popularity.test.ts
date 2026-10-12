import { describe, expect, it, vi } from 'vitest'
import { byDownloads, DOWNLOADS_FLOOR, downloadsOf, LEADS, parseMeasured } from './popularity'
import { TOOLS } from './tools'

const id = (value: string) => value

describe('byDownloads', () => {
  it('puts the leading tool first, then the most downloaded', () => {
    const ordered = byDownloads(
      TOOLS.map(tool => tool.id),
      id,
      {},
    )
    expect(ordered.slice(0, 4)).toEqual([LEADS, 'paths-le', 'string-le', 'envsync-le'])
    expect(ordered).toHaveLength(TOOLS.length)
  })

  it('orders a list the leading tool is not in by downloads alone', () => {
    expect(byDownloads(['units-le', 'regex-le', 'paths-le'], id, {})).toEqual([
      'paths-le',
      'regex-le',
      'units-le',
    ])
  })

  it('follows what the build measured once it passes the floor', () => {
    const measured = { 'units-le': 99_999 }
    expect(byDownloads(['paths-le', 'units-le'], id, measured)).toEqual(['units-le', 'paths-le'])
    expect(byDownloads([LEADS, 'units-le'], id, measured)[0]).toBe(LEADS)
  })

  it('keeps the order it was given for tools with no count, after those with one', () => {
    expect(byDownloads(['new-b', 'new-a', 'units-le'], id, {})).toEqual([
      'units-le',
      'new-b',
      'new-a',
    ])
  })

  it('does not reorder the list it was handed', () => {
    const given = Object.freeze(['units-le', 'paths-le'])
    byDownloads(given, id, {})
    expect(given).toEqual(['units-le', 'paths-le'])
  })
})

describe('downloadsOf', () => {
  it('never goes under the floor, since a download counter only goes up', () => {
    expect(downloadsOf('paths-le', { 'paths-le': 5 })).toBe(DOWNLOADS_FLOOR['paths-le'])
    expect(downloadsOf('paths-le', { 'paths-le': 'many' })).toBe(DOWNLOADS_FLOOR['paths-le'])
    expect(downloadsOf('no-such-le', {})).toBe(0)
  })

  it('names only tools the registry has', () => {
    const ids = new Set(TOOLS.map(tool => tool.id))
    for (const known of Object.keys(DOWNLOADS_FLOOR)) expect(ids.has(known), known).toBe(true)
  })
})

describe('parseMeasured', () => {
  it('reads the map the build passes in', () => {
    expect(parseMeasured('{"paths-le":30000}')).toEqual({ 'paths-le': 30_000 })
  })

  it.each([undefined, '', '[]', 'null', '7'])('treats %s as nothing measured', raw => {
    expect(parseMeasured(raw)).toEqual({})
  })

  it('reports text that is not JSON and measures nothing from it', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(parseMeasured('{')).toEqual({})
    expect(logged).toHaveBeenCalledTimes(1)
    logged.mockRestore()
  })
})
