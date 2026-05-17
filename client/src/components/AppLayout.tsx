import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { TAGLINES } from '../constants'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-yellow-300 text-slate-900' : 'text-slate-100 hover:bg-white/10'
  }`

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function AppLayout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--navy)] text-[var(--white)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="text-lg font-black tracking-tight text-yellow-300">
            Berlin Sublet
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/listings" className={navLinkClass}>
              Listings
            </NavLink>
            <NavLink to="/post" className={navLinkClass}>
              Post
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            {!user && (
              <NavLink to="/auth" className={navLinkClass}>
                Sign in
              </NavLink>
            )}
            {user && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            )}
          </nav>
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/20 md:hidden"
          >
            <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="grid gap-2">
              <NavLink to="/" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/listings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Listings
              </NavLink>
              <NavLink to="/post" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Post
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
              {!user && (
                <NavLink to="/auth" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Sign in
                </NavLink>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    void signOut()
                    setMobileOpen(false)
                  }}
                  className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-8 border-t border-white/10 bg-[var(--card)]/30">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 text-sm md:grid-cols-3 md:px-6">
          <div>
            <p className="font-bold text-yellow-300">Berlin Sublet</p>
            <p className="mt-2 text-slate-300">Real people, real flats. Berlin-only and Makler-free.</p>
          </div>
          <div>
            <p className="font-semibold text-white">About</p>
            <p className="mt-2 text-slate-300">{TAGLINES[1]}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <a className="mt-2 block text-slate-300 hover:text-white" href="mailto:hello@berlinsublet.com">
              hello@berlinsublet.com
            </a>
            <a className="block text-slate-300 hover:text-white" href="https://instagram.com/" target="_blank" rel="noreferrer">
              Instagram (coming soon)
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
