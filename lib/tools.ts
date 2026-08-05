import { OPENVSX_NAMESPACE, PUBLISHER } from '@/lib/site'

// THE tool registry. The grid, the category tabs, the install examples,
// and every per-tool link render from this list — a new tool is one entry
// here, nothing else. Copy comes from each tool's manifest; keep it in
// step with the extension repos, never embellish.

export const CATEGORIES = [
  { id: 'extract', label: 'Extract' },
  { id: 'check', label: 'Check' },
  { id: 'guard', label: 'Guard' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export interface Tool {
  readonly id: string
  readonly name: string
  readonly category: CategoryId
  readonly summary: string
}

export const TOOLS: readonly Tool[] = [
  {
    id: 'string-le',
    name: 'String-LE',
    category: 'extract',
    summary: 'Extract string values from JSON, YAML, CSV, TOML, INI, and .env — for i18n.',
  },
  {
    id: 'numbers-le',
    name: 'Numbers-LE',
    category: 'extract',
    summary: 'Extract numeric values from JSON, YAML, CSV, TOML, INI, and .env.',
  },
  {
    id: 'paths-le',
    name: 'Paths-LE',
    category: 'extract',
    summary:
      'Pull every file path out of JS/TS imports, JSON, HTML, CSS, TOML, CSV, and .env files.',
  },
  {
    id: 'colors-le',
    name: 'Colors-LE',
    category: 'extract',
    summary: 'Extract and analyze colors from CSS, SCSS, LESS, Stylus, HTML, JS/TS, and SVG.',
  },
  {
    id: 'urls-le',
    name: 'URLs-LE',
    category: 'extract',
    summary: 'Extract URLs from documentation, configs, and code.',
  },
  {
    id: 'dates-le',
    name: 'Dates-LE',
    category: 'extract',
    summary: 'Extract date and time data from logs, configs, and code.',
  },
  {
    id: 'regex-le',
    name: 'Regex-LE',
    category: 'check',
    summary:
      'Find, test, and validate the regular expressions in any file — match reports and built-in ReDoS screening.',
  },
  {
    id: 'scrape-le',
    name: 'Scrape-LE',
    category: 'check',
    summary: 'Check whether a page is actually scrapeable before you burn hours debugging.',
  },
  {
    id: 'secrets-le',
    name: 'Secrets-LE',
    category: 'guard',
    summary:
      'Detect and sanitize credentials, tokens, API keys, and private keys locally — before you commit.',
  },
  {
    id: 'envsync-le',
    name: 'EnvSync-LE',
    category: 'guard',
    summary:
      'Spot missing keys across your .env files — automatic checks, a status bar counter, and a markdown report.',
  },
]

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

export function demoSrc(tool: Tool): string {
  return `/demos/${tool.id}.gif`
}

export function posterSrc(tool: Tool): string {
  return `/posters/${tool.id}.jpg`
}
