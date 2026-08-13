#!/usr/bin/env bun
/**
 * Derive the per-tool facts from the extension repos, into a generated file.
 *
 * Version, command count, locale count, MCP package name and Zed id are all
 * things the repos already know. Typed by hand here they go stale silently —
 * the site claimed Regex-LE and Secrets-LE were English-only long after both
 * shipped twelve translations, because a sentence in a component was the only
 * place that fact lived.
 *
 * The output is committed, because a Vercel build has no sibling checkouts.
 * `--check` regenerates in memory and fails when the committed file no longer
 * matches the repos, which is what turns a generated file into a gate.
 *
 *   bun run sync:registry          rewrite the generated file
 *   bun run sync:registry --check  fail if it is out of date
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../lib/tools'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** The extension repos are checked out beside this one. */
const FLEET = resolve(ROOT, '..')
const OUTPUT = resolve(ROOT, 'lib/tool-facts.generated.ts')

/** One command as the palette shows it. */
export type ToolCommand = Readonly<{ id: string; title: string }>

/** The Rust CLI a tool ships, where it ships one. */
export type CrateFacts = Readonly<{ name: string; version: string }>

/**
 * What a repo says about itself.
 *
 * The extension-side fields are optional because the newest tools land the
 * crate first and the VS Code extension follows: their repo has no
 * `package.json`, no `l10n/`, no `mcp/` and no `zed/extension.toml` yet. That
 * is a repo that has not been finished, not a different kind of tool — every
 * field fills in on its own as the file it is read from appears, and the
 * pages say "coming" for the surfaces that are still absent.
 */
export type ToolFacts = Readonly<{
  /** The extension manifest's version. Absent until the extension exists. */
  version?: string
  /** Palette commands. Empty until the extension exists. */
  commands: readonly ToolCommand[]
  /** Translated locales, excluding the English base bundle. Absent until `l10n/` exists. */
  locales?: number
  /** The npm package carrying the MCP server. Absent until `mcp/` exists. */
  mcpPackage?: string
  /** The Zed extension id. Absent until `zed/extension.toml` exists. */
  zedId?: string
  /** Absent for a tool that ships no crate. */
  crate?: CrateFacts
}>

function json(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** Reads a file only if it is there, so an unwritten surface reads as absent. */
function maybe<T>(path: string, read: (path: string) => T): T | undefined {
  return existsSync(path) ? read(path) : undefined
}

export function factsFor(repo: string): ToolFacts {
  const manifest = maybe(resolve(repo, 'package.json'), json)
  const contributes = (manifest?.contributes ?? {}) as {
    commands?: { command: string; title?: string }[]
  }
  const mcp = maybe(resolve(repo, 'mcp/package.json'), json)

  // Manifest titles are NLS placeholders (`%manifest.command.x.title%`); the
  // English strings live in package.nls.json. Rendering the placeholder would
  // put `%manifest.command.extract.title%` on the page.
  const nls = (maybe(resolve(repo, 'package.nls.json'), json) ?? {}) as Record<string, string>
  const commands: ToolCommand[] = (contributes.commands ?? []).map(command => {
    const raw = command.title ?? ''
    const key = raw.startsWith('%') && raw.endsWith('%') ? raw.slice(1, -1) : ''
    return { id: command.command, title: key === '' ? raw : (nls[key] ?? raw) }
  })

  // `bundle.l10n.json` is the English source, not a translation.
  const locales = maybe(
    resolve(repo, 'l10n'),
    path => readdirSync(path).filter(file => /^bundle\.l10n\.[a-z-]+\.json$/.test(file)).length,
  )

  const zedId = maybe(resolve(repo, 'zed/extension.toml'), path => {
    const id = readFileSync(path, 'utf8').match(/^id\s*=\s*"([^"]+)"/m)?.[1]
    // A manifest that exists and has no id is a broken manifest, not an
    // absent one — emitting `undefined` would put it on the page.
    if (id === undefined) throw new Error(`${repo}: zed/extension.toml has no id`)
    return id
  })

  const crate = maybe(resolve(repo, 'crate/Cargo.toml'), path => {
    const toml = readFileSync(path, 'utf8')
    const name = toml.match(/^name\s*=\s*"([^"]+)"/m)?.[1]
    const version = toml.match(/^version\s*=\s*"([^"]+)"/m)?.[1]
    if (name === undefined || version === undefined) {
      throw new Error(`${repo}: crate/Cargo.toml has no name or version`)
    }
    return { name, version }
  })

  return {
    ...(manifest === undefined ? {} : { version: String(manifest.version) }),
    commands,
    ...(locales === undefined ? {} : { locales }),
    ...(mcp === undefined ? {} : { mcpPackage: String(mcp.name) }),
    ...(zedId === undefined ? {} : { zedId }),
    ...(crate === undefined ? {} : { crate }),
  }
}

