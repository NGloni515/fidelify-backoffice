# Módulo Inicio

La pantalla con la que el dueño abre el panel (`/`): cuatro números del negocio,
quiénes vienen más y quiénes dejaron de venir.

Contraparte de `fidelify-backend/agent/features/modulo_inicio.md`, que tiene
**las definiciones y el contrato**: qué es una visita, qué es "dejó de venir",
en qué zona horaria se cuenta "hoy". Este documento describe solo el lado del
panel.

---

## Archivos

| Archivo | Qué |
|---|---|
| `src/pages/HomePage.tsx` | La pantalla, con `Summary` y `Stat` |
| `src/api/client.ts` | `dashboardApi.get` y el tipo `Dashboard` |
| `src/format.ts` | `plural()` y las fechas |

---

## Reglas

- **Solo el dueño.** La cajera no ve el enlace, entra directo a `/caja`, y si
  abre `/` a mano `OwnerOnly` le dice que es del dueño. El backend le responde
  403 de todos modos.
- **Ningún número se calcula aquí.** Todos llegan hechos, y el periodo también:
  el texto "30 días" sale de `periodDays`.
- **Cuatro tarjetas de número**, con su etiqueta arriba, el valor y un detalle
  debajo: clientes (y nuevos), sellos de hoy (y canjes), sellos del periodo (y
  canjes) y premios por canjear. Sin gráficos: son números sueltos, no una
  serie.
- Cada cliente de las dos listas lleva a su ficha (`/clientes/:id`).
- La query `['dashboard']` se vuelve a pedir cada vez que se entra a la
  página, así que un sello dado en la caja aparece al volver al Inicio.

---

## Sin resolver

- **Elegir el periodo** o comparar con el anterior. Los dos los tiene que
  calcular primero el backend.
- **Escribirle a los que dejaron de venir** desde aquí: depende de Mensajes.
