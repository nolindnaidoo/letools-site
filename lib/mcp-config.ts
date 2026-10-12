import { MARKETPLACE_PUBLISHER_URL, OPENVSX_NAMESPACE_URL } from './site'
import { mcpInvocation, type Tool } from './tools'

/**
 * The wiring for each MCP host, exactly as its vendor documents it.
 *
 * Nothing here is inferred. Each entry was read from the host's own docs on
 * 2026-10-12, because a config this site invents is a config that silently
 * does not work — and the failure lands in someone else's editor, where
 * nothing points back here. A host is listed only once its page was read:
 *
 *   Claude Code      the tool repos' own mcp/README.md
 *   Codex            developers.openai.com/codex/mcp
 *   Gemini CLI       geminicli.com/docs/tools/mcp-server
 *   Qwen Code        qwenlm.github.io/qwen-code-docs/en/users/features/mcp
 *   Kimi Code        kimi.com/code/docs/en/kimi-code-cli/customization/mcp.html
 *   Claude Desktop   modelcontextprotocol.io/docs/develop/connect-local-servers
 *   Cursor           cursor.com/docs/context/mcp
 *   Windsurf         docs.windsurf.com/windsurf/cascade/mcp
 *
 * Gemini CLI and Qwen Code also have an `mcp add` command. They get the JSON
 * anyway: neither page shows that command passing a dashed argument such as
 * npx's `-y` through, and the settings file is documented for both.
 *
 * Windsurf's detail names the file and not its folder, which moved between
 * releases.
 *
 * A model is not a host. GLM, Kimi's models and the rest run inside one of
 * the hosts below, and the server answers whichever model calls it.
 *
 * VS Code needs no JSON at all: the extension carries the server and
 * registers it. Cursor and Windsurf install the same extension, but register
 * servers through an API of their own that the extensions do not call, so
 * their agents still take the JSON.
 */

export type ClientId =
  | 'claude-code'
  | 'codex'
  | 'gemini-cli'
  | 'qwen-code'
  | 'kimi-code'
  | 'claude-desktop'
  | 'cursor'
  | 'windsurf'
  | 'vscode'

export type Client = Readonly<{
  id: ClientId
  label: string
  /** Where the user puts the result, or why there is nothing to put. */
  detail: string
  language: 'bash' | 'json' | 'none'
  /** The command that registers one server, for a host that has one. Absent means the JSON block. */
  add?: string
  /** Every extension on the registry this editor installs from. */
  hub?: Readonly<{ label: string; href: string }>
}>

const OPENVSX_HUB = Object.freeze({
  label: 'Every LE extension on Open VSX',
  href: OPENVSX_NAMESPACE_URL,
})

export const CLIENTS: readonly Client[] = Object.freeze([
  {
    id: 'claude-code',
    label: 'Claude Code',
    detail: 'Run once per tool. Claude Code stores the server itself.',
    language: 'bash',
    add: 'claude mcp add',
  },
  {
    id: 'codex',
    label: 'Codex',
    detail: 'Run once per tool. Codex writes the server to ~/.codex/config.toml.',
    language: 'bash',
    add: 'codex mcp add',
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    detail: 'Merge into ~/.gemini/settings.json under "mcpServers".',
    language: 'json',
  },
  {
    id: 'qwen-code',
    label: 'Qwen Code',
    detail: 'Merge into ~/.qwen/settings.json under "mcpServers".',
    language: 'json',
  },
  {
    id: 'kimi-code',
    label: 'Kimi Code',
    detail: 'Merge into ~/.kimi-code/mcp.json under "mcpServers".',
    language: 'json',
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    detail:
      'Settings, Developer, Edit Config opens claude_desktop_config.json. Merge under "mcpServers".',
    language: 'json',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    detail:
      'Merge into ~/.cursor/mcp.json under "mcpServers". This wires Cursor’s agent. The extensions themselves install from Open VSX.',
    language: 'json',
    hub: OPENVSX_HUB,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    detail:
      'Merge into Windsurf’s mcp_config.json under "mcpServers". This wires its agent. The extensions themselves install from Open VSX.',
    language: 'json',
    hub: OPENVSX_HUB,
  },
  {
    id: 'vscode',
    label: 'VS Code',
    detail: 'Nothing to configure — the extension carries the server.',
    language: 'none',
    hub: {
      label: 'Every LE extension on the VS Code Marketplace',
      href: MARKETPLACE_PUBLISHER_URL,
    },
  },
])

/**
 * The hosts that take a config, by name, for the sentences that list them.
 * Read from `CLIENTS` so the install tab and the FAQ cannot name a different
 * set than the picker offers.
 */
export const HOST_NAMES: readonly string[] = Object.freeze(
  CLIENTS.filter(client => client.language !== 'none').map(client => client.label),
)

export function clientById(id: string): Client {
  const found = CLIENTS.find(client => client.id === id)
  if (found === undefined) throw new Error(`unknown MCP client: ${id}`)
  return found
}

/**
 * The block to copy for a client and a set of tools.
 *
 * Empty selection returns an empty string rather than a config with no servers
 * in it: pasting `{"mcpServers":{}}` into a client is a silent no-op, which is
 * the worst thing this could hand someone.
 */
export function configFor(client: Client, tools: readonly Tool[]): string {
  if (client.language === 'none' || tools.length === 0) return ''

  // Two shapes, from one source. Most tools publish their server as an npm
  // package; the ones whose extension is still to be written ship it in their
  // binary instead, and `mcpInvocation` is what knows which. Hardcoding `npx`
  // here would emit a config that installs nothing for those.
  if (client.add !== undefined) {
    return tools
      .map(tool => {
        const { command, args } = mcpInvocation(tool)
        return `${client.add} ${tool.id} -- ${command} ${args.join(' ')}`
      })
      .join('\n')
  }

  const servers = Object.fromEntries(tools.map(tool => [tool.id, mcpInvocation(tool)]))
  return JSON.stringify({ mcpServers: servers }, null, 2)
}
