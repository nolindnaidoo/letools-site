'use client'

import { CommandSnippet } from '@/components/command-snippet'
import { SectionHeading } from '@/components/section-heading'
import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import { CRATE_TOOLS, cargoInstallCommand, PUBLISHED_CRATES, TOOLS, toolPath } from '@/lib/tools'
import { Link } from '@/ui/link'
import { Separator } from '@/ui/separator'
import { Tabs } from '@/ui/tabs'

// One representative command per surface; the placeholder id is swappable
// for any tool id from the list above.
//
// VS Code resolves the Marketplace and Cursor and VSCodium resolve Open VSX.
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
  },
  {
    id: 'cursor',
    label: 'Cursor / VSCodium',
    command: `cursor --install-extension ${OPENVSX_ID}`,
    note: 'VS Code forks pull from Open VSX. The id is the same as on the Marketplace.',
  },
  {
    // Labelled plain "CLI" until five tools shipped an actual Rust CLI, at
    // which point the tab a reader clicks looking for the binary handed them
    // an editor-extension install instead.
    id: 'vscode-cli',
    label: 'VS Code CLI',
    command: `code --install-extension ${MARKETPLACE_ID}`,
    note: 'Scriptable extension installs for dotfiles and machine setup. For the standalone binaries, see the Rust CLI below.',
  },
  {
    id: 'agents',
    label: 'AI agents',
    command: `npx -y ${EXAMPLE_ID}-mcp`,
    note: 'Every tool also runs as an MCP server, so an agent can call the same engine with no editor involved — Claude Code, Cursor, Windsurf. In VS Code 1.101+ the extension registers it for you. Swap the id for any tool.',
  },
] as const

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
            <CommandSnippet command={cargoInstallCommand()} label="Rust CLI" />
            <p className="font-mono text-muted text-sm">
              {PUBLISHED_CRATES.map((crate, index) => (
                <span key={crate.name}>
                  {index > 0 && ' · '}
                  <Link href={toolPath(crate.tool)}>{crate.name}</Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
