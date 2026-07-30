'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/ui/button'

// Sun/moon toggle: the site follows the OS until the first click, then the
// explicit choice persists (next-themes localStorage). The server cannot
// know the resolved theme under static export, so an inert placeholder
// renders until mount — same footprint, no hydration mismatch.

function SunIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1m11.95-4.95-1.06 1.06M4.11 11.89l-1.06 1.06m9.9 0-1.06-1.06M4.11 4.11 3.05 3.05"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) {
    return (
      <Button variant="ghost" isIconOnly aria-label="Toggle theme" isDisabled>
        <MoonIcon />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      isIconOnly
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
