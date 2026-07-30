import { RUST_TOOLS } from '@/lib/rust-tools'
import { Card } from '@/ui/card'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

export function RustTools() {
  return (
    <section id="beyond" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Beyond the editor</h2>
        <p className="text-muted">
          Same maker, different surface: two Rust desktop tools that turn screen pixels into
          machine-usable automation — each with its own site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RUST_TOOLS.map(tool => (
          <Card key={tool.id} variant="secondary" className="flex h-full flex-col gap-1">
            <Card.Header className="flex-row items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-sm font-bold text-accent-soft-foreground"
              >
                {tool.monogram}
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <Card.Title>{tool.name}</Card.Title>
                <Chip size="sm" variant="soft">
                  Rust · desktop
                </Chip>
              </div>
            </Card.Header>
            <Card.Content>
              <Card.Description className="text-pretty">{tool.tagline}</Card.Description>
            </Card.Content>
            <Card.Footer className="mt-auto gap-4 text-sm">
              <Link
                href={tool.siteUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tool.name} website (opens in new tab)`}
                className="py-2"
              >
                {tool.id}.dev
              </Link>
              <Link
                href={tool.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tool.name} on GitHub (opens in new tab)`}
                className="py-2"
              >
                GitHub
              </Link>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </section>
  )
}
