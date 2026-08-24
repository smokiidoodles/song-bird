import { Link } from 'react-router-dom'
import { useSongbirdState } from '../hooks/useSongbirdState'
import { useAuthSession } from '../hooks/useAuthSession'

export default function InsightsPage() {
  const { likedArtists, dislikedArtists } = useSongbirdState()
  const { user } = useAuthSession()

  const regions = likedArtists.reduce((accumulator, artist) => {
    const region = artist.region

    accumulator[region] = (accumulator[region] || 0) + 1

    return accumulator
  }, {})

  const languages = likedArtists.reduce((accumulator, artist) => {
    const language = artist.language

    accumulator[language] = (accumulator[language] || 0) + 1

    return accumulator
  }, {})

  const topGenres = likedArtists
    .flatMap((artist) => artist.genres)
    .reduce((accumulator, genre) => {
      accumulator[genre] = (accumulator[genre] || 0) + 1

      return accumulator
    }, {})

  return (
    <div className="space-y-6">
      <section className="songbird-section">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Discovery DNA
        </p>

        <h1 className="mt-2 text-3xl font-bold text-songbird-navy">
          Taste signals from your discovery choices
        </h1>

        <p className="mt-3 text-sm leading-7 text-songbird-text-soft">
          Song Bird uses your feedback to build a more varied recommendation profile
          across regions, languages, genres, popularity, novelty, and audio features.
        </p>

        {!user ? (
          <div className="mt-5 rounded-2xl bg-azure-mist px-4 py-3 text-sm leading-6 text-songbird-navy">
            You are exploring in preview mode. Your choices will remain available
            only during this browser session.{' '}
            <Link to="/auth" className="font-bold underline">
              Sign in to save your Discovery DNA.
            </Link>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            You are signed in. In the next checkpoint, your feedback and geographic
            preferences will be stored in your Song Bird profile.
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="songbird-section">
          <h2 className="text-xl font-bold text-songbird-navy">Liked regions</h2>

          <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
            This shows the geographic balance of artists you have liked during the
            current session.
          </p>

          <div className="mt-5 space-y-3">
            {Object.keys(regions).length === 0 ? (
              <p className="text-sm text-songbird-text-soft">
                No regional pattern yet. Like artists in Discover or Artists to begin
                shaping this view.
              </p>
            ) : (
              Object.entries(regions).map(([region, count]) => (
                <div
                  key={region}
                  className="flex items-center justify-between rounded-2xl bg-songbird-surface-soft px-4 py-3"
                >
                  <span className="text-sm font-semibold text-songbird-text">
                    {region}
                  </span>

                  <span className="text-sm text-songbird-text-soft">
                    {count} liked artist{count === 1 ? '' : 's'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="songbird-section">
          <h2 className="text-xl font-bold text-songbird-navy">
            Feedback summary
          </h2>

          <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
            A simple summary of the temporary feedback shaping your preview
            recommendations.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              Likes captured: {likedArtists.length}
            </div>

            <div className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-700">
              Dislikes captured: {dislikedArtists.length}
            </div>

            <div className="rounded-2xl bg-azure-mist px-4 py-4 text-sm text-songbird-navy">
              Current discovery direction: global exploration, melodic vocals,
              balanced novelty, and lower dependence on pure chart popularity.
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="songbird-section">
          <h2 className="text-xl font-bold text-songbird-navy">
            Language openness
          </h2>

          <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
            Language variety becomes a future component of Discovery DNA and
            recommendation diversity.
          </p>

          <div className="mt-5 space-y-3">
            {Object.keys(languages).length === 0 ? (
              <p className="text-sm text-songbird-text-soft">
                No language profile yet. Like artists to create one.
              </p>
            ) : (
              Object.entries(languages).map(([language, count]) => (
                <div
                  key={language}
                  className="flex items-center justify-between rounded-2xl bg-songbird-surface-soft px-4 py-3"
                >
                  <span className="text-sm font-semibold text-songbird-text">
                    {language}
                  </span>

                  <span className="text-sm text-songbird-text-soft">
                    {count} artist{count === 1 ? '' : 's'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="songbird-section">
          <h2 className="text-xl font-bold text-songbird-navy">
            Genre signals
          </h2>

          <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
            This is a basic genre-frequency view. The later hybrid recommender will
            use broad families, specific genres, audio similarity, language, novelty,
            and location together rather than relying on genre counts alone.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {Object.keys(topGenres).length === 0 ? (
              <p className="text-sm text-songbird-text-soft">
                No genre signals yet.
              </p>
            ) : (
              Object.entries(topGenres).map(([genre, count]) => (
                <span
                  key={genre}
                  className="rounded-full bg-wisteria/25 px-3 py-2 text-sm font-semibold text-songbird-navy"
                >
                  {genre} · {count}
                </span>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="songbird-section">
        <h2 className="text-xl font-bold text-songbird-navy">
          What this becomes later
        </h2>

        <p className="mt-2 text-sm leading-7 text-songbird-text-soft">
          Once Supabase persistence and FastAPI recommendation scoring are connected,
          this page will calculate diversity, novelty, country and language coverage,
          artist concentration, and popularity-bias measures from your recommendation
          history—not just the current temporary session.
        </p>
      </section>
    </div>
  )
}