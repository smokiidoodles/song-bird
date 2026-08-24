import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthSessionContext = createContext(null)

export function AuthSessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (active) {
        setSession(currentSession)
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
    }),
    [session, loading]
  )

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }

  return context
}