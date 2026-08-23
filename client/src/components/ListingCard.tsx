import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Listing } from '../types'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.photos[0]

  return (
    <motion.article whileHover={{ y: -4 }} className="card-glow overflow-hidden rounded-xl border border-white/10 bg-[var(--card)]">
      <Link to={`/listings/${listing.id}`} className="block">
        {image ? (
          <img src={image} alt={listing.title} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-slate-800 text-sm text-slate-300">No photo yet</div>
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">{listing.district}</span>
          <strong className="text-lg text-yellow-300">€{listing.price_month}/mo</strong>
        </div>

        <Link to={`/listings/${listing.id}`} className="block text-lg font-bold text-white transition hover:text-yellow-300">
          {listing.title}
        </Link>

        <p className="text-sm text-slate-300">
          {listing.rooms} room{listing.rooms > 1 ? 's' : ''} · {listing.size_m2} m²
        </p>
        <p className="text-sm text-slate-300">
          {listing.available_from} → {listing.available_until}
        </p>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-[var(--green)]/20 px-2 py-1 text-[var(--green)]">Provisionsfrei</span>
          <span className="rounded-full bg-[var(--blue)]/20 px-2 py-1 text-[var(--blue)]">Direct owner</span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/listings/${listing.id}#contact`}
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-yellow-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-200"
          >
            Contact
          </Link>
          <a
            href="mailto:immoscout@berlin.de"
            className="flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Email
          </a>
        </div>
      </div>
    </motion.article>
  )
}
