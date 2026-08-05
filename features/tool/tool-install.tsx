import { CommandSnippet } from '@/components/command-snippet'
import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import { mcpCommand, type Tool } from '@/lib/tools'

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
            <h3 className="text-sm font-semibold">{surface.label}</h3>
            <CommandSnippet command={surface.command} />
            <p className="text-sm text-muted">{surface.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
