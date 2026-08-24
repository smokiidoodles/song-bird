const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

export async function fetchRecommendations({
  artists,
  likedArtistIds,
  dislikedArtistIds,
  preferences,
  limit = 12,
}) {
  const response = await fetch(`${apiBaseUrl}/api/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      artists,
      likedArtistIds,
      dislikedArtistIds,
      preferences,
      limit,
    }),
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      body?.detail || 'Song Bird could not calculate recommendations.'
    )
  }

  return body
}