export const SITE_URL = 'https://letools.dev'
export const SITE_NAME = 'LE Tools'
export const TAGLINE = 'Ten tools. One job each. Zero hassle.'
export const PUBLISHER = 'nolindnaidoo'
export const GITHUB_URL = `https://github.com/${PUBLISHER}`

// Mirrors of @heroui/styles `--background` in each scheme, as literals —
// the browser-chrome theme-color meta cannot read CSS custom properties.
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#000000',
} as const
