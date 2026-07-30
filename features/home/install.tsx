'use client'

import { CommandSnippet } from '@/components/command-snippet'
import { PUBLISHER } from '@/lib/site'
import { Tabs } from '@/ui/tabs'

// One representative command per surface; the placeholder id is swappable
// for any tool id from the grid above.
const EXAMPLE_ID = `${PUBLISHER}.paths-le`

const SURFACES = [
  {
    id: 'vscode',
    label: 'VS Code',
    command: `ext install ${EXAMPLE_ID}`,
    note: 'Open the Quick Open bar (Cmd/Ctrl+P) and paste. Works for any tool — swap the id.',
  },
  {
    id: 'cursor',
    label: 'Cursor / VSCodium',
    command: `cursor --install-extension ${EXAMPLE_ID}`,
    note: 'VS Code forks install from Open VSX; every tool is published there under the same ids.',
  },
  {
    id: 'cli',
    label: 'CLI',
    command: `code --install-extension ${EXAMPLE_ID}`,
    note: 'Scriptable installs for dotfiles and machine setup.',
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
            <CommandSnippet command={surface.command} />
            <p className="text-sm text-muted">{surface.note}</p>
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  )
}
