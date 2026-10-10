# Módulo Caja

La pantalla con la que se atiende: encontrar la tarjeta del cliente, darle un
sello y canjearle un premio.

Contraparte de `fidelify-backend/agent/features/modulo_sellos.md`, que tiene las
**reglas de sellos y el contrato completo de los endpoints**. Este documento
describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/CashierPage.tsx` | La pantalla, y el componente `Stamps` |
| `src/api/client.ts` | `passesApi` (`get`, `stamp`, `redeem`) y los tipos `PassDetail` y `PassSummary` |
| `src/main.tsx` | Registra `/caja` con `lazy` |

---

## Quién la usa

Quien atiende, desde un celular o una tablet del local, con el cliente enfrente
mostrando su tarjeta en el celular. Con sesión iniciada: solo encuentra tarjetas
de su negocio, y cada sello queda a su nombre.

---

## Flujo

### 1. Encontrar la tarjeta

Dos caminos que terminan en el mismo lugar:

- **Escanear.** "Escanear código QR" monta el lector de `html5-qrcode`. Al leer
  un código, el texto escaneado se toma **tal cual** como código de la tarjeta y
  el lector se cierra.
- **Escribir.** El campo de texto, para cuando la cámara no coopera.

En los dos casos el código se limpia igual: se le quitan los espacios de los
extremos y se pasa a mayúsculas.

### 2. Ver la tarjeta

`GET /passes/:serial`. Se muestra el nombre del cliente, el nombre del programa,
los sellos como círculos (`balance` llenos de `stampsRequired`) y cuántos
premios tiene disponibles.

La consulta no reintenta (`retry: false`): un código mal leído tiene que decir
"Tarjeta no encontrada" de inmediato.

### 3. Dar sello o canjear

| Botón | Llama | Deshabilitado cuando |
|---|---|---|
| + Dar sello | `POST /passes/:serial/stamp` con `count: 1` | hay una operación en curso |
| Canjear premio | `POST /passes/:serial/redeem` | hay una operación en curso, o `rewardsReady` es 0 |

Al terminar bien:

1. Se muestra el aviso: "Sello agregado.", "¡Completó la tarjeta! Tiene un
   premio disponible." (si la respuesta trae `rewardEarned`) o "Premio
   canjeado.".
2. Se **invalida** la consulta de la tarjeta, y los círculos se repintan con lo
   que devuelve el servidor.

Los sellos en pantalla salen siempre de `GET /passes/:serial`. La respuesta de
la mutación se usa solo para elegir el aviso.

---

## Reglas

- **El panel no suma sellos.** Manda "dar uno" y pinta lo que vuelve.
- **El botón de canjear deshabilitado es feedback.** La regla la hace cumplir el
  backend, que responde 400 si no hay premios.
- **Cambiar de tarjeta limpia el aviso y los errores** de la anterior. Un "Sello
  agregado." que sobrevive al siguiente cliente es un sello que la cajera cree
  haber dado dos veces.
- **Se muestra el mensaje del backend**, sea de la consulta o de cualquiera de
  las dos operaciones.
- **Una tarjeta de otro negocio se ve igual que una que no existe**: "Tarjeta no
  encontrada".
- **Si el token vence a mitad del turno, el sello se da igual.** `api()` renueva
  la sesión y repite la petición sin que quien atiende lo note (ver
  `modulo_sesion.md`).

---

## El lector

- Se monta solo mientras se está escaneando, y se desmonta al leer, al cancelar
  y al salir de la pantalla: una cámara que queda encendida gasta la batería de
  la tablet de la caja.
- El callback de lectura es un `useEffectEvent`, para que el efecto que monta el
  lector dependa solo de si se está escaneando.
- **Solo abre la cámara en un contexto seguro**: `localhost` o HTTPS.
- Espera que el QR contenga **solo el código** (`FL-…`). Un QR con una URL no
  encuentra ninguna tarjeta.

---

## Sin resolver

- **No hay deshacer.** Un sello dado por error no se puede quitar desde el
  panel.
- **El aviso de éxito no se limpia si la operación siguiente falla.** Pueden
  verse juntos "Sello agregado." del toque anterior y el error del actual.
- **Un sello por toque.** La API acepta hasta 20 de una vez; la pantalla no lo
  ofrece.
- **La interfaz del lector es la de `html5-qrcode`**: sus botones están en
  inglés ("Request Camera Permissions", "Start Scanning") y no usan los estilos
  del panel.
- **El campo para escribir el código no tiene label**, solo placeholder.
