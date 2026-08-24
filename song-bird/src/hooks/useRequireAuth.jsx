import { useNavigate } from 'react-router-dom'
import { useAuthSession } from './useAuthSession'

export function useRequireAuth() {
  const { user } = useAuthSession()
  const navigate = useNavigate()

  function requireAuth(action) {
    if (user) {
      action()
      return true
    }

    navigate('/auth', {
      state: {
        message: 'Sign in or create an account to save your Song Bird preferences.',
      },
    })

    return false
  }

  return {
    user,
    requireAuth,
  }
}