import { type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { DatenschutzPage } from './pages/DatenschutzPage'
import { DashboardPage } from './pages/DashboardPage'
import { ImpressumPage } from './pages/ImpressumPage'
import { LandingPage } from './pages/LandingPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { ListingsPage } from './pages/ListingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostListingPage } from './pages/PostListingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="text-slate-300">Checking session…</p>
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
