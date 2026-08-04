// src/lib/resumen-parser.ts
// Lee el texto de un resumen de tarjeta y saca los consumos.
// Hay un formato reconocido a medida (Galicia VISA/Amex) y uno genérico de
// respaldo. Lo que detecta se muestra para revisar antes de guardar: nunca
// inserta a ciegas, porque cada banco arma el resumen distinto.

export type GastoDetectado = {
  fechaCompra: string; // yyyy-mm-dd — cuándo se hizo la compra
  descripcion: string;
  monto: number;
  cuota_actual: number | null;
  cuotas_total: number | null;
};

// 30-07-25 * CODERHOUSE 12/12 000575 48.563,33
const GALICIA =
  /^(\d{2})-(\d{2})-(\d{2})\s+\*?\s*(.+?)\s+(?:(\d{2})\/(\d{2})\s+)?(\d{6})\s+(-?[\d.]+,\d{2})(?:\s+(-?[\d.]+,\d{2}))?$/;

const FECHA = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
const MONTO_FINAL = /(-?\d{1,3}(?:\.\d{3})*,\d{2})\s*$/;
const CUOTA = /\b(?:C\.?|CUOTA\s*)?(\d{1,2})\s*\/\s*(\d{1,2})\b/i;

const dosDigitos = (n: number) => String(n).padStart(2, "0");
const aNumero = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));

function aISO(dia: string, mes: string, anio: string) {
  const a = anio.length === 2 ? 2000 + Number(anio) : Number(anio);
  const d = Number(dia);
  const m = Number(mes);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${a}-${dosDigitos(m)}-${dosDigitos(d)}`;
}

function lineaGalicia(linea: string): GastoDetectado | null {
  const m = linea.match(GALICIA);
  if (!m) return null;

  const [, dia, mes, anio, descripcion, cuota, cuotas, , pesos] = m;
  const fechaCompra = aISO(dia, mes, anio);
  const monto = aNumero(pesos);
  if (!fechaCompra || !Number.isFinite(monto) || monto <= 0) return null;

  return {
    fechaCompra,
    descripcion: descripcion.trim(),
    monto,
    cuota_actual: cuota ? Number(cuota) : null,
    cuotas_total: cuotas ? Number(cuotas) : null,
  };
}

function lineaGenerica(linea: string): GastoDetectado | null {
  const fechaCruda = linea.match(FECHA);
  const montoCrudo = linea.match(MONTO_FINAL);
  if (!fechaCruda || !montoCrudo) return null;

  const fechaCompra = aISO(fechaCruda[1], fechaCruda[2], fechaCruda[3]);
  const monto = aNumero(montoCrudo[1]);
  // Los negativos son pagos y ajustes a favor, no consumos.
  if (!fechaCompra || !Number.isFinite(monto) || monto <= 0) return null;

  const resto = linea.slice(fechaCruda.index! + fechaCruda[0].length, montoCrudo.index);
  const cuota = resto.match(CUOTA);
  const descripcion = resto
    .replace(CUOTA, " ")
    .replace(/[\s.*-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!descripcion) return null;

  return {
    fechaCompra,
    descripcion,
    monto,
    cuota_actual: cuota ? Number(cuota[1]) : null,
    cuotas_total: cuota ? Number(cuota[2]) : null,
  };
}

export function parsearResumen(texto: string): GastoDetectado[] {
  const detectados: GastoDetectado[] = [];

  for (const cruda of texto.split(/\r?\n/)) {
    const linea = cruda.trim();
    if (!linea) continue;
    const gasto = lineaGalicia(linea) ?? lineaGenerica(linea);
    if (gasto) detectados.push(gasto);
  }

  return detectados;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
// 25-Jun-26 06-Jul-26 23-Jul-26 03-Ago-26 20-Ago-26 01-Sep-26
const FECHA_LARGA = /\b(\d{2})-([A-Za-zÁÉÍÓÚáéíóú]{3})-(\d{2})\b/g;
// TARJETA 0876 Total Consumos de ...
const TARJETA = /\bTARJETA\s+(\d{4})\b/i;

/**
 * Galicia imprime seis fechas seguidas en el encabezado: cierre y vencimiento
 * del período anterior, del actual y del próximo. La cuarta es el vencimiento
 * de este resumen, que es el mes en el que realmente pagás.
 */
function vencimientoDelResumen(texto: string): string | null {
  for (const linea of texto.split(/\r?\n/)) {
    const fechas = [...linea.matchAll(FECHA_LARGA)];
    if (fechas.length !== 6) continue;

    const [, dia, mes, anio] = fechas[3];
    const m = MESES.indexOf(mes.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
    if (m < 0) continue;
    return `${2000 + Number(anio)}-${dosDigitos(m + 1)}-${dia}`;
  }
  return null;
}

export type ResumenLeido = {
  gastos: GastoDetectado[];
  /** Últimos 4 de la tarjeta según el propio resumen, si los declara. */
  ultimos4: string | null;
  /** Fecha de vencimiento: el mes al que hay que imputar estos consumos. */
  vencimiento: string | null;
};

export function analizarResumen(texto: string): ResumenLeido {
  return {
    gastos: parsearResumen(texto),
    ultimos4: texto.match(TARJETA)?.[1] ?? null,
    vencimiento: vencimientoDelResumen(texto),
  };
}
