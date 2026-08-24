import { supabase } from '../lib/supabase'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Sign in to connect Spotify.')
  }

  return user.id
}

export async function startSpotifyConnection() {
  const userId = await getCurrentUserId()

  window.location.assign(
    `${apiBaseUrl}/api/spotify/connect?user_id=${encodeURIComponent(userId)}`
  )
}

export async function getSpotifyConnectionStatus() {
  const userId = await getCurrentUserId()

  const response = await fetch(
    `${apiBaseUrl}/api/spotify/status?user_id=${encodeURIComponent(userId)}`
  )

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      body?.detail || 'Could not load Spotify connection status.'
    )
  }

  return body
}

/*
  In the current local/simple Spotify implementation, this requests the
  latest available top-artist response from the active backend session.

  If Render/FastAPI restarts, the temporary session disappears and the user
  must connect Spotify again. Persistent refresh-token storage is a later step.
*/
export async function refreshSpotifyData() {
  return getSpotifyConnectionStatus()
}