import { supabase } from '../lib/supabase'

export async function ensureProfile(user) {
  const profile = {
    id: user.id,
    email: user.email ?? null,
    display_name: user.user_metadata?.display_name ?? null,
  }

  const { error } = await supabase.from('profiles').upsert(profile)

  if (error) {
    throw error
  }
}

export async function loadUserPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function saveUserPreferences(userId, preferences) {
  const payload = {
    user_id: userId,
    energy: preferences.energy,
    discovery: preferences.discovery,
    familiarity: preferences.familiarity,
    language_openness: preferences.languageOpenness,
    popularity_ceiling: preferences.popularityCeiling,
    region_weights: preferences.regionWeights,
    country_weights: preferences.countryWeights,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    throw error
  }
}

export async function loadArtistFeedback(userId) {
  const { data, error } = await supabase
    .from('artist_feedback')
    .select('spotify_artist_id, feedback_type')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function saveArtistFeedback(userId, spotifyArtistId, feedbackType) {
  const { error } = await supabase
    .from('artist_feedback')
    .upsert(
      {
        user_id: userId,
        spotify_artist_id: spotifyArtistId,
        feedback_type: feedbackType,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,spotify_artist_id',
      }
    )

  if (error) {
    throw error
  }
}