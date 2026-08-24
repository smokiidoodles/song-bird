import { Link } from 'react-router-dom'
import { formatFollowers } from '../../utils/artists'

export default function ArtistCard({ artist, onLike, onDislike, compact = false }) {
  return (
    <article className="songbird-card overflow-hidden">
      <img
        src={artist.imageUrl}
        alt={artist.name}
        className={`w-full object-cover ${compact ? 'h-44' : 'h-56'}`}
      />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-songbird-navy">{artist.name}</h3>
            <p className="mt-1 text-sm text-songbird-text-soft">
              {artist.country} · {artist.language}
            </p>
          </div>

          <span className="songbird-pill">{artist.discoveryScore}% match</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {artist.genres.map((genre) => (
            <span key={genre} className="songbird-pill">
              {genre}
            </span>
          ))}
        </div>

        <p className="text-sm leading-6 text-songbird-text-soft">{artist.bio}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-songbird-surface-soft p-3">
            <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
              Followers
            </p>
            <p className="text-sm font-bold text-songbird-text">
              {formatFollowers(artist.followers)}
            </p>
          </div>

          <div className="rounded-2xl bg-songbird-surface-soft p-3">
            <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
              Region
            </p>
            <p className="text-sm font-bold text-songbird-text">{artist.region}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onLike?.(artist.spotifyId)}
            className="rounded-full bg-songbird-success px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            Like
          </button>

          <button
            onClick={() => onDislike?.(artist.spotifyId)}
            className="rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-200"
          >
            Dislike
          </button>

          <Link
            to={`/artists/${artist.spotifyId}`}
            className="rounded-full border border-songbird-border px-4 py-2 text-sm font-bold text-songbird-text"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  )
}