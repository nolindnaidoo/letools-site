'use client'

import { useState } from 'react'
import { reportError } from '@/lib/error'
import { Button } from '@/ui/button'

// A copyable one-line command. HeroUI v3 has no Snippet primitive; this is
// the house version: mono text in a field-styled row plus a copy Button.
export function CommandSnippet({ command }: { readonly command: string }) {
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setHasCopied(true)
        setTimeout(() => setHasCopied(false), 1600)
      })
      .catch(error => reportError(error, { source: 'command-snippet' }))
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
      <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">{command}</code>
      <Button variant="ghost" size="sm" onPress={handleCopy}>
        {hasCopied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}
