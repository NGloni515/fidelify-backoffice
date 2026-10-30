import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router'
import { restoreSession } from './auth/session'
import './index.css'
import { AppLayout } from './layout/AppLayout'
import { AccountPage } from './pages/AccountPage'
import { LoginPage } from './pages/LoginPage'
import { Placeholder } from './pages/Placeholder'
import { TeamPage } from './pages/TeamPage'

async function requireSession() {
  if (!(await restoreSession())) throw redirect('/login')
  return null
}

async function redirectIfSignedIn() {
  const user = await restoreSession()
  if (user) throw redirect(user.role === 'CASHIER' ? '/caja' : '/')
  return null
}

const loading = <p className="loading">Cargando…</p>

const router = createBrowserRouter([
  { path: '/login', loader: redirectIfSignedIn, element: <LoginPage />, hydrateFallbackElement: loading },
  {
    path: '/',
    loader: requireSession,
    element: <AppLayout />,
    hydrateFallbackElement: loading,
    children: [
      {
        index: true,
        element: (
          <Placeholder
            title="Inicio"
            description="Clientes inscritos, sellos dados hoy, premios canjeados y clientes que dejaron de venir."
          />
        ),
      },
      {
        path: 'caja',
        // Lazy: the QR reader outweighs the rest of the panel and only this page uses it.
        lazy: async () => ({ Component: (await import('./pages/CashierPage')).CashierPage }),
      },
      {
        path: 'clientes',
        element: (
          <Placeholder title="Clientes" description="Lista de clientes, historial de visitas y ajuste manual de sellos." />
        ),
      },
      {
        path: 'tarjeta',
        element: (
          <Placeholder
            title="Mi tarjeta"
            description="Logo, colores, cuántos sellos se necesitan y cuál es el premio. Incluye el QR de inscripción."
          />
        ),
      },
      {
        path: 'cupones',
        element: <Placeholder title="Cupones" description="Cupones con fecha de vencimiento y límite de usos." />,
      },
      {
        path: 'mensajes',
        element: (
          <Placeholder title="Mensajes" description="Enviar una notificación al celular de todos los clientes o de un grupo." />
        ),
      },
      { path: 'equipo', element: <TeamPage /> },
      { path: 'cuenta', element: <AccountPage /> },
    ],
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
