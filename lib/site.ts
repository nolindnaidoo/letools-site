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
export const GITHUB_URL = `https://github.com/${PUBLISHER}`

// Mirrors of @heroui/styles `--background` in each scheme, as literals —
// the browser-chrome theme-color meta cannot read CSS custom properties.
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#000000',
} as const
