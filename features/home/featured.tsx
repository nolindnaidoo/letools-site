import { ToolIcon } from '@/components/tool-icon'
import { FEATURED, marketplaceUrl, openVsxUrl, posterSrc, toolPath } from '@/lib/tools'
import { buttonVariants } from '@/ui/button'
import { Card } from '@/ui/card'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

/**
 * One tool, ahead of the grid.
 *
 * The grid gives every tool the same card, which is right for sixteen peers
 * and wrong for the one a visitor is most likely to have come for. Everything
 * here is read from that tool's registry entry, so the copy cannot say more
 * than its own page does. It keeps its card in the grid as well.
 *
 * The still, not the recording: the card below plays the same clip, and two
 * copies looping on one screen is motion nobody asked for.
 */
export function Featured() {
  const tool = FEATURED
  const poster = posterSrc(tool)

  return (
    <section id="featured" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pt-4 pb-8 sm:px-6">
      <Card variant="secondary" className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <Chip size="sm" variant="soft" color="accent">
              Featured
            </Chip>
          </div>

          <div className="flex items-center gap-3">
            <ToolIcon tool={tool} size={48} className="rounded-xl" />
            <h2 className="text-3xl font-bold tracking-tight">{tool.name}</h2>
          </div>

          <p className="text-pretty text-muted">{tool.summary}.</p>

          <ul className="flex flex-col gap-2 text-sm">
            {tool.useCases.map(useCase => (
              <li key={useCase.title}>
                <span className="font-semibold">{useCase.title}.</span>{' '}
                <span className="text-muted">{useCase.detail}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={toolPath(tool)} className={buttonVariants({ variant: 'primary' })}>
              See {tool.name}
            </Link>
            <Link
              href={marketplaceUrl(tool)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} on the VS Code Marketplace (opens in new tab)`}
              className={buttonVariants({ variant: 'outline' })}
            >
              VS Code
            </Link>
            <Link
              href={openVsxUrl(tool)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} on Open VSX (opens in new tab)`}
              className={buttonVariants({ variant: 'outline' })}
            >
              Open VSX
            </Link>
          </div>
        </div>

        {poster === undefined ? null : (
          <img
            src={poster}
            alt={`A small Jev request printed at the command line, about to be checked by ${tool.name}`}
            width={800}
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl border border-border md:w-1/2"
          />
        )}
      </Card>
    </section>
  )
}
