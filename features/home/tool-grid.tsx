'use client'

import {
  CATEGORIES,
  type CategoryId,
  demoSrc,
  githubUrl,
  iconSrc,
  marketplaceUrl,
  openVsxUrl,
  TOOLS,
  type Tool,
} from '@/lib/tools'
import { Card } from '@/ui/card'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'
import { Tabs } from '@/ui/tabs'
import { Tooltip } from '@/ui/tooltip'

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
  return (
    // The whole card is the tooltip trigger: hover (or focus) pops the
    // tool's demo gif. Content mounts on first open, so the gif is not
    // fetched until someone actually hovers.
    <Tooltip delay={350} closeDelay={100}>
      <Tooltip.Trigger className="h-full">
        <Card
          variant="secondary"
          className="flex h-full flex-col gap-1 transition-shadow hover:shadow-md"
        >
          <Card.Header className="flex-row items-center gap-3">
            <img
              src={iconSrc(tool)}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="size-10 shrink-0 rounded-xl"
            />
            <div className="flex flex-1 items-center justify-between gap-2">
              <Card.Title>{tool.name}</Card.Title>
              <Chip size="sm" variant="soft" color={CATEGORY_CHIP[tool.category]}>
                {categoryLabel(tool.category)}
              </Chip>
            </div>
          </Card.Header>
          <Card.Content>
            <Card.Description className="text-pretty">{tool.summary}</Card.Description>
          </Card.Content>
          <Card.Footer className="mt-auto gap-4 text-sm">
            <Link href={marketplaceUrl(tool)} target="_blank" rel="noreferrer">
              VS Code
            </Link>
            <Link href={openVsxUrl(tool)} target="_blank" rel="noreferrer">
              Open VSX
            </Link>
            <Link href={githubUrl(tool)} target="_blank" rel="noreferrer">
              GitHub
            </Link>
          </Card.Footer>
        </Card>
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-none p-2">
        <img
          src={demoSrc(tool)}
          alt={`${tool.name} demo`}
          width={480}
          className="h-auto w-[min(480px,80vw)] rounded-lg"
        />
      </Tooltip.Content>
    </Tooltip>
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
        <p className="text-muted">Ten extensions, each with one job. Install only what you need.</p>
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
