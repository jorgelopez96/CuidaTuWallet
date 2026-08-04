// src/lib/resumen.ts

import { CATEGORIAS } from "@/lib/catalogos";

export type Monto = { monto: number | string };

export function total(items: Monto[]): number {
  return items.reduce((suma, { monto }) => suma + Number(monto), 0);
}

export function resumenMensual(ingresos: Monto[], gastos: Monto[]) {
  const cobrado = total(ingresos);
  const gastado = total(gastos);
  return { cobrado, gastado, disponible: cobrado - gastado };
}

export type EnCuotas = Monto & {
  cuota_actual: number | null;
  cuotas_total: number | null;
};

/**
 * Lo que resta pagar de una compra en cuotas: las cuotas que faltan por el
 * valor de cada una. Devuelve null si el gasto no está en cuotas, y 0 cuando
 * se está pagando la última.
 */
export function faltaPagar({ monto, cuota_actual, cuotas_total }: EnCuotas): number | null {
  if (!cuotas_total || !cuota_actual) return null;
  return Math.max(0, cuotas_total - cuota_actual) * Number(monto);
}

/** Separa lo que gastaste vos de lo que gastó un tercero al que le prestaste la tarjeta. */
export function totalesPorTitular(gastos: (Monto & { es_propio: boolean })[]) {
  return {
    propios: total(gastos.filter((g) => g.es_propio)),
    ajenos: total(gastos.filter((g) => !g.es_propio)),
  };
}

/** Gastos agrupados por categoría, de mayor a menor. Sin categoría cae en "Otros". */
export function porCategoria(gastos: (Monto & { categoria?: string | null })[]) {
  const suma = new Map<string, number>();
  for (const { categoria, monto } of gastos) {
    const clave = categoria?.trim() || "Otros";
    suma.set(clave, (suma.get(clave) ?? 0) + Number(monto));
  }
  return [...suma]
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto);
}

/**
 * Agrupa gastos por categoría respetando el orden de CATEGORIAS, así "Otros"
 * queda último. Solo devuelve las categorías que tienen algo.
 */
export function agruparPorCategoria<T extends { categoria?: string | null }>(
  gastos: T[],
): { categoria: string; gastos: T[] }[] {
  const orden = [...CATEGORIAS] as string[];

  return [...new Set(gastos.map((g) => g.categoria?.trim() || "Otros"))]
    .sort((a, b) => {
      const ia = orden.indexOf(a);
      const ib = orden.indexOf(b);
      // Las categorías desconocidas (datos viejos) van al final, alfabéticas.
      return (ia < 0 ? orden.length : ia) - (ib < 0 ? orden.length : ib) ||
        a.localeCompare(b);
    })
    .map((categoria) => ({
      categoria,
      gastos: gastos.filter((g) => (g.categoria?.trim() || "Otros") === categoria),
    }));
}

/**
 * Agrupa por fecha, del día más reciente al más viejo. Espera las fechas en
 * ISO (yyyy-mm-dd), que ordenan bien como texto.
 */
export function agruparPorDia<T extends { fecha: string }>(
  gastos: T[],
): { fecha: string; gastos: T[] }[] {
  return [...new Set(gastos.map((g) => g.fecha))]
    .sort()
    .reverse()
    .map((fecha) => ({ fecha, gastos: gastos.filter((g) => g.fecha === fecha) }));
}

const dosDigitos = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) =>
  `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;

/** Clave de mes "yyyy-mm" a partir de una fecha ISO. */
export const mesDe = (fechaISO: string) => fechaISO.slice(0, 7);

/**
 * Ventana que cubre los últimos `meses` meses contando el actual, del primer
 * día del más viejo al último día del actual. Para una sola consulta a la base.
 */
export function ventanaDeMeses(fecha: Date, meses: number) {
  const y = fecha.getFullYear();
  const m = fecha.getMonth();
  return {
    desde: iso(new Date(y, m - (meses - 1), 1)),
    hasta: iso(new Date(y, m + 1, 0)),
  };
}

export type ConFecha = Monto & { fecha: string };

/**
 * Serie de los últimos `meses` meses, del más viejo al más nuevo. Incluye los
 * meses sin movimientos en cero: si no, el gráfico miente sobre la tendencia.
 */
export function serieMensual(
  fecha: Date,
  meses: number,
  ingresos: ConFecha[],
  gastos: ConFecha[],
) {
  const y = fecha.getFullYear();
  const m = fecha.getMonth();

  return Array.from({ length: meses }, (_, i) => {
    const cursor = new Date(y, m - (meses - 1) + i, 1);
    const clave = `${cursor.getFullYear()}-${dosDigitos(cursor.getMonth() + 1)}`;
    const delMes = <T extends ConFecha>(xs: T[]) => xs.filter((x) => mesDe(x.fecha) === clave);

    const cobrado = total(delMes(ingresos));
    const gastado = total(delMes(gastos));
    return { mes: clave, cobrado, gastado, disponible: cobrado - gastado };
  });
}

export type CuotaProyectable = EnCuotas & { fecha: string };

/**
 * Lo que ya está comprometido en cuotas, mes a mes, empezando por el actual.
 *
 * Mira hacia adelante y no hacia atrás a propósito: una cuenta recién creada no
 * tiene historial, pero sí tiene cuotas por pagar desde el primer resumen que
 * importás. Cada cuota que falta cae un mes después de la anterior.
 */
export function proyeccionDeCuotas(
  fecha: Date,
  meses: number,
  gastos: CuotaProyectable[],
) {
  const base = fecha.getFullYear() * 12 + fecha.getMonth();
  const acumulado = new Map<number, number>();

  for (const g of gastos) {
    if (!g.cuotas_total || !g.cuota_actual) continue;

    const [anio, mes] = g.fecha.split("-").map(Number);
    const indice = anio * 12 + (mes - 1);
    const restantes = g.cuotas_total - g.cuota_actual;

    // k = 0 es la cuota de este resumen; de ahí en adelante, una por mes.
    for (let k = 0; k <= restantes; k++) {
      const offset = indice + k - base;
      if (offset < 0 || offset >= meses) continue;
      acumulado.set(offset, (acumulado.get(offset) ?? 0) + Number(g.monto));
    }
  }

  return Array.from({ length: meses }, (_, i) => {
    const cursor = new Date(fecha.getFullYear(), fecha.getMonth() + i, 1);
    return {
      mes: `${cursor.getFullYear()}-${dosDigitos(cursor.getMonth() + 1)}`,
      monto: acumulado.get(i) ?? 0,
    };
  });
}

/**
 * Variación porcentual contra el mes anterior. Devuelve null cuando no hay
 * base de comparación: dividir por cero daría Infinity y "▲∞%" no dice nada.
 */
export function variacion(actual: number, anterior: number): number | null {
  if (!anterior) return null;
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}

/** Primer y último día del mes de `fecha`, en ISO (yyyy-mm-dd) para filtrar en Postgres. */
export function rangoDelMes(fecha: Date) {
  const y = fecha.getFullYear();
  const m = fecha.getMonth();
  return { desde: iso(new Date(y, m, 1)), hasta: iso(new Date(y, m + 1, 0)) };
}
