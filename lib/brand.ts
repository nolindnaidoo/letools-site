/**
 * The mark, and every file it ships as.
 *
 * The files under `public/brand/` are the owner's exports, copied in and
 * never redrawn here, bar the header's crop below. Each is listed with the size it claims, and a test reads
 * that size back out of the file, because a manifest that names a 512px icon
 * the server answers with something else is wrong where nothing reports it:
 * on someone's home screen.
 *
 * All of them are the mark on a transparent ground. That is right for a tab
 * and wrong for an iOS home screen, which paints transparency black, so the
 * Apple icon is composed on a ground of its own in `app/apple-icon.tsx`.
 */

export type BrandIcon = Readonly<{ src: string; size: number }>

/**
 * Beside the wordmark. The one file that is not an export as supplied: it is
 * the source cropped to the mark, because the exports carry a wide transparent
 * margin and at header size the margin left the mark too small to read. Drawn
 * far smaller than it is, so it stays sharp at any density.
 */
export const HEADER_LOGO: BrandIcon = { src: '/brand/logo-mark-128.png', size: 128 }

/** What the web manifest offers a launcher or a home screen. */
export const MANIFEST_ICONS: readonly BrandIcon[] = Object.freeze([
  { src: '/brand/logo-192.png', size: 192 },
  { src: '/brand/logo-512.png', size: 512 },
])

/** The largest export, which the generated images are drawn from. */
export const LOGO_SOURCE = 'public/brand/logo-512.png'
