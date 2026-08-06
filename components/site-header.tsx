import { ThemeToggle } from '@/components/theme-toggle'
import { ToolsMenu } from '@/components/tools-menu'
import { CommandPalette } from '@/features/search/command-palette'
import { GITHUB_URL, SITE_NAME } from '@/lib/site'
import { buttonVariants } from '@/ui/button'
import { Link } from '@/ui/link'

// Root-relative, not bare fragments. These sections live on the home page, and
// a bare `#tools` from /tools/urls-le resolves to an anchor on the tool page
// that does not exist — the header silently stops navigating the moment the
// site is more than one page.
const NAV_ITEMS = [
  { href: '/#why', label: 'Why LE' },
  { href: '/#install', label: 'Install' },
  { href: '/#faq', label: 'FAQ' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-accent-foreground"
          >
            LE
          </span>
          {SITE_NAME}
        </a>

        <nav aria-label="Site" className="hidden items-center gap-6 text-sm sm:flex">
          <ToolsMenu />
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  )
}
