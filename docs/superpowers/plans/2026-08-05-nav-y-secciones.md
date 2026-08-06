# Rediseño de navegación y secciones — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para implementar tarea por tarea. Los pasos usan checkbox (`- [ ]`) para seguimiento.

**Objetivo:** Renombrar Inicio a Dashboard, sumar una sección Ingresos con recurrentes y su historial, convertir la card de ingresos del Dashboard en un feed unificado de movimientos, ampliar Consumos a ocho categorías con estado vacío propio, y mostrar las tarjetas como carrusel en mobile.

**Arquitectura:** Cinco etapas independientes, cada una con un entregable visible y revisable por separado. La lógica de vigencia de ingresos vive en un módulo puro nuevo (`src/lib/ingresos.ts`) que `resumen.ts` consume en una sola dirección; no hay imports circulares. Las páginas siguen siendo server components y la interactividad nueva (tabs, carrusel, botón flotante) va en client components chicos y acotados.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui, Supabase, Clerk. Tests con `tsx` + `node:assert/strict`, sin framework.

**Spec:** `docs/superpowers/specs/2026-08-05-nav-y-secciones-design.md`

## Restricciones globales

- **No commitear ni pushear.** Jorge commitea cuando él lo decide. Ningún paso de este plan ejecuta `git commit` ni `git push`.
- **Primera línea de cada archivo: su path completo como comentario.** Regla de CLAUDE.md.
- **Sin `console.log` ni código de debug** en el output final. `console.info` al cierre de un archivo de test sí, es el patrón que ya usan los tests del proyecto.
- **Avisar si un archivo supera las 150 líneas.** `src/lib/resumen.ts` ya está en 163.
- **Avanzar por etapas esperando confirmación de Jorge.** Cada tarea termina en un checkpoint; no se arranca la siguiente sin su OK.
- **Nunca tomar decisiones de diseño o arquitectura sin consultar.** Lo que no esté en este plan se pregunta.
- Textos de UI en español rioplatense, con voseo, tal cual figuran acá.
- Comandos de verificación: `npm run lint`, `npm test`, `npm run build`.

---

### Tarea 1: Renombrar Inicio a Dashboard

**Archivos:**
- Modificar: `src/components/app-sidebar.tsx:24`
- Modificar: `src/app/(app)/page.tsx:23,68`

**Interfaces:**
- Consume: nada.
- Produce: nada que otras tareas necesiten. Es un cambio de texto aislado.

Sin test: son literales de UI, no hay lógica que pueda romperse en silencio. `npm run build` alcanza como red.

- [ ] **Paso 1: Cambiar el label del sidebar**

En `src/components/app-sidebar.tsx`, dentro de `const secciones`:

```tsx
const secciones = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-chart-1" },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard, color: "text-chart-2" },
  { href: "/consumos", label: "Consumos", icon: ShoppingBasket, color: "text-chart-3" },
];
```

Solo cambia `"Inicio"` por `"Dashboard"`. El ícono, el href y el color quedan igual. El recoloreo de Tarjetas llega en la Tarea 2, cuando exista Ingresos para quedarse con el esmeralda.

- [ ] **Paso 2: Cambiar el título de la página y el nombre del componente**

En `src/app/(app)/page.tsx`:

```tsx
export default async function DashboardPage() {
```

y más abajo:

```tsx
<h1 className="text-2xl font-semibold">Dashboard</h1>
```

- [ ] **Paso 3: Actualizar el comentario del esqueleto de carga**

En `src/app/(app)/loading.tsx`, línea 6-7:

```tsx
/** Carga del Dashboard: la ecuación, los dos gráficos y la lista de ingresos. */
export default function CargandoDashboard() {
```

- [ ] **Paso 4: Verificar**

```bash
npm run lint
npm run build
```

Esperado: ambos en verde. Grep de control: `grep -rn "Inicio" src/` no debe devolver nada en `app-sidebar.tsx` ni en `page.tsx`.

- [ ] **Paso 5: Checkpoint con Jorge**

Mostrar el sidebar y el encabezado del Dashboard. Esperar OK antes de la Tarea 2. No commitear.

---

### Tarea 2: Ingresos recurrentes y su sección

La tarea más grande del plan: migración, módulo puro nuevo con sus tests, página nueva y adaptación de dos componentes. Se hace de una porque partirla dejaría estados intermedios rotos (una migración sin lógica que la use, o una página que enlaza a nada).

**Archivos:**
- Crear: `supabase/migrations/0003_ingresos_recurrentes.sql`
- Crear: `src/lib/ingresos.ts`
- Crear: `src/lib/ingresos.test.ts`
- Crear: `src/app/(app)/ingresos/page.tsx`
- Crear: `src/app/(app)/ingresos/loading.tsx`
- Crear: `src/components/ui/tabs.tsx` (vía shadcn CLI)
- Modificar: `src/lib/resumen.ts:114-132` (`serieMensual`)
- Modificar: `src/lib/resumen.test.ts:109-121`
- Modificar: `src/app/(app)/_actions/ingresos.ts`
- Modificar: `src/components/ingreso-form.tsx`
- Modificar: `src/components/lista-ingresos.tsx`
- Modificar: `src/components/app-sidebar.tsx`
- Modificar: `src/app/(app)/page.tsx`
- Modificar: `package.json` (script `test`)

**Interfaces:**
- Consume: `total`, `mesDe`, `rangoDelMes` de `@/lib/resumen`; `Vacio`, `Button`, `Badge`, `Card` de componentes existentes; `useFormDialog` de `@/hooks/use-form-dialog`.
- Produce, para las tareas 3 en adelante:
  - `type Vigencia = { fecha: string; recurrente: boolean; baja_el: string | null }`
  - `vigenteEnMes(ingreso: Vigencia, mes: string): boolean`
  - `ingresosDeMes<T extends Vigencia>(ingresos: T[], mes: string): T[]`
  - `esActivo(ingreso: Vigencia, mes: string): boolean`
  - `historialPorMes<T extends Vigencia>(ingresos: T[]): { mes: string; ingresos: T[] }[]`
  - `type Ingreso = Vigencia & { id: string; concepto: string; monto: number | string }`
  - `serieMensual(fecha, meses, ingresos: (Monto & Vigencia)[], gastos: ConFecha[])` — la firma de `ingresos` cambia respecto de hoy.
  - `darDeBajaIngreso(id: string): Promise<Resultado>` en `_actions/ingresos.ts`.

