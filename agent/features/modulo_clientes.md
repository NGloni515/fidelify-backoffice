# Módulo Clientes

Dos pantallas, solo para el dueño:

- **Clientes** (`/clientes`): la lista de quienes se inscribieron, con buscador
  y páginas.
- **Ficha** (`/clientes/:id`): los datos de un cliente, su tarjeta, su
  historial, el ajuste manual de sellos y el borrado de sus datos.

Contraparte de `fidelify-backend/agent/features/modulo_clientes.md` (búsqueda,
ficha y borrado) y `modulo_sellos.md` (la regla del ajuste), que tienen el **contrato de
los endpoints**. Este documento describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/CustomersPage.tsx` | La lista, y el componente `CustomerRow` |
| `src/pages/CustomerPage.tsx` | La ficha, con `Detail`, `PassSection` y `EraseSection` |
| `src/api/client.ts` | `customersApi` (`search`, `get`, `erase`), `passesApi.adjust` y los tipos `CustomerList`, `CustomerDetail` y `Movement` |
| `src/format.ts` | Fechas en `es-EC` y el texto de cada movimiento ("+2 sellos", "Ajuste: -1 sello") |
| `src/components/OwnerOnly.tsx` | Envuelve las dos rutas en `main.tsx` |
| `src/components/Stamps.tsx` | Los círculos de la tarjeta, compartidos con la caja |

---

## Quién la usa

El dueño. A la cajera no se le muestra el enlace, y si abre la ruta a mano
`OwnerOnly` le dice que es del dueño sin pedir nada al backend. Las dos cosas
son cosmética: el backend le responde 403.

La lista lleva el teléfono de cada cliente, y por eso no es de la cajera. Ella
ve a un cliente a la vez, el de la tarjeta que escanea en la caja.

---

## Lista

- **Se busca al enviar**, no con cada tecla: una petición por búsqueda.
- **La búsqueda va por `POST`** (`customersApi.search`), porque puede llevar un
  teléfono y en la URL quedaría en los logs.
- Las páginas las arma el panel con `total` y `pageSize` de la respuesta.
  Mientras llega la página siguiente se queda la anterior
  (`placeholderData: keepPreviousData`) y los botones se deshabilitan.
- Cada fila es un enlace a la ficha. Muestra los sellos de la primera tarjeta
  activa, sus premios y la última visita. "Todavía no vuelve" es un cliente que
  se inscribió y no regresó.

## Ficha

- Datos del cliente, la tarjeta con sus sellos y el historial, el más nuevo
  primero, con quién hizo cada movimiento y el motivo de los ajustes.
- **Cumpleaños** llega como `YYYY-MM-DD` y se formatea en UTC
  (`formatCalendarDate`): leído como hora local, en Ecuador saldría un día
  antes.
- **Ajustar sellos**: sumar o quitar entre 1 y 20, con un motivo obligatorio.
  El panel manda el número con signo y muestra lo que responde el backend. Si
  el ajuste completa la tarjeta, lo dice; si quita más sellos de los que hay,
  se lee el mensaje del backend.
- Tras un ajuste se invalidan la ficha (`['customer', id]`) y la lista
  (`['customers']`). Nada se pinta antes de la respuesta.

## Borrar los datos

Al final de la ficha, para cuando el cliente lo pide. Qué se borra y qué queda
lo decide el backend; la pantalla lo explica antes del botón: se van nombre,
teléfono, correo y cumpleaños, la tarjeta queda anulada también en el celular,
y los sellos siguen contando en el Inicio, sin nombre.

- **Pide confirmación** (`window.confirm`): no se puede deshacer. El botón es
  `secondary`, como "Desactivar" en Equipo; el primario de la ficha sigue
  siendo "Guardar ajuste".
- Al terminar vuelve a la lista con `replace` (atrás no lleva a una ficha que
  ya no existe), con el aviso "Se borraron los datos de …" en el `state` de la
  navegación.
- Antes de irse descarta la lista guardada (`['customers']`), para que no
  asome el cliente borrado mientras llega la nueva; la ficha
  (`['customer', id]`) recién después de salir, porque mientras la pantalla la
  mira, descartarla la volvería a pedir y daría 404.

---

## Sin resolver

- **Ordenar** por última visita o por sellos. Hoy la lista va por nombre.
- **Las tildes cuentan al buscar**: "maria" no encuentra a "María".
- **Editar un cliente**: corregir su nombre o su teléfono.
