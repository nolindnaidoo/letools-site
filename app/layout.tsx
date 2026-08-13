import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { fontHtmlClassName } from '@/app/fonts'
import { Providers } from '@/app/providers'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_NAME, SITE_URL, TAGLINE, THEME_COLORS } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Sixteen free, single-purpose devtools that extract, check, and guard strings, numbers, paths, units, ids, IP addresses, env keys, regexes, secrets, colors, URLs, dates, dependency versions, translations, and Unicode — local by default, MIT.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description:
      'Sixteen free, single-purpose devtools for VS Code, the terminal, and AI agents — local by default, MIT.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${TAGLINE}`,
    description:
      'Sixteen free, single-purpose devtools for VS Code, the terminal, and AI agents — local by default, MIT.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
}

// suppressHydrationWarning: next-themes mutates <html>'s class before React
// hydrates (its pre-paint script), so the server-emitted attribute won't match.
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" id="top" className={fontHtmlClassName} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