`mes` es siempre una clave `"yyyy-mm"`, nunca una fecha completa.

- [ ] **Paso 1: Escribir la migración**

Crear `supabase/migrations/0003_ingresos_recurrentes.sql`:

```sql
-- supabase/migrations/0003_ingresos_recurrentes.sql
-- Un ingreso recurrente (sueldo, alquiler que cobrás) se cuenta en todos los
-- meses entre su alta y su baja, sin generar una fila por mes. Los ingresos
-- que ya existen quedan como puntuales: mismo comportamiento que hasta ahora.

alter table ingresos
  add column recurrente boolean not null default false,
  add column baja_el date;

alter table ingresos add constraint baja_posterior_al_alta
  check (baja_el is null or baja_el >= fecha);

alter table ingresos add constraint baja_solo_si_recurrente
  check (baja_el is null or recurrente);

comment on column ingresos.recurrente is 'Se cobra todos los meses desde `fecha` hasta `baja_el`';
comment on column ingresos.baja_el is 'Fecha en que dejó de cobrarse; null = sigue vigente';
```

- [ ] **Paso 2: Aplicar la migración en Supabase**

Correr el SQL en el editor de Supabase del proyecto. Verificar después:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'ingresos' and column_name in ('recurrente', 'baja_el');
```

Esperado: dos filas, `recurrente` boolean not null default false, `baja_el` date nullable.

- [ ] **Paso 3: Escribir el test de la lógica de vigencia (falla)**

Crear `src/lib/ingresos.test.ts`:

```ts
// src/lib/ingresos.test.ts
// Correlo con: npx tsx src/lib/ingresos.test.ts
import assert from "node:assert/strict";
import {
  esActivo,
  historialPorMes,
  ingresosDeMes,
  vigenteEnMes,
} from "./ingresos";

const puntual = { fecha: "2026-06-10", recurrente: false, baja_el: null };
const sueldo = { fecha: "2026-03-28", recurrente: true, baja_el: null };
const alquiler = { fecha: "2026-01-05", recurrente: true, baja_el: "2026-05-20" };

// --- vigenteEnMes ----------------------------------------------------------
// Un puntual cuenta solo en el mes de su fecha.
assert.equal(vigenteEnMes(puntual, "2026-06"), true);
assert.equal(vigenteEnMes(puntual, "2026-07"), false);
assert.equal(vigenteEnMes(puntual, "2026-05"), false);

// Un recurrente sin baja cuenta desde su alta en adelante, para siempre.
assert.equal(vigenteEnMes(sueldo, "2026-03"), true);
assert.equal(vigenteEnMes(sueldo, "2026-08"), true);
assert.equal(vigenteEnMes(sueldo, "2027-12"), true);
// Pero no antes de darse de alta.
assert.equal(vigenteEnMes(sueldo, "2026-02"), false);

// El día del mes no importa: dado de alta el 28, cuenta el mes entero.
assert.equal(vigenteEnMes({ ...sueldo, fecha: "2026-03-01" }, "2026-03"), true);

// Un recurrente dado de baja cuenta hasta el mes de la baja inclusive.
assert.equal(vigenteEnMes(alquiler, "2026-04"), true);
assert.equal(vigenteEnMes(alquiler, "2026-05"), true);
assert.equal(vigenteEnMes(alquiler, "2026-06"), false);

// Alta y baja en el mismo mes: cuenta ese mes y ninguno más.
const fugaz = { fecha: "2026-02-03", recurrente: true, baja_el: "2026-02-25" };
assert.equal(vigenteEnMes(fugaz, "2026-02"), true);
assert.equal(vigenteEnMes(fugaz, "2026-03"), false);

// --- ingresosDeMes ---------------------------------------------------------
const todos = [puntual, sueldo, alquiler];
assert.deepEqual(ingresosDeMes(todos, "2026-06"), [puntual, sueldo]);
assert.deepEqual(ingresosDeMes(todos, "2026-04"), [sueldo, alquiler]);
assert.deepEqual(ingresosDeMes(todos, "2025-12"), []);
assert.deepEqual(ingresosDeMes([], "2026-06"), []);

// --- esActivo --------------------------------------------------------------
// Un recurrente sin baja está activo, no importa cuándo se dio de alta.
assert.equal(esActivo(sueldo, "2026-08"), true);
// Uno dado de baja es historial aunque la baja sea de este mes.
assert.equal(esActivo(alquiler, "2026-05"), false);
// Un puntual está activo solo durante su mes.
assert.equal(esActivo(puntual, "2026-06"), true);
assert.equal(esActivo(puntual, "2026-07"), false);

// --- historialPorMes -------------------------------------------------------
// Se agrupa por el mes de cierre: la baja si es recurrente, la fecha si fue puntual.
const grupos = historialPorMes([puntual, alquiler]);
assert.deepEqual(grupos.map((g) => g.mes), ["2026-06", "2026-05"]);
assert.deepEqual(grupos[0].ingresos, [puntual]);
assert.deepEqual(grupos[1].ingresos, [alquiler]);
assert.deepEqual(historialPorMes([]), []);

console.info("ingresos.ts ok");
```

- [ ] **Paso 4: Correr el test y verificar que falla**

```bash
npx tsx src/lib/ingresos.test.ts
```

Esperado: FALLA con `Cannot find module './ingresos'`.

- [ ] **Paso 5: Escribir `src/lib/ingresos.ts`**

```ts
// src/lib/ingresos.ts
// Vigencia de un ingreso. No importa nada de resumen.ts a propósito: resumen.ts
// consume este módulo, y un import de vuelta armaría un ciclo.

/** Clave de mes "yyyy-mm". Las fechas vienen en ISO y ordenan bien como texto. */
const mes = (fechaISO: string) => fechaISO.slice(0, 7);

export type Vigencia = {
  fecha: string;
  recurrente: boolean;
  baja_el: string | null;
};

export type Ingreso = Vigencia & {
  id: string;
  concepto: string;
  monto: number | string;
};

/**
 * Si el ingreso impacta el mes dado. Un puntual solo cuenta en el mes de su
 * fecha; uno recurrente cuenta desde el mes de su alta hasta el de su baja
 * inclusive, o para siempre si no tiene baja.
 */
