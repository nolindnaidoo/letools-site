import { CommandSnippet } from '@/components/command-snippet'
import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import {
  crateFor,
  extensionPending,
  githubUrl,
  mcpCommand,
  type Tool,
  ZED_MCP_DOCS,
  zedPrUrl,
} from '@/lib/tools'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

type Surface = Readonly<{
  id: string
  label: string
  command: string
  note: string
  /** Set while the surface exists but the listing on it does not yet. */
  pending?: boolean
  /** Where "Coming soon" points, for a reader who wants to watch it land. */
  track?: string
  trackLabel?: string
}>

// The two registries use different namespaces, so the ids are NOT
// interchangeable: VS Code resolves nolindnaidoo.*, while Cursor and VSCodium
// pull from Open VSX and resolve OffensiveEdge.*. One id for both is a command
// that simply fails for half the audience.
function surfacesFor(tool: Tool): readonly Surface[] {
  const pending = extensionPending(tool)
  const crate = crateFor(tool)
  const zedReview = zedPrUrl(tool)

  // While the extension is unwritten there is nothing on either Marketplace
  // and no npm package, so the editor rows carry the command they *will* take
  // and say plainly that it does not work yet. The one that does work today —
  // the crate's own MCP server — leads instead.
  const editors: readonly Surface[] = [
    {
      id: 'vscode',
      label: 'VS Code',
      command: `ext install ${PUBLISHER}.${tool.id}`,
      note: pending
        ? 'The extension is not written yet, so this id resolves to nothing on the Marketplace. It is the id it will take.'
        : 'Open Quick Open (Cmd/Ctrl+P) and paste.',
      ...(pending ? { pending: true, track: githubUrl(tool) } : {}),
    },
    {
      id: 'forks',
      label: 'Cursor / VSCodium',
      command: `cursor --install-extension ${OPENVSX_NAMESPACE}.${tool.id}`,
      note: pending
        ? 'Same again for the forks, which resolve Open VSX rather than the Marketplace.'
        : 'VS Code forks pull from Open VSX, where the namespace is OffensiveEdge.',
      ...(pending ? { pending: true, track: githubUrl(tool) } : {}),
    },
  ]

  const cli: readonly Surface[] =
    crate === undefined || !pending
      ? []
      : [
          {
            id: 'cli',
            label: 'Command line',
            command: `cargo install ${crate.name}`,
            // v0.1 is written and tested but unpublished; the channels section
            // below links the source rather than a crates.io page that 404s.
            pending: true,
            track: githubUrl(tool),
            note: `Not on crates.io yet — v${crate.version} builds from the repository today, and this command starts working the day it publishes.`,
          },
        ]

  return [
    ...cli,
    ...editors,
    {
      id: 'zed',
      label: 'Zed',
      command: mcpCommand(tool),
      ...(zedReview === undefined
        ? {}
        : { pending: true, track: zedReview, trackLabel: 'Track the review' }),
      note:
        tool.zedPr === undefined
          ? `Works in Zed today — add the command above as a custom MCP server from the agent panel, and ${tool.mcpTool} appears in its tool list. There is no one-click listing in Zed's extension registry yet.`
          : `Works in Zed today — add the command above as a custom MCP server from the agent panel, and ${tool.mcpTool} appears in its tool list. The one-click listing in Zed's extension registry is a pull request awaiting review.`,
    },
    {
      id: 'agents',
      label: 'AI agents',
      command: mcpCommand(tool),
      note: pending
        ? `Runs ${tool.name}'s engine as an MCP server over stdio, so an agent can call ${tool.mcpTool} with no editor and no Node. The binary is the server — there is nothing else to install.`
        : `Runs ${tool.name}'s engine as an MCP server, so an agent can call ${tool.mcpTool} with no editor involved. VS Code 1.101+ needs nothing — the extension registers it for you.`,
    },
  ]
}

export function ToolInstall({ tool }: { readonly tool: Tool }) {
  const surfaces = surfacesFor(tool)

  return (
    <section id="install" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Install {tool.name}</h2>

      <div className="flex flex-col gap-6">
        {surfaces.map(surface => (
          <div key={surface.id} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {surface.label}
              {surface.pending === true ? (
                <Chip size="sm" variant="soft">
                  Coming soon
                </Chip>
              ) : null}
            </h3>
            <CommandSnippet command={surface.command} label={surface.label} />
            <p className="text-sm text-muted">
              {surface.note}
              {surface.pending === true ? (
                <>
                  {' '}
                  {/* No newline before the period, or JSX renders "review ." */}
                  <Link href={surface.track ?? ZED_MCP_DOCS} target="_blank" rel="noreferrer">
                    {surface.trackLabel ?? 'Follow the repository'}
                  </Link>
                  {'.'}
                </>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
