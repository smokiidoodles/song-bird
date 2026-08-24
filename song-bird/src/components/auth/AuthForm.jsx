import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession'
import { signInWithEmail, signUpWithEmail } from '../../services/authService'

export default function AuthForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuthSession()

  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signUp'
  const redirectTo = location.state?.from || '/'

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, loading, navigate, redirectTo])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setSubmitting(true)

    try {
      if (isSignUp) {
        const data = await signUpWithEmail({
          email,
          password,
          displayName,
        })

        if (data.session) {
          navigate(redirectTo, { replace: true })
          return
        }

        setStatus({
          type: 'success',
          message:
            'Account created. Check your email to confirm your account, then return and sign in.',
        })
        return
      }

      await signInWithEmail({ email, password })

      navigate(redirectTo, { replace: true })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Authentication failed. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="songbird-card mx-auto w-full max-w-md p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
        Song Bird account
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-songbird-navy">
        {isSignUp ? 'Build your discovery profile' : 'Welcome back'}
      </h1>

      <p className="mt-3 text-sm leading-6 text-songbird-text-soft">
        Save your likes, dislikes, geographic discovery controls, playlists, and
        future Spotify connection to your Song Bird profile.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {isSignUp ? (
          <label className="block">
            <span className="text-sm font-semibold text-songbird-text">
              Display name
            </span>

            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-songbird-border bg-white px-4 py-3 text-sm outline-none focus:border-berry-crush"
              placeholder="Your name"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-songbird-text">Email</span>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-songbird-border bg-white px-4 py-3 text-sm outline-none focus:border-berry-crush"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-songbird-text">
            Password
          </span>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-songbird-border bg-white px-4 py-3 text-sm outline-none focus:border-berry-crush"
            placeholder="At least 6 characters"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength="6"
            required
          />
        </label>

        {status.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              status.type === 'error'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-berry-crush px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? 'Please wait…'
            : isSignUp
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignUp ? 'signIn' : 'signUp')
          setStatus({ type: '', message: '' })
        }}
        className="mt-5 w-full text-sm font-bold text-berry-crush"
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : 'Need an account? Create one'}
      </button>
    </section>
  )
}