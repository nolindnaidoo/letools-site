import { ImageResponse } from 'next/og'
import { logoDataUri } from '@/lib/brand-image'
import { SITE_NAME, TAGLINE } from '@/lib/site'
import { FAMILY_SIZE } from '@/lib/tools'

// The share card: the mark + site name + tagline on the dark canvas.
// Hexes are literal (Satori cannot read CSS custom properties) and mirror
// the dark-scheme tokens in globals.css in sRGB. Emitted as a static PNG at build time.
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
        background: '#090b0f',
        color: '#f3f2ef',
        padding: 96,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <img src={logoDataUri()} alt="" width={84} height={84} />
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
      <div style={{ display: 'flex', fontSize: 30, color: '#a0a5ac' }}>
        {FAMILY_SIZE} free, single-purpose devtools · letools.dev
      </div>
    </div>,
    { ...size },
  )
}
