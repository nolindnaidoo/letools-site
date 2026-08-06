import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * The command palette, driven the way it is meant to be driven.
 *
 * The per-page axe sweep only ever sees this closed, so the state that carries
 * all the accessibility risk — a combobox owning a listbox, selection moving
 * by `aria-activedescendant` rather than focus — would never be audited.
 */

const open = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: /search/i })
    .first()
    .click()
  return page.getByRole('combobox')
}

test('opens on the keyboard shortcut, without a click', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByRole('combobox')).toBeFocused()
})

test('finds a tool by the MCP tool name an agent would call', async ({ page }) => {
  // Someone reading an agent trace has the tool name and nothing else. This is
  // the reason the MCP surface is in the index at all.
  const input = await open(page)
  await input.fill('extract_strings')
  const options = page.getByRole('option')
  await expect(options.first()).toContainText('extract_strings')
  await options.first().click()
  await expect(page).toHaveURL(/\/tools\/string-le/)
})

test('moves the selection with arrow keys and opens with Enter', async ({ page }) => {
  const input = await open(page)
  await input.fill('extract')
  const second = page.getByRole('option').nth(1)
  await input.press('ArrowDown')
  await expect(second).toHaveAttribute('aria-selected', 'true')
  await input.press('Enter')
  await expect(page).toHaveURL(/\/tools\//)
})

test('closes on Escape and hands focus back to the trigger', async ({ page }) => {
  const input = await open(page)
  await input.press('Escape')
  await expect(page.getByRole('combobox')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /search/i }).first()).toBeFocused()
})

test('reports how many results a query found', async ({ page }) => {
  const input = await open(page)
  await input.fill('kubernetes')
  await expect(page.getByText('0 results')).toBeVisible()
})

test('is axe-clean while open, in both schemes', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    const input = await open(page)
    await input.fill('extract')
    await expect(page.getByRole('option').first()).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, `${scheme}: ${JSON.stringify(results.violations, null, 2)}`).toEqual(
      [],
    )
  }
})
