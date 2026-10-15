import { expect, test } from '@playwright/test'
import { TOOLS, toolPath } from '../lib/tools'

/**
 * What an audit on 2026-10-12 found that axe could not: axe passed on every
 * one of these. Each is something a reader does, so each is done here.
 */

const PAGES = ['/', ...TOOLS.map(toolPath)]

for (const path of PAGES) {
  // 320 CSS pixels is the width WCAG's reflow criterion is written for, and
  // narrower than either project's device. The header and the tool pages'
  // channel cards both ran past it while every other test stayed green.
  test(`${path} does not scroll sideways at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto(path)
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(widths.scroll).toBeLessThanOrEqual(widths.client)
  })
}

for (const path of ['/', toolPath(TOOLS[0] as (typeof TOOLS)[number])]) {
  test(`${path} says so on every link that opens a new tab`, async ({ page }) => {
    await page.goto(path)
    const silent = await page.evaluate(() =>
      [...document.querySelectorAll('a[target="_blank"]')]
        .filter(
          link => !/new tab/i.test(`${link.getAttribute('aria-label') ?? ''} ${link.textContent}`),
        )
        .map(link => (link.textContent ?? '').trim()),
    )
    expect(silent).toEqual([])
  })
}

test('keeps the keyboard inside the search panel, and Escape closes it from anywhere in it', async ({
  page,
}) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Search', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Site search' })
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true)

  // Off the input and onto the close button. The page behind is never next.
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('closes the search panel from its own button', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await page.getByRole('button', { name: 'Close search' }).click()
  await expect(page.getByRole('dialog', { name: 'Site search' })).toBeHidden()
})

test('gives a phone the links the bar hides', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'FAQ', exact: true })).toBeHidden()

  await page.getByRole('button', { name: 'Menu' }).click()
  const items = page.getByRole('menuitem')
  await expect(items).toHaveText(['Tools', 'Why LE', 'Install', 'FAQ', 'GitHub'])

  await items.filter({ hasText: 'FAQ' }).click()
  await expect(page).toHaveURL(/#faq$/)
})

test('shows every header control at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('/')
  for (const name of ['Search', 'Menu', /switch to (light|dark) theme/i]) {
    const box = await page
      .getByRole('button', { name, exact: typeof name === 'string' })
      .boundingBox()
    expect(box, String(name)).not.toBeNull()
    expect((box?.x ?? 0) + (box?.width ?? 0), String(name)).toBeLessThanOrEqual(320)
  }
  // The words are hidden at this width and still name the home link.
  await expect(page.getByRole('link', { name: /Limited Edition DevTools/ })).toBeVisible()
})

test('stops the demo recording on request, and plays it again', async ({ page }) => {
  await page.goto('/')
  const demo = page.locator('video[data-demo]').first()
  await expect(demo).toHaveAttribute('data-playing', 'true')

  await page.getByRole('button', { name: /^Pause the .+ demo$/ }).click()
  await expect(demo).toHaveAttribute('data-playing', 'false')
  await expect.poll(() => demo.evaluate(video => (video as HTMLVideoElement).paused)).toBe(true)

  await page.getByRole('button', { name: /^Play the .+ demo$/ }).click()
  await expect(demo).toHaveAttribute('data-playing', 'true')
})

test('shows the command line and MCP recordings on their tabs, one at a time', async ({ page }) => {
  await page.goto('/')
  const frames = page.locator('video[data-demo]')
  await expect(frames).toHaveCount(1)
  await expect(frames.first()).toHaveAttribute('data-surface', 'editor')

  for (const [tab, surface] of [
    ['CLI', 'cli'],
    ['MCP', 'mcp'],
  ] as const) {
    // The install section has a CLI tab of its own, so the demo's list is named.
    await page
      .getByRole('tablist', { name: / demo$/ })
      .getByRole('tab', { name: tab })
      .click()
    // Only the tab in view is in the page, so only its recording is fetched.
    await expect(frames).toHaveCount(1)
    await expect(frames.first()).toHaveAttribute('data-surface', surface)
    await expect(frames.first()).toHaveAttribute(
      'src',
      new RegExp(`-${surface}\\.[0-9a-f]{8}\\.mp4$`),
    )
  }
})
