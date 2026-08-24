import SwipeDeck from '../components/discovery/SwipeDeck'
import ExplainWhyCard from '../components/discovery/ExplainWhyCard'
import SectionTitle from '../components/ui/SectionTitle'
import { useSongbirdState } from '../hooks/useSongbirdState'

export default function DiscoverPage() {
 const {
  swipeArtist,
  likeArtist,
  dislikeArtist,
  preferences,
  updatePreference,
  recommendationsLoading,
  recommendationError,
  recommendationMetrics,
} = useSongbirdState()

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Discovery feed"
        title="Swipe, tune, and explore"
        subtitle="Try the recommendation controls freely. In preview mode, your choices last for this browser session; sign in later to save them permanently."
      />

{recommendationsLoading ? (
  <div className="rounded-2xl bg-azure-mist px-4 py-3 text-sm text-songbird-navy">
    Updating your hybrid recommendation ranking…
  </div>
) : null}

{recommendationError ? (
  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
    {recommendationError}
  </div>
) : null}

{recommendationMetrics ? (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <div className="rounded-2xl bg-songbird-surface-soft p-3">
      <p className="text-xs text-songbird-text-soft">Genre coverage</p>
      <p className="mt-1 text-sm font-bold text-songbird-navy">
        {Math.round(recommendationMetrics.genreCoverage * 100)}%
      </p>
    </div>

    <div className="rounded-2xl bg-songbird-surface-soft p-3">
      <p className="text-xs text-songbird-text-soft">Region coverage</p>
      <p className="mt-1 text-sm font-bold text-songbird-navy">
        {Math.round(recommendationMetrics.regionCoverage * 100)}%
      </p>
    </div>

    <div className="rounded-2xl bg-songbird-surface-soft p-3">
      <p className="text-xs text-songbird-text-soft">Language coverage</p>
      <p className="mt-1 text-sm font-bold text-songbird-navy">
        {Math.round(recommendationMetrics.languageCoverage * 100)}%
      </p>
    </div>

    <div className="rounded-2xl bg-songbird-surface-soft p-3">
      <p className="text-xs text-songbird-text-soft">Average popularity</p>
      <p className="mt-1 text-sm font-bold text-songbird-navy">
        {recommendationMetrics.averagePopularity}
      </p>
    </div>

    <div className="rounded-2xl bg-songbird-surface-soft p-3">
      <p className="text-xs text-songbird-text-soft">Artist concentration</p>
      <p className="mt-1 text-sm font-bold text-songbird-navy">
        {Math.round(recommendationMetrics.artistConcentration * 100)}%
      </p>
    </div>
  </div>
) : null}

      <SwipeDeck artist={swipeArtist} onLike={likeArtist} onDislike={dislikeArtist} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="songbird-section">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
            Recommendation preferences
          </p>

          <h3 className="text-xl font-bold text-songbird-navy">
            Adjust your discovery balance
          </h3>

          <div className="mt-5 space-y-5">
            {Object.entries(preferences)
              .filter(([key]) => !['regionWeights', 'countryWeights'].includes(key))
              .map(([key, value]) => (
                <label key={key} className="block space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold capitalize text-songbird-text">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>

                    <span className="text-sm text-songbird-text-soft">
                      {Math.round(value * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(event) =>
                      updatePreference(key, Number(event.target.value))
                    }
                    className="w-full accent-[#B8336A]"
                  />
                </label>
              ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-songbird-text-soft">
            Tip: use Explore to adjust geographic emphasis by continent and country.
          </p>
        </section>

        {swipeArtist ? <ExplainWhyCard artist={swipeArtist} /> : null}
      </div>
    </div>
  )
}