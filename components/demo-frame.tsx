'use client'

import { useEffect, useRef, useState } from 'react'
import { reportError } from '@/lib/error'
import { DEMO_SURFACES, type DemoSurface, demoSrc, posterSrc, type Tool } from '@/lib/tools'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { Tabs } from '@/ui/tabs'

const LABELS = Object.freeze({
  editor: 'Editor',
  cli: 'CLI',
  mcp: 'MCP',
} as const satisfies Record<DemoSurface, string>)

const SHOWS = Object.freeze({
  editor: 'in VS Code',
  cli: 'in a terminal',
  mcp: 'called by an agent over MCP',
} as const satisfies Record<DemoSurface, string>)

/**
 * A tool's recordings, one per surface, in an editor-window frame.
 *
 * The recording plays by default: it is the one thing on the page that shows
 * the tool doing its job. Under `prefers-reduced-motion` it stays on its
 * poster, the first frame — a looping clip is precisely what that preference
 * exists to prevent (WCAG 2.2.2).
 *
 * The button stops it for everyone else. A clip that loops beside text has to
 * be stoppable whatever the preference says, and it is also how a reader who
 * asked for stillness plays it on purpose. The choice holds across the tabs.
 *
 * Playing is started from code and never by `autoPlay`. The preference is only
 * known after mount, and an `autoPlay` attribute would start the clip in the
 * server-rendered page before the preference could hold it.
 *
 * A tab renders only while it is selected, so only the recording in view is
 * fetched. `priority` is for the frame above the fold: the editor take is the
 * largest paint on the page, so its bytes are fetched at once. `data-demo` is
 * what the e2e locates, so the label can describe the tool.
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
  const surfaces = DEMO_SURFACES.filter(surface => demoSrc(tool, surface) !== undefined)
  const [first] = surfaces
  if (first === undefined) return null

  return (
    <div className={className}>
      <Tabs defaultSelectedKey={first}>
        <Tabs.ListContainer className="mb-3">
          <Tabs.List aria-label={`${tool.name} demo`}>
            {surfaces.map(surface => (
              <Tabs.Tab key={surface} id={surface}>
                {LABELS[surface]}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {surfaces.map(surface => (
          <Tabs.Panel key={surface} id={surface}>
            <Recording
              tool={tool}
              surface={surface}
              isPlaying={isPlaying}
              onToggle={() => setChosen(!isPlaying)}
              priority={priority && surface === first}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  )
}

function Recording({
  tool,
  surface,
  isPlaying,
  onToggle,
  priority,
}: {
  readonly tool: Tool
  readonly surface: DemoSurface
  readonly isPlaying: boolean
  readonly onToggle: () => void
  readonly priority: boolean
}) {
  const video = useRef<HTMLVideoElement>(null)
  const demo = demoSrc(tool, surface)
  const poster = posterSrc(tool, surface)

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
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-surface">
      <video
        ref={video}
        src={demo}
        poster={poster}
        aria-label={`${tool.name} ${SHOWS[surface]}: ${tool.summary}`}
        muted
        loop
        playsInline
        // The master's own size, so the frame holds its height before the bytes arrive.
        width={1600}
        height={1000}
        preload={priority ? 'auto' : 'metadata'}
        data-demo={tool.id}
        data-surface={surface}
        data-playing={isPlaying}
        className="h-auto w-full rounded-[calc(var(--radius-lg)-2px)]"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} the ${tool.name} demo`}
        className="absolute right-3 bottom-3 rounded border border-border bg-surface px-2.5 py-1 text-foreground text-xs"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}
