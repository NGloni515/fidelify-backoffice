# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repo.

## Qué es esto

**Panel del negocio en Fidelify.** Lo usan el dueño y las cajeras de una
heladería o cafetería: la caja con escáner de QR, sus clientes, el diseño de su
tarjeta, cupones, mensajes y equipo.

**No es un panel interno de Fidelify.** Sus usuarios son personal de un negocio
cliente, no técnicos, y la pantalla de caja se usa desde un celular o una tablet
sobre el mostrador, con clientes esperando.

Hoy solo la **caja** es funcional. Las demás secciones son marcadores, y no hay
inicio de sesión.

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

Detalle de la caja: `agent/features/modulo_caja.md`. El contrato de los
endpoints está del lado del backend, en
`../fidelify-backend/agent/features/modulo_sellos.md`.

## Comandos

```bash
npm run dev        # servidor de desarrollo (puerto 5173)
npm run build      # tsc -b && vite build
npm run preview    # sirve el build
npm run lint       # oxlint
```

No hay tests ni runner de tests instalado.

## Verificación

```bash
npm run build
npm run lint
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
| HTTP | `fetch` + envoltorio en `src/api/client.ts`. Sin axios |
| Escáner | `html5-qrcode`, cargado solo al entrar a `/caja` |
| Lint | oxlint. Sin Prettier ni ESLint |
| Estado global | ninguno |

```
src/main.tsx        rutas y proveedores
src/api/client.ts   api(), ApiError, tipos de las respuestas, passesApi
src/layout/         AppLayout: barra lateral + contenido
src/pages/          una página por sección
src/index.css       tokens y estilos
```

## Sesión

**No existe.** No hay login, ni token, ni rutas protegidas, y `api()` no manda
credenciales. Todo lo que se construya hoy es visible para cualquiera que abra
la URL. Depende de la autenticación de `StaffUser` en el backend.

## Variables de entorno

`VITE_API_URL` — URL del backend en producción. Vacía en desarrollo. Ver
`.env.example`. Vite la incrusta **al compilar**: cambiarla exige un build nuevo.

## Despliegue

- Es una SPA con rutas del lado del cliente: el hosting tiene que devolver
  `index.html` para cualquier ruta, o recargar en `/caja` da 404.
- El origen donde quede publicado va en `CORS_ORIGINS` del backend.
- **Backend primero, siempre.** Usa `ValidationPipe` con
  `forbidNonWhitelisted: true`: cualquier campo que el DTO no declare se rechaza
  con 400 (`"property X should not exist"`). Un campo nuevo en un body requiere
  el DTO desplegado antes.

## Convención de PRs

- Rama nueva desde **`origin/main`**: `feat/<algo>` o `fix/<algo>`.
- Cuerpo con **¿Qué?** y **¿Por qué?** (+ Verificación).
