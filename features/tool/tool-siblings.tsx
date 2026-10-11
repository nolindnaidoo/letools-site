import { SectionHeading } from '@/components/section-heading'
import { ToolIcon } from '@/components/tool-icon'
import { TOOLS, type Tool, toolPath } from '@/lib/tools'
import { Link } from '@/ui/link'

// The reason this site exists: someone arrives knowing one tool and leaves
// knowing there are fifteen more. On a tool page that job falls to this
// section, and these are the only internal links a crawler can follow between
// pages. The count is derived, because it was written out as a word and stayed
// wrong for as long as the family kept growing.
export function ToolSiblings({ tool }: { readonly tool: Tool }) {
  const siblings = TOOLS.filter(other => other.id !== tool.id)

  return (
    <section className="wrap py-12 sm:py-16">
      <SectionHeading eyebrow="The family" title={`The other ${siblings.length}`} />

      <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {siblings.map(sibling => (
          <li
            key={sibling.id}
            className="-mx-3 flex items-start gap-3 rounded px-3 py-3 transition-colors hover:bg-surface-secondary"
          >
            <ToolIcon tool={sibling} size={32} className="shrink-0 rounded" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link href={toolPath(sibling)} className="w-fit font-semibold text-foreground">
                {sibling.name}
              </Link>
              <p className="text-pretty text-muted text-sm">{sibling.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
