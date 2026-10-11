import { buttonVariants } from '@/ui/button'
import { Link } from '@/ui/link'

export default function NotFound() {
  return (
    <section className="wrap flex flex-col items-start gap-6 py-32">
      <p className="font-mono text-muted text-xs uppercase tracking-[0.18em]">404</p>
      <h1 className="font-semibold text-4xl tracking-tighter sm:text-5xl">Page not found</h1>
      <p className="text-muted">Every tool has a page; everything else is on the home page.</p>
      <Link href="/" className={buttonVariants({ variant: 'primary' })}>
        Back home
      </Link>
    </section>
  )
}