export function vigenteEnMes(ingreso: Vigencia, clave: string): boolean {
  const alta = mes(ingreso.fecha);
  if (!ingreso.recurrente) return alta === clave;
  return alta <= clave && (!ingreso.baja_el || mes(ingreso.baja_el) >= clave);
}

/** Los ingresos que impactan un mes dado. */
export function ingresosDeMes<T extends Vigencia>(ingresos: T[], clave: string): T[] {
  return ingresos.filter((i) => vigenteEnMes(i, clave));
}

/**
 * Activo = recurrente todavía sin baja, o puntual del mes en curso. Todo lo
 * demás es historial. `clave` es el mes actual.
 */
export function esActivo(ingreso: Vigencia, clave: string): boolean {
  if (ingreso.recurrente) return !ingreso.baja_el;
  return mes(ingreso.fecha) === clave;
}

/**
 * Historial agrupado por el mes en que se cerró, del más reciente al más viejo:
 * la baja si era recurrente, la fecha del cobro si fue puntual.
 */
export function historialPorMes<T extends Vigencia>(ingresos: T[]) {
  const cierre = (i: T) => mes(i.baja_el ?? i.fecha);

  return [...new Set(ingresos.map(cierre))]
    .sort()
    .reverse()
    .map((clave) => ({
      mes: clave,
      ingresos: ingresos.filter((i) => cierre(i) === clave),
    }));
}
```

- [ ] **Paso 6: Correr el test y verificar que pasa**

```bash
npx tsx src/lib/ingresos.test.ts
```

Esperado: `ingresos.ts ok`, sin excepciones.

- [ ] **Paso 7: Sumar el test nuevo al script `test`**

En `package.json`, línea 10:

```json
"test": "tsx src/lib/monto.test.ts && tsx src/lib/resumen.test.ts && tsx src/lib/resumen-parser.test.ts && tsx src/lib/ingresos.test.ts"
```

- [ ] **Paso 8: Actualizar el test de `serieMensual` (falla)**

En `src/lib/resumen.test.ts`, reemplazar el bloque de las líneas 109-121 por:

```ts
const serie = serieMensual(
  new Date(2026, 7, 4),
  3,
  [
    { fecha: "2026-06-10", monto: 1000, recurrente: false, baja_el: null },
    { fecha: "2026-08-01", monto: 500, recurrente: false, baja_el: null },
  ],
  [{ fecha: "2026-08-02", monto: 200 }],
);
assert.deepEqual(serie.map((m) => m.mes), ["2026-06", "2026-07", "2026-08"]);
// Julio no tuvo movimientos y aun así aparece: sin eso el gráfico miente.
assert.deepEqual(serie[1], { mes: "2026-07", cobrado: 0, gastado: 0, disponible: 0 });
assert.deepEqual(serie[2], { mes: "2026-08", cobrado: 500, gastado: 200, disponible: 300 });

// Un sueldo recurrente suma en todos los meses de la serie, con una sola fila.
const conSueldo = serieMensual(
  new Date(2026, 7, 4),
  3,
  [{ fecha: "2026-01-05", monto: 800, recurrente: true, baja_el: null }],
  [],
);
assert.deepEqual(conSueldo.map((m) => m.cobrado), [800, 800, 800]);

// Y deja de sumar a partir del mes siguiente al de su baja.
const conBaja = serieMensual(
  new Date(2026, 7, 4),
  3,
  [{ fecha: "2026-01-05", monto: 800, recurrente: true, baja_el: "2026-07-31" }],
  [],
);
assert.deepEqual(conBaja.map((m) => m.cobrado), [800, 800, 0]);
```

- [ ] **Paso 9: Correr el test y verificar que falla**

```bash
npx tsx src/lib/resumen.test.ts
```

Esperado: FALLA en el `deepEqual` de `conSueldo`, que da `[0, 0, 0]` porque `serieMensual` todavía compara `mesDe(fecha)` a secas y el sueldo es de enero.

- [ ] **Paso 10: Adaptar `serieMensual`**

En `src/lib/resumen.ts`, agregar el import arriba, junto al de catálogos:

```ts
import { vigenteEnMes, type Vigencia } from "@/lib/ingresos";
```

y reemplazar el cuerpo de `serieMensual` (líneas 114-132) por:

```ts
export function serieMensual(
  fecha: Date,
  meses: number,
  ingresos: (Monto & Vigencia)[],
  gastos: ConFecha[],
) {
  const y = fecha.getFullYear();
  const m = fecha.getMonth();

  return Array.from({ length: meses }, (_, i) => {
    const cursor = new Date(y, m - (meses - 1) + i, 1);
    const clave = `${cursor.getFullYear()}-${dosDigitos(cursor.getMonth() + 1)}`;

    // Los ingresos se filtran por vigencia y no por fecha: un sueldo recurrente
    // es una sola fila que impacta todos los meses entre su alta y su baja.
    const cobrado = total(ingresos.filter((ing) => vigenteEnMes(ing, clave)));
    const gastado = total(gastos.filter((g) => mesDe(g.fecha) === clave));
    return { mes: clave, cobrado, gastado, disponible: cobrado - gastado };
  });
}
```

- [ ] **Paso 11: Correr todos los tests**

```bash
npm test
```

Esperado: los cuatro archivos en verde. Verificar también que `resumen.ts` no haya pasado de 165 líneas; si supera 170, avisarle a Jorge antes de seguir.

- [ ] **Paso 12: Instalar el componente Tabs**

```bash
npx shadcn add tabs
```

Esperado: crea `src/components/ui/tabs.tsx`. Agregarle como primera línea el comentario con su path, siguiendo la regla del proyecto:

```tsx
// src/components/ui/tabs.tsx
```

- [ ] **Paso 13: Agregar la acción `darDeBajaIngreso`**

En `src/app/(app)/_actions/ingresos.ts`, sumar al final del archivo:

```ts
/**
 * Cierra un ingreso recurrente: deja de contar a partir del mes siguiente al de
 * la baja. No borra nada, así el historial queda intacto.
 */
