import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-white/10 bg-[var(--card)] p-6 text-center">
      <h1 className="text-3xl font-black text-white">404</h1>
      <p className="mt-2 text-slate-300">This Kiez corner does not exist.</p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-yellow-300 px-4 font-bold text-slate-900">
        Back home
      </Link>
    </section>
  )
}
