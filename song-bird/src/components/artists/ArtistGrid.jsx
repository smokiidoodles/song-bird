import ArtistCard from './ArtistCard'

export default function ArtistGrid({ artists, onLike, onDislike }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((artist) => (
        <ArtistCard
          key={artist.spotifyId}
          artist={artist}
          onLike={onLike}
          onDislike={onDislike}
        />
      ))}
    </div>
  )
}