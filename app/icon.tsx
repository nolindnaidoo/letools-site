import { ImageResponse } from 'next/og'
import { logoDataUri } from '@/lib/brand-image'

// The tab icon is the site's own mark, on a transparent ground so it sits on
// a light tab strip and a dark one alike. `app/favicon.ico` beside this is the
// same mark for a browser that asks for the .ico by name.
// Emitted as a static PNG at build time.
export const dynamic = 'force-static'
export const size = { width: 96, height: 96 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <img src={logoDataUri()} alt="" width={size.width} height={size.height} />,
    { ...size },
  )
}
