import { defineConfig, devices } from '@playwright/test'

// E2E + page-level a11y, matching the pattern in pixelcoords-site and
// pixelactions-site. Specs live in e2e/*.e2e.ts — the .e2e suffix keeps them
// out of any *.test.* runner. The mobile project runs FIRST and is the
// default: the small viewport is where reflow and tap-target failures show up.
//
// The webServer serves the real static export (`out/`), not a dev server, so
// what is audited is what ships.
const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'bun run build && bun run start',
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
})
