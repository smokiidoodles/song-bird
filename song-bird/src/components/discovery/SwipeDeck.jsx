export default function SwipeDeck({ artist, onLike, onDislike }) {
  if (!artist) {
    return null
  }

  return (
    <section className="songbird-card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
            Swipe discovery
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-songbird-navy">
            Your next artist candidate
          </h2>

          <p className="mt-3 text-sm leading-7 text-songbird-text-soft">
            Browse freely in preview mode. Your choices shape recommendations for
            this session; sign in later to save them to your Song Bird profile.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {artist.genres.map((genre) => (
              <span key={genre} className="songbird-pill">
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {artist.whyRecommended.map((reason) => (
              <div
                key={reason}
                className="rounded-2xl bg-songbird-surface-soft px-4 py-3 text-sm text-songbird-text-soft"
              >
                {reason}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onDislike(artist.spotifyId)}
              className="rounded-full bg-rose-100 px-5 py-3 text-sm font-bold text-rose-700"
            >
              Swipe left
            </button>

            <button
              onClick={() => onLike(artist.spotifyId)}
              className="rounded-full bg-songbird-success px-5 py-3 text-sm font-bold text-white"
            >
              Swipe right
            </button>
          </div>
        </div>

        <div className="relative min-h-[360px]">
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-songbird-navy/90 via-songbird-navy/50 to-transparent p-6 text-white">
            <h3 className="text-3xl font-bold">{artist.name}</h3>
            <p className="mt-2 text-sm text-white/80">
              {artist.country} · {artist.language} · {artist.discoveryScore}% discovery fit
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}