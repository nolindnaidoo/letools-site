import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'
import { ASSET_HASHES } from './asset-hashes.generated'
import { TOOL_FACTS } from './tool-facts.generated'

// THE tool registry. The grid, the category tabs, the install examples,
// and every per-tool link render from this list — a new tool is one entry
// here, nothing else. Copy comes from each tool's manifest; keep it in
// step with the extension repos, never embellish.

export const CATEGORIES = Object.freeze([
  { id: 'extract', label: 'Extract' },
  { id: 'check', label: 'Check' },
  { id: 'guard', label: 'Guard' },
] as const)

export type CategoryId = (typeof CATEGORIES)[number]['id']

export interface Tool {
  readonly id: string
  readonly name: string
  readonly category: CategoryId
  readonly summary: string
  // The MCP tool an agent calls. Read from each repo's src/mcp/tools.ts —
  // renaming one breaks every agent prompt that references it, so it is
  // pinned by a golden test there and quoted verbatim here.
  readonly mcpTool: string
  // The open PR adding this tool to Zed's extension registry. Submitted, not
  // merged — the site says so rather than implying a listing that does not
  // exist yet. Delete this field once they land and link the listing instead.
  readonly zedPr: number
  /**
   * Whether the Rust crate is live on crates.io.
   *
   * Hand-set, because only a person knows the moment `cargo publish` returns —
   * the crate's own name and version are read from the repo. While this is
   * false the page describes the CLI and links its source; it never links a
   * crates.io page that would 404. The drift check fails if this claims
   * published and the registry disagrees.
   */
  readonly cratePublished?: boolean
  /**
   * Set on the one tool that reaches the network.
   *
   * Hand-set like `cratePublished`, because no manifest states it. The tool
   * pages badged all ten "No network access" long after Scrape-LE started
   * loading the page it is checking — which is the whole job, not an
   * oversight. The home hero already scopes the claim; this is what lets a
   * tool page do the same.
   */
  readonly fetchesTarget?: boolean
  // Long-form copy for the tool's own page. Paraphrased from that tool's
  // README — the content-truth rule applies here as everywhere: a claim on
  // this site must be provable against the extension repo.
  readonly overview: string
  readonly useCases: readonly { readonly title: string; readonly detail: string }[]
}

