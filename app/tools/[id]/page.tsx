import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolChannels } from '@/features/tool/tool-channels'
import { ToolCommands } from '@/features/tool/tool-commands'
import { ToolHero } from '@/features/tool/tool-hero'
import { ToolInstall } from '@/features/tool/tool-install'
import { ToolLinks } from '@/features/tool/tool-links'
import { ToolOverview } from '@/features/tool/tool-overview'
import { ToolSiblings } from '@/features/tool/tool-siblings'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { factsFor, findTool, githubUrl, iconSrc, TOOLS, type Tool, toolPath } from '@/lib/tools'

// Static export: every tool page is emitted at build time from the registry,
// so a new tool is still one entry in lib/tools.ts and nothing else.
export function generateStaticParams() {
  return TOOLS.map(tool => ({ id: tool.id }))
}

type Params = { readonly params: Promise<{ readonly id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const tool = findTool(id)
  if (!tool) return {}

  const url = `${SITE_URL}${toolPath(tool)}`

  return {
    title: tool.name,
    description: tool.summary,
    // Without this every tool page inherits the site canonical and they
    // compete with each other for the same one.
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${tool.name} — ${SITE_NAME}`,
      description: tool.summary,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — ${SITE_NAME}`,
      description: tool.summary,
    },
  }
}

// Structured data. Claims stay provable: a price of 0 and an MIT licence are
// facts, so they are stated; there is no rating data, so no aggregateRating —
// inventing one is the kind of thing that gets rich results revoked.
function structuredData(tool: Tool) {
  // Version and image are stated only where they exist. A tool whose extension
  // is still to be written has no manifest version and no icon copied from it,
  // and emitting an empty string for either is worse than omitting the
  // property — a crawler reads it as a claim rather than as an absence.
  const version = factsFor(tool).version
  const icon = iconSrc(tool)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.summary,
        url: `${SITE_URL}${toolPath(tool)}`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        ...(version === undefined ? {} : { softwareVersion: version }),
        license: 'https://opensource.org/licenses/MIT',
        ...(icon === undefined ? {} : { image: `${SITE_URL}${icon}` }),
        codeRepository: githubUrl(tool),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: 'nolindnaidoo', url: 'https://github.com/nolindnaidoo' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.name,
            item: `${SITE_URL}${toolPath(tool)}`,
          },
        ],
      },
    ],
  }
}

export default async function ToolPage({ params }: Params) {
  const { id } = await params
  const tool = findTool(id)
  if (!tool) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        // Values come from the registry, not user input; JSON.stringify of a
        // literal object cannot inject markup here.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has no other injection point
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(tool)) }}
      />
      <ToolHero tool={tool} />
      <ToolOverview tool={tool} />
      <ToolCommands tool={tool} />
      <ToolInstall tool={tool} />
      <ToolChannels tool={tool} />
      <ToolLinks tool={tool} />
      <ToolSiblings tool={tool} />
    </>
  )
}
