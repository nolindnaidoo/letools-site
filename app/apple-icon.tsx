import { ImageResponse } from 'next/og'

// Same LE mark at Apple touch-icon size; iOS rounds the corners itself,
// so the tile fills the full square.
export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#3178e6',
        color: '#ffffff',
        fontSize: 84,
        fontWeight: 700,
        letterSpacing: -3,
      }}
    >
      LE
    </div>,
    { ...size },
  )
}
