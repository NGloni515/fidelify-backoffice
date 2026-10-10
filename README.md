# fidelify-backoffice

Panel de **Fidelify** para el negocio: caja con escáner QR, clientes, diseño de la tarjeta, cupones, mensajes y equipo.

Stack: React 19 · Vite · TypeScript · React Router · TanStack Query.

## Arranque local

```bash
npm install
npm run dev    # http://localhost:5173
```

El backend (`fidelify-backend`) debe estar corriendo en `http://localhost:3000`; Vite reenvía `/api` hacia él.
En producción, define `VITE_API_URL` con la URL del backend (ver `.env.example`).

## Estado

| Sección | Estado |
| --- | --- |
| Caja (escanear, dar sello, canjear premio) | Funcional contra la API |
| Inicio, Clientes, Mi tarjeta, Cupones, Mensajes, Equipo | Estructura lista, por construir |
| Inicio de sesión | Pendiente (depende de la autenticación del backend) |
