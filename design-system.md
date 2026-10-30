# Design System — Panel del negocio (CSS con variables)

Traducción del sistema definido en [`../design-system.md`](../design-system.md).
Ese archivo manda; este solo dice **cómo se escribe en este repo**. Ningún color
se define aquí que no exista allá.

Todo el estilo está en un archivo: [`src/index.css`](src/index.css). No hay
librería de componentes, ni CSS-in-JS, ni Tailwind.

> **Este panel lleva la marca de Fidelify.** La página pública (`fidelify-web`)
> lleva la del negocio y se tiñe con sus colores. No se copian estilos de una a
> la otra, aunque los dos `index.css` se parezcan.

---

## 1. Reglas de escritura

**Nunca un hex literal en un componente ni en una regla nueva.** Siempre la
variable:

```css
/* ✗ */
.badge { background: #fce4ec; color: #c2185b; }

/* ✓ */
.badge { background: var(--accent-soft); color: var(--accent); }
```

**Los estilos van por clase**, definidos en `index.css`. `style` en línea solo
para un valor que sale de datos.

**Antes de crear una clase, buscar si ya existe.** El archivo es chico a
propósito: `card`, `row`, `alert`, `muted` cubren casi todo.

---

## 2. Tokens

Declarados en `:root`:

| Variable | Para |
|---|---|
| `--bg` | fondo de página; hover de un enlace de navegación |
| `--surface` | barra lateral, tarjetas, inputs |
| `--text` | texto |
| `--muted` | texto secundario |
| `--border` | bordes; sello vacío |
| `--accent` | botón primario, enlace activo, sello lleno, punto de la marca |
| `--accent-soft` | botón secundario, fondo del enlace activo |
| `--ok` / `--ok-soft` | aviso de éxito (texto / fondo) |
| `--error` / `--error-soft` | error (texto / fondo) |

Los valores están en [`../design-system.md`](../design-system.md) §2.1.

---

## 3. Clases que ya existen

| Clase | Qué es |
|---|---|
| `shell`, `sidebar`, `content` | estructura: barra lateral de 220px + contenido de hasta 760px |
| `brand`, `brand-mark` | nombre de Fidelify en la barra |
| `account` | pie de la barra: negocio, usuario y "Cerrar sesión" |
| `login`, `login-card` | pantalla de acceso: una tarjeta centrada |
| `loading` | "Cargando…" mientras se restaura la sesión |
| `nav-link` (+ `active`) | enlace de sección. `active` lo pone `NavLink` |
| `card` (+ `empty`) | contenedor. `empty` es el marcador "Próximamente" |
| `row` | fila de controles que se parte en varias líneas si no caben |
| `alert ok`, `alert error` | aviso de resultado |
| `form-stack` | formulario en columna: un campo debajo del otro, con su aviso y su botón |
| `hint` | ayuda debajo de un campo, dentro de su `label` |
| `team`, `member` (+ `inactive`), `member-info` | la lista de Equipo; `inactive` atenúa a quien está desactivado |
| `tags`, `tag` | etiquetas chicas y neutras: el rol, "Desactivada" |
| `muted` | párrafo secundario |
| `stamps`, `stamp` (+ `filled`) | los círculos de la tarjeta |

`button`, `input` y `label` están estilizados por etiqueta: un `<button>` es
primario sin clase, y `className="secondary"` lo hace secundario. Un `<label>`
que envuelve su `<input>` queda con el texto arriba del campo.

---

## 4. Componentes

**Botones.** Un primario por vista. En la caja, con una tarjeta cargada, ese
lugar es de "+ Dar sello"; "Canjear premio", "Buscar" y "Cancelar" son
`secondary`.

**Sellos.** `Stamps` pinta un círculo por cada sello del programa. Lleva
`aria-label` con el conteo en texto ("3 de 8 sellos"): los círculos solos no le
dicen nada a un lector de pantalla.

**Avisos.** El resultado de una operación va en un `alert`, arriba de la tarjeta
del cliente. El texto del error es el del backend.

**Formularios.** Van en una `card form-stack`, con un `label` que envuelve a
cada campo. La ayuda va en un `hint` dentro del mismo `label`. En Equipo el
primario es "Agregar cajera"; las acciones de cada fila son `secondary`.

**Secciones sin construir.** Usan `Placeholder`, que explica qué va a haber. No
se deja una ruta en blanco.

---

## 5. Pantallas chicas

La caja se usa en un celular o una tablet. Bajo **720px** la barra lateral pasa
arriba, sus enlaces se deslizan en horizontal y la cuenta queda en una fila
debajo.

Toda pantalla nueva se mira a ancho de celular antes de darla por terminada.

---

## 6. Deuda

| Qué | Dónde |
|---|---|
| El lector de QR trae su propia interfaz, en inglés y sin estos estilos | `html5-qrcode`, en `CashierPage.tsx` |
| El campo para escribir el código usa placeholder como label | `CashierPage.tsx` |
| Con una tarjeta cargada hay dos primarios a la vez: "Escanear código QR" y "+ Dar sello" | `CashierPage.tsx` |
| `#fff` literal como texto del botón primario | `src/index.css` |
| El favicon es el de la plantilla de Vite | `public/favicon.svg` |

---

## 7. Verificación

```bash
npm run build
npm run lint
```

Y **mirar la pantalla** a ancho de escritorio y de celular.
