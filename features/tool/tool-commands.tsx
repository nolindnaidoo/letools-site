import { factsFor, type Tool } from '@/lib/tools'
import { Card } from '@/ui/card'

/**
 * Every command this tool contributes, as the palette shows it.
 *
 * The list is generated from each repo's manifest, with the titles resolved
 * through `package.nls.json` — the manifest itself stores NLS placeholders, so
 * rendering `title` directly would put `%manifest.command.extract.title%` on
 * the page.
 *
 * This is the answer to "what does it actually do", and the site never showed
 * it: a visitor had to install the extension to find out.
 */
export function ToolCommands({ tool }: { readonly tool: Tool }) {
  const { commands } = factsFor(tool)

  return (
    <section id="commands" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {commands.length} commands in the palette
        </h2>
        <p className="text-muted">
          Open the command palette and type the name. Nothing is bound to a shortcut by default —
          the editor's keymap is the user's, not ours.
        </p>
      </div>

      <Card className="divide-y divide-border">
        {commands.map(command => (
          <div
            key={command.id}
            className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <span className="font-medium">{command.title}</span>
            <code className="font-mono text-sm text-muted">{command.id}</code>
          </div>
        ))}
      </Card>
    </section>
  )
}
