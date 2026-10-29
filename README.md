# fidelify-backoffice

Panel de **Fidelify** para el negocio: caja con escáner QR, clientes, diseño de la tarjeta, cupones, mensajes y equipo.

Stack: React 19 · Vite · TypeScript · React Router · TanStack Query.

## Arranque local

```bash
npm install
npm run dev    # http://localhost:5173
```

El backend (`fidelify-backend`) debe estar corriendo en `http://localhost:3000`; Vite reenvía `/api` hacia él.
Para entrar, usa la dueña o la cajera que crea el seed del backend (correos y contraseña en su `.env.example`).
En producción corre en Cloudflare Pages (build `npm run build`, salida `dist`) y habla con el backend a través de `functions/api/`; el destino va en la variable `API_ORIGIN` del proyecto. `VITE_API_URL` se deja vacía.

## Documentación

| Qué | Dónde |
| --- | --- |
| Guía para agentes | [`CLAUDE.md`](CLAUDE.md) |
| Contexto y arquitectura | [`agent/project-overview.md`](agent/project-overview.md) |
| Estándares de código | [`agent/coding-standards.md`](agent/coding-standards.md) |
| Flujo de trabajo | [`agent/ai-interaction.md`](agent/ai-interaction.md) |
| Sesión | [`agent/features/modulo_sesion.md`](agent/features/modulo_sesion.md) |
| Caja | [`agent/features/modulo_caja.md`](agent/features/modulo_caja.md) |
| Estilos | [`design-system.md`](design-system.md) |

El contrato de los endpoints está del lado del backend, en
`../fidelify-backend/agent/features/modulo_auth.md` y `modulo_sellos.md`.

## Estado

| Sección | Estado |
| --- | --- |
| Inicio de sesión (dueño y cajeros) | Funcional contra la API |
| Caja (escanear, dar sello, canjear premio) | Funcional contra la API |
| Inicio, Clientes, Mi tarjeta, Cupones, Mensajes, Equipo | Estructura lista, por construir |
