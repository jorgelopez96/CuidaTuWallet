# Rediseño de navegación y secciones

Fecha: 2026-08-05

Cinco cambios que se implementan como cinco etapas independientes, cada una con
confirmación de Jorge antes de pasar a la siguiente.

## Alcance

1. Renombrar Inicio a Dashboard y sumar Ingresos a la navegación.
2. Sección Ingresos nueva, con ingresos recurrentes y su historial.
3. La card "Ingresos del mes" del Dashboard pasa a ser "Movimientos mensuales".
4. Consumos: cuatro categorías nuevas y estado vacío propio.
5. Tarjetas: carrusel en mobile, grilla en desktop.

Fuera de alcance: Clerk productivo, diseños mobile 2a-2c, logos reales de marca
en las tarjetas.

## 1. Navegación

`src/components/app-sidebar.tsx`:

| Orden | Label | Href | Ícono | Color |
|---|---|---|---|---|
| 1 | Dashboard | `/` | `LayoutDashboard` | `text-chart-1` |
| 2 | Ingresos | `/ingresos` | `PiggyBank` | `text-chart-2` |
| 3 | Tarjetas | `/tarjetas` | `CreditCard` | `text-chart-4` |
| 4 | Consumos | `/consumos` | `ShoppingBasket` | `text-chart-3` |

Tarjetas se mueve de `chart-2` (esmeralda) a `chart-4` (rosa) para que Ingresos
se quede con el esmeralda, que es el color de ingreso en toda la app.

El `<h1>` de `src/app/(app)/page.tsx` pasa de "Inicio" a "Dashboard". El href y
el archivo no cambian: sigue siendo la raíz.

## 2. Ingresos

### Modelo

Hoy `ingresos` es plano: un sueldo cargado en enero solo cuenta en enero. Para
que un ingreso siga contando mes a mes se le agrega vigencia.

`supabase/migrations/0003_ingresos_recurrentes.sql`:

```sql
alter table ingresos
  add column recurrente boolean not null default false,
  add column baja_el date;

alter table ingresos add constraint baja_posterior_al_alta
  check (baja_el is null or baja_el >= fecha);

comment on column ingresos.recurrente is 'Se cobra todos los meses desde `fecha` hasta `baja_el`';
comment on column ingresos.baja_el is 'Mes en que dejó de cobrarse; null = sigue vigente';
```

Reglas:

- Un ingreso **no recurrente** impacta solo el mes de su `fecha`.
- Un ingreso **recurrente** impacta todos los meses desde el de su `fecha` hasta
  el de `baja_el` inclusive. Con `baja_el` en null, hasta hoy y en adelante.
- No se generan filas nuevas por mes. Una fila por ingreso, siempre.

### Lógica

Archivo nuevo `src/lib/ingresos.ts` con funciones puras. Va aparte de
`resumen.ts` porque ese archivo ya está en 163 líneas, por encima del límite de
150 del proyecto.

```ts
export type Ingreso = {
  id: string;
  concepto: string;
  monto: number | string;
  fecha: string;
  recurrente: boolean;
  baja_el: string | null;
};

/** Un ingreso impacta el rango si es puntual y cae adentro, o si es recurrente y su vigencia lo cruza. */
export function vigenteEn(ingreso: Ingreso, desde: string, hasta: string): boolean;

/** Los ingresos que impactan un mes dado. */
export function ingresosDeMes(ingresos: Ingreso[], desde: string, hasta: string): Ingreso[];

/** Activo = recurrente sin baja, o puntual del mes en curso. El resto es historial. */
export function esActivo(ingreso: Ingreso, hoy: Date): boolean;
```

`serieMensual` y `porMes` en `resumen.ts` pasan a filtrar ingresos con
`ingresosDeMes` en lugar de comparar `fecha` directamente. Los gastos no cambian.

### Consultas

El Dashboard hoy trae ingresos por ventana de fechas. Con recurrentes eso deja
afuera un sueldo dado de alta hace un año, así que la query pasa a:

```ts
.or(`recurrente.eq.true,and(fecha.gte.${desde},fecha.lte.${hasta})`)
```

y el filtrado fino queda en `ingresosDeMes`, que es puro y testeable.

### Página `/ingresos`

`src/app/(app)/ingresos/page.tsx` (server) + `loading.tsx` con esqueleto, igual
que las otras secciones.

