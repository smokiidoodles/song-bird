import { useLocation } from 'react-router-dom'
import AuthForm from '../components/auth/AuthForm'

export default function AuthPage() {
  const location = useLocation()
  const message = location.state?.message

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        {message ? (
          <p className="rounded-2xl bg-azure-mist px-4 py-3 text-sm leading-6 text-songbird-navy">
            {message}
          </p>
        ) : null}

        <AuthForm />
      </div>
    </main>
  )
}