import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'
import { signOut } from '../../services/authService'

export default function Header() {
  const { user } = useAuthSession()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Could not sign out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-berry-crush text-lg font-bold text-white shadow-lg shadow-berry-crush/20">
            ♪
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-songbird-navy">
              Song Bird
            </p>
            <p className="text-sm text-songbird-text-soft">
              Discover music beyond the obvious
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right md:block">
                <p className="text-sm font-bold text-songbird-text">
                  {user.user_metadata?.display_name || user.email}
                </p>
                <p className="text-xs text-songbird-text-soft">Signed in</p>
              </div>

              <button
                onClick={handleSignOut}
                className="rounded-full bg-songbird-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-berry-crush"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="rounded-full bg-songbird-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-berry-crush"
            >
              Sign in to save
            </button>
          )}
        </div>
      </div>
    </header>
  )
}