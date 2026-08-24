import { Link } from 'react-router-dom'
import { useSongbirdState } from '../hooks/useSongbirdState'
import { useAuthSession } from '../hooks/useAuthSession'

export default function PlaylistPage() {
  const { likedArtists } = useSongbirdState()
  const { user } = useAuthSession()

  return (
    <div className="space-y-6">
      <section className="songbird-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Playlists
        </p>

        <h1 className="text-3xl font-bold text-songbird-navy">
          Your evolving discovery playlist
        </h1>

        <p className="mt-2 text-sm leading-7 text-songbird-text-soft">
          In preview mode, this playlist is generated from artists you have liked
          during this browser session.
        </p>

        {!user ? (
          <div className="mt-5 rounded-2xl bg-azure-mist px-4 py-3 text-sm leading-6 text-songbird-navy">
            Your choices are temporary in preview mode.{' '}
            <Link to="/auth" className="font-bold underline">
              Sign in to save your discovery profile.
            </Link>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            You are signed in. Your Song Bird profile is ready for persistent
            preferences and feedback in the next data-saving checkpoint.
          </div>
        )}
      </section>

      {likedArtists.length === 0 ? (
        <section className="songbird-section">
          <p className="text-sm text-songbird-text-soft">
            You have not liked any artists yet. Go to Discover or Artists and like a
            few artists to populate this preview playlist.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {likedArtists.map((artist) => (
            <article key={artist.spotifyId} className="songbird-card overflow-hidden">
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="h-44 w-full object-cover"
              />

              <div className="space-y-2 p-4">
                <h2 className="text-xl font-bold text-songbird-navy">
                  {artist.name}
                </h2>

                <p className="text-sm text-songbird-text-soft">
                  {artist.genres.join(' · ')}
                </p>

                <p className="text-sm text-songbird-text-soft">
                  Discovery fit: {artist.discoveryScore}%
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}