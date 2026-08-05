import { demoSrc, githubUrl, iconSrc, marketplaceUrl, posterSrc, type Tool } from '@/lib/tools'
import { buttonVariants } from '@/ui/button'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

const BADGES = ['Free', 'Open source', 'MIT', 'No network access'] as const

export function ToolHero({ tool }: { readonly tool: Tool }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pb-12 pt-16 text-center sm:px-6">
      <img src={iconSrc(tool)} alt="" width={72} height={72} className="size-18 rounded-2xl" />

      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{tool.name}</h1>

      <p className="max-w-2xl text-pretty text-lg text-muted">{tool.summary}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {BADGES.map(badge => (
          <Chip key={badge} size="sm" variant="soft" color="accent">
            {badge}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={marketplaceUrl(tool)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'primary', size: 'lg' })}
        >
          Install for VS Code
        </Link>
        <Link
          href={githubUrl(tool)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'secondary', size: 'lg' })}
        >
          Source on GitHub
        </Link>
      </div>

      <img
        src={demoSrc(tool)}
        // The demo is the pitch, so it carries a real description rather than
        // being decorative — a reader on a slow connection or a screen reader
        // still learns what the tool does.
        alt={`${tool.name} in use: ${tool.summary}`}
        // Poster dimensions; the GIF is authored to match.
        loading="lazy"
        decoding="async"
        className="mt-4 w-full rounded-xl border border-default"
        style={{ backgroundImage: `url(${posterSrc(tool)})`, backgroundSize: 'cover' }}
      />
    </section>
  )
}
