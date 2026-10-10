import { useQueryClient } from '@tanstack/react-query'
import { Navigate, NavLink, Outlet } from 'react-router'
import { logout, useCurrentUser } from '../auth/session'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/caja', label: 'Caja' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/tarjeta', label: 'Mi tarjeta' },
  { to: '/cupones', label: 'Cupones' },
  { to: '/mensajes', label: 'Mensajes' },
  { to: '/equipo', label: 'Equipo' },
]

export function AppLayout() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()

  if (!user) return <Navigate to="/login" replace />

  async function onLogout() {
    await logout()
    // Cached customer data must not survive into the next person's session.
    queryClient.clear()
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>●</span> Fidelify
        </div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <strong>{user.business.name}</strong>
          <span className="muted">{user.name}</span>
          <button className="secondary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
