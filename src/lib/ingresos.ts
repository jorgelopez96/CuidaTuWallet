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