export const TOOLS: readonly Tool[] = Object.freeze([
  {
    id: 'string-le',
    name: 'String-LE',
    category: 'extract',
    summary: 'Extract string values from JSON, YAML, CSV, TOML, INI, and .env — for i18n.',
    mcpTool: 'extract_strings',
    zedPr: 7082,
    overview:
      'Locale files, config files and CSV exports all bury their string values in structure. String-LE flattens that structure away: run one command and every string value in the document lands in a new editor, ready to paste into a translation tool or scan by eye. It parses JSON, YAML, CSV, TOML, INI and .env, and streams large CSVs rather than loading them whole.',
    useCases: [
      {
        title: 'i18n prep',
        detail:
          'Flatten locale files into a clean list of translatable values, without the key hierarchy in the way.',
      },
      {
        title: 'Config review',
        detail: 'See every string value in a TOML, INI or .env file at a glance.',
      },
      {
        title: 'CSV mining',
        detail:
          'Pull one column, several, or all of them — large files stream rather than loading whole.',
      },
    ],
  },
  {
    id: 'numbers-le',
    name: 'Numbers-LE',
    category: 'extract',
    summary: 'Extract numeric values from JSON, YAML, CSV, TOML, INI, and .env.',
    mcpTool: 'extract_numbers',
    zedPr: 7080,
    overview:
      'Numbers are the values most likely to be wrong and least likely to be read. Numbers-LE pulls every numeric value out of a config, fixture or data file into a plain list, so ranges and outliers are visible at a glance instead of buried in syntax. It parses JSON, YAML, CSV, TOML, INI and .env, and falls back to scanning plain text for anything else.',
    useCases: [
      {
        title: 'Data validation',
        detail: 'Pull the numbers out of a config or fixture and eyeball the ranges at a glance.',
      },
      {
        title: 'Config audits',
        detail: 'Compare ports, thresholds and limits across INI, TOML and .env files.',
      },
      {
        title: 'CSV work',
        detail: 'Extract everything, one column, or several columns into separate documents.',
      },
    ],
  },
  {
    id: 'paths-le',
    name: 'Paths-LE',
    category: 'extract',
    summary:
      'Pull every file path out of JS/TS imports, JSON, HTML, CSS, TOML, CSV, and .env files.',
    mcpTool: 'extract_paths',
    zedPr: 7081,
    overview:
      'A path in an import, an asset reference or a config value is a dependency you cannot see until something breaks. Paths-LE extracts every file and directory path from the active document and classifies each one, so a refactor or an asset audit starts from a list rather than a search. It reads JS/TS imports including multi-line statements, HTML and CSS references, and JSON, TOML, CSV and .env values.',
    useCases: [
      {
        title: 'Import analysis',
        detail:
          'Extract local imports from JS/TS, including multi-line statements — npm package names are filtered out.',
      },
      {
        title: 'Asset auditing',
        detail: 'Every src, href, srcset, url() and @import in your HTML and CSS.',
      },
      {
        title: 'Config review',
        detail: 'Path-like values from JSON, JSONC, TOML, CSV and .env files.',
      },
    ],
  },
  {
    id: 'colors-le',
    name: 'Colors-LE',
    category: 'extract',
    summary: 'Extract and analyze colors from CSS, SCSS, LESS, Stylus, HTML, JS/TS, and SVG.',
    mcpTool: 'extract_colors',
    zedPr: 7078,
    overview:
      'Design systems drift one hard-coded hex at a time. Colors-LE extracts every color from a stylesheet, template or component file — hex, rgb/rgba, hsl/hsla and named colors — then analyses the result: distribution, clusters of near-duplicates, and contrast ratios against WCAG AA and AAA. It reads CSS, SCSS, LESS, Stylus, HTML, JavaScript, TypeScript and SVG.',
    useCases: [
      {
        title: 'Palette auditing',
        detail:
          'Every hex, rgb()/rgba(), hsl()/hsla() and named color across stylesheets, markup and code.',
      },
      {
        title: 'Design-system review',
        detail: 'Analyse distribution, cluster similar colors, and spot near-duplicates.',
      },
      {
        title: 'Accessibility checks',
        detail: 'Contrast ratios against WCAG AA and AAA via the Validate command.',
      },
    ],
  },
  {
    id: 'urls-le',
    name: 'URLs-LE',
    category: 'extract',
    summary: 'Extract URLs from documentation, configs, and code.',
    mcpTool: 'extract_urls',
    zedPr: 7077,
    overview:
      'Links rot quietly, and the ones in your code and docs are the hardest to inventory. URLs-LE pulls every URL out of the active document with its real line and column, so a link audit is a list rather than a grep. It reads Markdown, HTML, CSS, JavaScript, TypeScript, JSON, YAML, Properties, TOML, INI and XML, and excludes code blocks and comments where the format defines them.',
    useCases: [
      {
        title: 'Link auditing',
        detail:
          'Every link, autolink and plain URL in Markdown and HTML — code blocks and comments excluded.',
      },
      {
        title: 'Source review',
        detail:
          'URLs in string literals, template literals and comments across JavaScript and TypeScript.',
      },
      {
        title: 'Config sweep',
        detail: 'URLs in JSON strings, YAML values, Java properties, TOML/INI values and XML.',
      },
    ],
  },
  {
    id: 'dates-le',
    name: 'Dates-LE',
    category: 'extract',
    summary: 'Extract date and time data from logs, configs, and code.',
    mcpTool: 'extract_dates',
    zedPr: 7079,
    overview:
      'Timestamps arrive in a dozen notations and rarely the one you want. Dates-LE extracts every date and time value from logs, data files and code, reporting each with its format and, where resolvable, its epoch value. It recognises ISO 8601, syslog and Apache access-log formats, common regional notations and Unix timestamps.',
    useCases: [
      {
        title: 'Log analysis',
        detail: 'Timestamps from server logs — ISO, syslog and Apache access-log formats.',
      },
      {
        title: 'Data review',
        detail: 'Dates and epochs from JSON, YAML, CSV and XML.',
      },
      {
        title: 'Code audit',
        detail:
          'Date literals and the arguments to new Date(), Date.parse(), moment(), dayjs() and DateTime.fromISO().',
      },
    ],
  },
  {
    id: 'regex-le',
    name: 'Regex-LE',
    category: 'check',
    summary:
      'Find, test, and validate the regular expressions in any file — match reports and built-in ReDoS screening.',
    mcpTool: 'extract_patterns',
    zedPr: 7083,
    overview:
      'A regular expression is easy to write and hard to trust. Regex-LE finds every pattern in the current file, runs one against the document to show real matches with line and column positions and capture groups, and screens each pattern for the shapes that cause catastrophic backtracking. Three commands: extract, test, validate.',
    useCases: [
      {
        title: 'Extract',
        detail:
          'List every regex pattern found in the document, literals and RegExp constructors alike.',
      },
      {
        title: 'Test',
        detail:
          'Run a found — or manually entered — pattern against the file and see matches with positions and named capture groups.',
      },
      {
        title: 'Validate',
        detail:
          'Check every pattern for syntax errors and screen it for ReDoS-prone shapes before it reaches production.',
      },
    ],
  },
  {
    id: 'scrape-le',
    cratePublished: true,
    fetchesTarget: true,
    name: 'Scrape-LE',
    category: 'check',
    summary: 'Check whether a page is actually scrapeable before you burn hours debugging.',
    mcpTool: 'analyze_robots_txt',
    zedPr: 7086,
    overview:
      'Whether a page can be scraped is a question best answered before the scraper is written. Scrape-LE loads a URL in a real headless Chromium and reports what it found: HTTP status, page title, load time, console errors, a full-page screenshot, and four detections covering anti-bot measures, authentication requirements, rate limiting and robots.txt rules.',
    useCases: [
      {
        title: 'Before you write the scraper',
        detail:
          'Find out whether a page is reachable, gated or defended — before the work, not after.',
      },
      {
        title: 'Real browser, real answer',
        detail:
          'The page loads in headless Chromium, so client-rendered content and bot checks behave as they actually will.',
      },
      {
        title: 'Respect robots.txt',
        detail:
          'The origin rules are fetched and reported alongside everything else. A scrapeability report is information, not permission.',
      },
    ],
  },
  {
    id: 'secrets-le',
    name: 'Secrets-LE',
    category: 'guard',
    summary:
      'Detect and sanitize credentials, tokens, API keys, and private keys locally — before you commit.',
    mcpTool: 'detect_secrets',
    zedPr: 7085,
    overview:
      'The cheapest place to catch a committed credential is before the commit. Secrets-LE scans your workspace for API keys, passwords, tokens and private keys, groups the findings by file with positions pointing at the value, and can replace them in place with a placeholder. Detection is regex-based over full text, so it works on code, configs, .env files, YAML, JSON and logs alike.',
    useCases: [
      {
        title: 'Pre-commit safety net',
        detail:
          'Scan the workspace and see every detected credential grouped by file, with line and column positions.',
      },
      {
        title: 'Sanitize in place',
        detail:
          'Replace the secrets in the active file with a placeholder, ready to share or paste into an issue.',
      },
      {
        title: 'Patterns, not proof',
        detail:
          'A scanner built on patterns can miss secrets and can flag things that are not. Review the results — it is a net, not a guarantee.',
      },
    ],
  },
  {
    id: 'envsync-le',
    name: 'EnvSync-LE',
    category: 'guard',
    summary:
      'Spot missing keys across your .env files — automatic checks, a status bar counter, and a markdown report.',
    mcpTool: 'compare_env_files',
    zedPr: 7084,
    overview:
      'Environment files drift the moment one of them gains a key. EnvSync-LE compares the variable names across the .env files in your workspace and tells you which file is missing which key — names only, never values. Checks run automatically when a watched file changes, and the current issue count sits in the status bar.',
    useCases: [
      {
        title: 'Automatic checks',
        detail:
          'A debounced sync check runs whenever a watched .env file changes — no command to remember.',
      },
      {
        title: 'Three comparison modes',
        detail:
          'auto compares against the union of all keys, manual only the files you list, template validates everything against one reference file.',
      },
      {
        title: 'Names, never values',
        detail:
          'The report lists missing keys by name. The values in a .env file are exactly what should not be copied around.',
      },
    ],
  },
])

