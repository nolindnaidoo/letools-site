import { capitalize, countWord, OFFLINE_TOOLS, TOOLS } from '@/lib/tools'
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
    answer: `Not unless you ask one to. ${capitalize(countWord(OFFLINE_TOOLS.length))} of the ${countWord(TOOLS.length)} tools make no network requests at all. Scrape-LE fetches the page you point it at, because that is what checking scrapeability means — it still never uploads your files. JevLint-LE lints offline, and sends questions to Jev or Luna only when you ask it to, with your own key, from one editor command, one command-line flag, or two MCP tools an agent is told to call only on your word. The optional telemetry setting only writes to a local output channel inside your editor, and it is off by default.`,
  },
  {
    id: 'forks',
    question: 'I use Cursor or VSCodium — where do I install from?',
    answer:
      'Open VSX. The ids there are the same as on the VS Code Marketplace, and the install commands above have one for each editor.',
  },
  {
    id: 'agents',
    question: 'Can my AI agent use these?',
    answer:
      'Yes. Every tool ships its engine as an MCP server, so an agent can call it with no editor in the loop. Where the extension has shipped, npx -y <tool>-mcp wires most of them into Claude Code, Cursor or Windsurf, and VS Code 1.101+ needs nothing at all — installing the extension registers the tool with agent mode. The newest tools carry the server inside their binary instead: <tool> mcp speaks the same protocol with no Node involved. Each tool page prints the exact command for that tool.',
  },
  {
    id: 'split',
    question: 'Why separate tools instead of one suite?',
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
