import type { Tool } from '@/lib/tools'
import { Card } from '@/ui/card'

// The page's substance, and the only prose a search engine has to work with —
// the summary alone is one line and ranks for nothing. Copy lives in the
// registry so it stays checkable against the extension repo.
export function ToolOverview({ tool }: { readonly tool: Tool }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">What {tool.name} does</h2>

      <p className="text-pretty text-lg text-muted">{tool.overview}</p>

      <h3 className="mb-4 mt-10 text-xl font-semibold tracking-tight">What people use it for</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tool.useCases.map(useCase => (
          <Card key={useCase.title} className="h-full">
            <Card.Header>
              <Card.Title className="text-base">{useCase.title}</Card.Title>
            </Card.Header>
            <Card.Content>
              <Card.Description className="text-pretty">{useCase.detail}</Card.Description>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  )
}
