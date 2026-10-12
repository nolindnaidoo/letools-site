import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HEADER_LOGO, LOGO_SOURCE, MANIFEST_ICONS } from './brand'
import { logoDataUri } from './brand-image'

/** Width and height from a PNG's header, or nothing when the file is not a PNG. */
function pngSize(path: string): { width: number; height: number } | undefined {
  const file = readFileSync(path)
  if (file.subarray(1, 4).toString('latin1') !== 'PNG') return undefined
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
}

describe('the brand files', () => {
  it.each([HEADER_LOGO, ...MANIFEST_ICONS])('$src is a square PNG of the size it claims', icon => {
    expect(pngSize(`public${icon.src}`)).toEqual({ width: icon.size, height: icon.size })
  })

  it('offers a launcher the two sizes a manifest is expected to carry', () => {
    expect(MANIFEST_ICONS.map(icon => icon.size)).toEqual([192, 512])
  })

  it('ships a favicon.ico that is an icon file', () => {
    // Reserved word, then type 1: an ICO, not a renamed PNG.
    expect([...readFileSync('app/favicon.ico').subarray(0, 4)]).toEqual([0, 0, 1, 0])
  })

  it('draws the generated images from the largest export', () => {
    expect(existsSync(LOGO_SOURCE)).toBe(true)
    expect(LOGO_SOURCE).toBe(`public${MANIFEST_ICONS.at(-1)?.src}`)
    expect(logoDataUri()).toMatch(/^data:image\/png;base64,iVBOR/)
  })
})
