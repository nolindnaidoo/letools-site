'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error'

// Root boundary: replaces the entire document when the root layout itself
// crashes. No providers or tokens exist here, so it is deliberately
// dark-literal with inline styles — the one page that cannot theme.
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  useEffect(() => {
    reportError(error, { source: 'error-boundary.root' })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Something broke</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            The page failed to render. Reloading usually clears it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
