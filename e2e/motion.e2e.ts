import { expect, test } from '@playwright/test'
import { demoSrc, TOOLS } from '../lib/tools'

/**
 * Every demo on the grid animates at once, so the motion preference stops being
 * a nicety and becomes the whole point of WCAG 2.2.2: ten looping clips is
 * exactly what someone turns that setting on to avoid.
 *
 * The expected count is derived, not `TOOLS.length`: a tool whose extension is
 * still to be written has no recording to play, and its card shows the command
 * it answers to instead.
 *
 * `lib/use-prefers-reduced-motion.ts` is excluded from unit coverage because it
 * needs a DOM and a renderer this project does not otherwise pull in. This is
 * the assurance instead, and it asserts what a user experiences rather than
 * what the hook returns.
 */

const WITH_DEMO = TOOLS.filter(tool => demoSrc(tool) !== undefined)

test('plays every demo when no motion preference is set', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const sources = await page
    .locator('img[alt$="demo"]')
    .evaluateAll(nodes => nodes.map(node => node.getAttribute('src') ?? ''))

  expect(sources).toHaveLength(WITH_DEMO.length)
  expect(
    sources.every(source => source.endsWith('.gif')),
    sources.join('\n'),
  ).toBe(true)
})

test('shows a still for every demo under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  // The hook runs after mount, so the swap is not in the server output.
  await expect
    .poll(async () =>
      page
        .locator('img[alt$="demo"]')
        .evaluateAll(nodes =>
          nodes.every(node => (node.getAttribute('src') ?? '').endsWith('.jpg')),
        ),
    )
    .toBe(true)

  const sources = await page
    .locator('img[alt$="demo"]')
    .evaluateAll(nodes => nodes.map(node => node.getAttribute('src') ?? ''))
  expect(sources).toHaveLength(WITH_DEMO.length)
  expect(sources.some(source => source.endsWith('.gif'))).toBe(false)
})

test('keeps the offscreen demos off the wire until they are scrolled toward', async ({ page }) => {
  // Ten clips is about 8 MB. Lazy loading is what makes playing them all at
  // once affordable, so it is asserted rather than assumed.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const loading = await page
    .locator('img[alt$="demo"]')
    .evaluateAll(nodes => nodes.map(node => node.getAttribute('loading')))

  expect(loading.every(value => value === 'lazy')).toBe(true)
})
