# Módulo Mensajes

Una pantalla, solo para el dueño: **Mensajes** (`/mensajes`). Escribe un
mensaje, elige a quién le llega y ve los que ya mandó.

Contraparte de `fidelify-backend/agent/features/modulo_mensajes.md`, que tiene
el **contrato de los endpoints**, el freno y cómo llega a cada billetera. Este
documento describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/MessagesPage.tsx` | La pantalla, con `MessageForm` y `History` |
| `src/api/client.ts` | `notificationsApi` (`get`, `send`) y los tipos `MessagesOverview`, `SentMessage` y `MessageAudience` |
| `src/components/OwnerOnly.tsx` | Envuelve la ruta en `main.tsx` |
| `src/layout/AppLayout.tsx` | Oculta el enlace a las cajeras (`ownerOnly`) |

---

## Quién la usa

El dueño. A la cajera no se le muestra el enlace, y si abre la ruta a mano
`OwnerOnly` le dice que es del dueño. Las dos cosas son cosmética: el backend
le responde 403.

---

## Reglas

- **Todo lo que configura la pantalla viene de la API**: el largo máximo
  (`maxLength`), los topes (`limits`), cuántos clientes hay en cada grupo y
  cuándo se puede mandar el siguiente (`nextAvailableAt`). El panel no escribe
  "120" ni "uno por día" en ningún lado.
- **Los grupos llevan su tamaño** ("Los que dejaron de venir (5 clientes)"). Un
  grupo vacío no se puede elegir.
- **Pasado el tope, el botón se deshabilita** y la pantalla dice cuándo se puede
  mandar el próximo. Es feedback: quien frena es el backend, con un 429 cuyo
  mensaje se muestra tal cual.
- **Enviar pide confirmación** (`window.confirm`), con el tamaño del grupo: no
  se puede deshacer.
- Tras enviar, el aviso dice a cuántos les llegó de cuántos del grupo. Solo
  llega a quien guardó la tarjeta en el celular, y la pantalla lo dice arriba.
- El historial muestra los últimos 20, el más nuevo primero, con el grupo, la
  fecha y a cuántos les llegó.

---

## Sin resolver

- **Una vista previa** de cómo se ve el mensaje en el celular.
- **El botón no se habilita solo** cuando pasa la hora de `nextAvailableAt`:
  hay que volver a la pestaña o recargar.
