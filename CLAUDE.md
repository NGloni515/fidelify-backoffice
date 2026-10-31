# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repo.

## Qué es esto

**Panel del negocio en Fidelify.** Lo usan el dueño y las cajeras de una
heladería o cafetería: la caja con escáner de QR, sus clientes, el diseño de su
tarjeta, cupones, mensajes y equipo.

**No es un panel interno de Fidelify.** Sus usuarios son personal de un negocio
cliente, no técnicos, y la pantalla de caja se usa desde un celular o una tablet
sobre el mostrador, con clientes esperando.

Hoy funcionan el **inicio de sesión**, la **caja**, **Inicio**, **Clientes** y
**Equipo** (los tres solo del dueño) y **Mi cuenta**. Las demás secciones son
marcadores.

## La lógica de negocio vive en el backend

**Este panel captura y muestra; el backend calcula y valida.**

- Nunca recalcular acá un número que la API ya produce. Sellos, premios
  disponibles, si se ganó un premio: se leen de la respuesta y se muestran tal
  cual. Lo único que se deriva es presentación.
- Nunca persistir un valor calculado en el cliente. Las mutaciones mandan
  **insumos** (cuántos sellos dar), no resultados (el saldo nuevo).
- Las reglas que deciden si algo se puede hacer las hace cumplir el backend. El
  panel puede deshabilitar un botón para dar feedback, no para autorizar.
- Lo que configura el negocio (cuántos sellos, cuál es el premio) sale de la
  API. Una copia clavada acá se queda vieja en silencio.

Detalle en [`agent/coding-standards.md`](agent/coding-standards.md).

## Design system

Antes de escribir UI se leen **dos** archivos: [`design-system.md`](design-system.md)
de este repo y el general, en la carpeta que agrupa los repos
(`../design-system.md`).

Este panel lleva la marca de **Fidelify**. La página pública
(`fidelify-web`) lleva la del negocio: no se copian estilos de una a la otra.

## Archivos de contexto

- @agent/project-overview.md
- @agent/coding-standards.md
- @agent/ai-interaction.md

Detalle por módulo, en `agent/features/`: `modulo_sesion.md`,
`modulo_caja.md`, `modulo_inicio.md`, `modulo_clientes.md` y
`modulo_equipo.md`. El contrato de los endpoints está del lado del backend, en
`../fidelify-backend/agent/features/` (`modulo_auth.md`, `modulo_sellos.md`,
`modulo_inicio.md`, `modulo_clientes.md` y `modulo_equipo.md`).

## Comandos

```bash
npm run dev        # servidor de desarrollo (puerto 5173)
npm run build      # tsc -b && vite build
npm run preview    # sirve el build
npm run lint       # oxlint
npm test           # Vitest, solo lógica pura
```

## Verificación

```bash
npm run build
npm run lint
npm test
```

## Probar de verdad

La caja mueve sellos de clientes reales: que compile no dice nada sobre si el
sello se sumó.

```bash
npm --prefix ../fidelify-backend run db:up
npm --prefix ../fidelify-backend run db:migrate
npm --prefix ../fidelify-backend run db:seed
npm --prefix ../fidelify-backend run start:dev   # :3000
npm run dev                                      # :5173
```

Para entrar: el seed del backend crea una dueña y una cajera; sus correos y su
contraseña están en `../fidelify-backend/.env.example`.

Para tener una tarjeta que escanear: inscribirse en
`http://localhost:5174/join/heladeria-demo` (`fidelify-web`) y usar el código
`FL-…` que aparece al final.

Dos cosas que confunden:

- En desarrollo no hace falta `VITE_API_URL`: Vite reenvía `/api` a
  `localhost:3000` (`vite.config.ts`), y por eso el CORS no interviene. Con
  `VITE_API_URL` definida el navegador llama directo al backend, y entonces el
  origen del panel tiene que estar en su `CORS_ORIGINS`.
- **La cámara solo abre en un contexto seguro**: `localhost` o HTTPS. Entrar
  desde una tablet por `http://192.168.x.x:5173` deja el escáner sin cámara; ahí
  se prueba escribiendo el código a mano.

## Arquitectura

| Pieza | Qué |
|---|---|
| Build | Vite 8, salida estática. Sin SSR |
| UI | React 19. **Sin librería de componentes**: CSS propio en `src/index.css` |
| Rutas | React Router 8, declaradas a mano en `src/main.tsx` |
| Datos | TanStack Query 5 |
| HTTP | `fetch` + envoltorio en `src/api/http.ts` y `src/api/client.ts`. Sin axios |
| Sesión | access token en memoria, refresh en cookie `HttpOnly` (`src/auth/session.ts`) |
| Escáner | `html5-qrcode`, cargado solo al entrar a `/caja` |
| Lint | oxlint. Sin Prettier ni ESLint |
| Estado global | ninguno |

