import { SectionHeading } from '@/components/section-heading'
import { factsFor, type Tool } from '@/lib/tools'

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
  const { commands, positions } = factsFor(tool)

  // No extension, no palette. Rendering "0 commands in the palette" over an
  // empty card would read as a tool that does nothing, when what it has is a
  // CLI and an MCP server and no editor front end written for it yet.
  if (commands.length === 0) return null

  return (
    <section id="commands" className="wrap scroll-mt-20 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <SectionHeading
            eyebrow="Palette"
            title={`${commands.length} commands`}
            lede="Open the command palette and type the name. Nothing is bound to a shortcut by default — the editor's keymap is the user's, not ours."
          />
          {/* Read from the manifest, default included. Positions are on in some
              tools and off in others, and one of them means a line where the
              rest mean a line and column, so this cannot be a sentence typed once. */}
          {positions === undefined ? null : (
            <p className="text-muted text-sm">
              <code className="font-mono">{positions.setting}</code>: {positions.says}.{' '}
              {positions.shown ? 'On' : 'Off'} by default.
            </p>
          )}
        </div>

        <ul className="divide-y divide-border border-border border-y lg:col-span-8">
          {commands.map(command => (
            <li
              key={command.id}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <span className="font-medium">{command.title}</span>
              <code className="font-mono text-muted text-sm">{command.id}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
