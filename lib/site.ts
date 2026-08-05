export const SITE_URL = 'https://letools.dev'
export const SITE_NAME = 'LE Tools'
export const TAGLINE = 'Ten tools. One job each. Zero hassle.'

// Combined Open VSX downloads + VS Code Marketplace acquisitions across all
// ten tools. Hardcoded and rounded DOWN, because Marketplace acquisitions are
// publisher-dashboard only — no public API exposes them, so this cannot be
// derived at build time. Last measured 2026-08-04: 71,052 Open VSX +
// 4,564 Marketplace = 75,616. Re-measure before raising it.
export const INSTALL_COUNT = '75,000+'
export const PUBLISHER = 'nolindnaidoo'
/** The author's own site. Kept alongside GITHUB_URL, never in place of it —
 * both are properties in the same identity network, and swapping one for the
 * other trades a backlink rather than adding one. */
export const AUTHOR_URL = 'https://nolindnaidoo.com'

export const GITHUB_URL = `https://github.com/${PUBLISHER}`

// Open VSX still publishes under the old namespace. On that registry the
// namespace IS the extension id, so these links cannot move until the rename
// (EclipseFdn/open-vsx.org#12345) is actioned — pointing them at
// `nolindnaidoo` early gives ten dead links, because that namespace is empty.
// Change this to PUBLISHER on the day the rename lands.
export const OPENVSX_NAMESPACE = 'OffensiveEdge'

// Mirrors of @heroui/styles `--background` in each scheme, as literals —
// the browser-chrome theme-color meta cannot read CSS custom properties.
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#000000',
} as const
