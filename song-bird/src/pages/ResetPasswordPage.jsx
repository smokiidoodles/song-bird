import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../services/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (password.length < 6) {
      setStatus({
        type: 'error',
        message: 'Your new password must be at least 6 characters.',
      })
      return
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'The passwords do not match.',
      })
      return
    }

    setSubmitting(true)

    try {
      await updatePassword(password)

      setStatus({
        type: 'success',
        message: 'Password updated. Returning you to Song Bird…',
      })

      window.setTimeout(() => {
        navigate('/', { replace: true })
      }, 900)
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message ||
          'Could not update the password. Request a new reset link and try again.',
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
          Choose a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-songbird-text-soft">
          Create a new password for your Song Bird account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-songbird-text">
              New password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-songbird-border bg-white px-4 py-3 text-sm outline-none focus:border-berry-crush"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-songbird-text">
              Confirm new password
            </span>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-songbird-border bg-white px-4 py-3 text-sm outline-none focus:border-berry-crush"
              autoComplete="new-password"
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
            className="w-full rounded-full bg-berry-crush px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Updating password…' : 'Update password'}
          </button>
        </form>
      </section>
    </main>
  )
}