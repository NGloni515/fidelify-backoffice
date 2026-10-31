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
| **`fidelify-backoffice`** (este) | **dueño y cajeras del negocio** | **`StaffUser`** |

No existe un panel interno de Fidelify. Dar de alta un negocio se hace desde el
backend, por seed.

---

## Roles

Dos, definidos en el backend (`StaffRole`):

| Rol | Quién |
|---|---|
| `OWNER` | el dueño |
| `CASHIER` | quien atiende la caja |

El rol llega con la sesión (`user.role`) y decide dos cosas: a dónde se va
tras entrar (la cajera a `/caja`, el dueño a `/`) y si se ven **Inicio**,
**Clientes** y **Equipo**, que son solo del dueño. Ocultarlos es cosmética: la
regla la hace cumplir el backend, que le responde 403 a una cajera. Las demás
secciones todavía no distinguen roles.

---

## Sesión

- **Access token (~15 min)** en **memoria**. Nunca toca `localStorage`.
- **Refresh (~30 días)** en cookie **`HttpOnly`**, invisible a JavaScript.

El panel solo ve datos del negocio de quien inició sesión: ese negocio lo decide
el backend a partir de la sesión, nunca un campo que mande el panel.

Detalle en [`modulo_sesion`](features/modulo_sesion.md).

---

## Mapa de rutas (`src/main.tsx`)

| Ruta | Sección | Estado | Qué va ahí |
|---|---|---|---|
| `/login` | — | **funcional** | Formulario de acceso. Pública |
| `/` | Inicio | **funcional**, solo dueño | Clientes, sellos y canjes de hoy y del periodo, premios por canjear, quiénes vienen más y quiénes dejaron de venir |
| `/caja` | Caja | **funcional** | Escanear la tarjeta, dar sello, canjear premio |
| `/clientes` | Clientes | **funcional**, solo dueño | Lista y búsqueda de clientes |
| `/clientes/:id` | Clientes | **funcional**, solo dueño | Ficha: datos, tarjeta, historial y ajuste manual de sellos |
| `/tarjeta` | Mi tarjeta | marcador | Logo, colores, cuántos sellos se necesitan y cuál es el premio. Incluye el QR de inscripción |
| `/cupones` | Cupones | marcador | Cupones con fecha de vencimiento y límite de usos |
| `/mensajes` | Mensajes | marcador | Enviar una notificación al celular de todos los clientes o de un grupo |
| `/equipo` | Equipo | **funcional**, solo dueño | El equipo; agregar, desactivar y cambiar la contraseña de las cajeras |
| `/cuenta` | Mi cuenta | **funcional** | Cambiar la contraseña propia |

Todas menos `/login` cuelgan de `AppLayout` (barra lateral + contenido) y
**exigen sesión**: el `loader` de la ruta padre manda a `/login` a quien no la
tenga. Los marcadores usan el componente `Placeholder`, que dice qué va a haber
en la sección.

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
| HTTP | **`fetch` nativo** + envoltorio en `src/api/http.ts` y `src/api/client.ts`. Sin axios |
| Sesión | store de módulo en `src/auth/session.ts`, leído con `useSyncExternalStore` |
| Escáner | `html5-qrcode` |
| Lint | oxlint |

En desarrollo, Vite reenvía `/api` a `http://localhost:3000`. En producción el
panel llama a `VITE_API_URL`.

---

## Documentación relacionada

- Sesión: [`modulo_sesion`](features/modulo_sesion.md)
- Caja: [`modulo_caja`](features/modulo_caja.md)
- Inicio: [`modulo_inicio`](features/modulo_inicio.md)
- Clientes: [`modulo_clientes`](features/modulo_clientes.md)
- Equipo y Mi cuenta: [`modulo_equipo`](features/modulo_equipo.md)
- Backend: `fidelify-backend/agent/features/modulo_auth.md` (tokens y contrato
  de la sesión), `modulo_sellos.md` (reglas de sellos y contrato de la caja) y
  `modulo_equipo.md` (reglas y contrato de Equipo)
- Modelo de datos y vocabulario: `fidelify-backend/agent/project-overview.md`
- Design system: `design-system.md` de este repo + `../design-system.md` (general)
