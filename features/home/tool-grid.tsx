'use client'

import {
  CATEGORIES,
  type CategoryId,
  githubUrl,
  marketplaceUrl,
  openVsxUrl,
  TOOLS,
  type Tool,
} from '@/lib/tools'
import { Card } from '@/ui/card'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'
import { Tabs } from '@/ui/tabs'

// Everything category-flavored keys off this table — tile wash, chip color,
// label. Colors are HeroUI semantic chip colors, not custom hexes.
const CATEGORY_STYLE = {
  extract: { chip: 'accent', tile: 'bg-accent-soft text-accent-soft-foreground' },
  check: { chip: 'warning', tile: 'bg-warning-soft text-warning-soft-foreground' },
  guard: { chip: 'success', tile: 'bg-success-soft text-success-soft-foreground' },
} as const

function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find(category => category.id === id)?.label ?? id
}

function ToolCard({ tool }: { readonly tool: Tool }) {
  const style = CATEGORY_STYLE[tool.category]

  return (
    <Card variant="secondary" className="flex flex-col gap-1 transition-shadow hover:shadow-md">
      <Card.Header className="flex-row items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${style.tile}`}
        >
          {tool.monogram}
        </span>
        <div className="flex flex-1 items-center justify-between gap-2">
          <Card.Title>{tool.name}</Card.Title>
          <Chip size="sm" variant="soft" color={style.chip}>
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
