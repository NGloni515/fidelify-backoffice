import { NavLink, Outlet } from 'react-router'

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
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
