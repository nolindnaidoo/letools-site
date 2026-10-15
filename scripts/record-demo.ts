#!/usr/bin/env node
/**
 * Records one surface of one tool to the standard in DEMOS.md.
 *
 *   bun run record:demo ../string-le editor
 *   bun run record:demo ../string-le cli
 *   bun run record:demo ../string-le mcp
 *
 * Writes `assets/demos/<surface>.mp4`, the master, and `<surface>.gif` made
 * from it, in the tool's repo. Everything the take needs is in
 * `assets/demos/<surface>/` there, so this script holds no tool's content.
 *
 * Editor: Playwright starts the VS Code the tool's integration tests
 * downloaded, with a profile of its own and the packaged extension, and
 * follows `take.json`. Frames are screenshots, lossless, each kept with the
 * time it was taken, because Playwright's own video is too soft to read.
 * CLI and MCP: vhs, driving `<surface>.tape`.
 *
 * macOS only. Needs ffmpeg, and vhs for the terminal surfaces.
 */
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron, type Page } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SURFACES = ['editor', 'cli', 'mcp'] as const
type Surface = (typeof SURFACES)[number]

/** The window, in layout pixels. Captured at twice this and scaled to the frame. */
export const WINDOW = { width: 1200, height: 750 } as const
export const FRAME = { width: 1600, height: 1000 } as const
const FPS = 30

/** One thing the take does, in order. */
export type Step =
  | { readonly wait: number }
  | { readonly command: string }
  | { readonly key: string }
  | { readonly type: string }
  | { readonly hover: string; readonly index?: number }
  | { readonly click: string; readonly index?: number }
  | { readonly open: string }

export type Take = Readonly<{
  /**
   * The files copied into the workspace. The first is opened at start. One
   * given as `{ from, to }` is renamed on the way, so an input such as a
   * `.env` file can be committed under a name nothing ignores.
   */
  files: readonly (string | Readonly<{ from: string; to: string }>)[]
  /** Settings over the shared demo settings, for what only this tool needs. */
  settings?: Readonly<Record<string, unknown>>
  /** A selector that is on screen once the editor is ready to be filmed. */
  ready?: string
  steps: readonly Step[]
}>

function refuse(message: string): never {
  process.stderr.write(`record-demo: ${message}\n`)
  process.exit(2)
}

/** `0 1.0333 ...` as the ffconcat that holds each frame for as long as it was on screen. */
export function concatList(frames: readonly { file: string; at: number }[], end: number): string {
  const lines = ['ffconcat version 1.0']
  frames.forEach((frame, index) => {
    const next = frames[index + 1]?.at ?? end
    lines.push(`file '${frame.file}'`, `duration ${((next - frame.at) / 1000).toFixed(4)}`)
  })
  // The concat demuxer drops the last duration unless the last file is named again.
  const last = frames.at(-1)
  if (last) lines.push(`file '${last.file}'`)
  return `${lines.join('\n')}\n`
}

const MASTER = [
  '-c:v',
  'libx264',
  '-crf',
  '16',
  '-preset',
  'slow',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
]

/** The README GIF, from the master: 10 fps, a palette from this clip, no dithering. */
export const GIF_FILTER =
  'fps=10,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle'

function gifFrom(master: string, gif: string): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', master, '-vf', GIF_FILTER, gif])
}

function latest(dir: string, prefix: string, suffix: string): string | undefined {
  if (!existsSync(dir)) return undefined
  return readdirSync(dir)
    .filter(name => name.startsWith(prefix) && name.endsWith(suffix))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .at(-1)
}

async function run(page: Page, step: Step): Promise<void> {
  const centre = async (selector: string, index = 0) => {
    const box = await page.locator(selector).nth(index).boundingBox()
    if (!box) throw new Error(`nothing on screen matches ${selector}`)
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }
  if ('wait' in step) return page.waitForTimeout(step.wait)
  if ('key' in step) return page.keyboard.press(step.key)
  if ('type' in step) return page.keyboard.type(step.type, { delay: 45 })
  if ('hover' in step) {
    const { x, y } = await centre(step.hover, step.index)
    return page.mouse.move(x, y, { steps: 12 })
  }
  if ('click' in step) {
    const { x, y } = await centre(step.click, step.index)
    await page.mouse.move(x, y, { steps: 12 })
    return page.mouse.click(x, y)
  }
  if ('open' in step) {
    await page.keyboard.press('Meta+p')
    await page.waitForTimeout(500)
    await page.keyboard.type(step.open, { delay: 30 })
    await page.waitForTimeout(500)
    return page.keyboard.press('Enter')
  }
  await page.keyboard.press('Meta+Shift+p')
  await page.waitForTimeout(500)
  await page.keyboard.type(step.command, { delay: 30 })
  await page.waitForTimeout(700)
  await page.keyboard.press('Enter')
}