export function findTool(id: string): Tool | undefined {
  return TOOLS.find(tool => tool.id === id)
}

// The tool's own page on this site. Every other link here points off-site;
// this is the one that keeps a visitor here, and it is what the sitemap
// enumerates.
export function toolPath(tool: Tool): string {
  return `/tools/${tool.id}`
}

export function marketplaceUrl(tool: Tool): string {
  return `https://marketplace.visualstudio.com/items?itemName=${PUBLISHER}.${tool.id}`
}

export function openVsxUrl(tool: Tool): string {
  return `https://open-vsx.org/extension/${OPENVSX_NAMESPACE}/${tool.id}`
}

export function githubUrl(tool: Tool): string {
  return `https://github.com/${PUBLISHER}/${tool.id}`
}

// Every tool also ships its engine as an MCP server, so an agent can call it
// without the editor in the loop. The npm package and the registry id are both
// derived from the tool id — one naming rule, no table to keep in step.
export function npmUrl(tool: Tool): string {
  return `https://www.npmjs.com/package/${tool.id}-mcp`
}

export function zedPrUrl(tool: Tool): string {
  return `https://github.com/zed-industries/extensions/pull/${tool.zedPr}`
}

export function mcpRegistryUrl(tool: Tool): string {
  return `https://registry.modelcontextprotocol.io/v0/servers?search=${tool.id}`
}

