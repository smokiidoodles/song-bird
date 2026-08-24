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
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })
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

        const spotifyResult = searchParams.get('spotify')

        if (connection.connected) {
          setStatus({
            type: 'success',
            message:
              spotifyResult === 'connected'
                ? 'Spotify connected successfully. Your top artists are available below.'
                : 'Spotify is connected to your Song Bird account.',
          })
        } else if (spotifyResult === 'denied') {
          setStatus({
            type: 'error',
            message: 'Spotify connection was cancelled.',
          })
        } else if (
          spotifyResult === 'failed' ||
          spotifyResult === 'token_failed' ||
          spotifyResult === 'expired'
        ) {
          setStatus({
            type: 'error',
            message:
              'Spotify could not be connected. Please try again from this page.',
          })
        }

        if (spotifyResult) {
          window.setTimeout(() => {
            navigate('/account', { replace: true })
          }, 120)
        }
      } catch (error) {
        console.error('Could not load Spotify status:', error)

        if (active) {
          setSpotifyStatus((current) => ({
            ...current,
            loading: false,
          }))

          setStatus({
            type: 'error',
            message:
              'Could not verify your Spotify connection. Refresh the page and try again.',
          })
        }
      }
    }

    loadSpotifyStatus()

    return () => {
      active = false
    }
  }, [user, searchParams, navigate])

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
      'Permanently delete your Song Bird account, saved preferences, feedback, playlists, history, and Spotify connection? This cannot be undone.'
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
      console.error('Account deletion failed:', error)

      setStatus({
        type: 'error',
        message:
          error.message ||
          'Your account could not be deleted. Please try again.',
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

        <p className="mt-3 max-w-2xl text-sm leading-7 text-songbird-text-soft">
          Create an account to save likes, dislikes, geographic discovery controls,
          playlists, and a connected music-service profile between sessions.
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

        <p className="mt-3 text-sm leading-7 text-songbird-text-soft">
          Your profile stores feedback and recommendation controls. Your connected
          Spotify account provides top-artist signals for future discovery
          personalisation.
        </p>

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
          Connect Spotify to view your top artists in Song Bird. These artists will
          later be used as an additional taste signal for the hybrid recommendation
          system, while playback continues in Spotify.
        </p>

        {spotifyStatus.loading ? (
          <p className="mt-5 text-sm text-songbird-text-soft">
            Checking your Spotify connection…
          </p>
        ) : null}

        {!spotifyStatus.loading && !spotifyStatus.connected ? (
          <button
            onClick={startSpotifyConnection}
            className="mt-5 rounded-full bg-[#1DB954] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            Connect Spotify
          </button>
        ) : null}

        {!spotifyStatus.loading && spotifyStatus.connected ? (
          <>
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-700">
                Connected as{' '}
                {spotifyStatus.spotifyDisplayName || 'Spotify user'}
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Top artists available: {spotifyStatus.topArtists.length}
              </p>
            </div>

            {spotifyStatus.topArtists.length > 0 ? (
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
                          {artist.genres?.slice(0, 2).join(' · ') ||
                            'Spotify artist'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-songbird-text-soft">
                Spotify is connected, but no top artists were returned for the current
                time range.
              </p>
            )}

            <p className="mt-5 text-xs leading-5 text-songbird-text-soft">
              Note: this current prototype connection is stored in FastAPI memory.
              If the backend restarts, reconnect Spotify. Persistent encrypted token
              storage will be added after the catalogue and recommendation algorithm
              are stable.
            </p>
          </>
        ) : null}
      </section>

      {status.message ? (
        <section
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {status.message}
        </section>
      ) : null}

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Danger zone
        </p>

        <h2 className="mt-2 text-xl font-bold text-rose-900">
          Permanently delete account
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-800">
          Deletion permanently removes your Song Bird account, saved profile,
          preferences, feedback, playlists, recommendation history, and future
          connected music-service records.
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
            className="rounded-full bg-rose-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Deleting account…' : 'Delete my account permanently'}
          </button>
        </form>
      </section>
    </div>
  )
}