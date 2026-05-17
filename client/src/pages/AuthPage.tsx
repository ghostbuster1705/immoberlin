import { type FormEvent, useState } from 'react'
import { requestMagicLink } from '../api'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')

    try {
      await requestMagicLink({ email, name })
      setStatus('Magic link sent. Check your inbox and spam folder.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send magic link'
      setStatus(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[var(--card)] p-5">
      <h1 className="text-3xl font-black text-white">Magic link login</h1>
      <p className="mt-2 text-slate-300">No password. No friction. Just your email.</p>
      <form className="mt-5 space-y-3" onSubmit={submit}>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name (optional)"
          className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
        />
        <button type="submit" disabled={submitting} className="min-h-11 w-full rounded-lg bg-yellow-300 px-4 py-2 font-bold text-slate-900">
          {submitting ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {status && <p className="mt-3 text-sm text-slate-200">{status}</p>}
    </section>
  )
}
