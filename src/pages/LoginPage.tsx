import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { login } from '../auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      const user = await login(String(form.get('email')).trim(), String(form.get('password')))
      await navigate(user.role === 'CASHIER' ? '/caja' : '/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <main className="login">
      <form className="card login-card" onSubmit={onSubmit}>
        <div className="brand">
          <span className="brand-mark" aria-hidden>●</span> Fidelify
        </div>
        <h1>Entra a tu panel</h1>
        <label>
          Correo
          <input name="email" type="email" required autoComplete="username" autoFocus />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
