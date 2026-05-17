import { motion } from 'framer-motion'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListings } from '../api'
import { DISTRICTS, TAGLINES } from '../constants'
import { ListingCard } from '../components/ListingCard'
import type { Listing } from '../types'

type SearchState = {
  district: string
  availableFrom: string
  maxPrice: number
}

const trustBadges = ['100% Direct', 'No Makler', 'Free to list', 'Berlin only']

export function LandingPage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState<SearchState>({
    district: '',
    availableFrom: '',
    maxPrice: 2000,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getListings({ limit: 6, status: 'active' })
        setFeatured(response.listings)
      } catch (_error) {
        setFeatured([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.district) params.set('district', search.district)
    if (search.availableFrom) params.set('availableFrom', search.availableFrom)
    if (search.maxPrice) params.set('maxPrice', String(search.maxPrice))
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[var(--card)] to-transparent p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm font-semibold text-yellow-300">{TAGLINES[1]}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">
            Sublet in Berlin. <br />
            No agents. No fees.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">Find or offer a sublet directly from real people.</p>
          <p className="mt-3 text-sm font-semibold text-slate-200">{TAGLINES[0]}</p>
        </motion.div>

        <form onSubmit={onSearch} className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-[var(--card)]/70 p-4 md:grid-cols-4">
          <select
            value={search.district}
            onChange={(event) => setSearch((previous) => ({ ...previous, district: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
          >
            <option value="">Any Kiez</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={search.availableFrom}
            onChange={(event) => setSearch((previous) => ({ ...previous, availableFrom: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
          />
          <div className="space-y-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2">
            <label className="text-xs text-slate-300">Max price: €{search.maxPrice}</label>
            <input
              type="range"
              min={300}
              max={3000}
              step={50}
              value={search.maxPrice}
              onChange={(event) => setSearch((previous) => ({ ...previous, maxPrice: Number(event.target.value) }))}
              className="w-full"
            />
          </div>
          <button type="submit" className="min-h-11 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-900">
            Search flats
          </button>
        </form>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-semibold text-slate-100">
              {badge}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">Featured listings</h2>
          <a href="/listings" className="text-sm font-semibold text-yellow-300 hover:text-yellow-200">
            Browse all →
          </a>
        </div>
        {loading ? (
          <p className="text-slate-300">Loading fresh listings…</p>
        ) : featured.length === 0 ? (
          <p className="text-slate-300">No active listings yet. Be the first to post your place.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StepCard emoji="🏠" title="Post your place in 2 min" />
        <StepCard emoji="📩" title="Tenants contact you directly" />
        <StepCard emoji="🤝" title="Deal done — no middlemen" />
      </section>

      <section className="rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-6 text-center">
        <p className="text-xl font-black text-yellow-200">Going away this summer? List your flat for free →</p>
        <p className="mt-2 text-sm text-slate-200">{TAGLINES[2]}</p>
      </section>
    </div>
  )
}

function StepCard({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--card)] p-5">
      <p className="text-2xl">{emoji}</p>
      <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
    </div>
  )
}
