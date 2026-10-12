import type { MetadataRoute } from 'next'
import { MANIFEST_ICONS } from '@/lib/brand'
import { SITE_NAME, TAGLINE, THEME_COLORS } from '@/lib/site'

// What a launcher or a home screen needs to show this site: a name, a colour
// and the mark. `display: 'browser'` because this is a catalogue of pages, not
// an app: there is nothing to run offline and no reason to hide the address
// bar. The icons are `any`, never `maskable`: the mark is drawn to its edges
// on a transparent ground, and a mask would crop it.
// `output: export` has no runtime, so the route has to declare it is fully
// static or the build refuses to collect it.
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: TAGLINE,
    start_url: '/',
    display: 'browser',
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: MANIFEST_ICONS.map(icon => ({
      src: icon.src,
      sizes: `${icon.size}x${icon.size}`,
      type: 'image/png',
      purpose: 'any',
    })),
  }
}