- Encabezado: `<h1>Ingresos</h1>` y debajo "Total activo: $ X", suma de los
  ingresos activos.
- Dos tabs con `Tabs` de shadcn (`npx shadcn add tabs`): **Activos** e
  **Historial (N)**.
- **Activos**: recurrentes sin baja, más los puntuales del mes en curso. Cada
  recurrente muestra un badge "Mensual" y un botón "Dar de baja". Los puntuales
  mantienen el botón de borrar que ya tienen.
- **Historial**: recurrentes con `baja_el`, más los puntuales de meses cerrados,
  agrupados por mes de más reciente a más viejo.
- **Vacío** (con `Vacio`, ícono `PiggyBank`): título "Sin ingresos activos",
  detalle "Registrá tu sueldo u otros ingresos", y como `children` el botón
  "Agregar ingreso" que abre el diálogo.

`src/components/ingreso-form.tsx` se usa desde acá y suma un checkbox "Se repite
todos los meses" que setea `recurrente`.

`src/components/lista-ingresos.tsx` se adapta para mostrar el badge "Mensual" y
la acción de baja. Deja de usarse en el Dashboard.

`src/app/(app)/_actions/ingresos.ts` suma:

```ts
export async function darDeBajaIngreso(id: string)
```

que escribe `baja_el` con la fecha de hoy y revalida. Valida que el ingreso sea
recurrente y que no tenga ya una baja.

## 3. Dashboard: Movimientos mensuales

Sale `<IngresoForm />` del encabezado de `src/app/(app)/page.tsx`.

La card "Ingresos del mes" pasa a "Movimientos mensuales" y muestra ingresos y
gastos del mes en una sola lista, ordenada por fecha descendente:

- Ingresos en verde con signo `+`, ícono `PiggyBank`.
- Gastos en rojo con signo `−`, ícono de su categoría (`IconoCategoria`).
- Los gastos de tarjeta muestran el nombre de la tarjeta como subtítulo.
- El total de la derecha pasa a ser el **neto del mes** (`disponible`), en verde
  o rojo según el signo.
- Vacío: "Sin movimientos este mes" con detalle apuntando a Ingresos y Consumos.

Componente nuevo `src/components/movimientos-mensuales.tsx`, de solo lectura:
no carga ni borra nada, para eso están Ingresos, Consumos y Tarjetas.

La query de gastos del Dashboard suma `id`, `descripcion` y `tarjeta_id`, que
hoy no trae, y se suma una query de tarjetas para resolver el nombre. Las tres
lecturas van en el mismo `Promise.all` que ya existe.

El resto del Dashboard no cambia: ecuación del mes, "Lo que viene" y
"En qué se va" quedan igual.

## 4. Consumos

### Categorías

`src/lib/catalogos.ts` pasa de 4 a 8 categorías, con "Otros" siempre último:

```ts
export const CATEGORIAS = [
  "Suscripciones",
  "Supermercado",
  "Transporte",
  "Servicios",
  "Entretenimiento",
  "Educación",
  "Salud",
  "Otros",
] as const;
```

`src/components/categorias.tsx` suma los estilos:

| Categoría | Ícono | Color |
|---|---|---|
| Suscripciones | `Tv` | `--chart-4` |
| Supermercado | `ShoppingCart` | `--chart-2` |
| Transporte | `Bus` | `--chart-3` |
| Servicios | `Lightbulb` | `--chart-6` |
| Entretenimiento | `Gamepad2` | `--chart-7` |
| Educación | `GraduationCap` | `--chart-8` |
| Salud | `HeartPulse` | `--chart-9` |
| Otros | `Package` | `--chart-5` |

### Paleta

`src/app/globals.css` suma cuatro variables, en `:root` y en `.dark`, más sus
alias `--color-chart-N` en el bloque `@theme`:

| Var | Claro | Oscuro |
|---|---|---|
| `--chart-6` | `#8b5cf6` | `#a78bfa` |
| `--chart-7` | `#f97316` | `#fb923c` |
| `--chart-8` | `#3b82f6` | `#60a5fa` |
| `--chart-9` | `#14b8a6` | `#2dd4bf` |

`--chart-1` (índigo) queda reservado para la marca y no se asigna a ninguna
categoría: en la torta se confundiría con el fondo de la app.

