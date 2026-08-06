import { GITHUB_URL, INSTALL_COUNT, TAGLINE } from '@/lib/site'
import { buttonVariants } from '@/ui/button'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

// "No network access" was false as an unqualified claim: Scrape-LE fetches the
// page it is checking, which is the whole job. The scoped version is the one
// that survives someone checking.
const BADGES = [
  `${INSTALL_COUNT} installs`,
  'Free',
  'Open source',
  'MIT',
  'Local by default',
] as const

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pb-20 pt-24 text-center sm:px-6">
      <div className="flex flex-wrap justify-center gap-2">
        {BADGES.map(badge => (
          <Chip key={badge} size="sm" variant="soft" color="accent">
            {badge}
          </Chip>
        ))}
      </div>

      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">{TAGLINE}</h1>

      <p className="max-w-2xl text-pretty text-lg text-muted">
        Ten single-purpose tools for the manual work in front of every model: pull the values out,
        check they are what you think, and catch the secrets before they travel. In your editor, or
        callable by an agent over MCP.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="#tools" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Browse the tools
        </Link>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          GitHub
        </Link>
      </div>
    </section>
  )
}
