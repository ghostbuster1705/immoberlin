import { type FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { deleteListing, getListings, updateListing, updateListingStatus } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Listing } from '../types'

type EditForm = {
  title: string
  price_month: string
  description: string
}

export function DashboardPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    price_month: '',
    description: '',
  })

  const loadListings = async () => {
    setLoading(true)
    try {
      const response = await getListings({ mine: true, status: 'all' })
      setListings(response.listings)
    } catch (_error) {
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadListings()
  }, [])

  useEffect(() => {
    if (searchParams.get('posted') === '1') {
      setToast('Listing posted successfully.')
    } else if (searchParams.get('login') === 'success') {
      setToast('You are now logged in.')
    }
  }, [searchParams])

  const toggleStatus = async (listing: Listing) => {
    await updateListingStatus(listing.id, listing.status === 'active' ? 'taken' : 'active')
    await loadListings()
  }

  const remove = async (id: number) => {
    await deleteListing(id)
    setListings((current) => current.filter((listing) => listing.id !== id))
  }

  const beginEdit = (listing: Listing) => {
    setEditingId(listing.id)
    setEditForm({
      title: listing.title,
      price_month: String(listing.price_month),
      description: listing.description,
    })
  }

  const submitEdit = async (event: FormEvent, listing: Listing) => {
    event.preventDefault()
    await updateListing(listing.id, {
      title: editForm.title,
      price_month: Number(editForm.price_month),
      description: editForm.description,
    } as Partial<Listing>)
    setEditingId(null)
    await loadListings()
  }

  if (loading) return <p className="text-slate-300">Loading your dashboard…</p>

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-white/10 bg-[var(--card)] p-5">
        <h1 className="text-3xl font-black text-white">My listings</h1>
        <p className="mt-1 text-slate-300">Welcome {user?.name || user?.email}. Manage your sublets directly.</p>
      </header>

      {toast && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-200">{toast}</div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[var(--card)] p-5 text-slate-300">No listings yet. Post your first one.</div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <article key={listing.id} className="rounded-xl border border-white/10 bg-[var(--card)] p-4">
              {editingId === listing.id ? (
                <form className="space-y-3" onSubmit={(event) => void submitEdit(event, listing)}>
                  <input
                    required
                    value={editForm.title}
                    onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                    className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
                  />
                  <input
                    required
                    type="number"
                    value={editForm.price_month}
                    onChange={(event) => setEditForm((current) => ({ ...current, price_month: event.target.value }))}
                    className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
                  />
                  <textarea
                    required
                    value={editForm.description}
                    onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                    className="min-h-24 w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="min-h-11 rounded-lg bg-yellow-300 px-3 py-2 text-sm font-bold text-slate-900">
                      Save
                    </button>
                    <button
                      type="button"
                      className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{listing.title}</h2>
                    <p className="text-sm text-slate-300">
                      {listing.district} · €{listing.price_month}/mo · {listing.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(listing)}
                      className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(listing)}
                      className="min-h-11 rounded-lg border border-blue-400/40 px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                    >
                      Mark as {listing.status === 'active' ? 'taken' : 'active'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(listing.id)}
                      className="min-h-11 rounded-lg border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
