'use client'

import { CommandSnippet } from '@/components/command-snippet'
import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import { cargoInstallCommand, PUBLISHED_CRATES, TOOLS, toolPath } from '@/lib/tools'
import { Link } from '@/ui/link'
import { Separator } from '@/ui/separator'
import { Tabs } from '@/ui/tabs'

// One representative command per surface; the placeholder id is swappable
// for any tool id from the grid above.
//
// The two registries use different namespaces, so the ids are NOT
// interchangeable: VS Code resolves nolindnaidoo.*, while Cursor and VSCodium
// pull from Open VSX and resolve OffensiveEdge.*. Using one id for both is a
// command that simply fails for half the audience.
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
    note: 'VS Code forks pull from Open VSX, where the namespace is OffensiveEdge rather than nolindnaidoo.',
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
    id: 'zed',
    label: 'Zed',
    command: `npx -y ${EXAMPLE_ID}-mcp`,
    note: "Works in Zed today: add the command above as a custom MCP server from the agent panel and the tool appears in its list. The one-click listings are pull requests awaiting review in Zed's extension registry — each tool page links its own.",
  },
  {
    id: 'agents',
    label: 'AI agents',
    command: `npx -y ${EXAMPLE_ID}-mcp`,
    note: 'Every tool also runs as an MCP server, so an agent can call the same engine with no editor involved — Claude Code, Cursor, Windsurf, Zed. In VS Code 1.101+ the extension registers it for you. Swap the id for any tool.',
  },
] as const

export function Install() {
  return (
    <section id="install" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Install</h2>
        <p className="text-muted">Pick your editor. Every tool installs the same way.</p>
      </div>

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
            <p className="text-sm text-muted">{surface.note}</p>
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
        <h3 className="text-xl font-bold tracking-tight">Rust CLI</h3>
        <p className="text-muted">
          {PUBLISHED_CRATES.length} of the {TOOLS.length} also ship a standalone binary — the same
          engine over a whole repository, with no editor and no Node. Each one also runs as an MCP
          server.
        </p>
        <CommandSnippet command={cargoInstallCommand()} label="Rust CLI" />
        <p className="text-sm text-muted">
          {PUBLISHED_CRATES.map((crate, index) => (
            <span key={crate.name}>
              {index > 0 && ' · '}
              <Link href={toolPath(crate.tool)}>{crate.name}</Link>
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
