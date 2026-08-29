import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { contactListingOwner, getListing } from '../api'
import type { Listing } from '../types'

const initialMessage = {
  sender_name: '',
  sender_email: '',
  message: '',
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialMessage)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      try {
        const response = await getListing(id)
        setListing(response.listing)
      } catch (_error) {
        setListing(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  const cover = listing?.photos[0] || ''

  const submitContact = async (event: FormEvent) => {
    event.preventDefault()
    if (!listing) return

    try {
      await contactListingOwner(listing.id, form)
      setStatus('Message sent. The owner can reply directly by email.')
      setForm(initialMessage)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send your message.'
      setStatus(message)
    }
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setStatus('Link copied. Share away.')
    } catch (_error) {
      setStatus('Copy failed. You can copy the URL manually.')
    }
  }

  if (loading) return <p className="text-slate-300">Loading listing…</p>
  if (!listing) return <p className="rounded-xl border border-white/10 bg-[var(--card)] p-4 text-slate-300">Listing not found.</p>

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-white/10 bg-[var(--card)] p-4">
        {cover ? <img src={cover} alt={listing.title} className="h-64 w-full rounded-lg object-cover md:h-96" /> : null}
        <div className="-mx-2 overflow-x-auto px-2">
          <div className="flex gap-3 pb-2">
            {listing.photos.length > 0 ? (
              listing.photos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt={listing.title}
                  className="h-28 w-40 snap-center rounded-lg object-cover md:h-32 md:w-48"
                />
              ))
            ) : (
              <div className="flex h-24 w-full items-center justify-center rounded-lg bg-slate-800 text-slate-300">No photos yet</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white">{listing.title}</h1>
            <p className="mt-1 text-slate-300">
              {listing.district} · {listing.address}
            </p>
          </div>
          <div className="rounded-lg bg-yellow-300 px-4 py-2 text-xl font-black text-slate-900">€{listing.price_month}/mo</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info title="Rooms" value={`${listing.rooms}`} />
          <Info title="Size" value={`${listing.size_m2} m²`} />
          <Info title="Available" value={`${listing.available_from} → ${listing.available_until}`} />
          <Info title="Furnished" value={listing.is_furnished ? 'Yes' : 'No'} />
        </div>

        <p className="text-slate-200">{listing.description}</p>
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
          <p className="font-semibold text-white">House rules</p>
          <p className="mt-1 text-sm text-slate-300">
            Pets: {listing.rules.pets ? 'allowed' : 'not allowed'} · Smoking:{' '}
            {listing.rules.smoking ? 'allowed' : 'not allowed'}
          </p>
          {listing.rules.notes && <p className="mt-1 text-sm text-slate-300">{listing.rules.notes}</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_320px]">
        <form id="contact" onSubmit={submitContact} className="space-y-3 rounded-xl border border-white/10 bg-[var(--card)] p-4">
          <h2 className="text-xl font-bold text-white">Contact owner directly</h2>
          <input
            required
            value={form.sender_name}
            onChange={(event) => setForm((current) => ({ ...current, sender_name: event.target.value }))}
            className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Your name"
          />
          <input
            required
            type="email"
            value={form.sender_email}
            onChange={(event) => setForm((current) => ({ ...current, sender_email: event.target.value }))}
            className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Your email"
          />
          <textarea
            required
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="min-h-28 w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white"
            placeholder="Hi, I’m interested in your flat in this Kiez…"
          />
          <button type="submit" className="min-h-11 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-900">
            Send message
          </button>
          {status && <p className="text-sm text-slate-200">{status}</p>}
        </form>

        <aside className="space-y-3 rounded-xl border border-white/10 bg-[var(--card)] p-4">
          <h3 className="text-lg font-bold text-white">Map preview</h3>
          <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-white/20 bg-slate-900/50 text-slate-300">
            {listing.district} (map placeholder)
          </div>
          <button
            type="button"
            onClick={() => void share()}
            className="min-h-11 w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Share listing
          </button>
          <a href="mailto:subletberlino@gmail.com" className="block text-sm font-semibold text-yellow-300 hover:text-yellow-200">
            Report listing
          </a>
        </aside>
      </section>
    </div>
  )
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
      <p className="text-xs uppercase text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
