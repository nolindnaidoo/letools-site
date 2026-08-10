import { CommandSnippet } from '@/components/command-snippet'
import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import { mcpCommand, type Tool, ZED_MCP_DOCS, zedPrUrl } from '@/lib/tools'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

// The two registries use different namespaces, so the ids are NOT
// interchangeable: VS Code resolves nolindnaidoo.*, while Cursor and VSCodium
// pull from Open VSX and resolve OffensiveEdge.*. One id for both is a command
// that simply fails for half the audience.
export function ToolInstall({ tool }: { readonly tool: Tool }) {
  const surfaces = [
    {
      id: 'vscode',
      label: 'VS Code',
      command: `ext install ${PUBLISHER}.${tool.id}`,
      note: 'Open Quick Open (Cmd/Ctrl+P) and paste.',
    },
    {
      id: 'forks',
      label: 'Cursor / VSCodium',
      command: `cursor --install-extension ${OPENVSX_NAMESPACE}.${tool.id}`,
      note: 'VS Code forks pull from Open VSX, where the namespace is OffensiveEdge.',
    },
    {
      id: 'zed',
      label: 'Zed',
      command: mcpCommand(tool),
      pending: tool.zedPr !== undefined,
      note:
        tool.zedPr === undefined
          ? `Works in Zed today — add the command above as a custom MCP server from the agent panel, and ${tool.mcpTool} appears in its tool list. There is no one-click listing in Zed's extension registry yet.`
          : `Works in Zed today — add the command above as a custom MCP server from the agent panel, and ${tool.mcpTool} appears in its tool list. The one-click listing in Zed's extension registry is a pull request awaiting review.`,
    },
    {
      id: 'agents',
      label: 'AI agents',
      command: mcpCommand(tool),
      note: `Runs ${tool.name}'s engine as an MCP server, so an agent can call ${tool.mcpTool} with no editor involved. VS Code 1.101+ needs nothing — the extension registers it for you.`,
    },
  ] as const

  return (
    <section id="install" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Install {tool.name}</h2>

      <div className="flex flex-col gap-6">
        {surfaces.map(surface => (
          <div key={surface.id} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {surface.label}
              {'pending' in surface && surface.pending ? (
                <Chip size="sm" variant="soft">
                  Coming soon
                </Chip>
              ) : null}
            </h3>
            <CommandSnippet command={surface.command} label={surface.label} />
            <p className="text-sm text-muted">
              {surface.note}
              {'pending' in surface && surface.pending ? (
                <>
                  {' '}
                  {/* No newline before the period, or JSX renders "review ." */}
                  <Link href={zedPrUrl(tool) ?? ZED_MCP_DOCS} target="_blank" rel="noreferrer">
                    Track the review
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