La grilla de chips de `filtro-categorias.tsx` ya es `grid-cols-2 md:grid-cols-4`,
así que con 8 quedan dos filas parejas. No se toca.

### Carga de gastos

Sale `<GastoForm />` del encabezado de `src/app/(app)/consumos/page.tsx`. Se
reemplaza por un botón flotante circular, fijo abajo a la derecha, en mobile y
en desktop por igual.

`GastoForm` pasa a aceptar `children` como trigger propio, con el botón actual
como valor por defecto. Así el mismo componente sirve para los tres casos: el
botón normal del detalle de tarjeta, el flotante y el del estado vacío. No se
duplica ningún formulario.

### Estado vacío

Con `Vacio`, ícono `ShoppingBasket`: título "Sin gastos registrados", detalle
"Registrá tus gastos para ver en qué estás gastando", y como `children` un botón
"Agregar" que abre el mismo diálogo.

Con la lista vacía el botón flotante no se renderiza: el de la tarjeta vacía ya
cumple esa función y dos botones idénticos en la misma pantalla confunden.

## 5. Tarjetas: carrusel en mobile

`src/app/(app)/tarjetas/page.tsx` no cambia sus queries ni sus totales
consolidados. Solo cambia cómo se renderiza la lista:

- **Desktop (`md` en adelante)**: la grilla `auto-fill` actual, sin cambios.
- **Mobile**: componente nuevo `src/components/carrusel-tarjetas.tsx`.

El carrusel:

- Scroll horizontal con `scroll-snap` nativo de CSS (`snap-x snap-mandatory`,
  `snap-center` en cada tarjeta). Sin librería nueva.
- Padding lateral para que las tarjetas vecinas asomen a los costados.
- Un `IntersectionObserver` marca cuál está enfocada. Las que no lo están se
  renderizan con `scale` y `blur` proporcionales a su distancia de la enfocada.
- Puntitos indicadores abajo, uno por tarjeta, con el activo alargado.
- Tocar la tarjeta enfocada entra a su detalle, igual que hoy. El botón de
  borrar ya vive dentro de `TarjetaVisual` y no se toca.

Es cliente porque necesita el observer; `TarjetaVisual` sigue siendo server y se
le pasa como `children`.

## Archivos

**Nuevos**

- `supabase/migrations/0003_ingresos_recurrentes.sql`
- `src/lib/ingresos.ts`
- `src/lib/ingresos.test.ts`
- `src/app/(app)/ingresos/page.tsx`
- `src/app/(app)/ingresos/loading.tsx`
- `src/components/movimientos-mensuales.tsx`
- `src/components/carrusel-tarjetas.tsx`
- `src/components/ui/tabs.tsx` (vía shadcn)

**Modificados**

- `src/components/app-sidebar.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/consumos/page.tsx`
- `src/app/(app)/tarjetas/page.tsx`
- `src/app/(app)/_actions/ingresos.ts`
- `src/lib/catalogos.ts`
- `src/lib/resumen.ts`, `src/lib/resumen.test.ts`
- `src/app/globals.css`
- `src/components/categorias.tsx`
- `src/components/ingreso-form.tsx`
- `src/components/lista-ingresos.tsx`
- `src/components/gasto-form.tsx`

## Tests

- `ingresos.test.ts`: un recurrente cuenta en un mes posterior a su alta; deja de
  contar en el mes siguiente a su baja; cuenta en el mes de la baja; un puntual
  cuenta solo en su mes; `esActivo` separa bien las cuatro combinaciones.
- `resumen.test.ts`: se actualiza para que `serieMensual` sume los recurrentes en
  cada mes de la ventana.

## Riesgos

- **`resumen.ts` en el límite.** Está en 163 líneas, ya por encima de las 150 de
  CLAUDE.md. La lógica de ingresos va a `ingresos.ts` justamente para no
  empeorarlo. Si la etapa 2 lo hace crecer igual, se avisa antes de seguir.
- **Migración sobre datos existentes.** Los ingresos ya cargados quedan con
  `recurrente = false`, o sea puntuales, que es el comportamiento actual. No hay
  pérdida ni cambio retroactivo.
- **`.or()` de Supabase.** La sintaxis anidada con `and(...)` es frágil de leer.
  Se valida contra datos reales antes de dar la etapa 2 por cerrada.
