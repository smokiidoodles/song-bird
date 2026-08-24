import { Link, useParams } from 'react-router-dom'
import { formatFollowers, toPercent } from '../utils/artists.js'
import { useSongbirdState } from '../hooks/useSongbirdState'

export default function ArtistProfilePage() {
  const { spotifyId } = useParams()
  const { artists } = useSongbirdState()
  const artist = artists.find((item) => item.spotifyId === spotifyId)

  if (!artist) {
    return (
      <section className="songbird-section">
        <p className="text-sm text-songbird-text-soft">Artist not found.</p>
        <Link to="/artists" className="mt-4 inline-block rounded-full bg-songbird-navy px-4 py-2 text-sm font-bold text-white">
          Back to artists
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/artists" className="inline-flex items-center gap-2 text-sm font-semibold text-songbird-text-soft">
        ← Back to artists
      </Link>

      <section className="songbird-card overflow-hidden">
        <img src={artist.imageUrl} alt={artist.name} className="h-72 w-full object-cover" />

        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
                Artist profile
              </p>
              <h1 className="mt-2 text-3xl font-bold text-songbird-navy">{artist.name}</h1>
              <p className="mt-2 text-sm text-songbird-text-soft">
                {artist.country} · {artist.language} · {artist.region}
              </p>
            </div>
            <span className="songbird-pill">{artist.discoveryScore}% match</span>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-songbird-text-soft">{artist.bio}</p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-songbird-text-soft">Followers</p>
              <p className="mt-2 text-xl font-bold text-songbird-text">{formatFollowers(artist.followers)}</p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-songbird-text-soft">Popularity</p>
              <p className="mt-2 text-xl font-bold text-songbird-text">{toPercent(artist.popularity)}</p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-songbird-text-soft">Tempo</p>
              <p className="mt-2 text-xl font-bold text-songbird-text">{artist.tempo} BPM</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-songbird-navy">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((genre) => (
                <span key={genre} className="songbird-pill">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
