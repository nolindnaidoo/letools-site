import { iconSrc, TOOLS, type Tool, toolPath } from '@/lib/tools'
import { Card } from '@/ui/card'
import { Link } from '@/ui/link'

// The reason this site exists: someone arrives knowing one tool and leaves
// knowing there are nine more. On a tool page that job falls to this section,
// and these are the only internal links a crawler can follow between pages.
export function ToolSiblings({ tool }: { readonly tool: Tool }) {
  const siblings = TOOLS.filter(other => other.id !== tool.id)

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">The other nine</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {siblings.map(sibling => (
          <Card key={sibling.id} className="h-full">
            <Card.Header className="flex flex-row items-center gap-3">
              <img
                src={iconSrc(sibling)}
                alt=""
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="size-9 shrink-0 rounded-lg"
              />
              <Card.Title>
                <Link href={toolPath(sibling)}>{sibling.name}</Link>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <Card.Description className="text-pretty">{sibling.summary}</Card.Description>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  )
}
