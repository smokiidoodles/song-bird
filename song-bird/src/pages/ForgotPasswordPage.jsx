import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      await requestPasswordReset(email)

      setStatus({
        type: 'success',
        message:
          'If an account exists for this email address, we have sent a password-reset link.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message || 'Could not send the password-reset email.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="songbird-card w-full max-w-md p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-berry-crush">
          Account recovery
        </p>

        <h1 className="mt-2 text-3xl font-bold text-songbird-navy">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-songbird-text-soft">
          Enter your account email and we will send a secure password-reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-songbird-text">
              Email address
            </span>

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
            className="w-full rounded-full bg-berry-crush px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending reset link…' : 'Send reset link'}
          </button>
        </form>

        <Link
          to="/auth"
          className="mt-5 block text-center text-sm font-bold text-berry-crush"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  )
}