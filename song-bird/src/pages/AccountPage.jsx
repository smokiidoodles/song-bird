import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession'
import { signOut } from '../services/authService'
import { deleteCurrentAccount } from '../services/apiService'
import {
  getSpotifyConnectionStatus,
  startSpotifyConnection,
} from '../services/spotifyService'

export default function AccountPage() {
  const { user } = useAuthSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [confirmation, setConfirmation] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [deleting, setDeleting] = useState(false)

  const [spotifyStatus, setSpotifyStatus] = useState({
    loading: false,
    connected: false,
    topArtists: [],
    spotifyDisplayName: '',
  })

  useEffect(() => {
    if (!user) {
      return
    }

    let active = true

    async function loadSpotifyStatus() {
      setSpotifyStatus((current) => ({
        ...current,
        loading: true,
      }))

      try {
        const connection = await getSpotifyConnectionStatus()

        if (!active) {
          return
        }

        setSpotifyStatus({
          loading: false,
          connected: connection.connected,
          topArtists: connection.topArtists ?? [],
          spotifyDisplayName: connection.spotifyDisplayName ?? '',
        })
      } catch (error) {
        if (active) {
          setSpotifyStatus((current) => ({
            ...current,
            loading: false,
          }))
        }
      }
    }

    loadSpotifyStatus()

    const spotifyResult = searchParams.get('spotify')

    if (spotifyResult === 'connected') {
      setStatus({
        type: 'success',
        message: 'Spotify connected. Your top artists are now available below.',
      })
    }

    if (spotifyResult === 'denied') {
      setStatus({
        type: 'error',
        message: 'Spotify connection was cancelled.',
      })
    }

    if (spotifyResult === 'failed' || spotifyResult === 'token_failed') {
      setStatus({
        type: 'error',
        message: 'Spotify could not be connected. Please try again.',
      })
    }

    return () => {
      active = false
    }
  }, [user, searchParams])

  async function handleDeleteAccount(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (!user) {
      navigate('/auth')
      return
    }

    if (confirmation !== 'DELETE') {
      setStatus({
        type: 'error',
        message: 'Type DELETE exactly, using capital letters, before continuing.',
      })
      return
    }

    const accepted = window.confirm(
      'Permanently delete your Song Bird account and all saved data? This cannot be undone.'
    )

    if (!accepted) {
      return
    }

    setDeleting(true)

    try {
      await deleteCurrentAccount()

      setStatus({
        type: 'success',
        message: 'Your account was deleted successfully. Returning to Song Bird…',
      })

      await signOut()

      window.setTimeout(() => {
        navigate('/', { replace: true })
      }, 1000)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Your account could not be deleted.',
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return (
      <section className="songbird-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-songbird-navy">
          Save your Song Bird profile
        </h1>
        <p className="mt-3 text-sm leading-7 text-songbird-text-soft">
          Sign in to save feedback, controls, playlists, and connect a music service.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-5 rounded-full bg-berry-crush px-5 py-3 text-sm font-bold text-white"
        >
          Sign in or create an account
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="songbird-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-songbird-navy">
          Your Song Bird account
        </h1>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-songbird-surface-soft p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-songbird-text-soft">
              Display name
            </dt>
            <dd className="mt-1 text-sm font-bold text-songbird-text">
              {user.user_metadata?.display_name || 'Not set'}
            </dd>
          </div>

          <div className="rounded-2xl bg-songbird-surface-soft p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-songbird-text-soft">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm font-bold text-songbird-text">
              {user.email}
            </dd>
          </div>
        </dl>
      </section>

      <section className="songbird-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Music services
        </p>

        <h2 className="mt-2 text-xl font-bold text-songbird-navy">
          Connect Spotify
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-songbird-text-soft">
          Import your top Spotify artists to seed Song Bird’s taste profile. Song Bird
          uses this to personalise discovery; listening continues in Spotify.
        </p>

        {spotifyStatus.connected ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-700">
              Connected as {spotifyStatus.spotifyDisplayName || 'Spotify user'}
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Imported top artists: {spotifyStatus.topArtists.length}
            </p>
          </div>
        ) : (
          <button
            onClick={startSpotifyConnection}
            className="mt-5 rounded-full bg-[#1DB954] px-5 py-3 text-sm font-bold text-white"
          >
            Connect Spotify
          </button>
        )}

        {spotifyStatus.loading ? (
          <p className="mt-4 text-sm text-songbird-text-soft">
            Checking Spotify connection…
          </p>
        ) : null}

        {spotifyStatus.connected && spotifyStatus.topArtists.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spotifyStatus.topArtists.slice(0, 9).map((artist) => (
              <article
                key={artist.spotifyId}
                className="rounded-2xl bg-songbird-surface-soft p-3"
              >
                <div className="flex items-center gap-3">
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-wisteria/30" />
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-songbird-text">
                      {artist.name}
                    </p>
                    <p className="truncate text-xs text-songbird-text-soft">
                      {artist.genres.slice(0, 2).join(' · ') || 'Spotify artist'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {status.message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Danger zone
        </p>

        <h2 className="mt-2 text-xl font-bold text-rose-900">
          Permanently delete account
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-800">
          This permanently deletes your profile, preferences, feedback, and future
          stored music-service connection data.
        </p>

        <form className="mt-5 max-w-md space-y-4" onSubmit={handleDeleteAccount}>
          <label className="block">
            <span className="text-sm font-bold text-rose-900">
              Type DELETE to confirm
            </span>
            <input
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-600"
              placeholder="DELETE"
              autoComplete="off"
              disabled={deleting}
            />
          </label>

          <button
            type="submit"
            disabled={deleting || confirmation !== 'DELETE'}
            className="rounded-full bg-rose-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Deleting account…' : 'Delete my account permanently'}
          </button>
        </form>
      </section>
    </div>
  )
}