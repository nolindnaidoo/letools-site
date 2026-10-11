import { DemoFrame } from '@/components/demo-frame'
import { INSTALL_COUNT, TAGLINE } from '@/lib/site'
import { FEATURED, TOOLS, toolPath } from '@/lib/tools'
import { buttonVariants } from '@/ui/button'
import { Link } from '@/ui/link'

/**
 * The pitch and the proof, side by side.
 *
 * The proof is the featured tool's own recording — the same one its page
 * leads with — rather than a wall of seventeen thumbnails. One thing moving is
 * a demo; seventeen is a screensaver. The eyebrow carries the family's facts
 * in one mono line, every one read from the registry or measured at build.
 *
 * "No network access" was false as an unqualified claim: Scrape-LE fetches
 * the page it is checking, which is the whole job. "Local by default" is the
 * version that survives someone checking.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(70%_60%_at_30%_0%,var(--accent-soft),transparent)]"
      />
      <div className="wrap grid grid-cols-1 gap-10 pt-14 pb-16 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-24 lg:pb-24">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <p className="font-mono text-muted text-xs uppercase tracking-[0.18em]">
            {TOOLS.length} tools · {INSTALL_COUNT} installs · MIT · Local by default
          </p>

          <h1 className="text-balance font-semibold text-4xl tracking-tighter sm:text-6xl lg:text-7xl">
            {TAGLINE}
          </h1>

          <p className="max-w-xl text-pretty text-lg text-muted sm:text-xl">
            Single-purpose tools for the manual work in front of every model: pull the values out,
            check they are what you think, and catch what should not travel. In your editor, in a
            terminal, or callable by an agent over MCP.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="#tools" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Browse the tools
            </Link>
            <Link href="#install" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Install
            </Link>
          </div>
        </div>

        <figure className="flex flex-col gap-3 lg:col-span-6">
          <DemoFrame tool={FEATURED} priority />
          <figcaption className="flex flex-wrap items-baseline gap-x-2 font-mono text-muted text-xs">
            <Link href={toolPath(FEATURED)} className="text-foreground">
              {FEATURED.name}
            </Link>
            <span>{FEATURED.summary}.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
