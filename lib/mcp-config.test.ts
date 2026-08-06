import { describe, expect, it } from 'vitest'
import { CLIENTS, clientById, configFor } from './mcp-config'
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
  it('covers the three ways a client takes this server', () => {
    expect(CLIENTS.map(client => client.id)).toEqual(['claude-code', 'json', 'editor'])
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

  it('emits one mcpServers block for the JSON clients', () => {
    const parsed = JSON.parse(configFor(clientById('json'), [first, second]))
    expect(Object.keys(parsed)).toEqual(['mcpServers'])
    expect(Object.keys(parsed.mcpServers)).toEqual([first.id, second.id])
    expect(parsed.mcpServers[first.id]).toEqual({
      command: 'npx',
      args: ['-y', mcpPackageFor(first)],
    })
  })

  it('produces valid JSON for every combination of tools', () => {
    for (const tool of TOOLS) {
      expect(() => JSON.parse(configFor(clientById('json'), [tool])), tool.id).not.toThrow()
    }
    expect(() => JSON.parse(configFor(clientById('json'), TOOLS))).not.toThrow()
  })

  it('emits nothing for the editors that need no config', () => {
    // VS Code and Zed install the server with the extension. A block here
    // would be worse than none: it would look like the required step.
    expect(configFor(clientById('editor'), TOOLS)).toBe('')
  })

  it('emits nothing rather than an empty server map', () => {
    // `{"mcpServers":{}}` pastes cleanly and does nothing, which is the worst
    // thing this could hand someone.
    expect(configFor(clientById('json'), [])).toBe('')
    expect(configFor(clientById('claude-code'), [])).toBe('')
  })

  it('names the npm package, never the extension id', () => {
    // The MCP package is `<id>-mcp`; wiring `<id>` resolves to nothing on npm.
    const config = configFor(clientById('json'), [first])
    expect(config).toContain(`${first.id}-mcp`)
    expect(JSON.parse(config).mcpServers[first.id].args).toContain(`${first.id}-mcp`)
  })
})
