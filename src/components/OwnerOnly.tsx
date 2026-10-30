import type { ReactNode } from 'react'
import { useCurrentUser } from '../auth/session'

// Cosmetic: the backend answers 403 to a cashier on these routes anyway.
export function OwnerOnly({ title, children }: { title: string; children: ReactNode }) {
  if (useCurrentUser()?.role === 'OWNER') return children
  return (
    <section>
      <h1>{title}</h1>
      <p className="muted">Esta sección es solo para el dueño del negocio.</p>
    </section>
  )
}
