import { SectionHeading } from '@/components/section-heading'
import { RUST_TOOLS } from '@/lib/rust-tools'
import { Link } from '@/ui/link'

export function RustTools() {
  return (
    <section id="beyond" className="wrap scroll-mt-20 py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <SectionHeading
          eyebrow="Beyond the editor"
          title="Same maker, different surface."
          lede="Two Rust desktop tools that turn screen pixels into machine-usable automation — each with its own site."
          className="lg:col-span-4"
        />

        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
          {RUST_TOOLS.map(tool => (
            <li key={tool.id} className="flex flex-col gap-3 border-border border-t pt-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded bg-accent-soft font-bold font-mono text-accent-soft-foreground text-sm"
                >
                  {tool.monogram}
                </span>
                <h3 className="font-semibold text-xl tracking-tight">{tool.name}</h3>
                <span className="ml-auto font-mono text-muted text-xs">Rust · desktop</span>
              </div>
              <p className="text-pretty text-muted">{tool.tagline}</p>
              <div className="flex gap-4 text-sm">
                <Link
                  href={tool.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${tool.name} website (opens in new tab)`}
                  className="py-2"
                >
                  {tool.id}.dev
                </Link>
                <Link
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${tool.name} on GitHub (opens in new tab)`}
                  className="py-2"
                >
                  GitHub
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
