'use client'

import { Dropdown } from '@/ui/dropdown'

type Item = Readonly<{ href: string; label: string }>

// The site's links for a screen too narrow for the bar. A client leaf: the
// trigger owns open and closed. Each item is a real anchor, as in the tools
// menu, so the links are in the HTML and middle-click works.
export function MobileMenu({ items }: { readonly items: readonly Item[] }) {
  return (
    <nav aria-label="Site" className="sm:hidden">
      <Dropdown>
        <Dropdown.Trigger
          aria-label="Menu"
          className="flex size-9 items-center justify-center rounded text-muted hover:text-foreground"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              d="M2 4h12M2 8h12M2 12h12"
            />
          </svg>
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu aria-label="Site">
            {items.map(item => (
              <Dropdown.Item key={item.href} href={item.href} textValue={item.label}>
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </nav>
  )
}
