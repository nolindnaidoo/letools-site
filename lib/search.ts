import { factsFor, type Tool, toolPath } from './tools'

/**
 * A client-side index over everything the registry knows.
 *
 * The site had no search. With ten tools, ~60 commands and ten MCP servers,
 * the only way to find "the one that pulls dates out of a CSV" was to read the
 * grid and guess from names. That is fine at ten tools and already awkward at
 * sixty commands.
 *
 * The index is built from the same registry the pages render from, so anything
 * findable here is real, and anything that ships is findable.
 */

export type EntryKind = 'tool' | 'command' | 'mcp'

export type Entry = Readonly<{
  kind: EntryKind
  /** What the user reads. */
  label: string
  /** The second line — what distinguishes two similar labels. */
  detail: string
  href: string
  /** Lower sorts first when scores tie, so tools lead their own commands. */
  rank: number
  /** Pre-lowercased haystack; building it per keystroke is the slow way. */
  haystack: string
}>

function entry(kind: EntryKind, label: string, detail: string, href: string, rank: number): Entry {
  return { kind, label, detail, href, rank, haystack: `${label} ${detail}`.toLowerCase() }
}

export function buildIndex(tools: readonly Tool[]): readonly Entry[] {
  const entries: Entry[] = []

  for (const tool of tools) {
    const facts = factsFor(tool)
    const path = toolPath(tool)

    entries.push(entry('tool', tool.name, tool.summary, path, 0))

    // The MCP surface is the part nobody can currently find: an agent author
    // searching "extract_strings" should land on the tool that answers to it.
    entries.push(
      entry('mcp', tool.mcpTool, `MCP tool · ${facts.mcpPackage}`, `${path}#channels`, 1),
    )

    for (const command of facts.commands) {
      entries.push(
        entry('command', command.title, `${tool.name} · ${command.id}`, `${path}#commands`, 2),
      )
    }
  }

  return Object.freeze(entries)
}

/**
 * Score one entry against a query. Higher is better; 0 means no match.
 *
 * Deliberately not fuzzy. A fuzzy matcher makes "csv" match "Colors-LE" through
 * scattered letters, and a result list that returns everything is the same as
 * no search. Substring matching with a bonus for word starts is what people
 * actually expect from a palette.
 */
export function score(entry: Entry, query: string): number {
  const needle = query.trim().toLowerCase()
  if (needle === '') return 0

  const label = entry.label.toLowerCase()
  if (label === needle) return 100
  if (label.startsWith(needle)) return 80
  // A word start inside the label: "strings" should find "Extract Strings".
  if (new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(label)) return 60
  if (entry.haystack.includes(needle)) return 30
  return 0
}

export function search(index: readonly Entry[], query: string, limit = 12): readonly Entry[] {
  const scored = index
    .map(item => ({ item, value: score(item, query) }))
    .filter(result => result.value > 0)

  scored.sort((a, b) => b.value - a.value || a.item.rank - b.item.rank)
  return scored.slice(0, limit).map(result => result.item)
}
