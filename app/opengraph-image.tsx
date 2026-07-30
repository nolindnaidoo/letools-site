import { ImageResponse } from 'next/og'
import { SITE_NAME, TAGLINE } from '@/lib/site'

// The share card: LE tile + site name + tagline on the dark canvas.
// Hexes are literal (Satori cannot read CSS custom properties) and mirror
// the dark-scheme HeroUI tokens. Emitted as a static PNG at build time.
export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${SITE_NAME} — ${TAGLINE}`

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 28,
        background: '#000000',
        color: '#fafafa',
        padding: 96,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#3178e6',
            borderRadius: 18,
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          LE
        </div>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.1,
          maxWidth: 900,
        }}
      >
        {TAGLINE}
      </div>
      <div style={{ display: 'flex', fontSize: 30, color: '#a1a1aa' }}>
        Ten free, single-purpose VS Code extensions · letools.dev
      </div>
    </div>,
    { ...size },
  )
}
