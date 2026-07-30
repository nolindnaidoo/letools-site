'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error'
import { Button } from '@/ui/button'

// Segment error boundary: catches render errors below the root layout, so
// the header/footer chrome survives. Reset re-renders the segment.
export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  useEffect(() => {
    reportError(error, { source: 'error-boundary.segment' })
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">Something broke</h1>
      <p className="text-muted">
        A rendering error on this page — not your fault, and reloading usually clears it.
      </p>
      <Button variant="outline" onPress={reset}>
        Try again
      </Button>
    </div>
  )
}
