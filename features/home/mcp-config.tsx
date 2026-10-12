'use client'

import { useMemo, useState } from 'react'
import { CommandSnippet } from '@/components/command-snippet'
import { SectionHeading } from '@/components/section-heading'
import { CLIENTS, type ClientId, clientById, configFor } from '@/lib/mcp-config'
import { byDownloads } from '@/lib/popularity'
import { TOOLS } from '@/lib/tools'
import { Card } from '@/ui/card'
import { Link } from '@/ui/link'

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
 *
 * Each host is its own option. Cursor and Windsurf once shared one with Claude
 * Desktop, beside a VS Code option that said "install the extension", which
 * read as though the forks got a config and no extension. An editor's option
 * now links the registry its extensions come from.
 */

const OPTION_CLASS =
  'flex cursor-pointer items-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-secondary has-[:checked]:border-foreground has-[:checked]:font-medium'

// The checkboxes and the config they write run in the same order.
const ORDERED = byDownloads(TOOLS, tool => tool.id)

export function McpConfig() {
  const [clientId, setClientId] = useState<ClientId>('claude-code')
  const [selected, setSelected] = useState<readonly string[]>([ORDERED[0]?.id ?? ''])

  const client = clientById(clientId)
  const tools = useMemo(() => ORDERED.filter(tool => selected.includes(tool.id)), [selected])
  const config = useMemo(() => configFor(client, tools), [client, tools])

  const toggle = (id: string) => {
    setSelected(current =>
      current.includes(id) ? current.filter(other => other !== id) : [...current, id],
    )
  }

  return (
    <section id="mcp" className="wrap scroll-mt-20 py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <SectionHeading
          eyebrow="Agents"
          title="Wire them into your agent."
          lede="Every tool ships the same engine as an MCP server. Pick your agent host and the tools you want, then copy what comes out."
          className="lg:col-span-4"
        />

        <Card className="flex flex-col gap-6 p-6 lg:col-span-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-semibold">Agent host</legend>
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
            {client.hub !== undefined && (
              <p className="text-sm">
                <Link href={client.hub.href} target="_blank" rel="noreferrer">
                  {client.hub.label}
                </Link>
              </p>
            )}
          </fieldset>

          {client.language !== 'none' && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 font-semibold">Tools</legend>
              <div className="flex flex-wrap gap-2">
                {ORDERED.map(tool => (
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

          <p className="text-muted text-sm">
            A model is not a host. GLM, Kimi, Qwen and the rest run inside one of these, so pick the
            host you run them in. Any other MCP host starts the same server over stdio with the
            command in its config.
          </p>
        </Card>
      </div>
    </section>
  )
}
