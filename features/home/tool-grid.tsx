'use client'

import { useState } from 'react'
import {
  CATEGORIES,
  type CategoryId,
  demoSrc,
  githubUrl,
  iconSrc,
  marketplaceUrl,
  openVsxUrl,
  posterSrc,
  TOOLS,
  type Tool,
} from '@/lib/tools'
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
  // The demo IS the card face: a static first frame by default, swapped
  // for the animated gif while the card is hovered or focused — so the
  // heavy gifs only download for tools someone actually looks at.
  const [isActive, setIsActive] = useState(false)

  return (
    <Card
      variant="secondary"
      className="group flex h-full flex-col gap-1 transition-shadow hover:shadow-lg"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src={isActive ? demoSrc(tool) : posterSrc(tool)}
          alt={`${tool.name} demo`}
          width={800}
          loading="lazy"
          className="aspect-video w-full object-cover object-top"
        />
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
        <img
          src={iconSrc(tool)}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          className="size-9 shrink-0 rounded-lg"
        />
        <Card.Title>{tool.name}</Card.Title>
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
