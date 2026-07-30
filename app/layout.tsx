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
    'Ten free, single-purpose VS Code extensions that extract, check, and guard strings, numbers, paths, env keys, regexes, secrets, colors, URLs, and dates — all local, no network access, MIT.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: 'Ten free, single-purpose VS Code extensions — all local, no network access, MIT.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: 'Ten free, single-purpose VS Code extensions — all local, no network access, MIT.',
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
