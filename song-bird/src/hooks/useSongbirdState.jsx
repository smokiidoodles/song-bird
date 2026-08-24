import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { mockArtists } from '../data/mockArtists'
import { useAuthSession } from './useAuthSession'
import {
  ensureProfile,
  loadArtistFeedback,
  loadUserPreferences,
  saveArtistFeedback,
  saveUserPreferences,
} from '../services/profileService'
import { fetchRecommendations } from '../services/recommendationService'

const SongbirdStateContext = createContext(null)

const defaultPreferences = {
  energy: 0.65,
  discovery: 0.7,
  familiarity: 0.45,
  languageOpenness: 0.8,
  popularityCeiling: 0.75,
  regionWeights: {
    Africa: 1,
    Europe: 1,
    'North America': 1,
    'South America': 1,
    Asia: 1,
    Oceania: 1,
  },
  countryWeights: {
    Nigeria: 1,
    Belgium: 1,
    Spain: 1,
    'United States': 1,
  },
}

function mergePreferences(savedPreferences) {
  if (!savedPreferences) {
    return defaultPreferences
  }

  return {
    energy: Number(savedPreferences.energy ?? defaultPreferences.energy),
    discovery: Number(savedPreferences.discovery ?? defaultPreferences.discovery),
    familiarity: Number(savedPreferences.familiarity ?? defaultPreferences.familiarity),
    languageOpenness: Number(
      savedPreferences.language_openness ?? defaultPreferences.languageOpenness
    ),
    popularityCeiling: Number(
      savedPreferences.popularity_ceiling ?? defaultPreferences.popularityCeiling
    ),
    regionWeights: {
      ...defaultPreferences.regionWeights,
      ...(savedPreferences.region_weights ?? {}),
    },
    countryWeights: {
      ...defaultPreferences.countryWeights,
      ...(savedPreferences.country_weights ?? {}),
    },
  }
}

function createFallbackRecommendations(artists, likedIds, dislikedIds, preferences) {
  return artists
    .filter((artist) => !dislikedIds.includes(artist.spotifyId))
    .map((artist) => {
      const regionWeight = preferences.regionWeights[artist.region] ?? 1
      const countryWeight = preferences.countryWeights[artist.country] ?? 1
      const geographyWeight = (regionWeight + countryWeight) / 2

      const feedbackAdjustment = likedIds.includes(artist.spotifyId) ? 4 : 0
      const score = artist.discoveryScore * geographyWeight + feedbackAdjustment

      return {
        ...artist,
        score: Number(score.toFixed(2)),
        explanations: artist.whyRecommended ?? [
          'This artist matches your current discovery controls.',
        ],
      }
    })
    .sort((first, second) => second.score - first.score)
}

