import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { staffApi, type TeamMember } from '../api/client'
import { useCurrentUser } from '../auth/session'

const ROLE_LABEL = { OWNER: 'Dueño', CASHIER: 'Cajera' } as const

export function TeamPage() {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)
  const team = useQuery({ queryKey: ['staff'], queryFn: staffApi.list })

  const create = useMutation({
    mutationFn: staffApi.create,
    onSuccess: (member) => {
      setNotice(`${member.name} ya puede entrar con su correo y la contraseña que le pusiste.`)
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    setNotice(null)
    create.mutate(
      {
        name: String(form.get('name')).trim(),
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      },
      { onSuccess: () => formElement.reset() },
    )
  }

  return (
    <section>
      <h1>Equipo</h1>
      <p className="muted">Quién atiende en tu negocio. Cada cajera entra al panel con su correo y su contraseña.</p>

      {notice && <div className="alert ok">{notice}</div>}

      <div className="card">
        <h2>Tu equipo</h2>
        {team.isPending && <p className="muted">Cargando…</p>}
        {team.error && <div className="alert error">{team.error.message}</div>}
        {team.data && (
          <ul className="list">
            {team.data.map((member) => (
              <MemberRow key={member.id} member={member} onNotice={setNotice} />
            ))}
          </ul>
        )}
      </div>

      <form className="card form-stack" onSubmit={onCreate}>
        <h2>Agregar cajera</h2>
        <label>
          Nombre
          <input name="name" required minLength={2} maxLength={80} autoComplete="off" />
        </label>
        <label>
          Correo
          <input name="email" type="email" required autoComplete="off" />
        </label>
        <label>
          Contraseña
          <input name="password" required minLength={8} maxLength={200} autoComplete="off" spellCheck={false} />
          <span className="hint">Al menos 8 caracteres. Díselo en persona; después la puede cambiar en Mi cuenta.</span>
        </label>
        {create.error && <div className="alert error">{create.error.message}</div>}
        <button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Agregando…' : 'Agregar cajera'}
        </button>
      </form>
    </section>
  )
}

function MemberRow({ member, onNotice }: { member: TeamMember; onNotice: (notice: string | null) => void }) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const [settingPassword, setSettingPassword] = useState(false)

  const update = useMutation({
    mutationFn: (changes: { active?: boolean; password?: string }) => staffApi.update(member.id, changes),
    onSuccess: (updated, changes) => {
      if (changes.password !== undefined) {
        setSettingPassword(false)
        onNotice(`Listo. ${updated.name} ya puede entrar con la contraseña nueva.`)
      } else {
        onNotice(updated.active ? `${updated.name} puede volver a entrar.` : `${updated.name} ya no puede entrar al panel.`)
      }
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })

  function onToggleActive() {
    onNotice(null)
    if (
      member.active &&
      !window.confirm(`¿Desactivar a ${member.name}? Se le cierra la sesión y no podrá entrar hasta que la reactives.`)
    )
      return
    update.mutate({ active: !member.active })
  }

  function onSetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onNotice(null)
    update.mutate({ password: String(new FormData(e.currentTarget).get('password')) })
  }

  return (
    <li className={member.active ? 'list-item' : 'list-item inactive'}>
      <div className="item-info">
        <strong>
          {member.name}
          {member.id === currentUser?.id && ' (tú)'}
        </strong>
        <span className="muted">{member.email}</span>
        <span className="tags">
          <span className="tag">{ROLE_LABEL[member.role]}</span>
          {!member.active && <span className="tag">Desactivada</span>}
        </span>
      </div>

      {member.role === 'CASHIER' && !settingPassword && (
        <div className="row">
          <button className="secondary" disabled={update.isPending} onClick={onToggleActive}>
            {member.active ? 'Desactivar' : 'Reactivar'}
          </button>
          <button
            className="secondary"
            disabled={update.isPending}
            onClick={() => {
              update.reset()
              setSettingPassword(true)
            }}
          >
            Cambiar contraseña
          </button>
        </div>
      )}

      {settingPassword && (
        <form className="form-stack" onSubmit={onSetPassword}>
          <label>
            Contraseña nueva para {member.name}
            <input name="password" required minLength={8} maxLength={200} autoComplete="off" spellCheck={false} autoFocus />
          </label>
          <div className="row">
            <button type="submit" className="secondary" disabled={update.isPending}>
              {update.isPending ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="secondary" disabled={update.isPending} onClick={() => setSettingPassword(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {update.error && <div className="alert error">{update.error.message}</div>}
    </li>
  )
}
