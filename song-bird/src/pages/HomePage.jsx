import { Link } from 'react-router-dom'
import SectionTitle from '../components/ui/SectionTitle'
import StatChip from '../components/ui/StatChip'
import ArtistGrid from '../components/artists/ArtistGrid'
import { useSongbirdState } from '../hooks/useSongbirdState'

export default function HomePage() {
  const { recommendedArtists, likedArtists, likeArtist, dislikeArtist } = useSongbirdState()

  return (
    <div className="space-y-6">
      <section className="songbird-card overflow-hidden p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
              Personalised discovery
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-songbird-navy lg:text-5xl">
              Find artists you are likely to love, not just the most popular ones.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-songbird-text-soft">
              Song Bird blends genre fit, audio similarity, language openness,
              novelty, and diversity into a discovery experience designed to move
              beyond mainstream repetition.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/discover"
                className="rounded-full bg-berry-crush px-5 py-3 text-sm font-bold text-white"
              >
                Start discovering
              </Link>
              <Link
                to="/artists"
                className="rounded-full border border-songbird-border px-5 py-3 text-sm font-bold text-songbird-text"
              >
                Browse artists
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatChip label="Liked artists" value={likedArtists.length} tone="berry" />
            <StatChip label="Discovery candidates" value={recommendedArtists.length} tone="blue" />
            <StatChip label="Language openness" value="80%" />
            <StatChip label="Novelty target" value="Balanced" />
          </div>
        </div>
      </section>

      <section className="songbird-section">
        <SectionTitle
          eyebrow="Recommended now"
          title="Top discovery picks"
          subtitle="These artists are sorted from the mock discovery score so we can validate card layouts and recommendation messaging."
        />
        <ArtistGrid
          artists={recommendedArtists.slice(0, 3)}
          onLike={likeArtist}
          onDislike={dislikeArtist}
        />
      </section>
    </div>
  )
}