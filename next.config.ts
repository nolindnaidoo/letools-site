import type { NextConfig } from 'next'
import { measureInstalls } from './lib/install-count'
import { PUBLISHER } from './lib/site'
import { extensionPending, openVsxNamespace, TOOLS } from './lib/tools'

export default async function config(): Promise<NextConfig> {
  // Build workers each load this file. The first load measures and leaves the
  // answer in the environment they inherit, so a build asks the registries once.
  process.env.LETOOLS_INSTALLS ??= String(
    await measureInstalls(
      TOOLS.filter(tool => !extensionPending(tool)).map(tool => ({
        id: tool.id,
        publisher: PUBLISHER,
        openVsxNamespace: openVsxNamespace(tool),
      })),
    ),
  )

  return {
    // Pure static export — this site is a catalog, not an app. No server
    // components doing work, no API routes, no runtime. If a change needs
    // any of those, the change is wrong for this repo.
    output: 'export',
    env: { LETOOLS_INSTALLS: process.env.LETOOLS_INSTALLS },
  }
}
