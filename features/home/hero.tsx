import { GITHUB_URL, TAGLINE } from '@/lib/site'
import { buttonVariants } from '@/ui/button'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

const BADGES = ['Free', 'Open source', 'MIT', 'No network access'] as const

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
        Single-purpose VS Code extensions that extract, check, and guard the unglamorous stuff —
        strings, numbers, paths, env keys, regexes, secrets, colors, URLs, dates — without ever
        touching the network.
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
