# Módulo Equipo y Mi cuenta

Dos pantallas sobre las cuentas del panel:

- **Equipo** (`/equipo`), solo para el dueño: ve a su equipo, agrega cajeras,
  las desactiva o reactiva y les pone una contraseña nueva cuando la olvidan.
- **Mi cuenta** (`/cuenta`), para todos: cambiar la contraseña propia.

Contraparte de `fidelify-backend/agent/features/modulo_equipo.md` y
`modulo_auth.md`, que tienen las **reglas y el contrato de los endpoints**.
Este documento describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/TeamPage.tsx` | Equipo, y el componente `MemberRow` |
| `src/pages/AccountPage.tsx` | Mi cuenta |
| `src/api/client.ts` | `staffApi` (`list`, `create`, `update`), `accountApi` (`changePassword`) y el tipo `TeamMember` |
| `src/layout/AppLayout.tsx` | Oculta el enlace de Equipo a las cajeras (`ownerOnly`) |

---

## Equipo

- **El enlace solo lo ve el dueño.** Si una cajera abre `/equipo` a mano, la
  página le dice que es del dueño y ni siquiera pide la lista. Las dos cosas
  son cosmética: el backend responde 403 a una cajera en todas estas rutas.
- **Solo se agregan cajeras.** El formulario no tiene campo de rol; el backend
  fija `CASHIER`.
- **La contraseña la pone el dueño**, en un campo de texto visible: la va a
  decir en voz alta. La cajera la puede cambiar después en Mi cuenta.
- **Los botones de una fila solo aparecen en las cajeras.** El dueño no se
  puede desactivar ni cambiar la contraseña desde aquí; la suya se cambia en Mi
  cuenta.
- **Desactivar pide confirmación** (`window.confirm`): le cierra la sesión a la
  cajera en su siguiente petición, quizás con una fila de clientes enfrente.
  Reactivar no la pide.
- Tras cada cambio se invalida la query `['staff']` y la lista se vuelve a
  pintar con lo que responde el servidor. El aviso de resultado va arriba de
  la lista; el error, en la fila o en el formulario que lo causó, y es el
  mensaje del backend ("Ya existe un usuario con ese correo").

## Mi cuenta

- Pide la contraseña actual, la nueva y la nueva repetida. Que las dos nuevas
  coincidan se revisa aquí, antes de mandar nada: es un error de tipeo, no una
  regla de negocio, y el backend solo recibe la nueva una vez.
- Un `<input autocomplete="username">` oculto con el correo le dice al gestor de
  contraseñas del navegador qué cuenta actualizar.
- Cambiar la contraseña **no cierra la sesión** de nadie, tampoco la de esta
  pestaña.

## La contraseña nueva

`minLength={8}` y `maxLength={200}` en los campos, y el texto "Al menos 8
caracteres", repiten la regla `IsNewPassword` del backend. Si esa regla cambia,
cambian aquí también. El navegador solo hace cumplir `minLength` sobre lo que
la persona escribió; lo que pase igual lo frena el backend con su mensaje.

---

## Sin resolver

- **"Olvidé mi contraseña" en el login.** Hoy la de una cajera se la cambia el
  dueño desde Equipo, y la del dueño, soporte.
- **Corregir el nombre o el correo** de alguien del equipo.
- **Las demás secciones no distinguen roles**: una cajera sigue viendo Inicio,
  Clientes, Mi tarjeta, Cupones y Mensajes.
