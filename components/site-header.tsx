import { ThemeToggle } from '@/components/theme-toggle'
import { ToolsMenu } from '@/components/tools-menu'
import { CommandPalette } from '@/features/search/command-palette'
import { GITHUB_URL, WORDMARK } from '@/lib/site'
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
    <header className="sticky top-0 z-40 border-border border-b bg-background/80 backdrop-blur">
      <div className="wrap flex h-14 items-center justify-between gap-4">
        {/* The wordmark carries the name on its own — no mark. It is the long
            form, so it stays on one line and gives up size before it wraps
            beside the controls at 375px. */}
        <a href="/" className="whitespace-nowrap font-semibold text-sm tracking-tight sm:text-base">
          {WORDMARK}
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
          {/* Below sm the long wordmark, search and toggle already fill the
              bar. The footer carries the same link on every page, so hiding it
              here costs a phone visitor nothing. */}
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={`hidden sm:inline-flex ${buttonVariants({ variant: 'outline', size: 'sm' })}`}
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  )
}
