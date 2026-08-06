'use client'

import { useMemo, useState } from 'react'
import { CommandSnippet } from '@/components/command-snippet'
import { CLIENTS, type ClientId, clientById, configFor } from '@/lib/mcp-config'
import { TOOLS } from '@/lib/tools'
import { Card } from '@/ui/card'

/**
 * Build the MCP wiring for the tools you actually want.
 *
 * Every tool ships its engine as an MCP server, and the site's only mention of
 * that was a single `npx` line. Wiring several of them meant reading ten
 * READMEs and merging ten JSON fragments by hand.
 *
 * The output is a function of two choices, which is why this is a component
 * and not a code block: the shape differs by client, and VS Code and Zed take
 * no configuration at all — the extension carries the server. Saying that
 * plainly is more useful than emitting a block that would do nothing.
 */
export function McpConfig() {
  const [clientId, setClientId] = useState<ClientId>('json')
  const [selected, setSelected] = useState<readonly string[]>([TOOLS[0]?.id ?? ''])

  const client = clientById(clientId)
  const tools = useMemo(() => TOOLS.filter(tool => selected.includes(tool.id)), [selected])
  const config = useMemo(() => configFor(client, tools), [client, tools])

  const toggle = (id: string) => {
    setSelected(current =>
      current.includes(id) ? current.filter(other => other !== id) : [...current, id],
    )
  }

  return (
    <section id="mcp" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Wire them into your agent</h2>
        <p className="text-muted">
          Every tool ships the same engine as an MCP server. Pick your client and the tools you
          want; copy what comes out.
        </p>
      </div>

      <Card className="flex flex-col gap-6 p-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-semibold">Client</legend>
          <div className="flex flex-wrap gap-2">
            {CLIENTS.map(option => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm has-[:checked]:border-fg has-[:checked]:font-medium"
              >
                <input
                  type="radio"
                  name="mcp-client"
                  value={option.id}
                  checked={clientId === option.id}
                  onChange={() => setClientId(option.id)}
                  className="size-4"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-sm text-muted">{client.detail}</p>
        </fieldset>

        {client.language !== 'none' && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-semibold">Tools</legend>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map(tool => (
                <label
                  key={tool.id}
                  className="flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm has-[:checked]:border-fg has-[:checked]:font-medium"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(tool.id)}
                    onChange={() => toggle(tool.id)}
                    className="size-4"
                  />
                  {tool.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div aria-live="polite">
          {client.language === 'none' ? (
            <p className="rounded border border-border p-4">
              Nothing to paste. Install the extension and it registers its own server — the same
              engine, already wired.
            </p>
          ) : config === '' ? (
            <p className="rounded border border-border p-4 text-muted">
              Select at least one tool. An empty config is a silent no-op, so this shows nothing
              rather than something that looks right.
            </p>
          ) : (
            <CommandSnippet command={config} label={`${client.label} MCP configuration`} />
          )}
        </div>
      </Card>
    </section>
  )
}
