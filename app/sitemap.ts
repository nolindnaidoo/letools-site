import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { TOOLS, toolPath } from '@/lib/tools'

// Generated, not hand-written. The previous sitemap was a static file in
// public/ listing a single URL, so every tool page added would have been
// invisible to a crawler until someone remembered to edit XML by hand —
// exactly the drift `lib/tools.ts` exists to prevent. A new tool is one entry
// there and it appears here.
// `output: export` has no runtime, so the route has to declare it is fully
// static or the build refuses to collect it.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...TOOLS.map(tool => ({
      url: `${SITE_URL}${toolPath(tool)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
