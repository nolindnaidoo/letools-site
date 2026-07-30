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
      'No. None of the tools have network access. The optional telemetry setting only writes to a local output channel inside your editor, and it is off by default.',
  },
  {
    id: 'forks',
    question: 'I use Cursor or VSCodium — where do I install from?',
    answer:
      'Open VSX. Every tool is published there under the same publisher and ids as the VS Code Marketplace.',
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
