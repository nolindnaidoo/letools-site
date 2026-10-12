import { SectionHeading } from '@/components/section-heading'
import { ToolIcon } from '@/components/tool-icon'
import { INSTALL_COUNT } from '@/lib/site'
import {
  CATEGORIES,
  type CategoryId,
  extensionPending,
  githubUrl,
  marketplaceUrl,
  npmUrl,
  openVsxUrl,
  TOOLS,
  type Tool,
  toolPath,
} from '@/lib/tools'
import { Link } from '@/ui/link'

/**
 * The tools, in the order the work happens.
 *
 * The three categories are the three steps, so they are the structure of the
 * section rather than a filter over a flat grid: a band per step, the step's
 * reason on the left, its tools on the right. Every line of the reasons has to
 * stay provable against the tool repos like any other claim.
 *
 * Rows, not cards. Seventeen cards with five equal links each was eighty-five
 * links of the same weight, and the thumbnails read as black rectangles at
 * that size. A row gives the name the weight and the links the margin.
 *
 * The whole row opens the tool's page, through the name's link stretched over
 * it, so there is still one link to that page and not a row wrapped in an
 * anchor with four more inside it. The registry links sit above the stretch as
 * a zone of their own: a click that just misses one does nothing, where it
 * would otherwise open the tool's page.
 */
const STEPS: Readonly<Record<CategoryId, { readonly title: string; readonly body: string }>> = {
  extract: {
    title: 'Get it out',
    body: 'Values are buried in structure — JSON, YAML, CSV, TOML, INI, .env. Pulling the ones you need is tedious enough that people write a throwaway script, or do it by hand and hope.',
  },
  check: {
    title: 'Check it',
    body: 'Are the dates real dates? Do the URLs resolve? Is that a valid colour, a valid path, a regex that matches what you think it matches? This is the step that gets skipped.',
  },
  guard: {
    title: 'Guard it',
    body: 'Nothing sensitive should be in the pile you are about to hand to a model or commit to a repo. Finding out afterwards is the expensive version.',
  },
}

function toolsIn(category: CategoryId): readonly Tool[] {
  return TOOLS.filter(tool => tool.category === category)
}

const LINK_CLASS = 'text-muted text-sm transition-colors hover:text-foreground'

function ToolRow({ tool }: { readonly tool: Tool }) {
  return (
    <li className="relative -mx-3 flex items-start gap-4 rounded px-3 py-5 transition-colors hover:bg-surface-secondary lg:items-center">
      <ToolIcon tool={tool} size={48} sizeLg={56} className="rounded" />

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={toolPath(tool)}
            className="static w-fit font-semibold text-foreground after:absolute after:inset-0 after:rounded after:content-['']"
          >
            {tool.name}
          </Link>
          <p className="text-pretty text-muted text-sm">{tool.summary}</p>
        </div>

        {/* The three editor and npm links exist only once the extension does;
            rendering them early is three dead links per row. */}
        <div className="relative z-10 flex flex-wrap gap-x-4 gap-y-1 sm:w-64 sm:shrink-0 sm:justify-end">
          {extensionPending(tool) ? null : (
            <>
              <Link
                href={npmUrl(tool)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tool.name} MCP server on npm (opens in new tab)`}
                className={LINK_CLASS}
              >
                MCP
              </Link>
              <Link
                href={openVsxUrl(tool)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tool.name} on Open VSX (opens in new tab)`}
                className={LINK_CLASS}
              >
                Open VSX
              </Link>
              <Link
                href={marketplaceUrl(tool)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tool.name} on the VS Code Marketplace (opens in new tab)`}
                className={LINK_CLASS}
              >
                VS Code
              </Link>
            </>
          )}
          <Link
            href={githubUrl(tool)}
            target="_blank"
            rel="noreferrer"
            aria-label={`${tool.name} on GitHub (opens in new tab)`}
            className={LINK_CLASS}
          >
            GitHub
          </Link>
        </div>
      </div>
    </li>
  )
}

export function Tools() {
  return (
    <section id="tools" className="wrap scroll-mt-20 py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <SectionHeading
          eyebrow="The tools"
          title="The work before the work."
          lede="Building anything real on top of a model starts with getting data into shape: pulling it out, checking it, and making sure nothing sensitive came along. That part is manual, repetitive, and almost never shown — so it gets done by hand, in a hurry, and the output is trusted because nobody has time to verify it."
          className="lg:col-span-7"
        />
        <p className="text-pretty text-muted lg:col-span-5 lg:pt-9">
          These are the steps, each one command, each one engineered rather than improvised:
          deterministic output, large files streamed rather than loaded whole, and behaviour pinned
          by tests so the result is the same tomorrow. {INSTALL_COUNT} installs later, that is still
          the whole idea.
        </p>
      </div>

      <nav
        aria-label="Tool categories"
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-border border-y py-3 font-mono text-sm"
      >
        {CATEGORIES.map(category => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="flex items-baseline gap-2 text-foreground transition-colors hover:text-accent-soft-foreground"
          >
            {category.label}
            <span className="text-muted text-xs">{toolsIn(category.id).length}</span>
          </a>
        ))}
      </nav>

      {CATEGORIES.map((category, index) => {
        const step = STEPS[category.id]
        return (
          <div
            key={category.id}
            id={category.id}
            className="grid grid-cols-1 scroll-mt-20 gap-6 border-border border-b py-10 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
              <p className="font-mono text-muted text-xs uppercase tracking-[0.18em]">
                {String(index + 1).padStart(2, '0')} · {category.label}
              </p>
              <h3 className="mt-3 font-semibold text-2xl tracking-tight">{step.title}</h3>
              <p className="mt-3 text-pretty text-muted">{step.body}</p>
            </div>

            <ul className="divide-y divide-border lg:col-span-8">
              {toolsIn(category.id).map(tool => (
                <ToolRow key={tool.id} tool={tool} />
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
