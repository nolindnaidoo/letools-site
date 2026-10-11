import { expect, test } from '@playwright/test'
import { FEATURED, toolPath } from '../lib/tools'

/**
 * One recording leads the home page and one leads each tool page, and both
 * loop. The motion preference is what someone turns on to stop exactly that
 * (WCAG 2.2.2), so the swap to the still is asserted rather than assumed.
 *
 * `lib/use-prefers-reduced-motion.ts` is excluded from unit coverage because it
 * needs a DOM and a renderer this project does not otherwise pull in. This is
 * the assurance instead, and it asserts what a user experiences rather than
 * what the hook returns.
 *
 * The frame is located by `data-demo`, not by its alt text: the alt describes
 * the tool, as it should, instead of ending in a keyword for a test.
 */

const PAGES = [
  { path: '/', label: 'home' },
  { path: toolPath(FEATURED), label: 'a tool page' },
] as const

for (const target of PAGES) {
  test(`plays the recording on ${target.label} when no motion preference is set`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(target.path)

    const frames = page.locator('img[data-demo]')
    await expect(frames).toHaveCount(1)
    await expect(frames.first()).toHaveAttribute('src', /\.gif$/)
  })

  test(`shows the still on ${target.label} under prefers-reduced-motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(target.path)

    // The hook runs after mount, so the swap is not in the server output.
    const frame = page.locator('img[data-demo]').first()
    await expect(frame).toHaveAttribute('src', /\.jpg$/)
  })
}

test('loads the lead recording eagerly, because it is the largest paint above the fold', async ({
  page,
}) => {
  await page.goto('/')

  const frame = page.locator('img[data-demo]').first()
  await expect(frame).toHaveAttribute('loading', 'eager')
  await expect(frame).toHaveAttribute('fetchpriority', 'high')
})
