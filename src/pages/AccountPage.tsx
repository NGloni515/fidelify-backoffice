import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { accountApi } from '../api/client'
import { useCurrentUser } from '../auth/session'

export function AccountPage() {
  const user = useCurrentUser()
  const [notice, setNotice] = useState<string | null>(null)
  const [mismatch, setMismatch] = useState(false)

  const change = useMutation({
    mutationFn: (input: { current: string; next: string }) => accountApi.changePassword(input.current, input.next),
  })

  if (!user) return null

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    const next = String(form.get('newPassword'))
    setNotice(null)
    change.reset()
    const matches = next === String(form.get('confirmPassword'))
    setMismatch(!matches)
    if (!matches) return
    change.mutate(
      { current: String(form.get('currentPassword')), next },
      {
        onSuccess: () => {
          formElement.reset()
          setNotice('Listo, tu contraseña cambió. Úsala la próxima vez que entres.')
        },
      },
    )
  }

  return (
    <section>
      <h1>Mi cuenta</h1>
      <p className="muted">
        {user.name} · {user.email}
      </p>

      {notice && <div className="alert ok">{notice}</div>}

      <form className="card form-stack" onSubmit={onSubmit}>
        <h2>Cambiar contraseña</h2>
        {/* Lets the browser's password manager know which account to update. */}
        <input type="email" autoComplete="username" value={user.email} readOnly hidden />
        <label>
          Contraseña actual
          <input name="currentPassword" type="password" required autoComplete="current-password" />
        </label>
        <label>
          Contraseña nueva
          <input name="newPassword" type="password" required minLength={8} maxLength={200} autoComplete="new-password" />
          <span className="hint">Al menos 8 caracteres.</span>
        </label>
        <label>
          Repite la contraseña nueva
          <input name="confirmPassword" type="password" required autoComplete="new-password" />
        </label>
        {mismatch && <div className="alert error">Las dos contraseñas nuevas no coinciden.</div>}
        {change.error && <div className="alert error">{change.error.message}</div>}
        <button type="submit" disabled={change.isPending}>
          {change.isPending ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </section>
  )
}
