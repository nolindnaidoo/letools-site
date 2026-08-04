import { Accordion } from '@/ui/accordion'

const FAQ_ITEMS = [
  {
    id: 'free',
    question: 'Are these free?',
    answer: 'Yes. MIT licensed, no paid tiers, no sign-up.',
  },
  {
    id: 'privacy',
    question: 'Do they send my code anywhere?',
    answer:
      'No. Your file contents are never transmitted. Nine of the ten tools make no network requests at all; Scrape-LE fetches the page you point it at, because that is what checking scrapeability means — it still never uploads your files. The optional telemetry setting only writes to a local output channel inside your editor, and it is off by default.',
  },
  {
    id: 'forks',
    question: 'I use Cursor or VSCodium — where do I install from?',
    answer:
      'Open VSX. The ids there currently use the OffensiveEdge namespace rather than nolindnaidoo — the install commands above use the right one for each editor.',
  },
  {
    id: 'split',
    question: 'Why ten separate extensions instead of one?',
    answer:
      'Install only what you need. Each tool stays small, auditable, and fast to activate — no idle features running in your editor.',
  },
  {
    id: 'bugs',
    question: 'Where do I report a bug?',
    answer: "Each tool's GitHub Issues — the GitHub link is on every card above.",
  },
] as const

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
      </div>

      <Accordion variant="surface">
        {FAQ_ITEMS.map(item => (
          <Accordion.Item key={item.id} id={item.id}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {item.question}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="text-pretty text-muted">{item.answer}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  )
}
