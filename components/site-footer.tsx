import { RUST_TOOLS } from '@/lib/rust-tools'
import { AUTHOR_URL, GITHUB_URL, PUBLISHER, SITE_NAME, TAGLINE } from '@/lib/site'
import { Link } from '@/ui/link'
import { Separator } from '@/ui/separator'

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <Separator className="mb-8" />
      <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          {SITE_NAME} — {TAGLINE}
        </p>
        <nav aria-label="More tools" className="flex items-center gap-4">
          {RUST_TOOLS.map(tool => (
            <Link
              key={tool.id}
              href={tool.siteUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} website (opens in new tab)`}
              className="py-2"
            >
              {tool.id}.dev
            </Link>
          ))}
        </nav>
        <p className="flex items-center gap-1">
          MIT ©{' '}
          <Link href={AUTHOR_URL} target="_blank" rel="noreferrer">
            Nolin Naidoo
          </Link>{' '}
          <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
            ({PUBLISHER})
          </Link>
        </p>
      </div>
    </footer>
  )
}
