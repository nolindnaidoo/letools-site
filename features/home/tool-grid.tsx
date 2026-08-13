'use client'

import { ToolIcon } from '@/components/tool-icon'
import {
  CATEGORIES,
  type CategoryId,
  demoSrc,
  extensionPending,
  githubUrl,
  marketplaceUrl,
  npmUrl,
  openVsxUrl,
  posterSrc,
  TOOLS,
  type Tool,
  toolPath,
} from '@/lib/tools'
import { transcriptFor } from '@/lib/transcripts'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { Card } from '@/ui/card'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'
import { Tabs } from '@/ui/tabs'

// Chip color per category — HeroUI semantic colors, not custom hexes.
const CATEGORY_CHIP = {
  extract: 'accent',
  check: 'warning',
  guard: 'success',
} as const

function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find(category => category.id === id)?.label ?? id
}

function ToolCard({ tool }: { readonly tool: Tool }) {
  /**
   * The demo IS the card face, and every one of them plays.
   *
   * They used to animate only on hover, which meant the grid read as a wall of
   * screenshots and the thing each tool actually does was one deliberate
   * gesture away — on a touch screen, unreachable.
   *
   * The cost is real: ten clips is about 8 MB. `loading="lazy"` keeps the
   * offscreen ones off the wire until they are scrolled toward, so the first
   * paint pays for the two or three rows that are visible, not the lot.
   *
   * Under `prefers-reduced-motion` every card stays on its poster. That is not
   * a nicety — ten looping animations is precisely what the preference exists
   * to prevent (WCAG 2.2.2), and the posters are the same first frame.
   */
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldAnimate = !prefersReducedMotion
  const face = shouldAnimate ? demoSrc(tool) : posterSrc(tool)
  // No recording exists for a tool whose extension is still to be written —
  // there is no editor screen to record. The command it answers to is the
  // honest card face until there is.
  const transcript = transcriptFor(tool)

  return (
    <Card
      variant="secondary"
      className="group flex h-full flex-col gap-1 transition-shadow hover:shadow-lg"
    >
      <div className="relative overflow-hidden rounded-xl border border-border">
        {face !== undefined ? (
          <img
            src={face}
            alt={`${tool.name} demo`}
            width={800}
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover object-top"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col justify-center gap-2 bg-surface px-4">
            <code className="font-mono text-sm">
              <span aria-hidden="true" className="text-muted">
                ${' '}
              </span>
              {transcript?.command ?? `${tool.id} --help`}
            </code>
            <span className="text-xs text-muted">
              Terminal and MCP today — the editor extension is being written.
            </span>
          </div>
        )}
        <Chip
          size="sm"
          variant="soft"
          color={CATEGORY_CHIP[tool.category]}
          className="absolute right-2 top-2 backdrop-blur"
        >
          {categoryLabel(tool.category)}
        </Chip>
      </div>

      <Card.Header className="flex-row items-center gap-3 pt-3">
        <ToolIcon tool={tool} size={36} className="rounded-lg" />
        <Card.Title>
          <Link href={toolPath(tool)}>{tool.name}</Link>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <Card.Description className="text-pretty">{tool.summary}</Card.Description>
      </Card.Content>
      {/* The three editor and npm links exist only once the extension does;
          rendering them early is three dead links per card. */}
      <Card.Footer className="mt-auto gap-4 text-sm">
        <Link href={toolPath(tool)} aria-label={`${tool.name} details`} className="py-2">
          Details
        </Link>
        {extensionPending(tool) ? null : (
          <>
            <Link
              href={marketplaceUrl(tool)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} on the VS Code Marketplace (opens in new tab)`}
              className="py-2"
            >
              VS Code
            </Link>
            <Link
              href={openVsxUrl(tool)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} on Open VSX (opens in new tab)`}
              className="py-2"
            >
              Open VSX
            </Link>
            <Link
              href={npmUrl(tool)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} MCP server on npm (opens in new tab)`}
              className="py-2"
            >
              MCP
            </Link>
          </>
        )}
        <Link
          href={githubUrl(tool)}
          target="_blank"
          rel="noreferrer"
          aria-label={`${tool.name} on GitHub (opens in new tab)`}
          className="py-2"
        >
          GitHub
        </Link>
      </Card.Footer>
    </Card>
  )
}

function ToolCards({ tools }: { readonly tools: readonly Tool[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}

export function ToolGrid() {
  return (
    <section id="tools" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">The tools</h2>
        <p className="text-muted">
          {TOOLS.length} tools, each with one job. Install only what you need.
        </p>
      </div>

      <Tabs defaultSelectedKey="all">
        <Tabs.ListContainer className="mb-6">
          <Tabs.List aria-label="Filter tools by category">
            <Tabs.Tab id="all">
              All
              <Tabs.Indicator />
            </Tabs.Tab>
            {CATEGORIES.map(category => (
              <Tabs.Tab key={category.id} id={category.id}>
                {category.label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="all">
          <ToolCards tools={TOOLS} />
        </Tabs.Panel>
        {CATEGORIES.map(category => (
          <Tabs.Panel key={category.id} id={category.id}>
            <ToolCards tools={TOOLS.filter(tool => tool.category === category.id)} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  )
}