export function render(facts: ReadonlyMap<string, ToolFacts>): string {
  const entries = [...facts]
    .map(([id, fact]) => {
      // An absent field is emitted as an absent field, never as a placeholder:
      // the tools whose extension is still to be written have no manifest,
      // no catalogues and no Zed id, and a `''` here would render as one.
      const fields = [
        ...(fact.version === undefined ? [] : [`version: '${fact.version}'`]),
        `commands: ${JSON.stringify(fact.commands)}`,
        ...(fact.locales === undefined ? [] : [`locales: ${fact.locales}`]),
        ...(fact.mcpPackage === undefined ? [] : [`mcpPackage: '${fact.mcpPackage}'`]),
        ...(fact.zedId === undefined ? [] : [`zedId: '${fact.zedId}'`]),
        ...(fact.crate === undefined
          ? []
          : [`crate: { name: '${fact.crate.name}', version: '${fact.crate.version}' }`]),
      ].join(', ')
      return `  '${id}': { ${fields} },`
    })
    .join('\n')

  return `// Generated by scripts/sync-registry.ts — do not edit.
//
// Read from each extension repo: the manifest version and command count, the
// translated locale bundles, the MCP package name, and the Zed extension id.
// \`bun run sync:registry --check\` fails when this drifts from the repos.
import type { ToolFacts } from '../scripts/sync-registry'

export const TOOL_FACTS: Readonly<Record<string, ToolFacts>> = Object.freeze({
${entries}
})
`
}

export function main(
  check = process.argv.includes('--check'),
  fleet: string = FLEET,
  output: string = OUTPUT,
): number {
  // The checkout itself, not its manifest: a tool whose extension is still to
  // be written has a repo with only `crate/` in it, and demanding a
  // package.json there would refuse a repo that is present and readable.
  const missing = TOOLS.filter(tool => !existsSync(resolve(fleet, tool.id)))
  if (missing.length > 0) {
    const names = missing.map(tool => tool.id).join(', ')
    if (check) {
      // CI and a Vercel build have no sibling checkouts. Refusing here would
      // fail every build for a condition that is normal off a dev machine.
      process.stdout.write(`sync-registry: skipped — no checkouts for ${names}.\n`)
      return 0
    }
    process.stderr.write(`\nsync-registry: no checkout for ${names} beside this repo.\n\n`)
    return 2
  }

  const facts = new Map(TOOLS.map(tool => [tool.id, factsFor(resolve(fleet, tool.id))]))
  const rendered = render(facts)

  if (check) {
    const committed = existsSync(output) ? readFileSync(output, 'utf8') : ''
    if (committed === rendered) {
      process.stdout.write(`Registry facts match the repos across ${facts.size} tools.\n`)
      return 0
    }
    process.stderr.write(
      '\nsync-registry: lib/tool-facts.generated.ts is out of date.\n' +
        'Run `bun run sync:registry` and commit the result.\n\n',
    )
    return 1
  }

  writeFileSync(output, rendered)
  for (const [id, fact] of facts) {
    const extension =
      fact.version === undefined
        ? 'crate only — extension not written yet'
        : `v${fact.version}  ${String(fact.commands.length).padStart(2)} commands  ` +
          `${fact.locales ?? 0} locales`
    process.stdout.write(`  ${id.padEnd(12)} ${extension}\n`)
  }
  return 0
}

/* v8 ignore start -- process entry point; unreachable when imported by a test */
if (import.meta.main) {
  try {
    process.exit(main())
  } catch (cause) {
    const detail = cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)
    process.stderr.write(`\nsync-registry: unexpected failure.\n${detail}\n\n`)
    process.exit(2)
  }
}
/* v8 ignore stop */
