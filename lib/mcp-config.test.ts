import { describe, expect, it } from 'vitest'
import { CLIENTS, clientById, configFor, HOST_NAMES } from './mcp-config'
import { mcpPackageFor, TOOLS } from './tools'

/**
 * A wrong config here fails in someone else's editor, where nothing points
 * back at this site. These assert the shapes the tool repos document, not
 * shapes that merely look plausible.
 */

const first = TOOLS[0]
const second = TOOLS[1]
if (first === undefined || second === undefined) throw new Error('the registry is too small')

describe('the clients', () => {
  it('names each host on its own, agents first and editors last', () => {
    expect(CLIENTS.map(client => client.id)).toEqual([
      'claude-code',
      'codex',
      'gemini-cli',
      'qwen-code',
      'kimi-code',
      'claude-desktop',
      'cursor',
      'windsurf',
      'vscode',
    ])
  })

  it('sends every editor to the registry it installs from', () => {
    // Cursor and Windsurf are editors that take the extension too. Listing
    // them with nothing but a config read as "these get MCP only".
    const hub = (id: string) => clientById(id).hub?.href
    expect(hub('vscode')).toBe('https://marketplace.visualstudio.com/publishers/nolindnaidoo')
    expect(hub('cursor')).toBe('https://open-vsx.org/namespace/nolindnaidoo')
    expect(hub('windsurf')).toBe('https://open-vsx.org/namespace/nolindnaidoo')
    for (const id of ['cursor', 'windsurf']) expect(clientById(id).detail).toContain('Open VSX')
  })

  it('lists the hosts that take a config, for the copy that names them', () => {
    expect(HOST_NAMES).toEqual([
      'Claude Code',
      'Codex',
      'Gemini CLI',
      'Qwen Code',
      'Kimi Code',
      'Claude Desktop',
      'Cursor',
      'Windsurf',
    ])
  })

  it('is frozen, like the rest of the content layer', () => {
    expect(Object.isFrozen(CLIENTS)).toBe(true)
  })

  it('names the unknown client rather than returning undefined', () => {
    expect(() => clientById('emacs')).toThrow(/unknown MCP client/)
  })
})

describe('configFor', () => {
  it('emits one add command per tool for Claude Code', () => {
    const config = configFor(clientById('claude-code'), [first, second])
    expect(config.split('\n')).toEqual([
      `claude mcp add ${first.id} -- npx -y ${mcpPackageFor(first)}`,
      `claude mcp add ${second.id} -- npx -y ${mcpPackageFor(second)}`,
    ])
  })

  it('emits one add command per tool for Codex', () => {
    const config = configFor(clientById('codex'), [first, second])
    expect(config.split('\n')).toEqual([
      `codex mcp add ${first.id} -- npx -y ${mcpPackageFor(first)}`,
      `codex mcp add ${second.id} -- npx -y ${mcpPackageFor(second)}`,
    ])
  })

  it.each(['gemini-cli', 'qwen-code', 'kimi-code', 'claude-desktop', 'cursor', 'windsurf'])(
    'emits one mcpServers block for %s',
    id => {
      const parsed = JSON.parse(configFor(clientById(id), [first, second]))
      expect(Object.keys(parsed)).toEqual(['mcpServers'])
      expect(Object.keys(parsed.mcpServers)).toEqual([first.id, second.id])
      expect(parsed.mcpServers[first.id]).toEqual({
        command: 'npx',
        args: ['-y', mcpPackageFor(first)],
      })
    },
  )

  it('produces valid JSON for every combination of tools', () => {
    for (const tool of TOOLS) {
      expect(() => JSON.parse(configFor(clientById('cursor'), [tool])), tool.id).not.toThrow()
    }
    expect(() => JSON.parse(configFor(clientById('cursor'), TOOLS))).not.toThrow()
  })

  it('emits nothing for the editors that need no config', () => {
    // VS Code installs the server with the extension. A block here
    // would be worse than none: it would look like the required step.
    expect(configFor(clientById('vscode'), TOOLS)).toBe('')
  })

  it('emits nothing rather than an empty server map', () => {
    // `{"mcpServers":{}}` pastes cleanly and does nothing, which is the worst
    // thing this could hand someone.
    expect(configFor(clientById('cursor'), [])).toBe('')
    expect(configFor(clientById('claude-code'), [])).toBe('')
    expect(configFor(clientById('codex'), [])).toBe('')
  })

  it('names the npm package, never the extension id', () => {
    // The MCP package is `<id>-mcp`; wiring `<id>` resolves to nothing on npm.
    const config = configFor(clientById('cursor'), [first])
    expect(config).toContain(`${first.id}-mcp`)
    expect(JSON.parse(config).mcpServers[first.id].args).toContain(`${first.id}-mcp`)
  })
})