export function SongbirdStateProvider({ children }) {
  const { user, loading: authLoading } = useAuthSession()

  const [artists] = useState(mockArtists)
  const [likedIds, setLikedIds] = useState(['artist-tems', 'artist-burna-boy'])
  const [dislikedIds, setDislikedIds] = useState(['artist-mitski'])
  const [selectedArtistId, setSelectedArtistId] = useState('artist-tems')
  const [discoveryIndex, setDiscoveryIndex] = useState(0)
  const [preferences, setPreferences] = useState(defaultPreferences)

  const [apiRecommendations, setApiRecommendations] = useState([])
  const [recommendationMetrics, setRecommendationMetrics] = useState(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState(null)

  const [profileLoading, setProfileLoading] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const hydrationUserId = useRef(null)
  const skipNextPreferenceSave = useRef(false)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      hydrationUserId.current = null
      setProfileLoading(false)
      setSyncError(null)
      return
    }

    if (hydrationUserId.current === user.id) {
      return
    }

    let cancelled = false

    async function hydrateUserState() {
      setProfileLoading(true)
      setSyncError(null)

      try {
        await ensureProfile(user)

        const [savedPreferences, savedFeedback] = await Promise.all([
          loadUserPreferences(user.id),
          loadArtistFeedback(user.id),
        ])

        if (cancelled) {
          return
        }

        skipNextPreferenceSave.current = true
        setPreferences(mergePreferences(savedPreferences))

        setLikedIds(
          savedFeedback
            .filter((feedback) => feedback.feedback_type === 'like')
            .map((feedback) => feedback.spotify_artist_id)
        )

        setDislikedIds(
          savedFeedback
            .filter((feedback) => feedback.feedback_type === 'dislike')
            .map((feedback) => feedback.spotify_artist_id)
        )

        hydrationUserId.current = user.id
      } catch (error) {
        console.error('Could not load Song Bird profile:', error)

        if (!cancelled) {
          setSyncError('Could not load your saved Song Bird profile.')
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    hydrateUserState()

    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!user || profileLoading) {
      return
    }

    if (skipNextPreferenceSave.current) {
      skipNextPreferenceSave.current = false
      return
    }

    const timeoutId = window.setTimeout(() => {
      saveUserPreferences(user.id, preferences).catch((error) => {
        console.error('Could not save Song Bird preferences:', error)
        setSyncError('Could not save your preference changes.')
      })
    }, 600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [preferences, user, profileLoading])

  useEffect(() => {
    let cancelled = false

    const timeoutId = window.setTimeout(() => {
      async function loadRecommendations() {
        setRecommendationsLoading(true)
        setRecommendationError(null)

        try {
          const result = await fetchRecommendations({
            artists,
            likedArtistIds: likedIds,
            dislikedArtistIds: dislikedIds,
            preferences,
            limit: artists.length,
          })

          if (!cancelled) {
            setApiRecommendations(result.recommendations ?? [])
            setRecommendationMetrics(result.metrics ?? null)
          }
        } catch (error) {
          console.warn('Recommendation API unavailable; using local fallback.', error)

          if (!cancelled) {
            setApiRecommendations([])
            setRecommendationMetrics(null)
            setRecommendationError(
              'Using local preview ranking because the recommendation API is unavailable.'
            )
          }
        } finally {
          if (!cancelled) {
            setRecommendationsLoading(false)
          }
        }
      }

      loadRecommendations()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [artists, likedIds, dislikedIds, preferences])

  const fallbackRecommendations = useMemo(() => {
    return createFallbackRecommendations(
      artists,
      likedIds,
      dislikedIds,
      preferences
    )
  }, [artists, likedIds, dislikedIds, preferences])

  const recommendedArtists = useMemo(() => {
    if (apiRecommendations.length === 0) {
      return fallbackRecommendations
    }

    const artistById = new Map(
      artists.map((artist) => [artist.spotifyId, artist])
    )

    return apiRecommendations
      .map((recommendation) => {
        const artist = artistById.get(recommendation.spotifyId)

        if (!artist) {
          return null
        }

        return {
          ...artist,
          discoveryScore: Math.round(recommendation.score),
          weightedScore: recommendation.score,
          whyRecommended: recommendation.explanations,
          recommendationComponents: recommendation.components,
        }
      })
      .filter(Boolean)
  }, [apiRecommendations, artists, fallbackRecommendations])

  const likedArtists = artists.filter((artist) =>
    likedIds.includes(artist.spotifyId)
  )

  const dislikedArtists = artists.filter((artist) =>
    dislikedIds.includes(artist.spotifyId)
  )

  const selectedArtist =
    artists.find((artist) => artist.spotifyId === selectedArtistId) ?? artists[0]

  const swipeArtist =
    recommendedArtists[discoveryIndex % recommendedArtists.length] ?? null

  function saveFeedbackForSignedInUser(spotifyId, feedbackType) {
    if (!user) {
      return
    }

    saveArtistFeedback(user.id, spotifyId, feedbackType).catch((error) => {
      console.error('Could not save artist feedback:', error)
      setSyncError('Could not save your artist feedback.')
    })
  }

  function likeArtist(spotifyId) {
    setLikedIds((current) => Array.from(new Set([...current, spotifyId])))
    setDislikedIds((current) => current.filter((id) => id !== spotifyId))
    setDiscoveryIndex((current) => current + 1)
    saveFeedbackForSignedInUser(spotifyId, 'like')
  }

  function dislikeArtist(spotifyId) {
    setDislikedIds((current) => Array.from(new Set([...current, spotifyId])))
    setLikedIds((current) => current.filter((id) => id !== spotifyId))
    setDiscoveryIndex((current) => current + 1)
    saveFeedbackForSignedInUser(spotifyId, 'dislike')
  }

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateRegionWeight(region, weight) {
    setPreferences((current) => ({
      ...current,
      regionWeights: {
        ...current.regionWeights,
        [region]: weight,
      },
    }))
  }

  function updateCountryWeight(country, weight) {
    setPreferences((current) => ({
      ...current,
      countryWeights: {
        ...current.countryWeights,
        [country]: weight,
      },
    }))
  }

  const value = {
    artists,
    recommendedArtists,
    likedArtists,
    dislikedArtists,
    selectedArtist,
    selectedArtistId,
    setSelectedArtistId,
    swipeArtist,
    preferences,
    likeArtist,
    dislikeArtist,
    updatePreference,
    updateRegionWeight,
    updateCountryWeight,
    profileLoading,
    syncError,
    isPersistent: Boolean(user),
    recommendationsLoading,
    recommendationError,
    recommendationMetrics,
  }

  return (
    <SongbirdStateContext.Provider value={value}>
      {children}
    </SongbirdStateContext.Provider>
  )
}

export function useSongbirdState() {
  const context = useContext(SongbirdStateContext)

  if (!context) {
    throw new Error('useSongbirdState must be used within SongbirdStateProvider')
  }

  return context
}