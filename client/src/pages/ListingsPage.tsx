import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getListings } from '../api'
import { ListingCard } from '../components/ListingCard'
import { DISTRICTS } from '../constants'
import type { Listing } from '../types'

type Filters = {
  district: string
  maxPrice: number
  rooms: '' | '1' | '2' | '3+'
  availableFrom: string
  furnished: boolean
}

const defaultFilters: Filters = {
  district: '',
  maxPrice: 3000,
  rooms: '',
  availableFrom: '',
  furnished: false,
}

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    district: searchParams.get('district') || '',
    availableFrom: searchParams.get('availableFrom') || '',
    maxPrice: Number(searchParams.get('maxPrice') || 3000),
    rooms: (searchParams.get('rooms') as Filters['rooms']) || '',
    furnished: searchParams.get('furnished') === 'true',
  })

  useEffect(() => {
    const query = new URLSearchParams()
    if (filters.district) query.set('district', filters.district)
    if (filters.availableFrom) query.set('availableFrom', filters.availableFrom)
    if (filters.rooms) query.set('rooms', filters.rooms)
    if (filters.maxPrice < 3000) query.set('maxPrice', String(filters.maxPrice))
    if (filters.furnished) query.set('furnished', 'true')
    setSearchParams(query, { replace: true })

    const load = async () => {
      setLoading(true)
      try {
        const response = await getListings({
          district: filters.district || undefined,
          availableFrom: filters.availableFrom || undefined,
          rooms: filters.rooms || undefined,
          maxPrice: filters.maxPrice,
          furnished: filters.furnished ? true : undefined,
          status: 'active',
        })
        setListings(response.listings)
      } catch (_error) {
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [filters, setSearchParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.district) count += 1
    if (filters.availableFrom) count += 1
    if (filters.rooms) count += 1
    if (filters.maxPrice < 3000) count += 1
    if (filters.furnished) count += 1
    return count
  }, [filters])

  return (
    <div className="relative grid gap-6 md:grid-cols-[280px_1fr]">
      <aside className="hidden md:block">
        <FiltersPanel filters={filters} setFilters={setFilters} onReset={() => setFilters(defaultFilters)} />
      </aside>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-white">Find your next Berlin sublet</h1>
          <p className="text-sm text-slate-300">{listings.length} results</p>
        </div>
        {loading ? (
          <p className="text-slate-300">Loading listings…</p>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--card)] p-5 text-slate-300">
            No matches right now. Try a wider radius in your Kiez filters.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        className="fixed bottom-4 right-4 z-30 min-h-11 rounded-full bg-yellow-300 px-5 text-sm font-bold text-slate-900 shadow-lg md:hidden"
        onClick={() => setMobileFiltersOpen(true)}
      >
        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
      </button>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border border-white/10 bg-[var(--navy)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="min-h-11 px-3 text-white">
                Close
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              onReset={() => setFilters(defaultFilters)}
              onApplied={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FiltersPanel({
  filters,
  setFilters,
  onReset,
  onApplied,
}: {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  onReset: () => void
  onApplied?: () => void
}) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[var(--card)] p-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-200">District</label>
        <select
          value={filters.district}
          onChange={(event) => setFilters((current) => ({ ...current, district: event.target.value }))}
          className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
        >
          <option value="">Any district</option>
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-200">Price up to €{filters.maxPrice}</label>
        <input
          type="range"
          min={300}
          max={3000}
          step={50}
          value={filters.maxPrice}
          onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Number(event.target.value) }))}
          className="w-full"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-200">Rooms</p>
        <div className="grid grid-cols-3 gap-2">
          {(['1', '2', '3+'] as const).map((roomOption) => (
            <button
              key={roomOption}
              type="button"
              onClick={() =>
                setFilters((current) => ({ ...current, rooms: current.rooms === roomOption ? '' : roomOption }))
              }
              className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${
                filters.rooms === roomOption
                  ? 'border-yellow-300 bg-yellow-300 text-slate-900'
                  : 'border-white/20 text-white hover:bg-white/10'
              }`}
            >
              {roomOption}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-200">Available from</label>
        <input
          type="date"
          value={filters.availableFrom}
          onChange={(event) => setFilters((current) => ({ ...current, availableFrom: event.target.value }))}
          className="min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
        />
      </div>

      <label className="flex min-h-11 items-center justify-between rounded-lg border border-white/20 px-3 py-2 text-white">
        Furnished only
        <input
          type="checkbox"
          checked={filters.furnished}
          onChange={(event) => setFilters((current) => ({ ...current, furnished: event.target.checked }))}
          className="h-5 w-5"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-lg border border-white/20 px-3 text-sm font-semibold text-white"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApplied}
          className="min-h-11 rounded-lg bg-yellow-300 px-3 text-sm font-bold text-slate-900"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