```
worker/index.ts     proxy de /api al backend; solo corre en Cloudflare
wrangler.jsonc      despliegue en Cloudflare Workers
src/main.tsx        rutas, loaders de sesión y proveedores
src/api/http.ts     request() y ApiError
src/api/client.ts   api() con sesión, tipos de las respuestas y un objeto por recurso
src/auth/session.ts la sesión, fuera de React
src/layout/         AppLayout: barra lateral + contenido
src/pages/          una página por sección
src/components/     lo que comparten dos páginas o más
src/format.ts       fechas en es-EC y textos derivados de datos
src/index.css       tokens y estilos
```

## Sesión

Access token (~15 min) en **memoria**; refresh (~30 días) en cookie
**`HttpOnly`**. Recargar la página pierde el access a propósito y
`restoreSession()` lo recupera con la cookie. Detalle en
`agent/features/modulo_sesion.md`.

Tres cosas que hay que saber antes de tocar `src/api/` o `src/auth/`:

- `credentials: 'include'` va en **todas** las peticiones. Sin eso el navegador
  descarta la cookie en origen cruzado y la sesión no sobrevive una recarga.
- `fetch` **no lanza** en 4xx/5xx. Un 500 no entra al `catch` si no se revisa
  `res.ok`.
- **La cookie exige que el panel y la API estén en el mismo sitio.** En
  desarrollo lo resuelve el proxy de Vite; en producción, el Worker de
  `worker/index.ts` (ver *Despliegue*). Si el panel llamara directo a un backend
  en otro dominio, la sesión se perdería en cada recarga.

**No hay tabla de sesiones**: el backend revalida al usuario en cada petición.
Desactivar a alguien lo corta en la siguiente. La contracara es que **cerrar
sesión solo cierra ese navegador**.

## Variables de entorno

`VITE_API_URL` — URL del backend en producción. Vacía en desarrollo. Ver
`.env.example`. Vite la incrusta **al compilar**: cambiarla exige un build nuevo.

## Despliegue

Corre en **Cloudflare Workers**, con assets estáticos, conectado al repo: cada
push a `main` corre `npm run build` y después `npx wrangler deploy`, que lee
[`wrangler.jsonc`](wrangler.jsonc). Hoy en
`https://fidelify-backoffice.angelonisrael.workers.dev`.

- **El panel nunca llama directo al backend.** `worker/index.ts` atiende solo
  `/api/*` (`run_worker_first`) y lo reenvía al backend, de modo que para el
  navegador el panel y la API son el mismo origen. Es lo que permite que la
  cookie de sesión (`SameSite=Lax`) viaje aunque el panel esté en
  `*.workers.dev` y el backend en otro dominio. Por eso tampoco hace falta CORS.
- Todo lo demás lo sirve Cloudflare desde `dist/`, sin pasar por el Worker, y
  una ruta que no es un archivo devuelve `index.html`
  (`not_found_handling: "single-page-application"`): recargar en `/caja`
  funciona.
- El destino del proxy es **`API_ORIGIN`**, en `vars` de `wrangler.jsonc` (sin
  `/api` al final). Está en el repo y no en el panel de Cloudflare porque
  `wrangler deploy` reemplaza en cada despliegue las variables que no estén en
  el archivo.
- **`VITE_API_URL` se deja vacía**: el panel llama a `/api` en su propio origen,
  igual que en desarrollo.
- **Cada rama que no es `main` sube una Preview** (`npx wrangler preview`), con
  su propia URL. Una Preview **no hereda `vars`**: lee las suyas de `previews`
  en `wrangler.jsonc`, y sin ese bloque el build falla. Como no hay backend de
  pruebas, apuntan al de producción: una Preview entra con cuentas reales y
  mueve datos reales, con el código de un PR sin mergear. Y una pantalla que
  necesita una ruta nueva del backend da 404 en la Preview hasta que esa ruta
  esté desplegada.
- El Worker no pasa por `tsc -b` ni por Vite: lo compila `wrangler`. Se prueba
  en local con el runtime real, apuntando al backend local:

  ```bash
  npm run build
  npx wrangler dev --port 8788 --var API_ORIGIN:http://localhost:3000
  ```

- **Backend primero, siempre.** Usa `ValidationPipe` con
  `forbidNonWhitelisted: true`: cualquier campo que el DTO no declare se rechaza
  con 400 (`"property X should not exist"`). Un campo nuevo en un body requiere
  el DTO desplegado antes.

## Convención de PRs

- Rama nueva desde **`origin/main`**: `feat/<algo>` o `fix/<algo>`.
- Cuerpo con **¿Qué?** y **¿Por qué?** (+ Verificación).
