import { SectionHeading } from '@/components/section-heading'
import type { Tool } from '@/lib/tools'

// The page's substance, and the only prose a search engine has to work with —
// the summary alone is one line and ranks for nothing. Copy lives in the
// registry so it stays checkable against the extension repo.
export function ToolOverview({ tool }: { readonly tool: Tool }) {
  return (
    <section className="wrap py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <SectionHeading
          eyebrow="Overview"
          title={`What ${tool.name} does`}
          lede={tool.overview}
          className="lg:col-span-7"
        />

        <div className="lg:col-span-5 lg:pt-9">
          <h3 className="font-mono text-muted text-xs uppercase tracking-[0.18em]">
            What people use it for
          </h3>
          <ul className="mt-4 flex flex-col gap-4">
            {tool.useCases.map(useCase => (
              <li key={useCase.title} className="border-border border-t pt-3">
                <p className="font-semibold">{useCase.title}</p>
                <p className="mt-1 text-pretty text-muted text-sm">{useCase.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
