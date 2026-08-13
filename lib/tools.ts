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
  /**
   * The **open** PR adding this tool to Zed's extension registry.
   *
   * Zed caps a contributor at three open pull requests, so at most three
   * tools carry one at a time and the rest have none. Absent means there is
   * no submission to link — the page then says the listing does not exist and
   * points at Zed's own instructions for adding the MCP server by hand.
   * Leaving a closed PR here would link a dead review and read as pending.
   */
  readonly zedPr?: number
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
    cratePublished: true,
    name: 'String-LE',
    category: 'extract',
    summary: 'Extract string values from JSON, YAML, CSV, TOML, INI, and .env — for i18n.',
    mcpTool: 'extract_strings',
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
    cratePublished: true,
    name: 'Numbers-LE',
    category: 'extract',
    summary: 'Extract numeric values from JSON, YAML, CSV, TOML, INI, and .env.',
    mcpTool: 'extract_numbers',
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
    cratePublished: true,
    name: 'Paths-LE',
    category: 'extract',
    summary:
      'Pull every file path out of JS/TS imports, JSON, HTML, CSS, TOML, CSV, and .env files.',
    mcpTool: 'extract_paths',
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
    cratePublished: true,
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
    cratePublished: true,
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
    cratePublished: true,
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
    id: 'units-le',
    cratePublished: true,
    name: 'Units-LE',
    category: 'extract',
    summary:
      'Extract every quantity with its unit, normalised to one base unit so two configs can be compared.',
    mcpTool: 'extract_units',
    overview:
      'A number without its unit is not something you can compare. Units-LE finds every quantity in a tree and reports it twice: the text the document actually holds, and that value in one base unit. Four dimensions — duration in milliseconds, bytes, percent as a ratio, frequency in hertz. JSON, YAML, CSV, TOML, INI and dotenv are parsed; everything else is scanned as text, so a Kubernetes manifest or a Markdown table of limits yields its quantities rather than nothing. What it will not do is guess: a bare m is minutes in one config format, milliseconds in another and millicores in Kubernetes, so it comes back refused by name rather than resolved.',
    useCases: [
      {
        title: 'Reconcile two services',
        detail:
          'A timeout of 30s in one file and 30000 in another are the same number of milliseconds, and nothing about the text says so.',
      },
      {
        title: 'Catch the 7% nobody sees',
        detail:
          '1GB and 1GiB look identical at a glance and differ by seventy-three million bytes. The base value is where that shows.',
      },
      {
        title: 'Stop a build on an ambiguity',
        detail:
          'Strict mode exits non-zero if any quantity was refused, so a cpu value of 500m fails review instead of being guessed at.',
      },
    ],
  },
  {
    id: 'ids-le',
    cratePublished: true,
    name: 'IDs-LE',
    category: 'extract',
    summary:
      'Find every UUID, ULID, NanoID, ObjectId and Snowflake, and decode the time inside it.',
    mcpTool: 'extract_ids',
    overview:
      'An identifier usually records when and where something was made, and almost none of that is readable by eye. IDs-LE finds every UUID, ULID, NanoID, MongoDB ObjectId and Snowflake in a tree, says what each one is, and decodes the timestamp inside the ones that carry a clock — six bit layouts over three epochs, one of which starts in 1582, all reported as the same ISO-8601 UTC string. It refuses rather than guesses: thirty-two hex digits are an unhyphenated UUID and an MD5 digest in equal measure, so that run comes back as a row with a named reason instead of a confident wrong answer.',
    useCases: [
      {
        title: 'Date an id with no lookup',
        detail:
          'A v7 UUID, a ULID, an ObjectId or a Snowflake in a log resolves to an instant without a database in the loop.',
      },
      {
        title: 'Stop a regex mislabelling a digest',
        detail:
          'A run that fits two schemes is reported as ambiguous, not classified as whichever pattern happened to match first.',
      },
      {
        title: 'Sweep a repo for placeholders',
        detail:
          'The nil UUID, a v4 that is plainly not random, and a timestamp before 1990 each come back named rather than dropped.',
      },
    ],
  },
  {
    id: 'ips-le',
    cratePublished: true,
    name: 'IPs-LE',
    category: 'extract',
    summary:
      'Find every IP address, CIDR block and MAC address in a tree, normalized and classified.',
    mcpTool: 'extract_ips',
    overview:
      'A regex over dotted quads finds no IPv6 at all, calls 1.2.3 an address, and reports 2001:0db8::0001 and 2001:db8::1 as two different things when they are one. IPs-LE finds every IP address, CIDR block and MAC address in a tree, normalizes IPv6 per RFC 5952, and says what each one is: loopback, private, link-local, cgnat, multicast, broadcast, reserved, documentation, unique-local or global. The scan runs over the bytes of every file, so an address inside a connection string or a rotated log is found too. It never resolves a name, never geolocates and never opens a socket.',
    useCases: [
      {
        title: 'Audit an allow-list',
        detail:
          'Filter to private and loopback and see what a config makes reachable that the change request never mentioned.',
      },
      {
        title: 'Surface an SSRF bypass',
        detail:
          'A leading-zero octet is octal to some resolvers and decimal to others, so 010.1.1.1 is refused by name rather than resolved to either.',
      },
      {
        title: 'Make a diff stop lying',
        detail:
          'Four spellings of one IPv6 address sort as four entries in raw text and as one after normalization.',
      },
    ],
  },
  {
    id: 'regex-le',
    cratePublished: true,
    name: 'Regex-LE',
    category: 'check',
    summary:
      'Find, test, and validate the regular expressions in any file — match reports and built-in ReDoS screening.',
    mcpTool: 'extract_patterns',
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
    id: 'versions-le',
    cratePublished: true,
    name: 'Versions-LE',
    category: 'check',
    summary:
      'Find where the same dependency is constrained differently across a repository’s manifests.',
    mcpTool: 'compare_versions',
    overview:
      'The build broke because one crate asks for serde 1.0.200 and another asks for serde 2. Or it did not break, and will, because CI has been running on a toolchain below the minimum a manifest declares. Versions-LE reads the version constraints across package.json, Cargo.toml, pyproject.toml, go.mod and GitHub workflow files, then reports where the same dependency is constrained inconsistently. Two constraints no single version can satisfy is an error, decided by interval arithmetic rather than string comparison; different but satisfiable is a warning; a floating pin is information. Comparison never crosses an ecosystem, and a grammar it does not model is named in the report rather than approximated into a range.',
    useCases: [
      {
        title: 'Fail before CI does',
        detail:
          'A pair of constraints no single version satisfies is an error and a non-zero exit, so the build stops before the deploy does.',
      },
      {
        title: 'Catch CI below the floor',
        detail:
          'A workflow toolchain that has drifted under the minimum version a manifest declares is the failure nobody notices until a release.',
      },
      {
        title: 'Diff against a baseline',
        detail:
          'The report carries no timestamp, so two runs over an unchanged tree produce identical output and a review can diff them.',
      },
    ],
  },
  {
    id: 'i18n-le',
    cratePublished: true,
    name: 'i18n-LE',
    category: 'check',
    summary:
      'Audit translation catalogues for missing keys, placeholder drift and structural mismatches.',
    mcpTool: 'check_catalogues',
    overview:
      'Spanish shipped last week and the metrics screen has been saying a Spanish-looking placeholder name to every user since: the catalogue had every key, it parsed, and the placeholder came back from machine translation with its name translated too. i18n-LE audits a set of catalogues against one of them and reports what is structurally wrong — keys missing or extra, placeholders dropped or renamed, constructs from the wrong convention, empty values, keys defined twice, and a path that is an object in one locale and a string in another. It works out which library the project uses first, from the manifest, the config, the directory layout, the catalogue syntax and the call sites, because the library is what decides the placeholder grammar. Only key names and structural facts are reported: no translated value ever reaches the output.',
    useCases: [
      {
        title: 'Catch a renamed placeholder',
        detail:
          'Same count, different names — the failure that compiles perfectly and renders the literal to every user of that locale.',
      },
      {
        title: 'See the one real break',
        detail:
          'A path that became a string reads as forty missing keys to a flatten-and-compare test, and as one finding here.',
      },
      {
        title: 'Audit copy you cannot read',
        detail:
          'Findings are proved by tokens, counts and byte offsets, so a vendor’s catalogue can be checked without seeing its prose.',
      },
    ],
  },
  {
    id: 'secrets-le',
    cratePublished: true,
    name: 'Secrets-LE',
    category: 'guard',
    summary:
      'Detect and sanitize credentials, tokens, API keys, and private keys locally — before you commit.',
    mcpTool: 'detect_secrets',
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
    cratePublished: true,
    name: 'EnvSync-LE',
    category: 'guard',
    summary:
      'Spot missing keys across your .env files — automatic checks, a status bar counter, and a markdown report.',
    mcpTool: 'compare_env_files',
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
  {
    id: 'unicode-le',
    cratePublished: true,
    name: 'Unicode-LE',
    category: 'guard',
    summary:
      'Find the Unicode that hides meaning — Trojan Source controls, invisibles, homoglyphs, mixed scripts.',
    mcpTool: 'detect_unicode_risks',
    overview:
      'Some characters are not what they look like. Unicode-LE scans a tree for the ones that hide meaning: the bidirectional controls behind CVE-2021-42574, zero-width and other invisibles, homoglyphs, words no single script accounts for, text that is not in Normalization Form C, and the spaces that are not the space. It reports codepoints and never the characters themselves, because a report that pasted one raw would reorder the terminal, the diff and the pull request of whoever read it. It rewrites nothing. A file plainly written in another script is refused for the homoglyph checks rather than judged by them, which is what lets the screen stay on in an internationalised repository instead of being switched off for noise.',
    useCases: [
      {
        title: 'Gate CI on Trojan Source',
        detail:
          'Fail the build on the bidirectional-control class alone, or on every finding — the exit code is the interface.',
      },
      {
        title: 'Screen for forged names',
        detail:
          'A Cyrillic character sitting in an otherwise Latin word is a finding; a word written wholly in Cyrillic is not.',
      },
      {
        title: 'Explain the string that never matches',
        detail:
          'A zero-width space between two values a hash calls different and a person calls identical, reported at its key.',
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

/**
 * Whether this tool's VS Code extension is still to be written.
 *
 * Read from the generated facts rather than declared by hand, because it is a
 * fact about the repo on the day of the build and not a property of the tool.
 * The newest tools land the Rust crate first and the extension follows, so for
 * a while their repo holds only `crate/`: no manifest, no `l10n/`, no `mcp/`
 * package, no Zed id. Every surface that comes from the extension is absent
 * for exactly as long as this is true, and the pages say "coming" rather than
 * linking a Marketplace listing that would 404.
 *
 * The manifest version is the test because the manifest is what gets
 * published — when it appears, so does everything downstream of it.
 */
export function extensionPending(tool: Tool): boolean {
  return factsFor(tool).version === undefined
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

/**
 * How to start this tool's MCP server, as a command and its arguments.
 *
 * Two shapes, because the server ships in two places and only one of them is
 * always there. The extension repos publish it as an npm package; a tool whose
 * extension is still to be written has no package to `npx`, but its crate
 * already answers `mcp` on stdio — the same server, the same tools, no editor
 * and no Node. Split into command and args because the JSON clients want the
 * two separately and joining then re-splitting is how a config goes wrong.
 */
export function mcpInvocation(tool: Tool): {
  readonly command: string
  readonly args: readonly string[]
} {
  const npmPackage = factsFor(tool).mcpPackage
  if (npmPackage === undefined) return { command: tool.id, args: ['mcp'] }
  return { command: 'npx', args: ['-y', npmPackage] }
}

/** Zed's own instructions, for a tool with no submission to link. */
export const ZED_MCP_DOCS = 'https://zed.dev/docs/ai/mcp'

export function zedPrUrl(tool: Tool): string | undefined {
  if (tool.zedPr === undefined) return undefined
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
  const { command, args } = mcpInvocation(tool)
  return [command, ...args].join(' ')
}

/**
 * The icon, demo and poster a tool's extension repo ships.
 *
 * All three are copied out of the same `src/assets/images/` directory by
 * `sync:demos`, so they arrive together and a repo without that directory yet
 * has none of them. Absent means "not recorded yet", never "does not apply":
 * the pages render a typographic mark and the tool's captured terminal
 * output until the real assets land, and a test pins the icon files on disk
 * to what this reports so the two cannot drift apart.
 */
function assetHash(tool: Tool): { demo: string; poster: string } | undefined {
  return ASSET_HASHES[tool.id]
}

// Icons are downscaled to 128px; refresh them when a tool's branding changes.
export function iconSrc(tool: Tool): string | undefined {
  if (assetHash(tool) === undefined) return undefined
  return `/icons/${tool.id}.png`
}

/**
 * Both carry the file's own hash in the name.
 *
 * They are served with a seven-day cache, and the URL used to be stable — so a
 * corrected image reached nobody who had already visited. The Colors-LE
 * screenshot was fixed and returning visitors kept the wrong one. Naming by
 * content makes a change a new URL, which is what makes the long cache safe.
 */
export function demoSrc(tool: Tool): string | undefined {
  const hash = assetHash(tool)
  if (hash === undefined) return undefined
  return `/demos/${tool.id}.${hash.demo}.gif`
}

export function posterSrc(tool: Tool): string | undefined {
  const hash = assetHash(tool)
  if (hash === undefined) return undefined
  return `/posters/${tool.id}.${hash.poster}.jpg`
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
 * The locale count every shipped extension shares.
 *
 * Copy used to state this as prose and named two tools as English-only long
 * after both shipped translations. Reading it from the registry means the
 * sentence cannot be wrong while the data is right; `sync:registry --check`
 * keeps the data right.
 *
 * Counted over the extensions that exist. A tool whose extension is still to
 * be written has no `l10n/` to count and reports nothing — including it as a
 * zero would break the one-count invariant and put "0 languages" on the page,
 * which is a claim about a catalogue nobody has written rather than a fact.
 */
export const LOCALE_COUNT: number = (() => {
  const counts = new Set(
    TOOLS.map(tool => factsFor(tool).locales).filter(count => count !== undefined),
  )
  if (counts.size !== 1) {
    throw new Error(`the shipped extensions no longer share one locale count: ${[...counts]}`)
  }
  return [...counts][0] ?? 0
})()

/** The npm package that carries this tool's MCP server, once one is published. */
export function mcpPackageFor(tool: Tool): string | undefined {
  return factsFor(tool).mcpPackage
}

/** The crate a tool ships, or undefined for the ones that ship none. */
export function crateFor(tool: Tool): { name: string; version: string } | undefined {
  return factsFor(tool).crate
}

export function crateUrl(name: string): string {
  return `https://crates.io/crates/${name}`
}

/**
 * Every tool that ships a Rust CLI, published or not.
 *
 * Counted rather than written out, because the home page states the number
 * next to the family size and the two moved independently: the copy said five
 * for as long as it took the next five crates to land.
 */
export const CRATE_TOOLS: readonly Tool[] = TOOLS.filter(tool => crateFor(tool) !== undefined)

export interface PublishedCrate {
  readonly tool: Tool
  readonly name: string
  readonly version: string
}

/**
 * The crates that are live on crates.io, in registry order.
 *
 * Derived rather than listed, because the home page puts these names in an
 * install command a reader copies. A hand-typed list is a second place to
 * forget when the next crate publishes, and the reader finds out by running a
 * command that fails. Throwing here fails the build instead: a tool that
 * claims a published crate while its repo defines none would otherwise drop
 * out of every crate surface without ever looking wrong.
 */
export const PUBLISHED_CRATES: readonly PublishedCrate[] = TOOLS.filter(
  tool => tool.cratePublished === true,
).map(tool => {
  const crate = crateFor(tool)
  if (crate === undefined) {
    throw new Error(`${tool.id} claims a published crate but its repo defines none`)
  }
  return { tool, name: crate.name, version: crate.version }
})

/** One command that installs every published CLI. */
export function cargoInstallCommand(): string {
  return `cargo install ${PUBLISHED_CRATES.map(crate => crate.name).join(' ')}`
}
