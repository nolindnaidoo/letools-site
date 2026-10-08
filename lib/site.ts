import { displayInstalls } from './install-count'

export const SITE_URL = 'https://letools.dev'
export const SITE_NAME = 'LE Tools'
/**
 * The header wordmark — the long form, spelled out.
 *
 * "LE" means nothing to a first-time visitor, and the header was the one place
 * that could say so without costing anything. Separate from SITE_NAME on
 * purpose: titles, OG cards and breadcrumbs stay short, because a 24-character
 * name in a `%s — ` template truncates in a tab strip and a search result.
 */
export const WORDMARK = 'Limited Edition DevTools'
export const TAGLINE = 'Get your data right before the model sees it.'

// Combined Open VSX downloads + VS Code Marketplace acquisitions across the
// published extensions, rounded DOWN to the ten thousand. `next.config.ts`
// measures it once per build and passes it in here, so every deploy shows the
// current figure. Outside a build, and when neither registry answers, this is
// the floor in `lib/install-count.ts`.
export const INSTALL_COUNT = displayInstalls(Number(process.env.LETOOLS_INSTALLS))
export const PUBLISHER = 'nolindnaidoo'
/** The author's own site. Kept alongside GITHUB_URL, never in place of it —
 * both are properties in the same identity network, and swapping one for the
 * other trades a backlink rather than adding one. */
export const AUTHOR_URL = 'https://nolindnaidoo.com'

export const GITHUB_URL = `https://github.com/${PUBLISHER}`

// Open VSX and the Marketplace are separate registries that happen to use the
// same name. It stays its own constant because the two have differed before:
// on Open VSX the namespace IS the extension id, and for a long while it was
// not the Marketplace publisher.
export const OPENVSX_NAMESPACE = PUBLISHER

// Mirrors of @heroui/styles `--background` in each scheme, as literals —
// the browser-chrome theme-color meta cannot read CSS custom properties.
export const THEME_COLORS = {
  light: '#ffffff',
  dark: '#000000',
} as const
