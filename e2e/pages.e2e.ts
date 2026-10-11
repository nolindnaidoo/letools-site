import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { TAGLINE } from '@/lib/site'
import { TOOLS, toolPath } from '@/lib/tools'

// Every page: renders its h1 and is axe-clean in both schemes. The tool pages
// come from the registry rather than being listed by hand, so a new tool is
// still one entry in lib/tools.ts and it is audited automatically — the
// alternative is ten pages that ship without ever being checked.
const PAGES = [
  { path: '/', headline: TAGLINE },
  ...TOOLS.map(tool => ({ path: toolPath(tool), headline: tool.name })),
] as const

const SCHEMES = ['light', 'dark'] as const

for (const target of PAGES) {
  for (const scheme of SCHEMES) {
    test(`${target.path} renders and is axe-clean in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto(target.path)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(target.headline)

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
}

// The theme toggle is the one interactive control on the page, and a control
// that loses its accessible name in one scheme is exactly what a static audit
// of a single scheme would miss.
test('theme toggle is reachable and named in both schemes', async ({ page }) => {
  for (const scheme of SCHEMES) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /theme|appearance|dark|light/i })
    await expect(toggle.first()).toBeVisible()
  }
})

// No page scrolls sideways. A grid track defaults to minmax(auto, …), so one
// unwrappable line — a long command, a JSON config — widened the single phone
// column to its content and pushed every later section off the right edge.
// axe does not flag that, and a desktop screenshot never shows it.
for (const target of PAGES) {
  test(`${target.path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(target.path)
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(widths.scroll).toBeLessThanOrEqual(widths.client)
  })
}

// Every raster image is drawn at its own aspect ratio. The preflight sets
// img { height: auto }, so an icon with width and height attributes in a flex
// row still stretches to the row's height while its width holds, and nothing
// in axe or a contrast pass notices a hand drawn twice as tall as it is wide.
for (const target of PAGES) {
  test(`${target.path} draws every image at its intrinsic ratio`, async ({ page }) => {
    await page.goto(target.path)
    const distorted = await page.evaluate(() =>
      Array.from(document.images)
        .filter(img => img.naturalWidth > 0 && img.clientWidth > 0)
        .map(img => ({
          src: img.getAttribute('src'),
          drawn: img.clientWidth / img.clientHeight,
          intrinsic: img.naturalWidth / img.naturalHeight,
        }))
        .filter(img => Math.abs(img.drawn - img.intrinsic) > 0.02),
    )
    expect(distorted).toEqual([])
  })
}
