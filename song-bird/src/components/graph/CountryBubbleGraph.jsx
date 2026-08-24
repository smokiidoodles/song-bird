import { useMemo } from 'react'
import Legend from './Legend'

export default function CountryBubbleGraph({
  continents,
  regions,
  selectedContinent,
  onSelectContinent,
}) {
  const maxCountContinent = Math.max(
    1,
    ...continents.map((c) => c.count)
  )

  const selectedRegion = useMemo(() => {
    if (!selectedContinent) return null
    return regions.find((r) => r.region === selectedContinent)
  }, [selectedContinent, regions])

  const maxCountCountry = useMemo(() => {
    if (!selectedRegion) return 1
    return Math.max(1, ...selectedRegion.countries.map((c) => c.count))
  }, [selectedRegion])

  function radiusForContinent(count) {
    const minR = 40
    const maxR = 90
    const ratio = count / maxCountContinent
    return minR + ratio * (maxR - minR)
  }

  function radiusForCountry(count) {
    const minR = 24
    const maxR = 72
    const ratio = count / maxCountCountry
    return minR + ratio * (maxR - minR)
  }

  return (
    <div>
      {/* Continent view */}
      {!selectedContinent && (
        <div className="transition-opacity duration-300">
          <p className="mb-4 text-sm font-semibold text-songbird-text-soft">
            Select a continent
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {continents.map((c) => {
              const r = radiusForContinent(c.count)
              return (
                <button
                  key={c.region}
                  onClick={() => onSelectContinent(c.region)}
                  className="group flex flex-col items-center"
                  title={`${c.region}: ${c.count} liked artists`}
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-icy-blue font-bold text-songbird-navy shadow transition-transform group-hover:scale-105"
                    style={{
                      width: r * 2,
                      height: r * 2,
                      fontSize: Math.max(14, r * 0.22),
                    }}
                  >
                    {c.region}
                  </div>
                  <p className="mt-2 text-center text-xs text-songbird-text-soft">
                    {c.count} liked
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Country view for selected continent */}
      {selectedContinent && selectedRegion && (
        <div className="transition-opacity duration-300">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-songbird-text-soft">
              Countries in {selectedContinent}
            </p>
            <button
              onClick={() => onSelectContinent(null)}
              className="rounded-full border border-songbird-border bg-white px-3 py-1 text-xs font-bold text-songbird-text hover:bg-songbird-surface-soft"
            >
              Back to continents
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {selectedRegion.countries.map((c) => {
              const r = radiusForCountry(c.count)
              return (
                <div
                  key={c.country}
                  className="flex flex-col items-center"
                  style={{ width: r * 2, height: r * 2 }}
                  title={`${c.country}: ${c.count} liked artists`}
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-icy-blue font-bold text-songbird-navy shadow"
                    style={{
                      width: r * 2,
                      height: r * 2,
                      fontSize: Math.max(12, r * 0.25),
                    }}
                  >
                    {c.country}
                  </div>
                  <p className="mt-2 text-center text-xs text-songbird-text-soft">
                    {c.count} liked
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Legend />
      </div>
    </div>
  )
}