import { mcpPackageFor, type Tool } from './tools'

/**
 * The wiring for each MCP client, exactly as the tool repos document it.
 *
 * Nothing here is inferred. Every shape below is what `mcp/README.md` in the
 * extension repos tells a user to write, because a config this site invents is
 * a config that silently does not work — and the failure lands in someone
 * else's editor, where nothing points back here.
 *
 * The important case is the last one: VS Code and Zed need no JSON at all. The
 * extension carries the server and registers it. Emitting a config block for
 * them would be worse than emitting nothing, so the generator says so instead.
 */

export type ClientId = 'claude-code' | 'json' | 'editor'

export type Client = Readonly<{
  id: ClientId
  label: string
  /** Where the user puts the result, or why there is nothing to put. */
  detail: string
  language: 'bash' | 'json' | 'none'
}>

export const CLIENTS: readonly Client[] = Object.freeze([
  {
    id: 'claude-code',
    label: 'Claude Code',
    detail: 'Run once per tool. Claude Code stores the server itself.',
    language: 'bash',
  },
  {
    id: 'json',
    label: 'Claude Desktop, Cursor, Windsurf',
    detail: 'Merge into the client’s JSON config under "mcpServers".',
    language: 'json',
  },
  {
    id: 'editor',
    label: 'VS Code, Zed',
    detail: 'Nothing to configure — the extension carries the server.',
    language: 'none',
  },
])

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

  if (client.id === 'claude-code') {
    return tools
      .map(tool => `claude mcp add ${tool.id} -- npx -y ${mcpPackageFor(tool)}`)
      .join('\n')
  }

  const servers = Object.fromEntries(
    tools.map(tool => [tool.id, { command: 'npx', args: ['-y', mcpPackageFor(tool)] }]),
  )
  return JSON.stringify({ mcpServers: servers }, null, 2)
}
