# Módulo Sesión

Entrar al panel, seguir adentro y salir.

Contraparte de `fidelify-backend/agent/features/modulo_auth.md`, que tiene el
**contrato completo de los endpoints** y las reglas de los tokens. Este
documento describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/auth/session.ts` | La sesión, fuera de React: token, usuario, entrar, renovar, salir |
| `src/api/http.ts` | `request()`: el `fetch` base, y `ApiError` |
| `src/api/client.ts` | `api()`: `request()` con el token y un reintento tras renovar |
| `src/pages/LoginPage.tsx` | Formulario de acceso |
| `src/layout/AppLayout.tsx` | Muestra negocio y usuario; "Cerrar sesión" |
| `src/main.tsx` | Los dos `loader` que protegen las rutas |

---

## Dónde vive la sesión

| Qué | Dónde |
|---|---|
| Access token (~15 min) | una variable de módulo en `session.ts`. **Nunca** en `localStorage` |
| Refresh token (~30 días) | cookie `HttpOnly`. JavaScript no la ve |
| Usuario (`StaffUser`) | la misma variable de módulo, expuesta con `useCurrentUser()` |

La sesión vive **fuera del árbol de React** porque los `loader` del router
corren ahí y no pueden usar hooks. `useCurrentUser()` la envuelve con
`useSyncExternalStore` para los componentes. Una fuente de verdad, dos
consumidores.

---

## Flujos

### Entrar

`login()` hace `POST /auth/login`, guarda token y usuario, y `LoginPage` navega:
a `/caja` si es `CASHIER`, a `/` si es `OWNER`.

Si falla se muestra el mensaje del backend. No se distingue correo desconocido
de contraseña incorrecta: el backend responde lo mismo a propósito.

### Recargar la página

Recargar pierde el access token, y es lo esperado. El `loader` de las rutas
protegidas llama a `restoreSession()`, que pide uno nuevo con la cookie
(`POST /auth/refresh`). Mientras tanto se ve "Cargando…".

Se intenta **una vez por carga de página**. Si no hay sesión, `redirect` a
`/login`.

### El token vence a mitad del turno

`api()` recibe un 401, llama a `renewSession()` y **repite la petición una
vez**. Quien atiende no ve nada: el sello que tocó se da igual.

Las peticiones simultáneas que reciban 401 comparten la misma renovación (la
promesa `renewing`), para no disparar cinco a la vez.

### La sesión se pierde

Si la renovación responde 401 —la cookie venció o el usuario fue desactivado—
la sesión se borra. `AppLayout` deja de tener usuario y manda a `/login`.

Si la renovación falla **por la red**, la sesión **no** se borra: la petición
original falla con su error y la cajera puede reintentar. Una mala señal no la
saca del panel.

### Salir

"Cerrar sesión" hace `POST /auth/logout` (borra la cookie), limpia la sesión y
**vacía la caché de TanStack Query**: los datos del último cliente atendido no
pueden quedar para quien use la tablet después.

---

## Rutas

| Ruta | `loader` | Si hay sesión | Si no hay |
|---|---|---|---|
| `/login` | `redirectIfSignedIn` | va a `/caja` o a `/` | muestra el formulario |
| `/` y todas sus hijas | `requireSession` | muestra la sección | va a `/login` |

---

## Reglas

- **Toda petición lleva `credentials: 'include'`** (`request()`). Sin eso el
  navegador no manda la cookie cuando el panel y la API están en orígenes
  distintos, y la sesión no sobrevive una recarga.
- **En producción el panel le habla a la API por su propio origen.**
  `worker/index.ts` reenvía `/api/*` al backend desde Cloudflare Workers. La cookie es `SameSite=Lax` y no viaja entre sitios distintos: sin ese
  proxy, entrar funciona y recargar la página saca al usuario.
- **El token no se guarda en el navegador.** Ni `localStorage` ni
  `sessionStorage`: un script inyectado se lo llevaría.
- **`session.ts` no importa `api()`**, usa `request()`. Al revés sí: `api()`
  importa la sesión. Invertirlo crea un ciclo entre los dos módulos.
- **Ocultar algo según el rol es cosmética.** La regla la hace cumplir el
  backend. Hoy se les ocultan a las cajeras Inicio, Clientes y Equipo, y
  `OwnerOnly` les cubre esas rutas si las abren a mano.

---

## Contraseña

Cada uno cambia la suya en **Mi cuenta** (`/cuenta`), y el dueño le pone una
nueva a una cajera desde **Equipo**. Detalle en
[`modulo_equipo`](modulo_equipo.md).

Tras 5 intentos fallidos con un correo, el backend lo bloquea 15 minutos y el
login muestra su mensaje ("Demasiados intentos. Vuelve a intentar en 15
minutos."). La tablet de la caja no lo nota: su sesión dura 30 días y no vuelve
a pedir la contraseña.

---

## Sin resolver

- **No hay "olvidé mi contraseña"** en el login.
- **Tras entrar siempre se va al inicio de su rol**, no a la página que se
  intentó abrir antes del login.
