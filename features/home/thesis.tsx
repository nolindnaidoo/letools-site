import { INSTALL_COUNT } from '@/lib/site'
import { Card } from '@/ui/card'

/**
 * Why these exist.
 *
 * The site used to open with "Ten tools. One job each." — the shape of the
 * family and none of the reason for it. This section is the reason, and every
 * line of it has to stay provable against the tool repos like any other claim.
 */

const STEPS = [
  {
    label: 'Get it out',
    body: 'Values are buried in structure — JSON, YAML, CSV, TOML, INI, .env. Pulling the ones you need is tedious enough that people write a throwaway script, or do it by hand and hope.',
  },
  {
    label: 'Check it',
    body: 'Are the dates real dates? Do the URLs resolve? Is that a valid colour, a valid path, a regex that matches what you think it matches? This is the step that gets skipped.',
  },
  {
    label: 'Guard it',
    body: 'Nothing sensitive should be in the pile you are about to hand to a model or commit to a repo. Finding out afterwards is the expensive version.',
  },
] as const

export function Thesis() {
  return (
    <section
      id="why-these-exist"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <div className="mb-10 flex max-w-3xl flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight">The work before the work</h2>
        <p className="text-lg text-muted">
          Building anything real on top of a model starts with getting data into shape: pulling it
          out, checking it, and making sure nothing sensitive came along. That part is manual,
          repetitive, and almost never shown — so it gets done by hand, in a hurry, and the output
          is trusted because nobody has time to verify it.
        </p>
        <p className="text-lg text-muted">
          These are the steps, each one command, each one engineered rather than improvised:
          deterministic output, large files streamed rather than loaded whole, and behaviour pinned
          by tests so the result is the same tomorrow. {INSTALL_COUNT} installs later, that is still
          the whole idea.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.label}>
            <Card className="flex h-full flex-col gap-2 p-5">
              <span className="font-mono text-muted text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-semibold text-lg">{step.label}</h3>
              <p className="text-muted">{step.body}</p>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  )
}
