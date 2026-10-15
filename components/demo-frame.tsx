'use client'

import { useEffect, useRef, useState } from 'react'
import { reportError } from '@/lib/error'
import { demoSrc, posterSrc, type Tool } from '@/lib/tools'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

/**
 * A tool's recording, in an editor-window frame.
 *
 * The recording plays by default: it is the one thing on the page that shows
 * the tool doing its job. Under `prefers-reduced-motion` it stays on its
 * poster, the first frame — a looping clip is precisely what that preference
 * exists to prevent (WCAG 2.2.2).
 *
 * The button stops it for everyone else. A clip that loops beside text has to
 * be stoppable whatever the preference says, and it is also how a reader who
 * asked for stillness plays it on purpose.
 *
 * Playing is started from code and never by `autoPlay`. The preference is only
 * known after mount, and an `autoPlay` attribute would start the clip in the
 * server-rendered page before the preference could hold it.
 *
 * `priority` is for the one frame above the fold: it is the largest paint on
 * the page, so its bytes are fetched at once. `data-demo` is what the e2e
 * locates, so the label can describe the tool rather than end in a keyword.
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
  const video = useRef<HTMLVideoElement>(null)
  const demo = demoSrc(tool)
  const poster = posterSrc(tool)

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (!isPlaying) {
      element.pause()
      return
    }
    element.play().catch(error => reportError(error, { source: 'demo-frame' }))
  }, [isPlaying])

  if (demo === undefined || poster === undefined) return null

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-surface ${className}`}
    >
      <video
        ref={video}
        src={demo}
        poster={poster}
        aria-label={`${tool.name} in use: ${tool.summary}`}
        muted
        loop
        playsInline
        // The master's own size, so the frame holds its height before the bytes arrive.
        width={1600}
        height={1000}
        preload={priority ? 'auto' : 'metadata'}
        data-demo={tool.id}
        data-playing={isPlaying}
        className="h-auto w-full rounded-[calc(var(--radius-lg)-2px)]"
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
