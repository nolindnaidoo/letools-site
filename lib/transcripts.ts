import type { Tool } from './tools'

/**
 * Real terminal output, captured from each tool's built binary.
 *
 * Every other tool on this site leads with a recording of its editor command,
 * because that is what using it looks like. The newest tools have no editor
 * command yet — their VS Code extension has not been written, so there is no
 * screen to record and a GIF would have to be staged. What they do have is a
 * CLI that already works, so what stands in until a recording exists is what
 * it actually prints.
 *
 * Nothing here is typed by hand. Each block was produced by running the
 * release binary from the tool's own repo against the tree in `input`, and
 * pasting stdout's human half back. Re-capture rather than edit: an output
 * that drifts from the binary is the same lie as an invented screenshot, and
 * it is the exact failure the content-truth rule in AGENTS.md exists to stop.
 *
 * These tools put their machine-readable report on stdout and the human
 * summary on stderr — `exit` is part of the answer, not an afterthought, so it
 * is recorded too and the pages show it.
 */

export type Transcript = Readonly<{
  /** The command as it was run, from the root of `input`. */
  command: string
  /** What the run printed for a person to read, verbatim. */
  output: string
  /** The process exit code. These tools make it the product; the page says so. */
  exit: number
  /** The tree the command was pointed at, so a reader can rebuild it. */
  input: string
}>

const TRANSCRIPTS: Readonly<Record<string, Transcript>> = Object.freeze({
  'units-le': {
    command: 'units-le config/',
    input: 'a service.yaml and a limits.toml holding the same two settings',
    exit: 0,
    output: `config/limits.toml:1:12  30000ms  30000 milliseconds
config/limits.toml:2:11  1GB  1000000000 bytes
config/service.yaml:1:10  30s  30000 milliseconds
config/service.yaml:2:7  500ms  500 milliseconds
config/service.yaml:3:9  512Mi  536870912 bytes
config/service.yaml:4:11  15%  0.15 ratio
config/service.yaml:5:6  500m  refused: ambiguous_unit
config/service.yaml:6:7  1.5KB  refused: fractional_bytes
8 quantities in 2 files
2 quantities refused, each with a reason`,
  },
  'ids-le': {
    command: 'ids-le audit.json',
    input: 'one JSON document of identifiers pulled from a log',
    exit: 0,
    output: `audit.json:2:17  uuid v7  019ff344-cc00-7abc-8def-0123456789ab  2026-08-12T00:00:00.000Z
audit.json:3:17  ulid  01KZSM9K00ABCDEFGH12345678  2026-08-12T00:00:00.000Z
audit.json:4:18  objectid  6a7bb780a1b2c3d4e5f60718  2026-08-12T00:00:00.000Z
audit.json:5:16  refused (ambiguous_kind)  5d41402abc4b2a76b9719d911017c592  — 32 hex digits are an unhyphenated UUID and an MD5 digest in equal measure; nothing in this document chooses between them
audit.json:6:16  refused (nil_or_max)  00000000-0000-0000-0000-000000000000  — the nil UUID: 128 zero bits, which RFC 9562 defines as naming nothing
3 identifiers in 1 file
2 runs refused`,
  },
  'ips-le': {
    command: 'ips-le network.yaml',
    input: 'a service config with binds, an allow-list and a connection string',
    exit: 0,
    output: `network.yaml:1:7  0.0.0.0  0.0.0.0  reserved
network.yaml:2:11  2001:0db8:0000:0000:0000:0000:0000:0001  2001:db8::1  documentation
network.yaml:3:11  169.254.169.254  169.254.169.254  link-local
network.yaml:5:5  10.0.0.0/8  10.0.0.0/8  private
network.yaml:6:5  192.168.0.0/16  192.168.0.0/16  private
network.yaml:7:8  010.1.1.1  refused OctalHazard
network.yaml:8:16  10.20.30.40  10.20.30.40  private
6 addresses in 1 file
1 refused`,
  },
  'versions-le': {
    command: 'versions-le .',
    input: 'two package.json files in one repository',
    exit: 1,
    output: `error npm: zod ("^3.22.0" (api/package.json) and "^4.0.0" (web/package.json) cannot both be satisfied by one version) [api/package.json, web/package.json]
info npm: react (a dist tag resolves to whatever is newest at install time) [web/package.json]
refused unknown_grammar react: a dist tag is a moving target, not a version range; excluded from comparison [web/package.json]
2 findings across 2 manifests — 1 error, 0 warning, 1 info`,
  },
  'unicode-le': {
    command: 'unicode-le src/',
    input:
      'a source tree holding one Trojan Source line, one forged hostname and a Chinese catalogue',
    exit: 1,
    output: `src/auth.ts:1:18  [high] bidi-control U+202E  right-to-left override: a bidirectional control reorders how the rest of the line renders, so the text a reviewer reads is not the text that runs
src/auth.ts:1:20  [high] bidi-control U+2066  left-to-right isolate: a bidirectional control reorders how the rest of the line renders, so the text a reviewer reads is not the text that runs
src/auth.ts:1:29  [high] bidi-control U+2069  pop directional isolate: a bidirectional control reorders how the rest of the line renders, so the text a reviewer reads is not the text that runs
src/auth.ts:1:30  [high] bidi-control U+2066  left-to-right isolate: a bidirectional control reorders how the rest of the line renders, so the text a reviewer reads is not the text that runs
src/hosts.ts:1:25  [high] mixed-script U+0430  one word written in Cyrillic and Latin: no single script accounts for it, which is how a name that reads as familiar is forged
src/hosts.ts:1:26  [high] confusable U+0430  a Cyrillic character in a word that is not Cyrillic, and it reduces to the codepoint under \`resembles\`: the two are indistinguishable on screen
src/zh-CN.json: 18% of this file's letters are Han, and no expected script was declared for it. The confusable and mixed-script checks did not run here: in a file written in another script there is nothing to tell a forged name from a translated one, and answering anyway would bury the real findings. Every other check did run.
6 findings in 3 files, 1 refused (0 not read at all)
name the expected script with --script to have those files judged too`,
  },
  'i18n-le': {
    command: 'i18n-le locales/',
    input: 'an English catalogue, its Spanish translation, and the package.json above them',
    exit: 1,
    output: `i18next ^26.2.0 — i18next in ../package.json, a directory of <locale>.json, double-brace
es.json: missing nav.settings
es.json: placeholder renamed metrics.headline (timeframe became periodo)
2 findings across 2 catalogues`,
  },
})

/** The captured run for a tool, or undefined for one whose demo is a recording. */
export function transcriptFor(tool: Tool): Transcript | undefined {
  return TRANSCRIPTS[tool.id]
}
