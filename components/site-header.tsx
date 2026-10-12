import { MobileMenu } from '@/components/mobile-menu'
import { NewTab } from '@/components/new-tab'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToolsMenu } from '@/components/tools-menu'
import { CommandPalette } from '@/features/search/command-palette'
import { HEADER_LOGO } from '@/lib/brand'
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
      <div className="wrap flex h-14 items-center justify-between gap-3 sm:gap-4">
        {/* The mark, then the wordmark. The wordmark is the long form, so it
            stays on one line and gives up size before it wraps beside the
            controls. Under 375px there is no room for it beside them at all,
            so the mark stands alone and the words stay as the link's name.
            The mark is decoration: the link is named by the words, and a
            second name would be read twice. */}
        <a
          href="/"
          className="flex items-center gap-2 whitespace-nowrap font-semibold text-sm tracking-tight sm:text-base"
        >
          <img
            src={HEADER_LOGO.src}
            alt=""
            width={HEADER_LOGO.size}
            height={HEADER_LOGO.size}
            className="size-8 shrink-0 sm:size-9"
          />
          <span className="max-[374px]:sr-only">{WORDMARK}</span>
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
          {/* The bar's own links are hidden below sm, and this is where they
              go. Without it a phone had the wordmark, search and the theme
              toggle, and no way to a section but scrolling. */}
          <MobileMenu
            items={[
              { href: '/#tools', label: 'Tools' },
              ...NAV_ITEMS,
              { href: GITHUB_URL, label: 'GitHub' },
            ]}
          />
          {/* Below sm the menu above carries this link. */}
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={`hidden sm:inline-flex ${buttonVariants({ variant: 'outline', size: 'sm' })}`}
          >
            GitHub
            <NewTab />
          </Link>
        </div>
      </div>
    </header>
  )
}
