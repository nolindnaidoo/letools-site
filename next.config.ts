import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pure static export — this site is a catalog, not an app. No server
  // components doing work, no API routes, no runtime. If a change needs
  // any of those, the change is wrong for this repo.
  output: 'export',
}

export default nextConfig
