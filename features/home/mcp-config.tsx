'use client'

import { useMemo, useState } from 'react'
import { CommandSnippet } from '@/components/command-snippet'
import { SectionHeading } from '@/components/section-heading'
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
 * and not a code block: the shape differs by client, and VS Code takes
 * no configuration at all — the extension carries the server. Saying that
 * plainly is more useful than emitting a block that would do nothing.
 */

const OPTION_CLASS =
  'flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-secondary has-[:checked]:border-foreground has-[:checked]:font-medium'

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
    <section id="mcp" className="wrap scroll-mt-20 py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <SectionHeading
          eyebrow="Agents"
          title="Wire them into your agent."
          lede="Every tool ships the same engine as an MCP server. Pick your client and the tools you want; copy what comes out."
          className="lg:col-span-4"
        />

        <Card className="flex flex-col gap-6 p-6 lg:col-span-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-semibold">Client</legend>
            <div className="flex flex-wrap gap-2">
              {CLIENTS.map(option => (
                <label key={option.id} className={OPTION_CLASS}>
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
            <p className="text-muted text-sm">{client.detail}</p>
          </fieldset>

          {client.language !== 'none' && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 font-semibold">Tools</legend>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map(tool => (
                  <label key={tool.id} className={OPTION_CLASS}>
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
      </div>
    </section>
  )
}