async function recordEditor(repo: string, inputs: string, master: string): Promise<void> {
  const take = JSON.parse(readFileSync(join(inputs, 'take.json'), 'utf8')) as Take
  const tests = join(repo, '.vscode-test')
  const build = latest(tests, 'vscode-', '')
  if (!build) refuse(`no VS Code build in ${tests}. Run the tool's integration tests once.`)
  // The name and version from the manifest, exactly: `release/` also holds
  // packages from before a rename, and a near match loads the wrong one.
  const manifest = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'))
  const vsix = `${manifest.name}-${manifest.version}.vsix`
  if (!existsSync(join(repo, 'release', vsix)))
    refuse(`no release/${vsix}. Run \`bun run package\`.`)
  const app = join(tests, build, 'Visual Studio Code.app', 'Contents')

  // A socket lives in the profile and its path has a short limit, which the
  // system temp directory is short enough for.
  const work = mkdtempSync(join(tmpdir(), 'rd-'))
  const profile = join(work, 'u')
  const extensions = join(work, 'e')
  const workspace = join(work, 'demo')
  const frames = join(work, 'f')
  for (const dir of [join(profile, 'User'), workspace, frames]) mkdirSync(dir, { recursive: true })
  const base = JSON.parse(readFileSync(join(ROOT, 'scripts/demo-editor-settings.json'), 'utf8'))
  writeFileSync(join(profile, 'User/settings.json'), JSON.stringify({ ...base, ...take.settings }))
  const placed = take.files.map(file =>
    typeof file === 'string' ? { from: file, to: file } : file,
  )
  for (const file of placed) {
    mkdirSync(dirname(join(workspace, file.to)), { recursive: true })
    cpSync(join(inputs, file.from), join(workspace, file.to), { recursive: true })
  }
  execFileSync(
    join(app, 'Resources/app/bin/code'),
    [
      '--install-extension',
      join(repo, 'release', vsix),
      '--extensions-dir',
      extensions,
      '--user-data-dir',
      profile,
    ],
    { stdio: 'ignore' },
  )

  process.stdout.write(`  launching VS Code ${build.replace('vscode-', '')} with ${vsix}\n`)
  const editor = await electron.launch({
    executablePath: join(app, 'MacOS/Code'),
    args: [
      workspace,
      join(workspace, placed[0]?.to ?? ''),
      `--user-data-dir=${profile}`,
      `--extensions-dir=${extensions}`,
      // The inputs import what is not installed. Those errors are about nothing the tool does.
      '--disable-extension=vscode.typescript-language-features',
      '--disable-workspace-trust',
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-updates',
      '--force-device-scale-factor=2',
    ],
  })
  const shot: { file: string; at: number }[] = []
  let end = 0
  try {
    const page = await editor.firstWindow()
    await editor.evaluate(
      ({ BrowserWindow }, size) =>
        BrowserWindow.getAllWindows()[0]?.setContentSize(size.width, size.height),
      WINDOW,
    )
    process.stdout.write(`  waiting for ${take.ready ?? '.monaco-editor'}\n`)
    await page.waitForSelector(take.ready ?? '.monaco-editor', { timeout: 30_000 })
    // The file is the subject. The explorer opens with the workspace and takes a third of the frame.
    await page.keyboard.press('Meta+b')
    await page.waitForTimeout(2000)

    let filming = true
    const start = Date.now()
    const camera = (async () => {
      while (filming) {
        const file = `${String(shot.length).padStart(5, '0')}.png`
        const at = Date.now() - start
        writeFileSync(join(frames, file), await page.screenshot())
        shot.push({ file, at })
      }
    })()
    try {
      for (const [index, step] of take.steps.entries()) {
        process.stdout.write(`  step ${index + 1}/${take.steps.length} ${JSON.stringify(step)}\n`)
        await run(page, step)
      }
    } finally {
      filming = false
      await camera
      end = Date.now() - start
    }
  } finally {
    await editor.close()
  }

  process.stdout.write('  encoding the master\n')
  writeFileSync(join(frames, 'list.ffconcat'), concatList(shot, end))
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    join(frames, 'list.ffconcat'),
    '-vf',
    `scale=${FRAME.width}:${FRAME.height}:flags=lanczos,fps=${FPS}`,
    ...MASTER,
    master,
  ])
  const seconds = end / 1000
  process.stdout.write(
    `  ${shot.length} frames in ${seconds.toFixed(1)}s, ${(shot.length / seconds).toFixed(1)} fps captured\n`,
  )
}

function recordTerminal(inputs: string, surface: Surface, master: string): void {
  const tape = join(inputs, `${surface}.tape`)
  if (!existsSync(tape)) refuse(`no ${tape}.`)
  const raw = join(inputs, `${surface}.raw.mp4`)
  execFileSync('vhs', ['-o', raw, `${surface}.tape`], { cwd: inputs, stdio: 'inherit' })
  // vhs's own encode is the source; the master is held to the shared settings.
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-vf',
    `scale=${FRAME.width}:${FRAME.height}`,
    ...MASTER,
    master,
  ])
  unlinkSync(raw)
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const [repoArg, surfaceArg] = argv
  if (!repoArg || !SURFACES.includes(surfaceArg as Surface)) {
    refuse(`usage: record-demo <tool repo> <${SURFACES.join('|')}>`)
  }
  const surface = surfaceArg as Surface
  const repo = resolve(repoArg)
  const demos = join(repo, 'assets/demos')
  const inputs = join(demos, surface)
  if (!existsSync(inputs)) refuse(`no ${inputs}: write the take's inputs first.`)
  const master = join(demos, `${surface}.mp4`)
  if (surface === 'editor') await recordEditor(repo, inputs, master)
  if (surface !== 'editor') recordTerminal(inputs, surface, master)
  process.stdout.write('  encoding the README GIF\n')
  gifFrom(master, join(demos, `${surface}.gif`))
  for (const file of [master, join(demos, `${surface}.gif`)]) {
    const kb = readFileSync(file).length / 1024
    process.stdout.write(
      `  ${basename(repo)}/assets/demos/${basename(file)}  ${kb.toFixed(0)} KB\n`,
    )
  }
  return 0
}

/* v8 ignore start -- process entry point */
// Node, not Bun: under Bun, Playwright launches the editor and then never
// reaches it again, so the window opens and the take never starts.
if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await main())
/* v8 ignore stop */
