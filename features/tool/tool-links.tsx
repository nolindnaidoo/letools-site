import {
  extensionPending,
  githubUrl,
  marketplaceUrl,
  mcpRegistryUrl,
  mcpServerName,
  npmUrl,
  openVsxUrl,
  type Tool,
} from '@/lib/tools'
import { Link } from '@/ui/link'

// Every surface this tool exists on, in one place. A visitor who arrived from
// one of them can reach all the others, and a crawler gets the whole set from
// a single page rather than inferring it.
//
// "Exists on" is meant literally: the three surfaces the extension publishes
// are left out entirely while it is unwritten. The section above already says
// they are coming and links the repository — a bare link list is the one place
// on the page with no room to qualify one, so an unqualified dead link here
// would be the only thing a reader could act on.
export function ToolLinks({ tool }: { readonly tool: Tool }) {
  const published = extensionPending(tool)
    ? []
    : ([
        {
          label: 'VS Code Marketplace',
          href: marketplaceUrl(tool),
          detail: `${tool.id}`,
        },
        {
          label: 'Open VSX',
          href: openVsxUrl(tool),
          detail: 'for Cursor and VSCodium',
        },
        {
          label: 'npm',
          href: npmUrl(tool),
          detail: `${tool.id}-mcp`,
        },
      ] as const)

  const links = [
    ...published,
    {
      label: 'GitHub',
      href: githubUrl(tool),
      detail: 'source, issues, changelog',
    },
    {
      label: 'MCP registry',
      href: mcpRegistryUrl(tool),
      detail: mcpServerName(tool),
    },
  ] as const

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Where {tool.name} lives</h2>

      <ul className="flex flex-col gap-3">
        {links.map(link => (
          <li key={link.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${tool.name} on ${link.label} (opens in new tab)`}
            >
              {link.label}
            </Link>
            <span className="font-mono text-sm text-muted">{link.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
