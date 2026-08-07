import {
  crateFor,
  demoSrc,
  githubUrl,
  iconSrc,
  marketplaceUrl,
  mcpCommand,
  openVsxUrl,
  posterSrc,
  type Tool,
} from '@/lib/tools'
import { buttonVariants } from '@/ui/button'
import { Chip } from '@/ui/chip'
import { Link } from '@/ui/link'

// "No network access" was false as an unqualified claim: Scrape-LE loads the
// page it is checking, which is the whole job. The home hero scopes it for the
// family; a tool page can be exact, so it is.
function badgesFor(tool: Tool): readonly string[] {
  return [
    'Free',
    'Open source',
    'MIT',
    tool.fetchesTarget === true ? 'Only fetches the page you check' : 'No network access',
  ]
}

/**
 * Every tool ships through at least four channels and this hero offered one.
 * A visitor on Cursor, VSCodium or an agent host read "Install for VS Code"
 * and left — the other channels were three screens down, past the fold, on a
 * page they had no reason to keep scrolling.
 *
 * The two registries resolve *different* ids for the same extension, so these
 * are separate links rather than one: an Open VSX visitor sent to the
 * Marketplace id installs nothing.
 */
export function ToolHero({ tool }: { readonly tool: Tool }) {
  const crate = crateFor(tool)

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pb-12 pt-16 text-center sm:px-6">
      <img src={iconSrc(tool)} alt="" width={72} height={72} className="size-18 rounded-2xl" />

      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{tool.name}</h1>

      <p className="max-w-2xl text-pretty text-lg text-muted">{tool.summary}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {badgesFor(tool).map(badge => (
          <Chip key={badge} size="sm" variant="soft" color="accent">
            {badge}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={marketplaceUrl(tool)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'primary', size: 'lg' })}
        >
          Install for VS Code
        </Link>
        <Link
          href={openVsxUrl(tool)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'secondary', size: 'lg' })}
        >
          Install for Cursor &amp; VSCodium
        </Link>
        <Link
          href={githubUrl(tool)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Source on GitHub
        </Link>
      </div>

      {/* The commands lead the sentence rather than ending it: a code span
          carries its own padding, so a period after one renders as "scrape-le
          ." — the same trap the Zed note hit in the install section. */}
      <p className="max-w-2xl text-pretty text-sm text-muted">
        No editor in the loop?{' '}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
          {mcpCommand(tool)}
        </code>{' '}
        runs the same engine as an MCP server, so an agent can call {tool.mcpTool} with nothing else
        installed
        {/* Only once the publish lands: a crates.io link before it is a 404
            that looks like a broken tool. The channels section carries the
            qualified version until then. */}
        {crate !== undefined && tool.cratePublished === true ? (
          <>
            {', and '}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
              {`cargo install ${crate.name}`}
            </code>{' '}
            puts the same check in a terminal
          </>
        ) : null}
        {'. '}
        <Link href="#install">Every way to install it</Link>
        {'.'}
      </p>

      <img
        src={demoSrc(tool)}
        // The demo is the pitch, so it carries a real description rather than
        // being decorative — a reader on a slow connection or a screen reader
        // still learns what the tool does.
        alt={`${tool.name} in use: ${tool.summary}`}
        // Poster dimensions; the GIF is authored to match.
        loading="lazy"
        decoding="async"
        className="mt-4 w-full rounded-xl border border-default"
        style={{ backgroundImage: `url(${posterSrc(tool)})`, backgroundSize: 'cover' }}
      />
    </section>
  )
}
