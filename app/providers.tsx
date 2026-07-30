'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

// next-themes owns the theme class on <html>:
//   - attribute="class" toggles `.light`/`.dark` — the exact selectors
//     @heroui/styles keys its token blocks on.
//   - defaultTheme="system" + enableSystem: the site follows the OS
//     `prefers-color-scheme` until the header ThemeToggle records an
//     explicit choice (persisted by next-themes).
//   - its blocking inline script applies the class BEFORE first paint
//     (no theme flash); <html> carries `suppressHydrationWarning` because
//     that script mutates <html> before React hydrates.
export function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
