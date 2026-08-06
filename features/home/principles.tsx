import { LOCALE_COUNT } from '@/lib/tools'
import { Card } from '@/ui/card'

// Every line here must stay provable against the extension repos: local-only
// operation, single-purpose scope, the shared CI/test bar, MIT + locales.
// The locale count is read from the registry, not typed — this block said
// two tools were English-only for as long as both shipped twelve
// translations, because a sentence here was the only place it lived.
const PRINCIPLES = [
  {
    title: 'Local by design',
    body: 'File contents never leave your machine. Nine of the ten tools make no network requests at all; Scrape-LE is the exception by design, since checking whether a page is scrapeable means fetching that page. Telemetry is off by default and only ever writes to a local output channel you can read.',
  },
  {
    title: 'One job each',
    body: 'No suites, no kitchen sinks. Each tool does one thing, activates fast, and gets out of the way.',
  },
  {
    title: 'Held to the same bar',
    body: 'Every tool ships a single bundled file with no runtime dependencies — except Scrape-LE, which ships the browser driver it needs. All ten run CI on Linux, macOS, and Windows and pass real unit, extension-host, and installed-VSIX tests before release.',
  },
  {
    title: 'Yours to read',
    body: `MIT licensed with every repo public. Every tool ships its interface translated into ${LOCALE_COUNT} languages.`,
  },
] as const

export function Principles() {
  return (
    <section id="why" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Why LE</h2>
        <p className="text-muted">The same four promises, every tool.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRINCIPLES.map(principle => (
          <Card key={principle.title} variant="transparent" className="border border-border">
            <Card.Header>
              <Card.Title>{principle.title}</Card.Title>
            </Card.Header>
            <Card.Content>
              <Card.Description className="text-pretty">{principle.body}</Card.Description>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  )
}
