import { buttonVariants } from '@/ui/button'
import { Link } from '@/ui/link'

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-32 text-center sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted">This site is one page — everything lives on it.</p>
      <Link href="/" className={buttonVariants({ variant: 'primary' })}>
        Back home
      </Link>
    </section>
  )
}
