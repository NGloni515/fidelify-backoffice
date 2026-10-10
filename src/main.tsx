import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AppLayout } from './layout/AppLayout'
import { Placeholder } from './pages/Placeholder'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
        // Carga diferida: el lector de QR pesa bastante y solo se usa en caja.
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
      {
        path: 'equipo',
        element: <Placeholder title="Equipo" description="Dueño y cajeros con sus permisos." />,
      },
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
