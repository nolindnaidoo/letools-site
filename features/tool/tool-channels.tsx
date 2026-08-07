import { PUBLISHER } from '@/lib/site'
import {
  crateFor,
  crateUrl,
  factsFor,
  githubUrl,
  marketplaceUrl,
  mcpCommand,
  mcpServerName,
  npmUrl,
  openVsxUrl,
  type Tool,
  zedPrUrl,
} from '@/lib/tools'
import { Card } from '@/ui/card'
import { Link } from '@/ui/link'

/**
 * Where this tool actually ships.
 *
 * Every tool goes out through five channels and the site showed one of them.
 * Someone who wants the MCP server could not find out it existed, what it was
 * called, or how to run it.
 *
 * Every id here is derived — from the registry or from the generated facts —
 * because the two editor registries resolve *different* ids for the same
 * extension, and a hand-typed one fails for half the audience without ever
 * looking wrong.
 */

type Channel = Readonly<{
  label: string
  detail: string
  value: string
  href: string
  /** Set when the listing does not exist yet and the link goes elsewhere. */
  pending?: string
}>

function channelsFor(tool: Tool): readonly Channel[] {
  const facts = factsFor(tool)
  const crate = crateFor(tool)

  return [
    {
      label: 'VS Code Marketplace',
      detail: 'Cursor, Windsurf and VS Code itself',
      value: `${PUBLISHER}.${tool.id}`,
      href: marketplaceUrl(tool),
    },
    {
      label: 'Open VSX',
      detail: 'VSCodium and everything else that does not ship the Marketplace',
      value: openVsxUrl(tool).split('/extension/')[1] ?? tool.id,
      href: openVsxUrl(tool),
    },
    {
      label: 'MCP server',
      detail: 'the same engine, callable by an agent with no editor in the loop',
      value: mcpCommand(tool),
      href: npmUrl(tool),
    },
    {
      label: 'MCP registry',
      detail: 'discoverable by name',
      value: mcpServerName(tool),
      href: githubUrl(tool),
    },
    ...(crate === undefined
      ? []
      : [
          {
            label: 'Rust CLI',
            detail: 'the same check, with no editor and no Node',
            value: tool.cratePublished === true ? `cargo install ${crate.name}` : crate.name,
            href: tool.cratePublished === true ? crateUrl(crate.name) : githubUrl(tool),
            // A crates.io link before the publish lands is a 404 that looks
            // like a broken tool. Until then this points at the source.
            ...(tool.cratePublished === true
              ? {}
              : { pending: `v${crate.version} — publishing shortly; this links the source` }),
          },
        ]),
    {
      label: 'Zed',
      detail: 'built from Rust in the tool repo',
      value: facts.zedId,
      href: zedPrUrl(tool),
      // The extensions are submitted, not merged. Saying so is the point.
      pending: 'listing pending — this links to the open pull request',
    },
  ]
}

export function ToolChannels({ tool }: { readonly tool: Tool }) {
  const channels = channelsFor(tool)

  return (
    <section id="channels" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Where it ships</h2>
        <p className="text-muted">
          One engine, {channels.length} places to get it. The ids differ by registry — copy the one
          for the editor you use.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {channels.map(channel => (
          <li key={channel.label}>
            <Card className="flex h-full flex-col gap-2 p-5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="font-semibold">{channel.label}</h3>
                <span className="text-sm text-muted">{channel.detail}</span>
              </div>
              <code className="block overflow-x-auto rounded bg-surface px-3 py-2 font-mono text-sm">
                {channel.value}
              </code>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 pt-1">
                <Link href={channel.href} className="text-sm">
                  Open
                </Link>
                {channel.pending !== undefined && (
                  <span className="text-xs text-muted">{channel.pending}</span>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
