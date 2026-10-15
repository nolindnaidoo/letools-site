import { SectionHeading } from '@/components/section-heading'
import { factsFor, githubUrl, type Tool } from '@/lib/tools'
import type { RuleFacts } from '@/scripts/sync-registry'

// A rule's series is the first digit of its number. A series this does not
// name is a new kind of rule, and the build stops rather than file it under
// the wrong heading.
const SERIES = {
  '0': { title: 'Requests', note: 'Read from the text, offline.' },
  '1': { title: 'Wording', note: 'Read from the text, offline.' },
  '3': { title: 'Asked of the model', note: 'Run only when you ask, with your own key.' },
} as const

type Series = keyof typeof SERIES

function seriesOf(rule: RuleFacts): Series {
  const digit = rule.code.charAt(3)
  if (digit in SERIES) return digit as Series
  throw new Error(`${rule.code} is in no rule series the page knows`)
}

/** `text with `code` in it` as text and code spans. */
function Meaning({ text }: { readonly text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code key={part} className="font-mono text-sm">
        {part}
      </code>
    ) : (
      part
    ),
  )
}

/**
 * Every rule a linter ships, from the README table its own test holds equal
 * to its rule registry. Each row links to the rule's page in the repo.
 */
export function ToolRules({ tool }: { readonly tool: Tool }) {
  const { rules } = factsFor(tool)
  if (rules === undefined) return null

  const groups = (Object.keys(SERIES) as Series[])
    .map(series => ({ series, rules: rules.filter(rule => seriesOf(rule) === series) }))
    .filter(group => group.rules.length > 0)

  return (
    <section id="rules" className="wrap scroll-mt-20 py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <SectionHeading
            eyebrow="Rules"
            title={`${rules.length} rules`}
            lede="Each code links to its page: what it catches, an example, and how to fix or silence it."
          />
        </div>

        <div className="flex flex-col gap-10 lg:col-span-8">
          {groups.map(group => (
            <div key={group.series} className="flex flex-col gap-3">
              <h3 className="font-semibold text-xl">
                {SERIES[group.series].title}{' '}
                <span className="font-normal text-base text-muted">
                  {SERIES[group.series].note}
                </span>
              </h3>
              <ul className="divide-y divide-border border-border border-y">
                {group.rules.map(rule => (
                  <li key={rule.code} className="flex flex-col gap-1 py-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <a
                        href={`${githubUrl(tool)}/blob/main/docs/rules/${rule.code}.md`}
                        className="font-medium font-mono underline-offset-4 hover:underline"
                      >
                        {rule.code}
                      </a>
                      <code className="font-mono text-sm">{rule.name}</code>
                      <span className="text-muted text-sm">
                        {rule.level === 'off' ? 'off by default' : rule.level}
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      <Meaning text={rule.meaning} />
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
