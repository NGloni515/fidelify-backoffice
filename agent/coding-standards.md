# Coding Standards

## TypeScript

- Modo estricto. `tsconfig.app.json` no lo declara: en TypeScript 6 `strict`
  viene activo por defecto. Sin `any` — el tipo real o `unknown`.
- **`erasableSyntaxOnly`** prohíbe las *parameter properties*
  (`constructor(readonly x: T) {}`) y los `enum`. Se asigna explícito en el
  cuerpo, como hace `ApiError`.
- **`verbatimModuleSyntax`**: lo que se importa solo como tipo lleva `type`
  (`import { useState, type FormEvent } from 'react'`).
- `noUnusedLocals` y `noUnusedParameters` están activos: lo que no se usa rompe
  el build.

## Estructura de carpetas

```
worker/
  index.ts      proxy de /api al backend (Cloudflare Workers)
src/
  main.tsx      rutas, loaders de sesión y proveedores
  api/          http.ts: request() y ApiError
                client.ts: api(), tipos de respuesta y un objeto por recurso
  auth/         session.ts: la sesión, fuera de React
  layout/       AppLayout
  pages/        una página por sección
  components/   lo que usan dos páginas o más (Stamps, OwnerOnly)
  format.ts     fechas en es-EC y textos derivados de datos, con su test
  index.css     tokens y estilos
```

- Las rutas se declaran **a mano** en `src/main.tsx`. Una sección nueva es una
  página en `pages/`, su entrada en el router **como hija de la ruta protegida**
  y su enlace en `AppLayout`.
- Una página que arrastra una dependencia pesada se registra con `lazy`, como
  `/caja`.

## React

- Componentes funcionales, sin clases.
- Un componente que solo usa una página vive en el archivo de esa página
  (`CustomerRow` en `CustomersPage.tsx`). Se extrae a `components/` cuando lo
  necesita una segunda, como `Stamps`.
- **Estado global: solo la sesión**, en un store de módulo de pocas líneas
  (`src/auth/session.ts`). Lo que viene del servidor es de TanStack Query; el
  estado de una pantalla es `useState`. No se agrega Zustand ni Redux mientras
  no aparezca más estado que compartan pantallas que no se conocen entre sí.

## Datos y HTTP

- Toda petición pasa por `api()` de `src/api/client.ts`. No se llama `fetch`
  suelto. `api()` agrega el token y, ante un 401, renueva la sesión y repite la
  petición una vez.
- La única excepción es `src/auth/session.ts`, que usa `request()` de
  `src/api/http.ts` directo: no puede depender de `api()` porque `api()` depende
  de la sesión.
- `request()` lleva `credentials: 'include'` **siempre**: sin eso el navegador
  descarta la cookie de sesión en peticiones de origen cruzado.
- `fetch` **no lanza** en 4xx/5xx — por eso `request()` revisa `res.ok` y tira
  `ApiError` con el `status`. Nunca asumir que un `await fetch` que no explotó
  salió bien.
- Los tipos de cada respuesta viven junto al cliente, en `src/api/client.ts`, y
  describen **solo los campos que el panel usa**.
- Los parámetros que van en una ruta pasan por `encodeURIComponent`.
- Los datos del servidor se leen con `useQuery`. Tras una mutación se
  **invalida** la query y se muestra lo que el servidor devuelva.
- **Nada de actualización optimista en sellos y canjes.** La pantalla refleja lo
  que el servidor confirmó: un sello que se pinta y después se revierte es un
  sello que la cajera ya le anunció al cliente.

## El backend hace las cuentas

- **Nunca recalcular en el navegador un número que ya produce la API.** Sellos,
  premios y totales se leen de la respuesta y se muestran tal cual.
- Lo único que se deriva del lado del cliente es presentación: formatear, y
  pintar valores que ya son finales (cuántos círculos van llenos).
- Nunca persistir un valor que calculó el cliente. Las mutaciones mandan
  **insumos**, no resultados.
- Lo que configura el negocio (sellos por premio, texto del premio) viene de la
  API. No se deja una copia clavada como respaldo: se queda vieja en silencio.

## Mutaciones

- `mutate` está bien cuando no se espera el resultado y el desenlace se maneja
  con `onSuccess` / `onError` o leyendo `mutation.error`. Es lo que hace la caja.
- Exponer `mutateAsync` cuando quien llama hace `await`. `mutate` no devuelve
  promesa ni lanza, así que un `try/catch` alrededor nunca se ejecuta y la
  pantalla anuncia éxito sobre una petición fallida.
- Mientras una mutación está pendiente, los botones que la disparan se
  deshabilitan. Un doble toque en la caja es un sello de más.

## Errores

- Se muestra el `message` que devuelve el backend, no uno inventado — así la
  cajera lee la razón real ("No hay premios disponibles para canjear").
- `api()` ya une los mensajes cuando el backend manda una lista (errores de
  validación).

## Estilos

- CSS propio en `src/index.css`, con variables. **Nunca un hex literal en un
  componente**: siempre la variable. Ver `design-system.md`.
- Los estilos van por clase (`className="card"`). `style` en línea solo para un
  valor que viene de datos.

## Naming

- Archivos de componente: `PascalCase.tsx`. Todo lo demás: `kebab-case.ts`.
- El código va en inglés; los textos que ve el usuario, en español.

## Tests

**Vitest**, solo para lógica pura: `npm test`. La lógica que más merece tests
—las reglas de sellos— vive en el backend y se prueba allá.

Un helper o un normalizador de respuesta lleva su `*.test.ts` al lado
(`src/format.test.ts`). Los valores esperados se calculan a mano, nunca se pegan
de una corrida. Las pantallas no tienen tests: se prueban en el navegador.

## Verificación

```bash
npm run build
npm run lint
npm test
```

## Comentarios

- **Los comentarios se escriben en inglés**, aunque la documentación esté en
  español.
- Escribir el **mínimo**. Por defecto, ninguno.
- Nunca describir *qué* hace el código ni narrar los pasos: el código ya lo dice.
- Comentar solo un **porqué** no obvio: una decisión, un workaround, una
  restricción externa, o algo fácil de romper sin darse cuenta.
- Preferir un nombre claro a un comentario. Ante la duda, no comentar.

## Deuda

Se paga por arrastre: el archivo que se toca por otra razón sale cumpliendo.

| Qué | Dónde |
|---|---|
| Comentarios en español y docstrings que narran | `src/` y `vite.config.ts` |

## Documentación de agente

- `agent/features/*.md` describen cómo funciona un módulo *hoy*: reglas, flujos,
  mapa de archivos. Nunca un changelog: nada de "antes de esto…", "se corrigió",
  ni referencias a un PR o a un bug pasado. Si una regla necesita justificarse,
  se explica la restricción, no su historia.
- Una regla que aplica a más de un módulo va en este archivo, no en el doc de
  una feature.