export async function darDeBajaIngreso(id: string): Promise<Resultado> {
  const hoy = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  // Fecha local, no UTC: con toISOString() después de las 21 h acá ya sería mañana.
  const fecha = `${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}`;

  const { error } = await createServerSupabaseClient()
    .from("ingresos")
    .update({ baja_el: fecha })
    .eq("id", id)
    .eq("recurrente", true)
    .is("baja_el", null);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
```

Y cambiar los `revalidatePath("/")` de `crearIngreso` y `borrarIngreso` por `revalidatePath("/", "layout")`, para que también se refresque `/ingresos`. Es el mismo patrón que ya usa `_actions/gastos.ts`.

- [ ] **Paso 14: Sumar el campo `recurrente` al formulario**

En `src/components/ingreso-form.tsx`, entre el campo de fecha y el bloque de error, agregar:

```tsx
<label className="flex items-start gap-3 rounded-lg border p-3">
  <input
    type="checkbox"
    name="recurrente"
    value="si"
    className="mt-0.5 size-4 accent-[var(--ingreso)]"
  />
  <span>
    <span className="text-sm font-medium">Se repite todos los meses</span>
    <span className="block text-xs text-muted-foreground">
      Un sueldo o un alquiler que cobrás. Cuenta cada mes hasta que lo des de baja.
    </span>
  </span>
</label>
```

Y en `_actions/ingresos.ts`, dentro de `leerIngreso`, leerlo y devolverlo:

```ts
const recurrente = form.get("recurrente") === "si";
```

```ts
return { datos: { concepto, monto, fecha, recurrente } };
```

- [ ] **Paso 15: Adaptar `ListaIngresos`**

En `src/components/lista-ingresos.tsx`: extender el tipo, mostrar el badge "Mensual" y ofrecer la baja cuando corresponde. El archivo completo queda:

```tsx
// src/components/lista-ingresos.tsx
"use client";

import { useState, useTransition } from "react";
import { CalendarOff, PiggyBank, Trash2 } from "lucide-react";
import { borrarIngreso, darDeBajaIngreso } from "@/app/(app)/_actions/ingresos";
import { enPesos } from "@/lib/formato";
import type { Ingreso } from "@/lib/ingresos";
import { Vacio } from "@/components/vacio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const enDia = (iso: string) => iso.split("-").reverse().join("/");

export function ListaIngresos({
  ingresos,
  vacio = "Todavía no cargaste ingresos",
}: {
  ingresos: Ingreso[];
  vacio?: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();

  if (!ingresos.length) {
    return (
      <Vacio
        icono={PiggyBank}
        titulo={vacio}
        detalle="Cargá tu sueldo o una venta y el disponible se calcula solo."
      />
    );
  }

  return (
    <>
      {error && <p className="pb-2 text-sm text-gasto">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingresos.map((ingreso) => {
            const { id, concepto, monto, fecha, recurrente, baja_el } = ingreso;
            // Solo un recurrente todavía abierto se puede dar de baja; el resto se borra.
            const puedeDarseDeBaja = recurrente && !baja_el;

            return (
              <TableRow key={id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {concepto}
                    {recurrente && (
                      <Badge variant="secondary" className="font-normal">
                        Mensual
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {baja_el ? `hasta ${enDia(baja_el)}` : enDia(fecha)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-ingreso">
                  {enPesos(Number(monto))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      puedeDarseDeBaja ? `Dar de baja ${concepto}` : `Borrar ${concepto}`
                    }
                    title={puedeDarseDeBaja ? "Dar de baja" : "Borrar"}
                    disabled={pendiente}
                    onClick={() =>
                      iniciar(async () => {
                        const r = puedeDarseDeBaja
                          ? await darDeBajaIngreso(id)
                          : await borrarIngreso(id);
                        setError(r.error);
                      })
                    }
                  >
                    {puedeDarseDeBaja ? (
                      <CalendarOff className="text-muted-foreground" />
                    ) : (
                      <Trash2 className="text-gasto" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
```

Nota: el `export type Ingreso` que vivía acá se elimina; ahora viene de `@/lib/ingresos`. Buscar con `grep -rn "from \"@/components/lista-ingresos\"" src/` y arreglar cualquier import roto.

- [ ] **Paso 16: Crear la página de Ingresos**

Crear `src/app/(app)/ingresos/page.tsx`:

```tsx
// src/app/(app)/ingresos/page.tsx
import { PiggyBank } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { esActivo, historialPorMes, type Ingreso } from "@/lib/ingresos";
import { mesDe, rangoDelMes, total } from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";
import { Vacio } from "@/components/vacio";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "agosto 2026" a partir de una clave "2026-08". */
const nombreDeMes = (clave: string) => {
  const [anio, mes] = clave.split("-").map(Number);
  return `${MESES[mes - 1]} ${anio}`;
};

export default async function IngresosPage() {
  // Mes en curso en hora local: `rangoDelMes` no usa UTC, así que después de las
  // 21 h no salta al día siguiente como haría toISOString().
  const mesActual = mesDe(rangoDelMes(new Date()).desde);

  const { data, error } = await createServerSupabaseClient()
    .from("ingresos")
    .select("id, concepto, monto, fecha, recurrente, baja_el")
    .order("fecha", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los ingresos: ${error.message}`);

  const ingresos = (data ?? []) as Ingreso[];
  const activos = ingresos.filter((i) => esActivo(i, mesActual));
  const historial = ingresos.filter((i) => !esActivo(i, mesActual));

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ingresos</h1>
          <p className="text-sm text-muted-foreground">
            Total activo: {enPesos(total(activos))}
          </p>
        </div>
        <IngresoForm />
      </div>

      <Tabs defaultValue="activos">
        <TabsList>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <Card>
            {activos.length ? (
              <CardContent>
                <ListaIngresos ingresos={activos} />
              </CardContent>
            ) : (
              <Vacio
                icono={PiggyBank}
                titulo="Sin ingresos activos"
                detalle="Registrá tu sueldo u otros ingresos"
              >
                <IngresoForm etiqueta="Agregar ingreso" />
              </Vacio>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4 flex flex-col gap-4">
          {historial.length ? (
            historialPorMes(historial).map(({ mes, ingresos: delMes }) => (
              <Card key={mes}>
                <CardHeader className="flex items-center justify-between gap-2">
                  <CardTitle className="capitalize">{nombreDeMes(mes)}</CardTitle>
                  <span className="tabular-nums text-muted-foreground">
                    {enPesos(total(delMes))}
                  </span>
                </CardHeader>
                <CardContent>
                  <ListaIngresos ingresos={delMes} />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <Vacio
                icono={PiggyBank}
                titulo="Todavía no hay historial"
                detalle="Acá van a quedar los ingresos de meses cerrados y los recurrentes que des de baja."
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
```

- [ ] **Paso 17: Dar a `IngresoForm` una etiqueta configurable**

El paso anterior usa `<IngresoForm etiqueta="Agregar ingreso" />`. En `src/components/ingreso-form.tsx`, cambiar la firma y el botón:

```tsx
export function IngresoForm({ etiqueta = "Cargar ingreso" }: { etiqueta?: string }) {
```

```tsx
        <Button>
          <Plus />
          {etiqueta}
        </Button>
```

- [ ] **Paso 18: Crear el esqueleto de carga**

Crear `src/app/(app)/ingresos/loading.tsx`:

```tsx
// src/app/(app)/ingresos/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoCard, EsqueletoTitulo } from "@/components/esqueleto";

/** Carga de Ingresos: el encabezado con el total, las dos pestañas y la lista. */
export default function CargandoIngresos() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <EsqueletoTitulo />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <EsqueletoCard filas={4} tono="ingreso" />
    </div>
  );
}
```

- [ ] **Paso 18 bis: Actualizar la guía rápida**

En `src/lib/pasos-guia.ts`, el paso "Dashboard" todavía dice "Cargá tu sueldo o
una venta con el botón de arriba a la derecha", que deja de ser cierto cuando el
botón se muda a Ingresos. Cambiar ese cierre por "Los ingresos se cargan desde
la sección Ingresos" y sumar un paso propio después del de Dashboard:

```ts
  {
    icono: PiggyBank,
    titulo: "Ingresos",
    detalle:
      "Cargá tu sueldo, un alquiler que cobrás o una venta suelta. Si se repite todos los meses, tildá la opción y cuenta solo hasta que lo des de baja. Los que se cierran quedan en el historial.",
  },
```

Importar `PiggyBank` de `lucide-react` en ese archivo.

- [ ] **Paso 19: Sumar Ingresos al sidebar y recolorear Tarjetas**

En `src/components/app-sidebar.tsx`, importar `PiggyBank` de `lucide-react` y reemplazar `secciones`:

```tsx
const secciones = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-chart-1" },
  { href: "/ingresos", label: "Ingresos", icon: PiggyBank, color: "text-chart-2" },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard, color: "text-chart-4" },
  { href: "/consumos", label: "Consumos", icon: ShoppingBasket, color: "text-chart-3" },
];
```

Tarjetas pasa de `chart-2` (esmeralda) a `chart-4` (rosa) para que Ingresos se quede con el esmeralda, que es el color de ingreso en toda la app.

- [ ] **Paso 20: Sacar el formulario del Dashboard y adaptar su consulta**

En `src/app/(app)/page.tsx`:

Quitar el import de `IngresoForm` y el `<IngresoForm />` del encabezado, que queda:

```tsx
<h1 className="text-2xl font-semibold">Dashboard</h1>
```

sin el `div` contenedor con `justify-between`.

Cambiar la consulta de ingresos para que traiga también los recurrentes de cualquier fecha:

```tsx
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha, recurrente, baja_el")
      .or(`recurrente.eq.true,and(fecha.gte.${desde},fecha.lte.${hasta})`)
      .order("fecha", { ascending: false }),
```

Y cambiar el cálculo de los ingresos del mes, que ya no puede filtrar por fecha:

```tsx
import { ingresosDeMes } from "@/lib/ingresos";
```

```tsx
  const ingresosDelMes = ingresosDeMes(ingresos, mesDe(mesActual.desde));
  const gastosDelMes = delMes(gastos);
```

`delMes` sigue existiendo solo para los gastos; ajustar su tipo si TypeScript se queja. Importar `mesDe` desde `@/lib/resumen` junto a las demás.

- [ ] **Paso 21: Verificar**

```bash
npm run lint
npm test
npm run build
```

Esperado: los tres en verde.

- [ ] **Paso 22: Probar contra datos reales**

```bash
npm run dev
```

Recorrido manual, en este orden:

1. Ir a `/ingresos`: sin datos debe verse "Sin ingresos activos" con el botón "Agregar ingreso".
2. Cargar un ingreso **sin** tildar "Se repite todos los meses". Aparece en Activos, sin badge, con ícono de tacho.
3. Cargar uno **con** el tilde. Aparece con badge "Mensual" e ícono de calendario tachado.
4. "Total activo" suma los dos.
5. Ir al Dashboard: la ecuación del mes incluye ambos, y el gráfico de evolución muestra el recurrente en los meses anteriores también.
6. Volver a `/ingresos`, dar de baja el recurrente: pasa a Historial bajo el mes actual, con "hasta dd/mm/aaaa".
7. El Dashboard deja de contarlo a partir del mes siguiente (el mes de la baja lo sigue contando, es lo esperado).

**Prestar atención especial al `.or()` de Supabase**: si la sintaxis anidada `and(...)` falla, el error llega como excepción de la página, no en silencio. Si falla, reemplazarlo por dos consultas separadas y unir los resultados en JS, y avisarle a Jorge del cambio.

- [ ] **Paso 23: Checkpoint con Jorge**

Mostrar `/ingresos` con las dos pestañas y el Dashboard con el recurrente contando. Esperar OK antes de la Tarea 3. No commitear.

---

### Tarea 3: Movimientos mensuales en el Dashboard

**Archivos:**
- Crear: `src/components/movimientos-mensuales.tsx`
- Modificar: `src/app/(app)/page.tsx`
- Modificar: `src/app/(app)/loading.tsx`

**Interfaces:**
- Consume: `ingresosDeMes`, `type Ingreso` de `@/lib/ingresos`; `IconoCategoria` de `@/components/categorias`; `enPesos` de `@/lib/formato`.
- Produce: `<MovimientosMensuales ingresos={...} gastos={...} tarjetas={...} />`, componente de solo lectura. Ninguna tarea posterior depende de él.

Sin test unitario: es presentación pura, la lógica de vigencia que podría romperse ya está cubierta en `ingresos.test.ts`. El ordenamiento se verifica en el recorrido manual.

- [ ] **Paso 1: Crear el componente**

Crear `src/components/movimientos-mensuales.tsx`:

```tsx
// src/components/movimientos-mensuales.tsx
import { PiggyBank } from "lucide-react";
import { enPesos } from "@/lib/formato";
import type { Ingreso } from "@/lib/ingresos";
import { IconoCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";

export type GastoDelMes = {
  id: string;
  descripcion: string;
  categoria: string | null;
  monto: number | string;
  fecha: string;
  tarjeta_id: string | null;
};

type Fila = {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  monto: number;
  esIngreso: boolean;
  categoria: string | null;
};

const enDia = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);

/**
 * Todo lo que pasó en el mes, ingresos y gastos juntos, del más reciente al más
 * viejo. Es solo lectura: se carga desde Ingresos, Consumos y Tarjetas.
 */
export function MovimientosMensuales({
  ingresos,
  gastos,
  tarjetas,
}: {
  ingresos: Ingreso[];
  gastos: GastoDelMes[];
  tarjetas: { id: string; marca: string; banco: string | null; ultimos4: string }[];
}) {
  const nombreDeTarjeta = new Map(
    tarjetas.map((t) => [t.id, `${t.banco ?? t.marca} ····${t.ultimos4}`]),
  );

  const filas: Fila[] = [
    ...ingresos.map((i) => ({
      id: `ingreso-${i.id}`,
      titulo: i.concepto,
      detalle: i.recurrente ? "Ingreso mensual" : "Ingreso",
      fecha: i.fecha,
      monto: Number(i.monto),
      esIngreso: true,
      categoria: null,
    })),
    ...gastos.map((g) => ({
      id: `gasto-${g.id}`,
      titulo: g.descripcion,
      detalle:
        (g.tarjeta_id && nombreDeTarjeta.get(g.tarjeta_id)) ||
        g.categoria?.trim() ||
        "Otros",
      fecha: g.fecha,
      monto: Number(g.monto),
      esIngreso: false,
      categoria: g.categoria,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (!filas.length) {
    return (
      <Vacio
        icono={PiggyBank}
        titulo="Sin movimientos este mes"
        detalle="Cargá un ingreso en Ingresos o un gasto en Consumos y van a aparecer acá."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {filas.map((f) => (
        <li key={f.id} className="flex items-center gap-3 py-2.5">
          {f.esIngreso ? (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ingreso/15 text-ingreso"
            >
              <PiggyBank className="size-4" />
            </span>
          ) : (
            <IconoCategoria categoria={f.categoria} />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{f.titulo}</p>
            <p className="truncate text-xs text-muted-foreground">{f.detalle}</p>
          </div>

          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {enDia(f.fecha)}
          </span>

          <span
            className={`w-28 shrink-0 text-right font-semibold tabular-nums ${
              f.esIngreso ? "text-ingreso" : "text-gasto"
            }`}
          >
            {f.esIngreso ? "+" : "−"} {enPesos(f.monto)}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Paso 2: Traer los datos que faltan en el Dashboard**

En `src/app/(app)/page.tsx`, la consulta de gastos hoy no trae `id`, `descripcion` ni `tarjeta_id`, y no hay consulta de tarjetas. Reemplazar el `Promise.all` por:

```tsx
  const [ing, gas, tar] = await Promise.all([
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha, recurrente, baja_el")
      .or(`recurrente.eq.true,and(fecha.gte.${desde},fecha.lte.${hasta})`)
      .order("fecha", { ascending: false }),
    supabase
      .from("gastos")
      .select(
        "id, descripcion, monto, categoria, fecha, tarjeta_id, cuota_actual, cuotas_total",
      )
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase.from("tarjetas").select("id, marca, banco, ultimos4"),
  ]);

  // Sin esto, un fallo de RLS o de red se vería como "$ 0" y parecería un mes sin movimientos.
  const falla = ing.error ?? gas.error ?? tar.error;
  if (falla) throw new Error(`No se pudieron leer los movimientos: ${falla.message}`);
```

- [ ] **Paso 3: Reemplazar la card de ingresos**

En el mismo archivo, cambiar el import de `ListaIngresos` por el del componente nuevo:

```tsx
import { MovimientosMensuales } from "@/components/movimientos-mensuales";
```

y reemplazar la última `<Card>` por:

```tsx
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Movimientos mensuales</CardTitle>
          <span
            className={`tabular-nums font-semibold ${
              actual.disponible < 0 ? "text-gasto" : "text-ingreso"
            }`}
          >
            {actual.disponible < 0 ? "−" : "+"} {enPesos(Math.abs(actual.disponible))}
          </span>
        </CardHeader>
        <CardContent>
          <MovimientosMensuales
            ingresos={ingresosDelMes}
            gastos={gastosDelMes}
            tarjetas={tar.data ?? []}
          />
        </CardContent>
      </Card>
```

- [ ] **Paso 4: Actualizar el esqueleto del Dashboard**

En `src/app/(app)/loading.tsx`, la última línea del componente pasa de `tono="ingreso"` a `tono="neutro"`, porque ahora la lista mezcla ingresos y gastos:

```tsx
      <EsqueletoCard filas={5} tono="neutro" />
```

- [ ] **Paso 5: Verificar**

```bash
npm run lint
npm test
npm run build
```

Esperado: los tres en verde. Revisar que `src/app/(app)/page.tsx` siga por debajo de 150 líneas; si no, avisarle a Jorge.

- [ ] **Paso 6: Probar contra datos reales**

```bash
npm run dev
```

En el Dashboard: la card se llama "Movimientos mensuales", muestra ingresos en verde con `+` y gastos en rojo con `−`, ordenados por fecha de más nuevo a más viejo. Un gasto de tarjeta muestra el banco y los últimos cuatro dígitos como subtítulo. El total de la derecha es el neto y se pone rojo si es negativo. Sin datos del mes, aparece "Sin movimientos este mes".

- [ ] **Paso 7: Checkpoint con Jorge**

Esperar OK antes de la Tarea 4. No commitear.

---

### Tarea 4: Consumos con ocho categorías

**Archivos:**
- Modificar: `src/lib/catalogos.ts:24-29`
- Modificar: `src/components/categorias.tsx`
- Modificar: `src/app/globals.css`
- Modificar: `src/app/(app)/consumos/page.tsx`
- Modificar: `src/components/gasto-form.tsx`
- Modificar: `src/lib/resumen.test.ts` (si el test de orden de categorías se rompe)

**Interfaces:**
- Consume: `CATEGORIAS` de `@/lib/catalogos`, ya usado por `gasto-form.tsx`, `filtro-categorias.tsx` y `resumen.ts`.
- Produce: `GastoForm` pasa a aceptar `children` como trigger propio: `<GastoForm>{trigger}</GastoForm>`. Sin `children` renderiza el botón de siempre.

- [ ] **Paso 1: Ampliar el catálogo**

En `src/lib/catalogos.ts`, reemplazar `CATEGORIAS`:

```ts
/** "Otros" va último a propósito: es el cajón de sastre en los listados. */
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

- [ ] **Paso 2: Correr los tests para ver si el orden se rompió**

```bash
npm test
```

`resumen.test.ts` prueba `agruparPorCategoria` contra el orden de `CATEGORIAS`. El caso de las líneas 60-69 usa Suscripciones, Transporte, Otros y una desconocida: ese orden relativo no cambia, así que debería seguir pasando. Si falla, actualizar el `deepEqual` esperado al orden nuevo y volver a correr.

- [ ] **Paso 3: Sumar los colores a la paleta**

En `src/app/globals.css`, agregar los alias en el bloque `@theme`, junto a los `--color-chart-N` existentes (líneas 21-25):

```css
  --color-chart-9: var(--chart-9);
  --color-chart-8: var(--chart-8);
  --color-chart-7: var(--chart-7);
  --color-chart-6: var(--chart-6);
```

En el bloque de tema claro, después de `--chart-5` (línea 78):

```css
  --chart-6: #8b5cf6;
  --chart-7: #f97316;
  --chart-8: #3b82f6;
  --chart-9: #14b8a6;
```

En el bloque `.dark`, después de `--chart-5` (línea 115):

```css
  --chart-6: #a78bfa;
  --chart-7: #fb923c;
  --chart-8: #60a5fa;
  --chart-9: #2dd4bf;
```

`--chart-1` (índigo) queda reservado para la marca y no se asigna a ninguna categoría: en la torta se confundiría con el fondo de la app.

- [ ] **Paso 4: Sumar los íconos y colores de las categorías nuevas**

En `src/components/categorias.tsx`, cambiar el import y el mapa:

```tsx
import {
  Bus,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Package,
  ShoppingCart,
  Tv,
  type LucideIcon,
} from "lucide-react";
```

```tsx
const ESTILOS: Record<string, Estilo> = {
  Suscripciones: { icono: Tv, color: "var(--chart-4)" },
  Supermercado: { icono: ShoppingCart, color: "var(--chart-2)" },
  Transporte: { icono: Bus, color: "var(--chart-3)" },
  Servicios: { icono: Lightbulb, color: "var(--chart-6)" },
  Entretenimiento: { icono: Gamepad2, color: "var(--chart-7)" },
  Educación: { icono: GraduationCap, color: "var(--chart-8)" },
  Salud: { icono: HeartPulse, color: "var(--chart-9)" },
  Otros: { icono: Package, color: "var(--chart-5)" },
};
```

- [ ] **Paso 5: Permitir un trigger propio en `GastoForm`**

En `src/components/gasto-form.tsx`, cambiar la firma y el trigger:

```tsx
/**
 * Con `tarjetaId` el gasto es de crédito: suma cuotas y propio/ajeno.
 * `children` reemplaza el botón que abre el diálogo, para el flotante y el
 * del estado vacío.
 */
export function GastoForm({
  tarjetaId,
  children,
}: {
  tarjetaId?: string;
  children?: React.ReactNode;
}) {
```

```tsx
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus />
            Cargar gasto
          </Button>
        )}
      </DialogTrigger>
```

`DialogTrigger asChild` necesita exactamente un elemento como hijo, así que `children` tiene que ser un único botón.

- [ ] **Paso 6: Reescribir la página de Consumos**

Reemplazar `src/app/(app)/consumos/page.tsx` por:

```tsx
// src/app/(app)/consumos/page.tsx
import { Plus, ShoppingBasket } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { rangoDelMes, total } from "@/lib/resumen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiltroCategorias } from "@/components/filtro-categorias";
import { GastoForm } from "@/components/gasto-form";
import { Vacio } from "@/components/vacio";

export default async function ConsumosPage() {
  const { desde, hasta } = rangoDelMes(new Date());

  // tarjeta_id null = gasto suelto. Los de crédito viven en el detalle de su tarjeta.
  const { data, error } = await createServerSupabaseClient()
    .from("gastos")
    .select(
      "id, descripcion, categoria, monto, fecha, es_propio, medio_pago, cuota_actual, cuotas_total",
    )
    .is("tarjeta_id", null)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los consumos: ${error.message}`);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Consumos</h1>
        <p className="text-sm text-muted-foreground">
          Este mes: {enPesos(total(data ?? []))}
        </p>
      </div>

      {data?.length ? (
        <>
          <FiltroCategorias gastos={data} />

          {/* Con la lista vacía no se renderiza: el botón del estado vacío ya
              cumple esa función y dos iguales en pantalla confunden. */}
          <GastoForm>
            <Button
              size="icon"
              aria-label="Cargar gasto"
              className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg"
            >
              <Plus className="size-6" />
            </Button>
          </GastoForm>
        </>
      ) : (
        <Card>
          <Vacio
            icono={ShoppingBasket}
            titulo="Sin gastos registrados"
            detalle="Registrá tus gastos para ver en qué estás gastando"
          >
            <GastoForm>
              <Button>
                <Plus />
                Agregar
              </Button>
            </GastoForm>
          </Vacio>
        </Card>
      )}
    </>
  );
}
```

- [ ] **Paso 7: Verificar**

```bash
npm run lint
npm test
npm run build
```

Esperado: los tres en verde.

- [ ] **Paso 8: Probar contra datos reales**

```bash
npm run dev
```

En `/consumos`:

1. Sin gastos: se ve "Sin gastos registrados", "Registrá tus gastos para ver en qué estás gastando" y el botón "Agregar". **No** hay botón flotante.
2. Cargar un gasto con categoría "Salud". Aparece el flotante abajo a la derecha y desaparece el estado vacío.
3. Los chips muestran las 8 categorías en dos filas de cuatro, cada una con su ícono y su color.
4. Alternar tema claro y oscuro: los cuatro colores nuevos tienen que leerse bien en los dos.
5. En el Dashboard, la torta de "En qué se va" muestra Salud con su color propio, distinto del resto.
6. El botón flotante no tapa contenido al hacer scroll hasta el final de la lista.

- [ ] **Paso 9: Checkpoint con Jorge**

Esperar OK antes de la Tarea 5. No commitear.

---

### Tarea 5: Carrusel de tarjetas en mobile

**Archivos:**
- Crear: `src/components/carrusel-tarjetas.tsx`
- Modificar: `src/app/(app)/tarjetas/page.tsx:50-60`

**Interfaces:**
- Consume: `TarjetaVisual` y `type Tarjeta` de `@/components/tarjeta-visual`.
- Produce: `<CarruselTarjetas>{children}</CarruselTarjetas>`, donde cada hijo es una `<TarjetaVisual>` ya renderizada en el server. Nada depende de él.

`TarjetaVisual` se sigue renderizando en el server y se pasa como `children`: el carrusel solo necesita ser cliente para el observer, no para la tarjeta.

- [ ] **Paso 1: Crear el carrusel**

Crear `src/components/carrusel-tarjetas.tsx`:

```tsx
// src/components/carrusel-tarjetas.tsx
"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * Carrusel horizontal con scroll-snap nativo, al estilo de las billeteras: la
 * tarjeta del centro a escala completa y las vecinas más chicas y difuminadas.
 * El scroll lo maneja el navegador; el observer solo sirve para saber cuál está
 * enfocada y pintar los puntitos.
 */
export function CarruselTarjetas({ children }: { children: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const [enfocada, setEnfocada] = useState(0);
  const tarjetas = Children.toArray(children);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const indice = Number((entrada.target as HTMLElement).dataset.indice);
          if (Number.isInteger(indice)) setEnfocada(indice);
        }
      },
      // root = la pista, no el viewport: threshold alto para que solo dispare la
      // que está realmente centrada.
      { root: nodo, threshold: 0.75 },
    );

    for (const hijo of nodo.children) observer.observe(hijo);
    return () => observer.disconnect();
  }, [tarjetas.length]);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={pista}
        // px-[15%] deja asomar las vecinas a los costados. scrollbar-none no
        // existe en Tailwind: se oculta con las utilidades del propio navegador.
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[15%] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tarjetas.map((tarjeta, i) => (
          <div
            key={i}
            data-indice={i}
            className={`w-[70%] shrink-0 snap-center transition-all duration-300 ${
              i === enfocada ? "scale-100 opacity-100 blur-0" : "scale-90 opacity-60 blur-[2px]"
            }`}
          >
            {tarjeta}
          </div>
        ))}
      </div>

      {tarjetas.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {tarjetas.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === enfocada ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Paso 2: Usarlo en mobile y dejar la grilla en desktop**

En `src/app/(app)/tarjetas/page.tsx`, importar el componente:

```tsx
import { CarruselTarjetas } from "@/components/carrusel-tarjetas";
```

y reemplazar el bloque de la grilla (líneas 48-60) por:

```tsx
      {data?.length ? (
        <>
          {/* Mobile: carrusel. El scroll horizontal resuelve el apilado. */}
          <div className="md:hidden">
            <CarruselTarjetas>
              {data.map((t) => (
                <TarjetaVisual
                  key={t.id}
                  tarjeta={t}
                  gastado={porTarjeta.get(t.id)?.gastado ?? 0}
                  cantidad={porTarjeta.get(t.id)?.cantidad ?? 0}
                />
              ))}
            </CarruselTarjetas>
          </div>

          {/* Desktop: auto-fill, las tarjetas rondan los 272-340px y entran las
              que quepan. */}
          <div className="hidden gap-4 md:grid [grid-template-columns:repeat(auto-fill,minmax(17rem,1fr))]">
            {data.map((t) => (
              <TarjetaVisual
                key={t.id}
                tarjeta={t}
                gastado={porTarjeta.get(t.id)?.gastado ?? 0}
                cantidad={porTarjeta.get(t.id)?.cantidad ?? 0}
              />
            ))}
          </div>
        </>
      ) : (
```

El `minmax(min(100%,17rem),1fr)` del original ya no necesita el `min()`: en `md` en adelante siempre hay lugar para 17rem.

- [ ] **Paso 3: Verificar**

```bash
npm run lint
npm test
npm run build
```

Esperado: los tres en verde.

- [ ] **Paso 4: Probar en mobile y desktop**

```bash
npm run dev
```

Con al menos tres tarjetas cargadas:

1. En desktop (ancho ≥ 768px): grilla como siempre, sin carrusel ni puntitos.
2. Achicar a ancho de teléfono: aparece el carrusel. La tarjeta del centro se ve nítida y a escala completa; las de los costados, más chicas, con opacidad baja y desenfocadas.
3. Arrastrar de costado: el snap centra la siguiente y el puntito activo se alarga.
4. Tocar la tarjeta centrada entra a `/tarjetas/[id]`.
5. El botón de borrar de la tarjeta centrada sigue funcionando y no dispara la navegación.
6. Con una sola tarjeta no aparecen los puntitos.
7. No hay barra de scroll horizontal visible en la pista.

- [ ] **Paso 5: Checkpoint final con Jorge**

Repasar las cinco etapas juntas: Dashboard, Ingresos, Movimientos, Consumos y Tarjetas. Preguntarle a Jorge si quiere commitear ahora y con qué mensaje. No commitear sin que lo pida.

---

## Riesgos conocidos

- **`.or()` de Supabase con `and(...)` anidado** (Tarea 2, pasos 20 y 22, y Tarea 3, paso 2). Si falla, el plan B es hacer dos consultas —una por ventana de fechas y otra por `recurrente.eq.true`— y unirlas en JS descartando duplicados por `id`.
- **`src/lib/resumen.ts` está en 163 líneas**, por encima del límite de 150 de CLAUDE.md. La Tarea 2 le suma un import y le saca una línea, así que queda igual de largo. La lógica nueva va a `ingresos.ts` justamente para no empeorarlo. Si alguna tarea lo empuja más allá de 170, avisar antes de seguir.
- **La migración `0003` es aditiva**: los ingresos que ya existen quedan con `recurrente = false`, o sea puntuales, exactamente como se comportan hoy. No hay pérdida ni cambio retroactivo.
- **El botón flotante de Consumos puede tapar la última fila** en pantallas cortas. Si pasa, sumar `pb-24` al contenedor de la lista.
