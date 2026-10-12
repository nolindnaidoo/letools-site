'use client'

import { CommandSnippet } from '@/components/command-snippet'
import { NewTab } from '@/components/new-tab'
import { SectionHeading } from '@/components/section-heading'
import { HOST_NAMES } from '@/lib/mcp-config'
import { byDownloads } from '@/lib/popularity'
import {
  MARKETPLACE_PUBLISHER_URL,
  OPENVSX_NAMESPACE,
  OPENVSX_NAMESPACE_URL,
  PUBLISHER,
} from '@/lib/site'
import { CRATE_TOOLS, cargoInstallCommand, PUBLISHED_CRATES, TOOLS, toolPath } from '@/lib/tools'
import { Link } from '@/ui/link'
import { Separator } from '@/ui/separator'
import { Tabs } from '@/ui/tabs'

// One representative command per surface; the placeholder id is swappable
// for any tool id from the list above.
//
// VS Code resolves the Marketplace and Cursor, Windsurf and VSCodium resolve Open VSX.
// The ids match today, and each is still built from its own registry's
// constant, because they have differed before.
const EXAMPLE_ID = 'paths-le'
const MARKETPLACE_ID = `${PUBLISHER}.${EXAMPLE_ID}`
const OPENVSX_ID = `${OPENVSX_NAMESPACE}.${EXAMPLE_ID}`

const SURFACES = [
  {
    id: 'vscode',
    label: 'VS Code',
    command: `ext install ${MARKETPLACE_ID}`,
    note: 'Open the Quick Open bar (Cmd/Ctrl+P) and paste. Works for any tool — swap the id.',
    hub: {
      label: 'Every LE extension on the VS Code Marketplace',
      href: MARKETPLACE_PUBLISHER_URL,
    },
  },
  {
    id: 'cursor',
    label: 'Cursor / Windsurf',
    command: `cursor --install-extension ${OPENVSX_ID}`,
    note: 'Cursor, Windsurf, VSCodium and the other VS Code forks pull from Open VSX. The id is the same as on the Marketplace. Outside Cursor, search for it in the Extensions view.',
    hub: { label: 'Every LE extension on Open VSX', href: OPENVSX_NAMESPACE_URL },
  },
  {
    // Labelled plain "CLI" until five tools shipped an actual Rust CLI, at
    // which point the tab a reader clicks looking for the binary handed them
    // an editor-extension install instead.
    id: 'vscode-cli',
    label: 'VS Code CLI',
    command: `code --install-extension ${MARKETPLACE_ID}`,
    note: 'Scriptable extension installs for dotfiles and machine setup. For the standalone binaries, see the Rust CLI below.',
    hub: undefined,
  },
  {
    id: 'agents',
    label: 'AI agents',
    command: `npx -y ${EXAMPLE_ID}-mcp`,
    note: `Every tool also runs as an MCP server, so an agent can call the same engine with no editor involved: ${HOST_NAMES.join(', ')} or any other MCP host. The next section writes the config for yours. In VS Code 1.101+ the extension registers it for you. Swap the id for any tool.`,
    hub: undefined,
  },
] as const

// The command and the list under it name the same crates in the same order.
const CRATES = byDownloads(PUBLISHED_CRATES, crate => crate.tool.id)

export function Install() {
  return (
    <section id="install" className="wrap scroll-mt-20 py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <SectionHeading
          eyebrow="Install"
          title="Pick your editor."
          lede="Every tool installs the same way."
          className="lg:col-span-4"
        />

        <div className="flex flex-col lg:col-span-8">
          <Tabs defaultSelectedKey="vscode">
            <Tabs.ListContainer className="mb-4">
              <Tabs.List aria-label="Install surface">
                {SURFACES.map(surface => (
                  <Tabs.Tab key={surface.id} id={surface.id}>
                    {surface.label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>

            {SURFACES.map(surface => (
              <Tabs.Panel key={surface.id} id={surface.id} className="flex flex-col gap-3">
                <CommandSnippet command={surface.command} label={surface.label} />
                <p className="text-muted text-sm">{surface.note}</p>
                {surface.hub !== undefined && (
                  <p className="text-sm">
                    <Link href={surface.hub.href} target="_blank" rel="noreferrer">
                      {surface.hub.label}
                      <NewTab />
                    </Link>
                  </p>
                )}
              </Tabs.Panel>
            ))}
          </Tabs>

          {/*
            Outside the tabs on purpose. A tab renders only while it is selected,
            so a reader arriving for the CLIs saw an editor command and no sign the
            binaries exist. The counts and the names are read from the registry —
            the next crate to publish joins this line without an edit.
          */}
          <Separator className="my-10" />

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xl tracking-tight">Rust CLI</h3>
            <p className="text-pretty text-muted">
              {CRATE_TOOLS.length} of the {TOOLS.length} also ship a standalone binary — the same
              engine over a whole repository, with no editor and no Node, and an MCP server in the
              same file. {PUBLISHED_CRATES.length} of them are on crates.io today; the rest build
              from their repository until they publish.
            </p>
            <CommandSnippet command={cargoInstallCommand(CRATES)} label="Rust CLI" />
            {/* A grid, not a run of names with dots between them: the run
                broke wherever the line ended, leaving a dot to open one row
                and a single name on the last. */}
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-3 md:grid-cols-4">
              {CRATES.map(crate => (
                <li key={crate.name}>
                  <Link href={toolPath(crate.tool)}>{crate.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
