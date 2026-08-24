import { supabase } from '../lib/supabase'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Add it to .env.local and restart Vite.'
  )
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('You must be signed in to perform this action.')
  }

  return session.access_token
}

async function request(path, options = {}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: options.body,
  })

  if (response.status === 204) {
    return null
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const validationMessage = Array.isArray(body?.detail)
      ? body.detail.map((item) => item.msg).join(', ')
      : body?.detail

    throw new Error(validationMessage || 'The request could not be completed.')
  }

  return body
}

export function getCurrentAccount() {
  return request('/api/me')
}

export function deleteCurrentAccount() {
  return request('/api/account', {
    method: 'DELETE',
    body: JSON.stringify({
      confirmation: 'DELETE',
    }),
  })
}