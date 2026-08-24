import { useMemo } from 'react'
import { useSongbirdState } from '../hooks/useSongbirdState'
import SectionTitle from '../components/ui/SectionTitle'
import ArtistNodeGraph from '../components/graph/ArtistNodeGraph'
import { buildArtistRelationshipGraph } from '../utils/graphData'

export default function GraphPage() {
  const { artists } = useSongbirdState()

  const graph = useMemo(() => {
    return buildArtistRelationshipGraph(artists)
  }, [artists])

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Relationship graph"
        title="Artist, producer, and studio connections"
        subtitle="Use this as a brainstorming tool to see how artists relate via country, producer, and studio. Later, this can feed into recommendation explanations."
      />

      <section className="songbird-section">
        <ArtistNodeGraph graph={graph} />
      </section>

      <section className="songbird-section">
        <h2 className="text-xl font-bold text-songbird-navy">Fundamental issues to consider</h2>
        <ul className="list-disc pl-6 text-sm leading-6 text-songbird-text-soft">
          <li>
            Too many nodes/edges can make the graph unreadable; in production you
            will need filtering (by region, genre, or relationship type).
          </li>
          <li>
            Force-directed layouts can be slow on large datasets; you may need
            simpler layouts or pre-computed positions.
          </li>
          <li>
            Relationships like “same producer” or “same studio” are powerful for
            recommendations but require good data quality and consistent IDs.
          </li>
        </ul>
      </section>
    </div>
  )
}