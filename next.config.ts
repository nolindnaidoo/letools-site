import type { NextConfig } from 'next'
import { measureRegistries } from './lib/install-count'
import { PUBLISHER } from './lib/site'
import { extensionPending, openVsxNamespace, TOOLS } from './lib/tools'

export default async function config(): Promise<NextConfig> {
  // Build workers each load this file. The first load measures and leaves the
  // answer in the environment they inherit, so a build asks the registries once.
  if (process.env.LETOOLS_INSTALLS === undefined) {
    const measured = await measureRegistries(
      TOOLS.filter(tool => !extensionPending(tool)).map(tool => ({
        id: tool.id,
        publisher: PUBLISHER,
        openVsxNamespace: openVsxNamespace(tool),
      })),
    )
    process.env.LETOOLS_INSTALLS = String(measured.installs)
    process.env.LETOOLS_OPENVSX_DOWNLOADS = JSON.stringify(measured.openVsxDownloads)
  }

  return {
    // Pure static export — this site is a catalog, not an app. No server
    // components doing work, no API routes, no runtime. If a change needs
    // any of those, the change is wrong for this repo.
    output: 'export',
    env: {
      LETOOLS_INSTALLS: process.env.LETOOLS_INSTALLS,
      LETOOLS_OPENVSX_DOWNLOADS: process.env.LETOOLS_OPENVSX_DOWNLOADS ?? '{}',
    },
  }
}
