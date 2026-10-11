import { ImageResponse } from 'next/og'

// The favicon is the site's own mark: the LE monogram on the accent tile.
// Hexes are literal — Satori cannot read CSS custom properties; this is the
// light-scheme `--accent` from globals.css in sRGB.
// Emitted as a static PNG at build time.
export const dynamic = 'force-static'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#007778',
        borderRadius: 14,
        color: '#ffffff',
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      LE
    </div>,
    { ...size },
  )
}
