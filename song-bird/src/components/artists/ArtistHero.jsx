import { formatFollowers, formatTempo, toPercent } from '../../utils/artists'

export default function ArtistHero({ artist }) {
  return (
    <section className="songbird-card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="h-full min-h-[320px] w-full object-cover"
        />

        <div className="space-y-5 p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
                Artist profile
              </p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-songbird-navy">
                {artist.name}
              </h1>
              <p className="mt-2 text-sm text-songbird-text-soft">
                {artist.country} · {artist.region} · {artist.language}
              </p>
            </div>

            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-songbird-navy px-4 py-2 text-sm font-bold text-white"
            >
              Open in Spotify
            </a>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-songbird-text-soft">
            {artist.bio}
          </p>

          <div className="flex flex-wrap gap-2">
            {artist.genres.map((genre) => (
              <span key={genre} className="songbird-pill">
                {genre}
              </span>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Followers
              </p>
              <p className="text-sm font-bold">{formatFollowers(artist.followers)}</p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Popularity
              </p>
              <p className="text-sm font-bold">{artist.popularity}</p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Danceability
              </p>
              <p className="text-sm font-bold">
                {toPercent(artist.audioProfile.danceability)}
              </p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Energy
              </p>
              <p className="text-sm font-bold">
                {toPercent(artist.audioProfile.energy)}
              </p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Tempo
              </p>
              <p className="text-sm font-bold">
                {formatTempo(artist.audioProfile.tempo)}
              </p>
            </div>
            <div className="rounded-2xl bg-songbird-surface-soft p-4">
              <p className="text-xs uppercase tracking-wide text-songbird-text-soft">
                Valence
              </p>
              <p className="text-sm font-bold">
                {toPercent(artist.audioProfile.valence)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}