import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'
import {
  getSpotifyConnectionStatus,
  refreshSpotifyData,
  startSpotifyConnection,
} from '../../services/spotifyService'

export default function SpotifyRefreshPanel() {
  const { user } = useAuthSession()

  const [spotifyStatus, setSpotifyStatus] = useState({
    loading: Boolean(user),
    connected: false,
    topArtists: [],
  })

  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setSpotifyStatus({
        loading: false,
        connected: false,
        topArtists: [],
      })
      return
    }

    let active = true

    async function loadStatus() {
      try {
        const connection = await getSpotifyConnectionStatus()

        if (!active) {
          return
        }

        setSpotifyStatus({
          loading: false,
          connected: connection.connected,
          topArtists: connection.topArtists ?? [],
        })
      } catch (error) {
        if (active) {
          setSpotifyStatus({
            loading: false,
            connected: false,
            topArtists: [],
          })
        }
      }
    }

    loadStatus()

    return () => {
      active = false
    }
  }, [user])

  async function handleRefresh() {
    setRefreshing(true)
    setMessage('')

    try {
      const connection = await refreshSpotifyData()

      setSpotifyStatus({
        loading: false,
        connected: connection.connected,
        topArtists: connection.topArtists ?? [],
      })

      setMessage('Spotify listening signals refreshed.')
    } catch (error) {
      setMessage(
        error.message ||
          'Spotify data could not be refreshed. Reconnect Spotify and try again.'
      )
    } finally {
      setRefreshing(false)
    }
  }

  if (!user) {
    return (
      <section className="rounded-2xl bg-azure-mist px-4 py-4 text-sm text-songbird-navy">
        Want recommendations based on your listening patterns?{' '}
        <Link to="/auth" className="font-bold underline">
          Sign in
        </Link>{' '}
        and connect Spotify from your account.
      </section>
    )
  }

  if (spotifyStatus.loading) {
    return (
      <section className="rounded-2xl bg-songbird-surface-soft px-4 py-4 text-sm text-songbird-text-soft">
        Checking connected music services…
      </section>
    )
  }

  if (!spotifyStatus.connected) {
    return (
      <section className="rounded-2xl bg-songbird-surface-soft px-4 py-4 text-sm text-songbird-text-soft">
        <p className="font-semibold text-songbird-text">
          Personalise discovery with Spotify
        </p>

        <p className="mt-1 leading-6">
          Connect Spotify to use your top artists as an additional taste signal.
        </p>

        <button
          onClick={startSpotifyConnection}
          className="mt-3 rounded-full bg-[#1DB954] px-4 py-2 text-sm font-bold text-white"
        >
          Connect Spotify
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-800">
            Spotify taste signal connected
          </p>

          <p className="mt-1 text-sm leading-6 text-emerald-700">
            {spotifyStatus.topArtists.length} top artists are available to seed
            future discovery recommendations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? 'Refreshing…' : 'Refresh Spotify'}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-xs leading-5 text-emerald-800">{message}</p>
      ) : null}
    </section>
  )
}