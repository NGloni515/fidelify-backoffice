# Fidelify — Panel del negocio (Vite + React)

> Panel de un **negocio cliente** de Fidelify. Las reglas de negocio son
> **autoritativas del backend** (`fidelify-backend`, NestJS); esta app solo
> presenta y dispara acciones. Para el detalle técnico por módulo, ver
> `agent/features/`.

---

## Qué es esta app

Fidelify son tarjetas de sellos y cupones que viven en la billetera del celular.
Este panel es donde **el negocio** —una heladería, una cafetería— opera su
programa: da sellos en la caja, ve a sus clientes, diseña su tarjeta, crea
cupones y manda mensajes.

Quien lo usa no es técnico y no está sentado frente a un escritorio:

- **La cajera**, en la caja, con un celular o una tablet del local y una fila de
  clientes. Cada toque de más entre escanear y dar el sello es fila que crece.
- **El dueño**, desde su celular o su computadora, para ver cómo va el programa.

---

## El sistema más amplio

| Repo | Para quién | Identidad |
|---|---|---|
| `fidelify-backend` | todos | — |
| `fidelify-web` | el cliente final, anónimo | ninguna: el `slug` del negocio en la URL |
| **`fidelify-backoffice`** (este) | **dueño y cajeras del negocio** | **`StaffUser`** — todavía sin login |

No existe un panel interno de Fidelify. Dar de alta un negocio se hace desde el
backend, por seed.

---

## Roles

Dos, definidos en el backend (`StaffRole`):

| Rol | Quién |
|---|---|
| `OWNER` | el dueño |
| `CASHIER` | quien atiende la caja |

**Hoy no se aplican**: sin login, el panel no sabe quién lo está usando ni de
qué negocio es. Cuando exista, ocultar una sección a una cajera será cosmética;
la regla la hace cumplir el backend.

---

## Mapa de rutas (`src/main.tsx`)

| Ruta | Sección | Estado | Qué va ahí |
|---|---|---|---|
| `/` | Inicio | marcador | Clientes inscritos, sellos dados hoy, premios canjeados y clientes que dejaron de venir |
| `/caja` | Caja | **funcional** | Escanear la tarjeta, dar sello, canjear premio |
| `/clientes` | Clientes | marcador | Lista de clientes, historial de visitas y ajuste manual de sellos |
| `/tarjeta` | Mi tarjeta | marcador | Logo, colores, cuántos sellos se necesitan y cuál es el premio. Incluye el QR de inscripción |
| `/cupones` | Cupones | marcador | Cupones con fecha de vencimiento y límite de usos |
| `/mensajes` | Mensajes | marcador | Enviar una notificación al celular de todos los clientes o de un grupo |
| `/equipo` | Equipo | marcador | Dueño y cajeros con sus permisos |

Todas cuelgan de `AppLayout` (barra lateral + contenido). Los marcadores usan
el componente `Placeholder`, que dice qué va a haber en la sección.

`/caja` se carga con `lazy`: el lector de QR pesa más que el resto del panel
junto y solo se usa ahí.

---

## Arquitectura técnica

| Pieza | Qué |
|---|---|
| Build | Vite 8, salida estática. Sin SSR |
| UI | React 19, CSS propio con variables en `src/index.css`. Sin librería de componentes |
| Rutas | React Router 8 (`createBrowserRouter`), declaradas en código, no por archivos |
| Datos | TanStack Query 5 |
| HTTP | **`fetch` nativo** + envoltorio en `src/api/client.ts`. Sin axios |
| Escáner | `html5-qrcode` |
| Lint | oxlint |

En desarrollo, Vite reenvía `/api` a `http://localhost:3000`. En producción el
panel llama a `VITE_API_URL`.

---

## Documentación relacionada

- Caja: [`modulo_caja`](features/modulo_caja.md)
- Backend de la caja: `fidelify-backend/agent/features/modulo_sellos.md`
  (reglas de sellos y contrato de los endpoints)
- Modelo de datos y vocabulario: `fidelify-backend/agent/project-overview.md`
- Design system: `design-system.md` de este repo + `../design-system.md` (general)
