# AI Interaction Guidelines

## Comunicación

- Conciso y directo. Explicar lo no obvio, no lo evidente.
- Preguntar antes de refactors grandes o cambios de arquitectura.
- No agregar features que nadie pidió. Las secciones marcadas "Próximamente" no
  son una invitación a construirlas.
- Nunca borrar archivos sin confirmar.

## Flujo por cambio

1. **Rama** desde `origin/main`: `feat/<algo>` o `fix/<algo>`.
2. **Implementar**.
3. **Verificar**: `npm run build`, `npm run lint`, `npm test`.
4. **Probar en el navegador de verdad.** No basta con que compile — ver abajo.
5. **Commit** solo cuando todo lo anterior pasa, y solo con permiso.
6. **PR** con las secciones **¿Qué?** y **¿Por qué?**.

## Commits

- Mensajes convencionales (`feat:`, `fix:`, `chore:`, `docs:`).
- Uno por cambio lógico.
- **Preguntar antes de commitear.** No auto-commitear.

## Verificar de verdad

La caja suma sellos a clientes reales, y una pantalla que anuncia "Sello
agregado" sobre una petición que falló **compila perfectamente**.

Con el backend en `localhost:3000` (base arriba y seed cargado) y el panel en
`localhost:5173`:

- Abrir `/caja` sin sesión: tiene que mandar a `/login`.
- Entrar con la cajera del seed (`../fidelify-backend/.env.example`), y
  **recargar la página**: la sesión tiene que sobrevivir sola.
- Cerrar sesión, y abrir `/caja` de nuevo: tiene que expulsar.
- Buscar una tarjeta por su código, escrito en minúsculas: tiene que
  encontrarla igual.
- Dar un sello: el círculo nuevo aparece **después** de la respuesta, no antes.
- Completar la tarjeta: aparece el aviso de premio y los sellos vuelven a cero.
- Canjear: el botón queda deshabilitado cuando no hay premios.
- Un código que no existe: se lee "Tarjeta no encontrada", que es el mensaje
  del backend.
- **Con el backend apagado**: dar un sello tiene que mostrar un error, nunca el
  aviso de éxito.
- Achicar la ventana a ancho de celular: la caja se usa ahí.

El escáner con cámara solo funciona en `localhost` o por HTTPS.

## Orden de despliegue

**Backend primero, siempre.** Usa `ValidationPipe` con
`forbidNonWhitelisted: true`: cualquier campo que el DTO no declare se rechaza
con 400 (`"property X should not exist"`). Un campo nuevo en un body requiere
que el DTO esté desplegado antes.

## Cuando algo no sale

- Si tras 2-3 intentos no funciona, parar y explicar el problema.
- No probar arreglos al azar.
- **El stack es muy reciente** (React 19, React Router 8, Vite 8,
  TypeScript 6): lo que se recuerda de versiones anteriores puede ya no ser
  cierto. Se consulta la documentación actual antes de escribir contra estas
  APIs, y si algo no se puede verificar ahí, no se improvisa.
