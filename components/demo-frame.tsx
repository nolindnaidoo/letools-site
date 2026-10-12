'use client'

import { useState } from 'react'
import { demoSrc, posterSrc, type Tool } from '@/lib/tools'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

/**
 * A tool's recording, in an editor-window frame.
 *
 * The recording plays by default: it is the one thing on the page that shows
 * the tool doing its job. Under `prefers-reduced-motion` the same first frame
 * is shown as a still — a looping clip is precisely what that preference exists
 * to prevent (WCAG 2.2.2), and the poster is authored to match the GIF.
 *
 * The button stops it for everyone else. A clip that loops beside text has to
 * be stoppable whatever the preference says, and it is also how a reader who
 * asked for stillness plays it once on purpose.
 *
 * `priority` is for the one frame above the fold: it is the largest paint on
 * the page, and lazy-loading it costs a round trip before anything moves.
 * `data-demo` is what the motion e2e locates, so the alt text can describe the
 * tool rather than end in a keyword.
 */
export function DemoFrame({
  tool,
  priority = false,
  className = '',
}: {
  readonly tool: Tool
  readonly priority?: boolean
  readonly className?: string
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  // Unset until the reader chooses, so the preference decides until then.
  const [chosen, setChosen] = useState<boolean | undefined>(undefined)
  const isPlaying = chosen ?? !prefersReducedMotion
  const demo = demoSrc(tool)
  const poster = posterSrc(tool)
  if (demo === undefined || poster === undefined) return null

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-surface ${className}`}
    >
      <img
        src={isPlaying ? demo : poster}
        alt={`${tool.name} in use: ${tool.summary}`}
        // Poster dimensions; the GIF is authored to match. Stated so the frame
        // holds its height before the bytes arrive.
        width={800}
        height={506}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        data-demo={tool.id}
        className="h-auto w-full rounded-[calc(var(--radius-lg)-2px)]"
        style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover' }}
      />
      <button
        type="button"
        onClick={() => setChosen(!isPlaying)}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} the ${tool.name} demo`}
        className="absolute right-3 bottom-3 rounded border border-border bg-surface px-2.5 py-1 text-foreground text-xs"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
