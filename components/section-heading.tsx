import type { ReactNode } from 'react'

/**
 * The one shape every section opens with: a mono eyebrow, the title, and an
 * optional lede. Eight home sections used to open eight slightly different
 * ways, which is most of why the page read as a list rather than a sequence.
 * The eyebrow is where the section's place in the sequence goes ("01 · Extract")
 * so the title can say what the section is about.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  as: Heading = 'h2',
  className = '',
}: {
  readonly eyebrow?: string
  readonly title: ReactNode
  readonly lede?: ReactNode
  readonly as?: 'h1' | 'h2' | 'h3'
  readonly className?: string
}) {
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${className}`}>
      {eyebrow === undefined ? null : (
        <p className="font-mono text-muted text-xs uppercase tracking-[0.18em]">{eyebrow}</p>
      )}
      <Heading className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
        {title}
      </Heading>
      {lede === undefined ? null : <p className="text-pretty text-lg text-muted">{lede}</p>}
    </div>
  )
}
