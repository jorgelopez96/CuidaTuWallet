# Brief de diseño — CuidaTuWallet

> Copiá todo este archivo como primer mensaje. Está pensado para que quien
> trabaje el diseño entienda el producto, el sistema visual actual y qué se
> puede o no tocar, sin tener que leer el código.

---

## 1. Qué es el producto

App web de finanzas personales, en español rioplatense, para un usuario
argentino. Sirve para saber **cuánta plata le queda este mes**.

Registra:

- **Ingresos** — sueldo, ventas, changas.
- **Consumos sueltos** — supermercado, transporte, suscripciones, efectivo y
  débito.
- **Gastos de tarjeta de crédito** — incluidas las **cuotas**, que en Argentina
  son la norma: casi todo se compra en 3, 6 o 12 pagos.

Puede leer el **PDF del resumen de la tarjeta** y cargar los consumos solos.

### Quién lo usa

Una sola persona, su dueño. No es multiusuario ni B2B. Entra desde la
computadora casi siempre y desde el celular a veces. La sesión típica dura dos
minutos: abre, mira cuánto le queda, carga un gasto y se va.

### El concepto que ordena todo

**Disponible = ingresos del mes − todos los gastos que impactan este mes.**

Ese número es el corazón del producto. Todo lo demás existe para explicarlo o
para alimentarlo.

Sutileza importante: una cuota 12/12 de una compra de hace un año **se paga este
mes**. Por eso cada gasto guarda dos fechas distintas —cuándo se compró y a qué
mes imputa— y la que manda para el disponible es la segunda.

---

## 2. Estado actual

Está **terminado y funcionando en producción**. No es un prototipo: tiene
autenticación, base de datos y datos reales del dueño adentro.

Lo que se busca es **subir el nivel visual**, no rehacer el producto.

### Stack

Next.js 16 (App Router, React Server Components) · TypeScript · Tailwind CSS v4
· shadcn/ui · Motion (Framer Motion) · Recharts · lucide-react · Clerk (auth) ·
Supabase (Postgres).

---

## 3. Sistema visual actual

### Tipografía

**Nunito Sans** (Google Fonts) para toda la interfaz. Geométrica-humanista,
amigable, buena legibilidad en tamaños chicos. Se eligió por cercanía a la
Proxima Nova que usa Mercado Pago, que es la referencia de tono del proyecto.

`Geist Mono` solo para los dígitos de las tarjetas.

### Color

Tema **oscuro por defecto**, con toggle a claro. Los dos temas tienen que
funcionar.

Marca: **índigo + esmeralda**.

| Token | Claro | Oscuro | Para qué |
|---|---|---|---|
| `--primary` | `#4f46e5` | `#6366f1` | acciones, activos, foco |
| `--ingreso` | `#10b981` | `#34d399` | plata que entra |
| `--gasto` | `#ef4444` | `#f87171` | plata que sale |
| `--background` | `oklch(0.985 0.006 277)` | `oklch(0.16 0.018 277)` | fondo base |
| `--card` | `oklch(1 0 0 / 72%)` | `oklch(1 0 0 / 9%)` | superficies |
| `--radius` | `1rem` | `1rem` | radio base |

Las superficies **no son grises neutros**: llevan un 2-4% de croma en el matiz
277 (índigo). Es sutil pero es lo que separa "app gris" de "app con marca".

Paleta de gráficos (`--chart-1..5`): índigo, esmeralda, ámbar, rosa, cian.

### Fondo

Toda la app se apoya sobre un **fondo animado fijo**: un gradiente base que se
desplaza en 18 segundos más cinco manchas de color difuminadas (`blur-3xl`, 12 a
22% de opacidad) que derivan en ciclos de 12 a 35 segundos.

Sobre eso, **las superficies son translúcidas**: las cards son
`bg-white/9` con `backdrop-blur-md`. El efecto de vidrio es deliberado y es la
identidad visual del producto. Viene de una versión anterior que al dueño le
gustaba.

### Movimiento

Todo con Motion. Ya implementado:

- Fondo animado, ciclos largos.
- **Count-up** de los montos: de 0 al valor en 850 ms con `easeOut`.
- **Transición de sección**: fade + 12px de slide, 250 ms `easeOut`.
- **Hover de cards**: suben 4px, borde índigo y glow, 250 ms. Esto va en CSS y
  no en Motion, porque es un cambio de estado y corre en el compositor.

### Iconografía

lucide-react. Cada categoría de gasto tiene ícono y color propios:

| Categoría | Ícono | Color |
|---|---|---|
| Suscripciones | `Tv` | rosa (`--chart-4`) |
| Supermercado | `ShoppingCart` | esmeralda (`--chart-2`) |
| Transporte | `Bus` | ámbar (`--chart-3`) |
| Otros | `Package` | cian (`--chart-5`) |

