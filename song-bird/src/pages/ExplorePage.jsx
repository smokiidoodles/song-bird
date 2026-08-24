import { useMemo, useState } from 'react'
import { useSongbirdState } from '../hooks/useSongbirdState'
import SectionTitle from '../components/ui/SectionTitle'
import CountryBubbleGraph from '../components/graph/CountryBubbleGraph'

function getWeightLabel(value) {
  if (value < 0.5) return 'Avoid'
  if (value > 1.5) return 'Favor'
  return 'Neutral'
}

export default function ExplorePage() {
  const {
    likedArtists,
    preferences,
    updateRegionWeight,
    updateCountryWeight,
  } = useSongbirdState()

  const [selectedContinent, setSelectedContinent] = useState(null)

  const regionData = useMemo(() => {
    const byRegion = {}

    likedArtists.forEach((artist) => {
      const region = artist.region
      const country = artist.country

      if (!byRegion[region]) {
        byRegion[region] = {}
      }

      byRegion[region][country] = (byRegion[region][country] || 0) + 1
    })

    const regions = Object.entries(byRegion).map(([region, countries]) => ({
      region,
      countries: Object.entries(countries).map(([country, count]) => ({
        country,
        count,
      })),
    }))

    const continents = regions.map((region) => ({
      region: region.region,
      count: region.countries.reduce((total, country) => total + country.count, 0),
    }))

    return { regions, continents }
  }, [likedArtists])

  const allRegions = Object.keys(preferences.regionWeights)

  const selectedRegion = regionData.regions.find(
    (region) => region.region === selectedContinent
  )

  const countriesToShow = selectedContinent
    ? selectedRegion?.countries.map((country) => country.country) ?? []
    : Object.keys(preferences.countryWeights)

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Explore"
        title="Geographic discovery control"
        subtitle="Click a continent to explore countries within it. Your changes immediately adjust recommendation ordering for this session."
      />

      <section className="songbird-section">
        <CountryBubbleGraph
          continents={regionData.continents}
          regions={regionData.regions}
          selectedContinent={selectedContinent}
          onSelectContinent={setSelectedContinent}
        />
      </section>

      <section className="songbird-section">
        <h2 className="text-xl font-bold text-songbird-navy">
          Region emphasis controls
        </h2>

        <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
          Move left to reduce a region’s visibility in the recommendation pool, or
          move right to explore it more actively.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {allRegions.map((region) => {
            const value = preferences.regionWeights[region]

            return (
              <label key={region} className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-songbird-text">
                    {region}
                  </span>
                  <span className="text-sm text-songbird-text-soft">
                    {getWeightLabel(value)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    updateRegionWeight(region, Number(event.target.value))
                  }
                  className="w-full accent-[#B8336A]"
                />
              </label>
            )
          })}
        </div>
      </section>

      <section className="songbird-section">
        <h2 className="text-xl font-bold text-songbird-navy">
          Country emphasis controls
        </h2>

        <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
          {selectedContinent
            ? `Adjust country preferences within ${selectedContinent}.`
            : 'Select a continent above to focus this control list, or adjust all available countries below.'}
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {countriesToShow.map((country) => {
            const value = preferences.countryWeights[country] ?? 1

            return (
              <label key={country} className="block space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-songbird-text">
                    {country}
                  </span>
                  <span className="text-sm text-songbird-text-soft">
                    {getWeightLabel(value)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    updateCountryWeight(country, Number(event.target.value))
                  }
                  className="w-full accent-[#B8336A]"
                />
              </label>
            )
          })}
        </div>
      </section>

      <section className="songbird-section">
        <h2 className="text-xl font-bold text-songbird-navy">
          Preview-mode note
        </h2>

        <p className="mt-2 text-sm leading-6 text-songbird-text-soft">
          Your choices currently update recommendations only in this browser session.
           Signed-in users will save these settings to their
          Song Bird profile.
        </p>
      </section>
    </div>
  )
}