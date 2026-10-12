import { expect, type Locator, type Page, test } from '@playwright/test'
import { TOOLS, toolPath } from '../lib/tools'

/**
 * A tool's row on the home page opens its page from anywhere on the row, and
 * its registry links stay links of their own.
 *
 * Both halves are geometry: one link stretched over the row, four more laid
 * above it. Neither shows in the markup, so both are clicked.
 */

const tool = TOOLS[0]
if (tool === undefined) throw new Error('the registry is empty')

const TOOL_PAGE = new RegExp(`${toolPath(tool)}/?$`)

const openRow = async (page: Page): Promise<Locator> => {
  await page.goto('/')
  const row = page
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: tool.name, exact: true }) })
  await row.scrollIntoViewIfNeeded()
  return row
}

const middleOf = async (target: Locator) => {
  const box = await target.boundingBox()
  if (box === null) throw new Error('the target is not laid out')
  return { box, x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

// A click at the middle of what the reader aims for. `locator.click()` would
// wait for the element itself to take the click, and here it is the link
// stretched over it that does.
const clickOn = async (page: Page, target: Locator) => {
  const { x, y } = await middleOf(target)
  await page.mouse.click(x, y)
}

test('opens the tool page from the summary, not only the name', async ({ page }) => {
  const row = await openRow(page)
  await clickOn(page, row.getByText(tool.summary))
  await expect(page).toHaveURL(TOOL_PAGE)
})

test('opens the tool page from the icon', async ({ page }) => {
  const row = await openRow(page)
  await clickOn(page, row.locator('img, svg').first())
  await expect(page).toHaveURL(TOOL_PAGE)
})

test('leaves each registry link on top of the row', async ({ page }) => {
  const row = await openRow(page)
  const links = await row.getByRole('link', { name: /opens in new tab/ }).all()
  expect(links.length).toBeGreaterThan(0)
  for (const link of links) {
    // What a click at the link's centre would land on.
    const hit = await link.evaluate(element => {
      const box = element.getBoundingClientRect()
      const at = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
      return at === element || element.contains(at)
    })
    expect(hit, (await link.getAttribute('aria-label')) ?? '').toBe(true)
  }
})

test('does nothing on a click between two registry links', async ({ page }) => {
  const row = await openRow(page)
  const [first, second] = await row.getByRole('link', { name: /opens in new tab/ }).all()
  if (first === undefined || second === undefined) throw new Error('the row has under two links')
  const [a, b] = [await middleOf(first), await middleOf(second)]
  test.skip(a.y !== b.y, 'the links wrapped, so there is no gap between these two')
  await page.mouse.click((a.box.x + a.box.width + b.box.x) / 2, a.y)
  await expect(page).toHaveURL(/\/$/)
})