Los logos de las redes de tarjeta (Visa, Mastercard, Amex, Naranja X, Cabal) son
los **SVG oficiales**, en `public/marcas/`.

---

## 4. Pantallas

### Login (`/login`)

Fondo animado a pantalla completa, logo de la app, título, bajada y el
componente `<SignIn />` de Clerk. Poco margen de acción: la card de login la
renderiza Clerk y solo se puede tematizar con su API de `appearance`.

### Inicio (`/`)

- Tres cards: **Ingresos del mes**, **Gastos del mes**, **Disponible**, con
  count-up e ícono de tendencia.
- Tabla de ingresos del mes con borrado.
- Dona de distribución de gastos por categoría, con leyenda y total al centro.
- Botón "Cargar ingreso" que abre un diálogo.

### Tarjetas (`/tarjetas`)

- Tres cards de totales: **Total**, **Propios**, **De terceros**.
- Grilla de tarjetas de crédito. Cada una imita un plástico real: proporción
  1.586:1 (85,6 × 54 mm), radio 14px, degradé propio por marca, banco arriba a
  la izquierda, `•••• •••• •••• 1234` al medio, total del mes abajo a la
  izquierda y el logo de la red abajo a la derecha.

### Detalle de tarjeta (`/tarjetas/[id]`)

Totales propios/terceros, tabla de gastos con cuotas, y dos acciones: cargar
gasto a mano o subir el resumen en PDF.

### Consumos (`/consumos`)

- Cuatro **chips de categoría** con ícono y total, que filtran la tabla al
  tocarlos.
- Tabla de consumos con ícono de categoría por fila, medio de pago y monto.

### Perfil (`/perfil`)

Formulario simple: nombre, apellido, fecha de nacimiento.

### Transversal

- **Sidebar** izquierdo con Inicio, Tarjetas y Consumos, cada uno con su color.
  Abajo, el usuario con su avatar y el toggle de tema. En mobile se convierte en
  un panel deslizable.
- **Guía rápida**: botón flotante abajo a la derecha que abre un panel
  explicando las secciones.
- **Estados vacíos** con ícono en pastilla, título y una frase que dice qué
  hacer.

---

## 5. Qué se puede tocar y qué no

### Libre

Jerarquía visual, escala tipográfica, espaciado y ritmo, densidad de las tablas,
composición de las pantallas, microinteracciones, estados vacíos y de carga,
tratamiento de los gráficos, forma de las tarjetas de crédito.

### Con cuidado

- **La paleta índigo + esmeralda** es la marca. Se pueden ajustar tonos,
  saturación y cómo se aplican, pero no cambiar de familia.
- **El vidrio sobre fondo animado** es la identidad. Se puede calibrar
  opacidad y desenfoque; sacarlo sería otro producto.
- **Verde = entra, rojo = sale.** Es la convención del rubro y no se negocia.

### No tocar

- Los dos temas, claro y oscuro, tienen que seguir funcionando.
- Los logos de las redes de tarjeta son marcas registradas: se usan como
  vienen.
- El texto va en **español rioplatense**, voseo. "Cargá", "Agregá", "Tenés".
- Los montos en formato es-AR: `$ 1.500.000`, punto para miles.

---

## 6. Dónde flojea hoy

Diagnóstico honesto de lo que más se nota:

1. **Las tablas son las de shadcn sin trabajar.** Filas parejas, sin ritmo, sin
   jerarquía entre descripción, fecha y monto. Es la superficie más usada de la
   app y la menos diseñada.
2. **No hay estados de carga.** Se pasa de nada al contenido. Falta skeleton.
3. **Los diálogos son cajas con campos apilados.** Cumplen y nada más.
4. **La dona es el único gráfico.** No hay evolución mes a mes, ni comparación
   contra el mes anterior, ni ninguna lectura de tendencia.
5. **Densidad pareja en todas las pantallas.** Todo pesa lo mismo; nada guía el
   ojo.
6. **Mobile está resuelto, no diseñado.** Las grillas se apilan y listo.

---

## 7. Qué se espera

Propuestas concretas y aplicables sobre esta base, no un rediseño de cero. Lo
más valioso, en orden:

1. **Jerarquía y ritmo** en Inicio y en las tablas.
2. **Sistema de tipografía y espaciado** explícito: escala, pesos, cuándo usar
   cada uno.
3. **Tablas y listas** con un tratamiento propio.
4. **Estados de carga y vacío** que acompañen.
5. **Mobile pensado**, no solo apilado.

Entregar en tokens y clases de Tailwind cuando se pueda, porque el sistema ya
está montado sobre variables CSS y se puede aplicar directo.
