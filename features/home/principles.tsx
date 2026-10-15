import { SectionHeading } from '@/components/section-heading'
import {
  capitalize,
  countWord,
  LOCALE_COUNT,
  OFFLINE_TOOLS,
  TOOLS,
  TRANSLATED_TOOLS,
} from '@/lib/tools'

const TRANSLATED =
  TRANSLATED_TOOLS.length === TOOLS.length
    ? 'Every published extension ships its interface'
    : `${capitalize(countWord(TRANSLATED_TOOLS.length))} of the ${countWord(TOOLS.length)} extensions ship their interface`

// Every line here must stay provable against the extension repos: local-only
// operation, single-purpose scope, the shared CI/test bar, MIT + locales.
// The locale count is read from the registry, not typed — this block said
// two tools were English-only for as long as both shipped twelve
// translations, because a sentence here was the only place it lived.
const PRINCIPLES = [
  {
    title: 'Local by design',
    body: `Nothing leaves your machine unless you send it. ${capitalize(countWord(OFFLINE_TOOLS.length))} of the ${countWord(TOOLS.length)} tools make no network requests at all. Scrape-LE fetches the page it is checking, because that is the job. DecisionLint lints offline, and sends questions to the model's platform only when you ask it to, with your own key: an Ask command per platform and a probe in the editor, one command-line flag, and two MCP tools whose descriptions say they cost money. Telemetry is off by default and only ever writes to a local output channel you can read.`,
  },
  {
    title: 'One job each',
    body: 'No suites, no kitchen sinks. Each tool does one thing, activates fast, and gets out of the way.',
  },
  {
    title: 'Held to the same bar',
    body: `Every extension ships bundled, with no runtime dependencies — except Scrape-LE, which ships the browser driver it needs — and every Rust tool ships one binary. All ${countWord(TOOLS.length)} run CI on Linux, macOS, and Windows: the extensions against a real extension host and an installed VSIX, the crates against a fixture corpus that ships inside the crate so anyone can rerun it.`,
  },
  {
    title: 'Yours to read',
    body: `MIT licensed with every repo public. ${TRANSLATED} translated into ${LOCALE_COUNT} languages.`,
  },
] as const

// The strongest claims on the page, so they get the strongest setting: a rule,
// a numeral, a title, the claim. They used to sit in four cards with borders
// too faint to see, which rendered the family's promises as its footnotes.
export function Principles() {
  return (
    <section id="why" className="wrap scroll-mt-20 py-16 sm:py-24">
      <SectionHeading eyebrow="Why LE" title="The same four promises, every tool." />

      <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {PRINCIPLES.map((principle, index) => (
          <li key={principle.title} className="border-border border-t pt-5">
            <p className="font-mono text-muted text-xs tracking-[0.18em]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 font-semibold text-xl tracking-tight">{principle.title}</h3>
            <p className="mt-2 text-pretty text-muted">{principle.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
