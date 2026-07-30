'use client'

import { useEffect, useRef, useState } from 'react'
import { reportError } from '@/lib/error'
import { Button } from '@/ui/button'

// A copyable one-line command. HeroUI v3 has no Snippet primitive; this is
// the house version: mono text in a field-styled row plus a copy Button.
// The status change is announced to screen readers via the live region.
export function CommandSnippet({ command }: { readonly command: string }) {
  const [hasCopied, setHasCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleCopy = () => {
    // Clipboard API is absent on non-secure origins and some embedders.
    if (!navigator.clipboard?.writeText) {
      reportError(new Error('Clipboard API unavailable'), { source: 'command-snippet' })
      return
    }

    navigator.clipboard
      .writeText(command)
      .then(() => {
        setHasCopied(true)
        clearTimeout(resetTimer.current)
        resetTimer.current = setTimeout(() => setHasCopied(false), 1600)
      })
      .catch(error => reportError(error, { source: 'command-snippet' }))
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
      <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">{command}</code>
      <Button
        variant="ghost"
        size="sm"
        onPress={handleCopy}
        aria-label={hasCopied ? 'Copied' : `Copy ${command}`}
      >
        {hasCopied ? 'Copied' : 'Copy'}
      </Button>
      <span role="status" className="sr-only">
        {hasCopied ? 'Command copied to clipboard' : ''}
      </span>
    </div>
  )
}
