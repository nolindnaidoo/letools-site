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
