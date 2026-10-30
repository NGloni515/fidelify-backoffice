# Módulo Clientes

Dos pantallas, solo para el dueño:

- **Clientes** (`/clientes`): la lista de quienes se inscribieron, con buscador
  y páginas.
- **Ficha** (`/clientes/:id`): los datos de un cliente, su tarjeta, su historial
  y el ajuste manual de sellos.

Contraparte de `fidelify-backend/agent/features/modulo_clientes.md` (búsqueda y
ficha) y `modulo_sellos.md` (la regla del ajuste), que tienen el **contrato de
los endpoints**. Este documento describe solo el lado del panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/CustomersPage.tsx` | La lista, y el componente `CustomerRow` |
| `src/pages/CustomerPage.tsx` | La ficha, con `Detail` y `PassSection` |
| `src/api/client.ts` | `customersApi` (`search`, `get`), `passesApi.adjust` y los tipos `CustomerList`, `CustomerDetail` y `Movement` |
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

---

## Sin resolver

- **Ordenar** por última visita o por sellos. Hoy la lista va por nombre.
- **Las tildes cuentan al buscar**: "maria" no encuentra a "María".
- **Editar o borrar un cliente.**