export function mcpServerName(tool: Tool): string {
  return `io.github.${PUBLISHER}/${tool.id}`
}

export function installCommand(tool: Tool): string {
  return `ext install ${PUBLISHER}.${tool.id}`
}

export function mcpCommand(tool: Tool): string {
  return `npx -y ${tool.id}-mcp`
}

// Assets are copied from each tool repo's src/assets/images (icons
// downscaled to 128px); refresh them when a tool's branding changes.
export function iconSrc(tool: Tool): string {
  return `/icons/${tool.id}.png`
}

function assetHash(tool: Tool): { demo: string; poster: string } {
  const hash = ASSET_HASHES[tool.id]
  if (hash === undefined) {
    throw new Error(`${tool.id} has no asset hashes — run \`bun run sync:demos\``)
  }
  return hash
}

/**
 * Both carry the file's own hash in the name.
 *
 * They are served with a seven-day cache, and the URL used to be stable — so a
 * corrected image reached nobody who had already visited. The Colors-LE
 * screenshot was fixed and returning visitors kept the wrong one. Naming by
 * content makes a change a new URL, which is what makes the long cache safe.
 */
export function demoSrc(tool: Tool): string {
  return `/demos/${tool.id}.${assetHash(tool).demo}.gif`
}

export function posterSrc(tool: Tool): string {
  return `/posters/${tool.id}.${assetHash(tool).poster}.jpg`
}

/**
 * The facts derived from each extension repo — version, command count,
 * translated locales, MCP package, Zed id. Generated by
 * `scripts/sync-registry.ts`, which also has a `--check` mode that fails when
 * the committed file drifts from the repos.
 */
export function factsFor(tool: Tool): (typeof TOOL_FACTS)[string] {
  const facts = TOOL_FACTS[tool.id]
  if (facts === undefined) {
    throw new Error(`${tool.id} has no generated facts — run \`bun run sync:registry\``)
  }
  return facts
}

/**
 * The locale count the whole family shares.
 *
 * Copy used to state this as prose and named two tools as English-only long
 * after both shipped translations. Reading it from the registry means the
 * sentence cannot be wrong while the data is right; `sync:registry --check`
 * keeps the data right.
 */
export const LOCALE_COUNT: number = (() => {
  const counts = new Set(TOOLS.map(tool => factsFor(tool).locales))
  if (counts.size !== 1) {
    throw new Error(`the fleet no longer shares one locale count: ${[...counts].join(', ')}`)
  }
  return [...counts][0] ?? 0
})()

/** The npm package that carries this tool's MCP server. */
export function mcpPackageFor(tool: Tool): string {
  return factsFor(tool).mcpPackage
}

/** The crate a tool ships, or undefined for the nine that ship none. */
export function crateFor(tool: Tool): { name: string; version: string } | undefined {
  return factsFor(tool).crate
}

export function crateUrl(name: string): string {
  return `https://crates.io/crates/${name}`
}
