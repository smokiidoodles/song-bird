import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthSession()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm font-semibold text-songbird-text-soft">
          Loading your Song Bird profile…
        </p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}