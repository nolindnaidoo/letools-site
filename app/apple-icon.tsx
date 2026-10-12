import { ImageResponse } from 'next/og'
import { logoDataUri } from '@/lib/brand-image'

// The mark at Apple touch-icon size, on a ground of its own. iOS paints a
// transparent icon black, which swallows the mark's dark outline, and rounds
// the corners itself, so the ground fills the full square. The hex is literal
// because Satori cannot read CSS custom properties: it is the light-scheme
// `--background` from globals.css in sRGB, as in `THEME_COLORS`.
export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const MARK = 148

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fbfaf7',
      }}
    >
      <img src={logoDataUri()} alt="" width={MARK} height={MARK} />
    </div>,
    { ...size },
  )
}
